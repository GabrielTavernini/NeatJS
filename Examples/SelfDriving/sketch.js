'use strict';

Physijs.scripts.worker	= 'libs/physijs_worker.js';
Physijs.scripts.ammo	= 'ammo.js';

var initScene, render, renderer, scene, ground, light, camera;
var stats, orbit;
var car, walls = [], constraints = [];
var cameraFollow = true;
var raycaster = new THREE.Raycaster();
raycaster.far = 75;
raycaster.near = 5;
var controls;

//Path
var points = [
	{l: [0,0], r: [0,50]},
	{l: [100,0], r: [75,50]},
	{l: [150,50], r: [100,75]},
	{l: [150,125], r: [100,150]},
	{l: [175,150], r: [150,200]},
	{l: [250,150], r: [285,200]},
	{l: [310,50], r: [345,100]},
	{l: [400,50], r: [425,100]},
	{l: [450,0], r: [475,50]},
	{l: [550,0], r: [500,50]},
	{l: [575,25], r: [500,50]},
	{l: [520,150], r: [450,150]},
	{l: [520,150], r: [470,200]},
	{l: [600,150], r: [625,200]},
	{l: [700,50], r: [725,85]},
	{l: [800,50], r: [800,85]},
];
var path = [];
for(let i = 0; i < points.length; i++)
	path.push({x: (points[i].l[0]+points[i].r[0])/2, y: (points[i].l[1]+points[i].r[1])/2})


var textureGround = new THREE.TextureLoader().load( "./img/asphalt.jpg" );
var textureWalls = new THREE.TextureLoader().load( "./img/wireframe.png" );

textureGround.wrapS = THREE.RepeatWrapping;
textureGround.wrapT = THREE.RepeatWrapping;
textureGround.repeat.set( 4, 4 );

textureWalls.wrapS = THREE.RepeatWrapping;
textureWalls.wrapT = THREE.RepeatWrapping;
textureWalls.repeat.set( 4, 4 );

var width = 800;//800;
var height = 700;//800;
var groundWidth = 800;
var groundHeight = 200;

var gravity					= -290;

var wheel_mass				= 100;
var wheel_front_friction	= 1.5;
var wheel_front_restitution	= .3;
var wheel_rear_friction		= 1.5;
var wheel_rear_restitution	= .3;

var body_mass				= 2000;


//Neat Stuff
var population = new Population(20);
var vision = [];
var playerCounter = 0;
var deltaLifespan = 0;
var maxLifespan = 200;
var prevPosition = [];
var mediumVelocity = 0;
var sumCounter = 0;
var velocitySum = 0;

initScene = function () {

	population.population[playerCounter].brain.id = "currentGenome";
	population.population[playerCounter].brain.draw("currentSvgContainer");

	// AmbientLight
	var ambient = new THREE.AmbientLight(0xFFFFFF,2);
	scene.add(ambient);

	createGround();
	car = new createCar();
	car.rotation.order = "YXZ"

	if(cameraFollow) {
		camera.position.set(0, 300, 0);
		camera.lookAt(new THREE.Vector3(30, 0, -20));
	}


	controls = new function () {
		this.velocity = 0;
		this.wheelAngle = 0;

		this.changeVelocity = function () {
			// if you add a motor, the current constraint is overridden
			// if you want to rotate set min higher then max
			car.userData.rlConstraint.configureAngularMotor(2, 0, -1, controls.velocity, 20000);
			car.userData.rrConstraint.configureAngularMotor(2, 0, -1, controls.velocity, 20000);

		};

		this.changeOrientation = function () {
			// backwheels don't move themselves and are restriced in their
			// movement. They should be able to rotate along the z-axis
			// same here, if the complete angle is allowed set lower higher
			// than upper.
			// by setting the lower and upper to the same value you can
			// fix the position
			// we can set the x position to 'loosen' the axis for the directional
			car.userData.frConstraint.setAngularLowerLimit({x: 0, y: controls.wheelAngle, z: 2});
			car.userData.frConstraint.setAngularUpperLimit({x: 0, y: controls.wheelAngle, z: 0});
			car.userData.flConstraint.setAngularLowerLimit({x: 0, y: controls.wheelAngle, z: 2});
			car.userData.flConstraint.setAngularUpperLimit({x: 0, y: controls.wheelAngle, z: 0});
		}
	};

	var pressed = {};
	document.addEventListener('keydown', function(e) {
		var key = e.keyCode;
		pressed[key] = true;

		orbit.enabled = false;

		if (key === 38) { // up
			controls.velocity = -20;
			controls.changeVelocity();
		}
		else if (key === 40) { // down
			controls.velocity = 20;
			controls.changeVelocity();
		}
		else if (key === 37) { // left
			controls.wheelAngle = +.4;
			controls.changeOrientation();
		}
		else if (key === 39) { // right
			controls.wheelAngle = -.4;
			controls.changeOrientation();
		}
		if (key === 32) { // space
			// https://github.com/chandlerprall/Physijs/wiki/Updating-an-object's-position-&-rotation
			car.setLinearVelocity(new THREE.Vector3(0, 0, 0));
			car.setAngularVelocity(new THREE.Vector3(0, 0, 0));

			car.position.y = 20;
			car.__dirtyPosition = true;

			car.rotation.x += Math.PI;
			car.rotation.y += Math.PI;
			car.rotation.z += 0;
			car.__dirtyRotation = true;
		}
	})

	document.addEventListener('keyup', function(e) {
		var key = e.keyCode;
		pressed[key] = false;

		orbit.enabled = true;

		if (!pressed[38] && !pressed[40]) {
			controls.velocity = 0;
			controls.changeVelocity();
		}
		if (!pressed[37] && !pressed[39]) {
			controls.wheelAngle = 0;
			controls.changeOrientation();
		}
	})




	controls.changeVelocity();
	controls.changeOrientation();
};

