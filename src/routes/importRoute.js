const express = require('express');
const { runImport } = require('../importServices');

const router = express.Router();

router.post('/import', async (req, res) => {

    try{
        const stats = await runImport();

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