import express from "express";
import { 
    signup, 
    login, 
    getCustomers, 
    updateCustomer, 
    deleteCustomer, 
    getCustomerById, 
    createCustomer,
    activateAccount,
    resendActivationLink
} from "../controller/customer.controller.js";

const router = express.Router();

// Authentication routes
router.post("/signup", signup);
router.post("/login", login);

// Email activation routes
router.get("/activate/:token", activateAccount);
router.post("/resend-activation", resendActivationLink);

// Customer management routes
router.get('/customer', getCustomers);
router.get('/customer/:id', getCustomerById);
router.put('/customer/:id', updateCustomer);
router.delete('/customer/:id', deleteCustomer);
router.post('/customer', createCustomer);

export default router;