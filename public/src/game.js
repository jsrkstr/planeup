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
    },


    trash : function(obj){
        obj = null;
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


    Game.pingTest = new Pings().bind("completed", function(){

        Game.human = Game.allPlanes.create({
            a : 0,
            id : Date.now(),
            u : 0,
            direction : Math.PI,
            master : true,
            AI : false, 
            team : "blue",
            currPosition : {
                x : gs.random(300, 400),
                y : gs.random(400, 600)
            },
            serverTimeDiffAvg : Game.pingTest.serverTimeDiffAvg
        });


        Game.AI = Game.allPlanes.create({
            a : 0,
            id : Date.now() + 100000,
            u : 0,
            direction : 0,
            master : true,
            AI : true, 
            team : "red",
            currPosition : {
                x : gs.random(100, 300),
                y : gs.random(10, 100)
            },
            serverTimeDiffAvg : Game.pingTest.serverTimeDiffAvg
        });


    });


    gs.launch();

});




// for now, game is ready when dom is ready
$(function() {  
    Game.trigger("ready");
});