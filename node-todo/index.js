var Asteroid = require("asteroid");
var Jetty = require("jetty");

var Ceres = new Asteroid("localhost:3000");
var jetty = new Jetty(process.stdout);

var repeat = function (repeatChar, times) {
	return new Array(times + 1).join(repeatChar);
};
var padRight = function (string, length, padChar) {
	if (string.length > length) {
		return string.slice(0, length);
	}
	padChar = padChar || " ";
	return string + repeat(padChar, length - string.length);
};
var draw = function () {
	jetty.clear().moveTo([0,0]);
	console.log("asteroid-todo");
	console.log();
	tasksRQ.result.forEach(function (task) {
		var line = "";
		line += padRight(task.userName, 20);
		line += padRight(task.description, 40);
		line += padRight(task.done ? "done" : "", 10);
		console.log(line);
	});
};

var Tasks = Ceres.getCollection("tasks");
Ceres.subscribe("tasks");
var tasksRQ = Tasks.reactiveQuery({});
tasksRQ.on("change", draw);
draw();
