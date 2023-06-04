/**
 * @param {Vector3} position
 * @param {Number} radius
 * @param {Number} materialIndex
 */
export function Sphere(position, radius, materialIndex) {
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
	buffer[3] = this.radius;
	buffer[4] = this.materialIndex;

	return buffer;
};