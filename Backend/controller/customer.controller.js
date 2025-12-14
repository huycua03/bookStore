import Customer from "../model/customer.model.js";
import bcryptjs from "bcryptjs";
import crypto from "crypto";
import { generateToken } from "../middleware/auth.js";
import { sendActivationEmail, sendWelcomeEmail } from "../services/emailService.js";

/**
 * Generate unique activation token
 */
const generateActivationToken = () => {
    return crypto.randomBytes(32).toString('hex');
};

/**
 * User Registration with Email Activation
 */
export const signup = async (req, res) => {
    try {
        const { fullname, phone, email, address, password } = req.body;

        if (!fullname || !phone || !email || !address || !password) {
            return res.status(400).json({ message: "All fields are required" });
        }

        const existingCustomer = await Customer.findOne({ email });
        if (existingCustomer) {
            return res.status(400).json({ message: "Email already exists" });
        }

        const hashedPassword = await bcryptjs.hash(password, 10);
        const activationToken = generateActivationToken();
        const activationTokenExpires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

        const newCustomer = new Customer({
            fullname,
            email,
            address,
            phone,
            password: hashedPassword,
            isVerified: false,
            activationToken,
            activationTokenExpires
        });

        await newCustomer.save();

        // Send activation email
        try {
            await sendActivationEmail(email, activationToken, fullname);
            console.log(`✅ Activation email sent to: ${email}`);
        } catch (emailError) {
            console.error('❌ Error sending activation email:', emailError);
        }

        res.status(201).json({
            message: "Registration successful! Please check your email to activate your account.",
            requiresActivation: true,
            email: email
        });
    } catch (error) {
        console.log("Error: " + error.message);
        res.status(500).json({ message: "Internal server error" });
    }
};

/**
 * Login with verification check
 */
export const login = async (req, res) => {
    try {
        const { email, password } = req.body;
        const customer = await Customer.findOne({ email });

        if (!customer) {
            return res.status(400).json({ message: "Customer not found" });
        }

        const isMatch = await bcryptjs.compare(password, customer.password);
        if (!isMatch) {
            return res.status(400).json({ message: "Invalid password" });
        }

        // Check if account is verified (skip for admin accounts)
        if (!customer.isVerified && !customer.isAdmin) {
            return res.status(403).json({ 
                message: "Please activate your account. Check your email for activation link.",
                requiresActivation: true,
                email: customer.email
            });
        }

        // Auto-verify admin accounts if not already verified
        if (customer.isAdmin && !customer.isVerified) {
            customer.isVerified = true;
            await customer.save();
            console.log('Admin account auto-verified:', customer.email);
        }

        const token = generateToken(customer);

        res.status(200).json({
            message: "Login successful",
            token,
            customer: {
                _id: customer._id,
                fullname: customer.fullname,
                email: customer.email,
                isAdmin: customer.isAdmin,
                isVerified: customer.isVerified
            },
        });
    } catch (error) {
        console.log("Login Error:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};

/**
 * Activate Account via Email Link
 */
export const activateAccount = async (req, res) => {
    try {
        const { token } = req.params;

        if (!token) {
            return res.status(400).json({ message: "Activation token is required" });
        }

        const customer = await Customer.findOne({ activationToken: token });
        
        if (!customer) {
            return res.status(404).json({ message: "Invalid activation link" });
        }

        if (customer.isVerified) {
            const authToken = generateToken(customer);
            return res.status(200).json({ 
                message: "Account already activated",
                alreadyActivated: true,
                token: authToken,
                customer: {
                    _id: customer._id,
                    fullname: customer.fullname,
                    email: customer.email,
                    isAdmin: customer.isAdmin,
                    isVerified: true
                }
            });
        }

        if (new Date() > customer.activationTokenExpires) {
            return res.status(400).json({ 
                message: "Activation link has expired. Please request a new one." 
            });
        }

        customer.isVerified = true;
        customer.activationToken = undefined;
        customer.activationTokenExpires = undefined;
        await customer.save();

        // Send welcome email
        try {
            await sendWelcomeEmail(customer.email, customer.fullname);
            console.log(`✅ Welcome email sent to: ${customer.email}`);
        } catch (emailError) {
            console.error('❌ Error sending welcome email:', emailError);
        }

        const authToken = generateToken(customer);

        res.status(200).json({
            message: "Account activated successfully! Welcome to BookStore!",
            token: authToken,
            customer: {
                _id: customer._id,
                fullname: customer.fullname,
                email: customer.email,
                address: customer.address,
                phone: customer.phone,
                isAdmin: customer.isAdmin,
                isVerified: customer.isVerified
            }
        });
    } catch (error) {
        console.error("Activation error:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};

/**
 * Resend Activation Link
 */
export const resendActivationLink = async (req, res) => {
    try {
        const { email } = req.body;

        if (!email) {
            return res.status(400).json({ message: "Email is required" });
        }

        const customer = await Customer.findOne({ email });
        
        if (!customer) {
            return res.status(404).json({ message: "Customer not found" });
        }

        if (customer.isVerified) {
            return res.status(400).json({ message: "Account already activated" });
        }

        const activationToken = generateActivationToken();
        const activationTokenExpires = new Date(Date.now() + 24 * 60 * 60 * 1000);

        customer.activationToken = activationToken;
        customer.activationTokenExpires = activationTokenExpires;
        await customer.save();

        try {
            await sendActivationEmail(email, activationToken, customer.fullname);
            console.log(`✅ New activation link sent to: ${email}`);
        } catch (emailError) {
            console.error('❌ Error sending activation email:', emailError);
            return res.status(500).json({ message: "Failed to send activation email" });
        }

        res.status(200).json({
            message: "Activation link resent successfully. Please check your email."
        });
    } catch (error) {
        console.error("Resend activation link error:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};

// Lấy danh sách tất cả khách hàng
export const getCustomers = async (req, res) => {
    try {
        const customers = await Customer.find().select('-password');
        console.log("Customers found:", customers);
        res.status(200).json(customers);
    } catch (error) {
        console.error("Error getting customers:", error);
        res.status(500).json({ message: error.message });
    }
};

// Cập nhật khách hàng
export const updateCustomer = async (req, res) => {
    try {
        const customer = await Customer.findByIdAndUpdate(req.params.id, req.body, { new: true });
        res.status(200).json(customer);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Xóa khách hàng
export const deleteCustomer = async (req, res) => {
    try {
        await Customer.findByIdAndDelete(req.params.id);
        res.status(200).json({ message: "Customer deleted" });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Thêm endpoint để lấy chi tiết customer
export const getCustomerById = async (req, res) => {
    try {
        const customer = await Customer.findById(req.params.id);
        if (!customer) {
            return res.status(404).json({ message: "Customer not found" });
        }
        // Không trả về password
        const { password, ...customerData } = customer._doc;
        res.status(200).json(customerData);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Thêm customer bởi admin
export const createCustomer = async (req, res) => {
    try {
        const { fullname, phone, email, address, password } = req.body;

        // Kiểm tra email tồn tại
        const existingCustomer = await Customer.findOne({ email });
        if (existingCustomer) {
            return res.status(400).json({ message: "Email already exists" });
        }

        // Mã hóa mật khẩu
        const hashedPassword = await bcryptjs.hash(password, 10);

        // Tạo customer mới (admin-created accounts are auto-verified)
        const customer = new Customer({
            fullname,
            email,
            phone,
            address,
            password: hashedPassword,
            isVerified: true
        });

        await customer.save();
        
        // Trả về thông tin không bao gồm password
        const { password: _, ...customerData } = customer._doc;
        res.status(201).json(customerData);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};