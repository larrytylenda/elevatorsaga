/* global define */
define(function (require) {
	'use strict';
	
	var buildMessage = require('js/utils/build-message');
	var RequestInterface = require('js/request-interface');
	var FloorRequest = require('js/floor-request');
	
	var ElevatorRequest = RequestInterface.clone(function (options) {
		var self = this;
		RequestInterface.prototype.constructor.apply(this, arguments);
		this._item.on("idle", function () {
			console.log('idle - (elNum: ' + self.index + ')');
			
			// The elevator is idle, so let's go to all the floors (or did we forget one?)
			self._item.goToFloor(0);
		});
		this._item.on("floor_button_pressed", function (floorNum) {
			var message = buildMessage('floor_button_pressed', '(elNum: ' + self.index + ')');
			self.floors.push(floorNum);
			message('floorNum', floorNum);
			message('elevatorRequests', self.floors);
			message('this.destinationQueue', self._item.destinationQueue);
			message('this.loadFactor()', self._item.loadFactor());
			message('thisElevator', self._item);
			if (self._item.loadFactor()) self._item.goToFloor(floorNum);
		});
		this._item.on('stopped_at_floor', function (floorNum) {
			var message = buildMessage('stopped_at_floor', '(elNum: ' + self.index + ')');
			var aboveQueue = [];
			var belowQueue = [];
			var floorGoTo;
			var directionDown;
			var closest;
			self.floors = self.floors.filter(function (num) { return num !== floorNum; });
			self._item.destinationQueue.forEach(function (i) {
				var queue;
				if (i === floorNum || (queue = (i > floorNum ? aboveQueue : belowQueue)).indexOf(i) !== -1) return;
				queue.push(i);
			});
			belowQueue.sort();
			belowQueue.reverse();
			aboveQueue.sort();
			self._item.destinationQueue = belowQueue.concat(aboveQueue);
			message('this.destinationQueue', self._item.destinationQueue);
			message('floorNum', floorNum);
			self._item.checkDestinationQueue();
			message('checkDestinationQueue - this.destinationQueue', self._item.destinationQueue);
			message('thisElevator', self._item);
			message('elevatorRequests', self.floors);
			
			floorGoTo = FloorRequest.getMostRequestedItem(floorNum);
			FloorRequest.resetItem(floorNum);
			directionDown = self._item.destinationQueue.length ?
				self._item.destinationQueue[0] < self._item.currentFloor() :
				self._item.currentFloor() > 0;
			self._item.goingUpIndicator(!directionDown);
			self._item.goingDownIndicator(!!directionDown);
			closest = FloorRequest.getClosestItem(floorNum, !!directionDown ? 'down' : 'up');
			if (closest || closest === 0) {
				self._item.goToFloor(closest, true);
			}
			/*else if (floorGoTo && !isNaN(floorGoTo.index)) {
				self._item.goToFloor(floorGoTo.index);
			}*/
		});
		this._item.on("passing_floor", function (floorNum, direction) {
			var message = buildMessage('passing_floor', '(elNum: ' + self.index + ')');
			var floorGoingTo = floorNum + (direction === 'up' ? 1 : -1);
			message('floorNum', floorNum);
			message('direction', direction);
			message('thisElevator', self._item);
			message('elevatorRequests', self.floors);
			
			if (floorGoingTo < 0) floorGoingTo = 0;
			if (floorGoingTo > floors.length - 1) floorGoingTo = floors.length - 1;
			//if (floorRequests[floorGoingTo].total()) this.stop();
		});
	});
	ElevatorRequest.prototype.total = function () {
		return this.floors.length;
	};
	ElevatorRequest.prototype.floorRequest = function (floorNum) {
		this.floors.push(floorNum);
	};
	ElevatorRequest.prototype.resetRequests = function () {
		this.floors = [];
	};
	
	return ElevatorRequest;
});
