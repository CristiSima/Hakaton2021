var NODE_INFO=false;

var map = L.map('map').setView([44.4072742, 26.1030503], 18);
L.tileLayer('http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  maxZoom: 19,
  attribution: '&copy; <a href="http://openstreetmap.org/copyright">OpenStreetMap</a> contributors'
}).addTo(map);

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
  var bounds = map.getBounds().getSouth() + ',' + map.getBounds().getWest() + ',' + map.getBounds().getNorth() + ',' + map.getBounds().getEast();
  // var nodeQuery = 'node[' + overpassQuery + '](' + bounds + ');';
  // var wayQuery = 'way[' + overpassQuery + '](' + bounds + ');';
  // var relationQuery = 'relation[' + overpassQuery + '](' + bounds + ');';
  var groupQuery = overpassTurboQuery.replaceAll("{{bbox}}",bounds)
  var query = '?data=[out:json][timeout:15];(' + groupQuery + ');out body geom;';
  var baseUrl = 'http://overpass-api.de/api/interpreter';
  var resultUrl = baseUrl + query;
  return resultUrl;
}

var ActivityToPlace={
    "skateboard":"Skatepark",
    "soccer":"Soccer Field"
}

var activities=[
    "skateboard",
    "soccer"
]

function getFilters()
{
    return sportFilter("soccer")+sportFilter("skateboard");
}

function run() {
  var queryTextfieldValue = $("#query-textfield").val();
  var overpassApiUrl = buildFromOverpassApiUrl(map, getFilters());
  $.get(overpassApiUrl, function (osmDataAsJson) {
    var resultAsGeojson = osmtogeojson(osmDataAsJson);
    var resultLayer = L.geoJson(resultAsGeojson, {
      style: function (feature) {
        return {color: "#ff0000"};
        return {color: "#008800"};
      },
      filter: function (feature, layer) {
        // var isPolygon = (feature.geometry) && (feature.geometry.type !== undefined) && (feature.geometry.type === "Polygon");
        // if (isPolygon) {
        //   feature.geometry.type = "Polygon";
        //   // var polygonCenter = L.latLngBounds(feature.geometry.coordinates[0]).getCenter();
        //   // feature.geometry.coordinates = [ polygonCenter.lat, polygonCenter.lng ];
        // }
        return true;
      },
      onEachFeature: function (feature, layer) {
        var sport = feature.properties.tags["sport"];
        var popupContent= ActivityToPlace[sport];
        if(NODE_INFO)
        {
            popupContent = popupContent + "<dt>@id</dt><dd>" + feature.properties.type + "/" + feature.properties.id + "</dd>";
            var keys = Object.keys(feature.properties.tags);
            keys.forEach(function (key) {
                popupContent = popupContent + "<dt>" + key + "</dt><dd>" + feature.properties.tags[key] + "</dd>";
            });
            popupContent = popupContent + "</dl>"
        }
        layer.bindPopup(popupContent);
      }
    }).addTo(map);
  });
}
