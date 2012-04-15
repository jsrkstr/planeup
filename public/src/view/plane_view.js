Game.worker.planeUpdate = worker(function update(model, config) {
    var t = 0.1;

    // acceleration
    switch(model.actionUpDown) {

        case 1 :    model.a = model.u < 0 ? config.a + config.da : config.a; // up
            break;

        case -1 :   model.a = model.u > 0? -(config.a + config.da) : -config.a; // down
            break;

        case 0 :    if(model.u > 0) {
                        model.a = -config.da;
                    } else if(model.u < 0) {
                        model.a = config.da;
                    }
            break;
    }

    // direction
    switch(model.actionLeftRight) {
        case -1 :   model.direction -= 0.05; // left
            break;

        case 1 :    model.direction += 0.05; // right
            break;

        case 0 :    // do nothing
            break;
    }


    var d = model.u * t + (model.a * Math.pow(t, 2))/2;          
    var v = model.u + model.a * t;

    var ang = model.direction % (2 * Math.PI);

    model.u = v > config.vmax ? config.vmax : v;

    var dx = Math.round(d * Math.cos(model.direction));
    var dy = Math.round(d * Math.sin(model.direction));

    model.currPosition.x += dx;
    model.currPosition.y += dy;

    model.direction = ang < 0 ? 6.28 + ang : ang;
        
    return model;
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
        this.model.bind("change:time", this.onChangeTime, this);

        this.updateCount = 0;
    },
    

    update : function() {
        ++this.updateCount;

        if(this.updateCount == 100 && this.model.isMaster()){
            console.log("plane sync");
            this.model.save();
            this.updateCount = 0;
        }

        var model = this.model.toJSON();
        Game.worker.planeUpdate(model, this.config).on("data", $.proxy(this.onUpdated, this));

    },


    onUpdated : function(model){

        // as this function is async so it overrides the changed values of model, that were changed between sync
        // time, hence we restore original values

        // model.actionLeftRight = this.model.get("actionLeftRight");
        // model.actionUpDown = this.model.get("actionUpDown");

        this.model.set(model, {local : true});
    },


    // for test purpose only
    onChangeTime : function(){
        //console.log("Ping", Date.now()-this.model.get("time"));
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