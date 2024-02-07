/**
 * @swagger
 * tags:
 *  - name: Itinerario
 *    description: Itinerario API
 *  - name: Trippler
 *    description: Trippler API
 *  - name: Giorno
 *    description: Giorno API
 *  - name: Tappa
 *    description: Tappa API
 *
 */

const router = require('express').Router();

const itinerarioManager = require('../managers/itinerarioManager.js');
const giornoManager = require('../managers/giornoManager.js');
const tappaManager = require('../managers/tappaManager.js');
const tripplerManager = require('../managers/tripplerManager.js');
const userManager = require('../managers/userManager.js');
const {dbtest} = require("../db/connection");
const {requiresAuth} = require("express-openid-connect");

const NodeCache = require('node-cache');
const myCache = new NodeCache({stdTTL: 60, checkperiod: 120});


/*
 ***************************************ROUTES***************************************
*/

//ITINERARY

// Get all user itineraries
/**
 * @swagger
 * /api/getUserItineraries:
 *  get:
 *    summary: Get all user itineraries
 *    description: Get all itineraries created by the user
 *    tags: [Itinerario]
 *    parameters:
 *      - in: header
 *        name: userId
 *        schema:
 *          type: string
 *        required: true
 *        description: The user ID
 *    responses:
 *      '200':
 *        description: A list of itineraries
 *        content:
 *          application/json:
 *            schema:
 *              type: array
 *              items:
 *                  $ref: 'components/schemas/Itinerario'
 *      '400':
 *        description: Bad Request, userId is required
 *      '404':
 *        description: User not found
 *      '500':
 *        description: Internal Server Error
 */
router.get('/getUserItineraries', async (req, res) => {
    try {
        const userId = req.header('userId');
        if (!userId) {
            res.status(400).send('Bad Request: userId are required');
            return;
        }
        if (!(await checkUser(req))) {
            res.status(404).json({error: 'User not found'});
            return;
        }
        const userItineraries = await tripplerManager.getUserItineraries(userId);

        res.status(200).json(userItineraries);
    } catch (error) {
        console.error('Error fetching user itineraries:', error);
        res.status(500).send('Internal Server Error');
    }
});

//calc time
/**
 * @swagger
 * /api/calcTimeItinerary:
 *  get:
 *    summary: Calculate the time for an itinerary
 *    description: Calculate the time for an itinerary based on the id provided
 *    tags: [Itinerario]
 *    parameters:
 *      - in: query
 *        name: idItinerario
 *        schema:
 *          type: string
 *        required: true
 *        description: The itinerary ID
 *    responses:
 *      '200':
 *        description: The calculated time
 *      '400':
 *        description: Bad Request, idItinerario is required
 *      '404':
 *        description: Itinerary not found
 *      '500':
 *        description: Internal Server Error
 */
router.get('/calcTimeItinerary', async (req, res) => {
    try {
        const idItinerario = req.query.idItinerario;
        if (!idItinerario) {
            res.status(400).send('Bad Request: idItinerario are required');
            return;
        }
        if (!(await checkItinerary(idItinerario))) {
            res.status(404).json({error: 'Itinerary not found'});
            return;
        }
        const time = await giornoManager.calcolaTempoPercorrenza(idItinerario);
        res.status(200).json(time);
    } catch (error) {
        res.status(500).send('Internal Server Error ' + error);
    }
});

//recensisci
/**
 * @swagger
 * /api/reviewItinerary:
 *  post:
 *    summary: Add a review to an itinerary
 *    description: Add a review to an itinerary based on the id provided
 *    tags: [Itinerario]
 *    consumes:
 *      - application/json
 *    parameters:
 *      - in: header
 *        name: userId
 *        schema:
 *          type: string
 *        required: true
 *        description: The user ID
 *      - in: body
 *        name: idItinerario
 *        schema:
 *          type: string
 *        required: true
 *        description: The itinerary ID
 *        example: "60b3e3e3e4b0e3e3e4b0e3e3"
 *      - in: body
 *        name: reviewText
 *        schema:
 *          type: string
 *        required: true
 *        description: The itinerary ID
 *        example: "This itinerary is amazing!"
 *      - in: body
 *        name: rating
 *        schema:
 *          type: number
 *        required: true
 *        description: The rating
 *        example: 5
 *    responses:
 *      '200':
 *        description: The review has been added
 *      '400':
 *        description: Bad Request, userId, idItinerario, reviewText and rating are required
 *      '404':
 *        description: User or Itinerary not found
 *      '500':
 *        description: Internal Server Error
 */
