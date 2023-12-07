import {AbstractCamera, Scene} from "./index.js";
import {Vector2} from "./math/index.js";

export class AbstractRenderer {
	/** @type {?GPUDevice} */
	_device;

	/** @type {HTMLCanvasElement} */
	_canvas;

	/** @type {?String} */
	_canvasFormat;

	/** @type {?GPUCanvasContext} */
	_context;

	/** @type {Object.<String, GPUBuffer>} */
	_buffers;

	/** @type {?Scene} */
	scene;

	/** @type {?AbstractCamera} */
	camera;

	/** @param {HTMLCanvasElement} canvas */
	constructor(canvas) {
		this._canvas = canvas;
		this._buffers = {};
	}

	/** @returns {HTMLCanvasElement} */
	getCanvas() {
		return this._canvas;
	}

	/** @abstract */
	async initialize() {}

	/** @abstract */
	async createBuffers() {}

	/** @abstract */
	render() {}

	lock() {
		this._canvas.requestPointerLock();
	}

	/** @returns {Boolean} */
	isLocked() {
		return this._canvas === document.pointerLockElement;
	}

	/** @param {Vector2} viewport */
	resize(viewport) {
		this._canvas.width = viewport[0];
		this._canvas.height = viewport[1];

		/** @todo Resize the texture */
	}
}