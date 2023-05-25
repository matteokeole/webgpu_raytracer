import {VELOCITY, keys, camera} from "./main.js";

let velocity;

export function update(delta) {
	velocity = VELOCITY * delta;

	if (keys.has("KeyW")) camera.dolly(velocity);
	if (keys.has("KeyS")) camera.dolly(-velocity);
	if (keys.has("KeyA")) camera.truck(velocity);
	if (keys.has("KeyD")) camera.truck(-velocity);
	if (keys.has("Space")) camera.pedestal(velocity);
	if (keys.has("ControlLeft")) camera.pedestal(-velocity);

	camera.project();
	camera.view();

	window["debug-position"].textContent = [...camera.getPosition()].map(e => e.toFixed(2)).join(' ');
	window["debug-rotation"].textContent = [...camera.getRotation()].map(e => e.toFixed(2)).join(' ');
	window["debug-direction"].textContent = [...camera.getForward()].map(e => e.toFixed(2)).join(' ');
}