Game.view.SmokeView = Backbone.View.extend({

    spriteLength : {
        "black" : 256,
        "white" : 512
    },

    initialize : function() {
        this.model.bind("change", this.render, this);
    },


    render : function(){
        this.sourceX = 0;
        this.sprite = $("#"+ this.model.get("color") +"-smoke-image")[0];
        Game.addEntity(this);  
    },

    
    update : function() {
        this.sourceX += 16;
        if(this.sourceX == this.spriteLength[this.model.get("color")] ){
            Game.delEntity(this.model);
            Game.trash(this);
        }
    },


    draw : function(context){
        var pos = this.model.get("pos");

        var sourceX = this.sourceX;
        var sourceY = 0;

        var sourceWidth = 16;
        var sourceHeight = 16;
        var destWidth = sourceWidth;
        var destHeight = sourceHeight;
        var destX = pos.x;
        var destY = pos.y;

        context.drawImage(this.sprite, sourceX, sourceY, sourceWidth, sourceHeight, destX, destY, destWidth, destHeight);      
    }

});