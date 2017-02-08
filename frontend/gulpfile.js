// Packages
var gulp = require('gulp');//require('gulp-param')(require('gulp'), process.argv); //
var concat = require('gulp-concat');
var inject = require('gulp-inject');
var del = require('del');
var injectStr = require('gulp-inject-string');
var jslint = require('gulp-jslint');
var jshint = require('gulp-jshint');
var connect = require('gulp-connect');
var sass = require('gulp-sass');
var fs = require("fs");

// Config file
var config = require('./gulp-config.json');
var gulpSequence = require('gulp-sequence');


// Paths
var distDir = config.paths.destinationDir;
var distPath = distDir;
var srcDir = config.paths.sourceDir;
var helpDir = config.paths.helpDir;

var appName = config.appName;
var localizationPath = srcDir+"/l10n";

//remove after integration
var tempDataPath = srcDir+"/jsondata";

gulp.task('copyVendorJs', function() {
    return gulp.src(config.paths.vendorJs)
    	.pipe(gulp.dest(distPath+'/vendor/js'));
})


//temp code to simulate tada from server... has to be removed after integration
gulp.task('copyTempData', function(){
    return gulp.src(tempDataPath+"/**/*.*")
        .pipe(gulp.dest(distPath));
})

gulp.task('copyLocalizationJs', function() {
    return gulp.src(localizationPath+"/**/*.json")
    	.pipe(gulp.dest(distPath));
})

gulp.task('copyVendorCSS', function() {
    return gulp.src(config.paths.vendorCss)
        .pipe(gulp.dest(distPath+'/vendor/css'));
})


gulp.task('copyCoreJs', ['hintCore'], function() {
    
   return gulp.src(srcDir+'/core/**/*.js')
        //.pipe(concat('all.js'))
        .pipe(gulp.dest(distPath+'/js'));

})
gulp.task('allCoreJs',['hintCore'], function() {
   return gulp.src(srcDir+'/core/**/*.js')
        .pipe(concat('all.js'))
        .pipe(gulp.dest(distPath+'/js'));
})




gulp.task('mergeCoreScss', function() {
    
   return gulp.src(srcDir+'/core/css/*.scss')
        .pipe(concat('style.scss'))
        .pipe(gulp.dest(srcDir+'/core/css/'));

})

gulp.task('sassCoreScss',['mergeCoreScss'], function() {

   return gulp.src(srcDir+'/core/css/style.scss')
        .pipe(sass().on('error', sass.logError))
        .pipe(gulp.dest(distPath+'/css'));

})

gulp.task('copyCoreCSS', ['sassCoreScss'], function() {
    
   return gulp.src(srcDir+'/core/css/style.css')
        .pipe(gulp.dest(distPath+'/css'));

})


gulp.task('copyLibJs', function() {
   return gulp.src(srcDir+'/lib/*.js')
        .pipe(gulp.dest(distPath+'/lib'));

})


gulp.task('copyExternalLibJs', function() {
   return gulp.src('external_lib/*.js')
        .pipe(gulp.dest(distPath+'/lib'));

})

gulp.task('copyTests', function (){
    return gulp.src(srcDir+'/tests/*.js')
        .pipe(gulp.dest(distPath+'/tests'));
})

gulp.task('copyImages', function (){
    return gulp.src(srcDir+'/core/images/*.*')
        .pipe(gulp.dest(distPath+'/images'));
})


gulp.task('copyVideos', function (){
    return gulp.src(srcDir+'/core/videos/*.*')
        .pipe(gulp.dest(distPath+'/videos'));
})


gulp.task('copyHtml',  function() {
    gulp.src([srcDir+'/index.html'])
        .pipe(gulp.dest(distPath));

    gulp.src([srcDir+'/core/*.html', srcDir+'/core/**/*.html'])
        .pipe(gulp.dest(distPath+'/core'));
})


gulp.task('copyhelpfiles', function() {
    
   return gulp.src(helpDir+'/**/*')
        .pipe(gulp.dest(distPath+'/'+helpDir));

})

gulp.task('hintCore', function() {
    return gulp.src(srcDir+'/**/*.js')
        .pipe(jshint())
        .pipe(jshint.reporter('default'))
        .pipe(jshint.reporter('fail'));
})


gulp.task('copyVendors', ['copyVendorJs', 'copyVendorCSS'], function() {})

gulp.task('copyCoreAllFiles', ['allCoreJs', 'copyLibJs','copyExternalLibJs', 'copyCoreCSS', 'copyHtml', 'copyTests', 'copyImages','copyLocalizationJs','copyTempData','copyVideos'], function() {})
gulp.task('copyCoreFiles', ['copyCoreJs', 'copyLibJs', 'copyExternalLibJs','copyCoreCSS', 'copyHtml', 'copyTests', 'copyImages','copyLocalizationJs','copyTempData','copyVideos'], function() {})

