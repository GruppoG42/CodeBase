const router = require('express').Router();
const {requiresAuth} = require('express-openid-connect');

const db = require('../script/dbController.js');
const itinerarioManager = require('../managers/itinerarioManager.js');
const giornoManager = require('../managers/giornoManager.js');
const tappaManager = require('../managers/tappaManager.js');
const tripplerManager = require('../managers/tripplerManager.js');

/*
 ***************************************ROUTES***************************************
*/

//ITINERARY

// Get all user itineraries
router.get('/getUserItineraries', async (req, res) => {
// router.get('/getUserItineraries',async (req, res) => {
    try {
        if (!checkUser(req)) {
            res.status(401).send('Unauthorized');
            return;
        }
        const userId = req.header('userId');
        const userItineraries = await itinerarioManager.getUserItineraries(userId);
        res.json(userItineraries);
        res.status(200)
    } catch (error) {
        console.error('Error fetching user itineraries:', error);
        res.status(500).send('Internal Server Error');
    }
});

//calc time
router.get('/calcTimeItinerary', async (req, res) => {
    try {
        if (!checkUser(req)) {
            res.status(401).send('Unauthorized');
            return;
        }
        const startPoint = req.query.startPoint;
        const endPoint = req.query.endPoint;
        const mezzo = req.query.mezzo;
        console.log(startPoint, endPoint, mezzo);
        const time = await itinerarioManager.calcolaTempoPercorrenza(startPoint, endPoint, mezzo);
        res.json(time);
    } catch (error) {
        res.status(500).send('Internal Server Error: ' + error);
    }
});

//recensisci
router.post('/reviewItinerary', async (req, res) => {
    try {
        if (!checkUser(req)) {
            res.status(401).send('Unauthorized');
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
        if (!checkUser(req)) {
            res.status(401).send('Unauthorized');
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
        if (!checkUser(req)) {
            res.status(401).send('Unauthorized');
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
        if (!checkUser(req)) {
            res.status(401).send('Unauthorized');
            return;
        }
        const parameter = req.query.parameters;
        switch (parameter) {
            case 'nome':
                const nome = req.query.nome;
                const itinerari = await itinerarioManager.cercaItinerarioPerNome(nome);
                res.json(itinerari);
                break;
            case 'stato':
                const stato = req.query.stato;
                const itinerari2 = await itinerarioManager.cercaItinerarioPerStato(stato);
                res.json(itinerari2);
                break;
            case 'durata':
                const durata = req.query.durata;
                const itinerari3 = await itinerarioManager.cercaItinerarioPerDurata(durata);
                res.json(itinerari3);
                break;
            default:
                res.status(400).send('Bad Request: parameter ' + parameter + ' not found');
                break;
        }
    } catch (error) {
        res.status(500).send('Internal Server Error');
    }
});

// Create a new itinerary
router.post('/createItinerary', async (req, res) => {
    try {
        if (!checkUser(req)) {
            res.status(401).send('Unauthorized');
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
            console.log("nome")
            res.status(400).send('Bad Request: nome is required');
            return;
        }
        if(!stato) {
            console.log("stato")
            res.status(400).send('Bad Request: stato is required');
            return;
        }
        if(!giorni) {
            console.log("giorni")
            res.status(400).send('Bad Request: giorni is required');
            return;
        }
        if(!recensioni) {
            recensioni = [];
        }
        if(!descrizione) {
            console.log("descrizione")
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
        if (!checkUser(req)) {
            res.status(401).send('Unauthorized');
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
        if (!checkUser(req)) {
            res.status(401).send('Unauthorized');
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
        if (!checkUser(req)) {
            res.status(401).send('Unauthorized');
            return;
        }
        const userId = req.header('userId');
        const itinerari = await tripplerManager.visualizzaItinerari(userId);
        res.json(itinerari);
    } catch (error) {
        res.status(500).send('Internal Server Error');
    }
});

// END TRIPPLER

// DAY

//aggiungi tappa
router.post('/addStop', async (req, res) => {
    try {
        if (!checkUser(req)) {
            res.status(401).send('Unauthorized');
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
        if (!checkUser(req)) {
            res.status(401).send('Unauthorized');
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
        if (!checkUser(req)) {
            res.status(401).send('Unauthorized');
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
        if (!checkUser(req)) {
            res.status(401).send('Unauthorized');
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
        if (!checkUser(req)) {
            res.status(401).send('Unauthorized');
            return;
        }
        const idItinerario = req.query.idItinerario;
        const giorno = req.query.giorno;
        const mezzo = req.query.mezzo;
        const calcolaDistanza = await giornoManager.calcolaDistanza(idItinerario, giorno, mezzo);
        res.json(calcolaDistanza);
    } catch (error) {
        res.status(500).send('Internal Server Error');
    }
});

//calcola percorso idItinerario, giorno mezzo
router.get('/calcPath', async (req, res) => {
    try {
        const idItinerario = req.query.idItinerario;
        const giorno = req.query.giorno;
        const mezzo = req.query.mezzo;
        const calcolaPercorso = await giornoManager.calcolaPercorso(idItinerario, giorno, mezzo);
        res.json(calcolaPercorso);
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
        return tripplerManager.checkUser(userId);
    } catch (error) {
        return false;
    }
}

module.exports = router;