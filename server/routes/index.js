const express = require('express')
const router = express.Router();

// Comunicate with the database
const {db} = require( "../db/connection.js");

/*
 ***************************************ROUTES***************************************
*/

// Index
router.get('/', (req, res) => {
    res.send('Hello World!')
});

module.exports =  router;