/**
 *	@author David Valachovic
 */

"use strict";

// TODO Make a selector for choosing a structure to spawn when clicking

// Grids
var grid = [];
var newGrid = [];
var spawnGrid = [];

// Canvas vars
var context;
var canvas;
var imgData;

var time = 0;
var timeElement;
var last5DeltaTimes = [];
var fpsElement;
var lastTime;
var timeStep = 1;	// How many steps to think of before rendering

// Settings
var pixelSizes = [1, 2, 4, 8, 16, 32];
var pixelSize = 2;	// Multiples of 2 (1, 2, 4, 8, 16, etc.)
var nextPixelSize;
var targetFPS = 999;
var actualFPS;
var fadeSpeed = 1;	// 1 to 255
var fadeEnabled = true;
var automaton;
var startingConfiguration;

var aliveCellCount = 0;
var aliveCellCountElement;
var newCellCount = 0;
var newCellCountElement;

// On click spawn cell selected structure
var selectedClickSpawnStructureElement;

// Flags
var restartNextTick = false;
var modes = ['simulator', 'creator'];
var mode = 'simulator';

var cell = function (x, y, size, color) {
	this.x = x;
	this.y = y;
	this.size = size;
	this.color = color;
}

var color = function (r, g, b, a) {
	this.r = r;
	this.g = g;
	this.b = b;
	this.a = a;
}

$(function () {
	// Set DOM elements variables
	canvas = document.getElementById('canvas');
	context = canvas.getContext("2d");
	timeElement = $('#time');
	fpsElement = $('#fps');
	aliveCellCountElement = $('#aliveCells');
	newCellCountElement = $('#newCells');
	selectedClickSpawnStructureElement = $('#clickSpawnSelect');
	lastTime = getTimeMS();

	// Set random settings
	automaton = automata[automataNames[randomInt(automataNames.length - 1)].toString()];
	automaton = automata["brian"];
	pixelSize = pixelSizes[randomInt(pixelSizes.length - 1)];
	pixelSize = 2;
	nextPixelSize = pixelSize;
	startingConfiguration = automaton.startingConfigs[randomInt(automaton.startingConfigs.length - 1)];
	startingConfiguration = automaton.startingConfigs[1];
	console.log(automaton.shortName);

	// Setting event listeners
	canvas.addEventListener("mousedown", onMouseDown, false);

	// Initialize UI
	$("#button-fade").attr('checked', fadeEnabled);
	console.log(startingConfiguration.toString());
	$("#spawnSelect").val(startingConfiguration.name);
	$("#simSelect").val(automaton.shortName);
	$("#sizeSelect").val(pixelSize);
	$('#mode-button').val(mode);

	scaleCanvasToWindow(context);
	setGridSizeFromCanvas(grid, canvas, pixelSize);

	init2DArray(grid);
	init2DArray(newGrid);

	// Creates an ImageData object to store pixels to go on canvas
	imgData = context.createImageData(canvas.width, canvas.height);
	// Set all pixels to black
	fillImgData(imgData, new color(0, 0, 0, 255));

	spawnStartingConfiguration();

	// Draw grid on canvas once before starting draw loop
	gridToCanvas();

	// Start draw loop
	draw();
});

function restartSimulation() {
	restartNextTick = false;
	pixelSize = nextPixelSize;
	scaleCanvasToWindow(context);
	setGridSizeFromCanvas(grid, canvas, pixelSize);

	init2DArray(grid);
	init2DArray(newGrid);

	// Creates an ImageData object to store pixels to go on canvas
	imgData = context.createImageData(canvas.width, canvas.height);
	// Set all pixels to black
	fillImgData(imgData, new color(0, 0, 0, 255));

	spawnStartingConfiguration();

	// Draw grid on canvas once before starting draw loop
	gridToCanvas();
}

function spawnStartingConfiguration() {
	startingConfiguration.spawn();
}

function draw() {
	time++;
	timeElement.text(time);

	var timestamp = getTimeMS();

	last5DeltaTimes.unshift(timestamp - lastTime);

	lastTime = timestamp;

	if (last5DeltaTimes.length > 5) {
		last5DeltaTimes.pop();
	}

	actualFPS = getFPS().toPrecision(4);

	fpsElement.text(actualFPS);

	if (restartNextTick) {
		restartSimulation();
	} else {
		spawnClickedPixels();
		for (var i = 0; i < timeStep; i++) {
			automaton.think();
			copyNewGridToGrid();
		}
		gridToCanvas();
	}

	aliveCellCountElement.text(aliveCellCount);
	newCellCountElement.text(newCellCount);

	setTimeout(draw, 1000 / targetFPS);
}

function getFPS() {
	var avg = 0;
	for (var i = 0; i < last5DeltaTimes.length; i++) {
		avg += last5DeltaTimes[i];
	}
	return 1000 / (avg / last5DeltaTimes.length);
}

function spawnClickedPixels() {
	for (var i = 0; i < spawnGrid.length; i++) {
		var cell = spawnGrid[i];
		if (cell.x < 0 || cell.x > grid.width - 1 ||
			cell.y < 0 || cell.y > grid.height - 1) {
			console.log("spawn pixels out of bounds, click closer to center!");
		} else if (automaton.shortName === "Langton's Ant") {
			grid[cell.y][cell.x].state = "antOnDeadUp";
		} else {
			grid[cell.y][cell.x].state = "alive";
		}
	}
	spawnGrid = [];
}

