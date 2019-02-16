let genomeInputsN = 2;
let genomeOutputN = 1;
let showBest = true;

//The Population Class
//Here is where the power of all the classes
//comes together to destroy the game score records
class Population{
	constructor(size){
		this.population = [];
		this.bestPlayer;
		this.bestFitness = 0;

		this.generation = 0;
		this.matingPool = [];

		for(let i = 0; i < size; i++){
			this.population.push(new Player(i));
			this.population[i].brain.generateNetwork();
			this.population[i].brain.mutate();
		}
	}

	updateAlive(){
		for(let i = 0; i < this.population.length; i++){
			if(!this.population[i].dead){
				this.population[i].look();
				this.population[i].think();
				this.population[i].move();
				this.population[i].update();
				//this.population[i].show();
			}
		}

		if(showBest && this.bestPlayer && !this.bestPlayer.dead) {
			this.bestPlayer.look();
			this.bestPlayer.think();
			this.bestPlayer.move();
			this.bestPlayer.update();
			this.bestPlayer.show();
		}
	}

	done(){
		for(let i = 0; i < this.population.length; i++){
			if(!this.population[i].dead){
				return false;
			}
		}
		
		return true;
	}
	
	naturalSelection(){
		this.calculateFitness();

		let averageSum = this.getAverageScore();
		console.log(averageSum);
		let children = [];
		
		this.fillMatingPool();
		for(let i = 0; i < this.population.length; i++){
			let parent1 = this.selectPlayer();
			let parent2 = this.selectPlayer();
			if(parent1.fitness > parent2.fitness)
				children.push(parent1.crossover(parent2));
			else
				children.push(parent2.crossover(parent1));
		}


		this.population.splice(0, this.population.length);
		this.population = children.slice(0);
		this.generation++;
		this.population.forEach((element) => { 
			element.brain.generateNetwork();
		});	

		console.log("Generation " + this.generation);
		//console.log(this);

		this.bestPlayer.lifespan = 0;
		this.bestPlayer.dead = false;
		this.bestPlayer.score = 1;
	}

	calculateFitness(){
		let currentMax = 0;
		this.population.forEach((element) => { 
			element.calculateFitness();
			if(element.fitness > this.bestFitness){
				this.bestFitness = element.fitness;
				this.bestPlayer = element.clone();
				this.bestPlayer.brain.id = "BestGenome";
				this.bestPlayer.brain.draw();
			}

			if(element.fitness > currentMax)
				currentMax = element.fitness;
		});

		//Normalize
		this.population.forEach((element, elementN) => { 
			element.fitness /= currentMax;
		});
	}

	fillMatingPool(){
		this.matingPool.splice(0, this.matingPool.length);
		this.population.forEach((element, elementN) => { 
			let n = element.fitness * 100;
			for(let i = 0; i < n; i++)
				this.matingPool.push(elementN);
		});
	}

	selectPlayer(){
		let rand = Math.floor(Math.random() *  this.matingPool.length);
		return this.population[this.matingPool[rand]];
	}

	getAverageScore(){
		let avSum = 0;
		this.population.forEach((element) => { 
			avSum += element.score;
		});

		return avSum / this.population.length;
	}
}
