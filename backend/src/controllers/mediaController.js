const pool = require("../config/db");
const multer = require("multer");
const path = require("path");

// Configure Multer for local storage
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, path.join(__dirname, "../../public/uploads")); // Adjusted path to backend/public/uploads
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({ 
    storage: storage,
    limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
    fileFilter: (req, file, cb) => {
        if (file.mimetype.startsWith('image/') || file.mimetype.startsWith('video/')) {
            cb(null, true);
        } else {
            cb(new Error('Only image and video files are allowed!'), false);
        }
    }
}).single('media_file'); // Field name for upload

exports.uploadMiddleware = (req, res, next) => {
    upload(req, res, function (err) {
        if (err) {
            return res.status(400).json({ error: err.message });
        }
        next();
    });
};

// ADD MEDIA
exports.addMedia = async (req, res) => {
    try {
        const user_id = req.user.id;
        const { business_id, title, description } = req.body;
        
        if (!req.file) {
            return res.status(400).json({ message: "No file uploaded" });
        }

        const media_type = req.file.mimetype.startsWith('video/') ? 'video' : 'image';
        // Construct the URL to access the static file
        const url = `/uploads/${req.file.filename}`;

        const newMedia = await pool.query(
            `INSERT INTO media (business_id, user_id, media_type, url, title, description)
             VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
            [business_id, user_id, media_type, url, title, description]
        );

        res.status(201).json({
            message: "Media uploaded successfully",
            media: newMedia.rows[0]
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// GET BUSINESS MEDIA
exports.getBusinessMedia = async (req, res) => {
    try {
        const { businessId } = req.params;
        const media = await pool.query(
            `SELECT * FROM media WHERE business_id = $1 ORDER BY created_at DESC`,
            [businessId]
        );
        res.status(200).json(media.rows);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};