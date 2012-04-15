Pings = Backbone.Collection.extend({

    // Specify the backend with which to sync
    backend: 'pings',

    roundTrip : [],

    oneWay : [],

    serverTimeDiff : [],

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
        var roundTrip = Date.now() - model.id;
    	this.roundTrip.push(roundTrip);
    	this.oneWay.push(model.get("timestamp") - model.id);
        var serverTime = model.get("timestamp") + (roundTrip/2);
        this.serverTimeDiff.push(Date.now() - serverTime);

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

        this.serverTimeDiffAvg = _.reduce(this.serverTimeDiff, function(memo, num){ return memo + num; }, 0) / this.serverTimeDiff.length;

    	console.log("Avg Ping", this.roundTripAvg, this.oneWayAvg);

    	this.trigger("completed");
    }

});