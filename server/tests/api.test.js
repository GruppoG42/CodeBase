const request = require('supertest');
const app = require('../routes/api.js');

require("../loadEnvironment.js");



describe('Itinerary API Tests', () => {
    test('POST /createItinerary - Creates a new itinerary', async () => {
        const itineraryData = {
            // Your itinerary data here
            // ...
        };

        const response = await request(app)
            .post('/createItinerary')
            .set('Authorization', 'Bearer your-access-token')  // Replace with a valid access token
            .send(itineraryData);

        expect(response.status).toBe(200);
        expect(response.body).toHaveProperty('_id');
        expect(response.body).toHaveProperty('yourOtherExpectedProperties');
    });

    test('GET /getUserItineraries - Gets user itineraries', async () => {
        const response = await request(app)
            .get('/getUserItineraries')
            .set('Authorization', 'Bearer your-access-token'); // Replace with a valid access token

        expect(response.status).toBe(200);
        expect(Array.isArray(response.body)).toBe(true);
    });
});
