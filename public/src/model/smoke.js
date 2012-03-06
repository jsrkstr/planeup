Game.model.Smoke = Backbone.Model.extend({
   initialize : function(){
       this.view = new Game.view.SmokeView({model : this});
   } 
});