// Leaflet quickstart tutorial

// Make a map of London
// initialize the map and set its view and initial zoom level (13)
//
// The L.map method creates a map on the page.
// It instantiates a map object (either from the DOM ID of a <div> element
//, or an instance of a <div> HTML element)
// you can also include an object literal specifying map options
//
// The setView method modifies the map state.
// It sets the center of the map and the zoom level,
// and can also be used to set options for zooming and panning
var mymap = L.map('mapid').setView([51.505, -0.09], 13);

// Add a tile layer to our map from the Mapbox Streets tile layer
//
// The L.tileLayer method allows you to load and display tile layers on your map.
// It takes a url string, as well as options such as minimum zoom level and maximum zoom level
//
// The addTo method adds a layer to the given map or layer group
L.tileLayer('https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}', {
    attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, <a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
    maxZoom: 18,
    id: 'mapbox/streets-v11',
    accessToken: 'pk.eyJ1IjoiaC1jb2RvIiwiYSI6ImNrNmp2YTA3eDAwOHIzbXVyajBpc3luc2UifQ.ERW0j0Pv5xtyDNXYQKHWiQ'
}).addTo(mymap);

// Add a marker to the map
//
// The L.marker method displays clickable or draggable icons on the map.
// The method takes the coordinates of a point as well as additional optional options
var marker = L.marker([51.5, -0.09]).addTo(mymap);

// Add a circle to the map
//
// The L.circle method draws a circle overlay on the map
// It takes the coordinates of the point, as well as an options object,
// which can be used to specify the radius of the circle, in meters
var circle = L.circle([51.508, -0.11], {
    color: 'red',
    fillColor: '#f03',
    fillOpacity: 0.5,
    radius: 500
}).addTo(mymap);

// Add a polygon to the map
//
// The L.polygon method draws a polygon overlay on the map
// You must pass an array of the coordinates of the polygon vertices
// and can also pass additional options, such as color
var polygon = L.polygon([
    [51.509, -0.08],
    [51.503, -0.06],
    [51.51, -0.047]
]).addTo(mymap);

// Add pop-ups to the marker, circle, and polygon on the map
//
// The bindPopup method is used to open popups
// It instantiates a pop-up object on another object and takes
// and optional options object that can be used to set its
// appearance and location
//
// The openPopUp method can only be used with markers
// It opens the specified pop-up while also closing the
// pop-up that was previously opened
// It takes a string argument specifying the content,
// coordinates for its placement, and optional options
marker.bindPopup("<b>Hello world!</b><br>I am a popup.").openPopup();
circle.bindPopup("I am a circle.");
polygon.bindPopup("I am a polygon.");

// Use pop-ups as layers
// Create a popup that is not tied
//
// The L.popup function instantiates a popup object
// given an optional options object that can be used to describe
// its appearance and location, and an option source object that
// can be used to tag the popup with a reference to the layer it refers to
//
// The setLatLng method specifies the latitude and longitide of
// the location where the popup will open
// It takes coordinates
//
// The setContent method specifies the HTML content of the popup
// It requires a strong or HTMLElement to be used in the popup
//
// The openOn method adds the popup to the map and closes
// the popup that was previously opened
// it takes a map object
var popup = L.popup()
    .setLatLng([51.5, -0.09])
    .setContent("I am a standalone popup.")
    .openOn(mymap);

// React to the user clicking on the map
// Generate an alert when they click on the map telling them
// where they clicked
//
// The .on method allows you to execute a specified function
// when somethng happens with an object (such as a click)
// It takes a string specifying what event type to listen for
// as well as the function that should be executed when that event occurs
function onMapClick(e) {
    alert("You clicked the map at " + e.latlng);
}

mymap.on('click', onMapClick);

// Generate a pop-up when the user clicks on the mapid
var popup = L.popup();

function onMapClick(e) {
    popup
        .setLatLng(e.latlng)
        .setContent("You clicked the map at " + e.latlng.toString())
        .openOn(mymap);
}

mymap.on('click', onMapClick);
