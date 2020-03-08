// Mapping MTA data

// Remaining steps:
// 1. Add in title
// 2. Add in map context in side panel AND data sources
// 3. consider changing base map?
// 4. restrict pan?
// 5. restrict zoom?
// 6. Add in checkbox filters?
// 7. Add in more stations?
// 8. Format numbers in legend and popups?


// STEP 1 - Make a map of the MTA dataset
// initialize the map and set its view and initial zoom level (11)
//
var map;
var attributes;
var dataStats = {};
var apikey = '<d88dbfddfd6642878eae6e6e3c96bdfa>';

function createMap(){
  // create the map
  map = L.map('mapid', {
    center: [40.73, -73.95],
    zoom: 12
  });

  // add oSM base tilelayer
  // L.tileLayer('http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  //       attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap contributors</a>'
  //   }).addTo(map);
  // Add ThunderForest base layer
  L.tileLayer('https://{s}.tile.thunderforest.com/transport/{z}/{x}/{y}.png?apikey=d88dbfddfd6642878eae6e6e3c96bdfa', {
	   attribution: '&copy; <a href="http://www.thunderforest.com/">Thunderforest</a>, &copy; <a href="https://www.openstreetmap.org/copyright"> OpenStreetMap contributors</a>',
	   maxZoom: 22
  }).addTo(map);
  // L.tileLayer.provider('ThunderForest.Transport', {apikey: 'd88dbfddfd6642878eae6e6e3c96bdfa'}).addTo(map);

  //call getData function
  getData();
};

function createSidePanel(){
    //create range input element (slider)
    $('#panel').append('<h2>Average Weekday Ridership from 2011 - 2018 for the Top 20 Subway Stations in New York City</h2>');
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

// Calculate minimum value in dataset
function calcStats(data) {
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

  // Get minimum,and maximum values of our array
  dataStats.min = Math.min(...allValues);
  dataStats.max = Math.max(...allValues);

  // Calculate mean
  var sum = allValues.reduce(function(a, b){return a+b;});
  dataStats.mean = sum/allValues.length;
}

// Calculate the radius of each proportional symbol
function calcPropRadius(attValue) {
  // Constant factor adjusts symbol sizes evenly
  var minRadius = 8;

  // Flannery appearance compensation formula
  var radius = 1.0083 * Math.pow(attValue/dataStats.min, 0.5715) * minRadius

  return radius;
};

// Create popup setContent
function PopupContent(properties, attribute) {
  this.properties = properties;
  this.attribute = attribute;
  this.year = attribute.split("_")[1];
  this.ridership = this.properties[attribute];
  this.formatted = "<p><b>Station:</b> " + this.properties.Station +
  "</p><p>" + "<b><p>Lines served:</b> " + listWithCommas(String(this.properties.Lines)) +
  "</p><p><b>Average weekday ridership in " + this.year + ":</b> "
  + numberWithCommas(this.ridership) + " people" + "</p>";
};

// Step 3: Add circle markers for subway stations to map
function pointToLayer(feature, latlng, attributes){
  //Sequence Step 4. Assign the current attribute based on the index of the attributes array
  var attribute = attributes[0];
  // check attribute
  console.log(attribute)

  // set marker options
  var geojsonMarkerOptions = {
    fillColor: "#FFDF00",
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

  // // TEST CODE: temp change to popup content
  // popupContent.formatted = "<h2>" + popupContent.ridership + "</h2";
  // var popupContent2 = Object.create(popupContent);
  // popupContent2.formatted = "<h2>" + popupContent.ridership + "</h2>";
  // console.log(popupContent.formatted)

  // Bind the popup to the circle marker
  layer.bindPopup(popupContent.formatted, {
    offset: new L.Point(0,-geojsonMarkerOptions.radius)
  });

  // return the circle maker to the L.geoJson pointToLayer option
  return layer;

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
  var SequenceControl = L.Control.extend({
      options: {
        position: 'bottomleft'
      },

      onAdd: function () {
        // create the control container div with a particular class name
        var container = L.DomUtil.create('div', 'sequence-control-container');

        // initialize other DOM elements
        // create a slider (range input element)
        $(container).append('<input class="range-slider" type="range">');

        //Sequence Step 2. Create step buttons
        $(container).append('<button class="step" id="reverse"></button>');
        $(container).append('<button class="step" id="forward"></button>');

        // Disable any mouse event listeners for the container
        L.DomEvent.disableClickPropagation(container);

        return container;
    }

  });

  map.addControl(new SequenceControl());

  // set attributes of slider
  $('.range-slider').attr({
    max: 7,
    min: 0,
    value: 0,
    step: 1
  });

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
    updateLegend(attributes[index]);
  });
  //
  // // input listener for slider
  $('.range-slider').on('input', function(){
    //Sequence Step 6: get the new index value
    var index = $(this).val();
    console.log(index);
    //Sequence Step 9. Reassign the current attribute based on the new attributes array index
    updatePropSymbols(attributes[index]);
    updateLegend(attributes[index]);
  });
};


