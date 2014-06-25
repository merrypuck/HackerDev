var spotImage = {
    url: '/images/walking_man.png',
		scaledSize: new google.maps.Size(25, 25),
    // The origin for this image is 0,0.
    origin: new google.maps.Point(0,0),
    // The anchor for this image is the base of the flagpole at 0,32.
    anchor: new google.maps.Point(0, 25)
  };

var carImage = {
    url: '/images/car.png',
	scaledSize: new google.maps.Size(25, 25),
    // The origin for this image is 0,0.
    origin: new google.maps.Point(0,0),
    // The anchor for this image is the base of the flagpole at 0,32.
    anchor: new google.maps.Point(12.5, 12.5)
  };

var arrowImage = {
    url: '../images/arrow.png',
	scaledSize: new google.maps.Size(25, 25),
    // The origin for this image is 0,0.
    origin: new google.maps.Point(0,0),
    // The anchor for this image is the base of the flagpole at 0,32.
    anchor: new google.maps.Point(12.5, 12.5)
  };

var parkingImage = {
    url: '/images/parking.png',
	scaledSize: new google.maps.Size(25, 25),
    // The origin for this image is 0,0.
    origin: new google.maps.Point(0,0),
    // The anchor for this image is the base of the flagpole at 0,32.
    anchor: new google.maps.Point(12.5, 12.5)
  };

function getCarMarker(map, position) {
	return new google.maps.Marker({
	    position: position, 
	    map: map,
	    icon: carImage
	  });
}

function getContinuationMarker(map, position) {
	return new google.maps.Marker({
	    position: position, 
	    map: map,
	    icon: arrowImage
	  });
}

function getWalkingMarker(map, position) {
	return new google.maps.Marker({
	    position: position, 
	    map: map,
	    icon: spotImage
	  }); /*
  return new MarkerWithLabel({
	  	icon: parkingImage,
	    position: position,
		title: title,
		labelContent: "$" + price,
		labelClass: "labels",
		labelStyle: {opacity: 0.75},
  		map: map
	  });*/
}
function getPricedMarker(map, title, price, position) {
	return new google.maps.Marker({
	    position: position, 
	    map: map,
	    icon: parkingImage
	  }); /*
  return new MarkerWithLabel({
	  	icon: parkingImage,
	    position: position,
		title: title,
		labelContent: "$" + price,
		labelClass: "labels",
		labelStyle: {opacity: 0.75},
  		map: map
	  });*/
}
