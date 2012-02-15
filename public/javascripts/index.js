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
        this.layer = new Kinetic.Layer();

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

        var currPos = this.model.get("currPosition");

        if(!this.weaponLayer){

            this.weaponLayer = new Kinetic.Layer();

            this.torpedo = new Kinetic.Shape(function(){
                var context = this.getContext();
                context.fillStyle = "#222";
                context.beginPath();
                context.arc(0, 0, 3, 0, Math.PI * 2, true);
                context.fill();
            });

            this.weaponLayer.add(this.torpedo);

            Game.stage.add(this.weaponLayer);

        } else if(this.torpedo.dead == false) {
            return false;
        }

        this.torpedo.setPosition(currPos.x, currPos.y);
        this.weaponLayer.draw();

        this.torpedo.dead = false;
        this.torpedo.u = this.model.get("u");
        this.torpedo.q = this.model.get("direction");
        this.torpedo.timestamp = Date.now();

        this.moveTorpedo();
    },


    moveTorpedo : function() {
        var a = 100, t = 0.1, u = this.torpedo.u;
        var d = u * t + (a * Math.pow(t, 2))/2;
        var v = u + a * t;
        this.torpedo.u = v;

        var dx = Math.round(d * Math.cos(this.torpedo.q));
        var dy = Math.round(d * Math.sin(this.torpedo.q));

        this.torpedo.move(dx, dy);
        this.weaponLayer.draw();

        if(Date.now() > this.torpedo.timestamp + 3000){
            this.torpedo.dead = true;
            return false;
        }

        window.setTimeout($.proxy(this.moveTorpedo, this), 50);
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

    // Game.allCars.create({
    //     u : 0,
    //     direction : 0,
    //     master : true,
    //     currPosition : {
    //         x : Math.round(Math.random()*100), 
    //         y : Math.round(Math.random()*100)
    //     }
    // });

});