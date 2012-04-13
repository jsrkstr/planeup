Game.worker.planeUpdate = worker(function update(a, u, q, currPos, config) {
    var t = 0.1;

    // acceleration
    if(a == 100) {
        a = u < 0 ? config.a + config.da : config.a;

    } else if(a == -100) {
        a = u > 0? -(config.a + config.da) : -config.a;

    } else { // brakes

        if(u > 0) {
            a = -config.da;
        } else if(u < 0) {
            a = config.da;
        }
    }


    var d = u * t + (a * Math.pow(t, 2))/2;          
    var v = u + a * t;

    var ang = q % (2 * Math.PI);

    u = v > config.vmax ? config.vmax : v;

    var dx = Math.round(d * Math.cos(q));
    var dy = Math.round(d * Math.sin(q));

    currPos.x += dx;
    currPos.y += dy;

    if(ang < 0)
        angle = 6.28 + ang;
    else 
        angle = ang;
        
    var data = {
        a : a,
        u : u,
        currPos : currPos,
        angle : angle
    };

    return data;
});









Game.view.PlaneView = Backbone.View.extend({

    radius : 10,

    type : "plane",

    tail : [], // list of smoke clouds

    config : {
        vmax : 100,
        a : 100,
        da : 20,
    },


    initialize: function(args) {
        Game.addEntity(this);

        // make plane user controlled
        if(this.model.master)
            _.extend(this, Game.mixin.RemoteControlled);
        
        this.sprite = {
            healthy : $("#" + args.model.get("team") + "-plane-image")[0],
            dead : $("#" + this.model.get("team") + "-wreck-plane-image")[0]
        };

        this.smokeInterval = 6;
        this.smokeStep = 1;
        this.smokeIndex = 0;

        // add some clouds
        for(var i = 0; i < 5; i++){
            this.tail.push(new Game.model.Smoke());
        }

        statemachine(this);
        this.set_state("healthy");

        this.model.bind("change:health", this.onHealthChanged, this);
        this.model.bind("change", this.onChangeTime, this);

    },
    

    update : function() {


        var a = this.model.a || 0,
        u = this.model.get("u"),
        q = this.model.direction || this.model.get("direction"),
        currPos = this.model.get("currPosition");

        Game.worker.planeUpdate(a, u, q, currPos, this.config).on("data", $.proxy(this.onUpdated, this));

    },


    onUpdated : function(data){

        this.model.set({
            a : data.a,
            u : data.u,
            currPosition : data.currPos,
            direction : data.angle
        }, 
        { 
            local : true
        });
            

        this.sync();

            //Game.delEntity(this.model);    
    },


    sync : function(){

        this.tick = this.tick || 0;

        if(this.model.master && this.tick == 2){
            this.model.set({"time" : Date.now() }, {local : true});// only for test purpose
            this.model.save();
            this.tick = 0;
        } else {
            this.tick++;
        }
    },


    // for test purpose only
    onChangeTime : function(){
        console.log("Ping", Date.now()-this.model.get("time"));
    },



    onHealthChanged : function(){
        h = this.model.get("health");

        if(h < 50){
            if(h > 0)
                this.set_state("injured"); 
            else
                this.set_state("dead"); 
        } else {
            this.set_state("healthy"); 
        }
    },
    

    healthy_draw : function(context) {
        this.drawPlane(context, "healthy");
        this.drawSmoke(context, "white", this.model.get("currPosition"));
    },


    injured_draw : function(context){
        this.drawPlane(context, "healthy"); 
        this.drawSmoke(context, "black", this.model.get("currPosition"));
    },


    dead_draw : function(context){
        this.drawPlane(context, "dead");
        this.drawSmoke(context, "black", this.model.get("currPosition"));
    },


    drawPlane : function(context, state){
        var attrs = this.model.toJSON();

        var sprite = this.sprite[state];
        var sourceX = 48 * Math.round(attrs.direction * 10);
        var sourceY = 0;
        var sourceWidth = 48;
        var sourceHeight = 48;
        var destWidth = sourceWidth;
        var destHeight = sourceHeight;
        var destX = attrs.currPosition.x - 24;
        var destY = attrs.currPosition.y - 24; 

        context.drawImage(sprite, sourceX, sourceY, sourceWidth, sourceHeight, destX, destY, destWidth, destHeight);
    },


    drawSmoke : function(context, color, pos){
            
        if(this.smokeStep == this.smokeInterval){
            
            var cloud = this.tail[this.smokeIndex];
            cloud.set({ 
                color : color,
                pos : {
                    x : pos.x,
                    y : pos.y
                }
            });

            if(this.smokeIndex == 4)
                this.smokeIndex = 0;
            else 
                this.smokeIndex++;

            this.smokeStep = 1;
        } else {
            this.smokeStep++;
        }
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