router.post('/reviewItinerary', async (req, res) => {
    try {
        const userId = req.header('userId');
        const idItinerario = req.body.idItinerario;
        const recensione = req.body.reviewText;
        const punteggio = req.body.rating;
        if (!userId || !idItinerario || !recensione || !punteggio) {
            res.status(400).send('Bad Request: userId, idItinerario, recensione and punteggio are required');
            return;
        }
        if (!(await checkUser(req))) {
            console.error('User not found')
            res.status(404).json({error: 'User not found'});

            return;
        }
        if (!(await checkItinerary(idItinerario))) {
            res.status(404).json({error: 'Itinerary not found'});
            return;
        }

        const recensisci = await itinerarioManager.saveReview(idItinerario, userId, recensione, punteggio);
        res.status(200).json(recensisci);
    } catch (error) {
        console.error('Error saving review:', error);
        res.status(500).send('Internal Server Error: ' + error);
    }
});

/**
 * @swagger
 * /api/getItineraryReview:
 *  get:
 *    summary: Get reviews for an itinerary
 *    description: Get all reviews for an itinerary based on the id provided
 *    tags: [Itinerario]
 *    parameters:
 *      - in: header
 *        name: userId
 *        schema:
 *          type: string
 *        required: true
 *        description: The user ID
 *      - in: query
 *        name: idItinerario
 *        schema:
 *          type: string
 *        required: true
 *        description: The itinerary ID
 *    responses:
 *      '200':
 *        description: A list of reviews
 *      '400':
 *        description: Bad Request, userId and idItinerario are required
 *      '404':
 *        description: User or Itinerary not found
 *      '500':
 *        description: Internal Server Error
 */
router.get('/getItineraryReview', async (req, res) => {
    try {
        const userId = req.header('userId');
        const idItinerario = req.query.idItinerario;
        if (!userId || !idItinerario) {
            res.status(400).send('Bad Request: userId and idItinerario are required');
            return;
        }
        if (!(await checkItinerary(idItinerario))) {
            res.status(404).json({error: 'Itinerary not found'});
            return;
        }
        if (!(await checkUser(req))) {
            console.error('User not found')
            res.status(404).json({error: 'User not found'});
            return;
        }

        const reviews = await itinerarioManager.getItineraryReview(idItinerario, req.header('userId'));
        if (!reviews) {
            res.json({}); // empty object
            return;
        }
        res.status(200).json(reviews);
    } catch (error) {
        res.status(500).send('Internal Server Error');
    }
});

//aggiungi giorno
/**
 * @swagger
 * /api/addDay:
 *  post:
 *    summary: Add a day to an itinerary
 *    description: Add a day to an itinerary based on the id provided
 *    tags: [Giorno]
 *    parameters:
 *      - in: header
 *        name: userId
 *        schema:
 *          type: string
 *        required: true
 *        description: The user ID
 *      - in: body
 *        name: body
 *        description: The details of the day to be added
 *        required: true
 *        schema:
 *          type: object
 *          properties:
 *            idItinerario:
 *              type: string
 *            giorno:
 *              type: object
 *    responses:
 *      '200':
 *        description: The day has been added
 *      '400':
 *        description: Bad Request, userId, idItinerario and giorno are required
 *      '404':
 *        description: User or Itinerary not found
 *      '500':
 *        description: Internal Server Error
 */
router.post('/addDay', async (req, res) => {
    try {
        const idItinerario = req.body.idItinerario;
        const giorno = req.body.giorno;
        if (!idItinerario || !giorno) {
            res.status(400).send('Bad Request: idItinerario and giorno are required');
            return;
        }
        if (!(await checkItinerary(idItinerario))) {
            res.status(404).json({error: 'Itinerary not found'});
            return;
        }
        if (!(await checkUser(req))) {
            res.status(404).json({error: 'User not found'});
            return;
        }

        const aggiungiGiorno = await itinerarioManager.aggiungiGiorno(idItinerario, giorno);
        res.status(200).json(aggiungiGiorno);
    } catch (error) {
        console.error('Error adding day:', error);
        res.status(500).send('Internal Server Error: ' + error);
    }
});

