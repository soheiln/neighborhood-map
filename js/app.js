var GOOGLE_MAP_API_KEY = 'AIzaSyB76u_0lqPeUPSWCyH0Lr5zp7GExa5Rc_Q';


var map;
var infowindow;

var sfLocation = {
  lat: 37.7833,
  lng: -122.4167
};


function initMap() {
  map = new google.maps.Map(document.getElementById('map'), {
    center: sfLocation,
    zoom: 14
  });

  infowindow = new google.maps.InfoWindow();

  var service = new google.maps.places.PlacesService(map);

  console.log('before service nearbySearch');
  service.nearbySearch({
    location: sfLocation,
    radius: 500,
    types: ['store']
  }, placesCallback);

  function placesCallback(results, status) {
    console.log('in placesCallback');
    if (status === google.maps.places.PlacesServiceStatus.OK) {
      for (var i = 0; i < results.length; i++) {
        console.dir(results[i]);
        createMarker(results[i]);
      }
    }
  };

  function createMarker(place) {
    var placeLoc = place.geometry.location;
    var marker = new google.maps.Marker({
      map: map,
      position: place.geometry.location
  });

  google.maps.event.addListener(marker, 'click', function() {
    infowindow.setContent(place.name);
    infowindow.open(map, this);
  });
}


}


var model = function() {


}



var AppViewModel = function() {
  var self = this;
  self.currentLocation = ko.observable(sfLocation);
  self.map = ko.observable(map);
  self.places = ko.observableArray();




}

//Activate knockout.js
$(document).load(function() {
  ko.applyBindings(new AppViewModel());
});


