import {Material, Scene, Sphere} from "src";
import {Vector3} from "src/math";

/** @param {Scene} scene */
export function init(scene) {
	scene.objects = [
		new Sphere(
			new Vector3(0, -11, 0),
			10,
			1,
		),
		new Sphere(
			new Vector3(-3, -.42, 0),
			1,
			0,
		),
		new Sphere(
			new Vector3(0, 0, 0),
			1,
			2,
		),
		new Sphere(
			new Vector3(3, -.42, 0),
			1,
			0,
		),
	];

	scene.materials = [
		new Material(
			new Vector3(0, 0, 0),
			.1,
			new Vector3(0, 0, 0),
			0,
		),
		new Material(
			new Vector3(1, 1, 1),
			1,
			new Vector3(0, 0, 0),
			0,
		),
		new Material(
			new Vector3(1, 1, 1),
			0,
			new Vector3(1, 1, 1),
			1,
		),
	];
}