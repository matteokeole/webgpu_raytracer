import {Material, Scene, Sphere} from "src";
import {Vector3} from "src/math";

/** @param {Scene} scene */
export function init(scene) {
	scene.objects = [
		// Floor
		new Sphere({
			position: new Vector3(0, -100.9, 0),
			radius: 100,
			materialIndex: 0,
		}),
		// First sphere
		new Sphere({
			position: new Vector3(.658, -.2, 0),
			radius: .7,
			materialIndex: 1,
		}),
		// Second sphere
		new Sphere({
			position: new Vector3(2.5, .27, 0),
			radius: 1.2,
			materialIndex: 2,
		}),
		// Light
		new Sphere({
			position: new Vector3(0, 10, 0),
			radius: 6,
			materialIndex: 3,
		}),
	];
	scene.materials = [
		// Floor
		new Material({
			albedo: new Vector3(1, 1, 1),
			roughness: 1,
			emissionColor: new Vector3(0, 0, 0),
			emissionStrength: 0,
		}),
		// First sphere
		new Material({
			albedo: new Vector3(1, 1, 1),
			roughness: .1,
			emissionColor: new Vector3(0, 0, 0),
			emissionStrength: 0,
		}),
		// Second sphere
		new Material({
			albedo: new Vector3(1, 1, 1),
			roughness: 0,
			emissionColor: new Vector3(1, 1, 1),
			emissionStrength: 1,
		}),
		// Light
		new Material({
			albedo: new Vector3(1, 1, 1),
			roughness: 1,
			emissionColor: new Vector3(1, .2, 0),
			emissionStrength: 1,
		}),
	];
}