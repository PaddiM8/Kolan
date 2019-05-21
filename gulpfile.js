const gulp   = require("gulp");
const sass   = require("gulp-sass");
const jsdoc  = require("gulp-jsdoc3");
const terser = require("gulp-terser");

sass.compiler = require("node-sass");

gulp.task("sass", function() {
   return gulp.src("./src/wwwroot/scss/*.scss")
      .pipe(sass({outputStyle: 'compressed'}).on("error", sass.logError))
      .pipe(gulp.dest("./src/wwwroot/css"));
});

gulp.task("js", function() {
   return gulp.src("./src/wwwroot/js/*.js")
      .pipe(terser())
      .pipe(gulp.dest("./src/wwwroot/js"));
});

gulp.task("doc", function(cb) {
   return gulp.src(["README.md", "./wwwroot/js/*.js"], {read: false})
       .pipe(jsdoc(cb))
       .pipe(gulp.dest("./docs"));
});

gulp.task("watch", function() {
   gulp.watch("./src/wwwroot/scss/*.scss", gulp.series("sass"));
   gulp.watch("./src/wwwroot/js/*.js", gulp.series("js"));
});

gulp.task("default", gulp.series("sass", "js", "doc", "watch"));
