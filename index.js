require('datejs');
var config    = require('./config');
var prompt    = require('prompt');
var Nightmare = require('nightmare');
var colors    = require('colors');

// Monkey patch for https://github.com/segmentio/nightmare/issues/126
(function () {
	var sockjs = require('nightmare/node_modules/phantom/node_modules/shoe/node_modules/sockjs');
	if (!sockjs._createServerOld) {
		sockjs._createServerOld = sockjs.createServer;
		sockjs.createServer = function (options) {
			if (!options) {
				options = {};
			}
			if (!('heartbeat_delay' in options)) {
				options.heartbeat_delay = 200;
			}
			return sockjs._createServerOld(options);
		};
	}
})();

var schema = {
	properties: {
		date: {
			description: 'Date',
			default: 'today'
		},
		shift1: {
			description: 'Before lunch',
			default: '8a-12p'
		},
		shift2: {
			description: 'After lunch',
			default: '1p-5p'
		}
	}
};

prompt.start();
prompt.get(schema, function (err, result) {
	if (err) throw err;

	var date = Date.parse(result.date),
	    date = (date.getMonth() + 1) + '/' + date.getDate() + '/' + date.getFullYear(),
	    shift1Start = result.shift1.split('-')[0].trim(),
	    shift1End   = result.shift1.split('-')[1].trim(),
	    shift2Start = result.shift2.split('-')[0].trim(),
	    shift2End   = result.shift2.split('-')[1].trim();

	new Nightmare()
		.goto('https://www.paycheckrecords.com/login.jsp')
		.type('#userStrId', config.username)
		.type('#password', config.password)
		.click('#Login')
		.wait()
		.type('#date', date)
		.type('#startTime', shift1Start)
		.type('#endTime', shift1End)
		.click('#addTimeCardLine')
		.wait()
		.type('#date', date)
		.type('#startTime', shift2Start)
		.type('#endTime', shift2End)
		.click('#addTimeCardLine')
		.wait()
		.run(function (err, nightmare) {
			if (err) throw err;

			console.log(('Done adding hours for ' + date).green);
		});
});
