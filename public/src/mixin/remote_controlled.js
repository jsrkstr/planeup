Game.mixin.RemoteControlled = {

    lastBulletTime : 0,

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
        
    keyHeld_32 : function () {
        if(Date.now() - this.lastBulletTime < 200)
            return false;

        this.lastBulletTime = Date.now();
        this.keyDown_32();
    },


    keyDown_32 : function () {
        this.lastBulletTime = Date.now();

        //fire bullet
        var q = parseFloat(this.model.get('direction')) - 0.01;
        var currPos = this.model.get("currPosition");
        var u = parseFloat(this.model.get("u")) + 10;

        var c = {
            x : parseFloat(currPos.x) + (30 * Math.cos(q)),
            y : parseFloat(currPos.y) + (30 * Math.sin(q))
        };

        Game.bullets.create({
            id : Date.now(),
            u : u,
            q : q,
            pos : c
        });
    }
};