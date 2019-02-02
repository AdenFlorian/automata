/**
 *	@author David Valachovic
 */

import {automata, automataNames} from './automata';
import {Grids} from './Grid';
import {CellSpawner} from './CellSpawner';

"use strict";


// TODO Make a selector for choosing a structure to spawn when clicking


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
const pixelSizes = [1, 2, 4, 8, 16, 32];
global.pixelSize = 2;	// Multiples of 2 (1, 2, 4, 8, 16, etc.)
var nextPixelSize;
var actualFPS;
var fadeSpeed = 1;	// 1 to 255
var fadeEnabled = true;
var automaton;
var startingConfiguration;

global.aliveCellCount = 0;
var aliveCellCountElement;
global.newCellCount = 0;
var newCellCountElement;

// On click spawn cell selected structure
var selectedClickSpawnStructureElement;

// Flags
var restartNextTick = false;
const modes = ['simulator', 'creator'];
var mode = 'simulator';

global.cell = function (x, y, size, color) {
	this.x = x;
	this.y = y;
	this.size = size;
	this.color = color;
}

const color = function (r, g, b, a) {
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
	setGridSizeFromCanvas(Grids.grid, canvas, pixelSize);

	init2DArray(Grids.grid);
	init2DArray(Grids.newGrid);

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
	setGridSizeFromCanvas(Grids.grid, canvas, pixelSize);

	init2DArray(Grids.grid);
	init2DArray(Grids.newGrid);

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

	const timestamp = getTimeMS();

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

	requestAnimationFrame(draw);
}

function getFPS() {
	var avg = 0;
	for (var i = 0; i < last5DeltaTimes.length; i++) {
		avg += last5DeltaTimes[i];
	}
	return 1000 / (avg / last5DeltaTimes.length);
}

function spawnClickedPixels() {
	var cell;
	for (var i = 0; i < Grids.spawnGrid.length; i++) {
		cell = Grids.spawnGrid[i];
		if (cell.x < 0 || cell.x > Grids.grid.width - 1 ||
			cell.y < 0 || cell.y > Grids.grid.height - 1) {
			console.log("spawn pixels out of bounds, click closer to center!");
		} else if (automaton.shortName === "Langton's Ant") {
			Grids.grid[cell.y][cell.x].state = "antOnDeadUp";
		} else {
			Grids.grid[cell.y][cell.x].state = "alive";
		}
	}
	Grids.spawnGrid = [];
}

var swap = function (x) {return x};

function copyNewGridToGrid() {
	// Copy Grids.newGrid over grid
	// Don't use Grids.newGrid.slice()
	for (var y = 0; y < Grids.grid.height; y++) {
		for (var x = 0; x < Grids.grid.width; x++) {
			Grids.grid[y][x].state = Grids.newGrid[y][x].state;
			Grids.grid[y][x].changed = Grids.newGrid[y][x].changed;
		}
	}
	/*for (var y = 0; y < Grids.grid.height; y++) {
			Grids.grid[y] = Grids.newGrid[y].slice();
	}*/
	//Grids.newGrid = swap(Grids.grid, grid = Grids.newGrid);
}

function gridToCanvas() {
	// Iterate through each grid element
	for (var y = 0; y < Grids.grid.height; y++) {
		for (var x = 0; x < Grids.grid.width; x++) {
			if (Grids.grid[y][x].state === "alive") {
				if (Grids.grid[y][x].changed) {
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
	var r = (x / Grids.grid.width) * 255;
	var g = (y / Grids.grid.height) * 255;
	var b = ((Grids.grid.width - x) / Grids.grid.width) * 255;
	const middleHoz = (-1 * Math.abs(((x - (Grids.grid.width / 2)) * (1 / (Grids.grid.width / 6))))) + 1;
	const middleVer = (-1 * Math.abs(((y - (Grids.grid.height / 2)) * (1 / (Grids.grid.height / 6))))) + 1;
	const middle = Math.max((middleHoz + middleVer) * (255 / 4), 0);
	r += middle;
	g += middle;
	b += middle;
	const x2 = x * 4 * pixelSize;
	const y2 = y * 4 * Grids.grid.width * pixelSize * pixelSize;
	var offset;
	for (var i = 0; i < pixelSize; i++) {
		for (var j = 0; j < pixelSize; j++) {
			offset = x2 + y2 + (i * 4 * Grids.grid.width * pixelSize) + (j * 4);
			imgData.data[0 + offset] = r;
			imgData.data[1 + offset] = g;
			imgData.data[2 + offset] = b;
		}
	}
}

function fadePixel(x, y) {
	const rgb = getRGB(x, y);
	const x2 = x * 4 * pixelSize;
	const y2 = y * 4 * Grids.grid.width * pixelSize * pixelSize;
	var offset;
	for (var i = 0; i < pixelSize; i++) {
		for (var j = 0; j < pixelSize; j++) {
			offset = x2 + y2 + (i * 4 * Grids.grid.width * pixelSize) + (j * 4);
			imgData.data[0 + offset] = rgb.r;
			imgData.data[1 + offset] = rgb.g;
			imgData.data[2 + offset] = rgb.b;
		}
	}
}

function getRGB(x, y) {
	if (!fadeEnabled) return {r: 0, g: 0, b: 0}

	const offset = (x * 4 * pixelSize) + (y * 4 * Grids.grid.width * pixelSize * pixelSize);

	return {
		r: imgData.data[0 + offset] - fadeSpeed,
		g: imgData.data[1 + offset] - fadeSpeed,
		b: imgData.data[2 + offset] - fadeSpeed
	}
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
	for (var i = 0; i < Grids.grid.width; i++) {
		array[i] = [];
	}
	for (var y = 0; y < array.length; y++) {
		for (var x = 0; x < Grids.grid.width; x++) {
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
