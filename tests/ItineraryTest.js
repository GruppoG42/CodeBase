const mongoose = require("mongoose")
const request = require("supertest")
const app = require("../server/app")
// const {expect} = require("chai");
const host = "http://localhost:3000"

const userId = "google-oauth2|111261636165234106646"
const idItinerario = "65bea7f2b410532d3c471d34"
const idItinerario2 = "65bea7fcb410532d3c471d35"
let createdItineraryId = ""

//userId as header
describe("Itinerary Tests", async () => {
    it("should return all itineraries", async () => {
        return request(host)
            .get("/api/getUserItineraries")
            .set('userId', userId)
            .expect('Content-Type', /json/)
            .expect(200)
            .then((res) => {
                console.log(res.body)
            })
    });
    it("should calculate time", async () => {
        return request(host)
            .get(`/api/calcTimeItinerary`)
            .set('userId', userId)
            .query({idItinerario: idItinerario})
            // .expect('Content-Type', /json/)
            .expect(200)
            .then((res) => {
                console.log("Tempo percorrenza: " + res.body)
            })
    });
    it('should POST a review for an itinerary', async () => {
        return request(host)
            .post('/api/reviewItinerary')
            .set('userId', userId)
            .send({idItinerario: idItinerario, reviewText: 'Great itinerary!', rating: 5})
            .expect(200)
            .then((res) => {
                console.log(res.body);
            })
    });
    it('should GET a review for an itinerary', async () => {
        return request(host)
            .get('/api/getItineraryReview')
            .set('userId', userId)
            .query({idItinerario: idItinerario})
            .expect(200)
            .then((res) => {
                console.log(res.body);
            })
    });
    //addDay
    it('should add a day to an itinerary', async () => {
        let json = "{\n" +
            "        \"descrizione\": \"Test Day Descrizione 1706993659036\",\n" +
            "        \"tappe\": [\n" +
            "            {\n" +
            "                \"descrizione\": \"Test Tappa Descrizione 1706993659036\",\n" +
            "                \"luogo\": \"Bolzano\",\n" +
            "                \"ristori\": \"Test Tappa Ristori KqqSwE1ZBd\",\n" +
            "                \"alloggi\": \"Test Tappa Alloggi MUpKRNhi8t\"\n" +
            "            },\n" +
            "            {\n" +
            "                \"descrizione\": \"Test Tappa Descrizione 1706993659036\",\n" +
            "                \"luogo\": \"Grosseto\",\n" +
            "                \"ristori\": \"Test Tappa Ristori q9Z95SjjTz\",\n" +
            "                \"alloggi\": \"Test Tappa Alloggi I4c6X9AVT2\"\n" +
            "            },\n" +
            "            {\n" +
            "                \"descrizione\": \"Test Tappa Descrizione 1706993659036\",\n" +
            "                \"luogo\": \"Padova\",\n" +
            "                \"ristori\": \"Test Tappa Ristori Z1KnV7gMB7\",\n" +
            "                \"alloggi\": \"Test Tappa Alloggi G3VPhFQ6VD\"\n" +
            "            }\n" +
            "        ]\n" +
            "    }"
        json = JSON.parse(json)
        return request(host)
            .post('/api/addDay')
            .set('userId', userId)
            .send({idItinerario: idItinerario2, giorno: json})
            .expect(200)
            .then((res) => {
                console.log(res.body);
            })
    });
//containsDay
    it('should check if an itinerary contains a day', async () => {
        return request(host)
            .get('/api/containsDay')
            .set('userId', userId)
            .query({idItinerario: idItinerario, giorno: 1})
            .expect(200)
            .then((res) => {
                console.log(res.body);
            })
    });
    //searchItineraries
    it('should search itineraries', async () => {
        return request(host)
            .get('/api/searchItineraries')
            .set('userId', userId)
            .query({state: "Italy", name: "Rieti", duration: 1})
            .expect(200)
            .then((res) => {
                console.log(res.body);
            })
    });
    //createItinerary
    it('should create an itinerary', async () => {
        let json = "{\n" +
            "        \"descrizione\": \"Test Descrizione 1706993659036\",\n" +
            "        \"giorni\": [\n" +
            "            {\n" +
            "                \"descrizione\": \"Test Day Descrizione 1706993659036\",\n" +
            "                \"tappe\": [\n" +
            "                    {\n" +
            "                        \"descrizione\": \"Test Tappa Descrizione 1706993659036\",\n" +
            "                        \"luogo\": \"Bolzano\",\n" +
            "                        \"ristori\": \"Test Tappa Ristori KqqSwE1ZBd\",\n" +
            "                        \"alloggi\": \"Test Tappa Alloggi MUpKRNhi8t\"\n" +
            "                    },\n" +
            "                    {\n" +
            "                        \"descrizione\": \"Test Tappa Descrizione 1706993659036\",\n" +
            "                        \"luogo\": \"Grosseto\",\n" +
            "                        \"ristori\": \"Test Tappa Ristori q9Z95SjjTz\",\n" +
            "                        \"alloggi\": \"Test Tappa Alloggi I4c6X9AVT2\"\n" +
            "                    },\n" +
            "                    {\n" +
            "                        \"descrizione\": \"Test Tappa Descrizione 1706993659036\",\n" +
            "                        \"luogo\": \"Padova\",\n" +
            "                        \"ristori\": \"Test Tappa Ristori Z1KnV7gMB7\",\n" +
            "                        \"alloggi\": \"Test Tappa Alloggi G3VPhFQ6VD\"\n" +
            "                    }\n" +
            "                ]\n" +
            "            }\n" +
            "        ]\n" +
            "    }"
        json = JSON.parse(json)
        return request(host)
            .post('/api/createItinerary')
            .set('userId', userId)
            .send({
                nome: "Test Itinerario",
                stato: "Italy",
                giorni: json,
                recensioni: [],
                attivo: true,
                descrizione: "Test Descrizione " + Date.now()
            })
            .expect(200)
            .then((res) => {
                createdItineraryId = res.body.insertedId
                console.log(res.body);
            })
    });
    //getCommunityItineraries
    it('should get community itineraries', async () => {
        return request(host)
            .get('/api/getCommunityItineraries')
            .set('userId', userId)
            .expect(200)
            .then((res) => {
                console.log(res.body);
            })
    });
    //deleteItinerary
    it('should delete an itinerary', async () => {
        return request(host)
            .delete('/api/deleteItinerary')
            .set('userId', userId)
            .query({idItinerario: createdItineraryId})
            .expect(200)
            .then((res) => {
                console.log(res.body);
            })
    });
    //getSavedItineraries
    it('should get saved itineraries', async () => {
        return request(host)
            .get('/api/getSavedItineraries')
            .set('userId', userId)
            .expect(200)
            .then((res) => {
                console.log(res.body);
            })
    });
    //wait 1s
    //addItineraryToSaved
    it('should add an itinerary to saved', async () => {
        return request(host)
            .patch('/api/addItineraryToSaved')
            .set('userId', userId)
            .send({itineraryId: idItinerario2})
            .expect(200)
            .then((res) => {
                console.log(res.body);
            })
    });
    //isSavedItinerary
    it('should check if an itinerary is saved', async () => {
        return request(host)
            .get('/api/isSavedItinerary')
            .set('userId', userId)
            .query({itineraryId: idItinerario2})
            .expect(200)
            .then((res) => {
                console.log(res.body);
            })
    });
    //removeItineraryFromSaved
    it('should remove an itinerary from saved', async () => {
        return request(host)
            .patch('/api/removeItineraryFromSaved')
            .set('userId', userId)
            .send({itineraryId: idItinerario2})
            .expect(200)
            .then((res) => {
                console.log(res.body);
            })
    });
    //deleteSavedList
    it('should delete a saved list', async () => {
        return request(host)
            .delete('/api/deleteSavedList')
            .set('userId', userId)
            .query({listId: idItinerario2})
            .expect(200)
            .then((res) => {
                console.log(res.body);
            })
    });

    //addStop
    it('should add a stop to an itinerary', async () => {
        return request(host)
            .post('/api/addStop')
            .set('userId', userId)
            .send({
                idItinerario: idItinerario2, giorno: 1, tappa: {
                    "descrizione": "Descrizione della tappa 1",
                    "giorno": 1,
                    "luogo": "Milano",
                    "ristori": "Ristoro 1, Ristoro 2",
                    "alloggi": "Alloggio 1, Alloggio 2"
                }
            })
            .expect(200)
            .then((res) => {
                console.log(res.body);
            })
    });
    //deleteStop
    it('should delete a stop from an itinerary', async () => {
        return request(host)
            .delete('/api/deleteStop')
            .set('userId', userId)
            .send({
                idItinerario: idItinerario2, giorno: 1, tappa: {
                    "descrizione": "Descrizione della tappa 1",
                    "giorno": 1,
                    "luogo": "Milano",
                    "ristori": "Ristoro 1, Ristoro 2",
                    "alloggi": "Alloggio 1, Alloggio 2"
                }
            })
            .expect(200)
            .then((res) => {
                console.log(res.body);
            })
    });
    //replaceStop
    it('should replace a stop in an itinerary', async () => {
        return request(host)
            .put('/api/replaceStop')
            .set('userId', userId)
            .send({
                idItinerario: idItinerario2, giorno: 1, indice: 0, tappa: {
                    "descrizione": "Descrizione della tappa 1",
                    "giorno": 1,
                    "luogo": "Milano",
                    "ristori": "Ristoro 1, Ristoro 2",
                    "alloggi": "Alloggio 1, Alloggio 2"
                }
            })
            .expect(200)
            .then((res) => {
                console.log(res.body);
            })
    });
    //calcDistance
    it('should calculate distance', async () => {
        return request(host)
            .get('/api/calcDistance')
            .set('userId', userId)
            .query({idItinerario: idItinerario, giorno : 1, mezzo: "car"})
            .expect(200)
            .then((res) => {
                console.log(res.body);
            })
    });
    //calcPath
    it('should calculate path', async () => {
        return request(host)
            .get('/api/calcPath')
            .set('userId', userId)
            .query({idItinerario: idItinerario, giorno : 1})
            .expect(200)
            .then((res) => {
                console.log(res.body);
            })
    });

});


