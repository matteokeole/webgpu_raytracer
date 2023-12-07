import {Material, Mesh} from "./index.js";

export class Scene {
	/** @type {Mesh[]} */
	#meshes;

	/** @type {Material[]} */
	#materials;

	constructor() {
		this.#meshes = [];
		this.#materials = [];
	}

	/** @returns {Mesh[]} */
	getMeshes() {
		return this.#meshes;
	}

	/** @returns {Material[]} */
	getMaterials() {
		return this.#materials;
	}

	/** @returns {Float32Array} */
	getMeshBuffer() {
		const meshCount = this.#meshes.length;
		const buffer = new Float32Array(Mesh.BUFFER_SIZE * meshCount);

		for (let i = 0; i < meshCount; i++) {
			buffer.set(this.#meshes[i].asBuffer(), Mesh.BUFFER_SIZE * i);
		}

		return buffer;
	}

	/** @returns {Float32Array} */
	getMaterialBuffer() {
		const materialCount = this.#materials.length;
		const buffer = new Float32Array(Material.BUFFER_SIZE * materialCount);

		for (let i = 0; i < materialCount; i++) {
			buffer.set(this.#materials[i].asBuffer(), Material.BUFFER_SIZE * i);
		}

		return buffer;
	}

	/** @param {Mesh} mesh */
	addMesh(mesh) {
		this.#meshes.push(mesh);
	}

	/** @param {Material} material */
	addMaterial(material) {
		this.#materials.push(material);
	}
}