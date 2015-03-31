var util = require('util'),
    events = require('events');
    
var serialport = require('serialport'),
    xok = require('xok');

function DriverManager() {}
util.inherits(DriverManager, events.EventEmitter);

DriverManager.prototype._list = function (cb) {
  serialport.list(function (e, arr) {
    if (e) cb(e);
    else cb(null, arr.filter(function (port) {
      return port.locationId;
    }).map(function (port) {
      return port.comName;
    }));
  });
};

DriverManager.prototype.watch = function () {
  var self = this,
      oldDevices = Object.create(null);
  self._watcher = setInterval(function () {
    self._list(function (e, arr) {
        if (e) return self.emit('error', e);
        
        var newDevices = Object.create(null);
        arr.forEach(function (path) {
          if (path in oldDevices) {
            newDevices[path] = oldDevices[path];
            delete oldDevices[path];
          } else {
            newDevices[path] = new Driver(path);
            self.emit('found', newDevices[path]);
          }
        });
        Object.keys(oldDevices).forEach(function (path) {
          self.emit('lost', oldDevices[path]);
        });
        oldDevices = newDevices;
    });
  }, 1e3);
};

DriverManager.prototype.unwatch = function () {
  clearInterval(this._watcher);
};


function Driver(path) {   // base of Grbl??
  this.key = 'device-'+Math.random().toFixed(7).slice(2)
  this.path = path;
  this.claimed = false;     // or something, for locking out simultaneous writes
}
util.inherits(Driver, events.EventEmitter);

Driver.prototype.open = function (Machine) {
  if (this.claimed) throw Error("Cannot open a claimed device");
  else this.claimed = true;
  
  var self = this;
  self._port = new serialport.SerialPort(self.path, xok({
        baudrate: 115200,
        parser: serialport.parsers.readline("\n")
  }, Machine.portOptions)).on('open', function () {
    var cnc = new Machine(this);
    self.emit('open', cnc);
  }).on('error', function (e) {
    self.emit('error', e);
  });
};

Driver.prototype.close = function () {
  this._port.close();
  this.claimed = false;
};

module.exports = new DriverManager();
