{
    init: function(elevators, floors) {
        var buildMessage = function (method, message) {
            return function (variable, value) {
                console.log(method + ' ' + message + ' - ' + variable);
                console.log(value);
            };
        };
        var RequestInterface = function (options) {
            var self = this;
            options || (options = {});
            if (options.index || options.index === 0) this.index = options.index;
            if (options.item) this._item = options.item;
            this.resetRequests();
        };
        RequestInterface.prototype.total = function () {
            return 0;
        };
        RequestInterface.prototype.resetRequests = function () {};
        RequestInterface.clone = function (classObject) {
            classObject.prototype = RequestInterface.prototype;
            classObject.requests = [];
            classObject.getItem = function (itemIndex) {
                var item;
                classObject.requests.forEach(function (thisItem) {
                    if (thisItem.index === itemIndex) item = thisItem;
                });
                return item;
            };
            classObject.resetItem = function (itemIndex) {
                classObject.getItem(itemIndex).resetRequests();
            };
            classObject.getMostRequestedItem = function (itemIndex) {
                var item;
                var max = -1;
                classObject.requests.forEach(function (thisItem) {
                    if (thisItem.index === itemIndex) return;
                    if (max < thisItem.total()) {
                        max = thisItem.total();
                        item = thisItem;
                    }
                });
                return item;
            };
            classObject.getClosestItem = function (itemIndex, direction) {
                var dir = direction === 'down' ? -1 : 1;
                var searchForItem = function (increment) {
                    for (var i = itemIndex + increment; itemIndex >= 0 && itemIndex < floors.length; i += increment) {
                        var item = classObject.getItem(i);
                        if (item && item.total()) return i;
                    }
                }
                var closest = searchForItem(dir);
                if (!closest && closest !== 0) closest = searchForItem(-dir);
                
                return closest;
            };
            
            return classObject;
        };
        var FloorRequest = RequestInterface.clone(function (options) {
            var self = this;
            RequestInterface.prototype.constructor.apply(this, arguments);
            this._item.on("up_button_pressed", function () {
                self.upRequest();
            });
            this._item.on("down_button_pressed", function () {
                self.downRequest();
            });
        });
        FloorRequest.prototype.total = function () {
            return this.up + this.down;
        };
        FloorRequest.prototype.resetRequests = function () {
            this.up = 0;
            this.down = 0;
        };
        FloorRequest.prototype.upRequest = function () {
            this.up++;
        };
        FloorRequest.prototype.downRequest = function () {
            this.down++;
        };
        
        var ElevatorRequest = RequestInterface.clone(function (options) {
            var self = this;
            RequestInterface.prototype.constructor.apply(this, arguments);
            this._item.on("idle", function () {
                console.log('idle - elNum');
                console.log(self.index);
                
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
                if (self._item.loadFactor()) {
                    self._item.goToFloor(floorNum);
                }
            });
            this._item.on('stopped_at_floor', function (floorNum) {
                var message = buildMessage('stopped_at_floor', '(elNum: ' + self.index + ')');
                var aboveQueue = [];
                var belowQueue = [];
                self.floors = self.floors.filter(function (num) { return num !== floorNum });
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
                
                var floorGoTo = FloorRequest.getMostRequestedItem(floorNum);
                FloorRequest.resetItem(floorNum);
                var directionDown = false;
                if (self._item.destinationQueue.length) {
                    directionDown = self._item.destinationQueue[0] < self._item.currentFloor();
                }
                else {
                    directionDown = self._item.currentFloor() > 0;
                }
                self._item.goingUpIndicator(!directionDown);
                self._item.goingDownIndicator(!!directionDown);
                var closest = FloorRequest.getClosestItem(floorNum, !!directionDown ? 'down' : 'up');
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
    update: function(dt, elevators, floors) {
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
}
