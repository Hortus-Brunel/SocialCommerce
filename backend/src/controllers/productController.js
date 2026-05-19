const pool = require("../config/db");

// CREATE PRODUCT
exports.createProduct = async (req, res) => {
  try {
    const { business_id, title, description, price, stock, category, thumbnail_url } = req.body;
    if (!title || !price) return res.status(400).json({ message: "Title and price required" });

    const newProduct = await pool.query(
      `INSERT INTO products (business_id,title,description,price,stock,category,thumbnail_url)
       VALUES ($1,$2,$3,$4,$5,$6,$7) RETURNING *`,
      [business_id, title, description, price, stock || 0, category, thumbnail_url]
    );
    res.status(201).json({ message: "Product created", product: newProduct.rows[0] });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// GET ALL PRODUCTS
exports.getProducts = async (req, res) => {
  try {
    const { category, search, limit = 20, offset = 0 } = req.query;
    let query = `SELECT p.*, b.business_name FROM products p
                 JOIN businesses b ON p.business_id = b.id
                 WHERE p.is_active = true`;
    const params = [];
    if (category) { params.push(category); query += ` AND p.category = $${params.length}`; }
    if (search) { params.push(`%${search}%`); query += ` AND p.title ILIKE $${params.length}`; }
    params.push(limit); query += ` ORDER BY p.created_at DESC LIMIT $${params.length}`;
    params.push(offset); query += ` OFFSET $${params.length}`;
    const products = await pool.query(query, params);
    res.status(200).json(products.rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// GET PRODUCT BY ID
exports.getProductById = async (req, res) => {
  try {
    const { id } = req.params;
    const product = await pool.query(
      `SELECT p.*, b.business_name, b.logo_url FROM products p
       JOIN businesses b ON p.business_id = b.id WHERE p.id = $1`,
      [id]
    );
    if (product.rows.length === 0) return res.status(404).json({ message: "Product not found" });
    await pool.query("UPDATE products SET views_count = views_count + 1 WHERE id = $1", [id]);
    res.status(200).json(product.rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// UPDATE PRODUCT
exports.updateProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, price, stock, category, thumbnail_url, is_active } = req.body;
    const updated = await pool.query(
      `UPDATE products SET title=$1,description=$2,price=$3,stock=$4,category=$5,thumbnail_url=$6,is_active=$7,updated_at=NOW()
       WHERE id=$8 RETURNING *`,
      [title, description, price, stock, category, thumbnail_url, is_active, id]
    );
    if (updated.rows.length === 0) return res.status(404).json({ message: "Product not found" });
    res.status(200).json({ message: "Product updated", product: updated.rows[0] });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// DELETE PRODUCT
exports.deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;
    await pool.query("DELETE FROM products WHERE id=$1", [id]);
    res.status(200).json({ message: "Product permanently deleted" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};