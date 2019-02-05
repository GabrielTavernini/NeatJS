

class asteroidGame{
	constructor(i){
		this.ship;
		this.asteroidsN = 7;
		this.asteroids = [];
		this.projectiles = [];
		this.gameOver = false;
		this.cloneAsteroids = [];
		this.score = 1;

		this.ship = new spaceShip();

		for(let j = 0; j <this.asteroidsN; j++){
			this.asteroids[j] = new asteroid();
		}

		this.cloneAsteroids = this.asteroids.slice(0);
	}

	copy() {
		return new asteroidGame(this.brain);
	}

	restart(){
		this.ship;
		this.asteroidsN = 7;
		this.asteroids = [];
		this.projectiles = [];
		this.gameOver = false;

		this.ship = new spaceShip();

		for(let j = 0; j <this.asteroidsN; j++){
			this.asteroids[j] = new asteroid();
		}
	}

	update(){
		if(this.asteroids.length > 0){
			for(let j = 0; j < this.asteroids.length; j++){
				if(this.ship.hits(this.asteroids[j])){
					this.gameOver = true;
				}

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
			this.done = true;
		}

		this.ship.update();
	}

	show(){
		this.ship.show()
		this.asteroids.forEach((element) => { 
			element.show();
		});
		this.projectiles.forEach((element) => { 
			element.show();
		});
	}

	handlePaddles() {
		/* player two controls */
		
		if (keyIsDown(UP_ARROW) || keyIsDown(87)) {
			this.ship.forward();
		}
		
		if (keyIsDown(DOWN_ARROW) || keyIsDown(83)) {
			this.ship.backward();
		}
		
		if (keyIsDown(RIGHT_ARROW) || keyIsDown(68)) {
			this.ship.right();
		}
		
		if (keyIsDown(LEFT_ARROW) || keyIsDown(65)) {
			this.ship.left();
		}
	}
}