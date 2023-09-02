import {Vector3} from "./math/index.js";

export class Material {
	/** @type {Number} */
	static BUFFER_SIZE = 12;

	/** @type {Number} */
	#id;

	/** @type {Vector3} */
	#albedo;

	/** @type {Number} */
	#roughness;

	/** @type {Vector3} */
	#emissionColor;

	/** @type {Number} */
	#emissionStrength;

	/**
	 * @param {Object} options
	 * @param {Number} options.id
	 * @param {Vector3} options.albedo
	 * @param {Number} options.roughness
	 * @param {Vector3} options.emissionColor
	 * @param {Number} options.emissionStrength
	 */
	constructor({id, albedo, roughness, emissionColor, emissionStrength}) {
		this.#id = id;
		this.#albedo = albedo;
		this.#roughness = roughness;
		this.#emissionColor = emissionColor;
		this.#emissionStrength = emissionStrength;
	}

	/** @returns {Number} */
	getId() {
		return this.#id;
	}

	/** @returns {Float32Array} */
	getBuffer() {
		const buffer = new Float32Array(Material.BUFFER_SIZE);
		buffer.set(this.#albedo);
		buffer.set(this.#emissionColor, 4);
		buffer[8] = this.#roughness;
		buffer[9] = this.#emissionStrength;

		return buffer;
	}
}