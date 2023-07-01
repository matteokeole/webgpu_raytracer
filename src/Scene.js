import {Material, Sphere} from "src";

export function Scene() {
	/** @type {Set.<Sphere>} */
	this.objects = [];

	/** @type {Set.<Material>} */
	this.materials = [];
}

/** @returns {Float32Array} */
Scene.prototype.toObjectBuffer = function() {
	const buffer = new Float32Array(this.objects.length * Sphere.BUFFER_SIZE);

	for (let i = 0, l = this.objects.length; i < l; i++) {
		buffer.set(this.objects[i].toBuffer(), i * Sphere.BUFFER_SIZE);
	}

	return buffer;
};

/** @returns {Float32Array} */
Scene.prototype.toMaterialBuffer = function() {
	const buffer = new Float32Array(this.materials.length * Material.BUFFER_SIZE);

	for (let i = 0, l = this.materials.length; i < l; i++) {
		buffer.set(this.materials[i].toBuffer(), i * Material.BUFFER_SIZE);
	}

	return buffer;
};