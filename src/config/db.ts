import mysql from "mysql2/promise";

const database = mysql.createPool({
    host: process.env.DB_HOST_ADMIN,
    user: process.env.DB_USER_ADMIN,
    password: process.env.DB_PASS_ADMIN,
    database: process.env.DB_NAME_KOPSAS_ADMIN,
    timezone: "+07:00",
    waitForConnections: true,
    connectionLimit: 20,
    queueLimit: 0,
    enableKeepAlive: true,
    keepAliveInitialDelay: 10000,
});

// Testing pertama saat connect
(async () => {
    try {
        const conn = await database.getConnection();
        await conn.query("SET time_zone = '+07:00'");
        console.log("Connected to MySQL database");
        conn.release();
    } catch (error) {
        console.error("Failed to connect to MySQL database:", error);
    }
})();

// Keep alive untuk cegah idle disconnect
setInterval(async () => {
    try {
        await database.query("SELECT 1");
    } catch (error) {
        console.error("MySQL keep-alive failed:", error);
    }
}, 60000); // setiap 1 menit

// Error handler real-time
(database as any).on("error", (err: any) => {
    console.error("MySQL Pool Error:", err);
});

export default database;
