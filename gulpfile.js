var gulp = require('gulp'),
    browserSync = require('browser-sync').create(),
    concat = require('gulp-concat'),
    sass = require('gulp-sass')(require('sass')),
    autoprefixer = require('gulp-autoprefixer'),
    fileInclude = require('gulp-file-include'),
    beautifyCode = require('gulp-beautify-code'),
    cssnano = require('gulp-cssnano'),
    
	extReplace = require('gulp-ext-replace'),
    imagemin = require('gulp-imagemin'),
	webp = require('imagemin-webp'),

    // Source Folder Locations
    src = {
        'root': './src/',
        'html': './src/html/*.html',
        'partials': './src/partials/',
        'css': './src/assets/css/**/*',
        'fonts': './src/assets/fonts/**/*',
        'php': './src/assets/php/**/*',
        'scss': './src/assets/scss/**/*',
        'js': './src/assets/js/**/*',
        'images': './src/assets/images/**/*'
    },

    // Destination Folder Locations
    dest = {
        'root': './dest/',
        'css': './dest/assets/css',
        'cssPages': './dest/assets/css/pages',
        'fonts': './dest/assets/fonts/',
        'images': './dest/assets/images/',
        'js': './dest/assets/js',
        'php': './dest/assets/php/',
        'scss': './dest/assets/scss/'
    };



/*-- Live Synchronise & Reload --*/
function liveBrowserSync(done) {browserSync.init({ server: { baseDir: dest.root } }); done();}
function reload(done) {browserSync.reload(); done();}

/*-- HTMl Task (Compile With Partial) --*/
gulp.task('html', function(done) {
    gulp.src(src.html)
        .pipe(fileInclude({ basepath: src.partials }))
        .pipe(beautifyCode())
        .pipe(gulp.dest(dest.root));
    done();
})

/*-- Assets Copy Task --*/
function copy(folder, done) {
	gulp.src(`./src/assets/${folder}/**/*`).pipe(gulp.dest(`./dest/assets/${folder}`))
	done()
}
gulp.task('css', function (done) {copy('css', done)})
gulp.task('fonts', function (done) {copy('fonts', done)})
gulp.task('js', function (done) {copy('js', done)})
gulp.task('php', function (done) {copy('php', done)})
gulp.task('scss', function (done) {copy('scss', done)})

/*-- SCSS Task --*/
gulp.task('bootstrap', function (done) {
	gulp.src('./src/assets/scss/bootstrap.scss')
		.pipe(sass().on('error', sass.logError))
		.pipe(concat('bootstrap.min.css'))
		.pipe(autoprefixer()).pipe(cssnano())
		.pipe(gulp.dest('./dest/assets/css/vendor/'))
		.pipe(browserSync.stream()) 
	done()
})
gulp.task('style', function (done) {
	gulp.src('./src/assets/scss/style.scss')
		.pipe(sass().on('error', sass.logError))
		.pipe(concat('style.css'))
		.pipe(autoprefixer())
		.pipe(gulp.dest(dest.css))
		.pipe(concat('style.min.css'))
		.pipe(autoprefixer()).pipe(cssnano())
		.pipe(gulp.dest(dest.css))
		.pipe(browserSync.stream()) 
	done()
})
gulp.task('stylePages', function (done) {
	gulp.src('./src/assets/scss/05-pages/*.scss')
		.pipe(sass().on('error', sass.logError))
		.pipe(autoprefixer())
		.pipe(gulp.dest(dest.cssPages))
		.pipe(extReplace('.min.css'))
		.pipe(autoprefixer()).pipe(cssnano())
		.pipe(gulp.dest(dest.cssPages))
		.pipe(browserSync.stream()) 
	done()
})

/*-- Image Optimization, SVG & GIF Image Copy --*/
gulp.task('images', function (done) {
	const imageSrc = ['./src/assets/images/**/*.png', './src/assets/images/**/*.jpg', './src/assets/images/**/*.jpeg', './src/assets/images/**/*.webp']
	gulp.src(imageSrc)
		.pipe(imagemin([webp({ quality: 85 })]))
		.pipe(extReplace('.webp'))
		.pipe(gulp.dest(dest.images))
	done()
})
gulp.task('svgGif', function (done) {
	gulp.src(['./src/assets/images/**/*.svg', './src/assets/images/**/*.gif'])
		.pipe(gulp.dest(dest.images))
	done()
})

/*-- Watch --*/
function watchFiles() {
    gulp.watch([src.html, src.partials], gulp.series(['html'], reload));
    gulp.watch(src.css, gulp.series(['css', 'html'], reload));
    gulp.watch(src.fonts, gulp.series(['fonts', 'html'], reload));
    gulp.watch(src.js, gulp.series(['js', 'html'], reload));
    gulp.watch(src.php, gulp.series(['php', 'html'], reload));
    gulp.watch(src.images, gulp.series(['images', 'svgGif', 'html'], reload));
    gulp.watch(src.scss, gulp.series(['bootstrap', 'style', 'stylePages']));
}

/*-- All Default Task --*/
gulp.task('defaultTask', gulp.series('html', 'css', 'fonts', 'js', 'php', 'scss', 'bootstrap', 'style', 'stylePages', 'images', 'svgGif'));

/*-- Default --*/
gulp.task('default', gulp.series('defaultTask', gulp.parallel(liveBrowserSync, watchFiles)));