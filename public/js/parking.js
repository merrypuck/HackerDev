var timeDistance = document.getElementById('timeDistance');
var meterDistance = document.getElementById('meterDistance');

function transitionUI() {
  var goBtn = document.getElementById('goBtn');
  var targetedLocation = document.getElementById('targetedLocation');
  var markerLocation = document.getElementById('markerLocation');
  // goBtn.style.display = 'none';
  goBtn.style.backgroundColor = '#27aa0b';
  goBtn.innerHTML = 'I FOUND PARKING!'
  //targetedLocation.style.display = 'none';
  targetedLocation.innerHTML = 'EXPECTED DISTANCE TO PARKING';
  markerLocation.style.display = 'none';

  var foundBtn = document.getElementById('foundBtn');
  var distanceFromDestination = document.getElementById('distanceFromDestination');
  
  if(foundBtn)
  {
  	foundBtn.style.display = 'block';
  	distanceFromDestination.style.display = 'block';
	}
  

}
function setTimeAndDistance(time, meters) {
  timeDistance.style.display = 'block';
  timeDistance.innerHTML = time;
  meterDistance.style.display = 'block';
  meterDistance.innerHTML = meters;
}


var goBtn = document.getElementById('goBtn');

goBtn.addEventListener('click', function() { 
	//map.setCenter(new google.maps.LatLng(32.0777415,34.7810515));

	//var lat = map.getCenter().lat();
	//var lng = map.getCenter().lng();

	var lat = 32.077535;
	var lng = 34.788547;

	console.log("There is an event listener " + map.getCenter());

	var xhr = new XMLHttpRequest();
    xhr.onreadystatechange = function() {
        transitionUI();

        if (xhr.readyState == 4) {


          var response = JSON.parse(xhr.responseText);
          console.log("Response = " );
          console.log(response);

          var startPt = new google.maps.LatLng(32.070276,34.794166);
          var endPt = new google.maps.LatLng(32.077535,34.788547);


          var request = getDirectionsCycleRequest(startPt, endPt, response);
          console.log("request = " );
        	console.log(request);
          getSmartDirections(map, startPt, endPt, request);

          // get walking directions
//          var lastResponse = response[response.length-1];

/*          console.log("last response = ");
          console.log(lastResponse);
          var walkingRequest = getWalkingDirections(
          	new google.maps.LatLng(lastResponse.lat, lastResponse.lon),
          	endPt);
          console.log("walking request " + walkingRequest);
          getDirections(google.maps.TravelMode.WALKING, map, walkingRequest); */
        }
    }
    xhr.open("GET", 'api/do-parkour?lat='+lat+'&lon='+lng, true);
    xhr.send();

    var dest_lat = startingLat;//32.077535;
    var dest_lon = startingLon;//34.788547;


    var xhr_parking_garage = new XMLHttpRequest();
    xhr_parking_garage.onreadystatechange = function() {
        if (xhr_parking_garage.readyState == 4) {

          var response = JSON.parse(xhr_parking_garage.responseText);
          console.log("Adding parking structures....");
          console.log(response);

          addParkingStructures(map, response);

        }
    }
    xhr_parking_garage.open("GET", 'api/parking-nearby?lat='+dest_lat+'&lon='+dest_lon ,true);
    xhr_parking_garage.send();


/* do stuff here*/ }, false);