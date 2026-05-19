const pool = require("../config/db");

// Get chat history between current user and another user
exports.getChatHistory = async (req, res) => {
    try {
        const currentUserId = req.user.id;
        const otherUserId = req.params.userId;

        const messages = await pool.query(
            `SELECT * FROM messages 
             WHERE (sender_id = $1 AND receiver_id = $2) 
                OR (sender_id = $2 AND receiver_id = $1)
             ORDER BY created_at ASC`,
            [currentUserId, otherUserId]
        );

        res.status(200).json(messages.rows);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Send a message
exports.sendMessage = async (req, res) => {
    try {
        const senderId = req.user.id;
        const { receiverId, content } = req.body;

        if (!receiverId || !content) {
            return res.status(400).json({ message: "Receiver and content required" });
        }

        const newMessage = await pool.query(
            `INSERT INTO messages (sender_id, receiver_id, content) 
             VALUES ($1, $2, $3) RETURNING *`,
            [senderId, receiverId, content]
        );

        const msg = newMessage.rows[0];

        // Emit to receiver if connected via socket
        if (req.io) {
            req.io.to(receiverId.toString()).emit("receive_message", msg);
        }

        res.status(201).json(msg);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
