var hljs = require('highlight.js');

module.exports = function (grunt) {
    grunt.initConfig({
        requirejs: {
            compile: {
                options: {
                    baseUrl: "./src",
                    paths:{
                        "jquery":"../lib/jquery"
                    },
                    name: "sui",
                    exclude:["jquery"],
                    out: "dest/sui.min.js",
                    optimize:"uglify2",
                    preserveLicenseComments:false,
                    generateSourceMaps:true
                }
            },
            compileIncludejQuery:{
                options: {
                    baseUrl: "./src",
                    paths:{
                        "jquery":"../lib/jquery"
                    },
                    name: "sui",
                    out: "dest/sui.all.min.js",
                    optimize:"uglify2",
                    preserveLicenseComments:false,
                    generateSourceMaps:true
                }
            }
        },

        assemble: {
          options: {
                marked: {
                    gfm: true,
                    sanitize: false,
                    highlight: function(code, lang) {
                        if (lang === undefined) lang = 'bash';
                        if (lang === 'html') lang = 'xml';
                        if (lang === 'js') lang = 'javascript';
                        return '<div class="code-container">' + hljs.highlight(lang, code).value + '</div>';
                    }
                }
            },
            dist: {
                options: {
                    flatten: false,
                    assets: 'dest/assets',
                    data: ['doc/data/*.json'],
                    partials: ['doc/includes/**/*.{html,scss}'],
                    //helpers: ['doc/helpers/*.js'],
                    layout: 'doc/layout/default.html'
                },
                expand: true,
                cwd: 'doc/pages',
                src: '**/*.{html,md}',
                dest: 'dest/docs/'
            }
        }
    });

    grunt.loadNpmTasks('grunt-requirejs');
    grunt.loadNpmTasks('assemble');


    grunt.registerTask('default', ['assemble','requirejs']);
}