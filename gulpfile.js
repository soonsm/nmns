var gulp = require('gulp');
var sass = require('gulp-sass');
var cleanCSS = require('gulp-clean-css');
var rename = require("gulp-rename");
var uglify = require('gulp-uglify');
var browserSync = require('browser-sync').create();
var through = require('through2');
var merge = require('merge-stream');
var marko = require('gulp-marko-compile');

// Set the banner content
/*var banner = ['/*!\n',
  ' * Start Bootstrap - <%= pkg.title %> v<%= pkg.version %> (<%= pkg.homepage %>)\n',
  ' * Copyright 2013-' + (new Date()).getFullYear(), ' <%= pkg.author %>\n',
  ' * Licensed under <%= pkg.license %> (https://github.com/BlackrockDigital/<%= pkg.name %>/blob/master/LICENSE)\n',
  ' *\n',
  ''
].join('');*/

// Copy third party libraries from /node_modules into /static/lib
gulp.task('lib', async function() {

  // Bootstrap
  // gulp.src([
  //     './node_modules/bootstrap/dist/**/*',
  //     '!./node_modules/bootstrap/dist/css/bootstrap-grid*',
  //     '!./node_modules/bootstrap/dist/css/bootstrap-reboot*'
  //   ])
  //   .pipe(gulp.dest('./client/static/lib/bootstrap'));

  // Font Awesome
  gulp.src([
      './node_modules/font-awesome/**/*',
      '!./node_modules/font-awesome/{less,less/*}',
      '!./node_modules/font-awesome/{scss,scss/*}',
      '!./node_modules/font-awesome/.*',
      '!./node_modules/font-awesome/*.{txt,json,md}'
    ])
    .pipe(gulp.dest('./client/static/lib/font-awesome'));

  // jQuery
  gulp.src([
      './node_modules/jquery/dist/*',
      '!./node_modules/jquery/dist/core.js'
    ])
    .pipe(gulp.dest('./client/static/lib/jquery'));

  // jQuery Easing
  gulp.src('./node_modules/jquery.easing/*.js')
    .pipe(gulp.dest('./client/static/lib/jquery-easing'));

  // jQuery Validator
  gulp.src('./node_modules/jquery-validation/dist/jquery.validate.min.js')
    .pipe(gulp.dest('./client/static/lib/jquery-validation'));
    
  //socket.io
  gulp.src("./node_modules/socket.io-client/dist/*slim.js*")
    .pipe(gulp.dest("./client-static/lib/socket.io"));
    
  // Toast UI calendar
  gulp.src('./node_modules/tui-calendar/dist/*.min.*')
    .pipe(gulp.dest('./client/static/lib/tui-calendar'));
  gulp.src('./node_modules/tui-calendar/dist/*.min.js*')
    .pipe(gulp.dest('./client/static/lib/tui-calendar'));
  gulp.src('./node_modules/tui-code-snippet/dist/*.min.*')
    .pipe(gulp.dest('./client/static/lib/tui-calendar'));
  gulp.src('./node_modules/tui-date-picker/dist/*.min.js')
    .pipe(gulp.dest('./client/static/lib/tui-calendar'));
  gulp.src('./node_modules/tui-date-picker/dist/*.css')
    .pipe(gulp.dest('./client/static/lib/tui-calendar'));
  gulp.src('./node_modules/tui-time-picker/dist/*.min.js')
    .pipe(gulp.dest('./client/static/lib/tui-calendar'));
  gulp.src('./node_modules/tui-time-picker/dist/*.css')
    .pipe(gulp.dest('./client/static/lib/tui-calendar'));
    

});

//Compile SCSS
gulp.task('css:compile', function() {
  return gulp.src('./client/static/lib/bootstrap/scss/*.scss')
    .pipe(sass.sync({
      outputStyle: 'expanded'
    }).on('error', sass.logError))
    .pipe(gulp.dest('./client/static/lib/bootstrap/css'));
});

//Minify CSS
gulp.task('css:minify', function() {
  return gulp.src([
      './client/**/*.css',
      '!./client/**/*.min.css'
    ])
    .pipe(cleanCSS({rebase:false}))
    .pipe(rename({
      suffix: '.min'
    }))
    .pipe(gulp.dest('./client/'));
});

//CSS
gulp.task('css', gulp.series('css:compile', 'css:minify'));

//Minify JavaScript
gulp.task('js:minify', function() {
  return gulp.src([
      './client/**/*.js',
      '!./client/**/*.marko.js',
      '!./client/**/*.min.js'
    ])
    .pipe(uglify())
    .pipe(rename({
      suffix: '.min'
    }))
    .pipe(gulp.dest('./client/'));
});

//Default task
gulp.task('default', gulp.series("lib", gulp.parallel('css', 'js:minify')));
//gulp.task('default', gulp.parallel('css', 'js:minify'));
gulp.task("default", "lib");

//Configure the browserSync task
gulp.task('browserSync', function() {
  browserSync.init({
    server: {
      baseDir: "./client/"
    },
      open:false
  });
});

require('marko/hot-reload').enable();
gulp.task('marko',function(){
    var reload = gulp.src("./template/*.marko")
        .pipe(through.obj(function (file, enc, cb) {
            require('marko/hot-reload').handleFileModified(file.path);
            cb(null, file);
        }));

    var build = gulp.src("./client/template/*.marko")
        .pipe(marko({preserveWhitespace: true}))
        .pipe(gulp.dest("./client/template"));

    return merge(reload,build);
});

gulp.task('watch', function() {
  gulp.watch(['./client/static/nmns/css/*.css', '!./client/static/nmns/css/*.min.css'], gulp.parallel('css'));
  gulp.watch(['./client/static/lib/bootstrap/scss/*.scss'], gulp.parallel('css'));
  gulp.watch(['./client/static/nmns/js/*.js', '!./client/static/nmns/js/*.min.js'], gulp.parallel('js:minify'));
  gulp.watch('./client/template/*.marko', gulp.parallel('marko'));
});

// Dev task
gulp.task('dev', gulp.series(gulp.parallel('css', 'js:minify'), 'watch'));