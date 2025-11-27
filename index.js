const express = require('express');
require('dotenv').config();
const importRoute = require('./src/routes/importRoute');
const { initializeDatabase } = require('./src/db');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(express.json());


// health check route
app.get('/health', (req, res) => {
    res.json({ status: 'ok' });
});

app.use('/api', importRoute);

app.get('/', (req, res) => {
    res.send("Server is up and running !");
});

// Initialize database and start server
(async () => {
    try {
        await initializeDatabase();
        app.listen(PORT, () => {
            console.log(`Server is running on port ${PORT}`);
        });
    } catch (error) {
        console.error('Failed to start server:', error);
        process.exit(1);
    }
})();
