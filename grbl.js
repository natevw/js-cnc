var util = require('util'),
    events = require('events');

function Grbl(port) {
  this._port = port;
  
  port.on('data', function (line) {
    if (!line) return;
    else if (line[0] === 'G') console.log("version:", line);
    else if (line[0] === '<') console.log("status:", line);
    else if (line[0] === '[') console.log("report:", line);
    else if (line[0] === '$') console.log("value:", line);
    else console.warn("UNKNOWN:", line);
  });
};
util.inherits(Grbl, events.EventEmitter);

Grbl.prototype.requestStatus = function () {
  this._port.write('?');
}

module.exports = Grbl;
