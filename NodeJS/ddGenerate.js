var sqlite3 = require('sqlite3').verbose();
var fs = require('fs');
var colours = require("./barColours.js");

var db = new sqlite3.Database(__dirname+'/../Database/factory_test.db');

var machineNames = new Array();

//Temperature
var temperatureData = new Array();
var tempPrevAv = new Array();
//Vibrational Amplitude
var amplData = new Array();
var amplPrevAv = new Array();
//Force
var forceData = new Array();
var forcePrevAv = new Array();
//Power
var powerData = new Array();
var powerPrevAv = new Array();

console.time("timer");
db.serialize(function() {
  //Temperature Data
  db.each("SELECT m.machineName name, dd.quantity quantity FROM DeviceData dd, Machine m WHERE dd.machineID = m.machineID AND dd.dataTypeID = 1 AND dd.dataTimeStamp = (SELECT dataTimeStamp FROM DeviceData ORDER BY dataTimeStamp DESC LIMIT 1)", function(err, row) {
    machineNames.push(row.name);
    temperatureData.push(row.quantity);
  });
  db.each("SELECT AVG(quantity) averageTemperature FROM DeviceData WHERE dataTypeID = 1 AND dataTimeStamp BETWEEN datetime((SELECT dataTimeStamp FROM DeviceData ORDER BY dataTimeStamp DESC LIMIT 1),'-1 day') AND (SELECT dataTimeStamp FROM DeviceData ORDER BY dataTimeStamp DESC LIMIT 1) GROUP BY machineID", function(err, row) {
    tempPrevAv.push(row.averageTemperature);
  }, function(err, length) {
    var temperatureStruct =
    {
      labels:machineNames,
      datasets:[{
        data:temperatureData,
        label:"Current Temperature",
        backgroundColor:colours.fillColours[0],
        borderColor:colours.borderColours[0]},{
          data:tempPrevAv,
          label:"Previous Day Average",
          backgroundColor:colours.fillColours[1],
          borderColor:colours.borderColours[1]
        }]};
    fs.writeFileSync(__dirname+"/../JSON/temperatureDash.json", JSON.stringify(temperatureStruct));
  });

  //Amplitude Data
  db.each("SELECT quantity FROM DeviceData WHERE dataTypeID = 2 AND dataTimeStamp = (SELECT dataTimeStamp FROM DeviceData ORDER BY dataTimeStamp DESC LIMIT 1)", function(err, row) {
    amplData.push(row.quantity);
  });
  db.each("SELECT AVG(quantity) averageAmpl FROM DeviceData WHERE dataTypeID = 2 AND dataTimeStamp BETWEEN datetime((SELECT dataTimeStamp FROM DeviceData ORDER BY dataTimeStamp DESC LIMIT 1),'-1 day') AND (SELECT dataTimeStamp FROM DeviceData ORDER BY dataTimeStamp DESC LIMIT 1) GROUP BY machineID", function(err, row) {
    amplPrevAv.push(row.averageAmpl);
  }, function(err, length) {
    var amplStruct =
    {
      labels:machineNames,
      datasets:[{
        data:amplData,
        label:"Current Vibration Amplitude",
        backgroundColor:colours.fillColours[0],
        borderColor:colours.borderColours[0]},{
          data:amplPrevAv,
          label:"Previous Day Average",
          backgroundColor:colours.fillColours[1],
          borderColor:colours.borderColours[1]
        }]};
    fs.writeFileSync(__dirname+"/../JSON/amplDash.json", JSON.stringify(amplStruct));
  });

  //Force Data
  db.each("SELECT quantity FROM DeviceData WHERE dataTypeID = 3 AND dataTimeStamp = (SELECT dataTimeStamp FROM DeviceData ORDER BY dataTimeStamp DESC LIMIT 1)", function(err,row) {
    forceData.push(row.quantity);
  });
  db.each("SELECT AVG(quantity) averageForce FROM DeviceData WHERE dataTypeID = 3 AND dataTimeStamp BETWEEN datetime((SELECT dataTimeStamp FROM DeviceData ORDER BY dataTimeStamp DESC LIMIT 1),'-1 day') AND (SELECT dataTimeStamp FROM DeviceData ORDER BY dataTimeStamp DESC LIMIT 1) GROUP BY machineID", function(err, row) {
    forcePrevAv.push(row.averageForce);
  }, function(err,length) {
    var forceStruct =
    {
      labels:machineNames,
      datasets:[{
        data:forceData,
        label:"Current Machine Force",
        backgroundColor:colours.fillColours[0],
        borderColor:colours.borderColours[0]},{
          data:forcePrevAv,
          label:"Previous Day Average",
          backgroundColor:colours.fillColours[1],
          borderColor:colours.borderColours[1]
        }]};
    fs.writeFileSync(__dirname+"/../JSON/forceDash.json", JSON.stringify(forceStruct));
  });

  //Power Data
  db.each("SELECT quantity FROM DeviceData WHERE dataTypeID = 4 AND dataTimeStamp = (SELECT dataTimeStamp FROM DeviceData ORDER BY dataTimeStamp DESC LIMIT 1)", function(err,row) {
    powerData.push(row.quantity);
  });
  db.each("SELECT AVG(quantity) averageForce FROM DeviceData WHERE dataTypeID = 4 AND dataTimeStamp BETWEEN datetime((SELECT dataTimeStamp FROM DeviceData ORDER BY dataTimeStamp DESC LIMIT 1),'-1 day') AND (SELECT dataTimeStamp FROM DeviceData ORDER BY dataTimeStamp DESC LIMIT 1) GROUP BY machineID", function(err, row) {
    powerPrevAv.push(row.averageForce);
  }, function(err,length) {
    var powerStruct =
    {
      labels:machineNames,
      datasets:[{
        data:powerData,
        label:"Current Power Consumption",
        backgroundColor:colours.fillColours[0],
        borderColor:colours.borderColours[0]},{
          data:powerPrevAv,
          label:"Previous Day Average",
          backgroundColor:colours.fillColours[1],
          borderColor:colours.borderColours[1]
        }]};
    fs.writeFileSync(__dirname+"/../JSON/powerDash.json", JSON.stringify(powerStruct));
    console.timeEnd("timer");
  });

});
db.close();