//contiene giorno
/**
 * @swagger
 * /api/containsDay:
 *  get:
 *    summary: Check if a day is in an itinerary
 *    description: Check if a day is in an itinerary based on the id provided
 *    tags: [Giorno]
 *    parameters:
 *      - in: header
 *        name: userId
 *        schema:
 *          type: string
 *        required: true
 *        description: The user ID
 *      - in: query
 *        name: idItinerario
 *        schema:
 *          type: string
 *        required: true
 *        description: The itinerary ID
 *      - in: query
 *        name: giorno
 *        schema:
 *          type: string
 *        required: true
 *        description: The day
 *    responses:
 *      '200':
 *        description: A boolean indicating if the day is in the itinerary
 *      '400':
 *        description: Bad Request, userId, idItinerario and giorno are required
 *      '404':
 *        description: User or Itinerary not found
 *      '500':
 *        description: Internal Server Error
 */
router.get('/containsDay', async (req, res) => {
    try {
        const idItinerario = req.query.idItinerario;
        const giorno = req.query.giorno;

        if (!idItinerario || !giorno) {
            res.status(400).send('Bad Request: idItinerario and giorno are required');
            return;
        }
        if (!(await checkItinerary(idItinerario))) {
            res.status(404).json({error: 'Itinerary not found'});
            return;
        }
        if (!(await checkUser(req))) {
            res.status(404).json({error: 'User not found'});
            return;
        }

        const contieneGiorno = await itinerarioManager.contieneGiorno(giorno, idItinerario);
        res.status(200).json(contieneGiorno);
    } catch (error) {
        console.log(error);
        res.status(500).send('Internal Server Error: ' + error);
    }
});

//cerca itinerari
/**
 * @swagger
 * /api/searchItineraries:
 *  get:
 *    summary: Search for itineraries
 *    description: Search for itineraries based on the state, name, and duration
 *    tags: [Itinerario]
 *    parameters:
 *      - in: query
 *        name: state
 *        schema:
 *          type: string
 *        description: The state
 *      - in: query
 *        name: name
 *        schema:
 *          type: string
 *        description: The name
 *      - in: query
 *        name: duration
 *        schema:
 *          type: string
 *        description: The duration
 *    responses:
 *      '200':
 *        description: A list of itineraries
 *      '500':
 *        description: Internal Server Error
 */
router.get('/searchItineraries', async (req, res) => {
    try {
        const {state, name, duration} = req.query;
        const itineraries = await itinerarioManager.cercaItinerari(state, name, duration);
        console.log(itineraries)
        res.json(itineraries);
    } catch (error) {
        res.status(500).json({error: error.toString()});
    }
});

// Create a new itinerary
/**
 * @swagger
 * /api/createItinerary:
 *  post:
 *    summary: Create a new itinerary
 *    description: Create a new itinerary with the provided details
 *    tags: [Itinerario]
 *    parameters:
 *      - in: header
 *        name: userId
 *        schema:
 *          type: string
 *        required: true
 *        description: The user ID
 *      - in: body
 *        name: nome
 *        schema:
 *          type: string
 *        required: true
 *        description: The name of the itinerary
 *      - in: body
 *        name: stato
 *        schema:
 *          type: string
 *        required: true
 *        description: The state of the itinerary
 *      - in: body
 *        name: descrizione
 *        schema:
 *          type: string
 *        required: true
 *        description: The description of the itinerary
 *      - in: body
 *        name: giorni
 *        schema:
 *          type: string
 *        description: The days of the itinerary as a stringified JSON object
 *        required: true
 *      - in: body
 *        name: recensioni
 *        schema:
 *          type: string
 *        description: The reviews of the itinerary as a stringified JSON array
 *        required: true
 *    responses:
 *      '200':
 *        description: The created itinerary
 *      '400':
 *        description: Bad Request, userId, nome, stato, descrizione, giorni, recensioni are required
 *      '404':
 *        description: User not found
 *      '500':
 *        description: Internal Server Error
 */
router.post('/createItinerary', async (req, res) => {
    try {
        const userId = req.header('userId')
        if (!userId) {
            res.status(400).send('Bad Request: userId is required');
            return;
        }
        if (!(await checkUser(req))) {
            res.status(404).json({error: 'User not found'});
            return;
        }
        const nome = req.body.nome;
        const stato = req.body.stato;
        const giorni = req.body.giorni;
        let recensioni = req.body.recensioni;
        const descrizione = req.body.descrizione;
        let attivo = req.body.attivo;
        if (!nome || !stato || !giorni || !descrizione) {
            res.status(400).send('Bad Request: nome, stato, giorni, and descrizione are required');
            return;
        }
        if (!recensioni) {
            recensioni = [];
        }
        if (!attivo) {
            attivo = true;
        }
        const itineraryData = {
            nome,
            stato,
            giorni,
            recensioni,
            descrizione,
            attivo
        };
        const newItinerary = await itinerarioManager.createItinerary({
            ...itineraryData,
            _userId: userId
        });
        res.status(200).json(newItinerary);
    } catch (error) {
        console.error('Error creating new itinerary:', error);
        res.status(500).send('Internal Server Error');
    }
});

