 var gulp = require('gulp'),
     sass = require('gulp-sass'),
     concat = require('gulp-concat'),
     browserSync = require('browser-sync'),
     cssnano = require('gulp-cssnano'),
     del = require('del'),
     imagemin = require('gulp-imagemin'),
     pngquant = require('imagemin-pngquant'),
     cache = require('gulp-cache'),
     autoprefixer = require('gulp-autoprefixer'),
     uncss = require('gulp-uncss'),
     htmlhint = require("gulp-htmlhint"),
     plumber = require('gulp-plumber');


 //Синхронизация обновления в браузере
 gulp.task('browser-sync', function() {
     browserSync({
         server: {
             baseDir: 'src'
         },
         notify: false
     });
 })

 //Компилирование sass файлов
 gulp.task('sass', function() {
     gulp.src('src/sass/**/*.sass')
         .pipe(plumber()) //отлавливание ошибок
         .pipe(sass().on('error', sass.logError))
         .pipe(autoprefixer(['last 15 versions', '>1%', ], { cascade: true }))
         .pipe(gulp.dest('src/css'))
         .pipe(browserSync.reload({ stream: true }));
 });

 // Проверка html на ошибки
 gulp.task('htmlhint', function() {
     gulp.src("./src/*.html")
         .pipe(htmlhint({
             "attr-lowercase": true,
             "tagname-lowercase": true,
             "attr-value-double-quotes": true,
             "attr-value-not-empty": true,
             "attr-no-duplication": true,
             "doctype-first": true,
             "tag-pair": true,
             "spec-char-escape": true,
             "id-unique": true,
             "src-not-empty": true,
             "title-require": true,
             "head-script-disabled": true,
             "alt-require": true,
             "doctype-html5": true,
             "inline-style-disabled": true,
             "inline-script-disabled": true,
             "space-tab-mixed-disabled": true,
             "id-class-ad-disabled": true,
             "href-abs-or-rel": true,
             "style-disabled": true,
             "img-alt-require": true,
             "spec-char-escape": true
         }))
         .pipe(htmlhint.reporter())
 });

 //Запуск сервера
 gulp.task('watch', ['browser-sync', 'htmlhint', 'img',  ], function() {

     gulp.watch('src/sass/**/*.sass', ['sass'], browserSync.reload);
     gulp.watch('src/*.html', browserSync.reload);
     gulp.watch('src/js/**/*.js', browserSync.reload);
 });

 //сжатие картинок
 gulp.task('img', function() {
     return gulp.src('src/images/**/*')
         .pipe(cache(imagemin({
             interlaced: true,
             progresive: true,
             svgoPlugins: [{ removeViewBox: false }],
             use: [pngquant({quality: '65-80'})]

         })))
         .pipe(gulp.dest('dist/images'));
 });

 //Cжатие css
 gulp.task('css-libs', ['sass'], function() {
     return gulp.src([
             'src/css/**/*.css',
         ])
         .pipe(uncss({ // Удаление неиспользуемого CSS
             html: ['src/*.html']
         }))
         .pipe(cssnano(''))
         .pipe(gulp.dest('src/css'));
 });

 //Чистка папки dist
 gulp.task('clean', function() {
     return del.sync('dist');
 });

 //Чистка кэша
 gulp.task('clear', function() {
     return cache.clearAll('');
 });

 //билд всего в папку dist
 gulp.task('build', ['clean', 'clear', 'img', 'sass', 'css-libs', ], function() {

     var buildFonts = gulp.src(['src/fonts/**/*', ])
         .pipe(gulp.dest('dist/fonts'));

     var buildJs = gulp.src(['src/js/**/*', ])
         .pipe(gulp.dest('dist/js'));

     var buildHtml = gulp.src(['src/*.html', ])
         .pipe(gulp.dest('dist/'));

     var buildImg = gulp.src(['src/images/**/*', ])
         .pipe(gulp.dest('dist/images'));

     var buildCss = gulp.src(['src/css/**/*.css', ])
         .pipe(gulp.dest('dist/css'));
 });
