const pool = require("../config/db");


// LIKE PRODUCT
exports.likeProduct = async (req, res) => {

    try {

        const { user_id, product_id } = req.body;

        const like = await pool.query(

            `
            INSERT INTO likes
            (user_id, product_id)

            VALUES ($1, $2)

            RETURNING *
            `,

            [user_id, product_id]
        );

        res.status(201).json({
            message: "Product liked successfully",
            like: like.rows[0]
        });

    } catch (error) {

        res.status(500).json({
            error: error.message
        });

    }

};


// COMMENT ON PRODUCT
exports.commentProduct = async (req, res) => {

    try {

        const {
            user_id,
            product_id,
            comment
        } = req.body;

        const newComment = await pool.query(

            `
            INSERT INTO comments
            (
                user_id,
                product_id,
                comment
            )

            VALUES ($1, $2, $3)

            RETURNING *
            `,

            [
                user_id,
                product_id,
                comment
            ]
        );

        res.status(201).json({
            message: "Comment added successfully",
            comment: newComment.rows[0]
        });

    } catch (error) {

        res.status(500).json({
            error: error.message
        });

    }

};


// GET PRODUCT COMMENTS
exports.getProductComments = async (req, res) => {

    try {

        const { productId } = req.params;

        const comments = await pool.query(

            `
            SELECT
                comments.*,
                users.name

            FROM comments

            JOIN users
            ON comments.user_id = users.id

            WHERE product_id = $1

            ORDER BY comments.created_at DESC
            `,

            [productId]
        );

        res.status(200).json(comments.rows);

    } catch (error) {

        res.status(500).json({
            error: error.message
        });

    }

};