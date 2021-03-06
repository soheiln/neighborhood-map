//GLOBAL VARIABLES

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
    types: ['restaurant']
  }, placesCallback);

  //clear the search bar input
  $('#search-bar').val('');
};


// callBack function that handles the response from Google PlacesService API:
// - creates marker for each place
// - resets places observableArray
// - appends each place to AppViewModel's places observableArray
function placesCallback(results, status) {
  console.log('in placesCallback');
  if (status === google.maps.places.PlacesServiceStatus.OK) {
    clearLocations();
    for (var i = 0; i < results.length; i++) {
      createLocation(results[i]);
    }
  }
  else {
    window.alert('Sorry, there was an error with your place search. Please try again!')
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
};


/*
 * creates a location object out of a Google.maps.Placesservice
 * response object
 */
 var createLocation = function(data) {
  var location = {};
  location.name = data.name;
  location.address = data.vicinity || null;
  location.visibility = ko.observable(true);
  location.lat = data.geometry.location.lat();
  location.lng = data.geometry.location.lng();
  location.marker = new google.maps.Marker({
    map: map,
    position: data.geometry.location
  });
  myViewModel.locations.push(location);

  //setting click listener for the marker
  google.maps.event.addListener(location.marker, 'click', function() {
    myViewModel.setCurrentLocation(location);
  });
};


// filters existing markers based on search term
var filterResults = function() {
  console.log('in filterResults..')
  //get search expression
  var searchInput = $('#search-bar').val();
  console.log('searchInput=' + searchInput);

  ko.utils.arrayForEach(myViewModel.locations(), function(location) {
    if(location.name.toLowerCase().indexOf(searchInput) == -1) {
      console.log('not a match');
      //hide location from map and list
      location.marker.setMap(null);
      location.visibility(false);
    }
    else{
      //show location on map and list
      location.marker.setMap(map);
      location.visibility(true);
    }
  });

};


// checks if location matches the input expression
var isLocationMatch = function(location, exp) {
  if ( location.name.toLowerCase().match(exp.toLowerCase()) ) {
    return true;
  }
  return false;
};


//specifying map div heigh on page load
$(window).resize(function () {
    var h = $(window).height(),
        offsetTop = 60; // Calculate the top offset

    $('#map').css('height', (h - offsetTop));
}).resize();


// =====================
// Knockout.js ViewModel
// =====================
var AppViewModel = function() {
  var self = this;
  self.currentLocation = ko.observable();
  self.locations = ko.observableArray();

  self.setCurrentLocation = function(location) {
    console.log('in set currentLocation, name: ' + location.name + ' @: ' + location.vicinity);

    if( self.currentLocation() ) { //stop previous animation
      self.currentLocation().marker.setAnimation(null);
    }

    if(infowindow) { //close previous infowindow
      infowindow.close();
    }

    //add animation for newly selected location
    map.setCenter(location.marker.getPosition());
    location.marker.setAnimation(google.maps.Animation.BOUNCE);
    self.currentLocation(location);

    //make ajax call to foursquare api to get info about business
    var url_base = "https://api.foursquare.com/v2/venues/search?client_id=IWJUPAUNFKW5W1W5ZH2Y5L2YT1D2VAI5LR2JT0AOCANSMMOF&client_secret=15XOTXLRTOZRBTWMN13KDGXAWYABLE5LCMD4I0IFA34V4KWB&v=20130815&limit=10";
    var ll = "&ll=" + location.lat + "," + location.lng;
    var query = "&query=" + location.name;
    var ajax_url = url_base + ll + query;

    //set initial infoWindow content until foursquare data is loaded
    infowindow.setContent(location.name);
    infowindow.setOptions({
      disableAutoPan: true
    });
    infowindow.open(map, location.marker);


    //four square ajax success callback
    var fs_ajax_success = function(xhr) {

      var venues = xhr.response.venues;

      if(venues[0]){
        var venue = venues[0];
        //setting locations info from four square API result
        location.url = venue.url || "";
        location.address = venue.location.address || "";
        location.category = venue.categories[0].name || "";
      }


      //reset infoWindow with more info from from foursquare api when loaded
      location.infoWindowContent = "<div id='infoWindow'>" +
        "<h3>" + location.name + "</h3>" +
        "<p>" + location.address + "</p>" +
        "<p>" + location.category + "</p>" +
        "<a href='" + location.url + "'>" + location.url + "'</a>" +
        "</div>";
      infowindow.setContent(location.infoWindowContent);
      infowindow.open(map, location.marker);
    };

    //four square ajax error callback
    var fs_ajax_error = function(xhr) {
      //reset infoWindow with ajax error message
      location.infoWindowContent = "<div id='infoWindow'>" +
        "<p> Unfortunately we were not able to load additional info at this point. </p>" +
        "</div>";
      infowindow.setContent(location.infoWindowContent);
      infowindow.open(map, location.marker);
    };

    //ajax call to get additional venue data from foursquare
    $.ajax({
      context: this,
      url: ajax_url,
      success: fs_ajax_success,
      error: fs_ajax_error
    });
  };
};

//Activating knockout.js
myViewModel = new AppViewModel();
ko.applyBindings(myViewModel);


// ============================
// Initializing slidebar menu
// ============================
var slideout = new Slideout({
  'panel': document.getElementById('panel'),
  'menu': document.getElementById('menu'),
  'padding': 256,
  'tolerance': 70
});

// Toggle button
document.querySelector('.toggle-button').addEventListener('click', function() {
  slideout.toggle();
});
