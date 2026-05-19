const pool = require("../config/db");

// CREATE BUSINESS
exports.createBusiness = async (req, res) => {
    try {
        const {
            owner_id,
            business_name,
            description,
            logo_url,
            banner_url,
            category,
            city,
            region,
            phone,
            email
        } = req.body;

        const newBusiness = await pool.query(
            `INSERT INTO businesses (owner_id, business_name, description, logo_url, banner_url, category, city, region, phone, email)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) RETURNING *`,
            [owner_id, business_name, description, logo_url, banner_url, category, city, region, phone, email]
        );

        res.status(201).json({ message: "Business created successfully", business: newBusiness.rows[0] });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// GET BUSINESS BY OWNER ID
exports.getBusinessByOwner = async (req, res) => {
    try {
        const { ownerId } = req.params;
        const business = await pool.query("SELECT * FROM businesses WHERE owner_id = $1", [ownerId]);
        if (business.rows.length === 0) return res.status(404).json({ message: "No business found for this user" });
        res.status(200).json(business.rows[0]);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// GET BUSINESS STATS
exports.getBusinessStats = async (req, res) => {
    try {
        const { businessId } = req.params;
        const [revenue, orders, products, followers] = await Promise.all([
            pool.query("SELECT COALESCE(SUM(total_amount),0) as total FROM orders o JOIN order_items oi ON o.id = oi.order_id JOIN products p ON oi.product_id = p.id WHERE p.business_id = $1 AND o.status != 'cancelled'", [businessId]),
            pool.query("SELECT COUNT(DISTINCT o.id) FROM orders o JOIN order_items oi ON o.id = oi.order_id JOIN products p ON oi.product_id = p.id WHERE p.business_id = $1", [businessId]),
            pool.query("SELECT COUNT(*) FROM products WHERE business_id = $1", [businessId]),
            pool.query("SELECT followers_count FROM businesses WHERE id = $1", [businessId])
        ]);

        res.status(200).json({
            revenue: parseInt(revenue.rows[0].total),
            orders: parseInt(orders.rows[0].count),
            products: parseInt(products.rows[0].count),
            followers: parseInt(followers.rows[0].followers_count || 0)
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// GET ALL BUSINESSES
exports.getBusinesses = async (req, res) => {
    try {
        const businesses = await pool.query("SELECT * FROM businesses ORDER BY created_at DESC");
        res.status(200).json(businesses.rows);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};