function createCar() {

	function createWheel(position, friction, restitution) {
		var mat = Physijs.createMaterial(new THREE.MeshLambertMaterial({color: 0x111111 }), friction, restitution);
		var geo = new THREE.CylinderGeometry(3, 3, 2, 32);
		var mesh = new Physijs.CylinderMesh(geo, mat, wheel_mass);

		mesh.rotation.x = Math.PI / 2;
		mesh.castShadow = true;
		mesh.position.copy(position);
		return mesh;
	}

    var x = -groundWidth/2 + 25;
    var z = -groundHeight/2 + 25;
	// create the car body
	var geom	= new THREE.BoxGeometry(15, 4, 4);
	var mat		= new THREE.MeshLambertMaterial({ color: 0xFF0000 });
	var body	= new Physijs.BoxMesh(geom, mat, body_mass);
	var mat2	= new THREE.MeshLambertMaterial({ opacity: 0, transparent: true });
	var geom2	= new THREE.BoxGeometry(15, 2, 4);
	var body2	= new Physijs.BoxMesh(geom2, mat2, 0);
	var geom3	= new THREE.BoxGeometry(17, 4, 13);
	var body3	= new Physijs.BoxMesh(geom3, mat2, 0);
	body.position.set(x, 5, z);
	body2.position.set(0, 3, 0);
	body3.position.set(0, 3, 0);
	body2.add(body3);
	body.add(body2);
	scene.add(body);

	body.addEventListener( 'collision', function() {
		restart(true);
	});

	// create the wheels
	var fr = createWheel(new THREE.Vector3(x+5, 4, z+5), wheel_rear_friction, wheel_rear_restitution);
	var fl = createWheel(new THREE.Vector3(x+5, 4, z-5), wheel_rear_friction, wheel_rear_restitution);
	var rr = createWheel(new THREE.Vector3(x-5, 4, z+5), wheel_front_friction, wheel_front_restitution);
	var rl = createWheel(new THREE.Vector3(x-5, 4, z-5), wheel_front_friction, wheel_front_restitution);

	// add the wheels to the scene
	scene.add(fr);
	scene.add(fl);
	scene.add(rr);
	scene.add(rl);

	var frConstraint = new Physijs.DOFConstraint(fr, body, new THREE.Vector3(x+5, 4, z+3));
	scene.addConstraint(frConstraint);

	var flConstraint = new Physijs.DOFConstraint(fl, body, new THREE.Vector3(x+5, 4, z-3));
	scene.addConstraint(flConstraint);

	var rrConstraint = new Physijs.DOFConstraint(rr, body, new THREE.Vector3(x-5, 4, z+3));
	scene.addConstraint(rrConstraint);

	var rlConstraint = new Physijs.DOFConstraint(rl, body, new THREE.Vector3(x-5, 4, z-3));
	scene.addConstraint(rlConstraint);

    constraints.push(frConstraint);
    constraints.push(flConstraint);
    constraints.push(rrConstraint);
    constraints.push(rlConstraint);


	// front wheels should only move along the z axis.
	// we don't need to specify anything here, since
	// that value is overridden by the motors
	rrConstraint.setAngularLowerLimit({x: 0, y: 0, z: 0});
	rrConstraint.setAngularUpperLimit({x: 0, y: 0, z: 0});
	rlConstraint.setAngularLowerLimit({x: 0, y: 0, z: 0});
	rlConstraint.setAngularUpperLimit({x: 0, y: 0, z: 0});

	// motor two is forward and backwards
	rlConstraint.enableAngularMotor(2);
	rrConstraint.enableAngularMotor(2);

	body.userData.rlConstraint = rlConstraint;
	body.userData.rrConstraint = rrConstraint;
	body.userData.flConstraint = flConstraint;
	body.userData.frConstraint = frConstraint;

	return body;
}

