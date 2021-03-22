const { src, dest, watch, task, parallel } = require('gulp');
const sass = require('gulp-sass');
const del = require('del');
const uglify = require('gulp-uglify');
const rename = require('gulp-rename');
const cleanCSS = require('gulp-clean-css');
const browserSync = require('browser-sync').create();

const CONFIG = {
  PORT: 4000,
  INPUT: {
    ASSETS: './src/assets/**/*',
    VIEWS: './src/views/**/*.html',
    SCRIPTS: './src/scripts/**/*.js',
    STYLES: './src/styles/**/*.scss',
  },
  OUTPUT: {
    ASSETS: './dist/assets',
    DIST: './dist',
    VIEWS: './dist/views',
    SCRIPTS: './dist/scripts',
    STYLES: './dist/styles',
  },
};

function generateCSS(cb) {
  src(CONFIG.INPUT.STYLES)
    .pipe(sass().on('error', sass.logError))
    .pipe(dest(CONFIG.OUTPUT.STYLES));
  cb();
}

function generateJS(cb) {
  src(CONFIG.INPUT.SCRIPTS).pipe(dest(CONFIG.OUTPUT.SCRIPTS));
  cb();
}

function generateHTML(cb) {
  src(CONFIG.INPUT.VIEWS).pipe(dest(CONFIG.OUTPUT.VIEWS));
  cb();
}

function clean(cb) {
  del.sync(CONFIG.OUTPUT.DIST);
  cb();
}

function copyAssets(cb) {
  src(CONFIG.INPUT.ASSETS).pipe(dest(CONFIG.OUTPUT.ASSETS));
  cb();
}

function watchFiles(cb) {
  browserSync.init({
    watch: true,
    port: CONFIG.PORT,
    server: {
      baseDir: './dist',
      index: './views/index.html',
    },
    // proxy: 'yourlocal.dev',
  });

  watch(CONFIG.INPUT.ASSETS, copyAssets);
  watch(CONFIG.INPUT.STYLES, generateCSS);
  watch(CONFIG.INPUT.VIEWS, generateHTML);
  watch([CONFIG.INPUT.SCRIPTS, '!node_modules/**'], generateJS);

  cb();
}

function minifyJS(cb) {
  src(CONFIG.INPUT.SCRIPTS)
    // The gulp-uglify plugin won't update the filename
    .pipe(uglify())
    // So use gulp-rename to change the extension
    .pipe(rename({ extname: '.min.js' }))
    .pipe(dest(CONFIG.OUTPUT.SCRIPTS));
  cb();
}

function minifyCSS(cb) {
  src(CONFIG.OUTPUT.STYLES + '**/*')
    .pipe(cleanCSS({ compatibility: 'ie8' }))
    .pipe(rename({ extname: '.min.css' }))
    .pipe(dest(CONFIG.OUTPUT.DIST));
  cb();
}

// cmd: gulp watch
exports.watch = parallel(
  clean,
  copyAssets,
  generateCSS,
  generateHTML,
  generateJS,
  watchFiles,
);

// cmd: gulp build
exports.build = parallel(minifyJS, minifyCSS);
