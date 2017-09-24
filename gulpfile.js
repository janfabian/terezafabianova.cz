const gulp = require("gulp");
const browserSync = require("browser-sync").create();
const path = require("path");
const startbootstrapStylishPortfolioPath = path.dirname(require.resolve("startbootstrap-stylish-portfolio/package.json"));

gulp.task("copy", () => {
  gulp.src([
      `${startbootstrapStylishPortfolioPath}/**/*`
    ])
    .pipe(gulp.dest("web/startbootstrap-stylish-portfolio/"));
})

gulp.task("default", ["copy"]);

gulp.task("browserSync", () => {
  browserSync.init({
    server: {
      baseDir: "web"
    },
  })
})

gulp.task("dev", ["browserSync"], () => {
  gulp.watch("web/js/*.js", browserSync.reload);
  gulp.watch("web/css/*.css", browserSync.reload);
  gulp.watch("web/*.html", browserSync.reload);
});
