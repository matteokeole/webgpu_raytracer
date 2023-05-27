import {Sphere} from "src";

export class Scene {
	/**
	 * @private
	 * @type {Sphere[]}
	 */
	#spheres;

	/** @param {Sphere[]} spheres */
	constructor(spheres) {
		this.#spheres = spheres;
	}

	/** @returns {Sphere[]} */
	getSpheres() {
		return this.#spheres;
	}

	/** @param {Sphere[]} spheres */
	setSpheres(spheres) {
		this.#spheres = spheres;
	}
}