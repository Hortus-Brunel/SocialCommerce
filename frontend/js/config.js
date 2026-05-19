// ====================================
// CONFIGURATION & ADMIN SETUP
// ====================================

const ADMIN_CONFIG = {
  name: "ASSONKENG NUIMDO ORTUS BRUNEL",
  email: "oassonkeng@gmail.com",
  password: "ANOB@2008", // In production, use hashed passwords
  role: "admin"
};

const APP_CONFIG = {
  currency: "FCFA",
  currencySymbol: "Fr",
  supportedPaymentMethods: ["MTN", "ORANGE"],
  businessVerificationRequired: true,
  productIdentityRequired: true
};

// ====================================
// CURRENCY UTILITIES
// ====================================

function formatCurrency(amount) {
  return new Intl.NumberFormat('fr-CM', {
    style: 'currency',
    currency: 'XAF',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(amount);
}

function displayPrice(amount) {
  return `${formatCurrency(amount)} ${APP_CONFIG.currencySymbol}`;
}

// ====================================
// AUTHENTICATION & ADMIN FUNCTIONS
// ====================================

function initializeAdmin() {
  const adminUser = JSON.parse(localStorage.getItem("adminUser"));
  if (!adminUser) {
    localStorage.setItem("adminUser", JSON.stringify(ADMIN_CONFIG));
    console.log("Admin account initialized");
  }
}

function loginAsAdmin(email, password) {
  if (email === ADMIN_CONFIG.email && password === ADMIN_CONFIG.password) {
    const adminUser = {
      ...ADMIN_CONFIG,
      token: generateToken(),
      loginTime: new Date().toISOString()
    };
    localStorage.setItem("adminUser", JSON.stringify(adminUser));
    localStorage.setItem("token", adminUser.token);
    localStorage.setItem("user", JSON.stringify({
      role: "admin",
      name: ADMIN_CONFIG.name,
      email: ADMIN_CONFIG.email
    }));
    return { success: true, user: adminUser };
  }
  return { success: false, message: "Invalid admin credentials" };
}

// ====================================
// PRODUCT MANAGEMENT (with identity verification)
// ====================================

class ProductManager {
  constructor() {
    this.products = JSON.parse(localStorage.getItem("products")) || [];
    this.productIdCounter = parseInt(localStorage.getItem("productIdCounter")) || 1000;
  }

  validateProductData(data) {
    const errors = [];
    if (!data.name || data.name.trim().length < 3) errors.push("Product name must be at least 3 characters");
    if (!data.category || data.category.trim().length === 0) errors.push("Category is required");
    if (!data.price || data.price <= 0) errors.push("Price must be greater than 0");
    if (!data.description || data.description.trim().length < 10) errors.push("Description must be at least 10 characters");
    if (!data.stock || data.stock < 0) errors.push("Stock must be non-negative");
    if (!data.businessIdentityId) errors.push("Business identity verification is required");
    if (!data.identityDocument) errors.push("Identity document must be attached");
    return errors;
  }

  createProduct(data, identityDocument) {
    const errors = this.validateProductData(data);
    if (errors.length > 0) {
      return { success: false, errors };
    }

    const product = {
      id: this.productIdCounter++,
      ...data,
      identityDocument: identityDocument,
      createdAt: new Date().toISOString(),
      status: "active",
      reviews: []
    };

    this.products.push(product);
    this.save();
    return { success: true, product };
  }

  updateProduct(id, data) {
    const index = this.products.findIndex(p => p.id === id);
    if (index === -1) return { success: false, message: "Product not found" };

    const errors = this.validateProductData(data);
    if (errors.length > 0) return { success: false, errors };

    this.products[index] = { ...this.products[index], ...data, updatedAt: new Date().toISOString() };
    this.save();
    return { success: true, product: this.products[index] };
  }

  getProduct(id) {
    return this.products.find(p => p.id === id);
  }

  getAllProducts() {
    return this.products;
  }

  save() {
    localStorage.setItem("products", JSON.stringify(this.products));
    localStorage.setItem("productIdCounter", this.productIdCounter);
  }
}

// ====================================
// BUSINESS IDENTITY VERIFICATION
// ====================================

class BusinessIdentity {
  constructor() {
    this.identities = JSON.parse(localStorage.getItem("businessIdentities")) || [];
  }

  createIdentity(businessData, documents) {
    const identity = {
      id: generateUniqueId("BUID"),
      businessName: businessData.businessName,
      registrationNumber: businessData.registrationNumber,
      ownerName: businessData.ownerName,
      email: businessData.email,
      phone: businessData.phone,
      address: businessData.address,
      documents: documents, // Array of base64 encoded documents
      verificationStatus: "pending",
      verifiedAt: null,
      createdAt: new Date().toISOString()
    };

    this.identities.push(identity);
    this.save();
    return identity;
  }

  verifyIdentity(identityId, approvedByAdmin = true) {
    const identity = this.identities.find(i => i.id === identityId);
    if (!identity) return { success: false, message: "Identity not found" };

    identity.verificationStatus = approvedByAdmin ? "verified" : "rejected";
    identity.verifiedAt = new Date().toISOString();
    this.save();
    return { success: true, identity };
  }

  getIdentity(id) {
    return this.identities.find(i => i.id === id);
  }

  save() {
    localStorage.setItem("businessIdentities", JSON.stringify(this.identities));
  }
}

// ====================================
// REVIEW & RATING SYSTEM
// ====================================

class ReviewManager {
  constructor() {
    this.reviews = JSON.parse(localStorage.getItem("reviews")) || [];
  }

  addReview(productId, userId, rating, text) {
    if (rating < 1 || rating > 5) return { success: false, message: "Rating must be 1-5" };
    if (text.trim().length < 10) return { success: false, message: "Review must be at least 10 characters" };

    const review = {
      id: generateUniqueId("REV"),
      productId,
      userId,
      rating,
      text,
      createdAt: new Date().toISOString()
    };

    this.reviews.push(review);
    this.save();
    return { success: true, review };
  }

  getProductReviews(productId) {
    return this.reviews.filter(r => r.productId === productId);
  }

  getAverageRating(productId) {
    const reviews = this.getProductReviews(productId);
    if (reviews.length === 0) return 0;
    const sum = reviews.reduce((acc, r) => acc + r.rating, 0);
    return (sum / reviews.length).toFixed(1);
  }

  save() {
    localStorage.setItem("reviews", JSON.stringify(this.reviews));
  }
}

// ====================================
// ORDER MANAGEMENT
// ====================================

class OrderManager {
  constructor() {
    this.orders = JSON.parse(localStorage.getItem("orders")) || [];
    this.orderCounter = parseInt(localStorage.getItem("orderCounter")) || 1;
  }

  createOrder(items, shippingAddress, billingAddress, paymentMethod) {
    const order = {
      id: `ORD-${String(this.orderCounter).padStart(6, '0')}`,
      items,
      shippingAddress,
      billingAddress,
      paymentMethod,
      total: items.reduce((sum, item) => sum + (item.price * item.quantity), 0),
      status: "pending_payment",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    this.orders.push(order);
    this.orderCounter++;
    this.save();
    return order;
  }

  updateOrderStatus(orderId, status) {
    const order = this.orders.find(o => o.id === orderId);
    if (!order) return { success: false, message: "Order not found" };

    order.status = status;
    order.updatedAt = new Date().toISOString();
    this.save();
    return { success: true, order };
  }

  getOrder(orderId) {
    return this.orders.find(o => o.id === orderId);
  }

  getUserOrders(userId) {
    return this.orders.filter(o => o.userId === userId);
  }

  save() {
    localStorage.setItem("orders", JSON.stringify(this.orders));
    localStorage.setItem("orderCounter", this.orderCounter);
  }
}

// ====================================
// PAYMENT PROCESSING
// ====================================

class PaymentGateway {
  processPayment(orderId, paymentMethod, phoneNumber) {
    if (!["MTN", "ORANGE"].includes(paymentMethod)) {
      return { success: false, message: "Unsupported payment method" };
    }

    if (!this.validatePhoneNumber(phoneNumber)) {
      return { success: false, message: "Invalid phone number" };
    }

    // Simulate payment processing
    const payment = {
      id: generateUniqueId("PAY"),
      orderId,
      method: paymentMethod,
      phoneNumber,
      status: "processing",
      createdAt: new Date().toISOString()
    };

    // Store payment attempt
    let payments = JSON.parse(localStorage.getItem("payments")) || [];
    payments.push(payment);
    localStorage.setItem("payments", JSON.stringify(payments));

    // Simulate successful payment after 2 seconds
    setTimeout(() => {
      payment.status = "completed";
      payments = JSON.parse(localStorage.getItem("payments")) || [];
      const index = payments.findIndex(p => p.id === payment.id);
      if (index !== -1) {
        payments[index] = payment;
        localStorage.setItem("payments", JSON.stringify(payments));
      }

      // Update order status
      const orderManager = new OrderManager();
      orderManager.updateOrderStatus(orderId, "confirmed");
    }, 2000);

    return { success: true, payment };
  }

  validatePhoneNumber(phone) {
    // Cameroon phone format: +237 6xx xxx xxx or +237 2xx xxx xxx
    const phoneRegex = /^(\+237|237)?[26]\d{8}$/;
    return phoneRegex.test(phone.replace(/\s+/g, ''));
  }
}

// ====================================
// UTILITY FUNCTIONS
// ====================================

function generateToken() {
  return "token_" + Math.random().toString(36).substr(2, 9) + Date.now();
}

function generateUniqueId(prefix) {
  return prefix + "_" + Date.now() + "_" + Math.random().toString(36).substr(2, 9);
}

function getCurrentUser() {
  return JSON.parse(localStorage.getItem("user")) || null;
}

function isAuthenticated() {
  return localStorage.getItem("token") !== null;
}

function logout() {
  localStorage.removeItem("token");
  localStorage.removeItem("user");
  localStorage.removeItem("adminUser");
  window.location.href = "login.html";
}

// ====================================
// INITIALIZATION
// ====================================

document.addEventListener("DOMContentLoaded", () => {
  initializeAdmin();
  console.log("App initialized with FCFA currency");
});
