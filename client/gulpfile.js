"use strict";
const prod = false;

var gulp = require("gulp");
var gulpif = require("gulp-if");
var uglify = require("gulp-uglify-es").default;
var sourcemaps = require("gulp-sourcemaps");
var rename = require("gulp-rename");
var rollup = require("gulp-better-rollup");
var babel = require("rollup-plugin-babel");
var resolve = require("rollup-plugin-node-resolve");
var commonjs = require("rollup-plugin-commonjs");
var rollupJson = require("@rollup/plugin-json");
const source = require("vinyl-source-stream");
const buffer = require("vinyl-buffer");
const path = require("path");

gulp.task("build", done => {
  let tasks = ["build-js", "watch"];
  return gulp.series(tasks, seriesDone => {
    seriesDone();
    done();
    console.log("build completed!");
  })();
});

const buildjs = async config => {
  gulp
    .src(config.src)
    .pipe(sourcemaps.init())
    .pipe(
      rollup(
        {
          plugins: [
            resolve({
              browser: true
            }),
            commonjs(),
            babel(),
            rollupJson()
          ]
        },
        {
          format: "cjs"
        }
      )
    )
    .pipe(gulpif(config.prod, buffer())) // <----- convert from streaming to buffered vinyl file object
    .pipe(
      gulpif(
        config.prod,
        uglify({
          mangle: true,
          output: {
            beautify: false,
            comments: false
          }
        })
      )
    )
    .pipe(
      gulpif(
        !config.prod,
        sourcemaps.write(".", {
          mapFile: function(mapFilePath) {
            return mapFilePath;
          }
        })
      )
    )
    .pipe(gulpif(config.name != undefined, rename(config.name)))
    .pipe(gulp.dest("./assets/js/app"));
};

gulp.task("build-inspinia", async () => {
  buildjs({ src: "./src/js/inspinia/index.js", name: "inspinia.js", prod: true });
});

gulp.task("build-js", async () => {
  buildjs({ src: "./src/js/index.js", prod });
  buildjs({ src: "./src/js/user/index.js", name: "user.js", prod });
  buildjs({ src: "./src/js/user/details.js", name: "user.details.js", prod });
  buildjs({ src: "./src/js/request/index.js", name: "request.js", prod });
  buildjs({ src: "./src/js/request/edit.js", name: "request.edit.js", prod });
  buildjs({ src: "./src/js/donor/index.js", name: "donor.js", prod });
});

gulp.task("watch", done => {
  gulp.watch("src/js/**/*.js", gulp.series("build-js")).on("change", function(event) {
    var file = path.parse(event);
    console.log("==================> File changed: " + file.name + " (" + file.ext + ")...");
  });

  done();
});
