var moment 			= require('moment');
var _ 				= require('lodash');
var fs				= require('fs');
var geolib 			= require('geolib');

var my_location = {
	lat : 32.077535,
	lon: 34.788547,
	street1: "Weizmann",
	street2: "Sderot Sha'ul HaMelech"
};

module.exports = {};
module.exports.do_parkour = function(provided_location, provided_distance){

	var start = provided_location || my_location;
	var distance = provided_distance || 500; // 500 meters

	//console.log(start);
	//console.log(distance);

	var verticies_filename = "./examples/intersections.json";
	var edges_filename = "./examples/edges.json";

	var edges_as_array = fs.readFileSync(edges_filename, 'utf8');
	edges_as_array = _.chain(JSON.parse(edges_as_array));

	var verticies = {};
	var edges = edges_as_array.map(function(value, index){
		var source = parseVertex(value[0]);
		var dest = parseVertex(value[1]);
		var dist = geolib.getDistance(
		    {latitude: source.lat, longitude: source.lon}, 
		    {latitude: dest.lat, longitude: dest.lon}
		);
		if(!verticies[source.id])
		{
			verticies[source.id] = source;
		}
		if(!verticies[dest.id])
		{
			verticies[dest.id] = dest;
		}

		var existingSWeight = verticies[source.id].weight || 0;
		var existingDWeight = verticies[dest.id].weight || 0;

		var newSWeight = existingSWeight + dist;
		var newDWeight = existingDWeight + dist;
		verticies[source.id].weight = newSWeight;
		verticies[dest.id].weight = newDWeight;

		return {
			source: source,
			dest : dest,
			dist: dist
		};
	}).filter(function(value, index){
		var dist1 = geolib.getDistance(
		    {latitude: value.source.lat, longitude: value.source.lon}, 
		    {latitude: start.lat, longitude: start.lon}
		);
		var dist2 = geolib.getDistance(
		    {latitude: value.dest.lat, longitude: value.dest.lon}, 
		    {latitude: start.lat, longitude: start.lon}
		);
		return dist1 < distance || dist2 < distance;
	}).map(function(value, index){
		return {
			sourceId : value.source.id,
			destId : value.dest.id,
			dist : value.dist
		};
	}).value();

	//console.log(edges);
	//console.log(verticies);
	/*
	var verticies_as_array = fs.readFileSync(verticies_filename, 'utf8');
	verticies_as_array = _.chain(JSON.parse(verticies_as_array));

	var verticies = verticies_as_array.map(function(value, index){
		return parseVertex(value);
	}).value();
	*/

	function parseVertex(v){

		/*
		var canonical_name = _.sortBy([v[2], v[3]], function(v){
			return v;
		});
*/
		return {
			id : v[2] + "_" + v[3], //(canonical_name[0] || "") + "_" + (canonical_name[1] || ""),
			lat: v[1],
			lon: v[0],
			street1: v[2],
			street2: v[3]
		}
	}

	console.log("There are " + edges.length + " within our search scope.  Now calculating the cycles via depth-first-search");
	//console.log(verticies);
	//console.log(edges);

	var components = [];

	var tarjan = function(V, E){
		var index = 0;
		var Stack = [];

		var strongconnect = function(v){
			//console.log("Invoking strongconnect on " + v.id);

			v.index = index;
			v.lowlink = index;
			index++;
			Stack.push(v);

			_.forEach(E, function(edge){
				var v1 = V[edge.sourceId];
				var v2 = V[edge.destId];

				if(!v2.index)
				{
					// Successor w has not yet been visited; recurse on it
			        strongconnect(v2);
			        v1.lowlink  = _.min([v1.lowlink, v2.lowlink]);
				}
				else
				{
					var foundVs = _.filter(Stack, function(s_elem){
						return v2.id == s_elem.id;
					});
					if(foundVs.length > 0)
					{
						// Successor w is in stack S and hence in the current SCC
	        			v1.lowlink  = _.min([v1.lowlink, v2.lowlink]);
					}
				}
			})

			// If v is a root node, pop the stack and generate an SCC
		    if (v.lowlink == v.index){
		    	var component = [];
		    	for(var w = Stack.pop();w != v;w = Stack.pop())
		    	{
		    		component.push(w);
		    	}
		    	//console.log("Strongly connected component: ")
		    	//console.log(component);
		    	if(component.length > 0)
		    	{
		    		components.push(component);
		    	}
		    }
		}

		_.forEach(V, function(v){
			if(!v.index){
				strongconnect(v);
			}
		});
	}

	//console.log("Invoking tarjan");
	tarjan(verticies, edges);
	//console.log("Done invoking tarjan");
	//console.log(components.length);

	var bestComponent = _.chain(components).sortBy(function(component){
		var total_weight = _.reduce(component, function(sum, v) {
			return sum + v.weight;
		});

		return total_weight;
	}).first().value();

	var dedupe = {};

	//console.log("The best component is: ");
	//console.log(bestComponent);
	var result = _.chain(bestComponent).sortBy(function(v){
		return v.weight;
	}).filter(function(v, index){
		var key = v.lat + "," + v.lon;
		if(!dedupe[key])
		{
			dedupe[key] = true;
			return true;
		}else{
			return false;
		}
	}).filter(function(v, index){
		return index < 6;
	}).map(function(v){
		//console.log(v.lat + "," + v.lon);
		return {lat: v.lat, lon: v.lon};
	}).value();

	//console.log("After filtering");
	//console.log(result);

	return result;
};