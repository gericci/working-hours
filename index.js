var express = require('express');
var app = express();
var bodyParser = require('body-parser');
var multer = require('multer'); // v1.0.5
var upload = multer(); // for parsing multipart/form-data
var compression = require('compression');
var rp = require('request-promise');
var Q = require('q');

var googleApiKey =  process.argv[2];

app.use(bodyParser.json()); // for parsing application/json
app.use(bodyParser.urlencoded({ extended: true })); // for parsing application/x-www-form-urlencoded
app.use(compression());
app.use(express.static('public'));
app.set('view engine', 'ejs');

app.get('/', function(req, res) {

  res.render('index', { result: null, req: {TZ1:"lille", TZ2:"nyc", hfrom:"09:00", hto:"17:00"}, error: null });
});

app.post('/', function (req, res) {
	service(req, res, 'index');
});

app.post('/go', function (req, res) {
	service(req, res, 'result');
});

function service(req, res, pageToReturn){
  var city1 = req.body.TZ1
	  , city2 = req.body.TZ2
	  , startHour = parseInt(req.body.hfrom)
	  , endHour = parseInt(req.body.hto)
    , city1Coord
    , city2Coord
    , tz1
    , tz2
    , error;

  var deferred = Q.defer();
  var promise1 = getCoordinates(city1).then(function(val){
    city1Coord = val;
    return getTimeZone(city1Coord);
  }).then(function(val){
    tz1 = val;
    deferred.resolve();
  }).catch(function(){
    error = "An error occured with the city " + city1;
    deferred2.resolve();
  });

  var deferred2 = Q.defer();
  var promise2 = getCoordinates(city2).then(function(val){
    city2Coord = val;
    return getTimeZone(city2Coord);
  }).then(function(val){
    tz2 = val;
    deferred2.resolve();
  }).catch(function(){
    error = "An error occured with the city " + city2;
    deferred2.resolve();
  });
  var promises = [promise1, promise2];
  Q.allSettled(promises).then(function(){
    console.log(city1 + " => " + tz1);
    console.log(city2 + " => " + tz2);
    var result;
    if(!error){
      result = findBestTimeFrame(tz1, tz2, startHour, endHour);
      console.log(result);
      if(result.error){
        error = result.error;
      }
    }
    console.log(error)
    res.render(pageToReturn, { result: result, req: req.body, error: error });
  });
}

function getCoordinates(city){
  console.log("get coordinate" + city);
  city = encodeURIComponent(city);
  return rp({url:'https://maps.googleapis.com/maps/api/geocode/json?address='+city+'&key='+googleApiKey, json: true}).then(function (body) {
      return body.results[0].geometry.location.lat+","+body.results[0].geometry.location.lng;
  });
}
function getTimeZone(coords){
  console.log("get time zone" + coords);
  var now = new Date().getTime()/1000;
  return rp({url:'https://maps.googleapis.com/maps/api/timezone/json?location='+coords+'&timestamp='+now+'&key='+googleApiKey, json: true}).then(function (body) {
      return parseInt(body.rawOffset)/3600 + parseInt(body.dstOffset)/3600;
  });
}
function findBestTimeFrame(tz1, tz2, startHour, endHour){
  if(endHour < startHour){
    return {"error": "'From hour' should be before 'to hour'."};
  }
	var totalDifference = tz2 - tz1;
	console.log(totalDifference);
  if(totalDifference > 12){
    totalDifference = -24 + totalDifference;
  }
  if(totalDifference < -12){
    totalDifference = 24 + totalDifference;
  }
  console.log("totalDifference2 : "+totalDifference);
	var targetStartHour = (startHour + totalDifference);
	var targetEndHour = (endHour + totalDifference);

  //if(targetStartHour < 0) targetStartHour = 24 + targetStartHour;
  //if(targetEndHour < 0) targetEndHour = 24 + targetEndHour;
  //if(targetStartHour <= endHour && startHour <= targetEndHour){
  if(targetEndHour >= startHour && targetEndHour <= endHour || targetStartHour >= startHour && targetStartHour <= endHour||targetStartHour<=startHour && targetEndHour >= endHour){
    //overlap
    //targetStartHour = targetStartHour % 24;
    //targetEndHour = targetEndHour % 24;
    console.log(startHour);
    console.log(targetStartHour);
    var bestTargetStartHour = Math.max(startHour, targetStartHour);
    var bestTargetEndHour = Math.min(endHour, targetEndHour);
    var bestLocalStartHour = (bestTargetStartHour - totalDifference) % 24;
    var bestLocalEndHour = (bestTargetEndHour - totalDifference) % 24;
    if(bestLocalStartHour < 0) bestLocalStartHour = 24 + bestLocalStartHour;
    if(bestLocalEndHour < 0 ) bestLocalEndHour = 24 + bestLocalEndHour;
    console.log("target : " + bestTargetStartHour + " => " + bestTargetEndHour);
    console.log("local : " + bestLocalStartHour + " => " + bestLocalEndHour);
    return {
      bestTargetStartHour: bestTargetStartHour,
      bestTargetEndHour: bestTargetEndHour,
      bestLocalStartHour: bestLocalStartHour,
      bestLocalEndHour: bestLocalEndHour
    };
  }else{
    var newLocalStart = (startHour - totalDifference) % 24;
    var newLocalEnd = (endHour - totalDifference) % 24;
    if(newLocalStart < 0) newLocalStart = 24 + newLocalStart;
    if(newLocalEnd < 0) newLocalEnd = 24 + newLocalEnd;
    return {"error": "Sorry... no matching frame... you'll have to work between "+newLocalStart+" and "+newLocalEnd+"!"};
  }
}
app.listen(9999);
console.log('9999 is the magic port');
