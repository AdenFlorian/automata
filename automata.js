var automaton = function(shortName, longName, startingConfigs) {

	this.startingConfigs = startingConfigs;
	this.shortName = shortName;
	this.longName = longName;

	// Assigning default neighbors finding function
	this.countNeighbors = function(x, y, state) {
		var aliveNeighborCount = 0;
		
		if (y > 0) {
			if (x > 0 && grid[y - 1][x - 1].state === state) {
				aliveNeighborCount++;
			}
			if (grid[y - 1][x].state === state) {
				aliveNeighborCount++;
			}
			if (x < (grid.width - 1) && grid[y - 1][x + 1].state === state) {
				aliveNeighborCount++;
			}
		}
		
		if (x > 0 && grid[y][x - 1].state === state) {
			aliveNeighborCount++;
		}
		if (x < (grid.width - 1) && grid[y][x + 1].state === state) {
			aliveNeighborCount++;
		}
		
		if (y < (grid.height - 1)) {
			if (x > 0 && grid[y + 1][x - 1].state === state) {
				aliveNeighborCount++;
			}
			if (grid[y + 1][x].state === state) {
				aliveNeighborCount++;
			}
			if (x < (grid.width - 1) && grid[y + 1][x + 1].state === state) {
				aliveNeighborCount++;
			}
		}
		
		return aliveNeighborCount;
	}

	this.spawnRandomStartingConfig = function() {
		this.startingConfigs[randomInt(this.startingConfigs.length - 1)]();
	}

	this.spawnStartingCells = function(spawnFunc) {
		spawnFunc();
	}

}

// Automata inits
var aumaConway = new automaton('conway', "Conway's Game of Life", [StartingCells.random]);
aumaConway.think = function() {
	aliveCellCount = 0;
	newCellCount = 0;
	// Iterate through each grid element
	for (var y = 0; y < grid.height; y++) {
		for (var x = 0; x < grid.width; x++) {
			// Count alive neighbours
			var aliveNeighborCount = this.countNeighbors(x, y, 'alive');
			var state = grid[y][x].state;
			if (state === "alive") {
				aliveCellCount++;
				if (aliveNeighborCount < 2) {
					newGrid[y][x].state = "dead";
				} else if (aliveNeighborCount == 2 || aliveNeighborCount == 3) {
					newGrid[y][x].state = "alive";
				} else {
					newGrid[y][x].state = "dead";
				}
			} else {
				if (aliveNeighborCount == 3) {
					newGrid[y][x].state = "alive";
					newCellCount++;
				} else {
					newGrid[y][x].state = "dead";
				}
			}
			if (state === newGrid[y][x].state) {
				newGrid[y][x].changed = false;
			} else {
				newGrid[y][x].changed = true;
			}
		}
	}
}

var aumaBrian = new automaton('brian', "Brian's Brain", [StartingCells.random, StartingCells.oneByTwo, StartingCells.twoByTwo]);
aumaBrian.think = function() {
	aliveCellCount = 0;
	newCellCount = 0;
	// Iterate through each grid element
	for (var y = 0; y < grid.height; y++) {
		for (var x = 0; x < grid.width; x++) {
			// Count alive neighbours
			var aliveNeighborCount = this.countNeighbors(x, y, 'alive');
			var state = grid[y][x].state;
			if (state === "alive") {
				aliveCellCount++;
				newGrid[y][x].state = "dying";
			} else if (state === "dying") {
				newGrid[y][x].state = "dead";
			} else if (aliveNeighborCount === 2) {
				newGrid[y][x].state = "alive";
				newCellCount++;
			}
			if (state === newGrid[y][x]) {
				newGrid[y][x].changed = false;
			} else {
				newGrid[y][x].changed = true;
			}
		}
	}
}

var aumaLangton = new automaton('langton', "Langton's Ant", [StartingCells.langton]);
aumaLangton.think = function() {
	aliveCellCount = 0;
	newCellCount = 0;
	// Iterate through each grid element
	for (var y = 0; y < grid.height; y++) {
		for (var x = 0; x < grid.width; x++) {
			// Dead goes right, alive goes left
			var state = grid[y][x].state;
			if (state === "antOnAliveLeft") {
				newGrid[y][x].state = "dead";
				if (y < (grid.height - 1)) {
					if (newGrid[y + 1][x].state === "alive") {
						newGrid[y + 1][x].state = "antOnAliveDown";
					} else {
						newGrid[y + 1][x].state = "antOnDeadDown";
					}
				}
			} else if (state === "antOnAliveUp") {
				newGrid[y][x].state = "dead";
				if (x > 0) {
					if (newGrid[y][x - 1].state === "alive") {
						newGrid[y][x - 1].state = "antOnAliveLeft";
					} else {
						newGrid[y][x - 1].state = "antOnDeadLeft";
					}
				}
			} else if (state === "antOnAliveRight") {
				newGrid[y][x].state = "dead";
				if (y > 0) {
					if (newGrid[y - 1][x].state === "alive") {
						newGrid[y - 1][x].state = "antOnAliveUp";
					} else {
						newGrid[y - 1][x].state = "antOnDeadUp";
					}
				}
			} else if (state === "antOnAliveDown") {
				newGrid[y][x].state = "dead";
				if (x < (grid.width - 1)) {
					if (newGrid[y][x + 1].state === "alive") {
						newGrid[y][x + 1].state = "antOnAliveRight";
					} else {
						newGrid[y][x + 1].state = "antOnDeadRight";
					}
				}
			} else if (state === "antOnDeadLeft") {
				newGrid[y][x].state = "alive";
				if (y > 0) {
					if (newGrid[y - 1][x].state === "alive") {
						newGrid[y - 1][x].state = "antOnAliveUp";
					} else {
						newGrid[y - 1][x].state = "antOnDeadUp";
					}
				}
			} else if (state === "antOnDeadUp") {
				newGrid[y][x].state = "alive";
				if (x < (grid.width - 1)) {
					if (newGrid[y][x + 1].state === "alive") {
						newGrid[y][x + 1].state = "antOnAliveRight";
					} else {
						newGrid[y][x + 1].state = "antOnDeadRight";
					}
				}
			} else if (state === "antOnDeadRight") {
				newGrid[y][x].state = "alive";
				if (y < (grid.height - 1)) {
					if (newGrid[y + 1][x].state === "alive") {
						newGrid[y + 1][x].state = "antOnAliveDown";
					} else {
						newGrid[y + 1][x].state = "antOnDeadDown";
					}
				}
			} else if (state === "antOnDeadDown") {
				newGrid[y][x].state = "alive";
				if (x > 0) {
					if (newGrid[y][x - 1].state === "alive") {
						newGrid[y][x - 1].state = "antOnAliveLeft";
					} else {
						newGrid[y][x - 1].state = "antOnDeadLeft";
					}
				}
			} else if (state === "alive") {
				//newGrid[y][x].state = "alive";
			} else {
				//newGrid[y][x].state = "dead";
			}
			if (state === newGrid[y][x].state) {
				newGrid[y][x].changed = false;
			} else {
				newGrid[y][x].changed = true;
			}
		}
	}
}

// Holds names of different automata for picking a random one
var automataNames = ['conway', 'brian', 'langton'];

// Object to access automata by short names
var automata = {
	'conway': aumaConway,
	'brian': aumaBrian,
	'langton': aumaLangton
}
