var maxScore = 0;
var MAX_SPEED = 5;

//The Player Class
//The interface between our 
//NeuralNetwork and the game 
class Player{
	constructor(id){
		this.brain = new Genome(genomeInputsN, genomeOutputN, id);
		this.fitness;
		
		
		this.color = color(random(0, 255), random(0, 255), random(0, 255));
		this.radius = 7;
		this.ship = new spaceShip();
		this.projectiles = [];
		this.asteroids = [];
		for(let j = 0; j < 5; j++){
			this.asteroids[j] = new asteroid();
		}

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
		this.vision = this.ship.look(this.asteroids);
	}

	think(){
		this.decisions = this.brain.feedForward(this.vision);
	}

	move(){
		if(this.decisions[0] > 0.8)
			this.ship.forward();

		if(this.decisions[1] > 0.8)
			if(this.decisions[2] > 0.8)	
				if(this.decisions[1] > this.decisions[2])
					this.ship.right();
				else
					this.ship.left();
		else if(this.decisions[2] > 0.8)
			this.ship.left();

		if(this.decisions[3] > 0.8) {
			let prj = this.ship.shot();
			if(prj != null)
				this.projectiles.push(prj);
		}
	}

	update(){
		this.ship.update();

		if(this.asteroids.length > 0){
			for(let j = 0; j < this.asteroids.length; j++){
				if(this.ship.hits(this.asteroids[j]))
					this.dead = true;
				this.asteroids[j].update();
			}
		
			for(let i = this.projectiles.length - 1; i >= 0; i--){
				this.projectiles[i].update();
				if(this.projectiles[i].hitEdge()){
					this.projectiles.splice(i,1);
				}else{
					for(let j = this.asteroids.length - 1; j >= 0; j--){
						if(this.projectiles[i].hits(this.asteroids[j])){
							if(this.asteroids[j].radius > 15){
								let newAsteroids = this.asteroids[j].breakup();
								this.asteroids.push(newAsteroids[0]);
								this.asteroids.push(newAsteroids[1]);
							}
							
							this.projectiles.splice(i,1);
							this.asteroids.splice(j,1);
							this.score++;
							break;
						}
					}
				}
			}
		}else{
			this.dead = true;
		}

		this.lifespan ++;
		if(this.lifespan > maxLifespan)
			this.dead = true;
	}

	show(){
		this.ship.show(this.color)
		this.asteroids.forEach((element) => { 
			element.show(this.color);
		});
		this.projectiles.forEach((element) => { 
			element.show(this.color);
		});
	}

	calculateFitness(){ //Fitness function : adapt it to the needs of the
		let hitRate = this.score/this.ship.shots;
		this.fitness = (this.score)*10;
		this.fitness *= this.lifespan;
		this.fitness *= hitRate*hitRate;	
		this.score = hitRate;
	}

	
}