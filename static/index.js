var NODE_INFO=false;
// var NODE_INFO=true;
var MARGIN_LAT= 0.05;
var MARGIN_LONG=0.05;

// var myIcon= L.icon({
//     iconUrl: '/static/icons/test.ico',
//     iconSize: [55, 64],
//     iconAnchor: [0, 0],
//     popupAnchor: [0, 0],
// });

var map = L.map('map').setView([44.4072742, 26.1030503], 14);
L.tileLayer('http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  maxZoom: 19,
  attribution: '&copy; <a href="http://openstreetmap.org/copyright">OpenStreetMap</a> contributors'
}).addTo(map);


function getBounds(map,overpassQuery)
{
    return  (map.getBounds().getSouth() - MARGIN_LAT) + ',' +
            (map.getBounds().getWest()  - MARGIN_LONG) + ',' +
            (map.getBounds().getNorth() + MARGIN_LAT) + ',' +
            (map.getBounds().getEast()  + MARGIN_LONG);
}

function buildOverpassApiUrl(map, overpassQuery) {
  var bounds = map.getBounds().getSouth() + ',' + map.getBounds().getWest() + ',' + map.getBounds().getNorth() + ',' + map.getBounds().getEast();
  var nodeQuery = 'node[' + overpassQuery + '](' + bounds + ');';
  var wayQuery = 'way[' + overpassQuery + '](' + bounds + ');';
  var relationQuery = 'relation[' + overpassQuery + '](' + bounds + ');';
  var query = '?data=[out:json][timeout:15];(' + nodeQuery + wayQuery + relationQuery + ');out body geom;';
  var baseUrl = 'http://overpass-api.de/api/interpreter';
  var resultUrl = baseUrl + query;
  return resultUrl;
}


var bikeFilter=`
nw["amenity"~"^(bicycle_rental|bicycle_sharing|bicycle_library)$"]({{bbox}});
`.replaceAll("\n","").replaceAll("\t","").replaceAll(" ","");

function sportFilter(sportName="")
{
    var BASE=`
        node["leisure"="pitch"]["sport"]({{bbox}});
        way["leisure"="pitch"]["sport"]({{bbox}});
        relation["leisure"="pitch"]["sport"]({{bbox}});
    `.replaceAll("\n","").replaceAll("\t","").replaceAll(" ","");

    if(sportName=="")
            return BASE

    sportName="\"sport\"=\""+sportName+"\"";

    return BASE.replaceAll("\"sport\"",sportName);
}


function buildFromOverpassApiUrl(map, overpassTurboQuery) {
  // console.log(getBounds(map, overpassTurboQuery));
  var groupQuery = overpassTurboQuery.replaceAll("{{bbox}}",getBounds(map, overpassTurboQuery))
  var query = '?data=[out:json][timeout:15];(' + groupQuery + ');out body geom;';
  var baseUrl = 'http://overpass-api.de/api/interpreter';
  var resultUrl = baseUrl + query;
  return resultUrl;
}

var ActivityToPlace={
    "skateboard":"Skatepark",
    "soccer":"Soccer Field",
    "basketball":"Basketball Court",
    "tennis":"Tennis Court",
    "chess":"Chess Table",
    "archery":"Archery Range"
}
//
var activities=[
    "skateboard",
    "soccer",
    "basketball",
    "tennis",
    "chess",
    "archery"
]

function generateCgeckboxes()
{
    for(var activity in activities)
    {
        activity=activities[activity]
        console.log(activity)
        var li=document.getElementById("items").appendChild(document.createElement("li"));
        var checkbox=li.appendChild(document.createElement("input"));
        checkbox.setAttribute("type","checkbox")
        checkbox.setAttribute("id",activity)
        checkbox.setAttribute("activity",activity)
        var label=li.appendChild(document.createElement("label"));
        label.setAttribute("for",activity);
        label.appendChild(document.createTextNode(ActivityToPlace[activity]));
    }
}
setTimeout(generateCgeckboxes, 1);

function getFilters()
{
    var values=getCheckboxvalue();
    var filter="";
    for (var value in values) {
        filter+= sportFilter(values[value])

    }
    console.log(filter)
    return filter
    return sportFilter("soccer")+sportFilter("skateboard")+bikeFilter;
}

var layers=[];

function conterToGeolocation()
{
    navigator.geolocation.getCurrentPosition(function(pos){
        map.panTo([pos.coords.latitude,pos.coords.longitude]);
    },console.log
    );
}

// go to location button
{
    var center=document.querySelector("#map > div:nth-child(3) > div.leaflet-top.leaflet-left > div").appendChild(document.createElement("a"))
    center.setAttribute("class","leaflet-control-position");
    center.setAttribute("href","#");
    center.setAttribute("title","Go to position");
    center.setAttribute("role","button");
    center.setAttribute("onclick","conterToGeolocation()");
    center.appendChild(document.createTextNode("📌"))
}


function doingQuery()
{

}

function doneQuery()
{
    while(layers.length!=0)
        layers.pop().remove();
}

function run() {
    doingQuery()
  var queryTextfieldValue = $("#query-textfield").val();
  var overpassApiUrl = buildFromOverpassApiUrl(map, getFilters());
  $.get(overpassApiUrl, function (osmDataAsJson) {
    var resultAsGeojson = osmtogeojson(osmDataAsJson);
    doneQuery()
    var resultLayer = L.geoJson(resultAsGeojson, {
      style: function (feature) {
        return {color: "#ff0000"};
        return {color: "#008800"};
      },
      filter: function (feature, layer) {
        var isPoint = (feature.geometry) && (feature.geometry.type !== undefined) && (feature.geometry.type === "Point");
        var isPolygon = (feature.geometry) && (feature.geometry.type !== undefined) && (feature.geometry.type === "Polygon");
        if (isPolygon) {
          // feature.geometry.type = "Polygon";
          var polygonCenter = L.latLngBounds(feature.geometry.coordinates[0]).getCenter();
          feature.geometry.center = [ polygonCenter.lat, polygonCenter.lng ];
        }
        else if(isPoint)
        {
            feature.geometry.center=feature.geometry.coordinates;
        }

        return true;
      },
      onEachFeature: function (feature, layer) {
          // console.log(feature)
        var popupContent= "";

        if("sport" in feature.properties.tags)
        {
            var sport = feature.properties.tags["sport"];
            popupContent += ActivityToPlace[sport];
        }
        else if("amenity" in feature.properties.tags && feature.properties.tags["amenity"]=="bicycle_rental")
        {
            popupContent += "Bicycle Rental"
        }


        if(NODE_INFO || popupContent=="")
        {
            popupContent += "<BR>"
            popupContent += "============="
            popupContent += "<dt>@id</dt><dd>" + feature.properties.type + "/" + feature.properties.id + "</dd>";
            var keys = Object.keys(feature.properties.tags);
            keys.forEach(function (key) {
                popupContent += "<dt>" + key + "</dt><dd>" + feature.properties.tags[key] + "</dd>";
            });
            popupContent += "</dl>"
        }

        // se icon
        // {
        //     var b=L.marker(feature.geometry.center.reverse(), {icon: myIcon}).addTo(map);
        //     console.log(b);
        // }

        layers.push(layer)
        // console.log(layer)
        layer.bindPopup(popupContent);
      }
    }).addTo(map);
  });
}

setTimeout(run, 50);
