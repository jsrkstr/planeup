Game.collection.Bullets = Backbone.Collection.extend({

    
    // Specify the backend with which to sync
    backend: 'bullets',

    model: Game.model.Bullet,

    initialize: function() {
        // Setup default backend bindings
        this.bindBackend();
        
        this.bind('backend:update', this.addExistingBullet, this);
    },

    addExistingBullet : function(model) {
        if(!this.get(model.id)){
            this.add(model);
        }
    }

});