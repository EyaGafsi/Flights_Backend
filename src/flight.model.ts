import mongoose from "mongoose";
import mongoosePaginate from "mongoose-paginate";
//import AutoIncrement from 'mongoose-auto-increment';

// Connect the mongoose-auto-increment plugin
//AutoIncrement.initialize(mongoose.connection);

let flightSchema = new mongoose.Schema({
// FNumber: { type: Number, required: true },
  departureDate: { type: String, required: true },
  arrivingDate: { type: String, required: true },
  destination: { type: String, required: true },
  price: { type: Number, required: true },
  imagePath: { type: String, required: true },
});

flightSchema.plugin(mongoosePaginate);

//flightSchema.plugin(AutoIncrement.plugin, { model: 'flight', field: 'FNumber', startAt: 1 });

const flight = mongoose.model("flight", flightSchema);

export default flight;
