/* global define */
define(function (require) {
  'use strict';
  
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
  
  return FloorRequest;
});
