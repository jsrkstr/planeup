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

    	this.bind("change", function(){

    		if(!this.master)
    			console.log("got update", this.get("leftRight"), this.get("upDown"));

    		var timeRemaining = this.plane.get("applyInterval") - (Date.now() - this.get("timestamp"));

    		var self = this;

    		window.setTimeout(function(){
    			self.trigger("controller:update", self.toJSON());
    		}, timeRemaining);
    		
    	}, this);
    },


	setActionLeftRight : function(value) {
        this.actionLeftRight = value;
        this.captureActions();
    },


    setActionUpDown : function(value) {
        this.actionUpDown = value;
        this.captureActions();
    },


    captureActions : function() {
    	var timeRemaining = this.plane.get("captureInterval") - (Date.now() - this.lastCaptureInterval);

    	if(timeRemaining <= 0) {

    		// if(this.plane.isMaster())
    		// 	this.plane.save();
    		
    		this.save({
            	leftRight : this.actionLeftRight,
            	upDown : this.actionUpDown,
            	timestamp : Date.now()
        	});

        	this.lastCaptureInterval = Date.now();

    		console.log("capturing", this.actionLeftRight, this.actionUpDown);

    	} else {

    		var self = this;

    		setTimeout(function() {
    			self.captureActions();
    		}, timeRemaining);
    	}

    }

});