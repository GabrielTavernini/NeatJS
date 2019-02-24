let population;
let cycles = 1;
let game;
let first = 0;
let x = 255;
let maxLifespan = 200;
var expFunc = false;

function setup() {
	let canvas = createCanvas(600, 400);
	canvas.parent('canvascontainer');

	population = new Population(150);
}

function draw() {
	document.getElementById("generationN").innerHTML = population.generation;
	document.getElementById("bestFitness").innerHTML = bestFitness;

	showAll = document.getElementById("allCheckbox").checked;
	showBest = document.getElementById("bestCheckbox").checked;
	runOnlyBest = document.getElementById("runBestCheckbox").checked;

	cycles = select('#speedSlider').value();
	select('#speed').html(cycles);
	background(51);
	
	for(let i = 0; i < cycles; i++)
		if(!population.done()){
			population.updateAlive(cycles < 5 && i == 0);
		} else {
			population.naturalSelection();
			maxLifespan += 10;
		}
}