// Create new extended control for the temporal legend
function createLegend(attribute){
  var LegendControl = L.Control.extend({
    options: {
      position: 'bottomright'
    },

    onAdd: function () {
      // Create the control conatiner with a particular class name
      var container = L.DomUtil.create('div', 'legend-control-container');

      // define year variable
      var year = attribute.split("_")[1];
      // Script to create temporal legend here
      $(container).append('<div id = "temporal-legend"><b>Average Weekday Ridership in '+ year +'</b></div>');

      // Step 1: start attribute legend svg string
      var svg = '<svg id ="attribute-legend" width = "210px" height = "60px">';

      // // array of circle names that loop is based on
      var circles = ["max", "mean", "min"];

      // Step 2: loop to add each circle and text to svg string
      for (var i=0; i<circles.length; i++){
        // Step 3: for each circle, assign the r and cy attributes
        var radius = calcPropRadius(dataStats[circles[i]]);
        var cy = 59 - radius;

        // circle string
        svg += '<circle class="legend-circle" id="' + circles[i] + '" r="' + radius + '"cy="' + cy + '" fill="#FFDF00" fill-opacity="0.8" stroke="#000000" cx="30"/>';

        // evenly space out the labels
        var textY = i * 15 + 20;

        // Text string
        svg += '<text id="' + circles[i] + '-text" x= "70" y = "' + textY + '">' + numberWithCommas(Math.round(dataStats[circles[i]]*100)/100) + " people" + '</text>';

      };
      // // then close the svg string
      svg += "</svg>";
      //
      // // Add attribute legend to container
      $(container).append(svg);

      // Disable any mouse event listeners for the container
      L.DomEvent.disableClickPropagation(container);

      return container;
    }
  });
  map.addControl(new LegendControl());
}

// Function to update legend
function updateLegend(attribute) {
  var legend = document.getElementById("temporal-legend");
  var year = attribute.split("_")[1];
  legend.innerHTML = '<b>Average Weekday Ridership in '+ year +'</b>';
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

function numberWithCommas(x) {
    return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

function listWithCommas(string) {
  var len = string.length
  var str = ""
  for (var i=0; i<string.length; i++){
    if (i < (len-1)) {
      str += string[i] + ','
    } else {
      str += string[i]
    };
  };
  return str;
};

// STEP 2 - Import GeoJSON data
//function to retrieve the data (using AJAX) and place it on the map
function getData(){
    //load the data
    $.getJSON("data/MTA_2011_2018.geojson", function(response){
      // Create an attributes array
      attributes = processData(response)

      // Calculate minimum data value
      calcStats(response);

      // Call function to make proportional symbols
      createPropSymbols(response);
      createSequenceControls(attributes);
      createLegend(attributes[0]);
      createSidePanel();
    });
};

$(document).ready(createMap);
