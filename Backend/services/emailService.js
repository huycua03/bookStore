import nodemailer from 'nodemailer';

/**
 * Mailtrap SMTP Transport Configuration
 */
const transport = nodemailer.createTransport({
    host: "sandbox.smtp.mailtrap.io",
    port: 2525,
    auth: {
        user: "0bdf868008207f",
        pass: "c88791f9665222"
    }
});

/**
 * Verify SMTP connection
 */
transport.verify((error, success) => {
    if (error) {
        console.error('❌ SMTP connection error:', error);
    } else {
        console.log('✅ SMTP server is ready to send emails');
    }
});

/**
 * Send Email Function
 * @param {string} to - Recipient email
 * @param {string} subject - Email subject
 * @param {string} html - HTML content
 */
export const sendMail = async (to, subject, html) => {
    try {
        const mailOptions = {
            from: '"BookStore" <noreply@bookstore.com>',
            to,
            subject,
            html
        };

        const info = await transport.sendMail(mailOptions);
        
        console.log('✅ Email sent:', {
            messageId: info.messageId,
            to: to,
            subject: subject
        });

        return {
            success: true,
            messageId: info.messageId,
            message: 'Email sent successfully'
        };
    } catch (error) {
        console.error('❌ Error sending email:', error);
        throw new Error(`Failed to send email: ${error.message}`);
    }
};

/**
 * Send Activation Link Email
 */
export const sendActivationEmail = async (email, activationToken, fullname = 'User') => {
    const subject = '🎉 Activate Your BookStore Account';
    const activationUrl = `http://localhost:5173/activate/${activationToken}`;
    
    const html = `
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="UTF-8">
            <style>
                body { font-family: Arial, sans-serif; background: #f5f5f5; padding: 20px; }
                .container { max-width: 600px; margin: 0 auto; background: #fff; border-radius: 15px; overflow: hidden; box-shadow: 0 5px 20px rgba(0,0,0,0.1); }
                .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px; text-align: center; color: white; }
                .header h1 { margin: 0; font-size: 32px; }
                .content { padding: 40px 30px; }
                .button { display: inline-block; padding: 15px 40px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; text-decoration: none; border-radius: 50px; font-weight: bold; margin: 20px 0; }
                .footer { background: #f8f9fa; padding: 20px; text-align: center; color: #666; font-size: 12px; }
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <div style="font-size: 60px; margin-bottom: 20px;">🎉</div>
                    <h1>Welcome to BookStore!</h1>
                </div>
                <div class="content">
                    <h2>Xin chào ${fullname}!</h2>
                    <p>Cảm ơn bạn đã đăng ký tài khoản tại BookStore. Để hoàn tất đăng ký, vui lòng kích hoạt tài khoản bằng cách nhấp vào nút bên dưới:</p>
                    <div style="text-align: center;">
                        <a href="${activationUrl}" class="button">✨ Kích hoạt tài khoản</a>
                    </div>
                    <p style="margin-top: 30px; color: #999; font-size: 14px;">Link này sẽ hết hạn sau 24 giờ.</p>
                    <p style="margin-top: 20px; font-size: 14px;">Nếu nút không hoạt động, copy link sau:</p>
                    <p style="background: #f0f0f0; padding: 10px; border-radius: 5px; word-break: break-all;">${activationUrl}</p>
                </div>
                <div class="footer">
                    <p>BookStore Team | © 2024 All rights reserved</p>
                </div>
            </div>
        </body>
        </html>
    `;

    return await sendMail(email, subject, html);
};

/**
 * Send Welcome Email
 */
export const sendWelcomeEmail = async (email, fullname) => {
    const subject = '🎊 Welcome to BookStore!';
    
    const html = `
        <!DOCTYPE html>
        <html>
        <head>
            <style>
                body { font-family: Arial, sans-serif; background: #f5f5f5; padding: 20px; }
                .container { max-width: 600px; margin: 0 auto; background: #fff; border-radius: 15px; overflow: hidden; }
                .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px; text-align: center; color: white; }
                .content { padding: 40px; }
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <h1>🎉 Chào mừng!</h1>
                </div>
                <div class="content">
                    <h2>Xin chào ${fullname}!</h2>
                    <p>Tài khoản của bạn đã được kích hoạt thành công. Chào mừng bạn đến với BookStore!</p>
                    <p>Giờ đây bạn có thể khám phá hàng ngàn đầu sách tuyệt vời.</p>
                </div>
            </div>
        </body>
        </html>
    `;

    return await sendMail(email, subject, html);
};

