import {Camera, Scene} from "./index.js";
import {Vector2} from "./math/index.js";

/**
 * @typedef {Object} RendererDescriptor
 * @property {HTMLCanvasElement} canvas
 */

export class Renderer {
	/**
	 * @type {?GPUDevice}
	 */
	_device;

	/**
	 * @type {HTMLCanvasElement}
	 */
	_canvas;

	/**
	 * @type {?GPUCanvasContext}
	 */
	_context;

	/**
	 * @type {Record.<String, GPUBuffer>}
	 */
	_buffers;

	/**
	 * @type {?Scene}
	 */
	#scene;

	/**
	 * @type {?Camera}
	 */
	#camera;

	/**
	 * @param {RendererDescriptor} descriptor
	 */
	constructor(descriptor) {
		this._device = null;
		this._canvas = descriptor.canvas;
		this._context = null;
		this._buffers = {};
		this.#scene = null;
		this.#camera = null;
	}

	getCanvas() {
		return this._canvas;
	}

	getScene() {
		return this.#scene;
	}

	/**
	 * @param {Scene} scene
	 */
	setScene(scene) {
		this.#scene = scene;
	}

	getCamera() {
		return this.#camera;
	}

	/**
	 * @param {Camera} camera
	 */
	setCamera(camera) {
		this.#camera = camera;
	}

	isLocked() {
		return this._canvas === document.pointerLockElement;
	}

	/**
	 * @abstract
	 */
	async initialize() {
		throw new Error("Not implemented");
	}

	/**
	 * @abstract
	 */
	async createBuffers() {
		throw new Error("Not implemented");
	}

	/**
	 * @abstract
	 */
	render() {
		throw new Error("Not implemented");
	}

	lock() {
		this._canvas.requestPointerLock();
	}

	/**
	 * @param {Vector2} viewport
	 */
	resize(viewport) {
		this._canvas.width = viewport[0];
		this._canvas.height = viewport[1];

		/** @todo Resize the texture */
	}

	/**
	 * @param {String} source
	 */
	_createShaderModule(source) {
		return this._device.createShaderModule({
			code: source,
		});
	}
}