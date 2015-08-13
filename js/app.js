//GLOBAL VARIABLES

var GOOGLE_MAP_API_KEY = 'AIzaSyB76u_0lqPeUPSWCyH0Lr5zp7GExa5Rc_Q';
var map,
  infowindow,
  myViewModel,
  sfLocation = {
    lat: 37.7833,
    lng: -122.4167
  };


//Callback function run by maps once loaded
function initMap() {

  map = new google.maps.Map(document.getElementById('map'), {
    center: sfLocation,
    zoom: 14
  });

  searchPlaces();
}


// Searches places on the map around center and for each place
// creates a marker and adds it to list view
//TODO: add functionality for search around center
var searchPlaces = function() {
  infowindow = new google.maps.InfoWindow();
  var service = new google.maps.places.PlacesService(map);

  service.nearbySearch({
    location: sfLocation,
    radius: 500,
    types: ['store']
  }, placesCallback);
}

// callBack function that handles the response from Google PlacesService API:
// - creates marker for each place
// - appends each place to AppViewModel's places observableArray
function placesCallback(results, status) {
  console.log('in placesCallback');
  if (status === google.maps.places.PlacesServiceStatus.OK) {
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

  google.maps.event.addListener(marker, 'click', function() {
    infowindow.setContent(place.name);
    infowindow.open(map, this);
    myViewModel.setCurrentMarker(place);
  });
}

// =====================
// Knockout.js ViewModel
// =====================
var AppViewModel = function() {
  var self = this;
  self.currentLocation = ko.observable(sfLocation);
  self.currentMarker = ko.observable();
  self.places = ko.observableArray();

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


