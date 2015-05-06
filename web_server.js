// TODO: in the near term, this would be responsible for hosting web_ui to browers, providing storage and connections between ui/engine/driver (via index.js and include file)


var driver = require("./driver");


var drivers = Object.create(null);
driver.watch();
driver.on('found', function (d) {
  console.log("Found", d);
  drivers[d.key] = d;
});
driver.on('lost', function (d) {
  console.log("Lost", d);
  delete drivers[d.key];
});

function textResponse(res, code, str) {
    res.writeHead(code, {'content-type':"text/plain; charset=utf-8"});
    res.end(str);
}


var http = require('http'),
    static = require('serve-static')('web_ui/build'),
    WebSocket = require('faye-websocket');
http.createServer(function (req, res) {
  var url = require('url').parse(req.url, true),
      path = url.pathname.split('/');
  if (req.url.indexOf('/api/') === 0) textResponse(res, 426, "Not HTTP…");
  else static(req, res, function (e) {
    if (e) textResponse(res, 500, e.stack);
    else textResponse(res, 404, "Not found.");
  });
}).on('upgrade', function (req, sock, body) {
  if (WebSocket.isWebSocket(req)) {
    var ws = new WebSocket(req, sock, body);
    function sendJSON(d) {
      ws.send(JSON.stringify(d));
    }
    console.log("ws opened");
    /*
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
    */
    
    ws.on('close', function (evt) {
      console.log("ws closed", evt.code, evt.reason);
    });
  }
}).listen(8000, function () {
  console.log("listening on port", this.address().port);
});