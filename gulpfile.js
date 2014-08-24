var gulp = require('gulp');
var browserify = require('browserify');
var jade = require('gulp-jade');
var jadeify = require('browserify-jade').jade({
	pretty: false
});
var source = require('vinyl-source-stream');
var connect = require('gulp-connect');
// var gutil = require('gulp-util');
// var connect = require('connect');
// var http = require('http');
// var serveStatic = require('serve-static');
// var tinylr = require('tiny-lr')();

var handleError = function(e) {
	console.log(e);
};

var compile_jade = function() {
	gulp.src('./src/index.jade')
		.pipe(jade())
		.pipe(gulp.dest('./build'))
        .pipe(connect.reload());
};

var compile_scripts = function() {
	var file = './src/js/app.js';
	var opts = {
		extensions: ['.jade', '.json']
	};

	var stream = browserify(file, opts)
		.transform(jadeify)
		.bundle()
		.on('error', handleError)
		.pipe(source('index.js'))
		.on('end', function() {});
	stream.pipe(gulp.dest('./build/'))
    .pipe(connect.reload());
};


gulp.task('build', function() {
	compile_scripts();
	compile_jade();
});


gulp.task('connect', function() {
  connect.server({
    root: './build',
    livereload: true,
    port: 8888
  });
});

gulp.task('watch', function() {
	var watcher = gulp.watch('./src/**/*', ['build']);
	watcher.on('change', function(event) {
		console.log('File ' + event.path + ' was ' + event.type + ', running tasks...');
	});
});


gulp.task('default', ['build', 'watch', 'connect']);