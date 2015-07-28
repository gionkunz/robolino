'use strict';

var gulp = require('gulp');
var connect = require('gulp-connect');
var uglify = require('gulp-uglify');
var concat = require('gulp-concat');
var sourcemaps = require('gulp-sourcemaps');

gulp.task('three', function() {
  return gulp.src([
    'src/js/vendor/three/three.js',
    'src/js/vendor/three/controls/*.js',
    'src/js/vendor/three/loaders/*.js',
    'src/js/vendor/three/modifiers/*.js'
  ])
    .pipe(sourcemaps.init())
    .pipe(concat('three.custom.min.js'))
    //.pipe(uglify())
    .pipe(sourcemaps.write())
    .pipe(gulp.dest('src'))
    .pipe(connect.reload());
});
