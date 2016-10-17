const gulp = require('gulp');
const del = require('del');
const typescript = require('gulp-typescript');
const sourcemaps = require('gulp-sourcemaps');
const merge = require('merge-stream');
const rename = require('gulp-rename');
const nodemon = require('gulp-nodemon');
const webpack = require('webpack-stream');

const webpackConfig = require('./webpack.config.js');
const tscConfig = require('./tsconfig.json');

function addBasePath(basePath, path) {
  path.dirname = basePath + "/" + path.dirname;
  return path;  
}

// clean the contents of the distribution directory
gulp.task('clean', function () {
  return del('dist/**/*');
});

gulp.task('compile:server', ['clean'], function () {

  var compileServerFiles = gulp
    .src(['server/**/*.ts', 'server.ts'], { base:'./' })
    .pipe(sourcemaps.init())          // <--- sourcemaps
    .pipe(typescript(tscConfig.compilerOptions))
    .pipe(sourcemaps.write('.'))      // <--- sourcemaps
    .pipe(gulp.dest('dist'));

  return compileServerFiles;
});

gulp.task('compile:app', ['clean'], function () {

  return gulp
    .src('app/main.ts')
    .pipe(webpack(webpackConfig))
    .pipe(gulp.dest('dist'));
    
});

gulp.task('copy:libs', ['clean'], function() {
  var angularLibs = gulp.src([
    'node_modules/@angular/**/*.js',
    'node_modules/@angular/**/*.js.map'])
    .pipe(rename(function (path) {
      path.dirname = "@angular/" + path.dirname;
      return path;
    }));

  var rxjsLibs = gulp.src([
    'node_modules/rxjs/**/*.js',
    'node_modules/rxjs/**/*.js.map'])
    .pipe(rename(function (path) {
      path.dirname = "rxjs/" + path.dirname;
      return path;
    }));

  var bootstrapLibs = merge(
    gulp
      .src([
        'node_modules/bootstrap/dist/css/*.css',
        'node_modules/bootstrap/dist/css/*.css.map'])
      .pipe(rename((path) => addBasePath("bootstrap/css", path))),
    gulp
      .src(['node_modules/bootstrap/dist/fonts/*.*'])
      .pipe(rename((path) => addBasePath("bootstrap/fonts", path)))
  );
  
  var otherLibs = gulp.src([
      'node_modules/core-js/client/shim.min.js',
      'node_modules/core-js/client/shim.min.js.map',
      'node_modules/moment/moment.js',
      'node_modules/reflect-metadata/Reflect.js',
      'node_modules/reflect-metadata/Reflect.js.map',
      'node_modules/zone.js/dist/zone.js',
      'node_modules/systemjs/dist/system.src.js',
      'node_modules/ng2-bootstrap/bundles/ng2-bootstrap.min.js',
      'node_modules/ng2-bootstrap/bundles/ng2-bootstrap.min.js.map',
      'node_modules/bootstrap/dist/css/bootstrap.css',
      'node_modules/bootstrap/dist/css/bootstrap.css.map'
    ])

  return merge(angularLibs, otherLibs, rxjsLibs, bootstrapLibs)
    .pipe(gulp.dest('dist/lib'));
});

// copy static assets - i.e. non TypeScript compiled source
gulp.task('copy:assets', ['clean'], function() {
  return gulp.src([
    'app/**/*.html',
    'app/**/*.css',
    'systemjs.config.js',
    'index.html',
    'styles.css',
    'favicon.ico',
    'database/**/*.sql'],
    { base : './' })
    .pipe(gulp.dest('dist'))
});

gulp.task('build', ['compile:app', 'compile:server', 'copy:libs', 'copy:assets']);

gulp.task('buildserver', ['compile:server', 'copy:libs']);

gulp.task('runserver', ['buildserver'], function() {
  return nodemon({
    script: './dist/server.js',
    watch: ['server/**/*.ts', 'server.ts'],
    tasks: ['buildserver']
  });
});

gulp.task('run', ['build'], function() {
  return nodemon({
    script: './dist/server.js',
    watch: ['app/**/*.ts', 'server/**/*.ts', 'server.ts'],
    tasks: ['build']
  });
});

gulp.task('default', ['build']);