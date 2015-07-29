'use strict';

var gulp = require('gulp');
var autoprefixer = require('gulp-autoprefixer');
var concat = require('gulp-concat');
var exec = require('child_process').exec;
var imagemin = require('gulp-imagemin');
var minifyCss = require('gulp-minify-css');
var minifyHtml = require('gulp-minify-html');
var rename = require('gulp-rename');
var replace = require('gulp-replace');
var runSeq = require('run-sequence');
var sass = require('gulp-sass');
var uglify = require('gulp-uglify');

// One build task to rule them all.
gulp.task('build', function (done) {
  runSeq('clean', 'three', ['buildsass', 'buildimg', 'buildjs', 'copyassets', 'copythreejs'], 'buildhtml', done);
});

// Build SASS for distribution.
gulp.task('buildsass', function () {
  gulp.src(global.paths.sass)
    .pipe(sass().on('error', sass.logError))
    .pipe(concat('app.css'))
    .pipe(autoprefixer())
    .pipe(minifyCss())
    .pipe(rename({
      suffix: '.min'
    }))
    .pipe(gulp.dest(global.paths.dist));
});

// Build JS for distribution.
gulp.task('buildjs', function() {
  exec('npm run buildjs', function(err) {
    if (err) {
      throw err;
    } else {
      console.log('Build complete!');
    }
  });
});

// Build HTML for distribution.
gulp.task('buildhtml', function() {
  gulp.src(global.paths.html)
    .pipe(replace('css/app.css', 'app.min.css'))
    .pipe(replace('lib/system.js', 'app.min.js'))
    .pipe(replace('<script src="config.js"></script>', ''))
    .pipe(replace('<script>System.import(\'./js/app\')</script>', ''))
    .pipe(minifyHtml())
    .pipe(gulp.dest(global.paths.dist));
});

// Build images for distribution.
gulp.task('buildimg', function() {
  gulp.src(global.paths.img)
    .pipe(imagemin())
    .pipe(gulp.dest(global.paths.dist + '/img'));
});

// Copy assets
gulp.task('copyassets', function() {
  gulp.src('./src/assets/**/*', {base: './src/assets'})
    .pipe(gulp.dest(global.paths.dist + '/assets'));
});

// Copy threejs
gulp.task('copythreejs', function() {
  gulp.src('./src/three.custom.min.js')
    .pipe(gulp.dest(global.paths.dist));
});
