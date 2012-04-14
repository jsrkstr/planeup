Game.model.Plane = Backbone.Model.extend({


    defaults : {
        health : 100,
        capturedActions : {
            actionUpDown : 0,
            actionLeftRight : 0
        }
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

        this.view = new Game.view.PlaneView({model : this});

        this.lastCaptureTime = Date.now();

        this.actionLeftRight = 0;
        this.actionUpDown = 0;
        this.updateCount = 0;
    },


    // local is true in case of local upadate ie not from backend
    newSet : function(attrs, options) {
        if(options && options.local)
            this.oldSet(attrs);
    },


    isMaster : function(){
        return this.master;
    },


    setActionLeftRight : function(actionLeftRight) {
        this.actionLeftRight = actionLeftRight;
        this.is_changedd = true;
    },


    setActionUpDown : function(actionUpDown) {
        this.actionUpDown = actionUpDown;
        this.is_changedd = true;  
    },


    captureActions : function(){
        this.lastCaptureTime = Date.now();

        if(this.is_changedd == false)
            return false;

        this.set({ 
            capturedActions : {
                actionUpDown : this.actionUpDown,
                actionLeftRight : this.actionLeftRight
            },
            captureTimestamp : Date.now(),
            updateNo : this.updateCount
        }, {local : true});

        this.updateCount++;

        console.log("capturing", this.actionLeftRight, this.actionUpDown);
        this.save();

        this.is_changedd = false;
        this.is_captured = true;

        // reset actions
        // this.setActionUpDown(0);
        // this.setActionLeftRight(0);
    },


    applyActions : function() {
        if(this.is_captured != true)
            return false;

        var timeRemaining = 400 - (Date.now() - this.get("captureTimestamp") );

        window.setTimeout(
            $.proxy(function() {

                if(!this.get("capturedActions"))
                    return false;

                console.log("applying", Date.now(), this.get("capturedActions").actionLeftRight, this.get("capturedActions").actionUpDown);
                console.log("updateNo", this.get("updateNo"));
                this.set({
                    actionLeftRight : this.get("capturedActions").actionLeftRight,
                    actionUpDown : this.get("capturedActions").actionUpDown
                }, {local : true});

            }, this)
        , timeRemaining);

        this.is_captured = false;


    }

    
});