var gulp = require('gulp');

var gulp = require('gulp');
var browserify = require('browserify');
var jade = require('gulp-jade');
var jadeify = require('browserify-jade').jade({ pretty: false })
var source = require('vinyl-source-stream')

var handleError = function(e){
	console.log(e);
}

var compile_jade = function(){
	gulp.src('./src/index.jade')
		.pipe(jade())
		.pipe(gulp.dest('./build'))
}

var compile_scripts = function(){
	var file = './src/js/app.js'
	var opts = { extensions: [ '.jade', '.json' ] }

	var stream = browserify(file, opts)
	    .transform(jadeify)
	    .bundle()
	    .on('error', handleError)
	    .pipe(source('index.js'))
	    .on('end', function() {
	    })
	stream.pipe(gulp.dest('./build/'));
}

gulp.task('build', function (){
    compile_scripts();
    compile_jade();
});

gulp.task('watch', function () {
    gulp.watch('src/js/**/*.jade', ['build']);
    gulp.watch('src/js/**/*.js', ['build']);
});

gulp.task('default', ['build', 'watch']);