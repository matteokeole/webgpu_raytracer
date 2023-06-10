import {Vector3} from "src/math";

/**
 * @param {Object} options
 * @param {Vector3} options.albedo
 * @param {Number} options.roughness
 * @param {Vector3} options.emissionColor
 * @param {Number} options.emissionStrength
 */
export function Material({albedo, roughness, emissionColor, emissionStrength}) {
	this.albedo = albedo;
	this.roughness = roughness;
	this.emissionColor = emissionColor;
	this.emissionStrength = emissionStrength;
}

/** @type {Number} */
Material.BUFFER_SIZE = 12;

/** @returns {Float32Array} */
Material.prototype.toBuffer = function() {
	const buffer = new Float32Array(Material.BUFFER_SIZE);
	buffer.set(this.albedo);
	buffer.set(this.emissionColor, 4);
	buffer[8] = this.roughness;
	buffer[9] = this.emissionStrength;

	return buffer;
};