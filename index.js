var username    = '',
    password    = '',
    shift1Start = '8a',
    shift1End   = '12p',
    shift2Start = '1p',
    shift2End   = '5p',
    // Default to today, or you can manually set a date
    date        = (new Date().getMonth() + 1) + '/' + new Date().getDate() + '/' + new Date().getFullYear(),
    // date        = '10//2014',
    Nightmare   = require('nightmare');

if (!username) console.error('Missing username');
if (!password) console.error('Missing password');
if (!date)     console.error('Missing date');

new Nightmare()
	.goto('https://www.paycheckrecords.com/login.jsp')
	.type('#userStrId', username)
	.type('#password', password)
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
		if (err) return console.error(err);
		console.log('Done adding hours for ' + date);
	});
