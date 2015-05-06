var ws = new WebSocket("ws://"+location.host+"/api/test");
ws.onmessage = function (evt) {
  var d = JSON.parse(evt.data);
  if (d.status) updateStatus(d.status);
  else if (!d.ok) console.log(evt.data);
};
ws.onopen = function () {
  console.log("ready");
  var poll = setInterval(function () {
    sendJSON({req:'status'});
  }, 100);
  ws.onclose = function () {
    console.warn("socket closed!");
    clearInterval(poll);
  };
};

function sendJSON(d) {
  ws.send(JSON.stringify(d));
}
