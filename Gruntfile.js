module.exports = function (grunt) {

  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('gruntify-eslint');
  grunt.loadNpmTasks('grunt-contrib-sass');
  grunt.loadNpmTasks('grunt-contrib-watch');

  grunt.initConfig({
    /** ADD REAL TESTS ON SOURCE **/
    jshint: {
      all: ['public/javascripts/**/*.js'],
      options: {
        jshintrc: './.jshintrc'
      }
    },
    eslint: {
      src: ['core/**/*.js']
    },
    sass: {
      dist: {
        files: [{
          expand: true,
          cwd: 'sass',
          src: ['*.scss'],
          dest: 'public/styles',
          ext: '.css'
        }]
      }
    },
    watch: {
      files: 'sass/*.scss',
      tasks: ['sass'],
      options: {
        livereload: true
      }
    }
  });

  grunt.registerTask('default', ['sass']);
  grunt.registerTask('linter', ['eslint', 'jshint']);
};
