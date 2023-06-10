import {Material, Scene, Sphere} from "src";
import {Vector3} from "src/math";

/** @param {Scene} scene */
export function init(scene) {
	scene.backgroundColor = new Vector3(.6, .7, .9);
	scene.objects = [
		new Sphere({
			position: new Vector3(0, -101, 0),
			radius: 100,
			materialIndex: 0,
		}),
		new Sphere({
			position: new Vector3(-1, 0, 0),
			radius: 1,
			materialIndex: 1,
		}),
		new Sphere({
			position: new Vector3(1, 0, 0),
			radius: 1,
			materialIndex: 2,
		}),
		/* new Sphere({
			position: new Vector3(140, -4, 140),
			radius: 100,
			materialIndex: 2,
		}), */
	];
	scene.materials = [
		new Material({
			albedo: new Vector3(.8, .2, .3),
			roughness: 0,
			emissionColor: new Vector3(0, 0, 0),
			emissionStrength: 0,
		}),
		new Material({
			albedo: new Vector3(.2, .7, 1),
			roughness: 0,
			emissionColor: new Vector3(0, 0, 0),
			emissionStrength: 0,
		}),
		/* new Material({
			albedo: new Vector3(1, 1, 1),
			roughness: 0,
			emissionColor: new Vector3(.99, .94, .71),
			emissionStrength: 10,
		}), */
		new Material({
			albedo: new Vector3(1, 1, 1),
			roughness: 0,
			emissionColor: new Vector3(1, 1, 1),
			emissionStrength: 1,
		}),
	];
}