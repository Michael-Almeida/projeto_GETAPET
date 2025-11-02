const mongoose = require("../db/conn");

const { Schema } = mongoose;

const Pet = mongoose.model(
  "Pet",
  new Schema(
    {
      name: { type: string, required: true },
      age: { type: Number, required: true },
      weight: { type: Number, required: true },
      color: { type: String },
      image: { type: Array, required: true },
      avaliable: { type: Boolean },
      user: Object,
      adopter: Object
    },
    { timestaps: true }
  )
);

module.exports = Pet;
