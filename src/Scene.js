import {Sphere} from "src";

export class Scene {
	/**
	 * @private
	 * @type {Sphere[]}
	 */
	#spheres;

	constructor() {
		this.#spheres = [];
	}

	/** @returns {Sphere[]} */
	getSpheres() {
		return this.#spheres;
	}

	/** @param {Sphere} sphere */
	addSphere(sphere) {
		this.#spheres.push(sphere);
	}
}