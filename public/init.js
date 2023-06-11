import {Material, Scene, Sphere} from "src";
import {Vector3} from "src/math";

/** @param {Scene} scene */
export function init(scene) {
	scene.backgroundColor = new Vector3(.6, .7, .9);
	scene.objects = [
		// Back wall
		new Sphere({
			position: new Vector3(0, 0, 120),
			radius: 100,
			materialIndex: 0,
		}),
		// Right wall
		new Sphere({
			position: new Vector3(120, 0, 0),
			radius: 100,
			materialIndex: 0,
		}),
		// Front wall
		new Sphere({
			position: new Vector3(0, 0, -120),
			radius: 100,
			materialIndex: 0,
		}),
		// Left wall
		new Sphere({
			position: new Vector3(-120, 0, 0),
			radius: 100,
			materialIndex: 0,
		}),
		// Floor
		new Sphere({
			position: new Vector3(0, -120, 0),
			radius: 100,
			materialIndex: 0,
		}),
		// Ceiling
		new Sphere({
			position: new Vector3(0, 120, 0),
			radius: 100,
			materialIndex: 0,
		}),
		// Light
		new Sphere({
			position: new Vector3(0, 10, 0),
			radius: 6,
			materialIndex: 1,
		}),
		// First sphere
		new Sphere({
			position: new Vector3(-3, 0, 0),
			radius: .9,
			materialIndex: 2,
		}),
		// Second sphere
		new Sphere({
			position: new Vector3(-1, 0, 0),
			radius: .9,
			materialIndex: 3,
		}),
		// Third sphere
		new Sphere({
			position: new Vector3(1, 0, 0),
			radius: .9,
			materialIndex: 4,
		}),
		// Fourth sphere
		new Sphere({
			position: new Vector3(3, 0, 0),
			radius: .9,
			materialIndex: 5,
		}),
	];
	scene.materials = [
		// Walls
		new Material({
			albedo: new Vector3(1, 1, 1),
			roughness: 1,
			emissionColor: new Vector3(0, 0, 0),
			emissionStrength: 0,
		}),
		// Light
		new Material({
			albedo: new Vector3(1, 1, 1),
			roughness: 1,
			emissionColor: new Vector3(1, .2, 0),
			emissionStrength: 1,
		}),
		// First sphere
		new Material({
			albedo: new Vector3(1, 1, 1),
			roughness: .6,
			emissionColor: new Vector3(0, 0, 0),
			emissionStrength: 0,
		}),
		// Second sphere
		new Material({
			albedo: new Vector3(1, 1, 1),
			roughness: .4,
			emissionColor: new Vector3(0, 0, 0),
			emissionStrength: 0,
		}),
		// Third sphere
		new Material({
			albedo: new Vector3(1, 1, 1),
			roughness: .2,
			emissionColor: new Vector3(0, 0, 0),
			emissionStrength: 0,
		}),
		// Fourth sphere
		new Material({
			albedo: new Vector3(1, 1, 1),
			roughness: 0,
			emissionColor: new Vector3(0, 0, 0),
			emissionStrength: 0,
		}),
	];
}