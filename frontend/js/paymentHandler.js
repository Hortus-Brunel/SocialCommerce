// =========================
// PAYMENT HANDLER - FRONTEND
// =========================
// Handles all payment operations on the frontend
// Integrates with Stripe and local payment gateways

const API_BASE_URL = 'http://localhost:5000/api';

class PaymentHandler {
  constructor() {
    this.currentPaymentMethod = null;
    this.publishableKey = null;
    this.clientSecret = null;
  }

  // Initialize Stripe (when available)
  async initializeStripe() {
    if (typeof Stripe === 'undefined') {
      console.warn('Stripe not loaded. Payment functionality will be limited.');
      return false;
    }
    this.stripe = Stripe(this.publishableKey);
    return true;
  }

  // Create Payment Intent
  async createPaymentIntent(amount, currency = 'xaf', paymentMethod = 'card') {
    try {
      const response = await fetch(`${API_BASE_URL}/payments/create-payment-intent`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          amount: Math.round(amount),
          currency,
          paymentMethod
        })
      });

      const data = await response.json();
      
      if (data.success) {
        this.clientSecret = data.clientSecret;
        this.publishableKey = data.publishableKey;
      }
      
      return data;
    } catch (error) {
      console.error('Payment intent creation failed:', error);
      throw error;
    }
  }

  // Process Card Payment
  async processCardPayment(amount, cardDetails) {
    try {
      const response = await fetch(`${API_BASE_URL}/payments/process-card`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          amount: Math.round(amount),
          cardDetails: {
            number: cardDetails.cardNumber.replace(/\s/g, ''),
            exp_month: parseInt(cardDetails.expiryMonth),
            exp_year: parseInt(cardDetails.expiryYear),
            cvc: cardDetails.cvv
          }
        })
      });

      return await response.json();
    } catch (error) {
      console.error('Card payment failed:', error);
      throw error;
    }
  }

  // Process MTN Mobile Money
  async processMTNPayment(amount, phoneNumber) {
    try {
      const response = await fetch(`${API_BASE_URL}/payments/process-mtn`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          amount: Math.round(amount),
          phoneNumber: phoneNumber
        })
      });

      return await response.json();
    } catch (error) {
      console.error('MTN payment failed:', error);
      throw error;
    }
  }

  // Process Orange Money
  async processOrangePayment(amount, phoneNumber) {
    try {
      const response = await fetch(`${API_BASE_URL}/payments/process-orange`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          amount: Math.round(amount),
          phoneNumber: phoneNumber
        })
      });

      return await response.json();
    } catch (error) {
      console.error('Orange payment failed:', error);
      throw error;
    }
  }

  // Process PayPal Payment
  async processPayPalPayment(amount, paypalEmail) {
    try {
      const response = await fetch(`${API_BASE_URL}/payments/process-paypal`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          amount: Math.round(amount),
          paypalEmail: paypalEmail
        })
      });

      return await response.json();
    } catch (error) {
      console.error('PayPal payment failed:', error);
      throw error;
    }
  }

  // Verify Payment
  async verifyPayment(transactionId) {
    try {
      const response = await fetch(`${API_BASE_URL}/payments/verify-payment`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ transactionId })
      });

      return await response.json();
    } catch (error) {
      console.error('Payment verification failed:', error);
      throw error;
    }
  }

  // Get Available Payment Methods
  async getPaymentMethods() {
    try {
      const response = await fetch(`${API_BASE_URL}/payments/payment-methods`);
      return await response.json();
    } catch (error) {
      console.error('Failed to fetch payment methods:', error);
      return { methods: [] };
    }
  }

  // Format Currency
  formatCurrency(amount) {
    return new Intl.NumberFormat('fr-CM', {
      style: 'currency',
      currency: 'XAF',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  }

  // Validate Card Number (Luhn Algorithm)
  validateCardNumber(cardNumber) {
    const cleaned = cardNumber.replace(/\s/g, '');
    if (!/^\d{13,19}$/.test(cleaned)) return false;

    let sum = 0;
    for (let i = 0; i < cleaned.length; i++) {
      let digit = parseInt(cleaned[cleaned.length - 1 - i], 10);
      if (i % 2 === 1) {
        digit *= 2;
        if (digit > 9) digit -= 9;
      }
      sum += digit;
    }
    return sum % 10 === 0;
  }

  // Validate Phone Number
  validatePhoneNumber(phoneNumber) {
    // Cameroon phone format: +237XXXXXXXXX or 237XXXXXXXXX or 6XX/7XX/2XXXXXXX
    const cleaned = phoneNumber.replace(/\s|-/g, '');
    return /^(\+237|237|6|7|2)\d{8,9}$/.test(cleaned);
  }

  // Format Card Number
  formatCardNumber(value) {
    return value.replace(/\s/g, '').replace(/(\d{4})/g, '$1 ').trim();
  }

  // Format Expiry Date
  formatExpiryDate(value) {
    const cleaned = value.replace(/\D/g, '');
    if (cleaned.length >= 2) {
      return cleaned.slice(0, 2) + '/' + cleaned.slice(2, 4);
    }
    return cleaned;
  }
}

// Initialize global payment handler
const paymentHandler = new PaymentHandler();

// =========================
// UI HELPER FUNCTIONS
// =========================

function switchPaymentMethod(method) {
  // Hide all payment method forms
  document.querySelectorAll('.payment-method').forEach(el => {
    el.classList.remove('active');
  });

  // Remove active class from all tabs
  document.querySelectorAll('.payment-tab').forEach(el => {
    el.classList.remove('active');
  });

  // Show selected payment method
  const methodElement = document.getElementById(method + 'Payment');
  if (methodElement) {
    methodElement.classList.add('active');
  }

  // Activate tab
  const tabElement = document.querySelector(`[onclick="switchPayment('${method}')"]`);
  if (tabElement) {
    tabElement.classList.add('active');
  }

  paymentHandler.currentPaymentMethod = method;
}

function selectPaymentMethod(method) {
  const selectedDiv = document.getElementById('selectedMethod');
  if (selectedDiv) {
    selectedDiv.innerHTML = `<p><strong>${method} Payment Selected</strong></p>`;
  }
  switchPaymentMethod(method.toLowerCase());
}

// Format real-time input
document.addEventListener('DOMContentLoaded', () => {
  // Card number formatting
  const cardInputs = document.querySelectorAll('[placeholder*="Card Number"]');
  cardInputs.forEach(input => {
    input.addEventListener('input', (e) => {
      e.target.value = paymentHandler.formatCardNumber(e.target.value);
    });
  });

  // Expiry date formatting
  const expiryInputs = document.querySelectorAll('[placeholder*="MM/YY"]');
  expiryInputs.forEach(input => {
    input.addEventListener('input', (e) => {
      e.target.value = paymentHandler.formatExpiryDate(e.target.value);
    });
  });
});

// =========================
// CHECKOUT FUNCTIONS
// =========================

async function processCheckout() {
  try {
    // Get order total from cart
    const cart = JSON.parse(localStorage.getItem('cart')) || [];
    const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);

    if (total <= 0) {
      showError('Cart is empty');
      return false;
    }

    const paymentMethod = document.querySelector('input[name="paymentMethod"]:checked')?.value;
    
    if (!paymentMethod) {
      showError('Please select a payment method');
      return false;
    }

    // Show loading
    showLoading(true);

    let result;

    switch (paymentMethod.toUpperCase()) {
      case 'CARD':
        result = await processCardCheckout(total);
        break;
      case 'MTN':
        result = await processMobileMoneyCheckout(total, 'mtn');
        break;
      case 'ORANGE':
        result = await processMobileMoneyCheckout(total, 'orange');
        break;
      case 'PAYPAL':
        result = await processPayPalCheckout(total);
        break;
      default:
        showError('Payment method not supported');
        return false;
    }

    if (result.success) {
      // Save transaction
      const transaction = {
        id: result.transaction.transactionId,
        amount: total,
        method: paymentMethod,
        status: result.transaction.status,
        timestamp: new Date(),
        items: cart
      };

      localStorage.setItem('lastTransaction', JSON.stringify(transaction));

      showSuccess('Payment successful! Redirecting...');
      setTimeout(() => {
        window.location.href = 'order-details.html?id=' + transaction.id;
      }, 2000);

      return true;
    } else {
      showError(result.error || 'Payment failed');
      return false;
    }
  } catch (error) {
    showError(error.message);
    return false;
  } finally {
    showLoading(false);
  }
}

