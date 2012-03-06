Game.view.World = Backbone.View.extend({

    initialize : function(args){
        this.gs = args.gs;
    },


    update : function(){
        collide.circles(Game.allEntities, Game.allEntities);
    },


    draw : function(context) {
        gs.clear();
        gs.background('rgba(100, 100, 100, 1.0)');
    }
});