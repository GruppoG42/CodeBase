// Load environment variables
require("./loadEnvironment.js");

const express = require('express')
const usersRouting = require("./routes/users.js");
const authRouting = require("./routes/auth.js");
const indexRouting = require("./routes/index.js");

const app = express()
const port = process.env.PORT || 3000

// Load routes
app.use('/', indexRouting);
app.use('/auth', authRouting);
app.use('/users', usersRouting);

app.listen(port, () => {
    console.log(`Example app listening on port http://localhost:${process.env.PORT}!`)
})