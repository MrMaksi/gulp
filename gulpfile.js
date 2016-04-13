 var gulp = require('gulp'),
   sass = require('gulp-sass'),
   concat = require('gulp-concat'),
   uglify = require('gulp-uglifyjs'),
   browserSync = require('browser-sync'),
   cssnano = require('gulp-cssnano'),
   rename = require('gulp-rename'),
   del = require('del'),
   imagemin = require('gulp-imagemin'),
   pngquant = require('imagemin-pngquant'),
   cache = require('gulp-cache'),
   autoprefixer = require('gulp-autoprefixer'),
   uncss = require('gulp-uncss'),
   htmlhint = require("gulp-htmlhint"),
   plumber = require('gulp-plumber');


//Компилирование sass файлов
gulp.task('sass', function() {
   gulp.src('src/sass/**/*.sass')
      .pipe(plumber()) //отлавливание ошибок
      .pipe(sass().on('error', sass.logError))
      .pipe(autoprefixer(['last 15 versions', '>1%', ], { cascade: true }))
      .pipe(gulp.dest('src/css'))
      .pipe(uncss({
         html: ['src/*.html']
      }))
      .pipe(browserSync.reload({ stream: true }));
});

/*
//Объеденение и сжатие js
gulp.task('scripts', function() {
   return gulp.src([
         'src/js/main.js',
         // 'libs/...',
      ])
      .pipe(concat('main.min.js'))
      .pipe(uglify())
      .pipe(gulp.dest('src/js'));
});
*/

// Проверка html на ошибки
gulp.task('htmlhint', function() {
   gulp.src("./src/*.html")
      .pipe(htmlhint({
         "tag-pair": true,
         "style-disabled": true,
         "img-alt-require": true,
         "tagname-lowercase": true,
         "src-not-empty": true,
         "id-unique": true,
         "spec-char-escape": true
      }))
      .pipe(htmlhint.reporter())
});

//Cжатие css
gulp.task('css-libs', ['sass'], function() {
   return gulp.src([
         'src/css/**/*.css',
      ])
      .pipe(cssnano(''))
      // .pipe(rename({ suffix: '.min' }))
      .pipe(gulp.dest('src/css'));
});


//Синхронизация обновления в браузере
gulp.task('browser-sync', function() {
   browserSync({
      server: {
         baseDir: 'src'
      },
      notify: false
   });
})

//сжатие картинок
gulp.task('img', function() {
    return gulp.src('src/img/**/*')
        .pipe(cache(imagemin({
            interlaced: true,
            progresive: true,
            svgoPlugins: [{ removeViewBox: false }],
            use: [pngquant()]
        })))
        .pipe(gulp.dest('dist/img'));
});

//Чистка папки dist
gulp.task('clean', function() {
   return del.sync('dist');
});

//Чистка кэша
gulp.task('clear', function() {
   return cache.clearAll('');
});

//Запуск сервера
// gulp.task('watch', ['browser-sync', 'css-libs', 'scripts', ], function() {
gulp.task('watch', ['browser-sync', 'css-libs', 'htmlhint', 'img',], function() {

   gulp.watch('src/sass/**/*.sass', ['sass'], browserSync.reload);
   gulp.watch('src/*.html', browserSync.reload);
   gulp.watch('src/js/**/*.js', browserSync.reload);
});

//билд всего в папку dist
// gulp.task('build', ['clean', 'img', 'sass', 'scripts'], function() {
gulp.task('build', ['clean', 'clear', 'img', 'sass', 'css-libs',], function() {

   var buildCss = gulp.src(['src/css/**/*.css',])
      .pipe(gulp.dest('dist/css'));

   var buildFonts = gulp.src(['src/fonts/**/*', ])
      .pipe(gulp.dest('dist/fonts'));

   var buildJs = gulp.src(['src/js/**/*', ])
      .pipe(gulp.dest('dist/js'));

   var buildHtml = gulp.src(['src/*.html', ])
      .pipe(gulp.dest('dist/'));

   var buildImg = gulp.src(['src/images/**/*', ])
      .pipe(gulp.dest('dist/images'));
});
