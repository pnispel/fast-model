var gulp = require('gulp');
var sourcemaps = require('gulp-sourcemaps');
var source = require('vinyl-source-stream');
var buffer = require('vinyl-buffer');
var browserify = require('browserify');
var watchify = require('watchify');
var babel = require('babelify');
// var jasmine = require('gulp-jasmine-phantom');
var mochify = require('mochify');

// .pipe(jasmine());

function compile(watch) {
  var bundler = watchify(browserify('./src/index.js', {
    debug: true,
    standalone: 'Fast'
  }).transform(babel));

  function rebundle() {
    bundler.bundle()
      .on('error', function(err) { console.error(err); this.emit('end'); })
      .pipe(source('build.js'))
      .pipe(buffer())
      .pipe(sourcemaps.init({ loadMaps: true }))
      .pipe(sourcemaps.write('./'))
      .pipe(gulp.dest('./build'));
  }

  if (watch) {
    bundler.on('update', function() {
      console.log('-> bundling...');
      rebundle();
    });
  }

  rebundle();
}

function watch() {
  return compile(true);
};

function docs () {
  gulp.src('./src/*.js')
    .pipe(markdox())
    .pipe(gulp.dest('./doc'));
}

function test (done) {
  var bundler = mochify('./spec/**/*_spec.js', {
    node: true
  }).transform(babel);

  bundler.bundle();
}

gulp.task('test', function(){ return test(); });
gulp.task('doc', function(){ return docs(); });
gulp.task('build', function() { return compile(); });
gulp.task('watch', function() { return watch(); });

gulp.task('default', ['watch']);
