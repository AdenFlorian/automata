import {Grids} from "./Grid";

export const StartingCells = {

	langton: {
		name: 'langton',
		spawn: function () {
			for (var x = 0; x < Grids.grid.width; x++) {
				for (var y = 0; y < Grids.grid.height; y++) {
					Grids.grid[y][x].state = "dead";
					Grids.newGrid[y][x].state = "dead";
				}
			}
			var halfHeight = Math.floor(Grids.grid.height / 2);
			var halfWidth = Math.floor(Grids.grid.width / 2);
			Grids.grid[halfHeight][halfWidth].state = "antOnDeadLeft";
		}
	},

	random: {
		name: 'random',
		spawn: function () {
			var x, y;
			for (x = 0; x < Grids.grid.width; x++) {
				for (y = 0; y < Grids.grid.height; y++) {
					if (y === 1919) {
						console.log("YYYY " + y);
					}
					var randNum = Math.random();
					if (automaton === "Langton's Ant") {
						if (randNum > .9999) {
							Grids.grid[y][x].state = "antOnDeadLeft";
						} else if (randNum > .998) {
							Grids.grid[y][x].state = "antOnDeadUp";
						} else if (randNum > .997) {
							Grids.grid[y][x].state = "antOnDeadRight";
						} else if (randNum > .996) {
							Grids.grid[y][x].state = "antOnDeadDown";
						} else if (randNum > .95) {
							Grids.grid[y][x].state = "alive";
						} else {
							Grids.grid[y][x].state = "dead";
						}
					} else {
						var moreRandom = Math.random() > 0.91 ? "alive" : "dead";
						Grids.grid[y][x].state = moreRandom;
					}
					Grids.newGrid[y][x].state = Grids.grid[y][x].state;
				}
			}
		}
	},

	twoByTwo: {
		name: '2x2',
		spawn: function () {
			for (var x = 0; x < Grids.grid.width; x++) {
				for (var y = 0; y < Grids.grid.height; y++) {
					Grids.grid[y][x].state = "dead";
					Grids.newGrid[y][x].state = "dead";
				}
			}
			var halfHeight = Math.floor(Grids.grid.height / 2);
			var halfWidth = Math.floor(Grids.grid.width / 2);
			Grids.grid[halfHeight][halfWidth].state = "alive";
			Grids.grid[halfHeight][halfWidth + 1].state = "alive";
			Grids.grid[halfHeight + 1][halfWidth].state = "alive";
			Grids.grid[halfHeight + 1][halfWidth + 1].state = "alive";
		}
	},

	oneByTwo: {
		name: '1x2',
		spawn: function () {
			for (var x = 0; x < Grids.grid.width; x++) {
				for (var y = 0; y < Grids.grid.height; y++) {
					Grids.grid[y][x].state = "dead";
					Grids.newGrid[y][x].state = "dead";
				}
			}
			var halfHeight = Math.floor(Grids.grid.height / 2);
			var halfWidth = Math.floor(Grids.grid.width / 2);
			Grids.grid[halfHeight][halfWidth].state = "alive";
			Grids.grid[halfHeight][halfWidth + 1].state = "alive";
		}
	}

}
