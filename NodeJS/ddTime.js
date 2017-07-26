var sqlite3 = require('sqlite3').verbose();
var fs = require('fs');
var colours = require("./lineColours.js");

var db = new sqlite3.Database(__dirname+'/../Database/factory_test.db');

var machineID = process.argv[3];
var secondsPeriod;
var rangeDays;
var range;
var timeInterval;
var timeIntervalSplit;

var temperatureData = new Array();
var temperatureTimestamps = new Array();
var amplData = new Array();
var amplTimestamps = new Array();
var forceData = new Array();
var forceTimestamps = new Array();
var powerData = new Array();
var powerTimestamps = new Array();


switch(process.argv[2]) {
  case "year":
    secondsPeriod = 2592000;
    range = '12 months';
    break;
  case "quarter":
    secondsPeriod = 604800;
    range = '3 months';
    break;
  case "month":
    secondsPeriod = 86400;
    range = '1 month';
    break;
  case "week":
    secondsPeriod = 3600;
    range = '7 days';
    break;
  case "day":
    secondsPeriod = 60;
    range = '1 day';
}
var currentDateTime = "2017-10-31 23:59";
var queryString;
if(process.argv[2] == "year") {
  queryString = "SELECT dataTypeID, strftime('%Y-%m', dataTimeStamp) interval, AVG(quantity) value FROM DeviceData WHERE machineID = "+machineID+" AND dataTimeStamp BETWEEN datetime('"+currentDateTime+"','-1 year') AND '"+currentDateTime+"' GROUP BY interval, dataTypeID ORDER BY interval";
} else {
  queryString = "SELECT dataTypeID, datetime((strftime('%s', dataTimeStamp)/"+secondsPeriod+")*"+secondsPeriod+", 'unixepoch') interval, AVG(quantity) value FROM DeviceData WHERE machineID = "+machineID+" AND dataTimeStamp BETWEEN datetime('"+currentDateTime+"','-"+range+"') AND '"+currentDateTime+"' GROUP BY interval, dataTypeID ORDER BY interval";
}

db.serialize(function() {
  db.each(queryString, function(err, row) {
  //db.each("SELECT dataTypeID, strftime('"+timeInterval+"', dataTimeStamp) interval, AVG(quantity) value FROM DeviceData WHERE machineID = "+machineID+" AND dataTimeStamp BETWEEN datetime('"+currentDateTime+"','-"+rangeDays+" day') AND '"+currentDateTime+"' GROUP BY interval, dataTypeID ORDER BY interval", function(err, row) {
    switch(row.dataTypeID) {
      case 1:
        temperatureData.push({x:row.interval, y: row.value});
        break;
      case 2:
        amplData.push({x:row.interval, y: row.value});
        break;
      case 3:
        forceData.push({x:row.interval, y: row.value});
        break;
      case 4:
        powerData.push({x:row.interval, y: (row.value)/100});
        break;
    }
  }, function(err, length) {
    console.log(powerData);
    //End
    var lineData = {
      datasets:[{
        label: "Temperature",
        fill: false,
        data: temperatureData,
        backgroundColor: colours.lineColours[0],
        borderColor: colours.lineColours[0]
      }, {
        label: "Vibrational Amplitude",
        fill: false,
        data: amplData,
        backgroundColor: colours.lineColours[1],
        borderColor: colours.lineColours[1]
      }, {
        label: "Machine Force",
        fill: false,
        data: forceData,
        backgroundColor: colours.lineColours[2],
        borderColor: colours.lineColours[2]
      }, {
        label: "Power Consumption",
        fill: false,
        data: powerData,
        backgroundColor: colours.lineColours[3],
        borderColor: colours.lineColours[3]
      }
    ]};
    fs.writeFile(__dirname+"/../JSON/machineConditionTime.json", JSON.stringify(lineData));
  });
});

db.close();
