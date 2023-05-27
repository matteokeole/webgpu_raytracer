import {Vector3} from "src/math";

export class Sphere {
	/** @type {Vector3} */
	position;

	/** @type {Number} */
	radius;

	/** @type {Vector3} */
	albedo;

	/**
	 * @param {Object} options
	 * @param {Vector3} options.position
	 * @param {Number} options.radius
	 * @param {Vector3} options.albedo
	 */
	constructor({position, radius, albedo}) {
		this.position = position;
		this.radius = radius;
		this.albedo = albedo;
	}
}