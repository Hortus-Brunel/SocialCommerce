require("dotenv").config();
const { Pool } = require("pg");

// Create PostgreSQL connection pool
const pool = new Pool({
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    database: process.env.DB_NAME,
});

// Test connection
pool.connect()
    .then(() => console.log("Database connected successfully 🟢"))
    .catch((err) => console.error("Database connection error 🔴", err));

module.exports = pool;