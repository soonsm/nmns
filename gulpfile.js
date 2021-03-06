var gulp = require('gulp');
var sass = require('gulp-sass');
var cleanCSS = require('gulp-clean-css');
var rename = require("gulp-rename");
var uglify = require('gulp-uglify');
var autoprefixer = require('gulp-autoprefixer');
// var options = {browsers:['last 2 versions'], cascade: false};
// Copy third party libraries from /node_modules into /client/static/lib
gulp.task('lib', async function() {

  // Bootstrap
  // gulp.src(['./node_modules/bootstrap/dist/css/bootstrap.min.css',
  //   './node_modules/bootstrap/dist/css/bootstrap.min.css.map'])
  //   .pipe(gulp.dest('./client/static/lib/bootstrap/css'));
  // gulp.src(['./node_modules/bootstrap/dist/js/bootstrap.bundle.min.js',
  //   './node_modules/bootstrap/dist/js/bootstrap.bundle.min.js.map'])
  //   .pipe(gulp.dest('./client/static/lib/bootstrap/js'));

  // Font Awesome
  // gulp.src(['./node_modules/@fortawesome/fontawesome-free/css/all.css',
  //   './node_modules/@fortawesome/fontawesome-free/css/v4-shims.min.css'])
  //   .pipe(gulp.dest('./client/static/lib/font-awesome/css'));
  // gulp.src(['./node_modules/@fortawesome/fontawesome-free/webfonts/*',
  //   '!./node_modules/@fortawesome/fontawesome-free/webfonts/*brands*'])
  //   .pipe(gulp.dest('./client/static/lib/font-awesome/webfonts'));

  // jQuery
  // gulp.src([
  //     './node_modules/jquery/dist/*',
  //     '!./node_modules/jquery/dist/core.js'
  //   ])
  //   .pipe(gulp.dest('./client/static/lib/jquery'));

  // jQuery Easing
  // gulp.src('./node_modules/jquery.easing/*.js')
  //   .pipe(gulp.dest('./client/static/lib/jquery-easing'));

  // jQuery Validator
  // gulp.src('./node_modules/jquery-validation/dist/jquery.validate.min.js')
  //   .pipe(gulp.dest('./client/static/lib/jquery-validation'));
    
  //socket.io
  // gulp.src("./node_modules/socket.io-client/dist/*slim.js*")
  //   .pipe(gulp.dest("./client/static/lib/socket.io"));
    
  // Toast UI calendar
  // gulp.src('./node_modules/tui-code-snippet/dist/*min*')
  //   .pipe(gulp.dest('./client/static/lib/tui-calendar'));
    
  //moment
  // gulp.src(["./node_modules/moment/min/moment-with-locales.min.js",
  //   "./node_modules/moment/min/locales.min.js"])
  //   .pipe(gulp.dest("./client/static/lib/moment"));
    
  //datetimepicker
  // gulp.src("./node_modules/flatpickr/dist/*min.css")
  //   .pipe(gulp.dest("./client/static/lib/datetimepicker"));
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
    .pipe(autoprefixer())
    .pipe(rename({
      suffix: '.min'
    }))
    .pipe(gulp.dest('./client/'));
});

//CSS
gulp.task('css', gulp.series('css:compile', 'css:minify'));

//Minify JavaScript
gulp.task('js:library', function() {
  return gulp.src([
    './client/static/lib/**/*.js',
    '!./client/static/lib/socket.io/socket.io.slim.js',
    '!./client/static/lib/tui-calendar/tui-calendar.js',
    '!./client/static/lib/**/*.min.js',
    '!./client/static/lib/**/*.touch.js'
  ])
  .pipe(uglify())
  .pipe(rename({
    suffix: '.min'
  }))
  .pipe(gulp.dest('./client/static/lib'));
});

//Minify custom JavaScript
gulp.task('js:custom', function() {
  return gulp.src([
    './client/static/nmns/js/*.js',
    '!./client/static/nmns/js/*.min.js'
  ])
  .pipe(uglify())
  .pipe(rename({
    suffix: '.min'
  }))
  .pipe(gulp.dest('./client/static/nmns/js'));
});
gulp.task("js", gulp.parallel("js:custom", "js:library"));
//Default task
gulp.task('dev', gulp.parallel('css:minify', 'js:custom'));
gulp.task('default', gulp.parallel('js', 'css'));

gulp.task('watch', function() {
  gulp.watch(['./client/static/nmns/css/*.css', '!./client/static/nmns/css/*.min.css'], gulp.parallel('css'));
  gulp.watch(['./client/static/lib/bootstrap/scss/*.scss'], gulp.parallel('css'));
  gulp.watch(['./client/static/nmns/js/*.js', '!./client/static/nmns/js/*.min.js'], gulp.parallel('js:custom'));
});

// Dev task
//gulp.task('dev', gulp.series(gulp.parallel('css', 'js'), gulp.parallel('watch')));