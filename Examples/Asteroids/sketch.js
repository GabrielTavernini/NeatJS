let popu;
let cycles = 1;
let game;
let first = 0;
let x = 255;
let maxLifespan = 500;

function setup() {
	let canvas = createCanvas(600, 400);
	canvas.parent('canvascontainer');

	popu = new Population(25);
	
}

function draw() {
	cycles = select('#speedSlider').value();
	select('#speed').html(cycles);
	background(51);
	
	for(let i = 0; i < cycles; i++)
		if(!popu.done()){
			popu.updateAlive(cycles < 5 && i == 0);
		} else {
			popu.naturalSelection();
			maxLifespan += 10;
		}
}