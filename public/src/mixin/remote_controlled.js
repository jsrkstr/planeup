Game.mixin.RemoteControlled = {

    lastBulletTime : 0,

    // keyDown_37 : function () {
    //     this.model.controller.setActionLeftRight(-1); // left
    // },
        
    // keyDown_39 : function () {
    //     this.model.controller.setActionLeftRight(1); // right
    // },

    keyHeld_37 : function () {
        this.model.controller.setActionLeftRight(-1); // left
    },
        
    keyHeld_39 : function () {
        this.model.controller.setActionLeftRight(1); // right
    },

    // keyUp_37 : function () {
    //     this.model.controller.setActionLeftRight(0);
    // },
        
    // keyUp_39 : function () {
    //     this.model.controller.setActionLeftRight(0);
    // },

    // keyDown_38 : function () {
    //     this.model.controller.setActionUpDown(1); // up
    // },

    keyHeld_38 : function () {
        this.model.controller.setActionUpDown(1); // up
    },

    // keyUp_38 : function () {
    //     this.model.controller.setActionUpDown(0);
    // },

    keyDown_40 : function () {
        this.model.controller.setActionUpDown(-1); // down
    },

    // keyUp_40 : function () {
    //     this.model.controller.setActionUpDown(0);
    // },
        
    keyHeld_32 : function () {
        this.model.fireBullet();
    },


    keyDown_32 : function () {
        this.model.fireBullet();
    },

    keyHeld_16 : function () {
        this.model.fireBullet();
    },


    keyDown_16 : function () {
        this.model.fireBullet();
    }
};