const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const RectangleSchema = new Schema({
  x: Number,
  y: Number,
  width: Number,
  height: Number,
  fill: String,
  draggable: Boolean,
  opacity: Number
});

const Rectangle = mongoose.model('Rectangle', RectangleSchema);
module.exports = Rectangle;
