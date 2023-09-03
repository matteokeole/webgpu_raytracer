import {Material, Scene} from "src";
import {Vector3} from "src/math";
import {Sphere} from "./meshes/Sphere.js";

/** @param {Scene} scene */
export function init(scene) {
	// Materials
	{
		// Floor material
		scene.addMaterial(
			new Material({
				albedo: new Vector3(.4, .3, .1),
				roughness: 1,
				emissionColor: new Vector3(0, 0, 0),
				emissionStrength: 0,
			}),
		);

		// Light material
		scene.addMaterial(
			new Material({
				albedo: new Vector3(0, 0, 0),
				roughness: 1,
				emissionColor: new Vector3(1, 1, 1),
				emissionStrength: 1,
			}),
		);

		// Gold material
		scene.addMaterial(
			new Material({
				albedo: new Vector3(.83, .68, .21),
				roughness: .03,
				emissionColor: new Vector3(0, 0, 0),
				emissionStrength: 0,
			}),
		);
	}

	// Meshes
	{
		// Floor
		scene.addMesh(
			new Sphere({
				position: new Vector3(0, -100.9, 0),
				radius: 100,
				materialIndex: 0,
			}),
		);

		// Light
		scene.addMesh(
			new Sphere({
				position: new Vector3(0, 17, 21),
				radius: 12,
				materialIndex: 1,
			}),
		);

		// Medium sphere
		scene.addMesh(
			new Sphere({
				position: new Vector3(-1.4, -.41, .4),
				radius: .5,
				materialIndex: 2,
			}),
		);

		// Big sphere
		scene.addMesh(
			new Sphere({
				position: new Vector3(0, -.199, 0),
				radius: .7,
				materialIndex: 2,
			}),
		);

		// Small sphere
		scene.addMesh(
			new Sphere({
				position: new Vector3(.91, -.602, .1),
				radius: .3,
				materialIndex: 2,
			}),
		);
	}
}