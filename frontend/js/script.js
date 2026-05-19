// =========================
// API & STATE MANAGEMENT
// =========================

const API_BASE = "http://localhost:5000/api";

function getAuthHeader() {
  const token = localStorage.getItem("token");
  return {
    "Content-Type": "application/json",
    "Authorization": `Bearer ${token}`
  };
}

// =========================
// DASHBOARD MANAGERS
// =========================

const DashboardManager = {
  // ADMIN DASHBOARD
  initAdmin: async function() {
    try {
      const res = await fetch(`${API_BASE}/admin/stats`, { headers: getAuthHeader() });
      if (!res.ok) throw new Error("Failed to fetch admin stats");
      const stats = await res.json();
      
      // Update UI
      this.updateAdminStats(stats);
      this.loadAdminUsers();
    } catch (err) {
      console.error(err);
      // displayNotification("Error loading admin data", "error");
    }
  },

  updateAdminStats: function(stats) {
    const mappings = {
      'users-count': stats.users,
      'biz-count': stats.businesses,
      'prod-count': stats.products,
      'order-count': stats.orders,
      'revenue-count': formatCurrency(stats.revenue_fcfa)
    };
    for (const [id, val] of Object.entries(mappings)) {
      const el = document.getElementById(id);
      if (el) el.textContent = val;
    }
  },

  loadAdminUsers: async function() {
    try {
      const res = await fetch(`${API_BASE}/admin/users`, { headers: getAuthHeader() });
      const users = await res.json();
      const tbody = document.getElementById('usersTableBody');
      if (!tbody) return;
      tbody.innerHTML = users.map(u => `
        <tr>
          <td>#${u.id}</td>
          <td>${u.name}</td>
          <td>${u.email}</td>
          <td><span class="badge badge-${u.role}">${u.role}</span></td>
          <td><span class="badge badge-${u.is_active ? 'verified' : 'rejected'}">${u.is_active ? 'Active' : 'Suspended'}</span></td>
          <td>
            <button class="btn-xs btn-reject" onclick="DashboardManager.toggleUser(${u.id})">${u.is_active ? 'Suspend' : 'Activate'}</button>
          </td>
        </tr>
      `).join('');
    } catch (err) { console.error(err); }
  },

  toggleUser: async function(userId) {
    try {
      const res = await fetch(`${API_BASE}/admin/users/${userId}/toggle`, {
        method: 'PUT',
        headers: getAuthHeader()
      });
      const data = await res.json();
      if (res.ok) {
        displayNotification(data.message, "success");
        this.loadAdminUsers();
      } else {
        displayNotification(data.message || "Failed to toggle status", "error");
      }
    } catch (err) { console.error(err); }
  },

  // BUSINESS DASHBOARD
  initBusiness: async function() {
    const user = JSON.parse(localStorage.getItem("user"));
    let business = JSON.parse(localStorage.getItem("business"));
    
    if (!business || business.owner_id !== user.id) {
      const res = await fetch(`${API_BASE}/businesses/owner/${user.id}`, { headers: getAuthHeader() });
      const data = await res.json();
      if (res.ok) {
        business = data;
        localStorage.setItem("business", JSON.stringify(data));
      }
    }

    if (business) {
      this.loadBusinessStats(business.id);
      this.loadBusinessOrders(business.id);
      this.loadBusinessProducts(business.id);
      const bizNameEl = document.getElementById('bizName');
      if (bizNameEl) bizNameEl.textContent = business.business_name;
    }
  },

  loadBusinessStats: async function(businessId) {
    try {
      const res = await fetch(`${API_BASE}/businesses/stats/${businessId}`, { headers: getAuthHeader() });
      const stats = await res.json();
      
      const mappings = {
        'biz-revenue': formatCurrency(stats.revenue),
        'biz-orders': stats.orders,
        'biz-products': stats.products,
        'biz-followers': stats.followers
      };
      for (const [id, val] of Object.entries(mappings)) {
        const el = document.getElementById(id);
        if (el) el.textContent = val;
      }
    } catch (err) { console.error(err); }
  },

  loadBusinessOrders: async function(businessId) {
    try {
      const res = await fetch(`${API_BASE}/orders/business/${businessId}`, { headers: getAuthHeader() });
      const orders = await res.json();
      const tbody = document.getElementById('recentOrdersTable');
      const allOrdersBody = document.getElementById('allOrdersTable');
      
      const html = orders.map(o => `
        <tr>
          <td>#${o.id}</td>
          <td>${formatCurrency(o.total_amount)}</td>
          <td><span class="badge badge-${o.status}">${o.status}</span></td>
        </tr>
      `).join('');
      
      if (tbody) tbody.innerHTML = html.slice(0, 5);
      if (allOrdersBody) allOrdersBody.innerHTML = orders.map(o => `
        <tr>
          <td>#${o.id}</td>
          <td>Customer #${o.user_id}</td>
          <td>${formatCurrency(o.total_amount)}</td>
          <td><span class="badge badge-${o.status}">${o.status}</span></td>
          <td>${new Date(o.created_at).toLocaleDateString()}</td>
        </tr>
      `).join('');
    } catch (err) { console.error(err); }
  },

  loadBusinessProducts: async function(businessId) {
    try {
      const res = await fetch(`${API_BASE}/products?limit=50&offset=0`, { headers: getAuthHeader() });
      const products = await res.json();
      const myProds = products.filter(p => p.business_id === businessId);
      const container = document.getElementById('productsContainer');
      if (!container) return;
      
      container.innerHTML = myProds.map(p => `
        <div class="prod-card">
          <img src="${p.thumbnail_url || 'https://via.placeholder.com/100'}" alt="${p.title}">
          <div style="flex:1"><strong>${p.title}</strong><p style="color:var(--muted);font-size:12px;margin:2px 0;">${p.category} · Stock: ${p.stock}</p></div>
          <div style="text-align:right;"><strong style="color:var(--primary);">${formatCurrency(p.price)}</strong><br><span class="badge badge-delivered" style="font-size:10px;">${p.status}</span></div>
        </div>
      `).join('');
    } catch (err) { console.error(err); }
  },

  // CUSTOMER DASHBOARD
  initCustomer: async function() {
    const user = JSON.parse(localStorage.getItem("user"));
    if (user) {
      const custNameEl = document.getElementById('custName');
      if (custNameEl) custNameEl.textContent = user.name;
      this.loadCustomerOrders(user.id);
    }
  },

  loadCustomerOrders: async function(userId) {
    try {
      const res = await fetch(`${API_BASE}/orders/user/${userId}`, { headers: getAuthHeader() });
      const orders = await res.json();
      const recentTbody = document.getElementById('custRecentOrdersTable');
      const allOrdersTbody = document.getElementById('custAllOrdersTable');
      
      const statsMappings = {
        'cust-orders-count': orders.length,
        'cust-spent-count': formatCurrency(orders.reduce((sum, o) => sum + o.total_amount, 0))
      };
      for (const [id, val] of Object.entries(statsMappings)) {
        const el = document.getElementById(id);
        if (el) el.textContent = val;
      }

      const html = orders.map(o => `
        <tr>
          <td>#${o.id}</td>
          <td>${formatCurrency(o.total_amount)}</td>
          <td><span class="badge badge-${o.status}">${o.status}</span></td>
        </tr>
      `).join('');

      if (recentTbody) recentTbody.innerHTML = html.slice(0, 3);
      if (allOrdersTbody) allOrdersTbody.innerHTML = orders.map(o => `
        <tr>
          <td>#${o.id}</td>
          <td>${formatCurrency(o.total_amount)}</td>
          <td><span class="badge badge-${o.status}">${o.status}</span></td>
          <td>${new Date(o.created_at).toLocaleDateString()}</td>
          <td><a href="order-details.html?id=${o.id}" style="color:var(--primary);font-size:12px;">Details →</a></td>
        </tr>
      `).join('');
    } catch (err) { console.error(err); }
  }
};

