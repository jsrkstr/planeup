Game.worker.bulletUpdate = worker(function update(u, q, currPos, config) {

    var t = config.t;

    var a = u > 0 ? -config.da : config.da;

    var d = u * t + (a * Math.pow(t, 2))/2;
    var v = u + a * t;

    var dx = Math.round(d * Math.cos(q));
    var dy = Math.round(d * Math.sin(q));

    currPos.x += dx;
    currPos.y += dy;
        
    var data = {
        v : v,
        currPos : currPos,
    };

    return data;
});



// TODO  : should not create objs for each bullet instead used fixed no. say 5 and use them again.
Game.view.BulletView = Backbone.View.extend({

    type : "bullet",

    config : {
        radius : 2,
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
        var u = this.model.get("u"),
        q = this.model.get("q"),
        currPos = this.model.get("pos");

        Game.worker.bulletUpdate(u, q, currPos, this.config).on("data", $.proxy(this.onUpdated, this));

    },


    onUpdated : function(data){

        this.model.set({
           u :  data.v,
           pos : data.currPos
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
