var gulp = require("gulp");
var sass = require("gulp-sass");
var jsdoc = require("gulp-jsdoc3");

sass.compiler = require("node-sass");

gulp.task("sass", function() {
   return gulp.src("./src/wwwroot/scss/*.scss")
      .pipe(sass().on("error", sass.logError))
      .pipe(gulp.dest("./src/wwwroot/css"));
});

gulp.task("doc", function(cb) {
   gulp.src(["README.md", "./wwwroot/js/*.js"], {read: false})
       .pipe(jsdoc(cb));
});

gulp.task("sass:watch", function() {
   gulp.watch("./src/wwwroot/scss/*.scss", ["sass"]);
});

gulp.task("default", ["sass, watch"]);
