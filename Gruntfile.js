/* global module, require */

module.exports = function (grunt) {
	'use strict';

	grunt.loadNpmTasks('grunt-karma');

	grunt.initConfig({
		pkg: grunt.file.readJSON('package.json'),

		karma: {
			main: {
				configFile: 'karma.conf.js',
				singleRun: true,
				reporters: [
					'progress',
					'coverage'
				]
			}
		}
	});
};
