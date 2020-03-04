// Mapping MTA data

// STEP 1 - Make a map of the MTA dataset
// initialize the map and set its view and initial zoom level (11)
//
var map;
var minValue;
var attributes;

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
  };

  // Get minimum value of our array
  var minValue = Math.min(...allValues)

  return minValue;
}

// Calculate the radius of each proportional symbol
function calcPropRadius(attValue) {
  // Constant factor adjusts symbol sizes evenly
  var minRadius = 8;

  // Flannery appearance compensation formula
  var radius = 1.0083 * Math.pow(attValue/minValue, 0.5715) * minRadius

  return radius;
};

// Step 3: Add circle markers for subway stations to map
function pointToLayer(feature, latlng, attributes){
  //Sequence Step 4. Assign the current attribute based on the index of the attributes array
  var attribute = attributes[0];
  // check attribute
  console.log(attribute)

  // set marker options
  var geojsonMarkerOptions = {
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
  var popupContent = new PopupContent(feature.properties, attribute);

  // temp change to popup
  // popupContent.formatted = "<h2>" + popupContent.ridership + "</h2";

  // Bind the popupt to the circle marker
  layer.bindPopup(popupContent.formatted, {
    offset: new L.Point(0,-geojsonMarkerOptions.radius)
  });

  // return the circle maker to the L.geoJson pointToLayer option
  return layer;

};

function PopupContent(properties, attribute) {
  this.properties = properties;
  this.attribute = attribute;
  this.year = attribute.split("_")[1];
  this.ridership = this.properties[attribute];
  this.formatted = "<p><b>Station:</b> " + this.properties.Station +
  "</p><p>" + "<b><p>Lines served:</b> " + this.properties.Lines +
  "</p><p><b>Average weekday ridership in " + this.year + ":</b> "
  + this.ridership + "</p>";
};

//Add the created circle markers to the map
function createPropSymbols(data){
  // create a leaflet GeoJSOn layer and add it to the map
  L.geoJson(data, {
    pointToLayer: function(feature, latlng){
      return pointToLayer(feature, latlng, attributes);
    }
  }).addTo(map);
};


// // // CREATE SLIDER TO ALLOW USER TO SEQUENCE THROUGH THE ATTRIBUTES
//Sequence Step 1. Create slider widget
function createSequenceControls(attributes) {
  // create a slider (range input element)
  $('#panel').append('<input class="range-slider" type="range">');

  // set attributes of slider
  $('.range-slider').attr({
    max: 7,
    min: 0,
    value: 0,
    step: 1
  });

  //Sequence Step 2. Create step buttons
  $('#panel').append('<button class="step" id="reverse"></button>');
  $('#panel').append('<button class="step" id="forward"></button>');

  // Replace button content with images
  // attribution: left arrow by mikicon from the Noun Project
  // attribution: Right Arrow by mikicon from the Noun Project
  $('#reverse').html('<img src="img/reverse.png">');
  $('#forward').html('<img src="img/forward.png">');

  //Sequence Step 5. Listen for user input via affordances
  // click listener for buttons
  $('.step').click(function(){
    //Get the old index value
    var index = $('.range-slider').val();
    //Sequence Step 6. For a forward step through the sequence, increment the attributes array index;
    //   for a reverse step, decrement the attributes array index
    if ($(this).attr('id') == 'forward'){
      index++;
      //Sequence Step 7. At either end of the sequence, return to the opposite end of the sequence on the next step
      //   (wrap around)
      index = index > 7 ? 0 : index;
    } else if ($(this).attr('id') == 'reverse'){
      index--;
      //Sequence Step 7. At either end of the sequence, return to the opposite end of the sequence on the next step
      //   (wrap around)
      index = index < 0 ? 7 : index;
    };
    //Sequence Step 8. Update the slider position based on the new index
    $('.range-slider').val(index);
    //Sequence Step 9. Reassign the current attribute based on the new attributes array index
    updatePropSymbols(attributes[index]);
  });

  // input listener for slider
  $('.range-slider').on('input', function(){
    //Sequence Step 6: get the new index value
    var index = $(this).val();
    console.log(index);
    //Sequence Step 9. Reassign the current attribute based on the new attributes array index
    updatePropSymbols(attributes[index]);
  });
};


//Sequence Step 3. Create an array of the sequential attributes to keep track of their order
function processData(data) {
  // empty array to hold attributes
  var attributes = [];

  // properties of the first feature in the dataset
  var properties = data.features[0].properties;

  // push each attribute name into attributes array
  for (var attribute in properties){
    // only take attributes with average weekday ridership values
    if (attribute.indexOf("AWR") > -1){
      attributes.push(attribute);
    };
  };
  // check result
  console.log(attributes);

  return attributes;
};

//Sequence Step 10. Resize proportional symbols according to each feature's value for the new attribute
function updatePropSymbols(attribute){
  map.eachLayer(function(layer){
    if (layer.feature && layer.feature.properties[attribute]){
      //access the feature properties
      var props = layer.feature.properties;

      //update each feature's radius based on new attribute values
      var radius = calcPropRadius(props[attribute]);
      layer.setRadius(radius);

      //add station to popup content String
      var popupContent = new PopupContent(props, attribute);

      //update popup popup content
      popup = layer.getPopup();
      popup.setContent(popupContent.formatted).update();
    };
  });
};



// STEP 2 - Import GeoJSON data
//function to retrieve the data (using AJAX) and place it on the map
function getData(){
    //load the data
    $.getJSON("data/MTA_2011_2018.geojson", function(response){
      // Create an attributes array
      attributes = processData(response)

      // Calculate minimum data value
      minValue = calcMinValue(response);

      // Call function to make proportional symbols
      createPropSymbols(response);
      createSequenceControls(attributes);
    });
};

$(document).ready(createMap);
