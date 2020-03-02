// Mapping MTA data

// STEP 1 - Make a map of the MTA dataset
// initialize the map and set its view and initial zoom level (11)
//
var map;
var minValue;

function createMap(){
  // create the map
  map = L.map('mapid', {
    center: [40.73, -74],
    zoom: 12
  });

  // add oSM base tilelayer
  L.tileLayer('http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap contributors</a>'
    }).addTo(map);

    //call getData function
    getData();
};

// Calculate minimum value in dataset
function calcMinValue(data) {
  // Create an empty array to store all data values
  var allValues = [];

  // Loop throught each station
  for (var station of data.features) {
    // loop through each year
    for (var year = 2011; year <= 2018; year+=1){
      // Get average weekly ridership for current year
      var value = station.properties["AWR_"+ String(year)];
      // Add value to array
      allValues.push(value);
    }
  }

  // Get minimum value of our array
  var minValue = Math.min(...allValues)

  return minValue;
};

// Calculate the radius of each proportional symbol
function calcPropRadius(attValue) {
  // Constant factor adjusts symbol sizes evenly
  var minRadius = 5;

  // Flannery appearance compensation formula
  var radius = 1.0083 * Math.pow(attValue/minValue, 0.5715) * minRadius

  return radius;
};

// Step 3: Add circle markers for subway stations to map
function pointToLayer(feature, latlng){
  // Step 4: Determine the attribute for scaling the proportional symbols
  var attribute = "AWR_2011";

  // set marker options
  var geojsonMarkerOptions = {
    radius: 5,
    fillColor: "#fdf539",
    color: "#000",
    weight: 1,
    opacity: 1,
    fillOpacity: 0.6
  };

  // Step 5: For each feature, determine its value for the selected attribute
  var attValue = Number(feature.properties[attribute]);

  // Step 6: Give each feature's circle marker a radius based on its attribute value
  // Call the function calcPropRadius to set the radius for the layer marker
  geojsonMarkerOptions.radius = calcPropRadius(attValue);

  // create circle marker layer
  var layer = L.circleMarker(latlng, geojsonMarkerOptions);

  // Build string for popup content
  var popupContent = "<p><b>Station:</b> " + feature.properties.Station +
  "</p><p><b>" + "<p>Lines served:</b> " + feature.properties.Lines +
  "</p><p>";
  // Add formatted attribute to popup content String
  var year = attribute.split("_")[1];
  popupContent += "<p><b>Average weekday ridership in " + year + ":</b> "
  + feature.properties[attribute] + "</p>";

  // Bind the popupt to the circle marker
  layer.bindPopup(popupContent, {
    offset: new L.Point(0,-geojsonMarkerOptions.radius)
  });

  // return the circle maker to the L.geoJson pointToLayer option
  return layer;

};

//Add the created circle markers to the map
function createPropSymbols(data){
  // create a leaflet GeoJSOn layer and add it to the map
  L.geoJson(data, {
    pointToLayer: pointToLayer
  }).addTo(map);
};


// STEP 2 - Import GeoJSON data
//function to retrieve the data (using AJAX) and place it on the map
function getData(){
    //load the data
    $.getJSON("data/MTA_2011_2018.geojson", function(response){
      // Calculate minimum data value
      minValue = calcMinValue(response);

      // Call function to make proportional symbols
      createPropSymbols(response);
    });
};




$(document).ready(createMap);
