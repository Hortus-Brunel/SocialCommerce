// =========================
// E-COMMERCE FEATURES MODULE
// =========================
// Wishlist, Reviews, Ratings, Recommendations
// Social Commerce Features from TikTok, Amazon, Alibaba

const API_BASE_URL = 'http://localhost:5000/api';

// =========================
// WISHLIST FUNCTIONS
// =========================

class WishlistManager {
  constructor() {
    this.wishlist = JSON.parse(localStorage.getItem('wishlist')) || [];
  }

  addToWishlist(product) {
    if (!this.isInWishlist(product.id)) {
      this.wishlist.push(product);
      this.save();
      showNotification('Added to wishlist ❤️', 'success');
      return true;
    }
    return false;
  }

  removeFromWishlist(productId) {
    this.wishlist = this.wishlist.filter(p => p.id !== productId);
    this.save();
    showNotification('Removed from wishlist', 'info');
    return true;
  }

  isInWishlist(productId) {
    return this.wishlist.some(p => p.id === productId);
  }

  getWishlist() {
    return this.wishlist;
  }

  save() {
    localStorage.setItem('wishlist', JSON.stringify(this.wishlist));
  }

  clear() {
    this.wishlist = [];
    this.save();
  }

  getCount() {
    return this.wishlist.length;
  }
}

const wishlistManager = new WishlistManager();

// =========================
// REVIEWS & RATINGS
// =========================

class ReviewSystem {
  constructor() {
    this.reviews = JSON.parse(localStorage.getItem('reviews')) || {};
  }

  addReview(productId, review) {
    if (!this.reviews[productId]) {
      this.reviews[productId] = [];
    }

    const newReview = {
      id: `review_${Date.now()}`,
      author: localStorage.getItem('userName') || 'Anonymous',
      rating: review.rating,
      title: review.title,
      comment: review.comment,
      helpful: 0,
      notHelpful: 0,
      verified: true,
      timestamp: new Date().toISOString(),
      images: review.images || []
    };

    this.reviews[productId].push(newReview);
    this.save();
    showNotification('Review posted successfully! ⭐', 'success');
    return newReview;
  }

  getReviews(productId, limit = 10) {
    return (this.reviews[productId] || []).slice(-limit);
  }

  getAverageRating(productId) {
    const reviews = this.reviews[productId] || [];
    if (reviews.length === 0) return 0;
    const sum = reviews.reduce((acc, r) => acc + r.rating, 0);
    return (sum / reviews.length).toFixed(1);
  }

  getRatingDistribution(productId) {
    const reviews = this.reviews[productId] || [];
    const distribution = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
    reviews.forEach(r => distribution[r.rating]++);
    return distribution;
  }

  markHelpful(productId, reviewId) {
    const review = (this.reviews[productId] || []).find(r => r.id === reviewId);
    if (review) {
      review.helpful++;
      this.save();
    }
  }

  save() {
    localStorage.setItem('reviews', JSON.stringify(this.reviews));
  }
}

const reviewSystem = new ReviewSystem();

// =========================
// RECOMMENDATION ENGINE
// =========================

class RecommendationEngine {
  constructor() {
    this.viewHistory = JSON.parse(localStorage.getItem('viewHistory')) || [];
    this.purchaseHistory = JSON.parse(localStorage.getItem('purchaseHistory')) || [];
  }

  trackView(product) {
    this.viewHistory.push({
      productId: product.id,
      category: product.category,
      timestamp: Date.now()
    });
    localStorage.setItem('viewHistory', JSON.stringify(this.viewHistory));
  }

  trackPurchase(product) {
    this.purchaseHistory.push({
      productId: product.id,
      category: product.category,
      price: product.price,
      timestamp: Date.now()
    });
    localStorage.setItem('purchaseHistory', JSON.stringify(this.purchaseHistory));
  }

  getTopCategories(limit = 5) {
    const categories = {};
    
    // Weight recent views higher
    this.viewHistory.forEach(view => {
      const weight = Math.max(1, 10 - (Date.now() - view.timestamp) / (1000 * 60 * 60));
      categories[view.category] = (categories[view.category] || 0) + weight;
    });

    // Weight purchases even higher
    this.purchaseHistory.forEach(purchase => {
      categories[purchase.category] = (categories[purchase.category] || 0) + 100;
    });

    return Object.entries(categories)
      .sort((a, b) => b[1] - a[1])
      .slice(0, limit)
      .map(([category]) => category);
  }

