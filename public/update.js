import {keys} from "./events.js";
import {camera} from "./main.js";

/** @param {Number} delta */
export function update(delta) {
	if (keys.has("KeyA")) camera.truck(-.002 * delta);
	if (keys.has("KeyD")) camera.truck(.002 * delta);
}