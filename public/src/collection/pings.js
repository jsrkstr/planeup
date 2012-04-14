Pings = Backbone.Collection.extend({

    // Specify the backend with which to sync
    backend: 'pings',

    roundTrip : [],

    oneWay : [],

    initialize: function() {
        // Setup default backend bindings
        this.bindBackend();

 		this.pingCount = 0;

 		this.doPing();

    },


    doPing : function() {
       	var ping = this.create({ id : Date.now() });
        ping.fetch({ 
       		success : $.proxy(this.success, this)
   		});

   		++this.pingCount;
    },


    success : function(model) {
    	this.roundTrip.push(Date.now() - model.id);
    	this.oneWay.push(model.get("timestamp") - model.id);

    	if(this.pingCount < 25)
    		this.doPing();
    	else
    		this.showResults();
    },


    showResults : function(){ 
    	console.log("Max Ping", _.max(this.roundTrip), _.max(this.oneWay));
    	console.log("Min Ping", _.min(this.roundTrip), _.min(this.oneWay));
    	this.roundTripAvg = _.reduce(this.roundTrip, function(memo, num){ return memo + num; }, 0) / this.roundTrip.length;
    	this.oneWayAvg = _.reduce(this.oneWay, function(memo, num){ return memo + num; }, 0) / this.oneWay.length;

    	console.log("Avg Ping", this.roundTripAvg, this.oneWayAvg);

    	this.trigger("completed");
    }

});