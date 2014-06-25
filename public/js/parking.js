var goBtn = document.getElementById('goBtn');

goBtn.addEventListener('click', function() { 
	//map.setCenter(new google.maps.LatLng(32.0777415,34.7810515));

	var lat = map.getCenter().lat();
	var lng = map.getCenter().lng();

	console.log("There is an event listener " + map.getCenter());

	var xhr = new XMLHttpRequest();
    xhr.onreadystatechange = function() {
        if (xhr.readyState == 4) {

          var response = JSON.parse(xhr.responseText);
          console.log(response);

          var startPt = new google.maps.LatLng(32.070276,34.794166);
          var endPt = new google.maps.LatLng(32.077535,34.788547);

          var request = getDirectionsCycleRequest(startPt, endPt, response);
          getSmartDirections(map, startPt, endPt, request);
        }
    }
    xhr.open("GET", 'api/do-parkour?lat='+lat+'&lon='+lng ,true);
    xhr.send();

    var dest_lat = 32.077535;
    var dest_lon = 34.788547;


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