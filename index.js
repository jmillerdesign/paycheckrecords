require('datejs');
var config    = require('./config');
var prompt    = require('prompt');
var Nightmare = require('nightmare');
var colors = require('colors');

var schema = {
	properties: {
		date: {
			description: 'Date',
			default: 'today'
		},
		shift1: {
			description: 'Before lunch',
			default: '8a-11a'
		},
		shift2: {
			description: 'After lunch',
			default: '12p-5p'
		}
	}
};

prompt.start();
prompt.get(schema, function (err, result) {
	if (err) throw err;

	var date = Date.parse(result.date),
	    date = (date.getMonth() + 1) + '/' + date.getDate() + '/' + date.getFullYear(),
	    shift1Start = result.shift1.split('-')[0].trim(),
	    shift1End   = result.shift1.split('-')[1].trim()
	    shift2Start = result.shift2.split('-')[0].trim(),
	    shift2End   = result.shift2.split('-')[1].trim()

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
