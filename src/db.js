const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
    host : process.env.PG_HOST,
    port : Number(process.env.PG_PORT || 5432),
    database : process.env.PG_DATABASE,
    user : process.env.PG_USER,
    password : process.env.PG_PASSWORD
});

async function initializeDatabase() {
    try {
        const createTableQuery = `
            CREATE TABLE IF NOT EXISTS public.users (
                "name" varchar NOT NULL,
                age int4 NOT NULL,
                address jsonb NULL,
                additional_info jsonb NULL,
                id serial4 PRIMARY KEY
            );
        `;
        
        await pool.query(createTableQuery);
        console.log('Database table initialized successfully');
    } catch (error) {
        console.error('Error initializing database:', error);
        throw error;
    }
}

module.exports = { pool,initializeDatabase };