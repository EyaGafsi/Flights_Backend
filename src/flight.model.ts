import mongoose from "mongoose";
import mongoosePaginate from "mongoose-paginate";


let flightSchema = new mongoose.Schema({
  duration: { type: String, required: true },
  date:{type: Date,required: true},
  returnDate:{type: Date,default:null},
  destination: { type: String, required: true },
  departure: { type: String, required: true },
  price: { type: Number, required: true },
  nbBuisPlaces:{ type: Number, required: true },
  nbEcoPlaces:{ type: Number, required: true },
  imagePath: { type: String, required: true },
});

flightSchema.plugin(mongoosePaginate);


const flight = mongoose.model("flight", flightSchema);

export default flight;
