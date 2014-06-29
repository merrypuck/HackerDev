/***** GLOBALS *****/
var previousPage = "";
var map, GeoMarker;
var markerLocation = document.getElementById('markerLocation');
var directionsDisplay;
var directionsService = new google.maps.DirectionsService();


// page switching
 var switchPage = function(currentPage, newPage) {
  var currentPage = document.getElementById(currentPage);
  var newPage = document.getElementById(newPage);
  
    currentPage.style.display = 'none';
    newPage.style.display = 'block';
    previousPage = currentPage;
 }

function initialize() {
  
  directionsDisplay = new google.maps.DirectionsRenderer();
  // var myLatlng = new google.maps.LatLng(37.790234970864, -122.39031314844);
  var mapOptions = {
      center: new google.maps.LatLng(32.0820517821256, 34.78862497459524),
      zoom: 14,
      mapTypeId: google.maps.MapTypeId.ROADMAP,
      disableDefaultUI: true
  };
  map = new google.maps.Map(document.getElementById('map-canvas'), mapOptions);
 
  var GeoMarker = new GeolocationMarker(map);

   GeoMarker = new GeolocationMarker();
//    GeoMarker.setCircleOptions(

    google.maps.event.addListenerOnce(GeoMarker, 'position_changed', function() {
      //map.setCenter(this.getPosition());
      // map.fitBounds(this.getBounds());
      console.log('position changed.')
    });

    google.maps.event.addListener(GeoMarker, 'geolocation_error', function(e) {
      alert('There was an error obtaining your position. Message: ' + e.message);
    });

    GeoMarker.setMap(map);

        
/*
      var marker = new google.maps.Marker({
          position: myLatlng,
          map: map,
          title: 'Hello World!'
      });    
        
*/
    }
  function add_marker( event ) {
    lat = event.latLng.lat;
    lng = event.latLng.lng;
    console.log(lat);
    console.log(lng);
    // ajax code here that posts the lat/lng to the server
    // only call the remaining code to add the marker if it was successful
    var marker = new google.maps.Marker({
        position: event.latLng,
        map: map // put the handle of your map here
    });


  }

  function calcRoute(start, end) {
    var request = {
        origin:start,
        destination:end,
        travelMode: google.maps.TravelMode.DRIVING
    };
    directionsService.route(request, function(response, status) {
      resp = response;
      alert(status);
      if (status == google.maps.DirectionsStatus.OK) {
        directionsDisplay.setDirections(response);
      }
    });
  }




google.maps.event.addDomListener(window, 'load', initialize);
  if(!navigator.geolocation) {
        alert('Your browser does not support geolocation');
      }
//google.maps.event.addListener(this.map, 'click', add_marker);


    var timer1Available = true;
    // var timer2Available = false;
    var lastLatLng = "";

    function reverse_geocode () {
      var lat = map.getCenter().k;
      var lng = map.getCenter().A;
      var thisLatLng = lat + ", " + lng;
      if(timer1Available && thisLatLng !== lastLatLng) {

        var url = "https://maps.googleapis.com/maps/api/geocode/json?latlng=" + lat + ", " + lng;
        console.log(url);
        var xhr = new XMLHttpRequest();
        xhr.onreadystatechange = function() {
            if (xhr.readyState == 4) {

              var response = JSON.parse(xhr.responseText);
                var rawLocation = response.results[0].formatted_address.split(',');
                var basicAddress = rawLocation[0] + ", " + rawLocation[1]
                // + ", " + rawLocation[2].match(/\d+\.?\d*/g);
                if(basicAddress) {
                 markerLocation.innerHTML = basicAddress
                }
            }
        }
        xhr.open("GET", url ,true);
        xhr.send();
        lastLatLng = thisLatLng;
        timer1Avasilable = false;
        markerLocation.innerHTML = "";
        setTimeout(function() { timer1Available = true;}, 2000);
      }
    }
    setInterval(
      reverse_geocode, 2000);

    function geocode(address) {
      var url = "https://maps.googleapis.com/maps/api/geocode/json?address=" + address;
      var xhr = new XMLHttpRequest();
        xhr.onreadystatechange = function() {
            if (xhr.readyState == 4) {
              var response = JSON.parse(xhr.responseText);
              var lat = response.results[0].geometry.location.lat;
              var lng = response.results[0].geometry.location.lng;
              console.log(lat);
              console.log(lng);
              var newLocation = new google.maps.LatLng(lat,lng);
              map.setCenter(newLocation)


            }
        }
        xhr.open("GET", url ,true);
        xhr.send();
    }

      
     /*google.maps.event.addListener(map, "center_changed", function() {
       console.log('center changed.');
      var mapCenter = map.getCenter();
      reverse_geocode(mapCenter.k, mapCenter.A);
     
    });
     */
