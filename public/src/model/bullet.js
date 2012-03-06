Game.model.Bullet = Backbone.Model.extend({

    config : {
        damage : 10
    },
    
    initialize: function(args) {
        this.view = new Game.view.BulletView({model : this});
    }

});