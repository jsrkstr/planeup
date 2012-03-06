Game.mixin.RemoteControlled = {

    keyHeld_37 : function () {
        this.model.direction = this.model.get("direction") - 0.1;
    },
        
    keyHeld_39 : function () {
        this.model.direction = this.model.get("direction") + 0.1;
    },
        
    keyDown_38 : function () {
        this.model.a = 100;
    },

    keyUp_38 : function () {
        this.model.a  = 0;
    },

    keyDown_40 : function () {
        this.model.a = -100;
    },

    keyUp_40 : function () {
        this.model.a = 0;
    },
        
    keyDown_32 : function () {
        //fire bullet
        var q = parseFloat(this.model.get('direction'));
        var currPos = this.model.get("currPosition");
        var u = parseFloat(this.model.get("u"));

        var c = {
            x : parseFloat(currPos.x) + (20 * Math.cos(q)),
            y : parseFloat(currPos.y) + (20 * Math.sin(q))
        };

        Game.bullets.create({
            id : Date.now(),
            u : u,
            q : q,
            pos : c
        });
    }    
};