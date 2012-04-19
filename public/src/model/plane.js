Game.model.Plane = Backbone.Model.extend({


    defaults : {
        health : 100,
        capturedActions : {
            actionUpDown : 0,
            actionLeftRight : 0
        },
        captureInterval : 320,
        applyInterval : 320
    },
    
    initialize: function(args) {
        this.master = false;

        if(args.AI){
            this.AI = true;
            this.set({AI : false});
        } else {
            this.AI = false;
        }

        if(args.master){
            this.master = true;
            this.set({master : false});
            // override set method to reject updates from backend/ accept updates only from update method
            this.oldSet = this.set;
            this.set = this.newSet;

            // this.set({
            //     captureInterval : Game.pingTest.roundTripAvg + 100,
            //     applyInterval : Game.pingTest.roundTripAvg + 100
            // }, {local : true});

            this.controller = Game.allControllers.create({ id : this.id }); // create controller

        } else {
            this.controller = Game.allControllers.get(this.id);
        }

        this.controller.bind("controller:update", this.applyActions, this);

        this.controller.master = this.master;
        this.controller.plane = this;

        // AI stuff //
        var self = this;

        if(this.AI){
            _.extend(this, Game.mixin.AIControlled)

            // first AI action
            window.setTimeout(function() {
                self.getAIUpdate();
            }, 2000);

            this.controller.bind("controller:halftime", this.getAIUpdate, this);
        }

        // AI stuff //


        this.view = new Game.view.PlaneView({model : this});
    },


    // local is true in case of local upadate ie not from backend
    newSet : function(attrs, options) {
        if(options && options.local)
            this.oldSet(attrs);
    },


    isMaster : function(){
        return this.master;
    },


    applyActions : function(controller) {

        //console.log("applying", this.now(), controller.leftRight, controller.upDown);

        this.set({
            actionLeftRight : controller.leftRight,
            actionUpDown : controller.upDown
        }, {local : true});
    },


    now : function() {
        return Math.round(Date.now() - this.get("serverTimeDiffAvg"));
    },


    getAIUpdate : function() {
        var currMove = {
            value : 0,
            p1 : this.toJSON(),
            p2 : Game.human.toJSON(),
            terminal : function(){return false;},
            action : []
        }


        var curr = this.get("currPosition");
        var currP2 = Game.human.get("currPosition");
        var d = this.get("direction");


        var value = this.alphabeta(currMove, 1, "p1", -this.INFINITY, this.INFINITY);

        var action = this.getAction(currMove, value);

        console.log("P1", Math.round(curr.x), Math.round(curr.y), Math.round(d), "->", currMove, action.toString());

        // if(this.count == 10)
        //     return false;

        // this.count++;

        this.onAIUpdate(action);
    },


    onAIUpdate : function(action){

        // perform action
        this.controller.setActions(action[0], action[1]);

    },


    count : 0



    
});