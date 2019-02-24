var cycles;
var population1, population2, population3, population4;
var move = false;
var maxLifespan = 250;
var target, targetVel, angle = 0;
var p1 = 0, p2 = 0, p3 = 0, p4 = 0;


function setup() {
	let canvas = createCanvas(600, 600);
	canvas.parent('canvascontainer');

	population1 = new Population(20, 0);
	population2 = new Population(20, 1);
	population3 = new Population(20, 2);
	population4 = new Population(20, 3);

	
	target = createVector(width/2, height/2);
	targetVel = createVector(0, 0);
	
	population1.updateAlive();
}

function draw() {
	cycles = document.getElementById('speedSlider').value;
	document.getElementById('speed').innerHTML = cycles;
	move = document.getElementById('moveCheckbox').checked;
	document.getElementById('generationN').innerHTML = population1.generation;
	document.getElementById('bestFitness').innerHTML = bestFitness;

	if(cycles != 0) {
		background(61);
		stroke(255);
		noFill();
		ellipse(target.x, target.y, 200);
		ellipse(target.x, target.y, 2);	
	}
	

	for(let i = 0; i < cycles; i++) {
		
		if(!population1.done())
			population1.updateAlive(i==0);
			

		if(!population2.done())
			population2.updateAlive(i==0);

		if(!population3.done())
			population3.updateAlive(i==0);

		if(!population4.done())
			population4.updateAlive(i==0);
		else {
			target = createVector(width/2, height/2);
			angle = Math.random() * 360;

			if(population1.generation % 20 == 0)
				maxLifespan += 10;

			let max = Math.max(population1.getAverageScore(), population2.getAverageScore(), population3.getAverageScore(), population4.getAverageScore())
			if(max == population1.getAverageScore())
				p1++;
			else if(max == population2.getAverageScore())
				p2++;
			else if(max == population3.getAverageScore())
				p3++;
			else if(max == population4.getAverageScore())
				p4++;
	
			document.getElementById('red').innerHTML = p1;
			document.getElementById('green').innerHTML = p2;
			document.getElementById('blue').innerHTML = p3;
			document.getElementById('yellow').innerHTML = p4;

			population1.naturalSelection();
			population2.naturalSelection();
			population3.naturalSelection();
			population4.naturalSelection();
		}

		if(move) {
			angle += 0.00025;
			angle = angle%360;
			target.x = width/2 + Math.cos(angle * 180/Math.PI) * 150;
			target.y = height/2 + Math.sin(angle * 180/Math.PI) * 100;
		}	
	}
}

function mouseReleased() {
	if(mouseX < width && mouseX > 0 && mouseY < height && mouseY > 0) {
		target.x = mouseX;
		target.y = mouseY;
		document.getElementById('moveCheckbox').checked = false;
	}
}