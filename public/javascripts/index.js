Game = {

    model : {},

    view : {},

    collection : {},

    mixin : {},

    allEntities : [],

    allCars : null,

    addEntity : function(entity){
        gs.addEntity(entity);
        this.allEntities.push(entity);
    },

    delEntity : function(entityModel) {
        gs.delEntity(entityModel.view);

        for(var i = this.allEntities.length-1; i >= 0; i--){
            if(this.allEntities[i].cid == entityModel.view.cid){
                this.allEntities.remove(this.allEntities[i]);
                break;
            }
        }
    }
};




Game.model.Car = Backbone.Model.extend({


    defaults : {
        health : 100
    },
    
    initialize: function(args) {
        this.master = false;

        if(args.master){
            this.master = true;
            this.set({master : false});
            // override set method to reject updates from backend/ accept updates only from update method
            this.oldSet = this.set;
            this.set = this.newSet;
        }

        this.view = new Game.view.CarView({model : this});
    },


    // local is true in case of local upadate ie not from backend
    newSet : function(attrs, options) {
        if(options && options.local)
            this.oldSet(attrs);
    }

    
});




Game.model.Bullet = Backbone.Model.extend({

    config : {
        damage : 10
    },
    
    initialize: function(args) {
        this.view = new Game.view.BulletView({model : this});
    }

});





Game.collection.Bullets = Backbone.Collection.extend({

    
    // Specify the backend with which to sync
    backend: 'bullets',

    model: Game.model.Bullet,

    initialize: function() {
        // Setup default backend bindings
        this.bindBackend();
    }

});






Game.collection.Cars = Backbone.Collection.extend({

    
    // Specify the backend with which to sync
    backend: 'cars',

    model: Game.model.Car,

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









// TODO  : should not create objs for each bullet instead used fixed no. say 5 and use them again.
Game.view.BulletView = Backbone.View.extend({

    type : "bullet",

    config : {
        radius : 3,
        t : 0.1,
        da : 5,
        u : 50,
        ttl : 1500
    },


    initialize: function(args) {
        Game.addEntity(this);
        this.model.set({ u : this.model.get("u") + this.config.u});// relative vel of bullet
        this.time = Date.now();
    },
    

    update : function() {
        var t = this.config.t, 
        u = this.model.get("u"),
        q = this.model.get("q"),
        currPos = this.model.get("pos");

        var a = u > 0 ? -this.config.da : this.config.da;

        var d = u * t + (a * Math.pow(t, 2))/2;
        var v = u + a * t;

        var dx = Math.round(d * Math.cos(q));
        var dy = Math.round(d * Math.sin(q));

        currPos.x += dx;
        currPos.y += dy;

        this.model.set({
           u :  v,
           pos : currPos
        });


        if(Date.now() - this.time > this.config.ttl){
            Game.delEntity(this.model);
        }
    },


    draw : function(context){
        var pos = this.model.get("pos");
        context.fillStyle = "#222";
        context.beginPath();
        context.arc(pos.x, pos.y, this.config.radius, 0, Math.PI * 2, true);
        context.fill();      
    },

    get_collision_circle : function() {
        var currPos = this.model.get("pos");
        return [[currPos.x, currPos.y], this.config.radius];
    },
    
    collide_circle : function(who) {
      Game.delEntity(this.model);
    }

});





Game.view.CarView = Backbone.View.extend({

    radius : 10,

    type : "plane",

    config : {
        vmax : 100,
        a : 100,
        da : 20
    },


    initialize: function(args) {
        Game.addEntity(this);

        // make car user controlled
        if(this.model.master)
            _.extend(this, Game.mixin.RemoteControlled);
        
        this.sprite = $("#" + args.model.get("team") + "-plane-image").clone()[0];

        this.bullets = new Game.collection.Bullets();
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
        }, 
        { 
            local : true
        });
            

        if(this.model.master)
            this.model.save();

        if(this.model.get("health") == 50){
            this.setWreckState();
            //console.log("dead");
        }
            //Game.delEntity(this.model);

    },


    setWreckState : function() {
        this.sprite = $("#" + this.model.get("team") + "-wreck-plane-image").clone()[0];
        this.setWreckState = function(){};
    },
    

    draw : function(context) {
        var currPos = this.model.get("currPosition");
        var angle = this.model.get("direction");


        var sourceX = 48 * Math.round(angle * 10);
        var sourceY = 0;
        var sourceWidth = 48;
        var sourceHeight = 48;
        var destWidth = sourceWidth;
        var destHeight = sourceHeight;
        var destX = currPos.x - 24;
        var destY = currPos.y - 24;

        context.drawImage(this.sprite, sourceX, sourceY, sourceWidth, sourceHeight, destX, destY, destWidth, destHeight);
    },


    get_collision_circle : function() {
        var currPos = this.model.get("currPosition");
        return [[currPos.x, currPos.y], 15];
    },
    
    collide_circle : function(who) {
      switch(who.type){
          case "bullet" : console.log("collided");
            this.model.set({health : this.model.get("health") - who.model.config.damage}, {local : true});
          break;
      }
    }
    
});



Game.view.World = function(gs) {

    this.update = function(){
        collide.circles(Game.allEntities, Game.allEntities);
    };

    this.draw = function(context) {
        gs.clear();
        gs.background('rgba(100, 100, 100, 1.0)');
    };
};





Game.mixin.RemoteControlled = {

    keyHeld_37 : function () {
        this.model.set({direction : this.model.get("direction") - 0.1 }, {local : true});
    },
        
    keyHeld_39 : function () {
        this.model.set({direction : this.model.get("direction") + 0.1 }, {local : true});
    },
        
    keyDown_38 : function () {
        this.model.set({a : 100}, {local : true});
    },

    keyUp_38 : function () {
        this.model.set({a : 0}, {local : true});
    },

    keyDown_40 : function () {
        this.model.set({a : -100}, {local : true});
    },

    keyUp_40 : function () {
        this.model.set({a : 0}, {local : true});
    },
        
    keyDown_32 : function () {
        //fire bullet
        var q = parseFloat(this.model.get('direction'));
        var currPos = this.model.get("currPosition");
        var u = parseFloat(this.model.get("u"));

        var c = {
            x : parseFloat(currPos.x) + (20 * Math.cos(q)),
            y : parseFloat(currPos.y) + (20 * Math.sin(q))
        };

        this.bullets.create({
            u : u,
            q : q,
            pos : c
        });
    }    
};




$(function() {

    var surface = document.getElementById("container");
    gs = new JSGameSoup(surface, 30);

    gs.addEntity(new Game.view.World(gs));

    Game.allCars = new Game.collection.Cars();




    // car2 = Game.allCars.create({
    //     u : 0,
    //     direction : Math.PI,
    //     master : false,
    //     team : "blue",
    //     currPosition : {
    //         x : gs.random(300, 100),
    //         y : gs.random(10, 100)
    //     }
    // });


    gs.launch();

});