function createGround() {
	var width = groundWidth;
	var height = groundHeight;


	// Materials
	var mat = Physijs.createMaterial(new THREE.MeshPhongMaterial({ map: textureGround, color: 0x333333}), 0.6, 0);

	// Ground
	var geo = new THREE.BoxGeometry(width, 5, height);
	ground = new Physijs.BoxMesh(geo, mat, 0 /* mass */ );

	mat = Physijs.createMaterial(new THREE.MeshPhongMaterial({ color: 0x111111}), 0.6, 0);
	var borderLeft = new Physijs.BoxMesh(new THREE.BoxGeometry(5, 20, height), mat, 0);
	borderLeft.position.x = -width / 2 - 1;
	ground.add(borderLeft);

	var borderRight = new Physijs.BoxMesh(new THREE.BoxGeometry(5, 20, height), mat, 0);
	borderRight.position.x = width / 2 + 1;
	ground.add(borderRight);

	var borderBottom = new Physijs.BoxMesh(new THREE.BoxGeometry(width, 20, 5), mat, 0);
	borderBottom.position.z = height / 2 + 1;
	ground.add(borderBottom);

	var borderTop = new Physijs.BoxMesh(new THREE.BoxGeometry(width, 20, 5), mat, 0);
	borderTop.position.z = -height / 2 - 1;
	ground.add(borderTop);



	for(let i = 0; i < points.length -1; i++) {
		var material = new THREE.MeshBasicMaterial( {map: textureWalls, color: 0x929293, clipIntersection: true} );
		let a = points[i].l[0] - points[i+1].l[0];
		let b = points[i+1].l[1] - points[i].l[1];
		let dist = Math.sqrt(a*a + b*b);
		var geometry = new THREE.BoxGeometry(dist,30,5);
		let mesh = new Physijs.BoxMesh(geometry, material);
		mesh.position.x = (points[i].l[0] + points[i+1].l[0])/2 - groundWidth/2;
		mesh.position.z = (points[i].l[1] + points[i+1].l[1])/2 - groundHeight/2;
		mesh.position.y = 14;
		mesh.rotation.y = Math.atan2(b, a);

		ground.add(mesh);
		walls.push(mesh);

		let a2 = points[i].r[0] - points[i+1].r[0];
		let b2 = points[i+1].r[1] - points[i].r[1];
		let dist2 = Math.sqrt(a2*a2 + b2*b2);
		var geometry2 = new THREE.BoxGeometry(dist2,30,5);
		let mesh2 = new Physijs.BoxMesh(geometry2, material);
		mesh2.position.x = (points[i].r[0] + points[i+1].r[0])/2 - groundWidth/2;
		mesh2.position.z = (points[i].r[1] + points[i+1].r[1])/2 - groundHeight/2;
		mesh2.position.y = 14;
		mesh2.rotation.y = Math.atan2(b2, a2);

		ground.add(mesh2);
		walls.push(mesh2);
	}
	scene.add(ground);
}

