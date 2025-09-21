import mysql from 'mysql2/promise'

const database = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB_NAME_KOPSAS,
    timezone: "+07:00"
});

database.getConnection()
.then(() => {
    console.log('Database connected successfully');
})
.catch(err => {
    console.error('Database connection failed:', err);
});

export default database;