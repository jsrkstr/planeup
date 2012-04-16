Game.model.Controller = Backbone.Model.extend({

	actionUpDown : 0,
	actionLeftRight : 0,
	lastCaptureInterval : 0,


    defaults : {
    	id : 0, // same as plane id
    	leftRight : 0,
    	upDown : 0,
    	timestamp : Date.now()
    },

    
    initialize: function(args) {

    	this.bind("change", this.applyActionsAfterTimeout, this); // got update( on capturing)

        this.bind("controller:update", this.onApply, this);
    },


	setActionLeftRight : function(value) {
        this.actionLeftRight = value;

        this.isChanged = true;
        this.captureActions();
    },


    setActionUpDown : function(value) {
        this.actionUpDown = value;

        this.isChanged = true;
        this.captureActions();
    },


    setActions : function(upDown, leftRight) {
        this.actionUpDown = upDown;
        this.actionLeftRight = leftRight;

        this.isChanged = true;
        this.captureActions();
    },


    captureActions : function() {

        if(this.isCaptured)
            return false; // if an action is captured, wait till it is applied

		this.save({
        	leftRight : this.actionLeftRight,
        	upDown : this.actionUpDown,
        	timestamp : this.plane.now()
    	});

		console.log("capturing", this.actionUpDown, this.actionLeftRight);

        if(this.needResetSave)
            this.needResetSave = false;

        if(this.isChanged) { 
            // reset values
            this.actionUpDown = 0;
            this.actionLeftRight = 0;
            this.needResetSave = true;
        }

        this.isChanged = false;

        // dnt touch
        this.isCaptured = true;

    },


    onApply : function(){
        //console.log("applied");
        this.isCaptured = false;

        if(this.needResetSave || this.isChanged)
            this.captureActions();
    },


    applyActionsAfterTimeout : function(){

        //if(!this.master)
            //console.log("got update", this.get("leftRight"), this.get("upDown"));

        var timeRemaining = this.plane.get("applyInterval") - (this.plane.now() - this.get("timestamp"));

        var self = this;

        window.setTimeout(function(){
            self.trigger("controller:update", self.toJSON());
        }, timeRemaining);

        // helper for master, to calulate next action at half time
        if(this.master && this.plane.AI){
            window.setTimeout(function(){
                self.trigger("controller:halftime");
            }, timeRemaining / 2);            
        }

    }

});