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
        // console.log("X got", d, " returning ", d[0]);
        return x(d[0]);
    })
    .y(function(d) {
        // console.log("Y got", d, " returning ", d[1]);
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
      .call(xAxis)
        .append("text")
        .attr("class", "x label")
        .attr("text-anchor", "end")
        .attr("x", 500)
        .attr("y", 30)
        .text("Distance from center of boat (feet)");


// create left yAxis
var yAxisLeft = d3.svg.axis().scale(y).ticks(4).orient("left");
// Add the y-axis to the left
graph.append("svg:g")
      .attr("class", "y axis")
      .attr("transform", "translate(-25,0)")
      .call(yAxisLeft)
      .append("text")
    .attr("class", "y label")
    .attr("text-anchor", "end")
    .attr("y", -50)
    .attr("x", -60)
    .attr("dy", ".75em")
    .attr("transform", "rotate(-90)")
    .text("Depth (feet)");

// Add the line by appending an svg:path element with the data line we created above
// do this AFTER the axes above so that the line is above the tick-lines
var path = graph.append("svg:path");
var waterline = graph.append("svg:path").attr("d", line([[-30, 0], [30, 0]]))

var plotLine = function(ballast) {
    var attitude = computeAttitude(ballast);
    d3.select("#frontdepth").text(-attitude[0][1] * 12);
    d3.select("#reardepth").text(-attitude[1][1] * 12);
    path.attr("d", line(attitude))
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

    // Internally, mass is tons and distance is meters.
    var ballast_weight = ballast / ton_to_pound;

    console.log(empty_weight)
    // From sympy
    var l=length, lb=ballast_cm, mb=ballast_weight, rho=water_density, w=width;
    var df = front_depth, dr = back_depth;
    var me = 1/2*(2*df + dr)*l*rho*w;
    var empty_weight = me;
    var lc = 1/3*(2*df + dr)*l/(df + dr);

    console.log("Empty center of mass", lc * meter_to_inch / 12)
    var ballasted_front_depth = df = -2/3*((l - 3*lb)*mb + l*me - 3*lc*me)/(l*lc*rho*w);
    var ballasted_back_depth = dr = 2/3*((2*l - 6*lb + 3*lc)*mb + 2*l*me - 3*lc*me)/(l*lc*rho*w);

    var avg_depth = df + dr / 2
    // console.log("force balance", rho * w * avg_depth * l - empty_weight - ballast_weight)
    // console.log("torque balance", 1/6*((2*df + dr)*l*l - 3*(df + dr)*l*lc)*rho*w-(lb-lc)*mb)
    var baseplateAngle = Math.atan2(dr-df, length) * 180 / Math.PI
    // d3.select("#angle").text(baseplateAngle)
    return [
        [
            length * meter_to_inch / 24,   
            -ballasted_front_depth * meter_to_inch / 12
        ], 
        [
            -length * meter_to_inch / 24,
            -ballasted_back_depth * meter_to_inch / 12
        ]
        
    ];

}

plotLine(2500);

d3.select('#slider').call(d3.slider().value(2500).axis(true).min(0).max(7500).on("slide", function(evt, value) {
        d3.select("#ballastamount").text(value);
        plotLine(value);
    }));