// get all itineraries
/**
 * @swagger
 * /api/getCommunityItineraries:
 *  get:
 *    summary: Get all community itineraries
 *    description: Get all itineraries created by the community
 *    tags: [Itinerario]
 *    parameters:
 *      - in: header
 *        name: userId
 *        schema:
 *          type: string
 *        required: true
 *        description: The user ID
 *    responses:
 *      '200':
 *        description: A list of itineraries
 *      '400':
 *        description: Bad Request, userId is required
 *      '404':
 *        description: User not found
 *      '500':
 *        description: Internal Server Error
 */
router.get('/getCommunityItineraries', async (req, res) => {
    try {
        const userId = req.header('userId');
        if (!userId) {
            res.status(400).send('Bad Request: userId is required');
            return;
        }
        if (!(await checkUser(req))) {
            res.status(404).json({error: 'User not found'});
            return;
        }
        const allItineraries = await itinerarioManager.getCommunityItineraries(userId);
        res.status(200).json(allItineraries);
    } catch (error) {
        console.error('Error fetching all itineraries:', error);
        res.status(500).send('Internal Server Error');
    }
});

// END ITINERARY

// TRIPPLER

// elimina itinerario
/**
 * @swagger
 * /api/deleteItinerary:
 *  delete:
 *    summary: Delete an itinerary
 *    description: Delete an itinerary based on the id provided
 *    tags: [Trippler]
 *    parameters:
 *      - in: header
 *        name: userId
 *        schema:
 *          type: string
 *        required: true
 *        description: The user ID
 *      - in: body
 *        name: idItinerario
 *        schema:
 *          type: string
 *        required: true
 *        description: The itinerary ID
 *    responses:
 *      '200':
 *        description: The itinerary has been deleted
 *      '400':
 *        description: Bad Request, userId and idItinerario are required
 *      '404':
 *        description: User or Itinerary not found
 *      '500':
 *        description: Internal Server Error
 */
router.delete('/deleteItinerary', async (req, res) => {
    try {
        const userId = req.header('userId');
        const idItinerario = req.query.idItinerario;
        if (!userId || !idItinerario) {
            res.status(400).send('Bad Request: userId and idItinerario are required');
            return;
        }
        if (!(await checkItinerary(idItinerario))) {
            res.status(404).json({error: 'Itinerary not found'});
            return;
        }
        if (!(await checkUser(req))) {
            res.status(404).json({error: 'User not found'});
            return;
        }
        const eliminaItinerario = await tripplerManager.eliminaItinerario(idItinerario);
        res.json(eliminaItinerario);
    } catch (error) {
        res.status(500).send('Internal Server Error');
    }
});

//get user
/**
 * @swagger
 * /api/getUser:
 *  get:
 *    summary: Get user details
 *    description: Get details of the user based on the id provided
 *    tags: [Trippler]
 *    parameters:
 *      - in: header
 *        name: userId
 *        schema:
 *          type: string
 *        required: true
 *        description: The user ID
 *    responses:
 *      '200':
 *        description: User details
 *      '400':
 *        description: Bad Request, userId is required
 *      '404':
 *        description: User not found
 *      '500':
 *        description: Internal Server Error
 */
router.get('/getUser', requiresAuth(), async (req, res) => {
    try {
        const userId = req.oidc.user.sub;
        const user = await userManager.getUser(userId);
        res.json(user);
    } catch (error) {
        res.status(500).send('Internal Server Error');
    }
});

/**
 * @swagger
 * /api/deleteUser:
 *  delete:
 *    summary: Delete a user
 *    description: Delete a user based on the id provided
 *    tags: [Trippler]
 *    parameters:
 *      - in: header
 *        name: userId
 *        schema:
 *          type: string
 *        required: true
 *        description: The user ID
 *    responses:
 *      '200':
 *        description: The user has been deleted
 *      '400':
 *        description: Bad Request, userId is required
 *      '404':
 *        description: User not found
 *      '500':
 *        description: Internal Server Error
 */
router.delete('/deleteUser', requiresAuth(), async (req, res) => {
    try {
        const userId = req.oidc.user.sub;
        const deleteUser = await userManager.deleteUser(userId);
        const deleteItineraries = await itinerarioManager.deleteItineraries(userId);
        const deleteSaved = await tripplerManager.deleteSaved(userId);
        res.json({user: deleteUser, deleteItineraries, deleteSaved});
    } catch (error) {
        res.status(500).send('Internal Server Error');
    }
});

