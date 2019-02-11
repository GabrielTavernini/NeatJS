let nbSensors = 16;
let maxSensorSize = 256;


class spaceShip{
	constructor(){
		this.pos = createVector(width/2, height/2);
		this.vel = createVector(0,0);
		this.angularVelocity = 0;
		this.direction = 90;
		this.radius = 7;

		this.counter = 0;
		this.shots = 5;
	}

	forward(){
		this.vel.x -= Math.cos((this.direction*Math.PI*2)/360);
		this.vel.y -= Math.sin((this.direction*Math.PI*2)/360);
	}

	backward(){
		//this.vel.x += Math.cos((this.direction*Math.PI*2)/360);
		//this.vel.y += Math.sin((this.direction*Math.PI*2)/360);
	}

	right(){
		this.angularVelocity += 0.5;
	}

	left(){
		this.angularVelocity -= 0.5;
	}

	shot(){
		if(this.counter > 20) {
			this.counter = 0;
			this.shots++;
			return new projectile(this.pos.x, this.pos.y, this.direction * Math.PI/180);	
		}
		return null;
	}

	hits(ast){
		let d = dist(this.pos.x, this.pos.y, ast.pos.x, ast.pos.y);
		if(d <= this.radius + ast.radius)
			return true;
		return false;
	}

	update() {
		this.counter++;
		this.pos.add(this.vel);
		this.direction += this.angularVelocity;
		this.vel.mult(0.90);
		this.angularVelocity *= 0.90;

		this.pos.x = this.pos.x >= width  ? 0  : this.pos.x <= 0 ? width : this.pos.x;
		this.pos.y = this.pos.y >= height ? 0 : this.pos.y <= 0 ? height : this.pos.y;
	}

	show(color){
		push();
		noFill();
		strokeWeight(2);
		stroke(color);
		translate(this.pos.x, this.pos.y);
		rotate(((this.direction-90)*Math.PI*2)/360);
		triangle(-this.radius, this.radius, this.radius, this.radius, 0, -this.radius);
		pop();
	}


//------------------------------------------------------
	look(asteroids, show = false){

		x = 255;
		let direction;
		let vision = [];
		for (let i = 0; i < nbSensors; i++) {
			direction = p5.Vector.fromAngle((this.direction*Math.PI/180) + i*(PI/8));
			direction.mult(10);
			let dirLook = this.lookInDirection(direction, asteroids, show);
			vision.push(dirLook);
			x -= 30;
		}

		return vision;
	}

	lookInDirection(direction, asteroids, show){
		let position = createVector(this.pos.x,this.pos.y);
		let distance = 0;
		//move once in the desired direction before starting 
		position.add(direction);
		distance +=1;

		while(distance < 40){
			if(show){
				push();
				fill(x);
				ellipse(position.x, position.y, 5);
				pop();
			}
			
			for(let i = 0; i < asteroids.length; i++){
				let d = dist(position.x, position.y, asteroids[i].pos.x, asteroids[i].pos.y);
				if(d <= asteroids[i].radius){
					return map(distance, 0, 40, 1, 0);
				}
			}
			
			position.add(direction);
			position.x = position.x >= width  ? 0  : position.x <= 0 ? width : position.x;
			position.y = position.y >= height ? 0 : position.y <= 0 ? height : position.y;
			distance++;
		}

		return 0;
	}
}