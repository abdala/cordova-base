var gulp = require("gulp"),
    package = require("./package.json"),
    bower = require("gulp-bower"),
    uglify = require("gulp-uglify"),
    rename = require("gulp-rename"),
    path = require('path'),
    cordova = require("cordova").raw,
    browserSync = require('browser-sync').create(),
    cordovaDir = path.join(__dirname, package.name);

gulp.task('create-project', function() {
    return cordova.create(package.name)
                  .then(function(){
                      process.chdir(cordovaDir);
                  })
                  .then(function(){
                      return cordova.platform("add", package['cordova-platform']);
                  })
                  .then(function(){
                      return cordova.plugins("add", package['cordova-plugins']);
                  });
});

gulp.task('add-platforms', function() {
    process.chdir(cordovaDir);
    return cordova.platform("add", package['cordova-platform']);
});

gulp.task('install-plugins', ['add-platforms'], function() {
    process.chdir(cordovaDir);
    return cordova.plugins("add", package['cordova-plugins']);
});

gulp.task('bower', function() {
    bower()
    
    gulp.src([
        './bower_components/**/*.js', 
        '!./bower_components/**/*.min.js', 
        '!./bower_components/**/__tests__/*',
        '!./bower_components/**/src{,/**}'
    ])
    .pipe(uglify())
    .pipe(rename({suffix: '.min'}))
    .pipe(gulp.dest(package.name + '/www/js/vendor'));
        
    gulp.src('./bower_components/**/*.min.js')
        .pipe(gulp.dest(package.name + '/www/js/vendor'));
});

gulp.task('browser-sync', function () {
   var files = [
      package.name + '/platforms/browser/www/**/*.html',
      package.name + '/platforms/browser/www/img/**/*.png',
      package.name + '/platforms/browser/www/js/**/*.js'
   ];

   browserSync.init(files, {
      server: {
         baseDir: package.name + '/platforms/browser/www'
      }
   });
});

gulp.task('copy', function() {
    gulp.src(package.name + '/www/**/*')
        .pipe(gulp.dest(package.name + '/platforms/browser/www/'));
});

gulp.task('copy-css', function() {
    gulp.src(package.name + '/www/**/*.css')
        .pipe(gulp.dest(package.name + '/platforms/browser/www/'))
        .pipe(browserSync.stream());
});

gulp.task('watch', function() {
    gulp.watch([
        package.name + '/www/**/*.html',
        package.name + '/www/js/**/*.js',
        package.name + '/www/img/*.png'
    ], ['copy']);
    
    gulp.watch(package.name + '/www/css/**/*.css', ['copy-css']);
});

gulp.task('install', ['create-project', 'bower']);

gulp.task('serve', ['watch', 'browser-sync']);