const s = "" +
    "const router = require('express').Router();\n" +
    "\n" +
    "const itinerarioManager = require('../managers/itinerarioManager.js');\n" +
    "const giornoManager = require('../managers/giornoManager.js');\n" +
    "const tappaManager = require('../managers/tappaManager.js');\n" +
    "const tripplerManager = require('../managers/tripplerManager.js');\n" +
    "const userManager = require('../managers/userManager.js');\n" +
    "const {dbtest} = require(\"../db/connection\");\n" +
    "const {requiresAuth} = require(\"express-openid-connect\");\n" +
    "\n" +
    "/*\n" +
    " ***************************************ROUTES***************************************\n" +
    "*/\n" +
    "\n" +
    "//ITINERARY\n" +
    "\n" +
    "// Get all user itineraries\n" +
    "router.get('/getUserItineraries', async (req, res) => {\n" +
    "    try {\n" +
    "        const userId = req.header('userId');\n" +
    "        if (!userId) {\n" +
    "            res.status(400).send('Bad Request: userId are required');\n" +
    "            return;\n" +
    "        }\n" +
    "        if (!(await checkUser(req))) {\n" +
    "            res.status(404).json({error: 'User not found'});\n" +
    "            return;\n" +
    "        }\n" +
    "        const userItineraries = await tripplerManager.getUserItineraries(userId);\n" +
    "\n" +
    "        res.status(200).json(userItineraries);\n" +
    "    } catch (error) {\n" +
    "        console.error('Error fetching user itineraries:', error);\n" +
    "        res.status(500).send('Internal Server Error');\n" +
    "    }\n" +
    "});\n" +
    "\n" +
    "//calc time\n" +
    "router.get('/calcTimeItinerary', async (req, res) => {\n" +
    "    try {\n" +
    "        const idItinerario = req.query.idItinerario;\n" +
    "        if (!idItinerario) {\n" +
    "            res.status(400).send('Bad Request: idItinerario are required');\n" +
    "            return;\n" +
    "        }\n" +
    "        if (!(await checkItinerary(idItinerario))) {\n" +
    "            res.status(404).json({error: 'Itinerary not found'});\n" +
    "            return;\n" +
    "        }\n" +
    "        const time = await giornoManager.calcolaTempoPercorrenza(idItinerario);\n" +
    "        res.status(200).json(time);\n" +
    "    } catch (error) {\n" +
    "        res.status(500).send('Internal Server Error ' + error);\n" +
    "    }\n" +
    "});\n" +
    "\n" +
    "//recensisci\n" +
    "router.post('/reviewItinerary', async (req, res) => {\n" +
    "    try {\n" +
    "        const userId = req.header('userId');\n" +
    "        const idItinerario = req.body.idItinerario;\n" +
    "        const recensione = req.body.reviewText;\n" +
    "        const punteggio = req.body.rating;\n" +
    "        if (!userId || !idItinerario || !recensione || !punteggio) {\n" +
    "            res.status(400).send('Bad Request: userId, idItinerario, recensione and punteggio are required');\n" +
    "            return;\n" +
    "        }\n" +
    "        if (!(await checkUser(req))) {\n" +
    "            console.error('User not found')\n" +
    "            res.status(404).json({error: 'User not found'});\n" +
    "\n" +
    "            return;\n" +
    "        }\n" +
    "        if (!(await checkItinerary(idItinerario))) {\n" +
    "            res.status(404).json({error: 'Itinerary not found'});\n" +
    "            return;\n" +
    "        }\n" +
    "\n" +
    "        const recensisci = await itinerarioManager.saveReview(idItinerario, userId, recensione, punteggio);\n" +
    "        res.status(200).json(recensisci);\n" +
    "    } catch (error) {\n" +
    "        console.error('Error saving review:', error);\n" +
    "        res.status(500).send('Internal Server Error: ' + error);\n" +
    "    }\n" +
    "});\n" +
    "\n" +
    "router.get('/getItineraryReview', async (req, res) => {\n" +
    "    try {\n" +
    "        const userId = req.header('userId');\n" +
    "        const idItinerario = req.query.idItinerario;\n" +
    "        if (!userId || !idItinerario) {\n" +
    "            res.status(400).send('Bad Request: userId and idItinerario are required');\n" +
    "            return;\n" +
    "        }\n" +
    "        if (!(await checkItinerary(idItinerario))) {\n" +
    "            res.status(404).json({error: 'Itinerary not found'});\n" +
    "            return;\n" +
    "        }\n" +
    "        if (!(await checkUser(req))) {\n" +
    "            console.error('User not found')\n" +
    "            res.status(404).json({error: 'User not found'});\n" +
    "            return;\n" +
    "        }\n" +
    "\n" +
    "        const reviews = await itinerarioManager.getItineraryReview(idItinerario, req.header('userId'));\n" +
    "        if (!reviews) {\n" +
    "            res.json({}); // empty object\n" +
    "            return;\n" +
    "        }\n" +
    "        res.status(200).json(reviews);\n" +
    "    } catch (error) {\n" +
    "        res.status(500).send('Internal Server Error');\n" +
    "    }\n" +
    "});\n" +
    "\n" +
    "//aggiungi giorno\n" +
    "router.post('/addDay', async (req, res) => {\n" +
    "    try {\n" +
    "        const idItinerario = req.body.idItinerario;\n" +
    "        const giorno = req.body.giorno;\n" +
    "        if (!idItinerario || !giorno) {\n" +
    "            res.status(400).send('Bad Request: idItinerario and giorno are required');\n" +
    "            return;\n" +
    "        }\n" +
    "        if (!(await checkItinerary(idItinerario))) {\n" +
    "            res.status(404).json({error: 'Itinerary not found'});\n" +
    "            return;\n" +
    "        }\n" +
    "        if (!(await checkUser(req))) {\n" +
    "            res.status(404).json({error: 'User not found'});\n" +
    "            return;\n" +
    "        }\n" +
    "\n" +
    "        const aggiungiGiorno = await itinerarioManager.aggiungiGiorno(idItinerario, giorno);\n" +
    "        res.status(200).json(aggiungiGiorno);\n" +
    "    } catch (error) {\n" +
    "        console.error('Error adding day:', error);\n" +
    "        res.status(500).send('Internal Server Error: ' + error);\n" +
    "    }\n" +
    "});\n" +
    "\n" +
    "//contiene giorno\n" +
    "router.get('/containsDay', async (req, res) => {\n" +
    "    try {\n" +
    "        const idItinerario = req.query.idItinerario;\n" +
    "        const giorno = req.query.giorno;\n" +
    "\n" +
    "        if (!idItinerario || !giorno) {\n" +
    "            res.status(400).send('Bad Request: idItinerario and giorno are required');\n" +
    "            return;\n" +
    "        }\n" +
    "        if (!(await checkItinerary(idItinerario))) {\n" +
    "            res.status(404).json({error: 'Itinerary not found'});\n" +
    "            return;\n" +
    "        }\n" +
    "        if (!(await checkUser(req))) {\n" +
    "            res.status(404).json({error: 'User not found'});\n" +
    "            return;\n" +
    "        }\n" +
    "\n" +
    "        const contieneGiorno = await itinerarioManager.contieneGiorno(giorno, idItinerario);\n" +
    "        res.status(200).json(contieneGiorno);\n" +
    "    } catch (error) {\n" +
    "        res.status(500).send('Internal Server Error');\n" +
    "    }\n" +
    "});\n" +
    "\n" +
    "//cerca itinerari\n" +
    "router.get('/searchItineraries', async (req, res) => {\n" +
    "    try {\n" +
    "        const {state, name, duration} = req.query;\n" +
    "        if (!state && !name && !duration) {\n" +
    "            res.status(400).send('Bad Request: state, name or duration are required');\n" +
    "            return;\n" +
    "        }\n" +
    "        const itineraries = await itinerarioManager.cercaItinerari(state, name, duration);\n" +
    "        res.json(itineraries);\n" +
    "    } catch (error) {\n" +
    "        res.status(500).json({error: error.toString()});\n" +
    "    }\n" +
    "});\n" +
    "\n" +
    "router.put('/updateActive', async (req, res) => {\n" +
    "    try {\n" +
    "        const idItinerario = req.body.idItinerario;\n" +
    "        const active = req.body.active;\n" +
    "        const updateActive = await itinerarioManager.aggiornaAttivo(idItinerario, active);\n" +
    "        res.json(updateActive);\n" +
    "    } catch (error) {\n" +
    "        res.status(500).send('Internal Server Error');\n" +
    "    }\n" +
    "});\n" +
    "\n" +
    "\n" +
    "// Create a new itinerary\n" +
    "router.post('/createItinerary', async (req, res) => {\n" +
    "    try {\n" +
    "        const userId = req.header('userId')\n" +
    "        if (!userId) {\n" +
    "            res.status(400).send('Bad Request: userId is required');\n" +
    "            return;\n" +
    "        }\n" +
    "        if (!(await checkUser(req))) {\n" +
    "            res.status(404).json({error: 'User not found'});\n" +
    "            return;\n" +
    "        }\n" +
    "        const nome = req.body.nome;\n" +
    "        const stato = req.body.stato;\n" +
    "        const giorni = req.body.giorni;\n" +
    "        let recensioni = req.body.recensioni;\n" +
    "        const descrizione = req.body.descrizione;\n" +
    "        let attivo = req.body.attivo;\n" +
    "        if (!nome || !stato || !giorni || !descrizione) {\n" +
    "            res.status(400).send('Bad Request: nome, stato, giorni, and descrizione are required');\n" +
    "            return;\n" +
    "        }\n" +
    "        if (!recensioni) {\n" +
    "            recensioni = [];\n" +
    "        }\n" +
    "        if (!attivo) {\n" +
    "            // console.log(\"attivo\")\n" +
    "            // res.status(400).send('Bad Request: attivo is required');\n" +
    "            // return;\n" +
    "            attivo = true;\n" +
    "        }\n" +
    "        const itineraryData = {\n" +
    "            nome,\n" +
    "            stato,\n" +
    "            giorni,\n" +
    "            recensioni,\n" +
    "            descrizione,\n" +
    "            attivo\n" +
    "        };\n" +
    "        const newItinerary = await itinerarioManager.createItinerary({\n" +
    "            ...itineraryData,\n" +
    "            _userId: userId\n" +
    "        });\n" +
    "        res.status(200).json(newItinerary);\n" +
    "    } catch (error) {\n" +
    "        console.error('Error creating new itinerary:', error);\n" +
    "        res.status(500).send('Internal Server Error');\n" +
    "    }\n" +
    "});\n" +
    "\n" +
    "// get all itineraries\n" +
    "router.get('/getCommunityItineraries', async (req, res) => {\n" +
    "    try {\n" +
    "        const userId = req.header('userId');\n" +
    "        if (!userId) {\n" +
    "            res.status(400).send('Bad Request: userId is required');\n" +
    "            return;\n" +
    "        }\n" +
    "        if (!(await checkUser(req))) {\n" +
    "            res.status(404).json({error: 'User not found'});\n" +
    "            return;\n" +
    "        }\n" +
    "        const allItineraries = await itinerarioManager.getCommunityItineraries(userId);\n" +
    "        res.status(200).json(allItineraries);\n" +
    "    } catch (error) {\n" +
    "        console.error('Error fetching all itineraries:', error);\n" +
    "        res.status(500).send('Internal Server Error');\n" +
    "    }\n" +
    "});\n" +
    "\n" +
    "// END ITINERARY\n" +
    "\n" +
    "// TRIPPLER\n" +
    "\n" +
    "// elimina itinerario\n" +
    "router.delete('/deleteItinerary', async (req, res) => {\n" +
    "    try {\n" +
    "        const userId = req.header('userId');\n" +
    "        const idItinerario = req.query.idItinerario;\n" +
    "        if (!userId || !idItinerario) {\n" +
    "            res.status(400).send('Bad Request: userId and idItinerario are required');\n" +
    "            return;\n" +
    "        }\n" +
    "        if (!(await checkItinerary(idItinerario))) {\n" +
    "            res.status(404).json({error: 'Itinerary not found'});\n" +
    "            return;\n" +
    "        }\n" +
    "        if (!(await checkUser(req))) {\n" +
    "            res.status(404).json({error: 'User not found'});\n" +
    "            return;\n" +
    "        }\n" +
    "        const eliminaItinerario = await tripplerManager.eliminaItinerario(idItinerario);\n" +
    "        res.json(eliminaItinerario);\n" +
    "    } catch (error) {\n" +
    "        res.status(500).send('Internal Server Error');\n" +
    "    }\n" +
    "});\n" +
    "\n" +
    "//get user\n" +
    "router.get('/getUser', requiresAuth(), async (req, res) => {\n" +
    "    try {\n" +
    "        const userId = req.oidc.user.sub;\n" +
    "        const user = await userManager.getUser(userId);\n" +
    "        res.json(user);\n" +
    "    } catch (error) {\n" +
    "        res.status(500).send('Internal Server Error');\n" +
    "    }\n" +
    "});\n" +
    "\n" +
    "\n" +
    "router.delete('/deleteUser', requiresAuth(), async (req, res) => {\n" +
    "    try {\n" +
    "        const userId = req.oidc.user.sub;\n" +
    "        const deleteUser = await userManager.deleteUser(userId);\n" +
    "        const deleteItineraries = await itinerarioManager.deleteItineraries(userId);\n" +
    "        const deleteSaved = await tripplerManager.deleteSaved(userId);\n" +
    "        res.json({user: deleteUser, deleteItineraries, deleteSaved});\n" +
    "    } catch (error) {\n" +
    "        res.status(500).send('Internal Server Error');\n" +
    "    }\n" +
    "});\n" +
    "\n" +
    "router.get('/getSavedItineries', async (req, res) => {\n" +
    "    try {\n" +
    "        const userId = req.header('userId');\n" +
    "        if (!userId) {\n" +
    "            res.status(400).send('Bad Request: userId is required');\n" +
    "            return;\n" +
    "        }\n" +
    "        if (!(await checkUser(req))) {\n" +
    "            res.status(404).json({error: 'User not found'});\n" +
    "            return;\n" +
    "        }\n" +
    "        const itineraries = await tripplerManager.getSavedItineriesById(userId);\n" +
    "        res.status(200).json(itineraries);\n" +
    "    } catch (error) {\n" +
    "        console.error(`Error fetching saved itineraries by id: ${error}`);\n" +
    "        res.status(500).send('Internal Server Error');\n" +
    "    }\n" +
    "});\n" +
    "\n" +
    "router.get('/isSavedItinerary', async (req, res) => {\n" +
    "    try {\n" +
    "        const userId = req.header('userId');\n" +
    "        const itineraryId = req.query.itineraryId;\n" +
    "        if (!userId || !itineraryId) {\n" +
    "            res.status(400).send('Bad Request: userId and itineraryId are required');\n" +
    "            return;\n" +
    "        }\n" +
    "        if (!(await checkUser(req))) {\n" +
    "            res.status(404).json({error: 'User not found'});\n" +
    "            return;\n" +
    "        }\n" +
    "        const isSaved = await tripplerManager.isSavedItinerary(userId, itineraryId);\n" +
    "        res.status(200).json(isSaved);\n" +
    "    } catch (error) {\n" +
    "        console.error(`Error checking if itinerary is saved: ${error}`);\n" +
    "        res.status(500).send('Internal Server Error');\n" +
    "    }\n" +
    "});\n" +
    "\n" +
    "router.patch('/addItineraryToSaved', async (req, res) => {\n" +
    "    try {\n" +
    "        const userId = req.header('userId');\n" +
    "        const itineraryId = req.body.itineraryId;\n" +
    "        if (!userId || !itineraryId) {\n" +
    "            res.status(400).send('Bad Request: userId and itineraryId are required');\n" +
    "            return;\n" +
    "        }\n" +
    "        if (!(await checkUser(req))) {\n" +
    "            res.status(404).json({error: 'User not found'});\n" +
    "            return;\n" +
    "        }\n" +
    "        if (await tripplerManager.isSavedItinerary(userId, itineraryId)) {\n" +
    "            res.status(400).send('Itinerary already saved');\n" +
    "            return;\n" +
    "        }\n" +
    "        const result = await tripplerManager.addItineraryToSaved(userId, itineraryId);\n" +
    "        res.status(200).json(result);\n" +
    "    } catch (error) {\n" +
    "        console.error(`Error adding itinerary to saved: ${error}`);\n" +
    "        res.status(500).send('Internal Server Error');\n" +
    "    }\n" +
    "});\n" +
    "\n" +
    "router.patch('/removeItineraryFromSaved', async (req, res) => {\n" +
    "    try {\n" +
    "        const userId = req.header('userId');\n" +
    "        const itineraryId = req.body.itineraryId;\n" +
    "        if (!userId || !itineraryId) {\n" +
    "            res.status(400).send('Bad Request: userId and itineraryId are required');\n" +
    "            return;\n" +
    "        }\n" +
    "        if (!(await checkUser(req))) {\n" +
    "            res.status(404).json({error: 'User not found'});\n" +
    "            return;\n" +
    "        }\n" +
    "        if (!(await tripplerManager.isSavedItinerary(userId, itineraryId))) {\n" +
    "            console.log(userId, itineraryId)\n" +
    "            res.status(400).send('Itinerary not saved');\n" +
    "            return;\n" +
    "        }\n" +
    "        const result = await tripplerManager.removeItineraryFromSaved(userId, itineraryId);\n" +
    "        res.status(200).json(result);\n" +
    "    } catch (error) {\n" +
    "        console.error(`Error removing itinerary from saved: ${error}`);\n" +
    "        res.status(500).send('Internal Server Error');\n" +
    "    }\n" +
    "});\n" +
    "\n" +
    "router.delete('/deleteSavedList', async (req, res) => {\n" +
    "    try {\n" +
    "        const userId = req.header('userId');\n" +
    "        if (!userId) {\n" +
    "            res.status(400).send('Bad Request: userId is required');\n" +
    "            return;\n" +
    "        }\n" +
    "        if (!(await checkUser(req))) {\n" +
    "            res.status(404).json({error: 'User not found'});\n" +
    "            return;\n" +
    "        }\n" +
    "        const result = await tripplerManager.deleteSaved(userId);\n" +
    "        res.status(200).json(result);\n" +
    "    } catch (error) {\n" +
    "        console.error(`Error deleting saved list: ${error}`);\n" +
    "        res.status(500).send('Internal Server Error');\n" +
    "    }\n" +
    "});\n" +
    "\n" +
    "// END TRIPPLER\n" +
    "\n" +
    "// DAY\n" +
    "\n" +
    "//aggiungi tappa\n" +
    "router.post('/addStop', async (req, res) => {\n" +
    "    try {\n" +
    "        const idItinerario = req.body.idItinerario;\n" +
    "        const giorno = req.body.giorno;\n" +
    "        const tappa = req.body.tappa;\n" +
    "        const userId = req.header('userId');\n" +
    "        if (!idItinerario || !giorno || !tappa || !userId) {\n" +
    "            res.status(400).send('Bad Request: idItinerario, giorno, tappa and userId are required');\n" +
    "            return;\n" +
    "        }\n" +
    "        if (!(await checkItinerary(idItinerario))) {\n" +
    "            res.status(404).json({error: 'Itinerary not found'});\n" +
    "            return;\n" +
    "        }\n" +
    "        if (!(await checkUser(req))) {\n" +
    "            res.status(404).json({error: 'User not found'});\n" +
    "            return;\n" +
    "        }\n" +
    "\n" +
    "        const aggiungiTappa = await giornoManager.aggiungiTappa(idItinerario, giorno, tappa);\n" +
    "        res.status(200).json(aggiungiTappa);\n" +
    "    } catch (error) {\n" +
    "        res.status(500).send('Internal Server Error');\n" +
    "    }\n" +
    "});\n" +
    "\n" +
    "//elimina tappa\n" +
    "router.delete('/deleteStop', async (req, res) => {\n" +
    "    try {\n" +
    "        const idItinerario = req.body.idItinerario;\n" +
    "        const giorno = req.body.giorno;\n" +
    "        const tappa = req.body.tappa;\n" +
    "        const userId = req.header('userId');\n" +
    "        if (!idItinerario || !giorno || !tappa || !userId) {\n" +
    "            res.status(400).send('Bad Request: idItinerario, giorno, tappa and userId are required');\n" +
    "            return;\n" +
    "        }\n" +
    "        if (!(await checkItinerary(idItinerario))) {\n" +
    "            res.status(404).json({error: 'Itinerary not found'});\n" +
    "            return;\n" +
    "        }\n" +
    "        if (!(await checkUser(req))) {\n" +
    "            res.status(404).json({error: 'User not found'});\n" +
    "            return;\n" +
    "        }\n" +
    "        const eliminaTappa = await giornoManager.eliminaTappa(idItinerario, giorno, tappa);\n" +
    "        res.status(200).json(eliminaTappa);\n" +
    "    } catch (error) {\n" +
    "        res.status(500).send('Internal Server Error');\n" +
    "    }\n" +
    "});\n" +
    "\n" +
    "//elimina tappa id\n" +
    "router.delete('/deleteStopId', async (req, res) => {\n" +
    "    try {\n" +
    "        const idItinerario = req.body.idItinerario;\n" +
    "        const giorno = req.body.giorno;\n" +
    "        const idTappa = req.body.idTappa;\n" +
    "        const userId = req.header('userId');\n" +
    "        if (!idItinerario || !giorno || !idTappa || !userId) {\n" +
    "            res.status(400).send('Bad Request: idItinerario, giorno, idTappa and userId are required');\n" +
    "            return;\n" +
    "        }\n" +
    "        if (!(await checkItinerary(idItinerario))) {\n" +
    "            res.status(404).json({error: 'Itinerary not found'});\n" +
    "            return;\n" +
    "        }\n" +
    "        if (!(await checkUser(req))) {\n" +
    "            res.status(404).json({error: 'User not found'});\n" +
    "            return;\n" +
    "        }\n" +
    "\n" +
    "        const eliminaTappaId = await giornoManager.eliminaTappaId(idItinerario, giorno, idTappa);\n" +
    "        res.status(200).json(eliminaTappaId);\n" +
    "    } catch (error) {\n" +
    "        res.status(500).send('Internal Server Error');\n" +
    "    }\n" +
    "});\n" +
    "\n" +
    "//riposiziona tappa\n" +
    "router.put('/replaceStop', async (req, res) => {\n" +
    "    try {\n" +
    "        const idItinerario = req.body.idItinerario;\n" +
    "        const giorno = req.body.giorno;\n" +
    "        const indice = req.body.indice;\n" +
    "        const tappa = req.body.tappa;\n" +
    "        const userId = req.header('userId');\n" +
    "        if (!idItinerario || !giorno || !indice || !tappa || !userId) {\n" +
    "            res.status(400).send('Bad Request: idItinerario, giorno, indice, tappa and userId are required');\n" +
    "            return;\n" +
    "        }\n" +
    "        if (!(await checkItinerary(idItinerario))) {\n" +
    "            res.status(404).json({error: 'Itinerary not found'});\n" +
    "            return;\n" +
    "        }\n" +
    "        if (!(await checkUser(req))) {\n" +
    "            res.status(404).json({error: 'User not found'});\n" +
    "            return;\n" +
    "        }\n" +
    "\n" +
    "        const ripiazzaTappa = await giornoManager.ripiazzaTappa(idItinerario, giorno, indice, tappa);\n" +
    "        res.status(200).json(ripiazzaTappa);\n" +
    "    } catch (error) {\n" +
    "        res.status(500).send('Internal Server Error');\n" +
    "    }\n" +
    "});\n" +
    "\n" +
    "//calcola distanza idItinerario, giorno, mezzo\n" +
    "router.get('/calcDistance', async (req, res) => {\n" +
    "    try {\n" +
    "        const idItinerario = req.query.idItinerario;\n" +
    "        const giorno = req.query.giorno;\n" +
    "        const mezzo = req.query.mezzo;\n" +
    "        const userId = req.header('userId');\n" +
    "        if (!idItinerario || !giorno || !mezzo || !userId) {\n" +
    "            res.status(400).send('Bad Request: idItinerario, giorno, mezzo and userId are required');\n" +
    "            return;\n" +
    "        }\n" +
    "        if (!(await checkItinerary(idItinerario))) {\n" +
    "            res.status(404).json({error: 'Itinerary not found'});\n" +
    "            return;\n" +
    "        }\n" +
    "        if (!(await checkUser(req))) {\n" +
    "            res.status(404).json({error: 'User not found'});\n" +
    "            return;\n" +
    "        }\n" +
    "\n" +
    "        const calcolaDistanza = await giornoManager.calcolaDistanza(idItinerario, giorno, mezzo);\n" +
    "        res.status(200).json(calcolaDistanza);\n" +
    "    } catch (error) {\n" +
    "        res.status(500).send('Internal Server Error ' + error);\n" +
    "    }\n" +
    "});\n" +
    "\n" +
    "//calcola percorso idItinerario, giorno\n" +
    "router.get('/calcPath', async (req, res) => {\n" +
    "    try {\n" +
    "        const idItinerario = req.query.idItinerario;\n" +
    "        const giorno = req.query.giorno;\n" +
    "        if (!idItinerario || !giorno) {\n" +
    "            res.status(400).send('Bad Request: idItinerario and giorno are required');\n" +
    "            return;\n" +
    "        }\n" +
    "        if (!(await checkItinerary(idItinerario))) {\n" +
    "            res.status(404).json({error: 'Itinerary not found'});\n" +
    "            return;\n" +
    "        }\n" +
    "\n" +
    "        const calcolaPercorso = await giornoManager.calcolaPercorso(idItinerario, giorno);\n" +
    "        res.json(calcolaPercorso);\n" +
    "    } catch (error) {\n" +
    "        res.status(500).send('Internal Server Error');\n" +
    "    }\n" +
    "});\n" +
    "\n" +
    "//total path\n" +
    "router.get('/totalPath', async (req, res) => {\n" +
    "    try {\n" +
    "        const idItinerario = req.query.idItinerario;\n" +
    "        if (!idItinerario) {\n" +
    "            res.status(400).send('Bad Request: idItinerario is required');\n" +
    "            return;\n" +
    "        }\n" +
    "        if (!(await checkItinerary(idItinerario))) {\n" +
    "            res.status(404).json({error: 'Itinerary not found'});\n" +
    "            return;\n" +
    "        }\n" +
    "        const totalPath = await giornoManager.calcolaPercorsoTotale(idItinerario);\n" +
    "        res.status(200).json(totalPath);\n" +
    "    } catch (error) {\n" +
    "        res.status(500).send('Internal Server Error');\n" +
    "    }\n" +
    "});\n" +
    "\n" +
    "\n" +
    "// END DAY\n" +
    "\n" +
    "function checkUser(req) {\n" +
    "    try {\n" +
    "        const userId = req.header('userId');\n" +
    "        if (!userId) {\n" +
    "            return false;\n" +
    "        }\n" +
    "        return userManager.checkUser(userId);\n" +
    "    } catch (error) {\n" +
    "        return false;\n" +
    "    }\n" +
    "}\n" +
    "\n" +
    "function checkItinerary(id) {\n" +
    "    try {\n" +
    "        return itinerarioManager.checkItinerary(id);\n" +
    "    } catch (error) {\n" +
    "        return false;\n" +
    "    }\n" +
    "}\n" +
    "\n" +
    "module.exports = router;"


