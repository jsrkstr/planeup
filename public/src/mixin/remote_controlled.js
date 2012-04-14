Game.mixin.RemoteControlled = {

    keyDown_37 : function () {
        this.model.controller.setActionLeftRight(-1); // left
    },
        
    keyDown_39 : function () {
        this.model.controller.setActionLeftRight(1); // right
    },

    keyUp_37 : function () {
        this.model.controller.setActionLeftRight(0);
    },
        
    keyUp_39 : function () {
        this.model.controller.setActionLeftRight(0);
    },

    keyDown_38 : function () {
        this.model.controller.setActionUpDown(1); // up
    },

    keyUp_38 : function () {
        this.model.controller.setActionUpDown(0);
    },

    keyDown_40 : function () {
        this.model.controller.setActionUpDown(-1); // down
    },

    keyUp_40 : function () {
        this.model.controller.setActionUpDown(0);
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