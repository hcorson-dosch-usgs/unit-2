// Leaflet geoJSON tutorial

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
var mymap = L.map('mapid').setView([39.75621, -104.99404], 4);

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

// Specify a geoJSON Feature
var geojsonFeature = {
    "type": "Feature",
    "properties": {
        "name": "Coors Field",
        "amenity": "Baseball Stadium",
        "popupContent": "This is where the Rockies play!"
    },
    "geometry": {
        "type": "Point",
        "coordinates": [-104.99404, 39.75621]
    }
};

// Add a GeoJSON object to the map through a GeoJSON layer
//
// The L.geoJSON method represents a single GeoJSON object
// or an array of GeoJSON objects, and allows you to parse
// and display GeoJSON data on the map
// It inherits methods and properties from the FeatureGroup class
// which in turn inherits methods and properties from the LayerGroup class
// It can optionally take a GeoJSON object and an options object
// Many of the options are functions that set how to display the geoJSOn content
L.geoJSON(geojsonFeature).addTo(mymap);

// The GeoJSON object could also be passed as an array of valid GeoJSON objects
// Here two polylines are specified
var myLines = [{
    "type": "LineString",
    "coordinates": [[-100, 40], [-105, 45], [-110, 55]]
}, {
    "type": "LineString",
    "coordinates": [[-105, 40], [-110, 45], [-115, 55]]
}];

// Or we could create an empty GeoJSON layer and assign it to a variable
// That way we could add more features to it later
//
// The addData method adds a GeoJSON object to the specified layer
// It takes a geoJSON object as an argument
var myLayer = L.geoJSON().addTo(mymap);
myLayer.addData(geojsonFeature);

// Use the style option to style all paths the same way
// Define two polylines
// set a style object specifying a color, weight, and opacity for those lines
var myLines = [{
    "type": "LineString",
    "coordinates": [[-100, 40], [-105, 45], [-110, 55]]
}, {
    "type": "LineString",
    "coordinates": [[-105, 40], [-110, 45], [-115, 55]]
}];

var myStyle = {
    "color": "#ff7800",
    "weight": 5,
    "opacity": 0.65
};

L.geoJSON(myLines, {
    style: myStyle
}).addTo(mymap);

// Or, style individual features based on their properties
// Define two state polygons, and color them according to
// the attribute value of "party"
var states = [{
    "type": "Feature",
    "properties": {"party": "Republican"},
    "geometry": {
        "type": "Polygon",
        "coordinates": [[
            [-104.05, 48.99],
            [-97.22,  48.98],
            [-96.58,  45.94],
            [-104.03, 45.94],
            [-104.05, 48.99]
        ]]
    }
}, {
    "type": "Feature",
    "properties": {"party": "Democrat"},
    "geometry": {
        "type": "Polygon",
        "coordinates": [[
            [-109.05, 41.00],
            [-102.06, 40.99],
            [-102.03, 36.99],
            [-109.04, 36.99],
            [-109.05, 41.00]
        ]]
    }
}];

// Here the L.geoJSON method has a style function as its options object
// The style function returns a specific color depending on the attribute
L.geoJSON(states, {
    style: function(feature) {
        switch (feature.properties.party) {
            case 'Republican': return {color: "#ff0000"};
            case 'Democrat':   return {color: "#0000ff"};
        }
    }
}).addTo(mymap);

// Use the pointToLayer function to draw a specified marker
// instead of a simple marker for a point
//
// the L.circleMarker function instantiates a circle marker object
// it takes the coordinates of a point and an optional options object
var geojsonMarkerOptions = {
    radius: 8,
    fillColor: "#ff7800",
    color: "#000",
    weight: 1,
    opacity: 1,
    fillOpacity: 0.8
};

// Here the L.geoJSON method has a pointToLayer function
// as its options object. It defines how points in the geoJSOn
// should be represented as Leaflet layers. Each GeoJOSN point
// feature and its coordinates are passed to the function
L.geoJSON(geojsonFeature, {
    pointToLayer: function (feature, latlng) {
        return L.circleMarker(latlng, geojsonMarkerOptions);
    }
}).addTo(mymap);

// Here the L.geoJSON method has a onEachFeature function
// as its options object. It is called for each create feature
// and can be used to attach events or popups to features
//
// The bindPopup function binds the pre-defined popupContent
// to each feature passed by the onEachFeature method
function onEachFeature(feature, layer) {
    // does this feature have a property named popupContent?
    if (feature.properties && feature.properties.popupContent) {
        layer.bindPopup(feature.properties.popupContent);
    }
}

var geojsonFeature = {
    "type": "Feature",
    "properties": {
        "name": "Coors Field",
        "amenity": "Baseball Stadium",
        "popupContent": "This is where the Rockies play!"
    },
    "geometry": {
        "type": "Point",
        "coordinates": [-104.99404, 39.75621]
    }
};

L.geoJSON(geojsonFeature, {
    onEachFeature: onEachFeature
}).addTo(mymap);

// Here the L.geoJSON method has a filter function
// as its options object. This function decides whether
// or not to include a given feature.
//
// Here, Busch Field will not be shown
var someFeatures = [{
    "type": "Feature",
    "properties": {
        "name": "Coors Field",
        "show_on_map": true
    },
    "geometry": {
        "type": "Point",
        "coordinates": [-104.99404, 39.75621]
    }
}, {
    "type": "Feature",
    "properties": {
        "name": "Busch Field",
        "show_on_map": false
    },
    "geometry": {
        "type": "Point",
        "coordinates": [-104.98404, 39.74621]
    }
}];

L.geoJSON(someFeatures, {
    filter: function(feature, layer) {
        return feature.properties.show_on_map;
    }
}).addTo(mymap);
