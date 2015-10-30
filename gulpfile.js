// Build automation
// Require sudo npm install -g gulp
// For dev, initiate watch by executing either `gulp` or `gulp watch`

var gulp = require('gulp'),
    browserify = require('browserify'),
    source = require('vinyl-source-stream'),
    gutil = require('gulp-util'),
    uglify = require('gulp-uglify'),
    shell = require('gulp-shell'),
    rename = require('gulp-rename');
    _ = require('underscore');
    listFiles = require('file-lister');

var path = {
  originalJs: ['./js/'],
  standAloneJs: ['./tmp/*.js']
};

// Build All
gulp.task('build', ['browserify', "publish_debug", "publish_min"]);

gulp.task('browserify', function() {
  debug = true;
  var destDir = "./tmp";


  var bundleThis = function(srcArray)
  {
    _.each(srcArray, function(sourceFile)
    {
      var bundle = browserify(sourceFile).bundle();
      bundle.pipe(source(getFileNameFromPath(sourceFile)))
            .pipe(gulp.dest(destDir));
    });
  };

  listFiles(path.originalJs, function(error, files) {
    if (error) {
        console.log(error);
    } else {
      var filteredList = files.filter(_.bind(checkFileExtension,this,".js"));
      bundleThis(filteredList);
    }});

});

var checkFileExtension = function(extension, fileName)
{
    if (!fileName || fileName.length < extension.length)
    {
      return false;
    }

    return (fileName.lastIndexOf(extension) == fileName.length - extension.length);
}

var getFileNameFromPath = function(path)
{
  var start = path.lastIndexOf('/') + 1;
  return path.substring(start);
}

gulp.task('publish_min', function() {
  return gulp.src(path.standAloneJs)
    .pipe(uglify())
    .pipe(rename({
      extname: '.min.js'
    }))
    .on('error', gutil.log)
    .pipe(gulp.dest('./build/'));
});

gulp.task('publish_debug', function() {
  return gulp.src(path.standAloneJs)
    .on('error', gutil.log)
    .pipe(gulp.dest('./build/'));
});

// Run tests
gulp.task('test', shell.task(['npm test']));

// Initiate a watch
gulp.task('watch', function() {
  gulp.watch(path.scripts, ['browserify', 'publish_min', 'publish_debug']);
});

// The default task (called when you run `gulp` from cli)
gulp.task('default', ['build']);
