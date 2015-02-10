/* global define */
define(function (require) {
	'use strict';
	
	var buildMessage = require('js/utils/build-message');
	var FloorRequest = require('js/floor-request');
	var ElevatorRequest = require('js/elevator-request');
	
	return {
		init: function (elevators, floors) {
			floors.forEach(function (thisFloor) {
				FloorRequest.requests.push(new FloorRequest({
					index: thisFloor.floorNum(),
					item: thisFloor
				}));
			});
			
			elevators.forEach(function (thisElevator, elNum) {
				ElevatorRequest.requests.push(new ElevatorRequest({
					index: elNum,
					item: thisElevator
				}));
			});
		},
		update: function (dt, elevators, floors) {
			// We normally don't need to do anything here
			/*console.log('update - dt');
			console.log(dt);
			console.log('update - elevators[0]');
			console.log(elevators[0]);
			console.log('update - elevators[1]');
			console.log(elevators[1]);
			console.log('update - floors[0]');
			console.log(floors[0]);
			console.log('update - floors[1]');
			console.log(floors[1]);
			console.log('update - floors[2]');
			console.log(floors[2]);
			console.log('update - floors[3]');
			console.log(floors[3]);*/
		}
	};
});
