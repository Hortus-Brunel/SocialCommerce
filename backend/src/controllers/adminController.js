const pool = require("../config/db");

// GET ADMIN STATS
exports.getStats = async (req, res) => {
  try {
    const [users, businesses, products, orders, revenue] = await Promise.all([
      pool.query("SELECT COUNT(*) FROM users"),
      pool.query("SELECT COUNT(*) FROM businesses"),
      pool.query("SELECT COUNT(*) FROM products WHERE is_active=true"),
      pool.query("SELECT COUNT(*) FROM orders"),
      pool.query("SELECT COALESCE(SUM(total_amount),0) as total FROM orders WHERE status != 'cancelled'")
    ]);
    res.status(200).json({
      users: parseInt(users.rows[0].count),
      businesses: parseInt(businesses.rows[0].count),
      products: parseInt(products.rows[0].count),
      orders: parseInt(orders.rows[0].count),
      revenue_fcfa: parseInt(revenue.rows[0].total),
      currency: "XAF (FCFA)"
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// GET ALL USERS
exports.getAllUsers = async (req, res) => {
  try {
    const users = await pool.query(
      "SELECT id,name,email,role,is_active,created_at FROM users ORDER BY created_at DESC"
    );
    res.status(200).json(users.rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// SUSPEND / ACTIVATE USER
exports.toggleUserStatus = async (req, res) => {
  try {
    const { userId } = req.params;
    const user = await pool.query("SELECT is_active FROM users WHERE id=$1", [userId]);
    if (user.rows.length === 0) return res.status(404).json({ message: "User not found" });
    const newStatus = !user.rows[0].is_active;
    await pool.query("UPDATE users SET is_active=$1 WHERE id=$2", [newStatus, userId]);
    res.status(200).json({ message: `User ${newStatus ? 'activated' : 'suspended'}`, is_active: newStatus });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// VERIFY BUSINESS
exports.verifyBusiness = async (req, res) => {
  try {
    const { businessId } = req.params;
    const { action } = req.body; // 'approve' or 'reject'
    const status = action === 'approve' ? 'verified' : 'rejected';
    const isVerified = action === 'approve';
    await pool.query(
      "UPDATE businesses SET verification_status=$1, is_verified=$2, verified_at=NOW() WHERE id=$3",
      [status, isVerified, businessId]
    );
    res.status(200).json({ message: `Business ${status}` });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};