/**
 * Send Order Status Update Email
 */
export const sendOrderStatusEmail = async (email, fullname, orderId, status, orderDate) => {
    const statusMessages = {
        'Pending': { emoji: '⏳', text: 'Đang chờ xử lý', color: '#fbbf24' },
        'Paid': { emoji: '✅', text: 'Đã thanh toán', color: '#10b981' },
        'Processing': { emoji: '🔄', text: 'Đang xử lý', color: '#3b82f6' },
        'Shipped': { emoji: '🚚', text: 'Đã giao hàng', color: '#8b5cf6' },
        'Delivered': { emoji: '📦', text: 'Đã nhận hàng', color: '#10b981' },
        'Cancelled': { emoji: '❌', text: 'Đã hủy', color: '#ef4444' }
    };

    const statusInfo = statusMessages[status] || { emoji: '📋', text: status, color: '#6b7280' };
    const formattedDate = new Date(orderDate).toLocaleDateString('vi-VN', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });

    const subject = `${statusInfo.emoji} Cập nhật trạng thái đơn hàng #${orderId.substring(0, 8)}`;
    
    const html = `
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="UTF-8">
            <style>
                body { font-family: Arial, sans-serif; background: #f5f5f5; padding: 20px; }
                .container { max-width: 600px; margin: 0 auto; background: #fff; border-radius: 15px; overflow: hidden; box-shadow: 0 5px 20px rgba(0,0,0,0.1); }
                .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px; text-align: center; color: white; }
                .header h1 { margin: 0; font-size: 28px; }
                .content { padding: 40px 30px; }
                .status-box { background: ${statusInfo.color}15; border-left: 4px solid ${statusInfo.color}; padding: 20px; border-radius: 8px; margin: 20px 0; }
                .status-box h3 { margin: 0 0 10px 0; color: ${statusInfo.color}; font-size: 20px; }
                .order-info { background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0; }
                .order-info p { margin: 8px 0; }
                .footer { background: #f8f9fa; padding: 20px; text-align: center; color: #666; font-size: 12px; }
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <div style="font-size: 50px; margin-bottom: 10px;">${statusInfo.emoji}</div>
                    <h1>Cập nhật đơn hàng</h1>
                </div>
                <div class="content">
                    <h2>Xin chào ${fullname}!</h2>
                    <p>Đơn hàng của bạn đã được cập nhật trạng thái:</p>
                    
                    <div class="status-box">
                        <h3>${statusInfo.emoji} ${statusInfo.text}</h3>
                    </div>

                    <div class="order-info">
                        <p><strong>Mã đơn hàng:</strong> #${orderId.substring(0, 8)}</p>
                        <p><strong>Ngày đặt hàng:</strong> ${formattedDate}</p>
                        <p><strong>Trạng thái mới:</strong> ${statusInfo.text}</p>
                    </div>

                    <p style="margin-top: 30px;">Bạn có thể theo dõi đơn hàng của mình tại trang <a href="http://localhost:5173/order-history" style="color: #667eea; text-decoration: none; font-weight: bold;">Lịch sử đơn hàng</a>.</p>
                    
                    <p style="margin-top: 20px; color: #999; font-size: 14px;">Nếu bạn có bất kỳ câu hỏi nào, vui lòng liên hệ với chúng tôi.</p>
                </div>
                <div class="footer">
                    <p>BookStore Team | © 2024 All rights reserved</p>
                </div>
            </div>
        </body>
        </html>
    `;

    return await sendMail(email, subject, html);
};

export default {
    sendMail,
    sendActivationEmail,
    sendWelcomeEmail,
    sendOrderStatusEmail
};

