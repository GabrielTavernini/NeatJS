var maxScore = 0;
var MAX_SPEED = 5;

//The interface between our 
//NeuralNetwork and the game 
class Player{
	constructor(squad){
		this.brain = new Genome(genomeInputsN, genomeOutputN);
		this.fitness;
		this.score = 1;
		this.lifespan = 0;
		this.dead = false;
		this.decisions = []; //Current Output values
		this.vision = []; //Current input values


		//Game Stuff
		switch(squad) {
			case 0:
				this.x = 20;
				this.y = 20;
				break;
			case 1:
				this.x = 20;
				this.y = height - 20;
				break;
			case 2:
				this.x = width - 20;
				this.y = 20;
				break;
			case 3:
				this.x = width - 20;
				this.y = height - 20;
				break;
		}

		this.vx = 0;
		this.vy = 0;

		this.radius = 7;
		this.squad = squad;
	}

	clone() { //Returns a copy of this player
		let clone = new Player(this.squad);
		clone.brain = this.brain.clone();
		return clone;
	}

	crossover(parent){ //Produce a child
		let child = new Player(this.squad);
		if(parent.fitness < this.fitness)
			child.brain = this.brain.crossover(parent.brain);
		else
			child.brain = parent.brain.crossover(this.brain);

		child.brain.mutate()
		return child;
	}


	//Game stuff
	look(){
		//Look and normalize
		var dist = Math.sqrt(this.x, this.y, target.x, target.y) / Math.sqrt(width**2 + height**2);
		var targetAngle = this.angleToPoint(this.x, this.y, target.x, target.y) / Math.PI * 2;
		var vx = (this.vx + MAX_SPEED) / MAX_SPEED;
		var vy = (this.vy + MAX_SPEED) / MAX_SPEED;

		// NaN checking
		targetAngle = isNaN(targetAngle) ? 0 : targetAngle;
		dist = isNaN(dist) ? 0 : dist;
		this.vision = [vx, vy, dist, targetAngle];
	}

	think(){
		this.decisions = this.brain.feedForward(this.vision);
	}

	move(){
		var moveAngle = this.decisions[0] * 2 * Math.PI;

		// Calculate next position
		let ax = Math.cos(moveAngle);
		let ay = Math.sin(moveAngle);
		this.vx += ax;
		this.vy += ay;

		// Limit speeds to maximum speed
		this.vx = this.vx > MAX_SPEED ? MAX_SPEED : this.vx < -MAX_SPEED ? -MAX_SPEED : this.vx;
		this.vy = this.vy > MAX_SPEED ? MAX_SPEED : this.vy < -MAX_SPEED ? -MAX_SPEED : this.vy;

		this.x += this.vx;
		this.y += this.vy;

		// Limit position to width and height
		this.x = this.x >= width  ? width  : this.x <= 0 ? 0 : this.x;
		this.y = this.y >= height ? height : this.y <= 0 ? 0 : this.y;

		//Change direction against walls
		if(this.x == 0 || this.x == width) this.vx = -this.vx;
		if(this.y == 0 || this.y == height) this.vy = -this.vy;
	}


	update(){
		let d = dist(this.x, this.y, target.x, target.y);
		if(d < 100)
			this.score += (100 - d);

		if(this.score > maxScore)
			maxScore = this.score;


		if(this.lifespan > maxLifespan)
			this.dead = true;
		
		this.lifespan++;
	}

	show(){
		var angle = this.angleToPoint(this.x, this.y, this.x + this.vx, this.y + this.vy) + Math.PI/2;
		var op = map(this.score, 0, maxScore, 25, 255);
	
		switch(this.squad) {
			case 0:
				fill(255, 0, 0, op);
				break;
			case 1:
				fill(0, 255, 0, op);
				break;
			case 2:
				fill(0, 0, 255, op);
				break;
			case 3:
				fill(255, 255, 0, op);
				break;
		}

		push();
		translate(this.x, this.y);
		rotate(angle);
		noStroke();
		triangle(-this.radius, this.radius, this.radius, this.radius, 0, -this.radius);
		pop();
	}



	calculateFitness(){ //Fitness function : adapt it to the needs of the
		this.fitness = this.score;
		this.fitness /= this.brain.calculateWeight() * 0.5;
	}

	angleToPoint(x1, y1, x2, y2){
		let d = dist(x1, y1, x2, y2);
		let dx = (x2-x1) / d;
		let dy = (y2-y1) / d;
	  
		let a = Math.acos(dx);
		a = dy < 0 ? 2 * Math.PI - a : a;
		return a;
	}

	scanForPlayers(player){
		let d = dist(this.x, this.y, player.x, player.y);
		if(d < 100) {
			return player;
		}

		return null;
	}
}