Game.model.Plane = Backbone.Model.extend({


    defaults : {
        health : 100,
        capturedActions : {
            actionUpDown : 0,
            actionLeftRight : 0
        },
        captureInterval : 400,
        applyInterval : 400
    },
    
    initialize: function(args) {
        this.master = false;

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

        console.log("applying", this.now(), controller.leftRight, controller.upDown);

        this.set({
            actionLeftRight : controller.leftRight,
            actionUpDown : controller.upDown
        }, {local : true});
    },


    now : function() {
        return Math.round(Date.now() - this.get("serverTimeDiffAvg"));
    }

    
});