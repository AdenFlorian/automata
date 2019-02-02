import {Grids} from "./Grid";

export const CellSpawner = {
	spawnStuff: function (structure, x, y) {
		this[structure](Math.floor(x / pixelSize), Math.floor(y / pixelSize));
	},

	gliderStar: function (x, y) {
		this.spawnGliderUpRight(x + 4, y);
		this.spawnGliderUpLeft(x, y - 4);
		this.spawnGliderDownLeft(x - 4, y);
		this.spawnGliderDownRight(x, y + 4);
	},

	spawnGliderUpRight: function (x, y) {
		Grids.spawnGrid.push(new cell(x, y));
		Grids.spawnGrid.push(new cell(x + 1, y));
		Grids.spawnGrid.push(new cell(x + 2, y));
		Grids.spawnGrid.push(new cell(x + 2, y + 1));
		Grids.spawnGrid.push(new cell(x + 1, y + 2));
	},

	spawnGliderUpLeft: function (x, y) {
		Grids.spawnGrid.push(new cell(x, y));
		Grids.spawnGrid.push(new cell(x + 1, y));
		Grids.spawnGrid.push(new cell(x + 2, y));
		Grids.spawnGrid.push(new cell(x, y + 1));
		Grids.spawnGrid.push(new cell(x + 1, y + 2));
	},

	spawnGliderDownLeft: function (x, y) {
		Grids.spawnGrid.push(new cell(x, y));
		Grids.spawnGrid.push(new cell(x, y + 1));
		Grids.spawnGrid.push(new cell(x, y + 2));
		Grids.spawnGrid.push(new cell(x + 2, y + 1));
		Grids.spawnGrid.push(new cell(x + 1, y + 2));
	},

	spawnGliderDownRight: function (x, y) {
		Grids.spawnGrid.push(new cell(x, y));
		Grids.spawnGrid.push(new cell(x, y + 1));
		Grids.spawnGrid.push(new cell(x, y + 2));
		Grids.spawnGrid.push(new cell(x - 1, y + 2));
		Grids.spawnGrid.push(new cell(x - 2, y + 1));
	},

	spawnLine: function (x, y) {
		Grids.spawnGrid.push(new cell(x, y));
		Grids.spawnGrid.push(new cell(x + 1, y));
		Grids.spawnGrid.push(new cell(x + 2, y));
	},

	spawnAnt: function (x, y) {
		Grids.spawnGrid.push(new cell(x, y));
	},

	twoByTwo: function (x, y) {
		Grids.spawnGrid.push(new cell(x, y));
		Grids.spawnGrid.push(new cell(x + 1, y));
		Grids.spawnGrid.push(new cell(x, y + 1));
		Grids.spawnGrid.push(new cell(x + 1, y + 1));
	},

	oneByTwo: function (x, y) {
		Grids.spawnGrid.push(new cell(x, y));
		Grids.spawnGrid.push(new cell(x + 1, y));
	}
}

