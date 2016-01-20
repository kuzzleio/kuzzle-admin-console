module.exports = function (grunt) {

  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('gruntify-eslint');
  grunt.loadNpmTasks('grunt-contrib-sass');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-cucumber');
  grunt.loadNpmTasks('grunt-phantom');

  grunt.initConfig({
    /** ADD REAL TESTS ON SOURCE **/
    //jshint: {
    //  all: ['Gruntfile.js', 'test/**/*.js', 'features/**/*.js']
    //},
    //eslint: {
    //  src: ['core/**/*.js']
    //},
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
    },
    phantom: {
      cucumber: {}
    },
    cucumberjs: {
      files: 'features/phantom.feature',
        options: {
        steps: 'features/step_definitions/common/phantom.js',
        format: 'pretty'
      }
    }
  });

  grunt.registerTask('test', ['phantom', 'cucumberjs']);
  grunt.registerTask('default', ["sass"]);
};
