"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const mongoose_1 = __importDefault(require("mongoose"));
const flight_model_1 = __importDefault(require("./flight.model"));
const body_parser_1 = __importDefault(require("body-parser"));
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const app = (0, express_1.default)();
app.use(cors());
app.use('/images', express_1.default.static(path.join(__dirname, '../flights')));
const PORT = process.env.PORT || 3000;
const eurekaHelper = require('./eureka-helper');
app.listen(PORT, () => {
    console.log("flight-server on 3000");
});
eurekaHelper.registerWithEureka('flight-server', PORT);
app.use(body_parser_1.default.json());
const uri = "mongodb://127.0.0.1:27017/Flyware";
mongoose_1.default.connect(uri, (err) => {
    if (err)
        console.log(err);
    else
        console.log("Mongo Database connected successfully");
});
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'flights');
    },
    filename: (req, file, cb) => {
        cb(null, `${Date.now()}_${file.originalname}`); // Rename the file if necessary
    },
});
const upload = multer({ storage: storage }).single('image');
app.post('/flights', upload, (req, res) => {
    var _a, _b;
    console.log((_a = req.file) === null || _a === void 0 ? void 0 : _a.filename);
    const { duration, date, returnDate, departure, destination, price, nbBuisPlaces, nbEcoPlaces } = req.body;
    const imagePath = 'http://localhost:3000/images/' + ((_b = req.file) === null || _b === void 0 ? void 0 : _b.filename);
    const newFlight = new flight_model_1.default({
        duration,
        date,
        returnDate,
        departure,
        destination,
        price,
        nbBuisPlaces,
        nbEcoPlaces,
        imagePath,
    });
    newFlight.save((err, savedFlight) => {
        if (err) {
            console.log(err);
            return res.status(500).json({ error: 'Une erreur est survenue lors de l\'enregistrement du vol.' });
        }
        res.status(201).json(savedFlight);
    });
});
app.get("/flights", (req, resp) => {
    const page = parseInt(req.query.page) || 1;
    const pageSize = parseInt(req.query.size) || 10;
    const filter = {};
    if (req.query.departure) {
        filter.departure = req.query.departure;
    }
    if (req.query.destination) {
        filter.destination = req.query.destination;
    }
    if (req.query.date) {
        filter.date = req.query.date;
    }
    if (req.query.price) {
        filter.price = req.query.price;
    }
    if (req.query.returnDate) {
        filter.returnDate = req.query.returnDate;
    }
    flight_model_1.default.paginate(filter, { page: page, limit: pageSize }, (err, result) => {
        if (err) {
            resp.status(500).send(err);
        }
        else {
            resp.send(result);
        }
    });
});
app.get("/flights/:id", (req, resp) => {
    flight_model_1.default.findById(req.params.id, (err, flight) => {
        if (err)
            resp.status(500).send(err);
        else
            resp.send(flight);
    });
});
app.put("/flights/:id", upload, (req, resp) => {
    const flightId = req.params.id;
    const updateObject = {};
    updateObject.duration = req.body.duration;
    updateObject.date = req.body.date;
    if (req.body.returnDate) {
        updateObject.returnDate = req.body.returnDate;
    }
    else {
        updateObject.returnDate = null;
    }
    updateObject.departure = req.body.departure;
    updateObject.destination = req.body.destination;
    updateObject.price = req.body.price;
    updateObject.nbBuisPlaces = req.body.nbBuisPlaces;
    updateObject.nbEcoPlaces = req.body.nbEcoPlaces;
    if (req.file) {
        updateObject.imagePath = 'http://localhost:3000/images/' + req.file.filename;
    }
    flight_model_1.default.findByIdAndUpdate(flightId, { $set: updateObject }, (err, updatedFlight) => {
        if (err) {
            console.error(err);
            resp.status(500).json({ error: "Internal Server Error" });
        }
        else {
            resp.json(updateObject);
        }
    });
});
app.delete("/flights/:id", (req, resp) => {
    flight_model_1.default.findByIdAndDelete(req.params.id, req.body, (err) => {
        if (err) {
            console.error(err);
            resp.status(500).json({ error: "Internal Server Error" });
        }
        else {
            resp.json({ message: "Flight deleted successfully" });
        }
    });
});
app.get('/flightsSearch', (req, res) => {
    var _a, _b;
    const search = req.query.search || '';
    const page = parseInt(((_a = req.query.page) === null || _a === void 0 ? void 0 : _a.toString()) || '1');
    const size = parseInt(((_b = req.query.size) === null || _b === void 0 ? void 0 : _b.toString()) || '5');
    flight_model_1.default.paginate({ title: { $regex: ".*(?i)" + search + ".*" } }, { page: page, limit: size }, (err, flights) => {
        if (err)
            res.status(500).send(err);
        else
            res.send(flights);
    });
});
app.get("/destinations", (req, res) => {
    flight_model_1.default.distinct("destination", (err, destinations) => {
        if (err) {
            res.status(500).send(err);
        }
        else {
            res.json(destinations);
        }
    });
});
app.get("/departures", (req, res) => {
    flight_model_1.default.distinct("departure", (err, departures) => {
        if (err) {
            res.status(500).send(err);
        }
        else {
            res.json(departures);
        }
    });
});
app.get("/", (req, resp) => {
    resp.send("MCHA YACINE MCHA");
});
