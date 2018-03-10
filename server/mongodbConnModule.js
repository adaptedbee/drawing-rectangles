const config = require('./config/config');
const mongoose = require('mongoose');
mongoose.Promise = global.Promise;

module.exports.connect = () => {
	mongoose.connect(config.dbURL);
	let db = mongoose.connection;
	db.on('error', console.error.bind(console, "connection error"));
	db.once('open', (callback) => {
	  console.log('Connection Succeeded');
	});
	return db;
}
