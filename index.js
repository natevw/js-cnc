// TODO: in the near term, this would be responsible for hosting web_ui to browers, providing storage and connections between ui/engine/driver




var http = require('http'),
    WebSocket = require('faye-websocket');
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