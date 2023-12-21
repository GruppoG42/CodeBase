const express = require('express')
const router = express.Router();

/*
 ***************************************ROUTES***************************************
*/

// Index
router.get('/', (req, res) => {
    res.send('Hello World!')
});

module.exports =  router;