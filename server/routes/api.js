const router = require('express').Router();

const itinerarioManager = require('../managers/itinerarioManager.js');
const giornoManager = require('../managers/giornoManager.js');
const tappaManager = require('../managers/tappaManager.js');
const tripplerManager = require('../managers/tripplerManager.js');
const userManager = require('../managers/userManager.js');
const {dbtest} = require("../db/connection");
const {requiresAuth} = require("express-openid-connect");

/*
 ***************************************ROUTES***************************************
*/

//ITINERARY

// Get all user itineraries
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
router.get('/searchItineraries', async (req, res) => {
    try {
        const {state, name, duration} = req.query;
        if (!state && !name && !duration) {
            res.status(400).send('Bad Request: state, name or duration are required');
            return;
        }
        const itineraries = await itinerarioManager.cercaItinerari(state, name, duration);
        res.json(itineraries);
    } catch (error) {
        res.status(500).json({error: error.toString()});
    }
});

router.put('/updateActive', async (req, res) => {
    try {
        const idItinerario = req.body.idItinerario;
        const active = req.body.active;
        const updateActive = await itinerarioManager.aggiornaAttivo(idItinerario, active);
        res.json(updateActive);
    } catch (error) {
        res.status(500).send('Internal Server Error');
    }
});


// Create a new itinerary
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
            // console.log("attivo")
            // res.status(400).send('Bad Request: attivo is required');
            // return;
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
router.get('/getUser', requiresAuth(), async (req, res) => {
    try {
        const userId = req.oidc.user.sub;
        const user = await userManager.getUser(userId);
        res.json(user);
    } catch (error) {
        res.status(500).send('Internal Server Error');
    }
});


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

router.get('/getSavedItineries', async (req, res) => {
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
        res.status(500).send('Internal Server Error');
    }
});

//elimina tappa id
router.delete('/deleteStopId', async (req, res) => {
    try {
        const idItinerario = req.body.idItinerario;
        const giorno = req.body.giorno;
        const idTappa = req.body.idTappa;
        const userId = req.header('userId');
        if (!idItinerario || !giorno || !idTappa || !userId) {
            res.status(400).send('Bad Request: idItinerario, giorno, idTappa and userId are required');
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

        const eliminaTappaId = await giornoManager.eliminaTappaId(idItinerario, giorno, idTappa);
        res.status(200).json(eliminaTappaId);
    } catch (error) {
        res.status(500).send('Internal Server Error');
    }
});

//riposiziona tappa
router.put('/replaceStop', async (req, res) => {
    try {
        const idItinerario = req.body.idItinerario;
        const giorno = req.body.giorno;
        const indice = req.body.indice;
        const tappa = req.body.tappa;
        const userId = req.header('userId');
        if (!idItinerario || !giorno || !indice || !tappa || !userId) {
            res.status(400).send('Bad Request: idItinerario, giorno, indice, tappa and userId are required');
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

        const ripiazzaTappa = await giornoManager.ripiazzaTappa(idItinerario, giorno, indice, tappa);
        res.status(200).json(ripiazzaTappa);
    } catch (error) {
        res.status(500).send('Internal Server Error');
    }
});

//calcola distanza idItinerario, giorno, mezzo
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
        return userManager.checkUser(userId);
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