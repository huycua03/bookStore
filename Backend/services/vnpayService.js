import crypto from 'crypto';
import querystring from 'querystring';

/**
 * VnPay Payment Service
 * Configuration for VnPay sandbox environment
 * 
 * NOTE: Card information entry happens on VnPay's payment gateway, not on our website.
 * When a user selects VnPay payment, they are redirected to VnPay's secure payment page
 * where they enter their card/bank details. After payment, VnPay redirects back to our callback URL.
 * 
 * Reference: https://sandbox.vnpayment.vn/apis/docs/thanh-toan-pay/pay.html
 */
const VNPAY_CONFIG = {
    vnp_TmnCode: '9IPXZW72',
    vnp_HashSecret: 'YD0V1UVJOTZ7Z4TPGLYP1SDXEUQO579H',
    vnp_Url: 'https://sandbox.vnpayment.vn/paymentv2/vpcpay.html',
    vnp_ReturnUrl: process.env.VNPAY_RETURN_URL || 'http://localhost:4001/api/payment/vnpay/callback',
    vnp_Api: 'https://sandbox.vnpayment.vn/merchant_webapi/api/transaction'
};

/**
 * Sort object by key
 */
const sortObject = (obj) => {
    const sorted = {};
    const keys = Object.keys(obj).sort();
    keys.forEach(key => {
        sorted[key] = obj[key];
    });
    return sorted;
};

/**
 * Create payment URL for VnPay
 * @param {Object} params - Payment parameters
 * @param {Number} params.amount - Amount in VND
 * @param {String} params.orderId - Order ID
 * @param {String} params.orderInfo - Order description
 * @param {String} params.orderType - Order type
 * @param {String} params.locale - Locale (vn/en)
 * @param {String} params.ipAddr - Client IP address
 * @returns {String} Payment URL
 */
/**
 * Format date to VnPay format (yyyyMMddHHmmss) in GMT+7 timezone
 */
const formatDate = (date) => {
    // Get date in Vietnam timezone (GMT+7)
    const vietnamDate = new Date(date.getTime() + (7 * 60 * 60 * 1000));
    const year = vietnamDate.getUTCFullYear();
    const month = String(vietnamDate.getUTCMonth() + 1).padStart(2, '0');
    const day = String(vietnamDate.getUTCDate()).padStart(2, '0');
    const hours = String(vietnamDate.getUTCHours()).padStart(2, '0');
    const minutes = String(vietnamDate.getUTCMinutes()).padStart(2, '0');
    const seconds = String(vietnamDate.getUTCSeconds()).padStart(2, '0');
    return `${year}${month}${day}${hours}${minutes}${seconds}`;
};

export const createPaymentUrl = (params) => {
    const {
        amount,
        orderId,
        orderInfo = 'Thanh toan don hang',
        orderType = 'other',
        locale = 'vn',
        ipAddr = '127.0.0.1',
        bankCode = null
    } = params;

    const date = new Date();
    const createDate = formatDate(date);

    // Build vnp_Params object (must be in specific order for sorting)
    const vnp_Params = {
        vnp_Version: '2.1.0',
        vnp_Command: 'pay',
        vnp_TmnCode: VNPAY_CONFIG.vnp_TmnCode,
        vnp_Locale: locale,
        vnp_CurrCode: 'VND',
        vnp_TxnRef: String(orderId), // Ensure it's a string
        vnp_OrderInfo: orderInfo,
        vnp_OrderType: orderType,
        vnp_Amount: Math.round(amount * 100), // Convert to smallest unit (cents), ensure integer
        vnp_ReturnUrl: VNPAY_CONFIG.vnp_ReturnUrl,
        vnp_IpAddr: ipAddr,
        vnp_CreateDate: createDate
    };

    // Add bankCode if provided (optional)
    if (bankCode && bankCode !== '') {
        vnp_Params.vnp_BankCode = bankCode;
    }

    // Sort params by key (required by VnPay)
    const sortedParams = sortObject(vnp_Params);
    
    // Create query string for signing (without encoding)
    const signData = querystring.stringify(sortedParams, { encode: false });
    
    // Create secure hash using SHA512
    const hmac = crypto.createHmac('sha512', VNPAY_CONFIG.vnp_HashSecret);
    const signed = hmac.update(Buffer.from(signData, 'utf-8')).digest('hex');
    
    // Add signature to params
    vnp_Params.vnp_SecureHash = signed;
    
    // Build final URL with all params (including signature)
    const paymentUrl = VNPAY_CONFIG.vnp_Url + '?' + querystring.stringify(vnp_Params, { encode: false });
    
    return paymentUrl;
};

