const request = require("supertest")
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