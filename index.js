var serialport = require('serialport'),
    Grbl = require("./grbl");

// TODO: https://github.com/grbl/grbl/wiki/Interfacing-with-Grbl

var cnc;
new serialport.SerialPort("/dev/tty.usbmodem621", {
  baudrate: 115200,
  parser: serialport.parsers.readline("\r\n")
}).on('open', function () {
  var port = this;
  console.log("opened");
  cnc = new Grbl(port);
  cnc.on('ready', function () {
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


var WebSocket = require('faye-websocket'),
    http      = require('http');
http.createServer(function (req, res) {
  // TODO: host static files
}).on('upgrade', function (req, sock, body) {
  if (WebSocket.isWebSocket(req)) {
    var ws = new WebSocket(req, sock, body);
    function sendJSON(d) {
      ws.send(JSON.stringify(d));
    }
    console.log("ws opened");
    ws.on('message', function (evt) {
      //console.log("ws data:", evt.data);
      var d = JSON.parse(evt.data);
      if (d.str) cnc.write(d.str, function (e) {
        if (e) sendJSON({error:e.message});
        else sendJSON({ok:true});
      });
      else if (d.req) cnc.request(d.req);
      else console.warn("Unhandled message type.");
    });
    cnc.on('status', function (arr) {
      sendJSON({status:arr});
    });
    
    ws.on('close', function (evt) {
      console.log("ws closed", evt.code, evt.reason);
    });
  }
}).listen(8000, function () {
  console.log("listening on port", this.address().port);
});