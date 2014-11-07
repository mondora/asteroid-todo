//////////////////
// Dependencies //
//////////////////

var BPromise	= require("bluebird");
var chalk		= require("chalk");
var crypto		= require("crypto");
var WebSocket	= require("faye-websocket");
var fs			= require("fs");
var gulp		= require("gulp");
var plugins		= require("gulp-load-plugins")();
var http		= require("http");
var _			= require("lodash");
var mkdirp		= require("mkdirp");
var moment		= require("moment");
var static		= require("node-static");



///////////////////////
// Utility functions //
///////////////////////

var promisify = function (stream) {
	return new BPromise(function (resolve, reject) {
		stream.on("end", resolve);
		stream.on("error", reject);
	});
};

var timeString = function () {
	var ret = "";
	ret += chalk.white("[");
	ret += chalk.grey(moment().format("HH:mm:ss"));
	ret += chalk.white("] ");
	return ret;
};

var logBuilding = function (target) {
	console.log(timeString() + "Building '" + chalk.cyan(target) + "'");
};


//////////////////////////////////
// App files building functions //
//////////////////////////////////

var buildAppIndex = function (dest, target) {
	logBuilding("app index");
	var stream = gulp.src("app/index.html")
		.pipe(plugins.preprocess({context: {TARGET: target}}))
		.pipe(gulp.dest(dest));
	return promisify(stream);
};

var buildAppScripts = function (dest) {
	logBuilding("app scripts");
	var stream = gulp.src("app/**/*.jsx")
		.pipe(plugins.react())
		.pipe(plugins.concat("app.js"))
		.pipe(gulp.dest(dest));
	return promisify(stream);
};

var buildAppStyles = function (dest) {
	logBuilding("app styles");
	var stream = gulp.src("app/**/*.css")
		.pipe(plugins.autoprefixer("last 3 version"))
		.pipe(plugins.concat("app.css"))
		.pipe(gulp.dest(dest));
	return promisify(stream);
};



/////////////////////////////////////
// Vendor files building functions //
/////////////////////////////////////

var buildVendorScripts = function (dest) {
	logBuilding("vendor scripts");
	var sources = [
		"bower_components/react/react.js",
		"bower_components/ddp.js/src/ddp.js",
		"bower_components/q/q.js",
		"bower_components/asteroid/dist/asteroid.browser.js",
		"bower_components/asteroid/dist/plugins/facebook-login.js"
	];
	var stream = gulp.src(sources)
		.pipe(plugins.concat("vendor.js"))
		.pipe(gulp.dest(dest));
	return promisify(stream);
};

var buildVendorStyles = function (dest, minify) {
	logBuilding("vendor styles");
	var sources = [
		"bower_components/bootstrap/dist/css/bootstrap.css",
		"bower_components/fontawesome/css/font-awesome.css"
	];
	var stream = gulp.src(sources)
		.pipe(plugins.concat("vendor.css"))
		.pipe(gulp.dest(dest));
	return promisify(stream);
};

var buildVendorGlyphs = function (dest) {
	logBuilding("vendor glyphs");
	var sources = [
		"bower_components/fontawesome/fonts/*",
	];
	var stream = gulp.src(sources)
		.pipe(gulp.dest(dest));
	return promisify(stream);
};



////////////////
// Gulp tasks //
////////////////

gulp.task("default", function () {

	// Initial build
	mkdirp.sync("builds/web");
	mkdirp.sync("builds/web/js");
	mkdirp.sync("builds/web/css");
	mkdirp.sync("builds/web/fonts");

	buildAppIndex("builds/web/");
	buildAppScripts("builds/web/js/");
	buildAppStyles("builds/web/css/");
	buildVendorScripts("builds/web/js/");
	buildVendorStyles("builds/web/css/");
	buildVendorGlyphs("builds/web/fonts/");


	// Set up dev server
	var file = new static.Server("./builds/web/");
	var ws = {
		sockets: {},
		reload: function () {
			_.forEach(ws.sockets, function (socket) {
				socket.send("reload");
			});
		}
	};
	http.createServer()
		.on("request", function (req, res) {
			req.on("end", function () {
				file.serve(req, res);
			}).resume();
		})
		.on("upgrade", function (req, sock, body) {
			var key = crypto.randomBytes(16).toString("hex");
			if (WebSocket.isWebSocket(req)) {
				ws.sockets[key] = new WebSocket(req, sock, body);
				ws.sockets[key].on("close", function () {
					delete ws.sockets[key];
				});
			}
		})
		.listen(8080, "0.0.0.0");


	// Watchers
	var watch = function (sources, callback) {
		gulp.watch(sources).on("change", function () {
			callback().then(ws.reload);
		});
	};
	watch("app/index.html", function () {
		return buildAppIndex("builds/web/", "web");
	});
	watch("app/**/*.jsx", function () {
		return buildAppScripts("builds/web/js/");
	});
	watch("app/**/*.css", function () {
		return buildAppStyles("builds/web/css/");
	});

});
