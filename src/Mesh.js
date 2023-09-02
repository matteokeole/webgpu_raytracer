import {Vector3} from "./math/index.js";

export class Mesh {
	/** @type {Number} */
	static BUFFER_SIZE = 8;

	/** @type {Vector3} */
	_position;

	/** @type {Number} */
	_materialIndex;

	/**
	 * @param {Vector3} position
	 * @param {Number} materialIndex
	 */
	constructor(position, materialIndex) {
		this._position = position;
		this._materialIndex = materialIndex;
	}

	/**
	 * @abstract
	 * @returns {Float32Array}
	 */
	getBuffer() {}
}