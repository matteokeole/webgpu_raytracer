import {Vector3} from "./math/index.js";

/**
 * @typedef {Object} MaterialDescriptor
 * @property {Vector3} albedo
 * @property {Number} roughness
 * @property {Vector3} emissionColor
 * @property {Number} emissionStrength
 */

export class Material {
	/**
	 * @type {Number}
	 */
	static BUFFER_SIZE = 12;

	/**
	 * @type {Vector3}
	 */
	#albedo;

	/**
	 * @type {Number}
	 */
	#roughness;

	/**
	 * @type {Vector3}
	 */
	#emissionColor;

	/**
	 * @type {Number}
	 */
	#emissionStrength;

	/**
	 * @param {MaterialDescriptor} descriptor
	 */
	constructor(descriptor) {
		this.#albedo = descriptor.albedo;
		this.#roughness = descriptor.roughness;
		this.#emissionColor = descriptor.emissionColor;
		this.#emissionStrength = descriptor.emissionStrength;
	}

	getAlbedo() {
		return this.#albedo;
	}

	getRoughness() {
		return this.#roughness;
	}

	getEmissionColor() {
		return this.#emissionColor;
	}

	getEmissionStrength() {
		return this.#emissionStrength;
	}

	/**
	 * @returns {Float32Array}
	 */
	asBuffer() {
		const buffer = new Float32Array(Material.BUFFER_SIZE);
		buffer.set(this.#albedo);
		buffer.set(this.#emissionColor, 4);
		buffer[8] = this.#roughness;
		buffer[9] = this.#emissionStrength;

		return buffer;
	}
}