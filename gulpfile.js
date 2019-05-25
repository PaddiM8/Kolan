const gulp   = require("gulp");
const sass   = require("gulp-sass");
const jsdoc  = require("gulp-jsdoc3");
const ts     = require("gulp-typescript");
const terser = require('gulp-terser');

sass.compiler = require("node-sass");

gulp.task("sass", function() {
   return gulp.src("./src/wwwroot/scss/*.scss")
      .pipe(sass({outputStyle: 'compressed'}).on("error", sass.logError))
      .pipe(gulp.dest("./src/wwwroot/css"));
});

gulp.task("ts", function() {
   return gulp.src("./src/wwwroot/ts/**/*.ts")
      .pipe(ts({
         experimentalDecorators: true,
         target: "ES5",
         lib: ["es2015", "dom"]
      }))
      .pipe(terser({
         compress: true,
         mangle: true
      }))
      .pipe(gulp.dest("./src/wwwroot/js"));
});

gulp.task("doc", function(cb) {
   return gulp.src(["README.md", "./wwwroot/js/*.js"], {read: false})
      .pipe(jsdoc(cb))
      .pipe(gulp.dest("./docs"));
});

gulp.task("watch", function() {
   gulp.watch("./src/wwwroot/scss/*.scss", gulp.series("sass"));
   gulp.watch("./src/wwwroot/ts/*.ts", gulp.series("ts"));
   gulp.watch("./src/wwwroot/ts/components/*.ts", gulp.series("ts"));
});

gulp.task("default", gulp.series("sass", "ts", "doc", "watch"));
