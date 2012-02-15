
/**
 * Module dependencies.
 */

var express = require('express');
var backboneio = require('backbone.io');

var app = express.createServer();

// Configuration

app.configure(function(){
  app.set('views', __dirname + '/views');
  app.set('view engine', 'jade');
  app.use(express.bodyParser());
  app.use(express.methodOverride());
  app.use(app.router);
  app.use(express.static(__dirname + '/public'));
});

app.configure('development', function(){
  app.use(express.errorHandler({ dumpExceptions: true, showStack: true }));
});

app.configure('production', function(){
  app.use(express.errorHandler());
});

app.listen(3000);


var cars = backboneio.createBackend();
cars.use(backboneio.middleware.memoryStore());

var torpedos = backboneio.createBackend();
torpedos.use(backboneio.middleware.memoryStore());


backboneio.listen(app, { cars: cars, torpedos : torpedos });

console.log("Express server listening on port %d in %s mode", app.address().port, app.settings.env);
