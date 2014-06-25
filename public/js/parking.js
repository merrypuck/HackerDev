var timeDistance = document.getElementById('timeDistance');
var meterDistance = document.getElementById('meterDistance');

function transitionUI() {
  var goBtn = document.getElementById('goBtn');
  var targetedLocation = document.getElementById('targetedLocation');
  var markerLocation = document.getElementById('markerLocation');
  goBtn.style.display = 'none';
  targetedLocation.style.display = 'none';
  markerLocation.style.display = 'none';

  var foundBtn = document.getElementById('foundBtn');
  var distanceFromDestination = document.getElementById('distanceFromDestination');
  
  foundBtn.style.display = 'block';
  distanceFromDestination.style.display = 'block';

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

	var lat = map.getCenter().lat();
	var lng = map.getCenter().lng();

	console.log("There is an event listener " + map.getCenter());

	var xhr = new XMLHttpRequest();
    xhr.onreadystatechange = function() {
        transitionUI();

        if (xhr.readyState == 4) {

          var response = JSON.parse(xhr.responseText);
          console.log(response);
        }
    }
    xhr.open("GET", 'api/do-parkour?lat='+lat+'&lon='+lng ,true);
    xhr.send();


/* do stuff here*/ }, false);