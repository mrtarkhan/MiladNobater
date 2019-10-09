var http = require('http');
var url = require('url');
var fs = require('fs');
var events = require('events');
var ticket = require('./ticketModule');


var eventEmitter = new events.EventEmitter();
var intervalFunc;

//event handler:
var ticketGetterCreatedHandler = function (nationalcode, doctorType) {
  console.log('a thread created to get a ticket: ', nationalcode, doctorType);
  intervalFunc = setInterval(ticket.getTicket, 5000, nationalcode, doctorType);
}

var ticketGetDoneHandler = function () {
    if (!intervalFunc)
        clearInterval(intervalFunc);
}

eventEmitter.on('ticketGetterCreated', ticketGetterCreatedHandler);
eventEmitter.on('ticketGetDone', ticketGetDoneHandler);






http.createServer(function (req, res) {
    var q = url.parse(req.url, true);
    var filename = "." + q.pathname;

    if (filename == "./ticket.html") {
        var nationalcode = q.query.nationalcode;
        var doctorType = q.query.doctorTypes;
        eventEmitter.emit('ticketGetterCreated', nationalcode, doctorType);
    }

    fs.readFile(filename, function(err, data) {
        if (err) {
        res.writeHead(404, {'Content-Type': 'text/html'});
        return res.end("404 Not Found");
      } 

      res.writeHead(200, {'Content-Type': 'text/html'});
      res.write(data);
      return res.end();

    });
  }).listen(8080);