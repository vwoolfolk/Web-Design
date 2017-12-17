var map;

// Create a new blank array for all the listing markers.
var markers = [];

	
// Create a styles array to use with the map.
    var styles = 
    [
        {
            "featureType": "administrative",
            "elementType": "labels.text.fill",
            "stylers": [
                {
                    "color": "#444444"
                }
            ]
        },
        {
            "featureType": "landscape",
            "elementType": "all",
            "stylers": [
                {
                    "color": "#f2f2f2"
                }
            ]
        },
        {
            "featureType": "poi",
            "elementType": "all",
            "stylers": [
                {
                    "visibility": "off"
                }
            ]
        },
        {
            "featureType": "road",
            "elementType": "all",
            "stylers": [
                {
                    "saturation": -100
                },
                {
                    "lightness": 45
                }
            ]
        },
        {
            "featureType": "road.highway",
            "elementType": "all",
            "stylers": [
                {
                    "visibility": "simplified"
                }
            ]
        },
        {
            "featureType": "road.arterial",
            "elementType": "labels.icon",
            "stylers": [
                {
                    "visibility": "off"
                }
            ]
        },
        {
            "featureType": "transit",
            "elementType": "all",
            "stylers": [
                {
                    "visibility": "off"
                }
            ]
        },
        {
            "featureType": "water",
            "elementType": "all",
            "stylers": [
                {
                    "color": "#46bcec"
                },
                {
                    "visibility": "on"
                }
            ]
        }
    ];
	
 // view model	
 // attribution: http://learn.knockoutjs.com/#/?tutorial=collections
 // removed observable in data.title to incorporate filtered lists  
 // during search  
 
var Place = function (data) {
  this.title = (data.title);
  this.lat = ko.observable(data.lat);
  this.lng = ko.observable(data.lng);
  this.visible = ko.observable(true);


	};


function ViewModel() {
  var self = this;
  this.locationList = ko.observableArray([]);
  this.searchTitle = ko.observable('');

    Locations.forEach(function (locationItem) {
    self.locationList().push(new Place(locationItem));
  });

  this.changeLocation = function (clickLocation) {
    populateInfoWindow(clickLocation.marker, infowindow);
  };
  
  

  // Based on the search keywords filter the list view
  // attribution: https://stackoverflow.com/questions/46225210/adding-setvisible-to-markers-created-in-a-map
  
  self.filter = ko.observable('');
  self.List = ko.computed(function () {
    var filter = self.searchTitle().toLowerCase();
	var match;
	
    if (!filter) {

      self.locationList().forEach(function (locationItem) {
        locationItem.visible(true);
      });
      return self.locationList();
    }
    else {
      return ko.utils.arrayFilter(self.locationList(), function (locationItem) {
        var string = locationItem.title.toLowerCase();
        var result = (string.search(filter) >= 0);
        locationItem.visible(true);
        return result;
      });
    }
  }, self);
}



	function initMap() {
		
  // Constructor creates a new map - only center and zoom are required.
  
  map = new google.maps.Map(document.getElementById('map'), {
    center: {lat: 42.331429, lng: -83.045753},
    zoom: 13,
	styles: styles,
	
  });
	
  
  	// The following group uses the location array to create an array of markers on initialize.
	for (var i = 0; i < Locations.length; i++) {

     // Get the position from the location array.
    var position = Locations[i].location;
    var title = Locations[i].title;

    // Create a marker per location, and put into markers array.
    var marker = new google.maps.Marker({
      map: map,
      position: position,
      title: title,
      animation: google.maps.Animation.DROP,
      id: i
    });

	
	
	// Push the marker to our array of markers.
    markers.push(marker);
	
    // Add marker as a property of each Location.
    viewModel.locationList()[i].marker = marker;
	
		// Initialize infowindow
	infowindow = new google.maps.InfoWindow();

    // Create an onclick event to open the large infowindow at each marker.
    marker.addListener('click', clickMarker);}
	function clickMarker(){
    populateInfoWindow(this, infowindow);}
   }

	// This function populates the infowindow when the marker is clicked. We'll only allow
	// one infowindow which will open at the marker that is clicked, and populate based
	// on that markers position.
	function populateInfoWindow(marker, infowindow) {

	// Check to make sure the infowindow is not already opened on this marker.
	if (infowindow.marker != marker) {
		// Clear the infowindow content to give the streetview time to load.
		infowindow.setContent('');
		infowindow.marker = marker;
    
    // Make sure the marker property is cleared if the infowindow is closed.
    infowindow.addListener('closeclick', function () {
      infowindow.Marker = null;
    });
	
	// Open the infowindow on the correct marker
    infowindow.open(map, marker);
    marker.setAnimation(google.maps.Animation.BOUNCE);
    setTimeout(function () {
      marker.setAnimation(null);
    }, 750);
	}

 
    // Get location data from foursquare
	// attribution: https://stackoverflow.com/questions/47522033/getting-json-out-of-jquery-from-foursquare-api -->
	// attribution: https://stackoverflow.com/questions/47522033/getting-json-out-of-jquery-from-foursquare-api
	// attribution: https://medium.com/the-web-tub/build-a-places-app-with-foursquare-and-google-maps-using-onsen-ui-and-angularjs-df44357cbe3e
	
	// Foursquare API Client
        clientID = "S5MNDUQRTGQNCKWQVCQKJM3DER4MWSTRR03SKGYHRZQURSF3";
        clientSecret = "DZY0PAU45PU4CKVM3X1LEFNTWNFR31NEITY0TRGPPBPPEZU2";

    var foursquareUrl = "https://api.foursquare.com/v2/venues/search?query=" +
       marker.title + '&ll=' + marker.position.lat() + ',' + marker.position.lng() +
      '&client_id=S5MNDUQRTGQNCKWQVCQKJM3DER4MWSTRR03SKGYHRZQURSF3' +
      '&client_secret=DZY0PAU45PU4CKVM3X1LEFNTWNFR31NEITY0TRGPPBPPEZU2&v=20171213';

    $.ajax({
      dataType: "jsonp",
	  cache: false,
	  url: foursquareUrl,
      success: function (data){
		  
		// display the information found 		
        var venues = data.response.venues[0];
        infowindow.setContent('<div><h3>' + venues.name + '</h3>' +
          venues.location.address + '</div><div>' +
          venues.location.city + '</div>');
      },
	  
		// error or fail information
      error: function () {
        alert('Unfortunately, there was a problem with gathering more information. Check your connection or wait a few minutes and try again.');
      }
    });

	}
 
var viewModel = new ViewModel(); 



// apply bindings 
ko.applyBindings(viewModel);

//Error handling
function errorHandling () {
	alert("Google Maps has failed to load. Please check your internet connection and try again.");
}