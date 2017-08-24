/**
 * Created by Administrator on 2017/8/24.
 */
const gulp=require('gulp')
const path=require('path')
const devDir=path.resolve(__dirname,'src')
const buildDir=path.resolve(__dirname,'dist')

const htmlMin=require('gulp-htmlmin')
const cached=require('gulp-cached')
const replaceName=require('gulp-replace')
const del=require('del')
const cleanCss=require('gulp-clean-css')
const rev=require('gulp-rev')
const imageMin=require('gulp-imagemin')
const uglify=require('gulp-uglify')
const server=require('browser-sync')
const less=require('gulp-less')

gulp.task('handle-less',function () {
    gulp.src(devDir+'/less/**/*.less')
    .pipe(less())
    .pipe(gulp.dest(devDir+'/css'))
})

gulp.task('copy-html',function () {
    gulp.src(devDir+'/**/*.html')
    .pipe(cached('copyHtml'))
    .pipe(htmlMin({
        collapseWhitespace: true,
        removeComments: true
    }))
    .pipe(gulp.dest(buildDir))
})

gulp.task('copy-css',function () {
    del([buildDir+'/css/**/*.css'],{force: true});   //由于每次更改css文件，进行hash的话旧的文件就会残留，因此每次写入前需要进行清空。
    gulp.src(devDir+'/css/**/*.css')
    .pipe(cleanCss({conpatibility: 'ie8'}))     //进行压缩
    .pipe(rev())        //进行hash
    .pipe(gulp.dest(buildDir+'/css'))
    .pipe(rev.manifest())       //产生hash对应的json文件
    .pipe(gulp.dest(buildDir+'/Rev/css'));
})

gulp.task('copy-img',function () {
    gulp.src(devDir+'/img/**/*.{jpg,png,gif}')
    .pipe(cached('copyImg'))
    .pipe(imageMin())   //对图片进行压缩
    .pipe(rev())
    .pipe(gulp.dest(buildDir+'/img'))
    .pipe(rev.manifest())
    .pipe(gulp.dest(buildDir+'/Rev/img'));
})

gulp.task('copy-js', function(){
    del([buildDir+'/js/**/*.js'],{force: true});    //与css同理删除
    gulp.src(devDir+'/js/**/*.js')
    .pipe(cached('copyJs'))
    //.pipe(concat('main.js'))    //对js文件进行合并和重命名
    .pipe(uglify())        //对合并后的文件进行压缩
    .pipe(rev())
    .pipe(gulp.dest(buildDir+'/js'))
    .pipe(rev.manifest())
    .pipe(gulp.dest(buildDir+'/Rev/js'));
})

gulp.task('copy-lib',function () {
    gulp.src(devDir+'/lib/**/*').pipe(gulp.dest(buildDir+'/lib'))
})
// gulp.task('watch',function(){
//     gulp.watch(devDir+'/html/*.html', ['copy-html']);     //监视html文件，如果发生变化就进行复制
//     gulp.watch(devDir+'/css/**/*.css', ['copy-css']);       //监视css文件，如果发生变化就进行复制
//     gulp.watch(devDir+'/img/**/*.{jpg,png,gif}',['copy-img']);      //监视图片，如果发生变化就进行复制
//     gulp.watch(devDir+'/js/**/*.js', ['copy-js']);      //监视js文件，如果发生变化就进行复制
// })

gulp.task('default',['copy-html','copy-css','copy-img','copy-js','copy-lib'])

// 监视文件改动并重新载入
gulp.task('server', function() {
    server({
        server: {
            baseDir: devDir
        }
    });
    gulp.watch(devDir+'/less/**/*.less',['handle-less'])
    gulp.watch([devDir+'/**/*.html', devDir+'/css/**/*.css', devDir+'/img/**/*.{jpg,png,gif}',devDir+'/js/**/*.js'], {cwd: devDir}, server.reload);
});


gulp.task('cleanCache', function(){
    delete cached.caches['copyHtml','copyImg','copyJs'];
})      //由于cache不会自动清除缓存的东西，所以需要手动消除

//清空全部开发文件夹
gulp.task('clean', function(){
    del([devDir+'/**/*',buildDir+'/**/*'],{force: true});
})

//打包开发文件夹
gulp.task('package',function(){
    var zip = require('gulp-zip')
    var fileName = 'project-package.zip';
    gulp.src([buildDir+'/**/*','!./dist/Rev/**/*'])      //找到目标文件夹并且进行去除json文件处理
    .pipe(zip(fileName))        //对文件进行压缩和重命名
    .pipe(gulp.dest('./build'));       //压缩到指定文件夹
})