var util = require('util'),
    stream = require('stream');

// see: https://github.com/grbl/grbl/wiki/Interfacing-with-Grbl

var ERR = 'error: ',
    VER = 'Grbl ',
    XXX = 'ALARM: ';

var REQ = {
  status: '?',
  start: '~',
  hold: '!',
  reset: '\u0018'
};

function Grbl(port) {
  stream.Writable.call(this, {objectMode:true});
  this._port = port;
  
  var self = this;
  if (1) self.emit = function (k) {
//    if (k !== 'status') console.log("EMIT:", k, Array.prototype.slice.call(arguments, 1).join(', '));
    Grbl.super_.prototype.emit.apply(this, arguments);
  }
  port.on('data', function (line) {
if (line[0] !== '<') console.log("RESPONSE:", line);
    if (!line) return;
    else if (line === 'ok') self.emit('ack', null);
else if (line === "Connected.") self.emit('ready', 'printrbot hack');
    else if (line.indexOf(ERR) === 0) self.emit('ack', new SyntaxError(line.slice(ERR.length) || "[no message provided]"));
    else if (line.indexOf(VER) === 0) self.emit('ready', line.slice(VER.length).split(' ')[0]);
    else if (line.indexOf(XXX) === 0) self.emit('error', new Error(line.slice(XXX.length)));
    else if (line[0] === '<') self.emit('status', line.slice(1,-1).split(/,|:/));
    else if (line[0] === '[') self.emit('info', line.slice(1,-1).split(/,|:/));
    else if (line[0] === '$') self.emit('var', +line.match(/\$(\d+)=/)[1], +line.match(/=([0-9.]+)/)[1], line.match(/\((.*)\)/)[1]);
    else console.warn("UNKNOWN:", line);
  });
};
util.inherits(Grbl, stream.Writable);

Grbl.prototype._write = function (line, _, cb) {
  var self = this;
console.log("WRITING:", line);
  self._port.write(line+'\n', function () {
    self.once('ack', cb);
  });
};

Grbl.prototype.request = function (key) {
  if (key in REQ) this._port.write(REQ[key]);
  else throw Error("Unknown request key: "+key);
};

module.exports = Grbl;