/**
 * @swagger
 * /api/getSavedItineraries:
 *  get:
 *    summary: Get saved itineraries for a user
 *    description: Get all saved itineraries for a user based on the id provided
 *    tags: [Trippler]
 *    parameters:
 *      - in: header
 *        name: userId
 *        schema:
 *          type: string
 *        required: true
 *        description: The user ID
 *    responses:
 *      '200':
 *        description: A list of saved itineraries
 *      '400':
 *        description: Bad Request, userId is required
 *      '404':
 *        description: User not found
 *      '500':
 *        description: Internal Server Error
 */
router.get('/getSavedItineraries', async (req, res) => {
    try {
        const userId = req.header('userId');
        if (!userId) {
            res.status(400).send('Bad Request: userId is required');
            return;
        }
        if (!(await checkUser(req))) {
            res.status(404).json({error: 'User not found'});
            return;
        }
        const itineraries = await tripplerManager.getSavedItineriesById(userId);
        res.status(200).json(itineraries);
    } catch (error) {
        console.error(`Error fetching saved itineraries by id: ${error}`);
        res.status(500).send('Internal Server Error');
    }
});

/**
 * @swagger
 * /api/isSavedItinerary:
 *  get:
 *    summary: Check if an itinerary is saved by a user
 *    description: Check if an itinerary is saved by a user based on the user ID and itinerary ID provided
 *    tags: [Trippler]
 *    parameters:
 *      - in: header
 *        name: userId
 *        schema:
 *          type: string
 *        required: true
 *        description: The user ID
 *      - in: query
 *        name: itineraryId
 *        schema:
 *          type: string
 *        required: true
 *        description: The itinerary ID
 *    responses:
 *      '200':
 *        description: A boolean indicating if the itinerary is saved by the user
 *      '400':
 *        description: Bad Request, userId and itineraryId are required
 *      '404':
 *        description: User or Itinerary not found
 *      '500':
 *        description: Internal Server Error
 */
router.get('/isSavedItinerary', async (req, res) => {
    try {
        const userId = req.header('userId');
        const itineraryId = req.query.itineraryId;
        if (!userId || !itineraryId) {
            res.status(400).send('Bad Request: userId and itineraryId are required');
            return;
        }
        if (!(await checkUser(req))) {
            res.status(404).json({error: 'User not found'});
            return;
        }
        const isSaved = await tripplerManager.isSavedItinerary(userId, itineraryId);
        res.status(200).json(isSaved);
    } catch (error) {
        console.error(`Error checking if itinerary is saved: ${error}`);
        res.status(500).send('Internal Server Error');
    }
});

/**
 * @swagger
 * /api/addItineraryToSaved:
 *  patch:
 *    summary: Add an itinerary to the saved list of a user
 *    description: Add an itinerary to the saved list of a user based on the user ID and itinerary ID provided
 *    tags: [Trippler]
 *    parameters:
 *      - in: header
 *        name: userId
 *        schema:
 *          type: string
 *        required: true
 *        description: The user ID
 *      - in: body
 *        name: itineraryId
 *        schema:
 *         type: string
 *        required: true
 *        description: The itinerary ID
 *    responses:
 *      '200':
 *        description: The itinerary has been added to the saved list
 *      '400':
 *        description: Bad Request, userId and itineraryId are required
 *      '404':
 *        description: User or Itinerary not found
 *      '500':
 *        description: Internal Server Error
 */
router.patch('/addItineraryToSaved', async (req, res) => {
    try {
        const userId = req.header('userId');
        const itineraryId = req.body.itineraryId;
        if (!userId || !itineraryId) {
            res.status(400).send('Bad Request: userId and itineraryId are required');
            return;
        }
        if (!(await checkUser(req))) {
            res.status(404).json({error: 'User not found'});
            return;
        }
        if (await tripplerManager.isSavedItinerary(userId, itineraryId)) {
            console.log("Itinerary already saved: " + userId + " " + itineraryId);
            res.status(400).send('Itinerary already saved');
            return;
        }
        const result = await tripplerManager.addItineraryToSaved(userId, itineraryId);
        res.status(200).json(result);
    } catch (error) {
        console.error(`Error adding itinerary to saved: ${error}`);
        res.status(500).send('Internal Server Error');
    }
});

