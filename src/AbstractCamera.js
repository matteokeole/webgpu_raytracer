import {clamp, Matrix4, PI, Vector2, Vector3} from "src/math";

export class AbstractCamera {
	/** @type {Number} */
	static TURN_VELOCITY = .001;

	/** @type {Number} */
	static LERP_FACTOR = .95;

	/** @type {Vector3} */
	static UP = new Vector3(0, 1, 0);

	/** @type {Number} */
	#fieldOfView;

	/** @type {Number} */
	#aspectRatio;

	/** @type {Number} */
	#nearClipPlane;

	/** @type {Number} */
	#farClipPlane;

	/** @type {Matrix4} */
	#projectionInverse;

	/** @type {Matrix4} */
	#viewInverse;

	/** @type {Vector3} */
	position;

	/** @type {Vector3} */
	targetPosition;

	/** @type {Vector3} */
	rotation;

	/** @type {Vector3} */
	#forward;

	/** @type {Vector3} */
	#up;

	/** @type {Vector3} */
	#right;

	/**
	 * @param {Number} fieldOfView
	 * @param {Number} aspectRatio
	 * @param {Number} nearClipPlane
	 * @param {Number} farClipPlane
	 */
	constructor(fieldOfView, aspectRatio, nearClipPlane, farClipPlane) {
		this.#fieldOfView = fieldOfView * PI / 180;
		this.#aspectRatio = aspectRatio;
		this.#nearClipPlane = nearClipPlane;
		this.#farClipPlane = farClipPlane;

		this.#projectionInverse = new Matrix4();
		this.#viewInverse = new Matrix4();

		this.position = new Vector3();
		this.targetPosition = new Vector3();
		this.rotation = new Vector3();

		this.#forward = new Vector3(0, 0, 1);
		this.#up = new Vector3(0, 1, 0);
		this.#right = new Vector3(1, 0, 0);
	}

	/** @returns {Matrix4} */
	getProjectionInverse() {
		return this.#projectionInverse;
	}

	/** @returns {Matrix4} */
	getViewInverse() {
		return this.#viewInverse;
	}

	/** @returns {Vector3} */
	getForward() {
		return this.#forward;
	}

	/** @returns {Vector3} */
	getUp() {
		return this.#up;
	}

	/** @returns {Vector3} */
	getRight() {
		return this.#right;
	}

	/** @returns {Float32Array} */
	getBuffer = function() {
		const buffer = new Float32Array(36);
		buffer.set(this.#projectionInverse);
		buffer.set(this.#viewInverse, 16);
		buffer.set(this.position, 32);

		return buffer;
	};

	/** @param {Number} x */
	truck(x) {
		const right = this.#right.clone();

		this.targetPosition.add(right.multiplyScalar(x));
	}

	/** @param {Number} y */
	pedestal(y) {
		const up = this.#up.clone();

		this.targetPosition.add(up.multiplyScalar(y));
	}

	/** @param {Number} z */
	dolly(z) {
		const forward = this.#forward.clone();

		this.targetPosition.add(forward.multiplyScalar(z));
	}

	/** @param {Number} y */
	moveY(y) {
		this.targetPosition[1] += y;
	}

	/** @param {Number} z */
	moveZ(z) {
		const newForward = this.#right.cross(AbstractCamera.UP);

		this.targetPosition.add(newForward.multiplyScalar(z));
	}

	/** @param {Vector2} delta */
	lookAt(delta) {
		delta.multiplyScalar(AbstractCamera.TURN_VELOCITY);

		const newPitch = -delta[1];
		const newYaw = delta[0];

		this.rotation[0] = clamp(this.rotation[0] + newPitch, -PI * .5, PI * .5);
		if (this.rotation[1] + newYaw > PI) this.rotation[1] = -PI;
		if (this.rotation[1] + newYaw < -PI) this.rotation[1] = PI;
		this.rotation[1] += newYaw;

		const pitch = this.rotation[0];
		const yaw = this.rotation[1];

		this.#forward = sphericalToCartesian(yaw, pitch);
		this.#right = sphericalToCartesian(yaw + PI * .5, 0);
		this.#up = this.#forward.cross(this.#right);
	}

	update() {
		this.#projectionInverse = Matrix4.perspective(this.#fieldOfView, this.#aspectRatio, this.#nearClipPlane, this.#farClipPlane, 1).invert();
		this.#viewInverse = Matrix4.lookAt(
			this.position,
			this.position.clone().add(this.#forward),
			this.#up,
		).invert();
	}
}

/** @todo Refactor */
const sphericalToCartesian = (yaw, pitch) => new Vector3(
	Math.cos(pitch) * Math.sin(yaw),
	Math.sin(pitch),
	Math.cos(pitch) * Math.cos(yaw),
);