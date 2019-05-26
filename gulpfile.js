const gulp    = require("gulp");
const sass    = require("gulp-sass");
const jsdoc   = require("gulp-jsdoc3");
const ts      = require("gulp-typescript");
const terser  = require("gulp-terser");
const webpack = require("webpack-stream");
const prefix  = require("gulp-autoprefixer");

sass.compiler = require("node-sass");

gulp.task("sass", function() {
   return gulp.src("./src/wwwroot/scss/*.scss")
      .pipe(sass({
         outputStyle: 'compressed'
      }).on("error", sass.logError))
      .pipe(prefix({
         browsers: ['last 2 versions'],
         cascade: false
      }))
      .pipe(gulp.dest("./src/wwwroot/css"));
});

gulp.task("ts", function() {
   return gulp.src("./src/wwwroot/ts/**/*.ts")
      .pipe(ts({
         experimentalDecorators: true,
         target: "ES6",
         lib: ["es2017", "dom"],
         module: "commonjs"
      }))
      .pipe(gulp.dest("./src/wwwroot/js"));
});

gulp.task("compress", () => {
   return gulp.src("./src/wwwroot/js/**/*.js")
      .pipe(terser({
         compress: true,
         mangle: true
      }));
});

gulp.task('webpack', function() {
   return gulp.src('src/wwwroot/js/index.js')
      .pipe(webpack(require('./webpack.config.js')))
      .pipe(gulp.dest('src/wwwroot/dist/'));
});

gulp.task("doc", function(cb) {
   return gulp.src(["README.md", "./wwwroot/js/*.js"], {read: false})
      .pipe(jsdoc(cb))
      .pipe(gulp.dest("./docs"));
});

gulp.task("watch", function() {
   gulp.watch("./src/wwwroot/scss/*.scss", gulp.series("sass"));
   gulp.watch("./src/wwwroot/ts/**/*.ts", gulp.series("ts"));
   gulp.watch("./src/wwwroot/js/**/*.js", gulp.series("webpack"));
});

gulp.task("default", gulp.series("sass", "ts", "doc", "webpack", "watch"));
gulp.task("produce", gulp.series("sass", "ts", "compress", "doc", "webpack"));