/**
 * @swagger
 * /api/removeItineraryFromSaved:
 *  patch:
 *    summary: Remove an itinerary from the saved list of a user
 *    description: Remove an itinerary from the saved list of a user based on the user ID and itinerary ID provided
 *    tags: [Trippler]
 *    parameters:
 *      - in: header
 *        name: userId
 *        schema:
 *          type: string
 *        required: true
 *        description: The user ID
 *      - in: body
 *        name: itineraryId
 *        schema:
 *         type: string
 *        required: true
 *        description: The itinerary ID
 *    responses:
 *      '200':
 *        description: The itinerary has been removed from the saved list
 *      '400':
 *        description: Bad Request, userId and itineraryId are required
 *      '404':
 *        description: User or Itinerary not found
 *      '500':
 *        description: Internal Server Error
 */
router.patch('/removeItineraryFromSaved', async (req, res) => {
    try {
        const userId = req.header('userId');
        const itineraryId = req.body.itineraryId;
        if (!userId || !itineraryId) {
            res.status(400).send('Bad Request: userId and itineraryId are required');
            return;
        }
        if (!(await checkUser(req))) {
            res.status(404).json({error: 'User not found'});
            return;
        }
        if (!(await tripplerManager.isSavedItinerary(userId, itineraryId))) {
            console.log(userId, itineraryId)
            res.status(400).send('Itinerary not saved');
            return;
        }
        const result = await tripplerManager.removeItineraryFromSaved(userId, itineraryId);
        res.status(200).json(result);
    } catch (error) {
        console.error(`Error removing itinerary from saved: ${error}`);
        res.status(500).send('Internal Server Error');
    }
});

/**
 * @swagger
 * /api/deleteSavedList:
 *  delete:
 *    summary: Delete the saved list of a user
 *    description: Delete the saved list of a user based on the user ID provided
 *    tags: [Trippler]
 *    parameters:
 *      - in: header
 *        name: userId
 *        schema:
 *          type: string
 *        required: true
 *        description: The user ID
 *    responses:
 *      '200':
 *        description: The saved list has been deleted
 *      '400':
 *        description: Bad Request, userId is required
 *      '404':
 *        description: User not found
 *      '500':
 *        description: Internal Server Error
 */
router.delete('/deleteSavedList', async (req, res) => {
    try {
        const userId = req.header('userId');
        if (!userId) {
            res.status(400).send('Bad Request: userId is required');
            return;
        }
        if (!(await checkUser(req))) {
            res.status(404).json({error: 'User not found'});
            return;
        }
        const result = await tripplerManager.deleteSaved(userId);
        res.status(200).json(result);
    } catch (error) {
        console.error(`Error deleting saved list: ${error}`);
        res.status(500).send('Internal Server Error');
    }
});

// END TRIPPLER

// DAY

//aggiungi tappa
/**
 * @swagger
 * /api/addStop:
 *  post:
 *    summary: Add a stop to a day in an itinerary
 *    description: Add a stop to a day in an itinerary based on the id provided
 *    tags: [Tappa]
 *    parameters:
 *      - in: header
 *        name: userId
 *        schema:
 *          type: string
 *        required: true
 *        description: The user ID
 *      - in: body
 *        name: idItinerario
 *        schema:
 *          type: string
 *        required: true
 *        description: The itinerary ID
 *      - in: body
 *        name: giorno
 *        schema:
 *          type: object
 *        required: true
 *        description: The day
 *      - in: body
 *        name: tappa
 *        schema:
 *          type: object
 *        required: true
 *        description: The stop
 *    responses:
 *      '200':
 *        description: The stop has been added
 *      '400':
 *        description: Bad Request, userId, idItinerario, giorno and tappa are required
 *      '404':
 *        description: User or Itinerary not found
 *      '500':
 *        description: Internal Server Error
 */
router.post('/addStop', async (req, res) => {
    try {
        const idItinerario = req.body.idItinerario;
        const giorno = req.body.giorno;
        const tappa = req.body.tappa;
        const userId = req.header('userId');
        if (!idItinerario || !giorno || !tappa || !userId) {
            res.status(400).send('Bad Request: idItinerario, giorno, tappa and userId are required');
            return;
        }
        if (!(await checkItinerary(idItinerario))) {
            res.status(404).json({error: 'Itinerary not found'});
            return;
        }
        if (!(await checkUser(req))) {
            res.status(404).json({error: 'User not found'});
            return;
        }

        const aggiungiTappa = await giornoManager.aggiungiTappa(idItinerario, giorno, tappa);
        res.status(200).json(aggiungiTappa);
    } catch (error) {
        res.status(500).send('Internal Server Error');
    }
});

