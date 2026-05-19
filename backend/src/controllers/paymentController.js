const pool = require("../config/db");

// CREATE PAYMENT - MTN or ORANGE only (XAF/FCFA)
exports.createPayment = async (req, res) => {
  try {
    const { order_id, payment_method, payment_reference, phone_number, amount } = req.body;
    const validMethods = ['MTN', 'ORANGE'];
    if (!validMethods.includes(payment_method)) {
      return res.status(400).json({ message: "Only MTN or ORANGE payment methods accepted. Prices in XAF (FCFA)." });
    }

    const payment = await pool.query(
      `INSERT INTO payments (order_id, payment_method, payment_reference, phone_number, amount)
       VALUES ($1,$2,$3,$4,$5) RETURNING *`,
      [order_id, payment_method, payment_reference, phone_number, amount]
    );

    // Update order status to confirmed
    await pool.query("UPDATE orders SET status='confirmed',updated_at=NOW() WHERE id=$1", [order_id]);

    res.status(201).json({ message: "Payment initiated (FCFA)", payment: payment.rows[0] });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// UPDATE PAYMENT STATUS
exports.updatePaymentStatus = async (req, res) => {
  try {
    const { paymentId } = req.params;
    const { status } = req.body;
    const validStatuses = ['pending', 'processing', 'completed', 'failed', 'refunded'];
    if (!validStatuses.includes(status)) return res.status(400).json({ message: "Invalid status" });

    const payment = await pool.query(
      `UPDATE payments SET status=$1, processed_at=CASE WHEN $1='completed' THEN NOW() ELSE processed_at END
       WHERE id=$2 RETURNING *`,
      [status, paymentId]
    );
    if (payment.rows.length === 0) return res.status(404).json({ message: "Payment not found" });
    res.status(200).json({ message: "Payment updated", payment: payment.rows[0] });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// GET PAYMENT BY ORDER ID
exports.getPaymentByOrder = async (req, res) => {
  try {
    const { orderId } = req.params;
    const payment = await pool.query("SELECT * FROM payments WHERE order_id=$1 ORDER BY created_at DESC LIMIT 1", [orderId]);
    if (payment.rows.length === 0) return res.status(404).json({ message: "No payment found for this order" });
    res.status(200).json(payment.rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};