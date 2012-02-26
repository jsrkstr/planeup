var Car = Backbone.Model.extend({
    
    initialize: function(args) {
        this.master = false;

        if(args.master){
            this.master = true;
            this.set({master : false});
        }

        this.view = new CarView({model : this});
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
    }

});





var CarView = Backbone.View.extend({

    radius : 10,

    config : {
        vmax : 100,
        a : 100,
        da : 30
    },


    initialize: function(args) {
        gs.addEntity(this);
        Game.allCarViews.push(this);
    },
    

    update : function() {

        var t = 0.1, 
        a = this.model.get("a") || 0,
        u = this.model.get("u"),
        q = this.model.get("direction"),
        currPos = this.model.get("currPosition");

        // acceleration
        if(a == 100) {
            a = u < 0 ? this.config.a + this.config.da : this.config.a;

        } else if(a == -100) {
            a = u > 0? -(this.config.a + this.config.da) : -this.config.a;

        } else { // brakes

            if(u > 0) {
                a = -this.config.da;
            } else if(u < 0) {
                a = this.config.da;
            }
        }


        var d = u * t + (a * Math.pow(t, 2))/2;          
        var v = u + a * t;
    
        var ang = q % (2 * Math.PI);

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
            a : a,
            u : u,
            currPosition : currPos,
            direction : angle
        });

    },
    

    draw : function(context) {
        var currPos = this.model.get("currPosition");
        var angle = this.model.get("direction");
        var team = this.model.get("team");

        var carImage = document.getElementById(team + "-plane-image");// $("#red-car-image").clone()[0];


        var sourceX = 48 * Math.round(angle * 10);
        var sourceY = 0;
        var sourceWidth = 48;
        var sourceHeight = 48;
        var destWidth = sourceWidth;
        var destHeight = sourceHeight;
        var destX = currPos.x;
        var destY = currPos.y;

        context.drawImage(carImage, sourceX, sourceY, sourceWidth, sourceHeight, destX, destY, destWidth, destHeight);
    },


    get_collision_circle : function() {
        var currPos = this.model.get("currPosition");
        return [[currPos.x, currPos.y], 15];
    },
    
    collide_circle : function(who) {
      console.log("collision!!");
    },


    keyDown_37 : function () {
        this.model.set({direction : this.model.get("direction") - 0.1 });
    },
        
    keyDown_39 : function () {
        this.model.set({direction : this.model.get("direction") + 0.1 });
    },
        
    keyHeld_37 : function () {
        this.model.set({direction : this.model.get("direction") - 0.1 });
    },
        
    keyHeld_39 : function () {
        this.model.set({direction : this.model.get("direction") + 0.1 });
    },
        
    keyDown_38 : function () {
        this.model.set({a : 100});
    },

    keyUp_38 : function () {
        this.model.set({a : 0});
    },

    keyDown_40 : function () {
        this.model.set({a : -100});
    },

    keyUp_40 : function () {
        this.model.set({a : 0});
    },
        
    keyDown_32 : function () {
        //fire bullet
        //gs.addEntity(new Bullet(this.x + 12 * Math.sin(this.angle), this.y - 12 * Math.cos(this.angle), this.angle, this.speed, true));
    },

    keyDown : function (keyCode) {
        console.log(keyCode);
    }
    
});



function World(gs) {

    this.update = function(){
        collide.circles(Game.allCarViews, Game.allCarViews);
    };

    this.draw = function(context) {
        gs.clear();
        gs.background('rgba(100, 100, 100, 1.0)');
    };
}




$(function() {

    var surface = document.getElementById("container");
    gs = new JSGameSoup(surface, 30);

    gs.addEntity(new World(gs));



    Game = {};

    Game.allCars = new Cars();

    Game.allCarViews = [];

    car1 = Game.allCars.create({
        u : 0,
        direction : 0,
        master : true,
        team : "red",
        currPosition : {
            x : gs.random(10, 100),
            y : gs.random(10, 100)
        }
    });


    car2 = Game.allCars.create({
        u : 0,
        direction : Math.PI,
        master : false,
        team : "blue",
        currPosition : {
            x : gs.random(300, 100),
            y : gs.random(10, 100)
        }
    });


    gs.launch();

});