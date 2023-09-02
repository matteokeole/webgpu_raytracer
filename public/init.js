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
				albedo: new Vector3(1, 1, 1),
				roughness: 1,
				emissionColor: new Vector3(0, 0, 0),
				emissionStrength: 0,
			}),
		);

		// Light material
		scene.addMaterial(
			new Material({
				albedo: new Vector3(1, 1, 1),
				roughness: 1,
				emissionColor: new Vector3(1, 1, 1),
				emissionStrength: 100,
			}),
		);

		// Rough material
		scene.addMaterial(
			new Material({
				albedo: new Vector3(1, 1, 1),
				roughness: 1,
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
				position: new Vector3(0, 0, 3),
				radius: 1,
				materialIndex: 1,
			}),
		);

		// Front sphere
		scene.addMesh(
			new Sphere({
				position: new Vector3(0, -.199, -.513),
				radius: .7,
				materialIndex: 2,
			}),
		);

		// Left sphere
		scene.addMesh(
			new Sphere({
				position: new Vector3(-.701, -.199, .7),
				radius: .7,
				materialIndex: 2,
			}),
		);

		// Right sphere
		scene.addMesh(
			new Sphere({
				position: new Vector3(.701, -.199, .7),
				radius: .7,
				materialIndex: 2,
			}),
		);

		// Top sphere
		scene.addMesh(
			new Sphere({
				position: new Vector3(0, .944, .296),
				radius: .7,
				materialIndex: 2,
			}),
		);
	}
}