class projectile{
	constructor(x, y, d){
		this.timer = 0;
		this.position = createVector(x ,y);
		this.direction = d;
		this.velocity = createVector(0,0);
		this.velocity.x -= Math.cos(this.direction)*10;
		this.velocity.y -= Math.sin(this.direction)*10;
	}
	
	update(){
		this.timer ++;
		this.position.add(this.velocity);

		this.position.x = this.position.x >= width  ? 0  : this.position.x <= 0 ? width : this.position.x;
		this.position.y = this.position.y >= height ? 0 : this.position.y <= 0 ? height : this.position.y;
	}

	show(color){
		push();
		fill(color);
		ellipse(this.position.x, this.position.y, 5);
		pop();
	}

	hits(ast){
		let d = dist(this.position.x, this.position.y, ast.pos.x, ast.pos.y);
		if(d <= ast.radius)
			return true;
		return false;
	}

	hitEdge(){
		if(this.position.x >= width || this.position.x <= 0 || this.position.y >= height || this.position.y <= 0){
			return true;
		}

		return false;
	}
}