const dbtest = require("../db/connection.js");
const {ObjectId} = require("mongodb");

const {ManagementClient} = require("auth0");
// const auth0 = require('auth0');

const managerClient = new ManagementClient({
    domain: 'tripply.eu.auth0.com',
    clientId: process.env.CLIENT_ID,
    // clientId: '6585973ade8145841246f7f4',
    clientSecret: process.env.SECRET,

    audience: 'https://tripply.eu.auth0.com/api/v2/'
});

// requiresAuth() 302 redirect to login page

//deleteUser
async function deleteUser(id) {
    try {
        // const user = await managerClient.getUser({ id: id });
        console.log('Deleting user:', id);
        const user = await managerClient.users.delete({id: id});
        console.log('User:', user);
        return user;
    } catch (error) {
        console.error('Error deleting user:', error);
        throw new Error(`Error deleting user: ${error}`);
    }
}

async function checkUser(id) {
    try {
        // const user = await managerClient.getUser({ id: id });
        const user = await managerClient.users.get({id: id});
        console.log('User:', user);
        // return !!user; // Returns true if user exists, false otherwise
        return user !== undefined;
    } catch (error) {
        console.error('Error checking user:', error);
        throw new Error(`Error checking user: ${error}`);
    }
}


module.exports = {
    checkUser,
    deleteUser
}