/**
 *	@author David Valachovic
 */

"use strict"

// TODO Make a selector for choosing a structure to spawn when clicking

// Grids
var grid = []
var newGrid = []
var spawnGrid = []

// Canvas vars
var context
var canvas
var imgData

var time = 0
var timeElement
var last5DeltaTimes = []
var fpsElement
var lastTime
var timeStep = 1	// How many steps to think of before rendering

// Settings
var pixelSizes = [1, 2, 4, 8, 16, 32]
var pixelSize = 2	// Multiples of 2 (1, 2, 4, 8, 16, etc.)
var nextPixelSize
var targetFPS = 999
var actualFPS
var fadeSpeed = 1	// 1 to 255
var fadeEnabled = true
var automaton
var startingConfiguration

var aliveCellCount = 0
var aliveCellCountElement
var newCellCount = 0
var newCellCountElement

const optionName = Object.freeze({
	pixelSize: 'pixelSize'
})

// On click spawn cell selected structure
var selectedClickSpawnStructureElement

// Flags
var restartNextTick = false
var modes = ['simulator', 'creator']
var mode = 'simulator'

class cell {
	constructor(x, y, size, color) {
		this.x = x
		this.y = y
		this.size = size
		this.color = color
	}
}

class color {
	constructor(r, g, b, a) {
		this.r = r
		this.g = g
		this.b = b
		this.a = a
	}
}

window.addEventListener('DOMContentLoaded', function () {
	// Set DOM elements variables
	canvas = document.getElementById('canvas')
	context = canvas.getContext('2d')
	timeElement = document.getElementById('time')
	fpsElement = document.getElementById('fps')
	aliveCellCountElement = document.getElementById('aliveCells')
	newCellCountElement = document.getElementById('newCells')
	selectedClickSpawnStructureElement = document.getElementById('clickSpawnSelect')
	lastTime = getTimeMS()

	// Set random settings
	// automaton = automata[automataNames[randomInt(automataNames.length - 1)].toString()]
	automaton = automata['brian']
	// pixelSize = pixelSizes[randomInt(pixelSizes.length - 1)]
	pixelSize = parseInt(getOption(optionName.pixelSize)) || 2
	nextPixelSize = pixelSize
	// startingConfiguration = automaton.startingConfigs[randomInt(automaton.startingConfigs.length - 1)]
	startingConfiguration = automaton.startingConfigs[1]
	console.log(automaton.shortName)

	// Setting event listeners
	canvas.addEventListener('mousedown', onMouseDown, false)

	// Initialize UI
	document.getElementById('button-fade').checked = fadeEnabled
	console.log(startingConfiguration)
	document.getElementById('spawnSelect').value = startingConfiguration.name
	document.getElementById('simSelect').value = automaton.shortName
	document.getElementById('sizeSelect').value = pixelSize
	document.getElementById('mode-button').value = mode

	scaleCanvasToWindow(context)
	setGridSizeFromCanvas(grid, canvas, pixelSize)

	init2DArray(grid)
	init2DArray(newGrid)

	// Creates an ImageData object to store pixels to go on canvas
	imgData = context.createImageData(canvas.width, canvas.height)
	// Set all pixels to black
	fillImgData(imgData, new color(0, 0, 0, 255))

	spawnStartingConfiguration()

	// Draw grid on canvas once before starting draw loop
	gridToCanvas()

	// Start draw loop
	draw()
}, false)

function restartSimulation() {
	restartNextTick = false
	pixelSize = parseInt(nextPixelSize)
	scaleCanvasToWindow(context)
	setGridSizeFromCanvas(grid, canvas, pixelSize)

	init2DArray(grid)
	init2DArray(newGrid)

	// Creates an ImageData object to store pixels to go on canvas
	imgData = context.createImageData(canvas.width, canvas.height)
	// Set all pixels to black
	fillImgData(imgData, new color(0, 0, 0, 255))

	spawnStartingConfiguration()

	// Draw grid on canvas once before starting draw loop
	gridToCanvas()
}