/*
var options = {
  enableHighAccuracy: true,
  timeout: 5000,
  maximumAge: 0
};

function success(pos) {
  var crd = pos.coords;

  console.log('Your current position is:');
  console.log('Latitude : ' + crd.latitude);
  console.log('Longitude: ' + crd.longitude);
  console.log('More or less ' + crd.accuracy + ' meters.');
};

function error(err) {
  console.warn('ERROR(' + err.code + '): ' + err.message);
};

navigator.geolocation.getCurrentPosition(success, error, options);

startingLat = 0;
startingLon = 0;

var findMyLocation = document.getElementById('findMyLocation');
/*
if(navigator.geolocation) {
    browserSupportFlag = true;
    navigator.geolocation.getCurrentPosition(function(position) {
      console.log('asdsda');
      console.log(position);
      initialLocation = new google.maps.LatLng(position.coords.latitude,position.coords.longitude);
      startingLat = position.coords.latitude;
      startingLon = position.coords.longitude;
      map.setCenter(initialLocation);
    }, function() {
      handleNoGeolocation(browserSupportFlag);
    });
  }
  // Browser doesn't support Geolocation
  else {
    browserSupportFlag = false;
    handleNoGeolocation(browserSupportFlag);
  }
*/
/*
  function handleNoGeolocation(errorFlag) {
    if (errorFlag == true) {
      alert("Geolocation service failed.");
    } else {
      alert("Your browser doesn't support geolocation. We've placed you in Siberia.");
    }
    map.setCenter(initialLocation);
  }
  */
  function restart() {
    
    var goBtn = document.getElementById('goBtn');
    var targetedLocation = document.getElementById('targetedLocation');
    var markerLocation = document.getElementById('markerLocation');
    // goBtn.style.display = 'none';
    goBtn.style.backgroundColor = '#f0ad4e';
    goBtn.innerHTML = '<i class="fa fa-thumbs-up"></i>GO!';
    //targetedLocation.style.display = 'none';
    targetedLocation.innerHTML = 'TARGETED LOCATION';
    markerLocation.innerHTML = '';
    markerLocation.style.display = 'block';

    //var foundBtn = document.getElementById('foundBtn');
    //var distanceFromDestination = document.getElementById('distanceFromDestination');
    
    // foundBtn.style.display = 'block';
    // distanceFromDestination.style.display = 'block';
    for (var i = 0; i < allMarkers.length; i++) {
      allMarkers[i].setMap(null);
    }

  }
  var goBack = document.getElementById('goBack');
  goBack.addEventListener('click', function() {
    restart();
  });

  var searchBtn = document.getElementById('searchBtn');
  var searchBar = document.getElementById('searchBar');
  var targetedLocation = document.getElementById('targetedLocation');
  var markerLocation = document.getElementById('markerLocation');

  searchBtn.addEventListener('click', function() { 
    if(searchBar.style.display === 'none') {
      searchBar.style.display = 'block';
      searchBtn.style.color = '#000';
      targetedLocation.style.display = 'none';
      markerLocation.style.display = 'none';
    }
    else {
      searchBar.style.display = 'none';
      searchBtn.style.color = 'rgb(66, 139, 202)';
      targetedLocation.style.display = 'block';
      markerLocation.style.display = 'block';

    }
  });
  searchBar.onkeydown = function(e){
   if(e.keyCode == 13){
     // submit
     geocode(searchBar.children[0].value);


   }
  };

