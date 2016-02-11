require('datejs');
const config    = require('./config');
const chalk     = require('chalk');
const CronJob   = require('cron').CronJob;
const dialog    = require('dialog');
const Nightmare = require('nightmare');
const prompt    = require('prompt');

function enterHours(params) {
	var date = Date.parse(params.date),
	    date = (date.getMonth() + 1) + '/' + date.getDate() + '/' + date.getFullYear(),
	    shift1Start = params.shift1.split('-')[0].trim(),
	    shift1End   = params.shift1.split('-')[1].trim(),
	    shift2Start = params.shift2.split('-')[0].trim(),
	    shift2End   = params.shift2.split('-')[1].trim();

	// If you don't enter a time, then skip the entry.
	// This way, you can enter "-" or something to skip
	if (!parseInt(shift1Start[0], 10)) {
		shift1Start = shift1End = '';
	}
	if (!parseInt(shift2Start[0], 10)) {
		shift2Start = shift2End = '';
	}

	new Nightmare({show: false})
		.goto('https://www.paycheckrecords.com/login.jsp')
		.insert('#ius-userid', config.username)
		.insert('#ius-password', config.password)
		.click('#ius-sign-in-submit-btn')
		.wait('#date')
		.insert('#date', date)
		.insert('#startTime', shift1Start)
		.insert('#endTime', shift1End)
		.click('#addTimeCardLine')
		.wait(1000) // Wait for ajax to submit
		.wait('#date')
		.insert('#date', date)
		.type('#startTime') // Handle error when first shift already existed
		.insert('#startTime', shift2Start)
		.type('#endTime')   // Handle error when first shift already existed
		.insert('#endTime', shift2End)
		.click('#addTimeCardLine')
		.run(function (err) {
			if (err) throw err;

			console.log(chalk.green('Done adding hours for ' + date));
		})
		.end();
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
	prompt.start().get(schema, function (err, result) {
		if (err) throw err;

		enterHours(result);
	});
} else {
	// Run via forever
	new CronJob(config.cron, function () {
		dialog.info('Did you work normal hours today?', 'Paycheck Records', ['No', 'Yes'], function (err, result) {
			if (err) throw err;

			if (result.trim() === 'button returned:Yes') {
				enterHours(config.defaults);
			}
		});
	}).start();
}