gulp.task('indexUpdate', ['copyVendors', 'copyhelpfiles'], function() {

    return gulp.src(distPath+'/index.html') 

        .pipe(inject(gulp.src([distPath+'/vendor/js/angular.min.js',
            distPath+'/vendor/js/angular-ui-router.min.js', 
            distPath+'/vendor/js/angular-animate.min.js', 
            distPath+'/vendor/js/angular-aria.min.js', 
            distPath+'/vendor/js/angular-messages.min.js', 
            distPath+'/vendor/js/angular-material.min.js', 
            distPath+'/vendor/js/angular-translate.min.js', 
            distPath+'/vendor/js/angular-translate-loader-static-files.min.js', 
            distPath+'/vendor/js/lodash.js',
            distPath+'/vendor/js/restangular.js',
            distPath+'/vendor/js/d3.min.js', 
            distPath+'/vendor/js/index.js', 
            distPath+'/vendor/js/v-accordion.js',
            distPath+'/vendor/js/md-data-table.min.js',
            distPath+'/vendor/js/ngStorage.js',
            distPath+'/vendor/js/detect-element-resize.js',
            distPath+'/vendor/js/dragular.js',
            distPath+'/vendor/js/angular-gridster.min.js',
            distPath+'/vendor/js/angular-gridster.min.js',
            distPath+'/vendor/js/moment.min.js',
            distPath+'/vendor/js/mdPickers.js',
            distPath+'/vendor/js/three.min.js',
            distPath+'/vendor/js/CSS3DRenderer.js',
            distPath+'/vendor/js/TrackballControls.js',
            distPath+'/vendor/js/OrbitControls.js',
            distPath+'/vendor/js/tween.min.js',
            distPath+'/vendor/js/TweenMax.min.js',
            distPath+'/vendor/js/angular-sanitize.min.js',
            distPath+'/vendor/js/ng-csv.min.js',
			distPath+'/vendor/js/ng-webworker.js'
                            ], {read: true}), {
                starttag: '<!-- inject:vendorJs -->',
                endtag: '<!-- endJsinject -->',
                relative:true
            }
        ))

        .pipe(inject(gulp.src([distPath+'/vendor/css/*.css'], {read: false}), {
                starttag: '<!-- inject:vendorCss -->',
                endtag: '<!-- endCssinject -->',
                relative:true
            }
        ))

        .pipe(inject(gulp.src([distPath+'/js/**/*.js'], {read: false}), {
                starttag: '<!-- inject:appJs -->',
                endtag: '<!-- endappJsinject -->',
                relative:true
            }
        ))

        .pipe(inject(gulp.src([distPath+'/lib/*.js'], {read: false}), {
                starttag: '<!-- inject:appLibJs -->',
                endtag: '<!-- appLibJsinject -->',
                relative:true
            }
        ))

        .pipe(inject(gulp.src([distPath+'/css/*.css'], {read: false}), {
                starttag: '<!-- inject:appCss -->',
                endtag: '<!-- endappCssinject -->',
                relative:true
            }
        ))

        .pipe(injectStr.replace('<body>', '<body ng-app="'+appName+'">\n<div ui-view></div>'))

        .pipe(gulp.dest(distPath));
})


gulp.task('cleanBuild', function() {
  	return del([srcDir+'/vendor',distDir,srcDir+'/core/css/style.css',srcDir+'/core/css/style.scss']);
});

gulp.task('devbuild',  function (cb) {
  gulpSequence('cleanBuild', 'copyCoreFiles','indexUpdate')(cb);
});

gulp.task('buildall', function(cb) {
  gulpSequence('cleanBuild', 'copyCoreAllFiles', 'indexUpdate')(cb);

});

gulp.task('build', function(cb) {       
  gulpSequence('buildall')(cb);     
});
gulp.task('build', function(cb) {       
  gulpSequence('buildall')(cb);     
});


gulp.task('default', function(cb) {
  gulpSequence('build')(cb);

});


gulp.task('serveData', function(){
    connect.server({
        port: 9617,
        root: ['out']
    });
});



    
gulp.task('serve',['serveData', 'watch']);
/*gulp.task('dev',['serveDist', 'watch']);*/

gulp.task('watch', function(){
    gulp.watch(
            ["src/**/*.*", 
                '!' + srcDir + '/core/css/style.css',
                '!' + srcDir + '/core/css/style.scss'
            ]
        , ['devbuild']);

});
