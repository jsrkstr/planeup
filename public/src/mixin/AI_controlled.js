Game.mixin.AIControlled = {

	INFINITY : 99999,	// Put a large number in here.

	// Plausible-move generator// generates one more level
	moveGen : function(move, player) {

		move.status = 0; /////////////

		var opponent = player == "p1" ? "p2" : "p1";

		// position after left move
		var pL = {
			x : move[player].currPosition.x + 20 * Math.cos(move[player].direction - 1),
			y : move[player].currPosition.y + 20 * Math.sin(move[player].direction - 1)
		}

		// position after right move
		var pR = {
			x : move[player].currPosition.x + 20 * Math.cos(move[player].direction + 1),
			y : move[player].currPosition.y + 20 * Math.sin(move[player].direction + 1)
		}

		var distLeft = Math.sqrt( Math.pow(move[opponent].currPosition.x - pL.x, 2) + Math.pow(move[opponent].currPosition.y - pL.y, 2)); // distance of p2 from next left move position
		var distRight = Math.sqrt( Math.pow(move[opponent].currPosition.x - pR.x, 2) + Math.pow(move[opponent].currPosition.y - pR.y, 2));

		// -1 for left 1 for right
		var leftRight = distLeft < distRight ? -1 : 1; //right or left

		move.children = new Array;

		var str = "";

		for(var i=0; i <= 1; i++) {
			for(var j=-1; j<=1; j++){

				if(j == -leftRight) // skip opposite of selected move(leftRight)
					continue;

				move.children.push({
					value : 0,
					action : [i, j], // upDown, leftRight arrow keys
					p1 : $.extend(true, {}, move.p1), // clone w/o reference
					p2 : $.extend(true, {}, move.p2),
					terminal : function(){return false;},
					DEPTH : move.DEPTH,
					evalFor : player
				}); // plausible up/down moves

				str+= [i, j] + " - ";

			}
		}

		console.log(str);
		move.terminal = function(){return false;};

		return move;
	},


	// Evaluation function
	evaluate : function(move, player){ // dnt give -ve value for other player.
		move.eval = true;

		var opponent = player == "p1" ? "p2" : "p1";

		// update player's actions
		move[player].actionUpDown = move.action[0];
		move[player].actionLeftRight = move.action[1];

		var originalDirection = move[player].direction;

		// update physics - get advance position of player
		move[player] = this.updatePhysics(move[player], Game.human.view.config, Game.human.get("applyInterval"));

		// compare advance position with opponent's position ( distance factor )
		var displacement = Math.sqrt( Math.pow(move[opponent].currPosition.x - move[player].currPosition.x, 2) + Math.pow(move[opponent].currPosition.y - move[player].currPosition.y, 2));

		var newDirection = move[player].direction;

		// (direction factor calculation)
		var diffY = move[opponent].currPosition.y - move[player].currPosition.y;
		var diffX = move[opponent].currPosition.x - move[player].currPosition.x;

		var slope = Math.atan(diffY / diffX);
		var lineDirection; // direction of line joining p1 p2
		
		if(diffY > 0){

			if(diffX > 0){ // 1 quadrant
				lineDirection = slope;
			} else { // 2
				lineDirection = Math.PI + slope;
			}

		} else {

			if(diffX > 0) { // 4
				lineDirection = 2*Math.PI - slope;
			} else { // 3			
				lineDirection = Math.PI + slope;
			}
		}

		var newDiff = Math.abs(lineDirection - newDirection);
		var oldDiff = Math.abs(lineDirection - originalDirection);


		if(newDiff < 0.52 && displacement < 400)
			move.action[2] = 1; // fire bullet
		else
			move.action[2] = 0;

		var directionFactor = 0;

		if(oldDiff > Math.PI){
			// highr diff goood 
			if(newDiff > oldDiff )
				directionFactor = +newDiff; // better
			else 
				directionFactor = -newDiff; // poor
		}
		else {
			// lower diff good
			if(newDiff < oldDiff )
				directionFactor = +newDiff; // better
			else 
				directionFactor = -oldDiff; // poor
		}

		// disabled
		//directionFactor = 0;


		directionFactor = Math.round( directionFactor * 3 ); // it can be -ve or +ve, it changes goodness of a move, range -62 - +62

		// displacement factor is always + but diretionfactor can be - and +
		move.value = this.INFINITY - Math.round(displacement) + directionFactor ; // more the displ worst the move

		move.df = directionFactor;
		move.disp = displacement;

		return (move.DEPTH%2 ? -1: 1) * move.value;
	},



	// player = 1 0r 2
	// Minimax algorithm
	minimax : function(move, depth, player){

		move.status = 1;
		move.DEPTH = move.DEPTH || depth; // save initial depth

		if((move.terminal)() == true || depth == 0)
			return this.evaluate(move, move.evalFor);

		move = this.moveGen(move, player);

		a = -this.INFINITY;
		var oppositePlayer = player == "p1" ? "p2" : "p1";

		for(var child = 0; child < move.children.length; child++){
				a = Math.max(a, -this.minimax(move.children[child], depth-1, oppositePlayer));// maximize
		}
		move.value = a;
		return a;
	},


	// AlphaBeta algorithm
	alphabeta : function(move, depth, player, alpha, beta){
		move.status = 1;

		move.DEPTH = move.DEPTH || depth; // save initial depth
		
		if((move.terminal)() == true || depth == 0)
			return this.evaluate(move, move.evalFor);

		move = this.moveGen(move, player);
		//this.showPlausibleMoves(move);

		var oppositePlayer = player == "p1" ? "p2" : "p1";

		if(move.children){
			for(var child = 0; child < move.children.length; child++){
				alpha = Math.max(alpha, -this.alphabeta(move.children[child], depth-1, oppositePlayer, -beta, -alpha));
				move.value = alpha;
				if(beta <= alpha){break;}
			}
		}
		return alpha;
	},


	getAction : function(move, value){
		var str= "";
		for(var i=0; i< move.children.length; i++){
			if(Math.abs(move.children[i].value) == Math.abs(value)){
				//console.log(move.children[i].action);
				return move.children[i].action;

				// if(move.children[i].children)
				// 	go(move.children[i], value);

				// break;
			}
		}
	},


	tree : function(move){
		var str= "";
		for(var i=0; i< move.children.length; i++){
			str += move.children[i].value + "-" + move.children[i].action + " ";
			if(move.children[i].children){
				this.tree(move.children[i]);
			}
		}
		console.log(str);
	},


	showPlausibleMoves : function(move){
		var str= "";
		for(var i=0; i< move.children.length; i++){
			str += move.children[i].action + " ";
			if(move.children[i].children){
				tree(move.children[i]);
			}
		}
		console.log(str);
	},


	updatePhysics : function(model, config, time) { // time in ms
        var t = 0.1;

        if(time)
            t = time / 300;

        // acceleration
        switch(model.actionUpDown) {

            case 1 :    model.a = model.u < 0 ? config.a + config.da : config.a; // up
                break;

            case -1 :   model.a = model.u > 0? -(config.a + config.da) : -config.a; // down
                break;

            case 0 :    if(model.u > 0) {
                            model.a = -config.da;
                        } else if(model.u < 0) {
                            model.a = config.da;
                        }
                break;
        }


        // velocity dependent turning radius

        var turnCoefficient = 300 / (Math.abs(model.u) + 1) ;// range 3 - 9

        turnCoefficient = turnCoefficient > 8 ? 8 : turnCoefficient;

        // direction
        switch(model.u > 0 ? model.actionLeftRight : 0) {
            case -1 :   model.direction -= turnCoefficient / 100; //0.05; // left
                break;

            case 1 :    model.direction += turnCoefficient / 100 //0.05; // right
                break;

            case 0 :    // do nothing
                break;
        }


        var d = model.u * t + (model.a * Math.pow(t, 2))/2;          
        var v = model.u + model.a * t;

        var ang = model.direction % (2 * Math.PI);

        model.u = v > config.vmax ? config.vmax : v;
        //model.u = v < -config.vmax ? -config.vmax : v;

        var dx = Math.round(d * Math.cos(model.direction));
        var dy = Math.round(d * Math.sin(model.direction));

        model.currPosition.x += dx;
        model.currPosition.y += dy;

    	if(model.currPosition.x < -20)
        	model.currPosition.x = 1180;

    	if(model.currPosition.x > 1220)
        	model.currPosition.x = 20;

        model.direction = ang < 0 ? 6.28 + ang : ang;
            
        return model;
	}

};