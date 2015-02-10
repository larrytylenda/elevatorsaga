/* global define */
define(function (require) {
	'use strict';
  
	var buildMessage = function (method, message) {
		return function (variable, value) {
			console.log(method + ' ' + message + ' - ' + variable);
			console.log(value);
		};
	};
	return buildMessage;
});
