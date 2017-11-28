
var initialLocations = [{
        name: 'Fat Albert Department Store',
        lat: 40.699883,
        long: -73.941093,
    },
    {
        name: 'Williamsburg Bridge',
        lat: 40.710065,
        long: -73.960283
    },
    {
        name: 'Woodhull Hospital',
        lat: 40.699686,
        long: -73.942293
    },
    {
        name: 'Williamsburg Cinemas',
        lat: 40.714168,
        long: -73.959873
    },
    {
        name: 'Sabrina\'s Pizzeria',
        lat: 40.708359,
        long: -73.958284
    },
    {
        name:'Sternberg Park',
        lat: 40.7054394,
        long: -73.94798029999998
    }


];

// Creeating the global variables for the strict mode
var map;
var clientID;
var clientSecret;



var Location = function (data) {
    var self = this;
    this.name = data.name;
    this.lat = data.lat;
    this.long = data.long;
    this.street = "";
    this.city = "";

    this.visible = ko.observable(true);

    //Verify the use of the foursquare api with using the clientid and also the key that is provided when signing up
    var foursquareURL = 'https://api.foursquare.com/v2/venues/search?ll=' + this.lat + ',' + this.long + '&client_id=' + clientID + '&client_secret=' + clientSecret + '&v=20170101 ' + '&query=' + this.name;

    $.getJSON(foursquareURL).done(function (data) {
        var results = data.response.venues[0];
        self.street = results.location.formattedAddress[0];
        self.city = results.location.formattedAddress[1];

    }).fail(function () {
        alert("There was an error with the Foursquare API call. Please refresh the page and try again later.");
    });
    // Infowindow with street and city details.
    this.contentString = '<div class="info-window-content"><div class="title"><b>' + data.name + "</b></div>" +
        '<div class="content">' + self.street + "</div>" +
        '<div class="content">' + self.city + "</div>";


    this.infoWindow = new google.maps.InfoWindow({
        content: self.contentString
    });
    // Setting MArkers on Map
    this.marker = new google.maps.Marker({
        position: new google.maps.LatLng(data.lat, data.long),
        map: map,
        title: data.name
    });

    this.showMarker = ko.computed(function () {
        if (this.visible() === true) {
            this.marker.setMap(map);
        } else {
            this.marker.setMap(null);
        }
        return true;
    }, this);

    this.marker.addListener('click', function () {
        self.contentString = '<div class="info-window-content"><div class="title"><b>' + data.name + "</b></div>" +
            '<div class="content">' + self.street + "</div>" +
            '<div class="content">' + self.city + "</div>";


        self.infoWindow.setContent(self.contentString);

        self.infoWindow.open(map, this);
        // this gives the bouncing affect of the pointer on the map. 
        self.marker.setAnimation(google.maps.Animation.BOUNCE);
        setTimeout(function () {
            self.marker.setAnimation(null);
        }, 2100);
    });

    this.bounce = function (place) {
        google.maps.event.trigger(self.marker, 'click');
    };
};

function AppViewModel() {
    var self = this;

    this.searchTerm = ko.observable("");

    this.locationList = ko.observableArray([]);
    //Places the origin of the map on where to first center and concentrate. 
    map = new google.maps.Map(document.getElementById('map'), {
        zoom: 14,
        center: {
            lat: 40.6934482,
            lng:-73.93967829999997
        }
    });

    // foursquare api settings used to access the page. 
    clientID = "H05QQFAHI0GLWI4CLEHDNM1U2GRMTDP4NKB0IOSXMUQNVFBN";
    clientSecret = "VHPIC30V531EZBPZ3ZLL13DAXQASSPNAWVZI0LL5VB4CBLNG";

    initialLocations.forEach(function (locationItem) {
        self.locationList.push(new Location(locationItem));
    });
    // Search filtering from the list is provided on here
    this.filteredList = ko.computed(function () {
        var filter = self.searchTerm().toLowerCase();
        if (!filter) {
            self.locationList().forEach(function (locationItem) {
                locationItem.visible(true);
            });
            return self.locationList();
        } else {
            return ko.utils.arrayFilter(self.locationList(), function (locationItem) {
                var string = locationItem.name.toLowerCase();
                var result = (string.search(filter) >= 0);
                locationItem.visible(result);
                return result;
            });
        }
    }, self);

    this.mapElem = document.getElementById('map');
    this.mapElem.style.height = window.innerHeight - 50;
}

function startApp() {
    ko.applyBindings(new AppViewModel());
}
// This should alert the user if the the page is having issues load the site.
function errorHandling() {
    alert("Google Maps has failed to load. Please try again later.");
}