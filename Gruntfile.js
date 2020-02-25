'use strict';

module.exports = function (grunt) {
    grunt.config.init({
        copy: {
            wwjsHALasm: {
                nonull: true,
                src: 'node_modules/@wonderworkshop/wwjs/HALasm.js.mem',
                dest: 'public/HALasm.js.mem'
            }
        }
    });

    grunt.loadNpmTasks('grunt-contrib-copy');
};
