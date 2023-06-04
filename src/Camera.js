import {clamp, Matrix4, PI, Vector2, Vector3} from "src/math";

/**
 * @param {Number} fov
 * @param {Number} aspect
 * @param {Number} near
 * @param {Number} far
 */
export function Camera(fov, aspect, near, far) {
	let projectionInverse, viewInverse;

	this.position = new Vector3();
	this.target = new Vector3();
	this.rotation = new Vector3();
	this.aspect = aspect;

	let forward = new Vector3(0, 0, 1);
	let up = new Vector3(0, 1, 0);
	let right = new Vector3(1, 0, 0);

	fov = fov * PI / 180;

	const f = 1 / Math.tan(fov * .5);

	/** @returns {?Matrix4} */
	this.getProjectionInverse = () => projectionInverse;

	/** @returns {?Matrix4} */
	this.getViewInverse = () => viewInverse;

	/** @returns {Vector3} */
	this.getForward = () => forward;

	/** @returns {Vector3} */
	this.getUp = () => up;

	/** @returns {Vector3} */
	this.getRight = () => right;

	/** @param {Vector2} delta */
	this.lookAt = function(delta) {
		delta.multiplyScalar(Camera.TURN_VELOCITY);

		const newPitch = -delta[1];
		const newYaw = delta[0];

		this.rotation[0] = clamp(this.rotation[0] + newPitch, -PI * .5, PI * .5);
		if (this.rotation[1] + newYaw > PI) this.rotation[1] = -PI;
		if (this.rotation[1] + newYaw < -PI) this.rotation[1] = PI;
		this.rotation[1] += newYaw;

		const pitch = this.rotation[0];
		const yaw = this.rotation[1];

		forward = sphericalToCartesian(yaw, pitch);
		right = sphericalToCartesian(yaw + PI * .5, 0);
		up = forward.cross(right);
	};

	function sphericalToCartesian(yaw, pitch) {
		return new Vector3(
			Math.cos(pitch) * Math.sin(yaw),
			Math.sin(pitch),
			Math.cos(pitch) * Math.cos(yaw),
		);
	}

	this.project = function() {
		projectionInverse = new Matrix4(
			f / this.aspect, 0, 0, 0,
			0, -f, 0, 0,
			0, 0, far / (near - far), 1,
			0, 0, (far * near) / (near - far), 0,
		).invert();
	};

	this.view = function() {
		const eye = this.position.clone();
		const target = eye.clone().add(forward);

		const z = target.subtract(eye).normalize();
		const x = up.cross(z).normalize();
		const y = z.cross(x);

		viewInverse = new Matrix4(
			x[0], y[0], z[0], 0,
			x[1], y[1], z[1], 0,
			x[2], y[2], z[2], 0,
			-x.dot(eye), -y.dot(eye), -z.dot(eye), 1,
		).invert();
	};

	this.toBuffer = function() {
		const buffer = new Float32Array(36);
		buffer.set(projectionInverse);
		buffer.set(viewInverse, 16);
		buffer.set(this.position, 32);

		return buffer;
	};
}

/** @type {Number} */
Camera.TURN_VELOCITY = .001;

/** @type {Number} */
Camera.LERP_FACTOR = .95;

/** @type {Vector3} */
Camera.UP = new Vector3(0, 1, 0);

/** @param {Number} x */
Camera.prototype.truck = function(x) {
	const right = this.getRight().clone();

	this.target.add(right.multiplyScalar(x));
};

/** @param {Number} y */
Camera.prototype.pedestal = function(y) {
	const up = this.getUp().clone();

	this.target.add(up.multiplyScalar(y));
};

/** @param {Number} z */
Camera.prototype.dolly = function(z) {
	const forward = this.getForward().clone();

	this.target.add(forward.multiplyScalar(z));
};

/** @param {Number} y */
Camera.prototype.moveY = function(y) {
	this.target[1] += y;
};

/** @param {Number} z */
Camera.prototype.moveZ = function(z) {
	const newForward = this.getRight().cross(Camera.UP);

	this.target.add(newForward.multiplyScalar(z));
};