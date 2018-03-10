const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
// const morgan = require('morgan');
const config = require('./config/config');

const app = express();

// app.use(morgan('combined'));
app.use(bodyParser.json());
app.use(cors());

app.use(express.static(__dirname + '/public'));

const mongodb_conn_module = require('./mongodbConnModule');
const db = mongodb_conn_module.connect();

const Rectangle = require('./models/rectangle');

app.get('/rectangles', (req, res) => {
	Rectangle.find({}, (error, rectangles) => {
		if (error) {
			console.error(error);
		}
		res.send({
			rectangles: rectangles
		});
	});
});

app.post('/add_rectangle', (req, res) => {
	const newRectangle = new Rectangle({
		x: req.body.x,
		y: req.body.y,
		width: req.body.width,
		height: req.body.height,
		fill: req.body.fill,
		draggable: req.body.draggable,
		opacity: req.body.opacity
	});

	newRectangle.save((error) => {
		if (error) {
			console.log(error)
		}
		res.send({
			rectangle: newRectangle
		});
	});
});

app.put('/rectangles/:id', (req, res) => {
	Rectangle.findById(req.params.id, (error, rectangle) => {
		if (error) {
			console.error(error);
		}

		rectangle.x = req.body.x;
		rectangle.y = req.body.y;
		rectangle.save((error) => {
			if (error) {
				console.log(error);
			}
			res.send({
				success: true
			});
		});
	});
});

app.delete('/rectangles/:id', (req, res) => {
	Rectangle.remove({
		_id: req.params.id
	}, (err, rectangle) => {
		if (err) {
			res.send(err);
		}
		res.send({
			success: true
		});
	});
});

app.listen(process.env.PORT || config.port);
