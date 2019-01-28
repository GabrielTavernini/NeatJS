//The Player Class
//The interface between our 
//NeuralNetwork and the game 
class Player{
	constructor(id){
		this.brain = new Genome(genomeInputsN, genomeOutputN, id);
		this.fitness;

		this.score = 1;
		this.lifespan = 0;
		this.dead = false;
		this.decisions = []; //Current Output values
		this.vision = []; //Current input values
	}

	clone() { //Returns a copy of this player
		let clone = new Player();
		clone.brain = this.brain.clone();
		return clone;
	}

	crossover(parent){ //Produce a child
		let child = new Player();
		if(parent.fitness < this.fitness)
			child.brain = this.brain.crossover(parent.brain);
		else
			child.brain = parent.brain.crossover(this.brain);

		child.brain.mutate()
		return child;
	}


	//Game stuff
	look(){
		this.vision = [points[this.lifespan].x, points[this.lifespan].y];
		this.correctVal = points[this.lifespan].type;
	}

	think(){
		this.decisions = this.brain.feedForward(this.vision);
	}

	move(){
		let maxIndex = 0;
		for(let i = 0; i < this.decisions.length; i++)
			if(this.decisions[i] > this.decisions[maxIndex])
				maxIndex = i;

		this.val = this.decisions[maxIndex] >= 0 ? 1 : 0;
	}

	update(){
		if(this.correctVal == this.val) {
			this.score++;
		}

		this.lifespan++;
		if(this.lifespan >= points.length)
			this.dead = true;
	}

	show(){
		push();
		if(this.correctVal == this.val) {
			if(this.correctVal == 1)
				fill(0, 255, 0);
			
			if(this.correctVal == 0)
				fill(0, 0, 255);

			ellipse(points[this.lifespan - 1].x * width, points[this.lifespan - 1].y * height, 6)
		} else {
			fill(255, 0, 0);
			ellipse(points[this.lifespan - 1].x * width, points[this.lifespan - 1].y * height, 6)
		}
		pop();
	}

	calculateFitness(){ //Fitness function : adapt it to the needs of the
		this.fitness = this.score;
		this.fitness /= this.brain.calculateWeight();
	}
}