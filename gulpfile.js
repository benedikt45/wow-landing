const {
  watch,
  src,
  dest,
  series,
  parallel
} = require('gulp');
const concat = require('gulp-concat');
const autoprefixer = require('gulp-autoprefixer');
const cleanCSS = require('gulp-clean-css');
const uglify = require('gulp-uglify');
const less = require('gulp-less');
const sass = require('gulp-sass');
const del = require('del');
const browserSync = require('browser-sync').create();
const webpack = require('webpack-stream');

const conf = {
  dest: './build',
  src: './src'
};

let isDev = true;
let isProd = !isDev;

let webConfig = {
  output: {
    filename: 'all.js'
  },
  module: {
    rules: [{
      test: /\.js$/,
      loader: 'babel-loader'
      // exclude: '/node_modules/'
    }]
  },
  mode: isDev ? 'development' : 'production',
  devtool: isDev ? 'eval-source-map' : 'none'
};



function lessToCss(cb) {
  return src(conf.src + '/less/**/styleLess.less')
    // .pipe(less({
    //   paths: [
    //     '.',
    //     './node_modules/bootstrap-less'
    //   ]
    // }))
    .pipe(less())
    .pipe(dest(conf.src + '/css'));
}

function scssToCss(cb) {
  return src(conf.src + '/scss/**/styleScss.scss')
    .pipe(sass())
    .pipe(dest(conf.src + '/css'));
}

function css(cb) {
  // return src(conf.src + '/css/**/*.css')
  return src(conf.src + '/css/styleScss.css')//, conf.src + '/css/styleLess.css'])
    .pipe(concat('style.css'))
    .pipe(autoprefixer({
      cascade: false
    }))
    .pipe(cleanCSS({
      level: 2
    }))
    .pipe(dest(conf.dest + '/css'))
    .pipe(browserSync.stream());
}

function js() {
  return src(conf.src + '/js/main.js')
    .pipe(webpack(webConfig))
    .pipe(dest(conf.dest + '/js'))
    .pipe(browserSync.stream());
}

function html() {
  return src(conf.src + '/*.html')
    .pipe(dest(conf.dest))
    .pipe(browserSync.stream());
}

function img() {
  return src(conf.src + '/img/**/*')
    .pipe(dest(conf.dest + '/img'));
}

function font() {
  return src(conf.src + '/font/**/*')
    .pipe(dest(conf.dest + '/font'));
}

function clean() {
  return del([conf.dest + '/*']);
}

module.exports.js = js;

module.exports.watch = function() {
  browserSync.init({
    server: {
      baseDir: conf.dest + '/'
    }
  });
  watch(conf.src + '/scss/**/styleScss.scss', scssToCss);
  watch(conf.src + '/css/**/*.css', css);
  watch(conf.src + '/*.html', browserSync.reload);
  watch(conf.src + '/less/**/styleLess.less', lessToCss);
  watch(conf.src + '/img/**/*.img', img);
  watch(conf.src + '/*.html', html);
  watch(conf.src + '/js/main.js', js);
}

module.exports.build = series(
  clean,
  parallel(
    scssToCss,
    lessToCss
  ),
  parallel(
    css,
    js,
    html,
    img,
    font
  )
);

module.exports.dev = series(module.exports.build, module.exports.watch);
