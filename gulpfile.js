var gulp = require('gulp');
var uglify = require('gulp-uglify');
var stripify = require('stripify');
var htmlreplace = require('gulp-html-replace');
var source = require('vinyl-source-stream');
var less = require('gulp-less');
var watchLess = require('gulp-watch-less2');
var plumber = require('gulp-plumber');
var browserify = require('browserify');
var watchify = require('watchify');
var reactify = require('reactify');
var envify = require('envify');
var streamify = require('gulp-streamify');
var nodemon = require('gulp-nodemon');
var pathJoin = require('path');
var gutil = require('gulp-util');
var _ = require('underscore');
var nodeResolve = require('resolve');

var path = {
    HTML_SRC: 'src/appindex.html',
    CSS_SRC: 'src/css/style.less',
    WEBCAM_RESOURCES: 'src/js/libs/jpeg_camera/resources/**/*',
    FAVICON_SRC: 'src/favicon.ico',
    DEFAULT_EMOTIONS_SRC: 'src/resources/default_emotions/**/*',
    EMOTICONS_SRC: 'src/resources/emoticons/**/*',
    JS_ENTRY_POINT: 'src/js/app.js',
    CLOUD_SRC: 'src/cloud/**/*',
    CLOUD_PROD_RES_SRC: 'src/cloud/resources/prod/**/*',
    CLOUD_DEV_RES_SRC: 'src/cloud/resources/dev/**/*',

    OUT: 'bundle.js',
    MINIFIED_OUT: 'bundle.min.js',

    DEST_CSS: 'public/css',
    DEST_HTML: 'public',
    DEST_JS: 'public/js',
    DEST_RESOURCES: 'public/resources',
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
                pathJoin.join('production' === process.env.NODE_ENV ? path.DEST_PROD : path.DEST_DEV, path.DEST_CLOUD)));

    if ('production' === process.env.NODE_ENV) {
        console.log("Copying production resources cloud code");
        gulp.src(path.CLOUD_PROD_RES_SRC)
            .pipe(
                gulp.dest(
                    pathJoin.join(path.DEST_PROD, (path.DEST_CLOUD + "/resources"))));
    } else {
        console.log("Copying development resources cloud code");
        gulp.src(path.CLOUD_DEV_RES_SRC)
            .pipe(
                gulp.dest(
                    pathJoin.join(path.DEST_DEV, (path.DEST_CLOUD + "/resources"))));
    }
});

gulp.task('copy-webcamswf', function () {
    gulp.src(path.WEBCAM_RESOURCES)
        .pipe(
            gulp.dest(
                pathJoin.join('production' === process.env.NODE_ENV ? path.DEST_PROD : path.DEST_DEV, path.DEST_RESOURCES)))
});

gulp.task('copy-otherfiles', function () {
    //favicon
    console.log("copying favicon");
    gulp.src(path.FAVICON_SRC)
        .pipe(
            gulp.dest(
                pathJoin.join('production' === process.env.NODE_ENV ? path.DEST_PROD : path.DEST_DEV, path.DEST_HTML)));

    //default images
    console.log("copying default question images");
    gulp.src(path.DEFAULT_EMOTIONS_SRC)
        .pipe(
            gulp.dest(
                pathJoin.join('production' === process.env.NODE_ENV ? path.DEST_PROD : path.DEST_DEV, path.DEST_RESOURCES)));

    //emoticons
    console.log("copying emoticons images");
    gulp.src(path.EMOTICONS_SRC)
        .pipe(
            gulp.dest(
                pathJoin.join('production' === process.env.NODE_ENV ? path.DEST_PROD : path.DEST_DEV, path.DEST_RESOURCES)));
});

gulp.task('watch', function () {
    gulp.watch(path.HTML_SRC, ['copy-html']);

    var b = browserify({
        entries: [path.JS_ENTRY_POINT],
        transform: [[reactify], ['envify', {
            'global': true,
            '_': 'purge',
            APP_VERSION: getNPMAppVersion() + new Date().toJSON()
        }]],
        debug: true,
        cache: {}, packageCache: {}, fullPaths: true
    });

    getNPMPackageIds().forEach(function (id) {
        b.external(id);
    });

    var watcher = watchify(b);
    return watcher.on('update', function () {
        watcher.bundle()
            .on('error', gutil.log)
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
        .pipe(plumber())
        .pipe(watchLess(path.CSS_SRC, {verbose: true}))
        .pipe(less())
        .on('error', gutil.log)
        .pipe(gulp.dest(pathJoin.join(path.DEST_DEV, path.DEST_CSS)));
});

gulp.task('build', function () {
    var b = browserify({
        entries: [path.JS_ENTRY_POINT],
        transform: [[reactify], ['envify', {
            'global': true,
            '_': 'purge',
            NODE_ENV: 'production',
            APP_VERSION: getNPMAppVersion()
        }], [stripify]]
    });

    b.bundle()
        .pipe(source(path.MINIFIED_OUT))
        .on('error', gutil.log)
        .pipe(streamify(uglify()))
        .pipe(gulp.dest(pathJoin.join(path.DEST_PROD, path.DEST_JS)));
});

gulp.task('build-vendor', function () {
    console.log("Building vendor");
    var production = ('production' === process.env.NODE_ENV);

    var b = browserify({
        // generate source maps in non-production environment
        debug: !production,
        cache: {}, packageCache: {}, fullPaths: true
    });

    getNPMPackageIds().forEach(function (id) {
        b.require(nodeResolve.sync(id), {expose: id});
    });

    var stream = b.bundle()
        .on('error', gutil.log)
        .pipe(source('vendor.js'));

    if (production) {
        stream = stream.pipe(streamify(uglify()));
    } else {
        //stream = stream.pipe(streamify(uglify({mangle: false, compress: false})));
    }

    stream.pipe(gulp.dest(
        pathJoin.join(production ? path.DEST_PROD : path.DEST_DEV, path.DEST_JS)));
});

gulp.task('build-less', function () {
    console.log("style updated");
    return gulp.src(path.CSS_SRC)
        .pipe(less())
        .on('error', gutil.log)
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
        script: 'devserver.js',
        ext: 'js html',
        env: {'NODE_ENV': 'development'}
    })
        .on('restart', function () {
            console.log('restarted!')
        })
});

var getNPMPackageIds = function () {
    var packageManifest = {};
    try {
        packageManifest = require('./package.json');
    } catch (e) {
        console.error("No package.json!");
    }
    return _.keys(packageManifest.dependencies) || [];

};

var getNPMAppVersion = function () {
    var packageManifest = {};
    try {
        packageManifest = require('./package.json');
    } catch (e) {
        console.error("No package.json!");
    }
    var ver = packageManifest.version || "";

    return 0 < ver.length ? ver + "_" : null;
};

gulp.task('production', ['set-prod-node-env', 'replaceHTML', 'copy-otherfiles', 'copy-webcamswf', 'copy-cloud', 'build', 'build-less']);
gulp.task('build-dev', ['copy-html', 'copy-otherfiles', 'copy-webcamswf', 'copy-cloud', 'build-vendor', 'watch', 'watch-css']);
gulp.task('default', ['build-dev', 'start']);