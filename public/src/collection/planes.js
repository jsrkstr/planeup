Game.collection.Planes = Backbone.Collection.extend({

    
    // Specify the backend with which to sync
    backend: 'planes',

    model: Game.model.Plane,

    initialize: function() {
        // Setup default backend bindings
        //this.bindBackend();

        var self = this;

        this.bind('backend:create', function(model) {
            window.setTimeout($.proxy(function(){
                this.add(model);
            }, this), 1000);
        }, this);

        this.bind('backend:update', function(model) {
            window.setTimeout($.proxy(function(){
                this.get(model.id).set(model);
            }, this), 1000);
        }, this);

        this.bind('backend:update', this.addExistingPlane, this);
    },


    addExistingPlane : function(model) {
        if(!this.get(model.id)){
            this.add(model);
        }
    }

});