  getSimilarProducts(product, allProducts = []) {
    return allProducts
      .filter(p => p.id !== product.id && p.category === product.category)
      .sort((a, b) => {
        // Sort by rating and popularity
        return (b.rating || 0) - (a.rating || 0);
      })
      .slice(0, 6);
  }

  getPersonalizedRecommendations(allProducts = [], limit = 8) {
    const categories = this.getTopCategories();
    const recommendations = [];

    categories.forEach(category => {
      const categoryProducts = allProducts.filter(p => p.category === category);
      recommendations.push(...categoryProducts.slice(0, 2));
    });

    return recommendations.slice(0, limit);
  }
}

const recommendationEngine = new RecommendationEngine();

// =========================
// SOCIAL COMMERCE FEATURES
// =========================

class SocialCommerceFeatures {
  // Share product on social media
  static shareProduct(product, platform) {
    const message = `Check out this amazing ${product.name}! 🛍️\n${product.description}\nPrice: ${product.price}`;
    const encodedMessage = encodeURIComponent(message);

    const urls = {
      twitter: `https://twitter.com/intent/tweet?text=${encodedMessage}`,
      facebook: `https://www.facebook.com/sharer/sharer.php?quote=${encodedMessage}`,
      whatsapp: `https://wa.me/?text=${encodedMessage}`,
      telegram: `https://t.me/share/url?text=${encodedMessage}`
    };

    if (urls[platform]) {
      window.open(urls[platform], '_blank', 'width=600,height=400');
      showNotification('Shared on ' + platform + ' ✓', 'success');
    }
  }

  // Live stream features
  static startLiveStream(product) {
    // In production, integrate with actual live streaming service
    showNotification('🔴 Starting live stream for ' + product.name, 'info');
    // window.location.href = 'live-stream.html?product=' + product.id;
  }

  // Flash sale
  static createFlashSale(product, duration, discountPercent) {
    const endTime = Date.now() + (duration * 60 * 1000);
    const saleData = {
      productId: product.id,
      originalPrice: product.price,
      discountedPrice: product.price * (1 - discountPercent / 100),
      discountPercent: discountPercent,
      startTime: Date.now(),
      endTime: endTime,
      sold: 0
    };
    
    localStorage.setItem(`flashsale_${product.id}`, JSON.stringify(saleData));
    showNotification('⚡ Flash sale created!', 'success');
  }

  // Loyalty points
  static addLoyaltyPoints(userId, amount, reason = 'purchase') {
    let points = parseInt(localStorage.getItem(`loyaltyPoints_${userId}`) || '0');
    points += amount;
    localStorage.setItem(`loyaltyPoints_${userId}`, points.toString());
    showNotification(`✨ Earned ${amount} loyalty points!`, 'success');
  }

  // Referral program
  static generateReferralLink() {
    const referralCode = 'SV' + Math.random().toString(36).substring(2, 8).toUpperCase();
    const referralLink = `${window.location.origin}?ref=${referralCode}`;
    localStorage.setItem('referralCode', referralCode);
    return referralLink;
  }

  // Group buying
  static createGroupBuy(product, minGroup, discount) {
    const groupBuy = {
      id: `groupbuy_${Date.now()}`,
      productId: product.id,
      currentBuyers: 1,
      minGroup: minGroup,
      discount: discount,
      originalPrice: product.price,
      groupPrice: product.price * (1 - discount / 100),
      created: Date.now(),
      status: 'active'
    };

    localStorage.setItem(`groupbuy_${groupBuy.id}`, JSON.stringify(groupBuy));
    showNotification('👥 Group buy created! Share with friends', 'success');
    return groupBuy;
  }

  // Seller shop following
  static followSeller(sellerId, sellerName) {
    let followers = JSON.parse(localStorage.getItem('followedSellers') || '[]');
    if (!followers.includes(sellerId)) {
      followers.push(sellerId);
      localStorage.setItem('followedSellers', JSON.stringify(followers));
      showNotification(`Followed ${sellerName} ✓`, 'success');
    }
  }

