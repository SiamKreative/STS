/**
 * Helper function to get URL parameters
 * http://stackoverflow.com/a/11582513
 */
function getURLParameter(name) {
	return decodeURIComponent((new RegExp('[?|&]' + name + '=' + '([^&;]+?)(&|#|;|$)').exec(location.search) || [null, ''])[1].replace(/\+/g, '%20')) || null;
}

// Display tracking info
new Vue({
	el: '#app',
	data: {
		loading: true,
		hasCode: false,
		trackCode: '',
		isLoaded: false,
		items: null
	},
	created: function () {
		this.fetchData();
	},
	methods: {
		fetchData: function () {
			var self = this;
			var trackCode = getURLParameter('track');
			if (trackCode) {
				self.hasCode = true;
				self.trackCode = trackCode;

				// Get API endpoint
				var apiEnpoint = '/api/' + trackCode;

				// Query our API and Update UI
				self.$http.get(apiEnpoint).then(function (response) {
					self.loading = false;
					self.isLoaded = true;
					self.items = response.body.items;
				})
			} else {
				console.log('No WORK');
			}
		}
	}
});