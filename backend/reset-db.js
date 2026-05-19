const pool = require("./src/config/db");

const resetDb = async () => {
    try {
        console.log("Dropping existing public schema...");
        await pool.query("DROP SCHEMA public CASCADE; CREATE SCHEMA public;");
        console.log("Schema dropped and recreated successfully! 🧹");
        process.exit(0);
    } catch (error) {
        console.error("Error resetting database:", error);
        process.exit(1);
    }
};

resetDb();
