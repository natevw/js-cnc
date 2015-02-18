var serialport = require('serialport'),
    Grbl = require("./grbl");

// TODO: https://github.com/grbl/grbl/wiki/Interfacing-with-Grbl

new serialport.SerialPort("/dev/tty.usbmodem621", {
  baudrate: 115200,
  parser: serialport.parsers.readline("\r\n")
}).on('open', function () {
  var port = this;
  console.log("opened");
  var cnc = new Grbl(port);
  cnc.on('ready', function () {
    setInterval(function () {
      cnc.exchange("G91 G1 F1 X1", function (e) {
        console.log("EXCHANGED", e);
      });
    }, 100);
    setInterval(function () {
      cnc.request('status');
    }, 1e3);
  }).on('error', function (e) {
    if (e instanceof SyntaxError) console.warn(e.stack);
    else throw e;
  });
}).on('error', function (e) {
  throw e;
});

//require('repl').start({});