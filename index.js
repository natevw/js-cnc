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
  setInterval(function () {
    cnc.requestStatus();
  }, 1e3);
}).on('error', function (e) {
  throw e;
});