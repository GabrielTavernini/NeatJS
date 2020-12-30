var population;
var cycles, sinAllowed;
var points = [];
var myFunction = function(x) {
	return Math.sin(x)*0.4 + 0.5;
};

function setup() {
	let canvas = createCanvas(600, 400);
	canvas.parent('canvascontainer');
	background(61);

	//Initialize the population
	population = new Population(500);
	
	//Generate and Draw points
	for(let i = 0; i < 1000; i++) {
		let y = Math.random(), x = Math.random() * Math.PI * 4;
		let type = y > myFunction(x) ? 1 : 0;
		points.push({x: x, y: y, type: type});

		fill(255);
		ellipse(map(points[i].x, 0, Math.PI*4, 0, width), points[i].y * height, 10)
	}

	//Draw separation line
	for(let i = 0; i < width; i += 1) {
		fill(50);
		ellipse(i, myFunction(map(i, 0, width, 0, Math.PI*4)) * height, 10)
	}
}

function draw() {
	sinAllowed = document.getElementById("sinCheckbox").checked;
	cycles = select('#speedSlider').value();
	select('#speed').html(cycles);

	for(let i = 0; i < cycles; i++)
		if(!population.done())
			population.updateAlive();
		else
			population.naturalSelection();
}