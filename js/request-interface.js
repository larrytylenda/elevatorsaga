/* global define */
define(function (require) {
  'use strict';
  
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
  
  return RequestInterface;
});
