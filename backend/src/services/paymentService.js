// =========================
// PAYMENT SERVICE MODULE
// =========================
// Handles payment processing with Stripe integration
// Supports credit cards, digital wallets, and local payment methods

const express = require('express');
const router = express.Router();

// Payment Gateway Configuration
const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY || 'sk_test_example_key';
const STRIPE_PUBLIC_KEY = process.env.STRIPE_PUBLIC_KEY || 'pk_test_example_key';

// Simulated Stripe initialization (in production, import actual stripe library)
// const stripe = require('stripe')(STRIPE_SECRET_KEY);

// Mock payment responses for development
const mockPaymentGateway = {
  processCard: async (amount, cardToken, currency = 'XAF') => {
    // In production, this would call Stripe API
    return {
      success: true,
      transactionId: `txn_${Date.now()}`,
      amount: amount,
      currency: currency,
      method: 'card',
      status: 'succeeded',
      timestamp: new Date()
    };
  },

  processMobileMoneyMTN: async (amount, phoneNumber) => {
    return {
      success: true,
      transactionId: `mtn_${Date.now()}`,
      amount: amount,
      currency: 'XAF',
      method: 'mtn_momo',
      phoneNumber: phoneNumber,
      status: 'pending',
      message: 'Enter PIN on your phone to confirm payment',
      timestamp: new Date()
    };
  },

  processMobileMoneyORANGE: async (amount, phoneNumber) => {
    return {
      success: true,
      transactionId: `orange_${Date.now()}`,
      amount: amount,
      currency: 'XAF',
      method: 'orange_money',
      phoneNumber: phoneNumber,
      status: 'pending',
      message: 'Enter PIN on your phone to confirm payment',
      timestamp: new Date()
    };
  },

  processPayPal: async (amount, paypalToken) => {
    return {
      success: true,
      transactionId: `paypal_${Date.now()}`,
      amount: amount,
      currency: 'XAF',
      method: 'paypal',
      status: 'succeeded',
      timestamp: new Date()
    };
  }
};

// =========================
// PAYMENT ENDPOINTS
// =========================

// Create Payment Intent (for Stripe)
router.post('/create-payment-intent', async (req, res) => {
  try {
    const { amount, currency, paymentMethod } = req.body;

    if (!amount || amount <= 0) {
      return res.status(400).json({ error: 'Invalid amount' });
    }

    // In production, use Stripe API
    const paymentIntent = {
      clientSecret: `pi_test_${Date.now()}`,
      amount: amount,
      currency: currency || 'xaf',
      status: 'requires_payment_method',
      paymentMethod: paymentMethod
    };

    res.json({
      success: true,
      clientSecret: paymentIntent.clientSecret,
      publishableKey: STRIPE_PUBLIC_KEY
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Process Card Payment
router.post('/process-card', async (req, res) => {
  try {
    const { amount, token, cardDetails } = req.body;

    const result = await mockPaymentGateway.processCard(amount, token);

    res.json({
      success: true,
      transaction: result,
      message: 'Payment processed successfully'
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Process MTN Mobile Money
router.post('/process-mtn', async (req, res) => {
  try {
    const { amount, phoneNumber } = req.body;

    if (!phoneNumber) {
      return res.status(400).json({ error: 'Phone number required' });
    }

    const result = await mockPaymentGateway.processMobileMoneyMTN(amount, phoneNumber);

    res.json({
      success: true,
      transaction: result,
      message: 'Payment request sent. Check your phone for PIN entry prompt.'
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Process Orange Money
router.post('/process-orange', async (req, res) => {
  try {
    const { amount, phoneNumber } = req.body;

    if (!phoneNumber) {
      return res.status(400).json({ error: 'Phone number required' });
    }

    const result = await mockPaymentGateway.processMobileMoneyORANGE(amount, phoneNumber);

    res.json({
      success: true,
      transaction: result,
      message: 'Payment request sent. Check your phone for PIN entry prompt.'
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Process PayPal Payment
router.post('/process-paypal', async (req, res) => {
  try {
    const { amount, paypalEmail } = req.body;

    const result = await mockPaymentGateway.processPayPal(amount, paypalEmail);

    res.json({
      success: true,
      transaction: result,
      message: 'PayPal payment processed successfully'
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Verify Payment Status
router.post('/verify-payment', async (req, res) => {
  try {
    const { transactionId } = req.body;

    // In production, query the payment gateway
    const status = {
      transactionId: transactionId,
      status: 'succeeded',
      verified: true,
      timestamp: new Date()
    };

    res.json(status);
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get Payment Methods Available
router.get('/payment-methods', (req, res) => {
  res.json({
    methods: [
      {
        id: 'card',
        name: 'Credit/Debit Card',
        icon: '💳',
        description: 'Visa, Mastercard, and other cards',
        available: true
      },
      {
        id: 'mtn',
        name: 'MTN Mobile Money',
        icon: '📱',
        description: 'Pay with your MTN account',
        available: true
      },
      {
        id: 'orange',
        name: 'Orange Money',
        icon: '📱',
        description: 'Pay with your Orange account',
        available: true
      },
      {
        id: 'paypal',
        name: 'PayPal',
        icon: '🅿️',
        description: 'Fast and secure PayPal checkout',
        available: true
      },
      {
        id: 'bank_transfer',
        name: 'Bank Transfer',
        icon: '🏦',
        description: 'Direct bank transfer',
        available: false
      }
    ]
  });
});

module.exports = router;
