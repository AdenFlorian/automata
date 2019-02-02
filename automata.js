
import {StartingCells} from './StartingCells'
import {Grids} from './Grid';

var automaton = function (shortName, longName, startingConfigs) {

	this.startingConfigs = startingConfigs;
	this.shortName = shortName;
	this.longName = longName;

	// Assigning default neighbors finding function
	this.countNeighbors = function (x, y, state) {
		var aliveNeighborCount = 0;

		if (y > 0) {
			if (x > 0 && Grids.grid[y - 1][x - 1].state === state) {
				aliveNeighborCount++;
			}
			if (Grids.grid[y - 1][x].state === state) {
				aliveNeighborCount++;
			}
			if (x < (Grids.grid.width - 1) && Grids.grid[y - 1][x + 1].state === state) {
				aliveNeighborCount++;
			}
		}

		if (x > 0 && Grids.grid[y][x - 1].state === state) {
			aliveNeighborCount++;
		}
		if (x < (Grids.grid.width - 1) && Grids.grid[y][x + 1].state === state) {
			aliveNeighborCount++;
		}

		if (y < (Grids.grid.height - 1)) {
			if (x > 0 && Grids.grid[y + 1][x - 1].state === state) {
				aliveNeighborCount++;
			}
			if (Grids.grid[y + 1][x].state === state) {
				aliveNeighborCount++;
			}
			if (x < (Grids.grid.width - 1) && Grids.grid[y + 1][x + 1].state === state) {
				aliveNeighborCount++;
			}
		}

		return aliveNeighborCount;
	}

	this.spawnRandomStartingConfig = function () {
		this.startingConfigs[randomInt(this.startingConfigs.length - 1)]();
	}

	this.spawnStartingCells = function (spawnFunc) {
		spawnFunc();
	}

}

// Automata inits
var aumaConway = new automaton('conway', "Conway's Game of Life", [StartingCells.random]);
aumaConway.think = function () {
	aliveCellCount = 0;
	newCellCount = 0;
	// Iterate through each grid element
	for (var y = 0; y < Grids.grid.height; y++) {
		for (var x = 0; x < Grids.grid.width; x++) {
			// Count alive neighbors
			var aliveNeighborCount = this.countNeighbors(x, y, 'alive');
			var state = Grids.grid[y][x].state;
			if (state === "alive") {
				aliveCellCount++;
				if (aliveNeighborCount < 2) {
					Grids.newGrid[y][x].state = "dead";
				} else if (aliveNeighborCount == 2 || aliveNeighborCount == 3) {
					Grids.newGrid[y][x].state = "alive";
				} else {
					Grids.newGrid[y][x].state = "dead";
				}
			} else {
				if (aliveNeighborCount == 3) {
					Grids.newGrid[y][x].state = "alive";
					newCellCount++;
				} else {
					Grids.newGrid[y][x].state = "dead";
				}
			}
			if (state === Grids.newGrid[y][x].state) {
				Grids.newGrid[y][x].changed = false;
			} else {
				Grids.newGrid[y][x].changed = true;
			}
		}
	}
}

var aumaBrian = new automaton('brian', "Brian's Brain", [StartingCells.random, StartingCells.oneByTwo, StartingCells.twoByTwo]);
aumaBrian.think = function () {
	aliveCellCount = 0;
	newCellCount = 0;
	// Iterate through each grid element
	for (var y = 0; y < Grids.grid.height; y++) {
		for (var x = 0; x < Grids.grid.width; x++) {
			var state = Grids.grid[y][x].state;
			if (state === "alive") {
				aliveCellCount++;
				Grids.newGrid[y][x].state = "dying";
			} else if (state === "dying") {
				Grids.newGrid[y][x].state = "dead";
			} else if (this.countNeighbors(x, y, 'alive') === 2) {
				Grids.newGrid[y][x].state = "alive";
				newCellCount++;
			}
			if (state === Grids.newGrid[y][x]) {
				Grids.newGrid[y][x].changed = false;
			} else {
				Grids.newGrid[y][x].changed = true;
			}
		}
	}
}