/**
 * Verify payment callback from VnPay
 * @param {Object} vnp_Params - Parameters from VnPay callback
 * @returns {Object} Verification result
 */
export const verifyPaymentCallback = (vnp_Params) => {
    const secureHash = vnp_Params.vnp_SecureHash;
    delete vnp_Params.vnp_SecureHash;
    delete vnp_Params.vnp_SecureHashType;

    // Sort params
    const sortedParams = sortObject(vnp_Params);
    
    // Create query string
    const signData = querystring.stringify(sortedParams, { encode: false });
    
    // Create secure hash
    const hmac = crypto.createHmac('sha512', VNPAY_CONFIG.vnp_HashSecret);
    const signed = hmac.update(Buffer.from(signData, 'utf-8')).digest('hex');

    // Verify signature
    if (secureHash === signed) {
        const responseCode = vnp_Params.vnp_ResponseCode;
        const transactionStatus = vnp_Params.vnp_TransactionStatus;
        
        // According to VnPay docs:
        // - vnp_ResponseCode = '00' means transaction successful
        // - vnp_TransactionStatus = '00' means transaction successful (if present)
        // For ReturnURL, we primarily check vnp_ResponseCode
        const isSuccess = responseCode === '00' && (!transactionStatus || transactionStatus === '00');
        
        return {
            isValid: true,
            isSuccess: isSuccess,
            orderId: vnp_Params.vnp_TxnRef,
            amount: parseInt(vnp_Params.vnp_Amount) / 100, // Convert back from cents
            transactionNo: vnp_Params.vnp_TransactionNo,
            bankCode: vnp_Params.vnp_BankCode,
            payDate: vnp_Params.vnp_PayDate,
            responseCode: responseCode,
            transactionStatus: transactionStatus,
            message: isSuccess ? 'Giao dịch thành công' : `Giao dịch thất bại (Mã lỗi: ${responseCode})`
        };
    } else {
        return {
            isValid: false,
            isSuccess: false,
            message: 'Chữ ký không hợp lệ'
        };
    }
};

/**
 * Query transaction status from VnPay
 * @param {String} orderId - Order ID
 * @param {String} transactionDate - Transaction date (YYYYMMDDHHmmss)
 * @returns {Promise<Object>} Transaction status
 */
export const queryTransaction = async (orderId, transactionDate) => {
    const vnp_Params = {
        vnp_Version: '2.1.0',
        vnp_Command: 'querydr',
        vnp_TmnCode: VNPAY_CONFIG.vnp_TmnCode,
        vnp_TxnRef: orderId,
        vnp_OrderInfo: 'Truy van giao dich',
        vnp_TransactionDate: transactionDate,
        vnp_CreateDate: new Date().toISOString().replace(/[-:]/g, '').split('.')[0] + '00',
        vnp_IpAddr: '127.0.0.1'
    };

    const sortedParams = sortObject(vnp_Params);
    const signData = querystring.stringify(sortedParams, { encode: false });
    const hmac = crypto.createHmac('sha512', VNPAY_CONFIG.vnp_HashSecret);
    const signed = hmac.update(signData, 'utf-8').digest('hex');
    
    vnp_Params.vnp_SecureHash = signed;

    try {
        const response = await fetch(VNPAY_CONFIG.vnp_Api, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            body: querystring.stringify(vnp_Params)
        });
        
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Error querying transaction:', error);
        throw error;
    }
};

export default {
    createPaymentUrl,
    verifyPaymentCallback,
    queryTransaction,
    VNPAY_CONFIG
};

