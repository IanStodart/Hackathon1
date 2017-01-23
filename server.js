var express = require('express')
var AWS = require('aws-sdk')
var fs = require('fs')	
var chokidar = require('chokidar');	// https://github.com/paulmillr/chokidar

var app = express()
var s3 = new AWS.S3();	// S3 service object

// Loading credentials 
AWS.config.loadFromPath('./config.json');

// Defining bucket to be used in S3
var bucket = 'cs499-hackaton1';

// Enabling CORS
app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});

// Show main page
app.get('/', function(req, res) {
	res.sendfile('index.html')
})



app.listen(5000, function() {
	console.log("App listening on port 5000...")
})