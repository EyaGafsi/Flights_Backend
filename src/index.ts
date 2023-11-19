import express, { Request, Response } from "express";
import mongoose from "mongoose";
import Flight from "./flight.model";
import bodyParser from "body-parser";

const cors = require('cors');
const multer = require('multer');
const path = require('path');


const app = express();
app.use(cors());
app.use('/images', express.static(path.join(__dirname, '../flights')));
const PORT = process.env.PORT || 3000;
const eurekaHelper = require('./eureka-helper');

app.listen(PORT, () => {
  console.log("flight-server on 3000");
});

eurekaHelper.registerWithEureka('flight-server', PORT);
app.use(bodyParser.json());

const uri = "mongodb://127.0.0.1:27017/Flyware";
mongoose.connect(uri, (err) => {
  if (err) console.log(err);
  else console.log("Mongo Database connected successfully");
});


const storage = multer.diskStorage({
  destination: (req:Request, file:any, cb:any) => {
    cb(null, 'flights');
  },
  filename: (req:Request, file:any, cb:any) => {
    cb(null, `${Date.now()}_${file.originalname}`); // Rename the file if necessary
  },
});

const upload = multer({ storage: storage }).single('image');
app.post('/flights', upload, (req, res) => {
  console.log(req.file?.filename);

  const { duration,date,returnDate, departure, destination, price,nbBuisPlaces,nbEcoPlaces } = req.body;
  const imagePath = 'http://localhost:3000/images/' + req.file?.filename;

  const newFlight = new Flight({
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



app.get("/flights", (req: Request, resp: Response) => {
  const page = parseInt(req.query.page as string) || 1;
  const pageSize = parseInt(req.query.size as string) || 10;

  Flight.paginate({}, { page: page, limit: pageSize }, (err, result) => {
    if (err) {
      resp.status(500).send(err);
    } else {
      resp.send(result);
    }
  });
});

app.get("/flights/:id", (req: Request, resp: Response) => {
  Flight.findById(req.params.id, (err: any, flight: any) => {
    if (err) resp.status(500).send(err);
    else resp.send(flight);
  });
});
app.put("/flights/:id", upload, (req: Request, resp: Response) => {
  const flightId = req.params.id;

  const updateObject: any = {};
  updateObject.duration = req.body.duration;
  updateObject.date = req.body.date;
  if(req.body.returnDate) {  updateObject.returnDate = req.body.returnDate;
  }else{  updateObject.returnDate = null;
  }
  updateObject.departure = req.body.departure;
  updateObject.destination = req.body.destination;
  updateObject.price = req.body.price;
  updateObject.nbBuisPlaces = req.body.nbBuisPlaces;
  updateObject.nbEcoPlaces = req.body.nbEcoPlaces;
  if (req.file) {
    updateObject.imagePath = 'http://localhost:3000/images/' + req.file.filename;
  }

  Flight.findByIdAndUpdate(flightId, { $set: updateObject }, (err:any, updatedFlight:any) => {
    if (err) {
      console.error(err);
      resp.status(500).json({ error: "Internal Server Error" });
    } else {
      resp.json(updateObject);
    }
    
  });
});


app.delete("/flights/:id", (req: Request, resp: Response) => {
  Flight.findByIdAndDelete(req.params.id, req.body, (err: any) => {
    if (err) {
      console.error(err);
      resp.status(500).json({ error: "Internal Server Error" });
    } else {
      resp.json({ message: "Flight deleted successfully" });
    }
  });
});


app.get('/flightsSearch', (req: Request, res: Response) => {
  const search = req.query.search || '';
  const page: number = parseInt(req.query.page?.toString() || '1');
  const size: number = parseInt(req.query.size?.toString() || '5');

  Flight.paginate({ title: { $regex: ".*(?i)" + search + ".*" } }, { page: page, limit: size }, (err: any, flights: any) => {
    if (err) res.status(500).send(err);
    else res.send(flights);
  });
});

app.get("/", (req, resp) => {
  resp.send("MCHA YACINE MCHA");
});
