var StartingCells = {

	langton: {
		name: 'langton',
		spawn: function() {
			for (var x = 0; x < grid.width; x++) {
				for (var y = 0; y < grid.height; y++) {
					grid[y][x].state = "dead";
					newGrid[y][x].state = "dead";
				}
			}
			var halfHeight = Math.floor(grid.height / 2);
			var halfWidth = Math.floor(grid.width / 2);
			grid[halfHeight][halfWidth].state = "antOnDeadLeft";
		}
	},

	random: {
		name: 'random',
		spawn: function() {
			var x, y;
			for (x = 0; x < grid.width; x++) {
				for (y = 0; y < grid.height; y++) {
					if (y === 1919) {
						console.log("YYYY " + y);
					}
					var randnum = Math.random();
					if (automaton === "Langton's Ant") {
						if (randnum > .9999) {
							grid[y][x].state = "antOnDeadLeft";
						} else if(randnum > .998) {
							grid[y][x].state = "antOnDeadUp";
						} else if(randnum > .997) {
							grid[y][x].state = "antOnDeadRight";
						} else if(randnum > .996) {
							grid[y][x].state = "antOnDeadDown";
						} else if(randnum > .95) {
							grid[y][x].state = "alive";
						} else {
							grid[y][x].state = "dead";
						}
					} else {
						var rannn = Math.random() > 0.91 ? "alive" : "dead";
						grid[y][x].state = rannn;
					}
					newGrid[y][x].state = grid[y][x].state;
				}
			}
		}
	},

	twoByTwo: {
		name: '2x2',
		spawn: function() {
			for (var x = 0; x < grid.width; x++) {
				for (var y = 0; y < grid.height; y++) {
					grid[y][x].state = "dead";
					newGrid[y][x].state = "dead";
				}
			}
			var halfHeight = Math.floor(grid.height / 2);
			var halfWidth = Math.floor(grid.width / 2);
			grid[halfHeight][halfWidth].state = "alive";
			grid[halfHeight][halfWidth + 1].state = "alive";
			grid[halfHeight + 1][halfWidth].state = "alive";
			grid[halfHeight + 1][halfWidth + 1].state = "alive";
		}
	},

	oneByTwo: {
		name: '1x2',
		spawn: function() {
			for (var x = 0; x < grid.width; x++) {
				for (var y = 0; y < grid.height; y++) {
					grid[y][x].state = "dead";
					newGrid[y][x].state = "dead";
				}
			}
			var halfHeight = Math.floor(grid.height / 2);
			var halfWidth = Math.floor(grid.width / 2);
			grid[halfHeight][halfWidth].state = "alive";
			grid[halfHeight][halfWidth + 1].state = "alive";
		}
	}

}