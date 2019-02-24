var population;
var canvas;
var maxLifespan = 400;

function setup() {
	population = new Population(8);
}

function draw() {
	document.getElementById("generationN").innerHTML = population.generation;
	document.getElementById("bestFitness").innerHTML = bestFitness;
	document.getElementById("meanFit").innerHTML = meanFitness;
	length = select('#lengthSlider').value();
	select('#length').html(length);
	theta = select('#thetaSlider').value();
	select('#theta').html(theta);
	force = select('#forceSlider').value();
	select('#force').html(force);

	if(population.done())
		population.naturalSelection();
	else
		population.updateAlive(true);
}

function renderCartPole(cartPole, canvas, count) {
	if (!canvas.style.display) {
	  canvas.style.display = 'block';
	}
	const X_MIN = -cartPole.xThreshold;
	const X_MAX = cartPole.xThreshold;
	const xRange = X_MAX - X_MIN;
	const scale = canvas.width / xRange;
  
	const context = canvas.getContext('2d');
	context.clearRect(0, 0, canvas.width, canvas.height);
	const halfW = canvas.width / 2;
  
	// Draw the cart.
	const railY = canvas.height * 0.8;
	const cartW = cartPole.cartWidth * scale;
	const cartH = cartPole.cartHeight * scale;
  
	const cartX = cartPole.x * scale + halfW;
  
	context.beginPath();
	context.strokeStyle = '#000000';
	context.lineWidth = 2;
	context.rect(cartX - cartW / 2, railY - cartH / 2, cartW, cartH);
	context.stroke();
  
	// Draw the wheels under the cart.
	const wheelRadius = cartH / 4;
	for (const offsetX of [-1, 1]) {
	  context.beginPath();
	  context.lineWidth = 2;
	  context.arc(
		  cartX - cartW / 4 * offsetX, railY + cartH / 2 + wheelRadius,
		  wheelRadius, 0, 2 * Math.PI);
	  context.stroke();
	}
  
	// Draw the pole.
	const angle = cartPole.theta + Math.PI / 2;
	const poleTopX =
		halfW + scale * (cartPole.x + Math.cos(angle) * cartPole.length);
	const poleTopY = railY -
		scale * (cartPole.cartHeight / 2 + Math.sin(angle) * cartPole.length);
	context.beginPath();
	context.strokeStyle = '#ffa500';
	context.lineWidth = 6;
	context.moveTo(cartX, railY - cartH / 2);
	context.lineTo(poleTopX, poleTopY);
	context.stroke();
  
	// Draw the ground.
	const groundY = railY + cartH / 2 + wheelRadius * 2;
	context.beginPath();
	context.strokeStyle = '#000000';
	context.lineWidth = 1;
	context.moveTo(0, groundY);
	context.lineTo(canvas.width, groundY);
	context.stroke();
  
	const nDivisions = 40;
	for (let i = 0; i < nDivisions; ++i) {
	  const x0 = canvas.width / nDivisions * i;
	  const x1 = x0 + canvas.width / nDivisions / 2;
	  const y0 = groundY + canvas.width / nDivisions / 2;
	  const y1 = groundY;
	  context.beginPath();
	  context.moveTo(x0, y0);
	  context.lineTo(x1, y1);
	  context.stroke();
	}
  
	// Draw the left and right limits.
	const limitTopY = groundY - canvas.height / 2;
	context.beginPath();
	context.strokeStyle = '#ff0000';
	context.lineWidth = 2;
	context.moveTo(1, groundY);
	context.lineTo(1, limitTopY);
	context.stroke();
	context.beginPath();
	context.moveTo(canvas.width - 1, groundY);
	context.lineTo(canvas.width - 1, limitTopY);
	context.stroke();

	context.font = "30px Arial";
	context.fillText(count, 10, 50);
  }