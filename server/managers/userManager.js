const dbtest = require("../db/connection.js");
const {ObjectId} = require("mongodb");

const { ManagementClient } = require("auth0");
// const auth0 = require('auth0');




const managerClient = new ManagementClient({
    domain: 'tripply.eu.auth0.com',
    // clientId: process.env.CLIENT_ID,
    clientId: '6585973ade8145841246f7f4',
    clientSecret: process.env.SECRET,

    audience: 'https://tripply.eu.auth0.com/api/v2/'
});

// requiresAuth() 302 redirect to login page

async function createUser(email, password) {
    try {
        const user = await managerClient.createUser({
            connection: 'Username-Password-Authentication', // Replace with your connection type
            email: email,
            password: password,
        });

        console.log('User created successfully:', user);
        return user;
    } catch (error) {
        console.error('Error creating user:', error);
        throw error;
    }
}

async function checkUser(id) {
    try {
        // const user = await managerClient.getUser({ id: id });
        // return !!user; // Returns true if user exists, false otherwise
        return true;
    } catch (error) {
        throw new Error(`Error checking user: ${error}`);
    }
}


module.exports = {
    createUser,
    checkUser
}