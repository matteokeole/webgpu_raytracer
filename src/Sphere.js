import {Vector3} from "src/math";

export class Sphere {
	/** @type {Vector3} */
	position;

	/** @type {Number} */
	radius;

	/** @type {Vector3} */
	albedo;

	/** @type {Number} */
	roughness;

	/** @type {Number} */
	metallic;

	/**
	 * @param {Object} options
	 * @param {Vector3} options.position
	 * @param {Number} options.radius
	 * @param {Vector3} options.albedo
	 * @param {Number} options.roughness
	 * @param {Number} options.metallic
	 */
	constructor({position, radius, albedo, roughness, metallic}) {
		this.position = position;
		this.radius = radius;
		this.albedo = albedo;
		this.roughness = roughness;
		this.metallic = metallic;
	}
}