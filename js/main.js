// Mapping MTA data

// Make a map of the MTA dataset
// initialize the map and set its view and initial zoom level (11)
//
var map;

function createMap(){
  // create the map
  map = L.map('mapid', {
    center: [40.7, -74],
    zoom: 11
  });

  // add oSM base tilelayer
  L.tileLayer('http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap contributors</a>'
    }).addTo(map);

    //call getData function
    getData();
};

// add function to attach popups to each mapped feature
function onEachFeature(feature, layer) {
  // create html string with all properties for popup
  var popupContent = "";
  if (feature.properties) {
    // iterate through property names and values to add them to html string
    for (var property in feature.properties){
        popupContent += "<p>" + property + ": " + feature.properties[property] + "</p>";
    }
    layer.bindPopup(popupContent);
  };
};

//function to retrieve the data (using AJAX) and place it on the map
function getData(){
    //load the data
    $.getJSON("data/MTA_2011_2018.geojson", function(response){
            // set marker options
            var geojsonMarkerOptions = {
              radius: 5,
              fillColor: "#fdf539",
              color: "#000",
              weight: 1,
              opacity: 1,
              fillOpacity: 0.6
            };

            //create a Leaflet GeoJSON layer and add it to the map
            L.geoJson(response, {
              pointToLayer: function (feature, latlng){
                return L.circleMarker(latlng, geojsonMarkerOptions);
              },
              onEachFeature: onEachFeature
            }).addTo(map);
        });
};




$(document).ready(createMap);
