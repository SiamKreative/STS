var compression = require('compression');
var express = require('express');
var TrackService = require('thailand-post').TrackService;
var app = express();
var bodyParser = require('body-parser');
var path = require('path');

// compress all responses
app.use(compression());

// configure app to use bodyParser()
// this will let us get the data from a POST
app.use(bodyParser.urlencoded({
	extended: true
}));
app.use(bodyParser.json());

// Set language
var trackService = new TrackService({
	lang: "EN"
});

// Show HTML template
app.get('/', function (req, res) {
	res.sendFile(__dirname + '/index.html');
});

// Serving static files
app.use('/assets', express.static(path.join(__dirname, 'assets')))

// Get an instance of the express Router
var router = express.Router();

// Middleware to use for all requests
router.use(function (req, res, next) {
	next();
});

router.route('/:code').get(function (req, res) {
	// Get tracking code from URL
	var trackCode = req.params.code;
	trackService.init(function (err, serv) {
		serv.getItem(trackCode, function (err, result) {
			var lastItem = result.ItemsData.Items.pop();
			// Create JSON endpoint to be displayed by vue.js
			var obj = {
				trackCode: trackCode,
				title: 'Success! Your item is located at ' + lastItem.Location,
				items: result.ItemsData.Items,
				lastItem: lastItem
			}
			res.status(200).json(obj);
		});
	});
});

// All of our routes will be prefixed with /api
app.use('/api', router);

app.listen(process.env.PORT || 5000);