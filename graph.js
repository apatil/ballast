/* implementation heavily influenced by http://bl.ocks.org/1166403 */

// define dimensions of graph
var m = [80, 80, 80, 80]; // margins
var w = 1000 - m[1] - m[3]; // width
var h = 400 - m[0] - m[2]; // height

// create a simple data array that we'll plot with a line (this array represents only the Y values, X will just be the index location)

var x = d3.scale.linear().domain([-30, 30]).range([0, w]);
var y = d3.scale.linear().domain([1, -5]).range([0, h]);

// create a line function that can convert data[] into x and y points
var line = d3.svg.line()
    .x(function(d) {
        console.log("X got", d, " returning ", d[0]);
        return x(d[0]);
    })
    .y(function(d) {
        console.log("Y got", d, " returning ", d[1]);
        return y(d[1]);
    })

// Add an SVG element with the desired dimensions and margin.
var graph = d3.select("#graph").append("svg:svg")
      .attr("width", w + m[1] + m[3])
      .attr("height", h + m[0] + m[2])
    .append("svg:g")
      .attr("transform", "translate(" + m[3] + "," + m[0] + ")");

// create yAxis
var xAxis = d3.svg.axis().scale(x).tickSize(-h).tickSubdivide(true);
// Add the x-axis.
graph.append("svg:g")
      .attr("class", "x axis")
      .attr("transform", "translate(0," + h + ")")
      .call(xAxis);


// create left yAxis
var yAxisLeft = d3.svg.axis().scale(y).ticks(4).orient("left");
// Add the y-axis to the left
graph.append("svg:g")
      .attr("class", "y axis")
      .attr("transform", "translate(-25,0)")
      .call(yAxisLeft);

// Add the line by appending an svg:path element with the data line we created above
// do this AFTER the axes above so that the line is above the tick-lines
var path = graph.append("svg:path");
var waterline = graph.append("svg:path").attr("d", line([[-30, 0], [30, 0]]))

var plotLine = function(ballast) {
    var fb = computeAttitude(ballast);
    var frontDepth = ballast / 5000;
    var backDepth = fb[1];
    path.attr("d", line([[-25,-backDepth], [25,-frontDepth]]))
}

var computeAttitude = function(ballast) {
    var water_density = 1;
    var kg_to_pound = 2.2;
    var ton_to_pound = kg_to_pound*1000;
    var inch_to_meter = .0254;
    var meter_to_inch = 1/inch_to_meter;
    var length = (57*12-22-22/2.-92/2.)*inch_to_meter;
    var width = (6*12+10)*inch_to_meter;
    var ballast_cm = length-92/2*inch_to_meter;
    var front_depth = (9+.75)*inch_to_meter;
    var back_depth = 23*inch_to_meter;

    var ballasted_front_depth = 1;
    var ballasted_back_depth = 2;

    return [ballasted_front_depth, ballasted_back_depth]

}

plotLine(2500);

d3.select('#slider').call(d3.slider().value(2500).axis(true).min(0).max(10000).on("slide", function(evt, value) {
        d3.select("#ballastamount").text(value);
        plotLine(value);
    }));
