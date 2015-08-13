//GLOBAL VARIABLES

var GOOGLE_MAP_API_KEY = 'AIzaSyB76u_0lqPeUPSWCyH0Lr5zp7GExa5Rc_Q';
var map,
  infowindow,
  myViewModel,
  sfLocation = {
    lat: 37.7833,
    lng: -122.4167
  };


// Callback function run by maps once loaded
// Adds event listener for bounds_changed
function initMap() {

  // loading initial map with specified center and zoom
  map = new google.maps.Map(document.getElementById('map'), {
    center: sfLocation,
    zoom: 14
  });

  // adding listener for bounds_changed, so that markers are updated
  // when the bounds change
  //TODO: rate limit by combining this with mouseup event
  map.addListener('bounds_changed', function() {
    console.log('NE: ' + map.getBounds().getNorthEast());
    console.log('SW: ' + map.getBounds().getSouthWest());
    //TODO: remove existing markers
    clearMarkers();
    searchPlaces();
  });

  google.maps.event.addListenerOnce(map, 'idle', function(){
    // do something only the first time the map is loaded
    searchPlaces();
  });
}


// Searches places on the map around center and for each place
// creates a marker and adds it to list view
var searchPlaces = function() {
  infowindow = new google.maps.InfoWindow();
  var service = new google.maps.places.PlacesService(map);

  //searchers for places in map's visible bounds
  service.nearbySearch({
    bounds: map.getBounds(),
    types: ['store']
  }, placesCallback);
}

// callBack function that handles the response from Google PlacesService API:
// - creates marker for each place
// - resets places observableArray
// - appends each place to AppViewModel's places observableArray
function placesCallback(results, status) {
  console.log('in placesCallback');
  if (status === google.maps.places.PlacesServiceStatus.OK) {
    myViewModel.places([]); //clear existing places
    for (var i = 0; i < results.length; i++) {
      console.dir(results[i]);
      createMarker(results[i]);
      myViewModel.places.push({
        name: results[i].name,
        address: results[i].vicinity
      });
    }
  }
};


// Takes a place object as input, creates the corresponding maker on map
// and adds click listeners to it
function createMarker(place) {
  var placeLoc = place.geometry.location;
  var marker = new google.maps.Marker({
    map: map,
    position: place.geometry.location
  });

  //storing the marker in array
  myViewModel.markers.push(marker);

  //setting click listener for each marker
  google.maps.event.addListener(marker, 'click', function() {
    infowindow.setContent(place.name);
    infowindow.open(map, this);
    myViewModel.setCurrentMarker(place);
  });
}

// clears all markers from map and AppViewModel's observableArray
var clearMarkers = function() {
  //remove marker from map
  for (var i = 0; i < myViewModel.markers().length; i++) {
    myViewModel.markers()[i].setMap(null);
  }

  //empty the markers array
  myViewModel.markers([]);
}

// =====================
// Knockout.js ViewModel
// =====================
var AppViewModel = function() {
  var self = this;
  self.currentLocation = ko.observable(sfLocation);
  self.currentMarker = ko.observable();
  self.places = ko.observableArray();
  self.markers = ko.observableArray();

  self.setCurrentMarker = function(marker) {
    console.log('in set currentMarker, name: ' + marker.name + ' @: ' + marker.vicinity);
    self.currentMarker({
      name: marker.name,
      address: marker.vicinity
    });
  };


}



//Activating knockout.js
myViewModel = new AppViewModel();
ko.applyBindings(myViewModel);


