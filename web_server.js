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

function basicHTML(res, status,title,bodyLines) {
  res.writeHead(status, {'Content-Type':"text/html"});
  res.end([
    "<!doctype html>",
    "<html><head>",
    "  <meta charset=\"utf-8\">",
    "  <title>"+title+"</title>",
    "</head><body>",
    (typeof bodyLines === 'string') ? bodyLines : bodyLines.join('\n'),
    "</body></html>"
  ].join('\n'));
}



var http = require('http'),
    WebSocket = require('faye-websocket');
http.createServer(function (req, res) {
  var url = require('url').parse(req.url, true),
      path = url.pathname.split('/');
  if (path[1] === 'static') /* TODO: host files */;
  else if (path[1] === '') basicHTML(res, 200, "Devices", Object.keys(drivers).map(function (key) {
    var driver = drivers[key];
    return "<a href=\"/"+driver.key+"\">"+driver.path+"</a>";
  }));
  else if (path[1] in drivers) {
    // TODO: this really belongs in WebSocket path…actual UI is probably static?
    var driver = drivers[path[1]];
    if (driver.claimed) basicHTML(res, 403, "busy", "Device in use.");
    else basicHTML(res, 200, "yes", "YOUR DEVICE.");
  }
  else basicHTML(res, 404, "nope", "Not found.");
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