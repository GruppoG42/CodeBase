const router = require('express').Router();

const db = require('../script/dbController.js');
const itinerarioManager = require('../managers/itinerarioManager.js');
const giornoManager = require('../managers/giornoManager.js');
const tappaManager = require('../managers/tappaManager.js');
const tripplerManager = require('../managers/tripplerManager.js');
const userManager = require('../managers/userManager.js');

/*
 ***************************************ROUTES***************************************
*/

//ITINERARY

// Get all user itineraries
router.get('/getUserItineraries', async (req, res) => {
// router.get('/getUserItineraries',async (req, res) => {
    try {
        if (!(await checkUser(req))) {
            res.status(403).json({ error: 'User not found' });
            return;
        }
        const userId = req.header('userId');
        const userItineraries = await itinerarioManager.getUserItineraries(userId);

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
        const time = await giornoManager.calcolaTempoPercorrenza(idItinerario);
        res.json(time);
    } catch (error) {
        res.status(500).send('Internal Server Error ' + error);
    }
});

//recensisci
router.post('/reviewItinerary', async (req, res) => {
    try {
        if (!(await checkUser(req))) {
            res.status(403).json({ error: 'User not found' });
            return;
        }
        const idItinerario = req.body.idItinerario;
        const recensione = req.body.recensione;
        const punteggio = req.body.punteggio;
        const recensisci = await itinerarioManager.recensisci(idItinerario, recensione, punteggio);
        res.json(recensisci);
    } catch (error) {
        res.status(500).send('Internal Server Error');
    }
});

//aggiungi giorno
router.post('/addDay', async (req, res) => {
    try {
        if (!(await checkUser(req))) {
            res.status(403).json({ error: 'User not found' });
            return;
        }
        const idItinerario = req.body.idItinerario;
        const giorno = req.body.giorno;
        const aggiungiGiorno = await itinerarioManager.aggiungiGiorno(idItinerario, giorno);
        res.json(aggiungiGiorno);
    } catch (error) {
        res.status(500).send('Internal Server Error');
    }
});

//contiene giorno
router.get('/containsDay', async (req, res) => {
    try {
        if (!(await checkUser(req))) {
            res.status(403).json({ error: 'User not found' });
            return;
        }
        const idItinerario = req.query.idItinerario;
        const giorno = req.query.giorno;
        const contieneGiorno = await itinerarioManager.contieneGiorno(giorno, idItinerario);
        res.json(contieneGiorno);
    } catch (error) {
        res.status(500).send('Internal Server Error');
    }
});

