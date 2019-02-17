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

	think(){
		this.decisions = this.brain.feedForward(this.vision);
	}

	calculateFitness(){ //Fitness function : adapt it to the needs of the
		this.fitness = this.score;
	}
}