var aumaLangton = new automaton('langton', "Langton's Ant", [StartingCells.langton]);
aumaLangton.think = function () {
	aliveCellCount = 0;
	newCellCount = 0;
	// Iterate through each grid element
	for (var y = 0; y < Grids.grid.height; y++) {
		for (var x = 0; x < Grids.grid.width; x++) {
			// Dead goes right, alive goes left
			var state = Grids.grid[y][x].state;
			if (state === "antOnAliveLeft") {
				Grids.newGrid[y][x].state = "dead";
				if (y < (Grids.grid.height - 1)) {
					if (Grids.newGrid[y + 1][x].state === "alive") {
						Grids.newGrid[y + 1][x].state = "antOnAliveDown";
					} else {
						Grids.newGrid[y + 1][x].state = "antOnDeadDown";
					}
				}
			} else if (state === "antOnAliveUp") {
				Grids.newGrid[y][x].state = "dead";
				if (x > 0) {
					if (Grids.newGrid[y][x - 1].state === "alive") {
						Grids.newGrid[y][x - 1].state = "antOnAliveLeft";
					} else {
						Grids.newGrid[y][x - 1].state = "antOnDeadLeft";
					}
				}
			} else if (state === "antOnAliveRight") {
				Grids.newGrid[y][x].state = "dead";
				if (y > 0) {
					if (Grids.newGrid[y - 1][x].state === "alive") {
						Grids.newGrid[y - 1][x].state = "antOnAliveUp";
					} else {
						Grids.newGrid[y - 1][x].state = "antOnDeadUp";
					}
				}
			} else if (state === "antOnAliveDown") {
				Grids.newGrid[y][x].state = "dead";
				if (x < (Grids.grid.width - 1)) {
					if (Grids.newGrid[y][x + 1].state === "alive") {
						Grids.newGrid[y][x + 1].state = "antOnAliveRight";
					} else {
						Grids.newGrid[y][x + 1].state = "antOnDeadRight";
					}
				}
			} else if (state === "antOnDeadLeft") {
				Grids.newGrid[y][x].state = "alive";
				if (y > 0) {
					if (Grids.newGrid[y - 1][x].state === "alive") {
						Grids.newGrid[y - 1][x].state = "antOnAliveUp";
					} else {
						Grids.newGrid[y - 1][x].state = "antOnDeadUp";
					}
				}
			} else if (state === "antOnDeadUp") {
				Grids.newGrid[y][x].state = "alive";
				if (x < (Grids.grid.width - 1)) {
					if (Grids.newGrid[y][x + 1].state === "alive") {
						Grids.newGrid[y][x + 1].state = "antOnAliveRight";
					} else {
						Grids.newGrid[y][x + 1].state = "antOnDeadRight";
					}
				}
			} else if (state === "antOnDeadRight") {
				Grids.newGrid[y][x].state = "alive";
				if (y < (Grids.grid.height - 1)) {
					if (Grids.newGrid[y + 1][x].state === "alive") {
						Grids.newGrid[y + 1][x].state = "antOnAliveDown";
					} else {
						Grids.newGrid[y + 1][x].state = "antOnDeadDown";
					}
				}
			} else if (state === "antOnDeadDown") {
				Grids.newGrid[y][x].state = "alive";
				if (x > 0) {
					if (Grids.newGrid[y][x - 1].state === "alive") {
						Grids.newGrid[y][x - 1].state = "antOnAliveLeft";
					} else {
						Grids.newGrid[y][x - 1].state = "antOnDeadLeft";
					}
				}
			} else if (state === "alive") {
				//Grids.newGrid[y][x].state = "alive";
			} else {
				//Grids.newGrid[y][x].state = "dead";
			}
			if (state === Grids.newGrid[y][x].state) {
				Grids.newGrid[y][x].changed = false;
			} else {
				Grids.newGrid[y][x].changed = true;
			}
		}
	}
}

// Holds names of different automata for picking a random one
export const automataNames = ['conway', 'brian', 'langton'];

// Object to access automata by short names
export const automata = {
	'conway': aumaConway,
	'brian': aumaBrian,
	'langton': aumaLangton
}
