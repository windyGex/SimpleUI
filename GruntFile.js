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

        }
    });

    grunt.loadNpmTasks('grunt-requirejs');

    grunt.registerTask('default', ['requirejs']);
}