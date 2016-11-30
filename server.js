var compression = require('compression');
var express = require('express');
var TrackService = require('thailand-post').TrackService;
var app = express();
var minifyHTML = require('express-minify-html');
var path = require('path');

// Set language
var trackService = new TrackService({
	lang: "EN"
});

// Set language
app.set('view engine', 'ejs');

// GZIP compress all responses
app.use(compression());

// Minify HTML
app.use(minifyHTML({
	override: true,
	exception_url: false,
	htmlMinifier: {
		removeComments: true,
		collapseWhitespace: true,
		collapseBooleanAttributes: true,
		removeAttributeQuotes: true,
		removeEmptyAttributes: true,
		minifyJS: true
	}
}));

// viewed at http://localhost:8080
app.get('/', function (req, res) {

	// Get tracking code from URL
	var trackCode = req.query.track;

	if (trackCode) {

		trackService.init(function (err, serv) {
			serv.getItem(trackCode, function (err, result) {
				var lastItem = result.ItemsData.Items.slice(-1)[0];

				res.render('index', {
					trackCode: trackCode,
					title: 'Success! Your item is located at ' + lastItem.Location,
					items: result.ItemsData.Items,
					lastItem: lastItem
				});
			});
		});

	} else {
		res.render('error', {
			title: 'Error! Tracking code not found or invalid'
		});
	}

});

app.listen(process.env.PORT || 5000);