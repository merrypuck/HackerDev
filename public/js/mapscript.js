/***** GLOBALS *****/
var previousPage = "";
var map, GeoMarker;
var myLocation = document.getElementById('markerLocation');

// page switching
 var switchPage = function(currentPage, newPage) {
  var currentPage = document.getElementById(currentPage);
  var newPage = document.getElementById(newPage);
  
    currentPage.style.display = 'none';
    newPage.style.display = 'block';
    previousPage = currentPage;
 }




function initialize() {
  
  // var myLatlng = new google.maps.LatLng(37.790234970864, -122.39031314844);
  var mapOptions = {
      center: new google.maps.LatLng(37.790234970864, -122.39031314844),
      zoom: 16,
      mapTypeId: google.maps.MapTypeId.ROADMAP,
      disableDefaultUI: true
  };
  map = new google.maps.Map(document.getElementById('map-canvas'), mapOptions);
 
  var GeoMarker = new GeolocationMarker(map);

   GeoMarker = new GeolocationMarker();
    GeoMarker.setCircleOptions({visible: 'false', strokeOpacity : 0});

    google.maps.event.addListenerOnce(GeoMarker, 'position_changed', function() {
      map.setCenter(this.getPosition());
      map.fitBounds(this.getBounds());
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
                 myLocation.innerHTML = basicAddress
                }
            }
        }
        xhr.open("GET", url ,true);
        xhr.send();
        lastLatLng = thisLatLng;
        timer1Avasilable = false;
        myLocation.innerHTML = "";
        setTimeout(function() { timer1Available = true;}, 2000);
      }
    }
    setInterval(
      reverse_geocode, 2000);

      
     /*google.maps.event.addListener(map, "center_changed", function() {
       console.log('center changed.');
      var mapCenter = map.getCenter();
      reverse_geocode(mapCenter.k, mapCenter.A);
     
    });
     */

/****** EVENT LISTENERS **********/
var homePage = document.getElementById('homePage');
var page1 = document.getElementById('page1');
var mapCanvas = document.getElementById('map-canvas');
homePage.addEventListener('click', function() { 
  //alert('asd');
  //switchPage('homePage', 'page1');
  //mapCanvas.style.visiblity = 'visible';


}, false);
