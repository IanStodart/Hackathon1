var express = require('express')
var AWS = require('aws-sdk')
var fs = require('fs')	
var chokidar = require('chokidar')	// https://github.com/paulmillr/chokidar

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

app.get("/service", function(req, res) {
	// File watcher
	console.log("Watcher starting..")
	// Initialize watcher.
	var path = "C:\\Users\\sisim\\Desktop\\fileToWatch";
	var watcher = chokidar.watch(path, {
	  ignored: /(^|[\/\\])\../,
	  persistent: true
	});

	// Something to use when events are received.
	var log = console.log.bind(console);
	// Add event listeners.
	watcher
	  .on('add', function(path) {
	  	console.log("File Added");
	  	copyFileToS3(path);
	  })
	  .on('change', function(path) {
	  	console.log("File changed");
	  	copyFileToS3(path);
	  })
	  .on('unlink', function(path) {
	  	console.log("File removed");
	  	deleteFilefromS3(path);
	  })
	  .on('ready', function() {
	  	console.log("ready");
	  })
})

function copyFileToS3(fileName) {
	fs.readFile(fileName, function(err, data) {
		if (err) {
			console.log("Unable to upload file", err);
		} else {
			var params = { Bucket: bucket, Key: fileName, Body: data, ACL: "public-read" };
			s3.putObject(params, function(err, data) {
				if (err) {
					console.log("error uploading", err)
				} else {
					console.log("Successfully uploaded data to " + bucket, data);
					
				}
			})
		}
	})
}
function deleteFilefromS3(filePath) {
	var params = {Bucket: bucket, Key: filePath};
	s3.deleteObject(params, function(err, data) {
	    if (err) {
	        console.log(err)
	    } else {
	        console.log("Successfully removed data from " + bucket, data);
	    }
	})
}

app.get('/list', function(req, res){
	var params = {
	  Bucket: bucket	  
	};
	s3.listObjects(params, 	function(err, data){	  
	  for(var i = 0; i < data.Contents.length; i++) {
	  	data.Contents[i].Url = 'https://s3-us-west-1.amazonaws.com/ ' + data.Name + '/' + data.Contents[i].Key;
	  }	  
	  res.send(data.Contents);
	})
})

app.listen(5000, function() {
	console.log("App listening on port 5000...")
})