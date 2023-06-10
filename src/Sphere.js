/**
 * @param {Object} options
 * @param {Vector3} options.position
 * @param {Number} options.radius
 * @param {Number} options.materialIndex
 */
export function Sphere({position, radius, materialIndex}) {
	this.position = position;
	this.radius = radius;
	this.materialIndex = materialIndex;
}

/** @type {Number} */
Sphere.BUFFER_SIZE = 8;

/** @returns {Float32Array} */
Sphere.prototype.toBuffer = function() {
	const buffer = new Float32Array(Sphere.BUFFER_SIZE);
	buffer.set(this.position);
	buffer[4] = this.radius;
	buffer[5] = this.materialIndex;

	return buffer;
};