var SerialPort = require("serialport").SerialPort;

// TODO: https://github.com/grbl/grbl/wiki/Interfacing-with-Grbl

new SerialPort("/dev/tty.usbmodem621", {
    baudrate: 115200
}).on('open', function () {
    var port = this;
    console.log("opened");
}).on('error', function (e) {
    throw e;
});