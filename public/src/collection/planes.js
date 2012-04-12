Game.collection.Planes = Backbone.Collection.extend({

    
    // Specify the backend with which to sync
    backend: 'planes',

    model: Game.model.Plane,

    initialize: function() {
        // Setup default backend bindings
        this.bindBackend();

        this.bind('backend:update', this.addExistingPlane, this);
    },


    addExistingPlane : function(model) {
        if(!this.get(model.id)){
            this.add(model);
        }
    }

});