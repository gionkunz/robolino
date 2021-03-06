'use strict';

var gulp = require('gulp');
var connect = require('gulp-connect');

// Start local dev server.
gulp.task('connect', function() {
  connect.server({
    root: global.paths.src,
    host: '0.0.0.0',
    livereload: true
  });
});