function restart(crash = false) {

	let x = car.position.x + groundWidth/2;
	let z = car.position.z + groundHeight/2;
	let result = getClosestPointOnLines({x:x, y:z}, path);

	let dist = 0;
	for(let i = 1; i < result.i; i++) {
		let segDist = Math.sqrt(Math.pow(path[i-1].x-path[i].x, 2) + Math.pow(path[i-1].y-path[i].y, 2));
		segDist *= segDist < 0 ? -1 : 1;
		dist += segDist;
	}


	let additionalDist = Math.sqrt(Math.pow(path[result.i - 1].x-result.x, 2) + Math.pow(path[result.i - 1].y-result.y, 2));
	additionalDist *= additionalDist < 0 ? -1 : 1;
	dist += additionalDist;

	let score = dist;//Math.sqrt(Math.pow(car.position.x + groundWidth/2, 2) + Math.pow(car.position.z + groundHeight/2, 2));
	population.population[playerCounter].score = score;
	if(document.getElementById("expCheckbox").checked)
		population.population[playerCounter].fitness = Math.pow(score, 2);
	else
		population.population[playerCounter].fitness = score;


	if(crash && document.getElementById("crashCheckbox").checked) {
		population.population[playerCounter].score *= 0.75;
		population.population[playerCounter].fitness *= 0.75;
	}

	if(document.getElementById("velocityCheckbox").checked) {
		if(mediumVelocity > 0) {
			population.population[playerCounter].score *= mediumVelocity/20;
			population.population[playerCounter].fitness *= mediumVelocity/20;
		}
	}


	if(population.population[playerCounter].fitness > population.bestFitness){
		population.bestScore = population.population[playerCounter].score;
		population.bestFitness = population.population[playerCounter].fitness;
		population.bestPlayer = population.population[playerCounter].clone();
		population.bestPlayer.brain.id = "BestGenome";
		population.bestPlayer.brain.draw("bestSvgContainer");
	}


	vision = [];
	deltaLifespan = 0;
	prevPosition = [];
	mediumVelocity = 0;
	sumCounter = 0;
	velocitySum = 0;
	console.log("Genome: " + playerCounter + " - Score: " + population.population[playerCounter].score);

	playerCounter++;
	if(playerCounter >= population.population.length){
		population.naturalSelection();
		playerCounter = 0;
		maxLifespan += 30;
	}

	while(scene.children.length > 0)
		scene.remove(scene.children[0]);

    for(let i = 0; i < constraints.length; i++)
        scene.removeConstraint(constraints[i]);

    scene.collisions = {};
	constraints = [];
	walls = [];

	initScene();
};

