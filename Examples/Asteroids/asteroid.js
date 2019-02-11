class asteroid{
	constructor(pos, radius, angle){
		this.vertexN = random(8,15);

		if(angle && (Math.random() < 0.5)) {
			let tempAngle = angle + (Math.random() - 0.5);
			this.vel = createVector(Math.cos(tempAngle), Math.sin(tempAngle))
		} else {
			this.vel = p5.Vector.random2D();
		}


		if(pos)	{
			this.pos = pos.copy();
		} else {
			this.pos = createVector(random(0, width), random(0, height));
			while(dist(this.pos.x, this.pos.y, width/2, height/2) < 100){
				this.pos.mult(2);
				this.pos.x %= width;
				this.pos.y %= height;
			}
		}

		if(radius)
			this.radius = radius;
		else
			this.radius = random(20,50);

		this.offset = [];
		for(let i = 0; i<this.vertexN; i++){
			this.offset[i] = random( -(this.radius/4), this.radius/4);
		}
	}

	breakup(){
		let newAst = [];
		newAst[0] = new asteroid(this.pos, this.radius/2);
		newAst[1] = new asteroid(this.pos, this.radius/2);
		return newAst;
	}

	update(){
		this.pos.add(this.vel);

		this.pos.x = this.pos.x >= width  ? 0  : this.pos.x <= 0 ? width : this.pos.x;
		this.pos.y = this.pos.y >= height ? 0 : this.pos.y <= 0 ? height : this.pos.y;
	}

	show(color){
		push();
		noFill();
		stroke(color);
		translate(this.pos.x, this.pos.y);

		beginShape();
		for(let i = 0; i<this.vertexN; i++){
			let angle = map(i,0,this.vertexN,0,TWO_PI);
			let x = (this.radius + this.offset[i]) * cos(angle);
			let y = (this.radius + this.offset[i]) * sin(angle);
			vertex(x, y);
		}
		endShape(CLOSE);
		pop();
	}
}