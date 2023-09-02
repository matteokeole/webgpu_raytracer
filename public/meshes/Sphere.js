import {Mesh} from "src";
import {Vector3} from "src/math";

export class Sphere extends Mesh {
	/** @type {Number} */
	#radius;

	/**
	 * @param {Object} options
	 * @param {Vector3} options.position
	 * @param {Number} options.radius
	 * @param {Number} options.materialIndex
	 */
	constructor({position, radius, materialIndex}) {
		super(position, materialIndex);

		this.#radius = radius;
	}

	/** @override */
	getBuffer() {
		const buffer = new Float32Array(Mesh.BUFFER_SIZE);
		buffer.set(this._position);
		buffer[4] = this.#radius;
		buffer[5] = this._materialIndex;

		return buffer;
	}
}