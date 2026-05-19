const pool = require("../config/db");


// FOLLOW BUSINESS
exports.followBusiness = async (req, res) => {

    try {

        const { user_id, business_id } = req.body;

        const follow = await pool.query(

            `
            INSERT INTO follows
            (user_id, business_id)

            VALUES ($1, $2)

            RETURNING *
            `,

            [user_id, business_id]
        );

        res.status(201).json({
            message: "Business followed successfully",
            follow: follow.rows[0]
        });

    } catch (error) {

        res.status(500).json({
            error: error.message
        });

    }

};


// GET FOLLOWED BUSINESSES FEED
exports.getFeed = async (req, res) => {

    try {

        const { userId } = req.params;

        const feed = await pool.query(

            `
            SELECT
                products.*,
                businesses.business_name

            FROM products

            JOIN businesses
            ON products.business_id = businesses.id

            JOIN follows
            ON follows.business_id = businesses.id

            WHERE follows.user_id = $1

            ORDER BY products.created_at DESC
            `,

            [userId]
        );

        res.status(200).json(feed.rows);

    } catch (error) {

        res.status(500).json({
            error: error.message
        });

    }

};