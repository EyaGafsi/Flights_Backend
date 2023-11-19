"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const mongoose_paginate_1 = __importDefault(require("mongoose-paginate"));
//import AutoIncrement from 'mongoose-auto-increment';
// Connect the mongoose-auto-increment plugin
//AutoIncrement.initialize(mongoose.connection);
let flightSchema = new mongoose_1.default.Schema({
    // FNumber: { type: Number, required: true },
    duration: { type: String, required: true },
    date: { type: Date, required: true },
    returnDate: { type: Date, default: null },
    destination: { type: String, required: true },
    departure: { type: String, required: true },
    price: { type: Number, required: true },
    nbBuisPlaces: { type: Number, required: true },
    nbEcoPlaces: { type: Number, required: true },
    imagePath: { type: String, required: true },
});
flightSchema.plugin(mongoose_paginate_1.default);
//flightSchema.plugin(AutoIncrement.plugin, { model: 'flight', field: 'FNumber', startAt: 1 });
const flight = mongoose_1.default.model("flight", flightSchema);
exports.default = flight;
