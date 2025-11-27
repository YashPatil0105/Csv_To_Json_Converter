const express = require('express');
const { runImport } = require('../importServices');

const router = express.Router();

router.post('/import', async (req, res) => {

    try{
        const filePath = req.query.filePath || (req.body && req.body.filePath);
        const stats = await runImport(filePath);

        res.json({
            message : 'Import completed successfully.',
            stats,
        });
    
    } catch(err){
        console.error('Import error:', err);
        res.status(500).json({
            error : 'Import failed.',
            details : err.message,
        });
    }
});

module.exports = router;