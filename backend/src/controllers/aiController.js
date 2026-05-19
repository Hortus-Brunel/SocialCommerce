const pool = require("../config/db");


// TRACK USER ACTIVITY
exports.trackActivity = async (req, res) => {

    try {

        const {
            user_id,
            product_id,
            activity_type
        } = req.body;

        const activity = await pool.query(

            `
            INSERT INTO user_activity
            (
                user_id,
                product_id,
                activity_type
            )

            VALUES ($1, $2, $3)

            RETURNING *
            `,

            [
                user_id,
                product_id,
                activity_type
            ]
        );

        res.status(201).json({
            message: "Activity recorded",
            activity: activity.rows[0]
        });

    } catch (error) {

        res.status(500).json({
            error: error.message
        });

    }

};


// SIMPLE RECOMMENDATION ENGINE (BASIC VERSION)
exports.getRecommendations = async (req, res) => {

    try {

        const { userId } = req.params;

        const recommendations = await pool.query(

            `
            SELECT
                products.*,
                COUNT(user_activity.id) AS score

            FROM products

            LEFT JOIN user_activity
            ON products.id = user_activity.product_id

            GROUP BY products.id

            ORDER BY score DESC
            LIMIT 10
            `
        );

        res.status(200).json(recommendations.rows);

    } catch (error) {

        res.status(500).json({
            error: error.message
        });

    }

};