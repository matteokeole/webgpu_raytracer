import {Vector3} from "src/math";

/**
 * @param {Vector3} albedo
 * @param {Number} roughness
 */
export function Material(albedo, roughness) {
	this.albedo = albedo;
	this.roughness = roughness;
}

/** @type {Number} */
Material.BUFFER_SIZE = 4;

/** @returns {Float32Array} */
Material.prototype.toBuffer = function() {
	const buffer = new Float32Array(Material.BUFFER_SIZE);
	buffer.set(this.albedo);
	buffer[3] = this.roughness;

	return buffer;
};