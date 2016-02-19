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

### Run daily

1. ```crontab -e```
2. ```0 17 * * 1-5 /usr/local/opt/node/bin/node /path/to/paycheckrecords/index.js```

	Starts up a cron that triggers a dialog prompt Monday through Friday at 5pm (by default). If you click Yes in the dialog, your default hours will be added.

## Author

* [J. Miller](https://github.com/jmillerdesign)
