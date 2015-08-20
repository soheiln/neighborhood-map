//GLOBAL VARIABLES

var GOOGLE_MAP_API_KEY = 'AIzaSyB76u_0lqPeUPSWCyH0Lr5zp7GExa5Rc_Q';
var map,
  infowindow,
  myViewModel;


// Callback function run by maps once loaded
// Adds event listener for bounds_changed
function initMap() {
  var sfLocation = {
    lat: 37.7833,
    lng: -122.4167
  };

  // loading initial map with specified center and zoom
  map = new google.maps.Map(document.getElementById('map'), {
    center: sfLocation,
    zoom: 14
  });

  // adding listener for bounds_changed, so that markers are updated
  // when the bounds change
  //TODO: rate limit by combining this with mouseup event
  map.addListener('bounds_changed', function() {
    clearLocations();
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
    //myViewModel.locations([]); //clear existing locations
    clearLocations();
    for (var i = 0; i < results.length; i++) {
      console.log('results[i]');
      console.dir(results[i]);
      createLocation(results[i]);
    }
  }
};


// clears all markers from map and AppViewModel's observableArray
var clearLocations = function() {
  for (var i = 0; i < myViewModel.locations().length; i++) {
    //remove location from map
    myViewModel.locations()[i].marker.setMap(null);
  }

  //empty the locations array
  myViewModel.locations([]);
}


// creates a location object out of a Google.maps.Placesservice response object
//TODO: add documentation
var createLocation = function(data) {
  var location = {};
  location.name = data.name;
  location.address = data.vicinity || null;
  location.marker = new google.maps.Marker({
    map: map,
    position: data.geometry.location
  });
  myViewModel.locations.push(location);

  //setting click listener for the marker
  google.maps.event.addListener(location.marker, 'click', function() {
    infowindow.setContent(location.name);
    infowindow.open(map, this);
    myViewModel.setCurrentLocation(location);
  });
}

//clears all locations
var clearLocations = function() {
  for (var i = myViewModel.locations().length-1; i >= 0; i--) {
    myViewModel.locations()[i].marker.setMap(null);
  }
  myViewModel.locations([]);
}

// filters existing markers based on search term
var filterResults = function() {
  //get search expression
  var exp = $('#search-bar').val();
  console.log('exp: ' + exp);
  console.log('locations.length: ' + myViewModel.locations().length);

  //loop through locations and remove matching locations from map and list
  for (var i = myViewModel.locations().length-1; i >= 0; i--) {
    var location = myViewModel.locations()[i];
    console.log('location:');
    console.dir(location);
    if( !isLocationMatch(location, exp) ) {
      console.log("location is not match: " + location.name);
      console.dir(location.marker);
      //remove location from map
      location.marker.setMap(null);

      //remove location from list
      myViewModel.locations.remove(location);
    }
  }
  console.log('locations.length: ' + myViewModel.locations().length);

}


// checks if location matches the input expression
var isLocationMatch = function(location, exp) {
  if ( location.name.toLowerCase().match(exp.toLowerCase()) ) {
    return true;
  }
  return false;
}


// =====================
// Knockout.js ViewModel
// =====================
var AppViewModel = function() {
  var self = this;
  self.currentLocation = ko.observable();
  self.locations = ko.observableArray();

  self.setCurrentLocation = function(location) {
    console.log('in set currentLocation, name: ' + location.name + ' @: ' + location.vicinity);
    self.currentLocation({
      name: location.name,
      address: location.address,
      marker: location.marker
    });
  };


}


//Activating knockout.js
myViewModel = new AppViewModel();
ko.applyBindings(myViewModel);