var swap = function (x) {return x};

function copyNewGridToGrid() {
	// Copy newGrid over grid
	// Don't use newGrid.slice()
	for (var y = 0; y < grid.height; y++) {
		for (var x = 0; x < grid.width; x++) {
			grid[y][x].state = newGrid[y][x].state;
			grid[y][x].changed = newGrid[y][x].changed;
		}
	}
	/*for (var y = 0; y < grid.height; y++) {
			grid[y] = newGrid[y].slice();
	}*/
	//newGrid = swap(grid, grid = newGrid);
}

function gridToCanvas() {
	// Iterate through each grid element
	for (var y = 0; y < grid.height; y++) {
		for (var x = 0; x < grid.width; x++) {
			if (grid[y][x].state === "alive") {
				if (grid[y][x].changed) {
					colorPixel(x, y);
				}
			} else {
				fadePixel(x, y);
			}
		}
	}
	// Draws imgData on canvas
	context.putImageData(imgData, 0, 0);
}

function colorPixel(x, y) {
	var r = (x / grid.width) * 255;
	var g = (y / grid.height) * 255;
	var b = ((grid.width - x) / grid.width) * 255;
	var middleHoz = (-1 * Math.abs(((x - (grid.width / 2)) * (1 / (grid.width / 6))))) + 1;
	var middleVer = (-1 * Math.abs(((y - (grid.height / 2)) * (1 / (grid.height / 6))))) + 1;
	var middle = Math.max((middleHoz + middleVer) * (255 / 4), 0);
	r += middle;
	g += middle;
	b += middle;
	var x2 = x * 4 * pixelSize;
	var y2 = y * 4 * grid.width * pixelSize * pixelSize;
	for (var i = 0; i < pixelSize; i++) {
		for (var j = 0; j < pixelSize; j++) {
			var offset = x2 + y2 + (i * 4 * grid.width * pixelSize) + (j * 4);
			imgData.data[0 + offset] = r;
			imgData.data[1 + offset] = g;
			imgData.data[2 + offset] = b;
		}
	}
}

function fadePixel(x, y) {
	var rgb = getRGB(x, y);
	var x2 = x * 4 * pixelSize;
	var y2 = y * 4 * grid.width * pixelSize * pixelSize;
	for (var i = 0; i < pixelSize; i++) {
		for (var j = 0; j < pixelSize; j++) {
			var offset = x2 + y2 + (i * 4 * grid.width * pixelSize) + (j * 4);
			imgData.data[0 + offset] = rgb.r;
			imgData.data[1 + offset] = rgb.g;
			imgData.data[2 + offset] = rgb.b;
		}
	}
	return true;
}

function getRGB(x, y) {
	var offset = (x * 4 * pixelSize) + (y * 4 * grid.width * pixelSize * pixelSize);

	if (fadeEnabled) {
		var rgb = {
			r: imgData.data[0 + offset] - fadeSpeed,
			g: imgData.data[1 + offset] - fadeSpeed,
			b: imgData.data[2 + offset] - fadeSpeed
		}
	} else {
		var rgb = {
			r: 0,
			g: 0,
			b: 0
		}
	}
	return rgb;
}

function onMouseDown(event) {
	CellSpawner.spawnStuff(selectedClickSpawnStructureElement.val(), event.x - canvas.offsetLeft, event.y - canvas.offsetTop);
}

function onCheckFade() {
	fadeEnabled = !fadeEnabled;
}

function onChangeSimSelect(element) {
	automaton = automata[element.value];
}

function onChangeSpawnSelect(element) {
	startingConfiguration = element.value;
}

function onClickRestartButton() {
	restartNextTick = true;
}

function onChangeSizeSelect(element) {
	nextPixelSize = element.value;
	console.log('nextPixelSize: ' + nextPixelSize);
}

function scaleCanvasToWindow(context) {
	context.canvas.width = window.innerWidth;
	context.canvas.height = window.innerHeight;
}

function setGridSizeFromCanvas(grid, canvas, pixelSize) {
	// Set grid width and height based off of pixelSize (scale)
	grid.width = canvas.width * (1 / pixelSize);
	grid.height = canvas.height * (1 / pixelSize);
}

function init2DArray(array) {
	// Initialize to 2 dimensional arrays
	for (var i = 0; i < grid.width; i++) {
		array[i] = [];
	}
	for (var y = 0; y < array.length; y++) {
		for (var x = 0; x < grid.width; x++) {
			array[y][x] = new Object();
		}
	}
}

function fillImgData(imgData, color) {
	for (var i = 0; i < imgData.data.length; i += 4) {
		imgData.data[i + 0] = 0;
		imgData.data[i + 1] = 0;
		imgData.data[i + 2] = 0;
		imgData.data[i + 3] = 255;
	}
}

function onClickModeButton(element) {
	if (mode === 'simulator') {
		switchToCreatorMode();
		element.innerHTML = 'Creator';
	} else {
		switchToSimulatorMode();
		element.innerHTML = 'Simulator';
	}
}

function onClickSpawnSelect(element) {
	//CellSpawner[element.value](event.x - canvas.offsetLeft, event.y - canvas.offsetTop);
}

function switchToSimulatorMode() {mode = 'simulator';}

function switchToCreatorMode() {mode = 'creator';}

function getTimeMS() {return new Date().getTime();}

function randomInt(max) {return Math.round(Math.random() * max);}
