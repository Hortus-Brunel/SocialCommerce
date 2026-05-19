const pool = require("../config/db");

// CREATE ORDER
exports.createOrder = async (req, res) => {
  try {
    const { user_id, total_amount, items, shipping_address, notes } = req.body;
    if (!user_id || !total_amount) return res.status(400).json({ message: "user_id and total_amount required" });

    const order = await pool.query(
      `INSERT INTO orders (user_id, total_amount, shipping_address, notes)
       VALUES ($1,$2,$3,$4) RETURNING *`,
      [user_id, total_amount, JSON.stringify(shipping_address || {}), notes]
    );

    const orderId = order.rows[0].id;
    if (items && items.length > 0) {
      for (const item of items) {
        await pool.query(
          `INSERT INTO order_items (order_id, product_id, quantity, unit_price, subtotal)
           VALUES ($1,$2,$3,$4,$5)`,
          [orderId, item.product_id, item.quantity, item.unit_price, item.quantity * item.unit_price]
        );
      }
    }

    res.status(201).json({ message: "Order created", order: order.rows[0] });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// GET USER ORDERS
exports.getUserOrders = async (req, res) => {
  try {
    const { userId } = req.params;
    const orders = await pool.query(
      "SELECT * FROM orders WHERE user_id=$1 ORDER BY created_at DESC",
      [userId]
    );
    res.status(200).json(orders.rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// GET BUSINESS ORDERS
exports.getBusinessOrders = async (req, res) => {
  try {
    const { businessId } = req.params;
    const orders = await pool.query(
      `SELECT DISTINCT o.* FROM orders o
       JOIN order_items oi ON o.id = oi.order_id
       JOIN products p ON oi.product_id = p.id
       WHERE p.business_id = $1
       ORDER BY o.created_at DESC`,
      [businessId]
    );
    res.status(200).json(orders.rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// GET ORDER BY ID
exports.getOrderById = async (req, res) => {
  try {
    const { id } = req.params;
    const order = await pool.query("SELECT * FROM orders WHERE id=$1", [id]);
    if (order.rows.length === 0) return res.status(404).json({ message: "Order not found" });
    const items = await pool.query(
      `SELECT oi.*, p.title, p.thumbnail_url FROM order_items oi
       JOIN products p ON oi.product_id = p.id WHERE oi.order_id=$1`,
      [id]
    );
    res.status(200).json({ ...order.rows[0], items: items.rows });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// UPDATE ORDER STATUS
exports.updateOrderStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const validStatuses = ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'];
    if (!validStatuses.includes(status)) return res.status(400).json({ message: "Invalid status" });
    const updated = await pool.query(
      "UPDATE orders SET status=$1,updated_at=NOW() WHERE id=$2 RETURNING *",
      [status, id]
    );
    if (updated.rows.length === 0) return res.status(404).json({ message: "Order not found" });
    res.status(200).json({ message: "Order updated", order: updated.rows[0] });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};