render = function () {
	mediumVelocity = velocitySum / sumCounter;
	document.getElementById("genomeN").innerHTML = playerCounter;
	document.getElementById("generationN").innerHTML = population.generation;
	document.getElementById("bestFitness").innerHTML = population.bestFitness;
	document.getElementById("bestScore").innerHTML = population.bestScore;
    document.getElementById("mediumV").innerHTML = mediumVelocity;

	cameraFollow = document.getElementById("followCheckbox").checked;
	if(cameraFollow) {
		camera.position.set(car.position.x + Math.sin(car.rotation.y - Math.PI/2)*75, 60, car.position.z + Math.cos(car.rotation.y - Math.PI/2)*75);
		var pos = car.position.clone();
		pos.y += 10;
		camera.lookAt(pos);
	}



	//------------------------------------------------------------------------------------------
	//--------------------------------Collect Vision Data---------------------------------------
	//------------------------------------------------------------------------------------------

	vision = [];
	//Straight
	var position = new THREE.Vector3( car.position.x, 0, car.position.z);
	var direction = new THREE.Vector3(Math.sin(car.rotation.y + Math.PI/2), 0, Math.cos(car.rotation.y + Math.PI/2));
	direction.normalize();
	raycaster.set( position, direction);
	var intersects = raycaster.intersectObjects( walls );
    var selectedObject = scene.getObjectByName("line");
	if(selectedObject)
		scene.remove( selectedObject );

	if(intersects.length > 0) {
		var material = new THREE.LineBasicMaterial( { color: 0xFF0000 } );
		var geometry = new THREE.Geometry();
		geometry.vertices.push(position);
		geometry.vertices.push(intersects[0].point);
		var line = new THREE.Line( geometry, material );
		line.position.y = car.position.y;
		line.name = "line";
		scene.add(line);

		vision.push(p5.prototype.map(intersects[0].distance, 0, raycaster.far, 1, 0));
	} else{
		vision.push(0);
	}


	//45 degree right
	direction = new THREE.Vector3(Math.sin(car.rotation.y + Math.PI/4), 0, Math.cos(car.rotation.y + Math.PI/4));
	direction.normalize();
	raycaster.set( position, direction);
	var intersects = raycaster.intersectObjects( walls );
	var selectedObject = scene.getObjectByName("line2");
	if(selectedObject)
		scene.remove( selectedObject );

	if(intersects.length > 0) {
		var material = new THREE.LineBasicMaterial( { color: 0x00FF00 } );
		var geometry = new THREE.Geometry();
		geometry.vertices.push(position);
		geometry.vertices.push(intersects[0].point);
		var line = new THREE.Line( geometry, material );
		line.position.y = car.position.y;
		line.name = "line2";
		scene.add(line);

		vision.push(p5.prototype.map(intersects[0].distance, 0, raycaster.far, 1, 0));
	} else{
		vision.push(0);
	}


	//45 degree left
	direction = new THREE.Vector3(Math.sin(car.rotation.y + 3*Math.PI/4), 0, Math.cos(car.rotation.y + 3*Math.PI/4));
	direction.normalize();
	raycaster.set( position, direction);
	var intersects = raycaster.intersectObjects( walls );
    var selectedObject = scene.getObjectByName("line3");
	if(selectedObject)
		scene.remove( selectedObject );

	if(intersects.length > 0) {
		var material = new THREE.LineBasicMaterial( { color: 0x0000ff } );
		var geometry = new THREE.Geometry();
		geometry.vertices.push(position);
		geometry.vertices.push(intersects[0].point);
		var line = new THREE.Line( geometry, material );
		line.position.y = car.position.y;
		line.name = "line3";
		scene.add(line);

		vision.push(p5.prototype.map(intersects[0].distance, 0, raycaster.far, 1, 0));
	} else{
		vision.push(0);
	}


	//------------------------------------------------------------------------------------------
	//---------------------------------FeedForward & Move---------------------------------------
	//------------------------------------------------------------------------------------------

	population.population[playerCounter].vision = vision.slice(0, vision.length);
	population.population[playerCounter].think();
	var decisions = population.population[playerCounter].decisions;

	decisions[0] *= 20;
	controls.velocity = decisions[0] < 20 && decisions[0] > -20 ? -decisions[0] : decisions[0] < 0 ? 20 : -20;//-decisions[0]*10;
	sumCounter ++;
	velocitySum += -controls.velocity;
	document.getElementById("currentV").innerHTML =  -controls.velocity;
	controls.changeVelocity();

	controls.wheelAngle = decisions[1] < .4 && decisions[1] > -.4 ? decisions[1] : decisions[1] < 0 ? -.4 : .4;
	document.getElementById("currentS").innerHTML =  controls.wheelAngle;
	controls.changeOrientation();

	renderer.render(scene, camera);
	scene.simulate(undefined, 2);
	requestAnimationFrame(render);


	//Overtime
	if(prevPosition.length < 2)
		prevPosition = [car.position.x, car.position.z];
	else if(Math.sqrt(Math.pow(prevPosition[0] - car.position.x, 2) + Math.pow(prevPosition[1] - car.position.z, 2)) < 5) {
		if(deltaLifespan > 75) {
			deltaLifespan = 0;
			restart();
		}
		deltaLifespan++;
	} else {
		deltaLifespan = 0;
		prevPosition = [car.position.x, car.position.z];
	}
};


//------------------------------------------------------------------------------------------
//----------------------------------------Start---------------------------------------------
//------------------------------------------------------------------------------------------

window.onload = () => {
	renderer = new THREE.WebGLRenderer({ antialias: false });
	renderer.setSize(width, height);
	renderer.setClearColor(new THREE.Color(0x999999));
	renderer.shadowMap.enabled = true;
	renderer.shadowMap.type = THREE.PCFSoftShadowMap;

	document.getElementById('viewport').appendChild(renderer.domElement);

	scene = new Physijs.Scene({reportSize: 10, fixedTimeStep: 1 / 60});
	scene.setGravity(new THREE.Vector3(0, gravity, 0));

	camera = new THREE.PerspectiveCamera(45, width/height, 1, 1000);
	scene.add(camera);

	orbit = new THREE.OrbitControls(camera, renderer.domElement);
	orbit.enableDamping = true;
	orbit.dampingFactor = 1;

	initScene();
	render();
	scene.simulate();
}
