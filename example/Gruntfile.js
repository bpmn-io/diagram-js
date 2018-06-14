'use strict';

function resolvePath(p) {
  return require.resolve(p);
}


module.exports = function(grunt) {

  require('load-grunt-tasks')(grunt);


  // project configuration
  grunt.initConfig({
    browserify: {
      options: {
        transform: [
          [ 'babelify', {
            global: true
          } ]
        ]
      },
      watch: {
        options: {
          watch: true
        },
        files: {
          'dist/app.js': [ 'app/**/*.js' ]
        }
      },
      app: {
        files: {
          'dist/app.js': [ 'app/**/*.js' ]
        }
      }
    },
    copy: {
      app: {
        files: [
          {
            expand: true,
            cwd: 'app/',
            src: ['**/*.*', '!**/*.js'],
            dest: 'dist'
          },
          {
            src: resolvePath('diagram-js/assets/diagram-js.css'),
            dest: 'dist/css/diagram-js.css'
          }
        ]
      }
    },
    watch: {
      options: {
        livereload: true
      },
      samples: {
        files: [ 'app/**/*.*' ],
        tasks: [ 'copy:app' ]
      }
    },
    connect: {
      livereload: {
        options: {
          port: 9013,
          livereload: true,
          hostname: 'localhost',
          open: true,
          base: [
            'dist'
          ]
        }
      }
    }
  });

  // tasks

  grunt.registerTask('build', [ 'browserify:app', 'copy:app' ]);

  grunt.registerTask('auto-build', [
    'copy',
    'browserify:watch',
    'connect',
    'watch'
  ]);

  grunt.registerTask('default', [ 'build' ]);
};