// =========================
// UTILITY FUNCTIONS
// =========================

function formatCurrency(amount) {
  return new Intl.NumberFormat('fr-CM', {
    style: 'decimal',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(amount || 0) + " Fr";
}

function displayNotification(message, type = 'info') {
  const notification = document.createElement('div');
  notification.className = `notification notification-${type}`;
  notification.textContent = message;
  notification.style.cssText = `
    position: fixed; top: 20px; right: 20px; padding: 15px 20px;
    background: ${type === 'success' ? '#22c55e' : type === 'error' ? '#ef4444' : '#667eea'};
    color: white; border-radius: 12px; z-index: 9999; animation: slideIn 0.3s ease; box-shadow: 0 10px 15px rgba(0,0,0,0.1);
  `;
  document.body.appendChild(notification);
  setTimeout(() => notification.remove(), 3000);
}

// =========================
// NAVIGATION & AUTH
// =========================

function doLogout() {
  localStorage.clear();
  window.location.href = 'login.html';
}

// Global initialization
document.addEventListener("DOMContentLoaded", () => {
  const path = window.location.pathname;
  if (path.includes("admin-dashboard.html")) DashboardManager.initAdmin();
  if (path.includes("business-dashboard.html")) DashboardManager.initBusiness();
  if (path.includes("customer-dashboard.html")) DashboardManager.initCustomer();
});

// Navigation Functions
function goToLogin() {
  const path = window.location.pathname;
  if (path.includes('/pages/')) {
    window.location.href = 'login.html';
  } else {
    window.location.href = 'pages/login.html';
  }
}

function goToRegister() {
  const path = window.location.pathname;
  if (path.includes('/pages/')) {
    window.location.href = 'register.html';
  } else {
    window.location.href = 'pages/register.html';
  }
}

// Mobile Menu Toggle
function toggleMobileMenu() {
  const mobileMenu = document.getElementById('mobileMenu');
  if (mobileMenu) {
    if (mobileMenu.style.display === 'flex') {
      mobileMenu.style.display = 'none';
    } else {
      mobileMenu.style.display = 'flex';
      mobileMenu.style.flexDirection = 'column';
    }
  }
}
