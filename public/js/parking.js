var goBtn = document.getElementById('goBtn');

goBtn.addEventListener('click', function() { 
	map.setCenter(new google.maps.LatLng(32.0777415,34.7810515));

	var lat = map.getCenter().lat();
	var lng = map.getCenter().lng();

	console.log("There is an event listener " + map.getCenter());

	var xhr = new XMLHttpRequest();
    xhr.onreadystatechange = function() {
        if (xhr.readyState == 4) {

          var response = JSON.parse(xhr.responseText);
          console.log(response);
        }
    }
    xhr.open("GET", 'api/do-parkour?lat='+lat+'&lon='+lng ,true);
    xhr.send();


/* do stuff here*/ }, false);