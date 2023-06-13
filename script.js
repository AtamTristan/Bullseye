//EventListener for that all images are loaded before anything runs
// collsionX and collisionY for position and spriteX and spriteY are for the Spritesheet

window.addEventListener('load', function(){
	const canvas = document.getElementById('canvas1');
	const ctx = canvas.getContext('2d'); // holds all canvas propertys and buildin methods
	canvas.width = 1280;
	canvas.height = 720;

	// on all Objects
	ctx.fillStyle = 'white';
	ctx.lineWidth = 3;
	ctx.strokeStyle = 'white';

	class Player {
		constructor(game){
			this.game = game;
			this.collisionX = this.game.width * 0.5;
			this.collisionY = this.game.height * 0.5;
			this.collisionRadius = 50;
			this.speedX = 0;
			this.speedY = 0;
			this.dx = 0;
			this.dy = 0;
			this.speedModifier = 5;
		}
		draw(context){
			context.beginPath(); // for drawing a new shape and close previous
			context.arc(this.collisionX, this.collisionY, this.collisionRadius, 0, Math.PI * 2); // at least 5 arguments
			/*
				To limit certain canvas settings only to specific draw calls we can wrap that drawing code
				between save() and restore() built-in canvas methods
				save() and restore() methods allow us to apply specific drawing settingd only
				to selecte shaped, without affecting the rest of our canvas drawings
			*/
			/*  crates a snapshot of current canvas state, including fillStyle, lineWidth, 
				opacity (globalAlpha) as well as transformaitions and scaling
			*/
			context.save(); 
			context.globalAlpha = 0.5; // set opacity of the shapes we are drawing
			context.fill(); // fill the shape with color
			context.restore();
			context.stroke(); // outline the shape
			context.beginPath(); 
			context.moveTo(this.collisionX, this.collisionY); // will define starting at x and y coordinates of the line
			context.lineTo(this.game.mouse.x, this.game.mouse.y); // will set the ending x and y coordinates of the line
			context.stroke();

		}

		update(){
			this.dx = this.game.mouse.x - this.collisionX;
			this.dy = this.game.mouse.y - this.collisionY;
			const distance = Math.hypot(this.dy, this.dx); // Calculates the longest side of an triangle when 2 sides are given. Expects y first
			if(distance > this.speedModifier){
				this.speedX = this.dx/distance || 0;
				this.speedY = this.dy/distance || 0;
			}else{
				this.speedX = 0;
				this.speedY = 0;
			}
			this.collisionX += this.speedX * this.speedModifier;
			this.collisionY += this.speedY * this.speedModifier;
			// collisions with obstacles
			this.game.obstacles.forEach(obstacle => {
				//[(distance < sunOfRadii), distance, sunOfRadii, dx, dy]
				let [collision, distance, sunOfRadii, dx, dy] = this.game.checkCollision(this, obstacle);
				if (collision){
					const unit_x = dx / distance;
					const unit_y = dy / distance;
					this.collisionX = obstacle.collisionX + (sunOfRadii + 1) * unit_x;
					this.collisionY = obstacle.collisionY + (sunOfRadii + 1) * unit_y;
				}
			});
		}

	}

	class Obstacle {
		constructor(game){
			this.game = game;
			this.collisionX = Math.random() * this.game.width;
			this.collisionY = Math.random() * this.game.height;
			this.collisionRadius = 60;
			this.image = document.getElementById('obstacles');
			this.spriteWidth = 250;
			this.spriteHeight = 250;
			this.width = this.spriteWidth;
			this.height = this.spriteHeight;
			this.spriteX = this.collisionX - this.width * 0.5;
			this.spriteY = this.collisionY - this.height * 0.5 - 70;
			this.frameX = Math.floor(Math.random() * 4);
			this.frameY = Math.floor(Math.random() * 3);
		}
		draw(context){
			context.drawImage(this.image, this.frameX * this.spriteWidth, this.frameY * this.spriteHeight, this.spriteWidth, this.spriteHeight, this.spriteX, this.spriteY,this.width,this.height);
			context.beginPath(); // for drawing a new shape and close previous
			context.arc(this.collisionX, this.collisionY, this.collisionRadius, 0, Math.PI * 2); // at least 5 arguments
			/*
				To limit certain canvas settings only to specific draw calls we can wrap that drawing code
				between save() and restore() built-in canvas methods
				save() and restore() methods allow us to apply specific drawing settingd only
				to selecte shaped, without affecting the rest of our canvas drawings
			*/
			/*  crates a snapshot of current canvas state, including fillStyle, lineWidth, 
				opacity (globalAlpha) as well as transformaitions and scaling
			*/
			context.save(); 
			context.globalAlpha = 0.5; // set opacity of the shapes we are drawing
			context.fill(); // fill the shape with color
			context.restore();
			context.stroke(); 
		}
	}

	class Game {
		constructor(canvas){
			this.canvas = canvas;
			this.width = this.canvas.width;
			this.height = this.canvas.height;
			this.topMargin = 260; // So that they are not going over this margin on the top
			this.player = new Player(this);
			this.numberOfObstacles = 10;
			this.obstacles = [];
			this.mouse = {
				x: this.width * 0.5,
				y: this.height * 0.5,
				pressed: false
			}

			// event liytener

			// E6 arrow functions automatically inherit he reference to 'this' keyword from the parent scope 
			canvas.addEventListener('mousedown', (e) => {
				this.mouse.x = e.offsetX;
				this.mouse.y = e.offsetY;
				this.mouse.pressed = true;
			});
			canvas.addEventListener('mouseup', (e) => {
				this.mouse.x = e.offsetX;
				this.mouse.y = e.offsetY;
				this.mouse.pressed = false;
			});
			canvas.addEventListener('mousemove', (e) => {
				if (this.mouse.pressed) {
					this.mouse.x = e.offsetX;
					this.mouse.y = e.offsetY;
				}
				
			});
		}
		render(context){ // will draw and update all objects in the game
			this.obstacles.forEach(obstacle => obstacle.draw(context));
			this.player.draw(context);
			this.player.update();
		}

		checkCollision(a, b){
			const dx = a.collisionX - b.collisionX;
			const dy = a.collisionY - b.collisionY;
			const distance = Math.hypot(dy, dx);
			const sunOfRadii = a.collisionRadius + b.collisionRadius;
			return [(distance < sunOfRadii), distance, sunOfRadii, dx, dy];
		}

		// Brute force algorithmen, tries over and over
		init(){
			let attempts = 0;
			while(this.obstacles.length < this.numberOfObstacles && attempts < 500){
				let testObstacle = new Obstacle(this);
				let overlap = false;
				this.obstacles.forEach(obstacle => {
					const dx = testObstacle.collisionX - obstacle.collisionX;
					const dy = testObstacle.collisionY - obstacle.collisionY;
					const distance = Math.hypot(dy, dx);
					const distanceBuffer = 150;
					const sumOfRadii = testObstacle.collisionRadius + obstacle.collisionRadius + distanceBuffer;
					if(distance < sumOfRadii){
						overlap = true;
					}
				});
				const margin = testObstacle.collisionRadius * 2;
				if(!overlap && testObstacle.spriteX > 0 && testObstacle.spriteX < this.width - testObstacle.width && testObstacle.collisionY > this.topMargin + margin && testObstacle.collisionY < this.height - margin){
					this.obstacles.push(testObstacle);
				}
				attempts++;
			}
		}
	}

	const game = new Game(canvas);
	game.init();
	console.log(game);

	function animate(){
		ctx.clearRect(0, 0, canvas.width, canvas.height);
		game.render(ctx);
		// makes endless animate loop
		requestAnimationFrame(animate);
	}
	animate();
});