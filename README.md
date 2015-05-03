# Paycheck Records

A CLI prompt to quickly enter in hours at paycheckrecords.com.

Their web interface is too tedious and slow.

---

## Installation

1. Clone this repo
2. ```npm install```
3. Create and edit ```config.js```

## Usage

### Run once

1. ```npm start```
2. Enter the date and hours in the prompt

		If you just press return at the prompt, it will use the defaults. Otherwise, you can enter in a date and time range for each prompt. The date is parsed using datejs, so you can enter "yesterday" or "monday" or "6/1" and it will work. The time range must contain "-" with a start and end time for each prompt. If you want to skip a shift, then just enter "-" only.

### Run automatically

1. ```forever start index.js```

		Starts up a cron that triggers a notification center alert Monday through Friday at 9:30am (by default). The cron can obviously be changed to any interval with the config. If you click the alert, your default hours will be added. If the alert is ignored nothing happens.

## Author

* [J. Miller](https://github.com/jmillerdesign)

### Contributor

* [ReedD](https://github.com/ReedD)