  // Notifications
  static enableNotifications(type) {
    const notifications = JSON.parse(localStorage.getItem('notificationPrefs') || '{}');
    notifications[type] = true;
    localStorage.setItem('notificationPrefs', JSON.stringify(notifications));
  }
}

// =========================
// UI COMPONENTS & HELPERS
// =========================

function renderStarRating(rating, size = 'medium') {
  const fullStars = Math.floor(rating);
  const hasHalf = rating % 1 >= 0.5;
  let html = '';

  for (let i = 0; i < 5; i++) {
    if (i < fullStars) {
      html += '⭐';
    } else if (i === fullStars && hasHalf) {
      html += '⭐';
    } else {
      html += '☆';
    }
  }

  return html;
}

function formatDate(timestamp) {
  const date = new Date(timestamp);
  const now = new Date();
  const diffMs = now - date;
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  
  return date.toLocaleDateString();
}

function showNotification(message, type = 'info') {
  const notification = document.createElement('div');
  notification.className = `notification notification-${type}`;
  notification.style.cssText = `
    position: fixed;
    bottom: 20px;
    right: 20px;
    background: ${type === 'success' ? 'rgba(34, 197, 94, 0.2)' : type === 'error' ? 'rgba(239, 68, 68, 0.2)' : 'rgba(0, 102, 204, 0.2)'};
    color: ${type === 'success' ? '#22c55e' : type === 'error' ? '#ef4444' : '#0066cc'};
    padding: 15px 20px;
    border-radius: 10px;
    border: 1px solid ${type === 'success' ? 'rgba(34, 197, 94, 0.3)' : type === 'error' ? 'rgba(239, 68, 68, 0.3)' : 'rgba(0, 102, 204, 0.3)'};
    z-index: 2000;
    animation: slideInUp 0.3s ease;
  `;
  
  notification.textContent = message;
  document.body.appendChild(notification);
  
  setTimeout(() => notification.remove(), 3000);
}

// =========================
// BULK BUYING FEATURES (Amazon/Alibaba style)
// =========================

class BulkBuyer {
  constructor() {
    this.bulkOrders = JSON.parse(localStorage.getItem('bulkOrders')) || [];
  }

  getBulkPrice(product, quantity) {
    const bulkTiers = [
      { min: 1, max: 10, discount: 0 },
      { min: 11, max: 50, discount: 5 },
      { min: 51, max: 100, discount: 10 },
      { min: 101, max: 500, discount: 15 },
      { min: 501, max: Infinity, discount: 20 }
    ];

    const tier = bulkTiers.find(t => quantity >= t.min && quantity <= t.max);
    const discountedPrice = product.price * (1 - tier.discount / 100);
    
    return {
      unitPrice: discountedPrice,
      totalPrice: discountedPrice * quantity,
      discount: tier.discount,
      savings: (product.price - discountedPrice) * quantity
    };
  }

  createBulkOrder(product, quantity) {
    const bulkPrice = this.getBulkPrice(product, quantity);
    const order = {
      id: `bulk_${Date.now()}`,
      productId: product.id,
      productName: product.name,
      quantity: quantity,
      unitPrice: bulkPrice.unitPrice,
      totalPrice: bulkPrice.totalPrice,
      discount: bulkPrice.discount,
      savings: bulkPrice.savings,
      status: 'pending',
      created: new Date()
    };

    this.bulkOrders.push(order);
    this.save();
    return order;
  }

  save() {
    localStorage.setItem('bulkOrders', JSON.stringify(this.bulkOrders));
  }
}

const bulkBuyer = new BulkBuyer();

// =========================
// EXPORT MODULES
// =========================

// Make available globally
window.wishlistManager = wishlistManager;
window.reviewSystem = reviewSystem;
window.recommendationEngine = recommendationEngine;
window.SocialCommerceFeatures = SocialCommerceFeatures;
window.bulkBuyer = bulkBuyer;
window.renderStarRating = renderStarRating;
window.formatDate = formatDate;
window.showNotification = showNotification;
