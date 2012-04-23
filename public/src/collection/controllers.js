Game.collection.Controllers = Backbone.Collection.extend({

    
    // Specify the backend with which to sync
    backend: 'controllers',

    model: Game.model.Controller,

    initialize: function() {
        // Setup default backend bindings
        //this.bindBackend();

        this.bind('backend:update', function(model) {
        
            window.setTimeout($.proxy(function(){ // introduce fake lag

                var m = this.get(model.id);
                if(m)
                    m.set(model);
                else 
                    this.add(model);

            }, this), 50);
            
        }, this);
        
        this.bind('backend:update', this.addExistingController, this);
    },


    addExistingController : function(model) {
        // if(!this.get(model.id)){
        //     this.add(model);
        // }
    }

});