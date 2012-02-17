var Car = Backbone.Model.extend({
    
    initialize: function(args) {
        this.master = false;

        if(args.master){
            this.master = true;
            this.set({master : false});
        }

        new CarView({model : this});
    }
    
});




var Torpedo = Backbone.Model.extend({

    defaults : {
        u : 200,
        direction : 0,
        currPos : {
            x : 0,
            y : 0
        }
    },
    
    initialize: function(args) {
        new TorpedoView({model : this});
    }
    
});




var Cars = Backbone.Collection.extend({
    
    // Specify the backend with which to sync
    backend: 'cars',

    model: Car,

    initialize: function() {
        // Setup default backend bindings
        this.bindBackend();

        this.bind('backend:update', this.addExistingCar, this);
    },

    addExistingCar : function(model) {
        if(!this.get(model.id)){
            this.add(model);
        }
    }

});



var Torpedos = Backbone.Collection.extend({
    
    // Specify the backend with which to sync
    backend: 'torpedos',

    model: Torpedo,

    initialize: function() {
        // Setup default backend bindings
        this.bindBackend();

        this.bind('backend:update', this.addExistingTorpedo, this);
    },

    addExistingTorpedo : function(model) {
        if(!this.get(model.id)){
            this.add(model);
        }
    }

});





var TorpedoView = Backbone.View.extend({

    timeToLive : 2000,

    initialize: function() {

        // setup new layer with a torpedo
        this.layer = new Kinetic.Layer("torpedo layer");

        this.torpedo = new Kinetic.Shape(function(){
            var context = this.getContext();
            context.fillStyle = "#222";
            context.beginPath();
            context.arc(0, 0, 3, 0, Math.PI * 2, true);
            context.fill();
        });

        this.layer.add(this.torpedo);

        Game.stage.add(this.layer);
        // setup new layer with a torpedo

        this.timestamp = Date.now();

        this.timer = window.setInterval($.proxy(this.engine, this), 50);
    },


    render : function() {
        var currPos = this.model.get("currPosition");
        this.torpedo.setPosition(currPos.x, currPos.y);
        this.layer.draw();
    },


    engine : function() {

        var a = 0, t = 0.1, 
        u = this.model.get("u"),
        q = this.model.get("direction"),
        currPos = this.model.get("currPosition");

        var d = u * t + (a * Math.pow(t, 2))/2;
        var v = u + a * t;

        var dx = Math.round(d * Math.cos(q));
        var dy = Math.round(d * Math.sin(q));

        currPos.x += dx;
        currPos.y += dy;

        this.model.set({
           u :  v,
           currPosition : currPos
        });

        this.render();

        if(Date.now() > this.timestamp + this.timeToLive){
            window.clearInterval(this.timer);
            this.remove();
            return false;
        }
    },


    remove : function() {
        Game.stage.remove(this.layer);
    }

});