//elimina tappa
/**
 * @swagger
 * /api/deleteStop:
 *  delete:
 *    summary: Delete a stop from a day in an itinerary
 *    description: Delete a stop from a day in an itinerary based on the id provided
 *    tags: [Tappa]
 *    parameters:
 *      - in: header
 *        name: userId
 *        schema:
 *          type: string
 *        required: true
 *        description: The user ID
 *      - in: query
 *        name: idItinerario
 *        schema:
 *          type: string
 *        required: true
 *        description: The itinerary ID
 *      - in: query
 *        name: giorno
 *        schema:
 *          type: string
 *        required: true
 *        description: The day
 *      - in: query
 *        name: tappa
 *        schema:
 *          type: string
 *        required: true
 *        description: The stop
 *    responses:
 *      '200':
 *        description: The stop has been deleted
 *      '400':
 *        description: Bad Request, userId, idItinerario, giorno and tappa are required
 *      '404':
 *        description: User, Itinerary or Stop not found
 *      '500':
 *        description: Internal Server Error
 */
router.delete('/deleteStop', async (req, res) => {
    try {
        const idItinerario = req.body.idItinerario;
        const giorno = req.body.giorno;
        const tappa = req.body.tappa;
        const userId = req.header('userId');
        if (!idItinerario || !giorno || !tappa || !userId) {
            res.status(400).send('Bad Request: idItinerario, giorno, tappa and userId are required');
            return;
        }
        if (!(await checkItinerary(idItinerario))) {
            res.status(404).json({error: 'Itinerary not found'});
            return;
        }
        if (!(await checkUser(req))) {
            res.status(404).json({error: 'User not found'});
            return;
        }
        const eliminaTappa = await giornoManager.eliminaTappa(idItinerario, giorno, tappa);
        res.status(200).json(eliminaTappa);
    } catch (error) {
        console.error('Error deleting stop:', error);
        res.status(500).send('Internal Server Error: ' + error);
    }
});

//riposiziona tappa
/**
 * @swagger
 * /api/replaceStop:
 *  put:
 *    summary: Replace a stop in a day in an itinerary
 *    description: Replace a stop in a day in an itinerary based on the id provided
 *    tags: [Tappa]
 *    parameters:
 *      - in: header
 *        name: userId
 *        schema:
 *          type: string
 *        required: true
 *        description: The user ID
 *      - in: body
 *        name: idItinerario
 *        schema:
 *          type: string
 *        required: true
 *        description: The itinerary ID
 *      - in: body
 *        name: giorno
 *        schema:
 *          type: integer
 *        required: true
 *        description: The day
 *      - in: body
 *        name: tappa
 *        schema:
 *          type: object
 *        required: true
 *        description: The stop
 *    responses:
 *      '200':
 *        description: The stop has been replaced
 *      '400':
 *        description: Bad Request, userId, idItinerario, giorno and tappa are required
 *      '404':
 *        description: User or Itinerary not found
 *      '500':
 *        description: Internal Server Error
 */
router.put('/replaceStop', async (req, res) => {
    try {
        if (!(await checkUser(req))) {
            res.status(404).json({error: 'User not found'});
            return;
        }
        const idItinerario = req.body.idItinerario;
        const giorno = req.body.giorno;
        const indice = req.body.indice;
        const tappa = req.body.tappa;
        const userId = req.header('userId');
        if (!idItinerario || !giorno || !tappa) {
            console.error('Bad Request: idItinerario: ' + idItinerario + ' giorno: ' + giorno + ' indice: ' + indice + ' tappa: ' + tappa + ' userId: ' + userId);
            res.status(400).send('Bad Request: idItinerario, giorno, indice, tappa and userId are required');
            return;
        }
        if (!(await checkItinerary(idItinerario))) {
            console.error('Itinerary not found')
            res.status(404).json({error: 'Itinerary not found'});
            return;
        }

        const ripiazzaTappa = await giornoManager.ripiazzaTappa(idItinerario, giorno, indice, tappa);
        res.status(200).json(ripiazzaTappa);
    } catch (error) {
        console.error('Error replacing stop:', error);
        res.status(500).send('Internal Server Error: ' + error);
    }
});

