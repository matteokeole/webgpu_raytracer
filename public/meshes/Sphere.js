import {Mesh} from "../../src/index.js";
import {Vector3} from "../../src/math/index.js";

/**
 * @typedef {Object} SphereDescriptor
 * @property {Vector3} position
 * @property {Number} materialIndex
 * @property {Number} radius
 */

export class Sphere extends Mesh {
	/**
	 * @type {Number}
	 */
	#radius;

	/**
	 * @param {SphereDescriptor} descriptor
	 */
	constructor(descriptor) {
		super(descriptor);

		this.#radius = descriptor.radius;
	}

	getRadius() {
		return this.#radius;
	}

	asBuffer() {
		const buffer = new Float32Array(Mesh.BUFFER_SIZE);
		buffer.set(this.getPosition());
		buffer[4] = this.#radius;
		buffer[5] = this.getMaterialIndex();

		return buffer;
	}
}