function spawnStartingConfiguration() {
	startingConfiguration.spawn()
}

function draw() {
	time++
	timeElement.innerText = time

	var timestamp = getTimeMS()

	last5DeltaTimes.unshift(timestamp - lastTime)

	lastTime = timestamp

	if (last5DeltaTimes.length > 5) {
		last5DeltaTimes.pop()
	}

	actualFPS = getFPS().toPrecision(4)

	fpsElement.innerText = actualFPS

	if (restartNextTick) {
		restartSimulation()
	} else {
		spawnClickedPixels()
		for (var i = 0; i < timeStep; i++) {
			automaton.think();
			copyNewGridToGrid();
		}
		gridToCanvas();
	}

	aliveCellCountElement.innerText = aliveCellCount;
	newCellCountElement.innerText = newCellCount;

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
	for (var i = 0; i < spawnGrid.length; i++) {
		cell = spawnGrid[i];
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

let pixelSizeSquared
let pixelSize4
let y2Mod
let iMod

function gridToCanvas() {
	pixelSizeSquared = pixelSize * pixelSize
	pixelSize4 = pixelSize * 4
	y2Mod = 4 * grid.width * pixelSizeSquared
	iMod = 4 * grid.width * pixelSize
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

const modA = 255 / 4

function colorPixel(x, y) {
	let r = (x / grid.width) * 255;
	let g = (y / grid.height) * 255;
	let b = ((grid.width - x) / grid.width) * 255;
	const middleHoz = (-1 * Math.abs(((x - (grid.width / 2)) * (1 / (grid.width / 6))))) + 1;
	const middleVer = (-1 * Math.abs(((y - (grid.height / 2)) * (1 / (grid.height / 6))))) + 1;
	const middle = Math.max((middleHoz + middleVer) * modA, 0);
	r += middle;
	g += middle;
	b += middle;
	const x2 = x * pixelSize4;
	const y2 = y * y2Mod;
	let offset;
	const x2y2 = x2 + y2
	for (let i = 0; i < pixelSize; i++) {
		for (let j = 0; j < pixelSize; j++) {
			offset = x2y2 + (i * iMod) + (j * 4);
			imgData.data[0 + offset] = r;
			imgData.data[1 + offset] = g;
			imgData.data[2 + offset] = b;
		}
	}
}

function fadePixel(x, y) {
	const x2 = x * pixelSize4;
	const y2 = y * y2Mod;
	const rgb = getRGB(x2, y2);
	var offset;
	const x2y2 = x2 + y2
	for (var i = 0; i < pixelSize; i++) {
		for (var j = 0; j < pixelSize; j++) {
			offset = x2y2 + (i * iMod) + (j * 4);
			imgData.data[0 + offset] = rgb.r;
			imgData.data[1 + offset] = rgb.g;
			imgData.data[2 + offset] = rgb.b;
		}
	}
}

function getRGB(x2, y2) {
	if (!fadeEnabled) return {r: 0, g: 0, b: 0}

	const offset = x2 + y2

	return {
		r: imgData.data[0 + offset] - fadeSpeed,
		g: imgData.data[1 + offset] - fadeSpeed,
		b: imgData.data[2 + offset] - fadeSpeed
	}
}

function onMouseDown(event) {
	CellSpawner.spawnStuff(selectedClickSpawnStructureElement.value, event.x - canvas.offsetLeft, event.y - canvas.offsetTop);
}

function onCheckFade() {
	fadeEnabled = !fadeEnabled;
}

function onChangeSimSelect(element) {
	automaton = automata[element.value];
}

function onChangeSpawnSelect(element) {
	startingConfiguration = StartingCells[element.value];
}

function onClickRestartButton() {
	restartNextTick = true;
}

function onChangeSizeSelect(element) {
	nextPixelSize = element.value;
	setOption(optionName.pixelSize, nextPixelSize)
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

function getOption(name) {
	return window.localStorage.getItem(name)
}

function setOption(name, value) {
	return window.localStorage.setItem(name, value)
}
