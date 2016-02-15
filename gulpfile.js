var gulp = require('gulp');
var uglify = require('gulp-uglify');
var stripify = require('stripify');
var htmlreplace = require('gulp-html-replace');
var source = require('vinyl-source-stream');
var less = require('gulp-less');
var watchLess = require('gulp-watch-less2');
var browserify = require('browserify');
var watchify = require('watchify');
var reactify = require('reactify');
var envify = require('envify');
var streamify = require('gulp-streamify');
var nodemon = require('gulp-nodemon');
var pathJoin = require('path');
var gutil = require('gulp-util');

var path = {
    HTML_SRC: 'src/appindex.html',
    CSS_SRC: 'src/css/style.less',
    JS_ENTRY_POINT: 'src/js/app.js',
    CLOUD_SRC: 'src/cloud/**/*',

    OUT: 'bundle.js',
    MINIFIED_OUT: 'bundle.min.js',

    DEST_CSS: 'public/css',
    DEST_HTML: 'public',
    DEST_JS: 'public/js',
    DEST_CLOUD: 'cloud',

    DEST_DEV: 'target',
    DEST_PROD: 'target-prod'
};

gulp.task('copy-html', function () {
    gulp.src(path.HTML_SRC)
        .pipe(gulp.dest(pathJoin.join(path.DEST_DEV, path.DEST_HTML)));
    console.log("html updated");
});

gulp.task('copy-cloud', function () {
    gulp.src(path.CLOUD_SRC)
        .pipe(
            gulp.dest(
                pathJoin.join(process.env.NODE_ENV === 'production' ? path.DEST_PROD : path.DEST_DEV, path.DEST_CLOUD)))
});

gulp.task('watch', function () {
    gulp.watch(path.HTML_SRC, ['copy-html']);

    var watcher = watchify(browserify({
        entries: [path.JS_ENTRY_POINT],
        transform: [reactify],
        debug: true,
        cache: {}, packageCache: {}, fullPaths: true
    }));

    return watcher.on('update', function () {
            watcher.bundle()
                .pipe(source(path.OUT))
                .pipe(gulp.dest(pathJoin.join(path.DEST_DEV, path.DEST_JS)));
            console.log('JS updated');
        })
        .bundle()
        .on('error', gutil.log)
        .pipe(source(path.OUT))
        .pipe(gulp.dest(pathJoin.join(path.DEST_DEV, path.DEST_JS)));
});

gulp.task('watch-css', function () {
    console.log('css updated');
    return gulp.src(path.CSS_SRC)
        .pipe(watchLess(path.CSS_SRC, {verbose: true}))
        .pipe(less())
        .pipe(gulp.dest(pathJoin.join(path.DEST_DEV, path.DEST_CSS)));
});

gulp.task('build', function () {
    browserify({
        entries: [path.JS_ENTRY_POINT],
        transform: [[reactify], ['envify', {'global': true, '_': 'purge', NODE_ENV: 'production'}], [stripify]]
    })
        .bundle()
        .pipe(source(path.MINIFIED_OUT))
        .on('error', gutil.log)
        .pipe(streamify(uglify()))
        .pipe(gulp.dest(pathJoin.join(path.DEST_PROD, path.DEST_JS)));
});

gulp.task('build-less', function () {
    console.log("style updated");
    return gulp.src(path.CSS_SRC)
        .pipe(less())
        .pipe(gulp.dest(pathJoin.join(path.DEST_PROD, path.DEST_CSS)));
});

gulp.task('replaceHTML', function () {
    gulp.src(path.HTML_SRC)
        .pipe(htmlreplace({
            'js': "js/" + path.MINIFIED_OUT
        }))
        .pipe(gulp.dest(pathJoin.join(path.DEST_PROD, path.DEST_HTML)));
});

gulp.task('set-dev-node-env', function () {
    return process.env.NODE_ENV = 'development';
});

gulp.task('set-prod-node-env', function () {
    return process.env.NODE_ENV = 'production';
});

gulp.task('start', function () {
    nodemon({
        script: 'devserver.js'
        , ext: 'js html'
        , env: {'NODE_ENV': 'development'}
    })
        .on('restart', function () {
            console.log('restarted!')
        })
});

gulp.task('production', ['set-prod-node-env', 'replaceHTML', 'copy-cloud', 'build', 'build-less']);
gulp.task('build-dev', ['copy-html', 'copy-cloud', 'watch', 'watch-css']);
gulp.task('default', ['build-dev', 'start']);