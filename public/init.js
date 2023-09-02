import {Material, Scene} from "src";
import {Vector3} from "src/math";
import {Sphere} from "./meshes/Sphere.js";

/** @param {Scene} scene */
export function init(scene) {
	// Floor
	scene.addMesh(
		new Sphere({
			position: new Vector3(0, -100.9, 0),
			radius: 100,
			materialIndex: 0,
		}),
	);

	// First sphere
	scene.addMesh(
		new Sphere({
			position: new Vector3(.658, -.2, 0),
			radius: .7,
			materialIndex: 1,
		}),
	);

	// Second sphere
	scene.addMesh(
		new Sphere({
			position: new Vector3(2.5, .27, 0),
			radius: 1.2,
			materialIndex: 2,
		}),
	);

	// Light
	scene.addMesh(
		new Sphere({
			position: new Vector3(0, 10, 0),
			radius: 6,
			materialIndex: 3,
		}),
	);

	// Floor
	scene.addMaterial(
		new Material({
			albedo: new Vector3(1, 1, 1),
			roughness: 1,
			emissionColor: new Vector3(0, 0, 0),
			emissionStrength: 0,
		}),
	);

	// First sphere
	scene.addMaterial(
		new Material({
			albedo: new Vector3(1, 1, 1),
			roughness: .1,
			emissionColor: new Vector3(0, 0, 0),
			emissionStrength: 0,
		}),
	);

	// Second sphere
	scene.addMaterial(
		new Material({
			albedo: new Vector3(1, 1, 1),
			roughness: 0,
			emissionColor: new Vector3(1, 1, 1),
			emissionStrength: 1,
		}),
	);

	// Light
	scene.addMaterial(
		new Material({
			albedo: new Vector3(1, 1, 1),
			roughness: 1,
			emissionColor: new Vector3(1, .2, 0),
			emissionStrength: 1,
		}),
	);
}