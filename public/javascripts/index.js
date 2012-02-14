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
        vmax : 5
    },

    context : null,

    canvas : null,
    
    initialize: function(args) {

        // setup new layer with a car
        this.layer = new Kinetic.Layer();

        this.car = new Kinetic.Shape(function(){
            var context = this.getContext();
            context.fillStyle = "#666";
            context.beginPath();
            context.arc(0, 0, 5, 0, Math.PI * 2, true);
            context.fill();
        });

        this.layer.add(this.car);

        Game.stage.add(this.layer);
        // setup new layer with a car

        if(this.model.master){
            Game.board.on('mousedown', $.proxy(this.turn, this));
            Game.board.on('mouseup', $.proxy(this.stopTurn, this));
        }

        this.model.bind("change", this.render, this);

        this.mousePosition = {
            x : 0, 
            y : 0
        };

        window.setInterval($.proxy(this.engine, this), 50);
    },
    

    render: function() {
        var currPosition = this.model.get("currPosition");
        this.car.setPosition(currPosition.x, currPosition.y);
        this.layer.draw();
        return this;
    },


    turn : function(evt){
        if(!evt){
            evt = document.event;
        }

        this.mousePosition.x = evt.layerX;
        this.mousePosition.y = evt.layerY;
    },


    stopTurn : function(){
        this.mousePosition.x = this.mousePosition.y = 0;
    },


    engine : function() {

        var a = 5, da = 1, t = 0.05;

        var curr= this.model.get("currPosition");
        var currPos = {
            x : curr.x,
            y : curr.y
        };

        var u = this.model.get("u");

        var dy = this.mousePosition.y - currPos.y;
        var dx = this.mousePosition.x - currPos.x;      
           
        if(this.mousePosition.x != 0){ 
            // accelerate
            var ax = a * ( dx/ Math.sqrt(Math.pow(dx,2)+Math.pow(dy,2)));
            var ay = a * ( dy/ Math.sqrt(Math.pow(dx,2)+Math.pow(dy,2)));
        } else {
            // apply brakes
            var ax = u.x > 0 ? -da : da;  // sign of ux
            var ay = u.y > 0 ? -da : da;
        }

        // calculate velocity
        var vx = u.x + ax * t;
        var vy = u.y + ay * t;
             
        // limit max velocity
        if(Math.abs(vx) > this.config.vmax)
            vx = vx > 0 ? this.config.vmax : -this.config.vmax;
        
        if(Math.abs(vy) > this.config.vmax)
            vy = vy > 0 ? this.config.vmax : -this.config.vmax;


        // set new velocities
        u.x = vx;
        u.y = vy;

        // velocity is distance travelled per unit time
        var stepX = Math.round(vx); // distance travelled in unit time
        var stepY = Math.round(vy); 
                
        currPos.x += stepX;
        currPos.y += stepY; 

        this.model.set({
            u : u,
            currPosition : currPos
        });

        if(this.model.master)
            this.exhaust();
        
    },


    exhaust : function() {
        this.model.save();
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

    // game.allCars.create({
    //     currPosition : {
    //         x : 100, 
    //         y : 100
    //     },
    //     u : {
    //         x : 0,
    //         y : 0
    //     }
    // });

});