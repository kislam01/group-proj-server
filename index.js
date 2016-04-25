var express = require('express');
var bodyParser = require('body-parser');
var validator = require('validator');
var app = express();
var event_arr = [];

app.set('port', (process.env.PORT || 5000));

app.use(bodyParser.json());

app.use(bodyParser.urlencoded({ extended: true }));

// enable CORS
app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});

var mongoUri = process.env.MONGODB_URI || process.env.MONGOLAB_URI || process.env.MONGOHQ_URL || 'mongodb://localhost/lit-savannah-48405';
var MongoClient = require('mongodb').MongoClient, format = require('util').format;
var db = MongoClient.connect(mongoUri, function(error, databaseConnection) {
	db = databaseConnection;
});

app.use(express.static(__dirname + '/public'));


app.post('/sendData', function(request, response) {
	
	response.set('Content-Type', 'application/json');
	
	var login = request.body.login;	
	var event_name = request.body.event_name;
	var event_date = request.body.event_date;
	var event_time = request.body.event_time;
	var event_location = request.body.event_location;
	var lat = parseFloat(request.body.lat);
	var lng = parseFloat(request.body.lng);
	var created_at = new Date();
	
		
	if ((login == undefined) || (login == "") || (lat == undefined) || (lat == "") || (lng == undefined) || (lng == "")) {
		
		response.send(JSON.stringify({"error":"Whoops, something is wrong with your data!"}));
	}else {
		var toInsert = {
				"login": login,
				"event_name": event_name,
				"event_date": event_date,
				"event_time": event_time,
				"event_location": event_location,
				"lat": lat,
				"lng": lng,
				"created_at": created_at, 
		};
		
		db.collection('event_checkins',function(error,coll) {
			var id = coll.insert(toInsert, function(error, saved) {
					if (error){
						response.send(500);
					}else{
						coll.find().toArray(function(err, event_cursor) {
							event_arr = event_cursor;
							response.send(event_arr);										
						});
					}	
				});	
		});		
	}	
});	


app.listen(app.get('port'), function() {
  console.log('Node app is running on port', app.get('port'));
});
