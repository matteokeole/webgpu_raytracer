import {Vector3} from "./math/index.js";

/**
 * @typedef {Object} MeshDescriptor
 * @property {Vector3} position
 * @property {Number} materialIndex
 */

export class Mesh {
	/**
	 * @type {Number}
	 */
	static BUFFER_SIZE = 8;

	/**
	 * @type {Vector3}
	 */
	#position;

	/**
	 * @type {Number}
	 */
	#materialIndex;

	/**
	 * @param {MeshDescriptor} descriptor
	 */
	constructor(descriptor) {
		this.#position = descriptor.position;
		this.#materialIndex = descriptor.materialIndex;
	}

	getPosition() {
		return this.#position;
	}

	getMaterialIndex() {
		return this.#materialIndex;
	}

	/**
	 * @abstract
	 * @returns {Float32Array}
	 */
	asBuffer() {
		throw new Error("Not implemented");
	}
}