//calcola distanza idItinerario, giorno, mezzo
/**
 * @swagger
 * /api/calcDistance:
 *  get:
 *    summary: Calculate the distance for a day in an itinerary
 *    description: Calculate the distance for a day in an itinerary based on the id provided
 *    tags: [Giorno]
 *    parameters:
 *      - in: query
 *        name: idItinerario
 *        schema:
 *          type: string
 *        required: true
 *        description: The itinerary ID
 *      - in: query
 *        name: giorno
 *        schema:
 *          type: string
 *        required: true
 *        description: The day
 *      - in: query
 *        name: mezzo
 *        schema:
 *          type: string
 *        required: true
 *        description: The means of transport
 *    responses:
 *      '200':
 *        description: The calculated distance
 *      '400':
 *        description: Bad Request, idItinerario, giorno and mezzo are required
 *      '404':
 *        description: Itinerary or Day not found
 *      '500':
 *        description: Internal Server Error
 */
router.get('/calcDistance', async (req, res) => {
    try {
        const idItinerario = req.query.idItinerario;
        const giorno = req.query.giorno;
        const mezzo = req.query.mezzo;
        const userId = req.header('userId');
        if (!idItinerario || !giorno || !mezzo || !userId) {
            res.status(400).send('Bad Request: idItinerario, giorno, mezzo and userId are required');
            return;
        }
        if (!(await checkItinerary(idItinerario))) {
            res.status(404).json({error: 'Itinerary not found'});
            return;
        }
        if (!(await checkUser(req))) {
            res.status(404).json({error: 'User not found'});
            return;
        }

        const calcolaDistanza = await giornoManager.calcolaDistanza(idItinerario, giorno, mezzo);
        res.status(200).json(calcolaDistanza);
    } catch (error) {
        res.status(500).send('Internal Server Error ' + error);
    }
});

//calcola percorso idItinerario, giorno
/**
 * @swagger
 * /api/calcPath:
 *  get:
 *    summary: Calculate the path for a day in an itinerary
 *    description: Calculate the path for a day in an itinerary based on the id provided
 *    tags: [Giorno]
 *    parameters:
 *      - in: query
 *        name: idItinerario
 *        schema:
 *          type: string
 *        required: true
 *        description: The itinerary ID
 *      - in: query
 *        name: giorno
 *        schema:
 *          type: string
 *        required: true
 *        description: The day
 *    responses:
 *      '200':
 *        description: The calculated path
 *      '400':
 *        description: Bad Request, idItinerario and giorno are required
 *      '404':
 *        description: Itinerary or Day not found
 *      '500':
 *        description: Internal Server Error
 */
router.get('/calcPath', async (req, res) => {
    try {
        const idItinerario = req.query.idItinerario;
        const giorno = req.query.giorno;
        if (!idItinerario || !giorno) {
            res.status(400).send('Bad Request: idItinerario and giorno are required');
            return;
        }
        if (!(await checkItinerary(idItinerario))) {
            res.status(404).json({error: 'Itinerary not found'});
            return;
        }

        const calcolaPercorso = await giornoManager.calcolaPercorso(idItinerario, giorno);
        res.json(calcolaPercorso);
    } catch (error) {
        res.status(500).send('Internal Server Error');
    }
});

//total path
/**
 * @swagger
 * /api/totalPath:
 *  get:
 *    summary: Calculate the total path for an itinerary
 *    description: Calculate the total path for an itinerary based on the id provided
 *    tags: [Itinerario]
 *    parameters:
 *      - in: query
 *        name: idItinerario
 *        schema:
 *          type: string
 *        required: true
 *        description: The itinerary ID
 *    responses:
 *      '200':
 *        description: The total calculated path
 *      '400':
 *        description: Bad Request, idItinerario is required
 *      '404':
 *        description: Itinerary not found
 *      '500':
 *        description: Internal Server Error
 */
router.get('/totalPath', async (req, res) => {
    try {
        const idItinerario = req.query.idItinerario;
        if (!idItinerario) {
            res.status(400).send('Bad Request: idItinerario is required');
            return;
        }
        if (!(await checkItinerary(idItinerario))) {
            res.status(404).json({error: 'Itinerary not found'});
            return;
        }
        const totalPath = await giornoManager.calcolaPercorsoTotale(idItinerario);
        res.status(200).json(totalPath);
    } catch (error) {
        res.status(500).send('Internal Server Error');
    }
});


// END DAY

function checkUser(req) {
    try {
        const userId = req.header('userId');
        if (!userId) {
            return false;
        }
        if (myCache.has(userId)) {
            return true;
        }
        const user = userManager.checkUser(userId);
        // if (user) {
        //     myCache.set(userId, true);
        // }
        if (user) {
            myCache.set(userId, true);
            return true;
        } else {
            return false;
        }
    } catch (error) {
        return false;
    }
}

function checkItinerary(id) {
    try {
        return itinerarioManager.checkItinerary(id);
    } catch (error) {
        return false;
    }
}

module.exports = router;