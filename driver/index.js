var serialport = require('serialport'),
    Grbl = require("./grbl");


function DriverManager(storage) {
  this.storage = storage;     // used for e.g. aliases. (and driver assignments, someday…)
}
// EventEmitter: connected/disconnected

DriverManager.prototype.connectedDrivers = function () {}


function Driver(port) {   // base of Grbl??
  this.port = port;
  this.claimed = false;     // or something, for locking out simultaneous writes
}


exports.DriverManager = DriverManager;
exports.Driver = Driver;


// OLD CODE BELOW

var cnc;
//new serialport.SerialPort("/dev/tty.usbmodem621", {
new serialport.SerialPort("/dev/tty.usbmodem12341", {
  baudrate: 115200,
  parser: serialport.parsers.readline("\n")
}).on('open', function () {
  var port = this;
  console.log("opened");
port.on('data', function (d) {
  console.log("DATA:", d.toString());
});
  cnc = new Grbl(port);
cnc.emit('ready');
  cnc.on('ready', function () {
console.log("READY!");
//    setInterval(function () {
//      cnc.write("G91 G1 F1 X1", function (e) {
//        console.log("EXCHANGED", e);
//      });
//    }, 5e3);
//    setInterval(function () {
//      cnc.request('status');
//    }, 1e3);
  }).on('error', function (e) {
    if (e instanceof SyntaxError) console.warn(e.stack);
    else throw e;
  });
}).on('error', function (e) {
  throw e;
});


