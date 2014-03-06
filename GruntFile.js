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
                    out: "dist/sui.min.js",
                    optimize:"none"//,
                    //preserveLicenseComments:false,
                   // generateSourceMaps:true
                }
            },
            compileIncludejQuery:{
                options: {
                    baseUrl: "./src",
                    paths:{
                        "jquery":"../lib/jquery"
                    },
                    name: "sui",
                    out: "dist/sui.all.min.js",
                    optimize:"none"//,
                    //preserveLicenseComments:false,
                   // generateSourceMaps:true
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
                    assets: 'dist/docs/assets',
                    data: ['doc/data/*.json'],
                    partials: ['doc/includes/**/*.{html,scss}'],
                    //helpers: ['doc/helpers/*.js'],
                    layout: 'doc/layout/default.html'
                },
                expand: true,
                cwd: 'doc/pages',
                src: '**/*.{html,md}',
                dest: 'dist/docs/'
            }
        },

        copy: {
            dist:{
                files: [
                    {expand:true, cwd: 'dist/', src: ['sui.all.min.js'], dest: 'doc/assets/js/'},
                    {expand:true, cwd: 'doc/assets/', src: ['**/*'], dest: 'dist/docs/assets/', filter:'isFile'}
                ]
            }
        }
    });

    grunt.loadNpmTasks('grunt-requirejs');
    grunt.loadNpmTasks('assemble');
    grunt.loadNpmTasks('grunt-contrib-copy');


    grunt.registerTask('default', ['assemble','requirejs','copy']);
}