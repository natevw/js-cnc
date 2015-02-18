var util = require('util'),
    stream = require('stream'),
    LineStream = require('linefeed');

function Grbl(port) {
    stream.Readable.call(this, {});     // TODO: decodeStrings:false?
    
    var linefeed = new LineStream({newline:"", objectMode:true});
    port.pipe(linefeed).on('data', function (line) {
        console.log("Got a line:", line);
    });
};
util.inherits(Grbl, stream.Writable);

Grbl.prototype._write = function (d, _, cb) {
    // TODO: write to port, and "grab a number" waiting for the corresponding 'ok' (may be simple since node will only call _write once per cb)
};


module.exports = Grbl;