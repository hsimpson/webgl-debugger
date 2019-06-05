'use strict';

const { src, dest, series, parallel, watch } = require('gulp');

const del = require('del');
const sourcemaps = require('gulp-sourcemaps');
const browserify = require('browserify');
const tsify = require('tsify');
const source = require('vinyl-source-stream');
const buffer = require('vinyl-buffer');
const ts = require('gulp-typescript');
//const terser = require('gulp-terser');
const sass = require('gulp-sass');

sass.compiler = require('node-sass');

const config = require('./gulp/config');

function clean() {
  return del(config.distDirectory);
}

function buildHtml() {
  return src(config.htmlSrc).pipe(dest(config.distDirectory));
}

function buildScss() {
  return src('src/app/scss/app.scss')
    .pipe(sourcemaps.init())
    .pipe(
      sass({
        outputStyle: 'compressed',
        sourceMap: true
      }).on('error', sass.logError)
    )
    .pipe(sourcemaps.write('./'))
    .pipe(dest(`${config.distDirectory}/app/css`));
}

function buildMainProcess() {
  const compilerOptions = require('./tsconfig.json').compilerOptions;
  //compilerOptions.module = 'commonjs';

  return src(config.mainProcessSrc)
    .pipe(
      sourcemaps.init({
        loadMaps: true
      })
    )
    .pipe(ts(compilerOptions))
    .pipe(sourcemaps.write('.', { sourceRoot: '../src/main' }))
    .pipe(dest(config.distDirectory));
}

function buildPreload() {
  return src(config.preloadSrc).pipe(dest(`${config.distDirectory}/app/preload`));
  /*
  const b = browserify({
    debug: true,
    entries: ['src/preload/preload.ts']
  }).plugin(tsify);

  return (
    b
      .bundle()
      .pipe(source('preload.js'))
      .pipe(buffer())
      .pipe(
        sourcemaps.init({
          loadMaps: true
        })
      )
      //.pipe(terser())
      .pipe(sourcemaps.write('./'))
      .pipe(dest(`${config.distDirectory}/app/preload`))
  );
  */
}

function buildAppScripts() {
  const b = browserify({
    debug: true,
    entries: ['src/app/ts/app.ts']
  }).plugin(tsify);

  return (
    b
      .bundle()
      .pipe(source('app.js'))
      .pipe(buffer())
      .pipe(
        sourcemaps.init({
          loadMaps: true
        })
      )
      //.pipe(terser())
      .pipe(sourcemaps.write('./'))
      .pipe(dest(`${config.distDirectory}/app/js`))
  );
}

function watchHtml() {
  return watch(config.htmlSrc, buildHtml);
}

function watchScss() {
  return watch(config.scssSrc, buildScss);
}

function watchAppScripts() {
  return watch([config.appSrc, 'tsconfig.json'], buildAppScripts);
}

function watchPreloadScripts() {
  //return watch([config.preloadSrc, 'tsconfig.json'], buildPreload);
  return watch([config.preloadSrc], buildPreload);
}

const build = parallel(buildMainProcess, buildPreload, buildHtml, buildAppScripts, buildScss);
const defaultTask = series(clean, build);

exports.default = defaultTask;
exports.develop = series(defaultTask, parallel(watchHtml, watchScss, watchAppScripts, watchPreloadScripts));
