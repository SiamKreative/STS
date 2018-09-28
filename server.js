const compression = require('compression');
const express = require('express')
const TrackService = require('thailand-post').TrackService;
const app = express()
const bodyParser = require('body-parser');
const puppeteer = require('puppeteer')
const path = require('path');

// compress all responses
app.use(compression());

// configure app to use bodyParser()
// this will let us get the data from a POST
app.use(bodyParser.urlencoded({
	extended: true
}));
app.use(bodyParser.json());

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

router.route('/:emsid').get(function (req, res) {
	var emsid = req.params.emsid;
	console.log(" Checking emsid: " + emsid);
	(async () => {
		const browser = await puppeteer.launch({
			headless: true
		}); // default is true (not show chrome)
		const page = await browser.newPage();
		await page.goto('http://track.thailandpost.co.th/tracking/default.aspx?lang=en', {
			"waitUntil": "networkidle2"
		});

		// enter EMS code
		await page.type('#TextBarcode', emsid);

		// move the slider
		const e = await page.$('.bgSlider');
		const box = await e.boundingBox();
		await page.mouse.move(box.x + 5, box.y + 5);
		await page.mouse.down();
		await page.mouse.move(box.x + box.width, box.y + 5); // slide
		await page.mouse.up();

		// wait for page to reload
		await page.waitForNavigation();

		// Read HTMl table to array
		const data = await page.evaluate(() => {
			const tds = Array.from(document.querySelectorAll(
				"table:nth-child(3)"
			))
			return tds.map(td => {
				var txt = td.innerText.replace(/<a [^>]+>[^<]*<\/a>/g, '').trim();
				return txt;
			});
		});

		// Modify output format
		data[1] = data[1].replace(/\t/g, ' ');
		var tracking = data[1].split("\n");
		tracking.shift(); // remove วันที่ / เวลา หน่วยงาน  คำอธิบาย  ผลการนำจ่าย
		var status = [];

		// combine 2 element(date and status) into 1 element
		for (var i = 0; i + 1 <= tracking.length; i += 2) {
			temp = tracking[i + 1].split(" "); // 18:02:14 น. สำเหร่  รับเข้าระบบ   
			temp[3] = "=> " + temp[3].trim(); // change สำเหร่  รับเข้าระบบ to  สำเหร่ => รับเข้าระบบ
			tracking[i + 1] = temp.join(" ");
			status.push(tracking[i] + tracking[i + 1]);

			// Create object that will be used by vue.js
			var obj = {
				date: tracking[i],
				time: '',
				location: '',
				description: ''
			}
			status.push(obj);
		}

		// status = JSON.stringify(status);
		// console.log(" " + status);
		console.log(status);
		res.status(200).json(status);
		await browser.close();
	})();
})

// All of our routes will be prefixed with /api
app.use('/api', router);

app.listen(process.env.PORT || 5000);
