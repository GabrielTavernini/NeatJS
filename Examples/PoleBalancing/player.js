var maxScore = 0;
var MAX_SPEED = 5;
var counter = 1;

//The interface between our 
//NeuralNetwork and the game 
class Player{
	constructor(){
		this.brain = new Genome(genomeInputsN, genomeOutputN);
		this.fitness;
		this.score = 1;
		this.lifespan = 0;
		this.dead = false;
		this.decisions = []; //Current Output values
		this.vision = []; //Current input values

		this.cartPole = new CartPole();
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
		this.vision = this.cartPole.getStateTensor();
	} 

	think(){
		this.decisions = this.brain.feedForward(this.vision);
	}

	move(){
	}


	update(){
		this.lifespan++;
		this.cartPole.update(this.decisions[0]);

		if(this.cartPole.isDone() || this.lifespan > maxLifespan)
			this.dead = true;
	}

	show(){
		renderCartPole(this.cartPole, document.getElementById("canv" + counter), counter);
	}



	calculateFitness(){ //Fitness function : adapt it to the needs of the
		this.fitness = this.lifespan;
		this.fitness /= this.cartPole.theta > 0 ? this.cartPole.theta : -this.cartPole.theta;

		this.score = this.fitness;
	}
}