async function processCardCheckout(amount) {
  const cardNumber = document.querySelector('input[placeholder*="Card Number"]')?.value;
  const expiryMonth = document.querySelector('input[placeholder*="MM/YY"]')?.value?.split('/')[0];
  const expiryYear = document.querySelector('input[placeholder*="MM/YY"]')?.value?.split('/')[1];
  const cvv = document.querySelector('input[placeholder*="CVV"]')?.value;

  if (!cardNumber || !expiryMonth || !expiryYear || !cvv) {
    throw new Error('Please fill in all card details');
  }

  if (!paymentHandler.validateCardNumber(cardNumber)) {
    throw new Error('Invalid card number');
  }

  return await paymentHandler.processCardPayment(amount, {
    cardNumber,
    expiryMonth,
    expiryYear,
    cvv
  });
}

async function processMobileMoneyCheckout(amount, provider) {
  const phoneNumber = document.querySelector('input[placeholder*="Phone"]')?.value;

  if (!phoneNumber) {
    throw new Error('Please enter phone number');
  }

  if (!paymentHandler.validatePhoneNumber(phoneNumber)) {
    throw new Error('Invalid phone number format');
  }

  if (provider === 'mtn') {
    return await paymentHandler.processMTNPayment(amount, phoneNumber);
  } else {
    return await paymentHandler.processOrangePayment(amount, phoneNumber);
  }
}

