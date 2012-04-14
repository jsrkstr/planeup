Game.mixin.RemoteControlled = {

    keyDown_37 : function () {
        this.model.set({actionLeftRight : -1}, {local : true}); // left
    },
        
    keyDown_39 : function () {
        this.model.set({actionLeftRight : 1}, {local : true}); // right
    },

    keyUp_37 : function () {
        this.model.set({actionLeftRight : 0}, {local : true}); // reset
    },
        
    keyUp_39 : function () {
        this.model.set({actionLeftRight : 0}, {local : true}); // reset
    },

    keyDown_38 : function () {
        this.model.set({actionUpDown : 1}, {local : true}); // up
    },

    keyUp_38 : function () {
        this.model.set({actionUpDown : 0}, {local : true}); // reset
    },

    keyDown_40 : function () {
        this.model.set({actionUpDown : -1}, {local : true}); // down
    },

    keyUp_40 : function () {
        this.model.set({actionUpDown : 0}, {local : true}); // reset
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