const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const pool = require("../config/db");

// REGISTER
exports.register = async (req, res) => {
    try {
        const name = req.body.name.trim();
        const email = req.body.email.trim().toLowerCase();
        const password = req.body.password;
        const role = req.body.role ? req.body.role.trim().toLowerCase() : "customer";

        // Validate strong password
        const passwordRegex = /^(?=.*[0-9])(?=.*[!@#$%^&*])[a-zA-Z0-9!@#$%^&*]{8,}$/;
        if (!passwordRegex.test(password)) {
            return res.status(400).json({ message: "Password must be at least 8 characters long and contain at least one number and one special character (!@#$%^&*)." });
        }

        // check if user exists
        const userExists = await pool.query(
            "SELECT * FROM users WHERE email=$1",
            [email]
        );

        if (userExists.rows.length > 0) {
            return res.status(400).json({ message: "User already exists" });
        }

        // hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // insert user
        const newUser = await pool.query(
            "INSERT INTO users (name, email, password, role) VALUES ($1,$2,$3,$4) RETURNING *",
            [name, email, hashedPassword, role]
        );

        const user = newUser.rows[0];

        // If user is a business, create a placeholder business profile
        if (role === "business") {
            await pool.query(
                "INSERT INTO businesses (owner_id, business_name, verification_status) VALUES ($1, $2, $3)",
                [user.id, `${name}'s Store`, 'pending']
            );
        }

        res.json(user);

    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// LOGIN
exports.login = async (req, res) => {
    try {
        const email = req.body.email.trim().toLowerCase();
        const password = req.body.password;

        const userResult = await pool.query(
            "SELECT * FROM users WHERE email=$1",
            [email]
        );

        if (userResult.rows.length === 0) {
            return res.status(400).json({ message: "User not found" });
        }

        const user = userResult.rows[0];

        const validPassword = await bcrypt.compare(
            password,
            user.password
        );

        if (!validPassword) {
            return res.status(400).json({ message: "Invalid password" });
        }

        // Fetch business details if user is business
        let business = null;
        if (user.role === "business") {
            const bizResult = await pool.query("SELECT * FROM businesses WHERE owner_id = $1", [user.id]);
            business = bizResult.rows[0] || null;
        }

        const rememberMe = req.body.rememberMe === true;
        const expiresIn = rememberMe ? "30d" : "1d";

        // create token
        const token = jwt.sign(
            { id: user.id, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn }
        );

        res.json({
            token,
            user,
            business
        });

    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};