async function processPayPalCheckout(amount) {
  const paypalEmail = document.querySelector('input[placeholder*="PayPal"]')?.value;

  if (!paypalEmail) {
    throw new Error('Please enter PayPal email');
  }

  return await paymentHandler.processPayPalPayment(amount, paypalEmail);
}

// =========================
// UI NOTIFICATION FUNCTIONS
// =========================

function showError(message) {
  const alertDiv = document.createElement('div');
  alertDiv.className = 'payment-alert error';
  alertDiv.innerHTML = `❌ ${message}`;
  alertDiv.style.cssText = `
    position: fixed;
    top: 80px;
    right: 20px;
    background: rgba(239, 68, 68, 0.2);
    color: #ef4444;
    padding: 15px 20px;
    border-radius: 10px;
    border: 1px solid rgba(239, 68, 68, 0.3);
    z-index: 2000;
    animation: slideInUp 0.3s ease;
  `;
  document.body.appendChild(alertDiv);
  setTimeout(() => alertDiv.remove(), 5000);
}

function showSuccess(message) {
  const alertDiv = document.createElement('div');
  alertDiv.className = 'payment-alert success';
  alertDiv.innerHTML = `✅ ${message}`;
  alertDiv.style.cssText = `
    position: fixed;
    top: 80px;
    right: 20px;
    background: rgba(34, 197, 94, 0.2);
    color: #22c55e;
    padding: 15px 20px;
    border-radius: 10px;
    border: 1px solid rgba(34, 197, 94, 0.3);
    z-index: 2000;
    animation: slideInUp 0.3s ease;
  `;
  document.body.appendChild(alertDiv);
  setTimeout(() => alertDiv.remove(), 5000);
}

function showLoading(show = true) {
  let loader = document.getElementById('paymentLoader');
  if (show && !loader) {
    loader = document.createElement('div');
    loader.id = 'paymentLoader';
    loader.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(0, 0, 0, 0.7);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 3000;
    `;
    loader.innerHTML = `
      <div style="text-align: center; color: white;">
        <div style="font-size: 48px; margin-bottom: 20px; animation: pulse 1s infinite;">⏳</div>
        <p>Processing payment...</p>
      </div>
    `;
    document.body.appendChild(loader);
  } else if (!show && loader) {
    loader.remove();
  }
}
