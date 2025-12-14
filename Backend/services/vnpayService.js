import crypto from 'crypto';
import qs from 'qs';
import moment from 'moment';

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
    vnp_TmnCode: 'IYLWW5DA',
    vnp_HashSecret: '3ZJ4J2JCD1DHKDTZ83RD1DVFFURQSA4B',
    vnp_Url: 'https://sandbox.vnpayment.vn/paymentv2/vpcpay.html',
    vnp_ReturnUrl: process.env.VNPAY_RETURN_URL || 'http://localhost:4001/api/payment/vnpay/callback',
    vnp_IpnUrl: process.env.VNPAY_IPN_URL || 'http://localhost:4001/api/payment/vnpay/ipn',
    vnp_Api: 'https://sandbox.vnpayment.vn/merchant_webapi/api/transaction'
};

/**
 * Sort object by key (exactly as VNPAY demo code)
 * This function encodes keys and values, and replaces %20 with + in values
 */
const sortObject = (obj) => {
    const sorted = {};
    const str = [];
    let key;
    for (key in obj) {
        if (obj.hasOwnProperty(key)) {
            str.push(encodeURIComponent(key));
        }
    }
    str.sort();
    for (key = 0; key < str.length; key++) {
        // Decode the encoded key to get the original key from obj
        const originalKey = decodeURIComponent(str[key]);
        sorted[str[key]] = encodeURIComponent(obj[originalKey]).replace(/%20/g, "+");
    }
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
 * Format date to VnPay format (yyyyMMddHHmmss) in Vietnam timezone
 * Using moment.js as in VNPAY demo code
 */
const formatDate = (date) => {
    // Set timezone to Vietnam (Asia/Ho_Chi_Minh)
    process.env.TZ = 'Asia/Ho_Chi_Minh';
    return moment(date).format('YYYYMMDDHHmmss');
};

export const createPaymentUrl = (params) => {
    // Set timezone to Vietnam (Asia/Ho_Chi_Minh) - as in VNPAY demo
    process.env.TZ = 'Asia/Ho_Chi_Minh';
    
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

    // Build vnp_Params object (exactly as VNPAY demo code)
    let vnp_Params = {};
    vnp_Params['vnp_Version'] = '2.1.0';
    vnp_Params['vnp_Command'] = 'pay';
    vnp_Params['vnp_TmnCode'] = VNPAY_CONFIG.vnp_TmnCode;
    vnp_Params['vnp_Locale'] = locale;
    vnp_Params['vnp_CurrCode'] = 'VND';
    vnp_Params['vnp_TxnRef'] = String(orderId); // Ensure it's a string
    vnp_Params['vnp_OrderInfo'] = orderInfo;
    vnp_Params['vnp_OrderType'] = orderType;
    vnp_Params['vnp_Amount'] = Math.round(amount * 100); // Convert to smallest unit (cents), ensure integer
    vnp_Params['vnp_ReturnUrl'] = VNPAY_CONFIG.vnp_ReturnUrl;
    // Note: vnp_IpnUrl should be configured in VNPAY dashboard, not in payment URL
    // IPN URL is configured at: https://sandbox.vnpayment.vn/vnpaygw-sit-testing/
    vnp_Params['vnp_IpAddr'] = ipAddr;
    vnp_Params['vnp_CreateDate'] = createDate;

    // Add bankCode if provided (optional)
    if (bankCode !== null && bankCode !== '') {
        vnp_Params['vnp_BankCode'] = bankCode;
    }

    // Sort params by key (required by VnPay) - using VNPAY demo sortObject
    // Note: sortObject encodes keys and values, so vnp_Params will have encoded keys after this
    vnp_Params = sortObject(vnp_Params);
    
    // Create query string for signing (without encoding) - using qs as in VNPAY demo
    const signData = qs.stringify(vnp_Params, { encode: false });
    
    // Create secure hash using SHA512 - using Buffer as in VNPAY demo
    const hmac = crypto.createHmac('sha512', VNPAY_CONFIG.vnp_HashSecret);
    const signed = hmac.update(Buffer.from(signData, 'utf-8')).digest('hex');
    
    // Add signature to params (keys are already encoded from sortObject)
    vnp_Params['vnp_SecureHash'] = signed;
    
    // Build final URL with all params (including signature) - using qs as in VNPAY demo
    const paymentUrl = VNPAY_CONFIG.vnp_Url + '?' + qs.stringify(vnp_Params, { encode: false });
    
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

    // Sort params - using VNPAY demo sortObject
    const sortedParams = sortObject(vnp_Params);
    
    // Create query string - using qs as in VNPAY demo
    const signData = qs.stringify(sortedParams, { encode: false });
    
    // Create secure hash - using Buffer as in VNPAY demo
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
    const signData = qs.stringify(sortedParams, { encode: false });
    const hmac = crypto.createHmac('sha512', VNPAY_CONFIG.vnp_HashSecret);
    const signed = hmac.update(Buffer.from(signData, 'utf-8')).digest('hex');
    
    vnp_Params.vnp_SecureHash = signed;

    try {
        const response = await fetch(VNPAY_CONFIG.vnp_Api, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            body: qs.stringify(vnp_Params)
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

