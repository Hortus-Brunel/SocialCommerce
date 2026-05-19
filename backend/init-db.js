const pool = require("./src/config/db");
const fs = require("fs");
const path = require("path");

const initDb = async () => {
    try {
        console.log("Reading schema.sql...");
        const schema = fs.readFileSync(path.join(__dirname, "src", "config", "schema.sql"), "utf8");
        
        console.log("Executing schema...");
        await pool.query(schema);
        
        console.log("Database initialized successfully! 🚀");
        process.exit(0);
    } catch (error) {
        console.error("Error initializing database:", error);
        process.exit(1);
    }
};

initDb();
