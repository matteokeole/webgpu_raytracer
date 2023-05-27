import {Vector3} from "src/math";

export class Sphere {
	/**
	 * @private
	 * @type {Vector3}
	 */
	#position;

	/**
	 * @private
	 * @type {Number}
	 */
	#radius;

	/**
	 * @private
	 * @type {Vector3}
	 */
	#albedo;

	/**
	 * @param {Object} options
	 * @param {Vector3} options.position
	 * @param {Number} options.radius
	 * @param {Vector3} options.albedo
	 */
	constructor({position, radius, albedo}) {
		this.#position = position;
		this.#radius = radius;
		this.#albedo = albedo;
	}

	/** @returns {Vector3} */
	getPosition() {
		return this.#position;
	}

	/** @param {Vector3} position */
	setPosition(position) {
		this.#position = position;
	}

	/** @returns {Number} */
	getRadius() {
		return this.#radius;
	}

	/** @param {Number} radius */
	setRadius(radius) {
		this.#radius = radius;
	}

	/** @returns {Vector3} */
	getAlbedo() {
		return this.#albedo;
	}

	/** @param {Vector3} albedo */
	setAlbedo(albedo) {
		this.#albedo = albedo;
	}
}