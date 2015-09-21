require('datejs');
var config    = require('./config');
var prompt    = require('prompt');
var Nightmare = require('nightmare');
var colors    = require('colors');
var notifier  = require('node-notifier');
var CronJob   = require('cron').CronJob;
var Redis     = require('redis').createClient(config.redis.port, config.redis.host);

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

function enterHours (data) {
	var date = Date.parse(data.date),
	    date = (date.getMonth() + 1) + '/' + date.getDate() + '/' + date.getFullYear(),
	    shift1Start = data.shift1.split('-')[0].trim(),
	    shift1End   = data.shift1.split('-')[1].trim(),
	    shift2Start = data.shift2.split('-')[0].trim(),
	    shift2End   = data.shift2.split('-')[1].trim();

	// If you don't enter a time, then skip the entry.
	// This way, you can enter "-" or something to skip
	if (!parseInt(shift1Start[0], 10)) {
		shift1Start = shift1End = '';
	}
	if (!parseInt(shift2Start[0], 10)) {
		shift2Start = shift2End = '';
	}

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
			process.exit();
		});
}


if (process.argv[0] === 'node') {
	// Run manually
	var schema = {
		properties: {
			date: {
				description: 'Date',
				default: config.defaults.date
			},
			shift1: {
				description: 'Before lunch',
				default: config.defaults.shift1
			},
			shift2: {
				description: 'After lunch',
				default: config.defaults.shift2
			}
		}
	};
	prompt.start();
	prompt.get(schema, function (err, result) {
		if (err) throw err;
		enterHours(result);
	});
} else {
	// Run via forever
	var job = new CronJob(config.cron, function () {
		var date = Date.parse(config.defaults.date),
		    date = (date.getMonth() + 1) + '/' + date.getDate() + '/' + date.getFullYear(),
		    hash = 'paycheckrecords_' + date;

		Redis.get(hash, function (err, reply) {
			if (reply) return; // Hours already entered for today
			notifier.notify({
				title: 'Punch Clock',
				message: 'Are you working today?',
				sound: 'Ping',
				wait: true
			});
			notifier.on('click', function (notifierObject, options) {
				var expire = 60 * 60 * 24 * 7 * 2; // Two weeks
				Redis.setex(hash, expire, 'true');
				var data = config.defaults;
				enterHours(data);
			});
		});
	});
	job.start();
	console.log('Cron started');
}
