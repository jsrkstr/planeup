Game = _.extend({

    model : {},

    view : {},

    collection : {},

    mixin : {},

    worker : {},

    allEntities : [],

    allPlanes : null,

    appReadyStatus : false,

    // accepts backbone view
    addEntity : function(entity){
        gs.addEntity(entity);
        this.allEntities.push(entity);
    },


    // accepts backbone model
    delEntity : function(entityModel) {
        gs.delEntity(entityModel.view);

        for(var i = this.allEntities.length-1; i >= 0; i--){
            if(this.allEntities[i].cid == entityModel.view.cid){
                this.allEntities.remove(this.allEntities[i]);
                break;
            }
        }
    },


    // callback =>  function to be called when App is initialized
    onReady : function(callback) {
        if(Game.appReadyStatus == true) {

          callback();
        } else {

            Game.bind("ready", callback);
        }
    }

}, Backbone.Events);





// Action starts here....
Game.onReady(function(){

    var surface = document.getElementById("container");
    gs = new JSGameSoup(surface, 30);

    gs.addEntity(new Game.view.World(gs));

    Game.allPlanes = new Game.collection.Planes();

    Game.allControllers = new Game.collection.Controllers();

    Game.bullets = new Game.collection.Bullets();

    var team = Math.random() > 0.5 ? "red" : "blue";
    var d = team == "red"? 0 : Math.PI;


    // Game.pingTest = new Pings().bind("completed", function(){

    //     Game.allPlanes.create({
    //         a : 0,
    //         id : Date.now(),
    //         u : 0,
    //         direction : d,
    //         master : true,
    //         team : team,
    //         currPosition : {
    //             x : gs.random(300, 100),
    //             y : gs.random(10, 100)
    //         }
    //     });

    // });


    gs.launch();

});




// for now, game is ready when dom is ready
$(function() {  
    Game.trigger("ready");
});