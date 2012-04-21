Game.model.Bullet = Backbone.Model.extend({

    config : {
        damage : 5
    },
    
    initialize: function(args) {
        this.view = new Game.view.BulletView({model : this});
    }

});