var population;
var cycles;
var points = [];
var myFunction = function(x) { 
	return height- x+ 150;
};

function setup() {
	let canvas = createCanvas(400, 400);
	canvas.parent('canvascontainer');
	background(61);

	//Initialize the population
	population = new Population(50);
	
	//Generate and Draw points
	for(let i = 0; i < 200; i++) {
		let y = Math.random(), x = Math.random();
		let type = y * height > myFunction(x * width) ? 1 : 0;
		points.push({x: x, y: y, type: type});

		fill(255);
		ellipse(points[i].x * width, points[i].y * height, 10)
	}

	//Draw separation line
	for(let i = 0; i < width; i += 10) {
		fill(50);
		ellipse(i, myFunction(i), 10)
	}
}

function draw() {
	cycles = select('#speedSlider').value();
	select('#speed').html(cycles);

	for(let i = 0; i < cycles; i++)
		if(!population.done())
			population.updateAlive();
		else
			population.naturalSelection();
}