//cerca itinerari
router.get('/searchItineraries', async (req, res) => {
    try {
        const { state, name, duration } = req.query;
        const itineraries = await itinerarioManager.cercaItinerari(state, name, duration);
        res.json(itineraries);
    } catch (error) {
        res.status(500).json({ error: error.toString() });
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
        if (!(await checkUser(req))) {
            res.status(403).json({ error: 'User not found' });
            return;
        }
        const userId = req.header('userId')
        const nome = req.body.nome;
        const stato = req.body.stato;
        const giorni = req.body.giorni;
        let recensioni = req.body.recensioni;
        const descrizione = req.body.descrizione;
        let attivo = req.body.attivo;
        if(!nome) {
            res.status(400).send('Bad Request: nome is required');
            return;
        }
        if(!stato) {
            res.status(400).send('Bad Request: stato is required');
            return;
        }
        if(!giorni) {
            res.status(400).send('Bad Request: giorni is required');
            return;
        }
        if(!recensioni) {
            recensioni = [];
        }
        if(!descrizione) {
            res.status(400).send('Bad Request: descrizione is required');
            return;
        }
        if(!attivo) {
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
        res.json(newItinerary);
    } catch (error) {
        console.error('Error creating new itinerary:', error);
        res.status(500).send('Internal Server Error');
    }
});

// get user itineraries
router.get('/getUserItineraries', async (req, res) => {
    try {
        if (!(await checkUser(req))) {
            res.status(403).json({ error: 'User not found' });
            return;
        }
        const userId = req.header('userId');
        const userItineraries = await itinerarioManager.getUserItineraries(userId);
        res.json(userItineraries);
    } catch (error) {
        console.error('Error fetching user itineraries:', error);
        res.status(500).send('Internal Server Error');
    }
});

// get all itineraries
router.get('/getCommunityItineraries', async (req, res) => {
    try {
        if (!(await checkUser(req))) {
            res.status(403).json({ error: 'User not found' });
            return;
        }
        const userId = req.header('userId');
        const allItineraries = await itinerarioManager.getCommunityItineraries(userId);
        res.json(allItineraries);
    } catch (error) {
        console.error('Error fetching all itineraries:', error);
        res.status(500).send('Internal Server Error');
    }
});

// END ITINERARY

// TRIPPLER

// Create a new user
router.post('/createUser', async (req, res) => {
    try {
        const userData = req.body;
        const nome = userData.nome;
        const cognome = userData.cognome;
        const email = userData.email;
        if (!nome || !cognome || !email) {
            res.status(400).send('Bad Request');
            return;
        }
        const newUser = await tripplerManager.createUser(nome, cognome, email);
        res.json(newUser);
    } catch (error) {
        console.error('Error creating new user:', error);
        res.status(500).send('Internal Server Error');
    }
});

// elimina itinerario
router.delete('/eliminaItinerario', async (req, res) => {
    try {
        if (!(await checkUser(req))) {
            res.status(403).json({ error: 'User not found' });
            return;
        }
        const idItinerario = req.query.idItinerario;
        const eliminaItinerario = await tripplerManager.eliminaItinerario(idItinerario);
        res.json(eliminaItinerario);
    } catch (error) {
        res.status(500).send('Internal Server Error');
    }
});

// visualizza itinerari
router.get('/visualizzaItinerari', async (req, res) => {
    try {
        if (!(await checkUser(req))) {
            res.status(403).json({ error: 'User not found' });
            return;
        }
        const userId = req.header('userId');
        const itinerari = await tripplerManager.visualizzaItinerari(userId);
        res.json(itinerari);
    } catch (error) {
        res.status(500).send('Internal Server Error');
    }
});

router.delete('/deleteUser', async (req, res) => {
    try {
        const userId = req.header('userId');
        if (!userId) {
            res.status(400).send('Bad Request: userId is required');
            return;
        }
        if (!(await checkUser(req))) {
            res.status(403).json({ error: 'User not found' });
            return;
        }
        const deleteUser = await userManager.deleteUser(userId);
        const itinerari = await itinerarioManager.deleteItineraries(userId);
        res.json({ user: deleteUser, itinerari });
    } catch (error) {
        res.status(500).send('Internal Server Error');
    }
});

router.get('/getSavedItineriesById', async (req, res) => {
    try {
        const userId = req.header('userId');
        if (!userId) {
            res.status(400).send('Bad Request: userId is required');
            return;
        }
        if (!(await checkUser(req))) {
            res.status(403).json({ error: 'User not found' });
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
            res.status(403).json({ error: 'User not found' });
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
            res.status(403).json({ error: 'User not found' });
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
            res.status(403).json({ error: 'User not found' });
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

// END TRIPPLER

// DAY

//aggiungi tappa
router.post('/addStop', async (req, res) => {
    try {
        if (!(await checkUser(req))) {
            res.status(403).json({ error: 'User not found' });
            return;
        }
        const idItinerario = req.body.idItinerario;
        const giorno = req.body.giorno;
        const tappa = req.body.tappa;
        const aggiungiTappa = await giornoManager.aggiungiTappa(idItinerario, giorno, tappa);
        res.json(aggiungiTappa);
    } catch (error) {
        res.status(500).send('Internal Server Error');
    }
});

//elimina tappa
router.delete('/deleteStop', async (req, res) => {
    try {
        if (!(await checkUser(req))) {
            res.status(403).json({ error: 'User not found' });
            return;
        }
        const idItinerario = req.body.idItinerario;
        const giorno = req.body.giorno;
        const tappa = req.body.tappa;
        const eliminaTappa = await giornoManager.eliminaTappa(idItinerario, giorno, tappa);
        res.json(eliminaTappa);
    } catch (error) {
        res.status(500).send('Internal Server Error');
    }
});

//elimina tappa id
router.delete('/deleteStopId', async (req, res) => {
    try {
        if (!(await checkUser(req))) {
            res.status(403).json({ error: 'User not found' });
            return;
        }
        const idItinerario = req.body.idItinerario;
        const giorno = req.body.giorno;
        const idTappa = req.body.idTappa;
        const eliminaTappaId = await giornoManager.eliminaTappaId(idItinerario, giorno, idTappa);
        res.json(eliminaTappaId);
    } catch (error) {
        res.status(500).send('Internal Server Error');
    }
});

//riposiziona tappa
router.put('/replaceStop', async (req, res) => {
    try {
        if (!(await checkUser(req))) {
            res.status(403).json({ error: 'User not found' });
            return;
        }
        const idItinerario = req.body.idItinerario;
        const giorno = req.body.giorno;
        const indice = req.body.indice;
        const tappa = req.body.tappa;
        const ripiazzaTappa = await  giornoManager.ripiazzaTappa(idItinerario, giorno, indice, tappa);
        res.json(ripiazzaTappa);
    } catch (error) {
        res.status(500).send('Internal Server Error');
    }
});

//calcola distanza idItinerario, giorno, mezzo
router.get('/calcDistance', async (req, res) => {
    try {
        if (!(await checkUser(req))) {
            res.status(403).json({ error: 'User not found' });
            return;
        }
        const idItinerario = req.query.idItinerario;
        const giorno = req.query.giorno;
        const mezzo = req.query.mezzo;
        const calcolaDistanza = await giornoManager.calcolaDistanza(idItinerario, giorno, mezzo);
        res.json(calcolaDistanza);
    } catch (error) {
        res.status(500).send('Internal Server Error ' + error);
    }
});

//calcola percorso idItinerario, giorno mezzo
router.get('/calcPath', async (req, res) => {
    try {
        const idItinerario = req.query.idItinerario;
        const giorno = req.query.giorno;
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
        const totalPath = await giornoManager.calcolaPercorsoTotale(idItinerario);
        res.json(totalPath);
    } catch (error) {
        res.status(500).send('Internal Server Error');
    }
});


// END DAY

// STOP

// END STOP


function checkUser(req) {
    try {
        const userId = req.header('userId');
        if(!userId) {
            return false;
        }
        return userManager.checkUser(userId);
    } catch (error) {
        return false;
    }
}

module.exports = router;