var CarView = Backbone.View.extend({

    config : {
        vmax : 100,
        a : 10,
        da : 10
    },

    context : null,

    canvas : null,
    
    initialize: function(args) {

        // setup new layer with a car
        this.layer = new Kinetic.Layer("car layer");

        var carImage = $("#red-car-image").clone()[0];

        this.car = new Kinetic.Shape(function(){
            var context = this.getContext();

            ///context.drawImage(carImage, 0, 0);

            var sourceX = 0;
            var sourceY = 0;
            var sourceWidth = 60;
            var sourceHeight = 30;
            var destWidth = sourceWidth;
            var destHeight = sourceHeight;
            var destX = -30;
            var destY = -15;
     
            context.drawImage(carImage, sourceX, sourceY, sourceWidth, sourceHeight, destX, destY, destWidth, destHeight);

        });

        this.layer.add(this.car);

        Game.stage.add(this.layer);
        // setup new layer with a car

        if(this.model.master){
            $("body").keydown($.proxy(this.keydown, this));
            $("body").keyup($.proxy(this.keyup, this));
        }

        //this.model.bind("change", this.render, this);

        this.keyw = this.keys = this.keya = this.keyd = false;

        this.torpedos = new Torpedos();

        window.setInterval($.proxy(this.engine, this), 50);
    },
    

    render: function() {
        var currPosition = this.model.get("currPosition");
        this.car.setPosition(currPosition.x, currPosition.y);
        this.car.setRotation(this.model.get("direction"));
        this.layer.draw();
        return this;
    },


    keydown : function(e) {
        var keynum;

        if(window.event) {// IE 
            keynum = e.keyCode
        } else if(e.which) { // Netscape/Firefox/Opera
            keynum = e.which
        }

        var keychar = String.fromCharCode(keynum);

        if(keychar=="W" || keychar=="&")
            this.keyw = true;
        else if(keychar=="S" || keychar=="(")
            this.keys = true;
        else if(keychar=="A" || keychar=="%")
            this.keya = true;
        else if(keychar=="D" || keychar=="'")
            this.keyd = true;
        else if(keychar=="X")
            this.fireTorpedo();
    },


    keyup : function(e) {

        var keynum;
        var keychar;

        if(window.event) {// IE
            keynum = e.keyCode
        } else if(e.which) {// Netscape/Firefox/Opera
            keynum = e.which
        }

        keychar = String.fromCharCode(keynum);

        if(keychar=="W" || keychar=="&")
            this.keyw = false;
        else if(keychar=="S" || keychar=="(")
            this.keys = false;
        else if(keychar=="A" || keychar=="%")
            this.keya = false;
        else if(keychar=="D" || keychar=="'")
            this.keyd = false;
    },


    engine : function() {

        var a = 0, t = 0.1;

        var currPos = this.model.get("currPosition");

        var u = this.model.get("u");

        var q = this.model.get("direction");


        // acceleration
        if(this.keyw) {
            a = u < 0 ? this.config.a + this.config.da : this.config.a;

        } else if(this.keys) {
            a = u > 0? -(this.config.a + this.config.da) : -this.config.a;

        } else { // brakes

            if(u > 0) {
                a = -this.config.da;
            } else if(u < 0) {
                a = this.config.da;
            }
        }

        
        // angle
        if( this.keya && u != 0) {
            q = u < 0 ? q + 0.1 : q - 0.1;

        } else if( this.keyd && u != 0) {
            q = u < 0 ? q - 0.1 : q + 0.1;
        }

        var d = u * t + (a * Math.pow(t, 2))/2;          
        var v = u + a * t;
    
        var ang = q % 6.28;

        u = v > this.config.vmax ? this.config.vmax : v;
    
        var dx = Math.round(d * Math.cos(q));
        var dy = Math.round(d * Math.sin(q));

        currPos.x += dx;
        currPos.y += dy;

        if(ang < 0)
            angle = 6.28 + ang;
        else 
            angle = ang;

        this.model.set({
            u : u,
            currPosition : currPos,
            direction : angle
        });

        this.render();

        if(this.model.master)
            this.model.save();
        
    },


    fireTorpedo : function() {

        var d = parseFloat(this.model.get('direction'));
        var currPos = this.model.get("currPosition");
        var c = {
            x : parseFloat(currPos.x),
            y : parseFloat(currPos.y)
        };

        this.torpedos.create({
            direction : d,
            currPosition : c
        });
    }
    
});



$(function() {

    Game = {};

    Game.stage = new Kinetic.Stage("container", 800, 600);

    Game.board = new Kinetic.Layer();

    var rectangle = new Kinetic.Shape(function(){
        var context = this.getContext();
        context.fillStyle="#cecece";
        context.fillRect(0,0, 800, 600);
    });

    Game.board.add(rectangle);

    Game.stage.add(Game.board);

    Game.allCars = new Cars();

    Game.allCars.create({
        u : 0,
        direction : 0,
        master : true,
        currPosition : {
            x : Math.round(Math.random()*100), 
            y : Math.round(Math.random()*100)
        }
    });

});