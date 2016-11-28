var express = require('express');
var TrackService = require('thailand-post').TrackService;
var app = express();
var path = require('path');

// Set language
var trackService = new TrackService({
	lang: "EN"
});

// Set language
app.set('view engine', 'ejs');

// viewed at http://localhost:8080
app.get('/', function (req, res) {

	// Get tracking code from URL
	var trackCode = req.query.track;

	if (trackCode) {

		trackService.init(function (err, serv) {
			serv.getItem(trackCode, function (err, result) {
				var lastItem = result.ItemsData.Items.pop();

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