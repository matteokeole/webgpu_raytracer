import {Camera} from "src";
import {Vector2} from "src/math";

export class Renderer {
	/**
	 * @private
	 * @type {HTMLCanvasElement}
	 */
	#canvas;

	/**
	 * @private
	 * @type {Vector2}
	 */
	#viewport;

	/**
	 * @private
	 * @type {?GPUDevice}
	 */
	#device;

	/**
	 * @private
	 * @type {?GPUCanvasContext}
	 */
	#context;

	/**
	 * @private
	 * @type {GPUBuffer[]}
	 */
	#buffers;

	/**
	 * @private
	 * @type {?GPUComputePipeline}
	 */
	#computePipeline;

	/**
	 * @private
	 * @type {?GPURenderPipeline}
	 */
	#renderPipeline;

	/**
	 * @private
	 * @type {?GPUBindGroupLayout}
	 */
	#bindGroupLayout;

	/**
	 * @private
	 * @type {?GPUBindGroup}
	 */
	#bindGroup;

	constructor() {
		this.#canvas = document.createElement("canvas");
		this.#viewport = new Vector2();
		this.#buffers = [];
	}

	/** @returns {HTMLCanvasElement} */
	getCanvas() {
		return this.#canvas;
	}

	/** @returns {Vector2} */
	getViewport() {
		return this.#viewport;
	}

	/** @param {Vector2} viewport */
	setViewport(viewport) {
		this.#viewport = viewport;
	}

	/** @param {Number} sphereCount */
	async build(sphereCount) {
		if (navigator.gpu == null) throw "WebGPU not supported.";

		const adapter = await navigator.gpu.requestAdapter();

		if (adapter == null) throw "Couldn't request WebGPU adapter.";

		const device = this.#device = await adapter.requestDevice();
		const context = this.#context = this.#canvas.getContext("webgpu");
		const format = navigator.gpu.getPreferredCanvasFormat();

		context.configure({device, format});

		const vertices = new Float32Array([
			-1,  1,
			 1,  1,
			-1, -1,
			 1,  1,
			 1, -1,
			-1, -1,
		]);

		this.#buffers.vertex = device.createBuffer({
			label: "Vertex buffer",
			size: vertices.byteLength,
			usage: GPUBufferUsage.VERTEX | GPUBufferUsage.COPY_DST,
		});

		device.queue.writeBuffer(this.#buffers.vertex, 0, vertices);

		this.#buffers.viewportUniform = device.createBuffer({
			label: "Viewport uniform buffer",
			size: this.#viewport.byteLength,
			usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
		});

		device.queue.writeBuffer(this.#buffers.viewportUniform, 0, this.#viewport);

		this.#buffers.cameraPositionUniform = device.createBuffer({
			label: "Camera position uniform buffer",
			size: 12,
			usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
		});

		this.#buffers.projectionInverseUniform = device.createBuffer({
			label: "Projection inverse uniform buffer",
			size: 64,
			usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
		});

		this.#buffers.viewInverseUniform = device.createBuffer({
			label: "View inverse uniform buffer",
			size: 64,
			usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
		});

		this.#buffers.spherePositions = device.createBuffer({
			label: "Sphere positions buffer",
			size: Float32Array.BYTES_PER_ELEMENT * sphereCount * 3,
			usage: GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_DST,
		});

		this.#buffers.sphereRadiuses = device.createBuffer({
			label: "Sphere radiuses buffer",
			size: Float32Array.BYTES_PER_ELEMENT * sphereCount,
			usage: GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_DST,
		});

		this.#buffers.sphereAlbedos = device.createBuffer({
			label: "Sphere albedos buffer",
			size: Float32Array.BYTES_PER_ELEMENT * sphereCount * 3,
			usage: GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_DST,
		});

		this.#bindGroupLayout = device.createBindGroupLayout({
			label: "Bind group layout",
			entries: [
				{
					binding: 0,
					visibility: GPUShaderStage.FRAGMENT,
					buffer: {
						type: "uniform",
					},
				}, {
					binding: 1,
					visibility: GPUShaderStage.FRAGMENT,
					buffer: {
						type: "uniform",
					},
				}, {
					binding: 2,
					visibility: GPUShaderStage.FRAGMENT,
					buffer: {
						type: "uniform",
					},
				}, {
					binding: 3,
					visibility: GPUShaderStage.FRAGMENT,
					buffer: {
						type: "uniform",
					},
				}, {
					binding: 4,
					visibility: GPUShaderStage.FRAGMENT,
					buffer: {
						type: "read-only-storage",
					},
				}, {
					binding: 5,
					visibility: GPUShaderStage.FRAGMENT,
					buffer: {
						type: "read-only-storage",
					},
				}, {
					binding: 6,
					visibility: GPUShaderStage.FRAGMENT,
					buffer: {
						type: "read-only-storage",
					},
				},
			],
		});

		this.#bindGroup = device.createBindGroup({
			label: "Bind group",
			layout: this.#bindGroupLayout,
			entries: [
				{
					binding: 0,
					resource: {
						buffer: this.#buffers.viewportUniform,
					},
				}, {
					binding: 1,
					resource: {
						buffer: this.#buffers.cameraPositionUniform,
					},
				}, {
					binding: 2,
					resource: {
						buffer: this.#buffers.projectionInverseUniform,
					},
				}, {
					binding: 3,
					resource: {
						buffer: this.#buffers.viewInverseUniform,
					},
				}, {
					binding: 4,
					resource: {
						buffer: this.#buffers.spherePositions,
					},
				}, {
					binding: 5,
					resource: {
						buffer: this.#buffers.sphereRadiuses,
					},
				}, {
					binding: 6,
					resource: {
						buffer: this.#buffers.sphereAlbedos,
					},
				},
			],
		});

		const computeShaderModule = device.createShaderModule({
			label: "Compute shader module",
			code: await (await fetch("assets/shaders/compute.wgsl")).text(),
		});

		const renderShaderModule = device.createShaderModule({
			label: "Render shader module",
			code: await (await fetch("assets/shaders/render.wgsl")).text(),
		});

		const pipelineLayout = device.createPipelineLayout({
			label: "Pipeline layout",
			bindGroupLayouts: [this.#bindGroupLayout],
		});

		this.#computePipeline = device.createComputePipeline({
			label: "Compute pipeline",
			layout: pipelineLayout,
			compute: {
				module: computeShaderModule,
				entryPoint: "compute",
			},
		});

		this.#renderPipeline = device.createRenderPipeline({
			label: "Render pipeline",
			layout: pipelineLayout,
			vertex: {
				module: renderShaderModule,
				entryPoint: "vertex",
				buffers: [{
					arrayStride: 8,
					attributes: [{
						format: "float32x2",
						offset: 0,
						shaderLocation: 0,
					}],
				}],
			},
			fragment: {
				module: renderShaderModule,
				entryPoint: "fragment",
				targets: [{format}],
			},
		});
	}

	lock() {
		this.#canvas.requestPointerLock();
	}

	/** @returns {Boolean} */
	isLocked() {
		return this.#canvas === document.pointerLockElement;
	}

	resize() {
		this.#canvas.width = this.#viewport[0];
		this.#canvas.height = this.#viewport[1];

		this.#device.queue.writeBuffer(this.#buffers.viewportUniform, 0, this.#viewport);
	}

	/**
	 * @param {Scene} scene
	 * @param {Camera} camera
	 */
	render(scene, camera) {
		const device = this.#device;
		const buffers = this.#buffers;
		const spheres = scene.getSpheres();
		const sphereCount = spheres.length;
		const spherePositions = new Float32Array(sphereCount * 3);
		const sphereRadiuses = new Float32Array(sphereCount);
		const sphereAlbedos = new Float32Array(sphereCount * 3);

		for (let i = 0, sphere; i < sphereCount; i++) {
			sphere = spheres[i];

			spherePositions.set(sphere.getPosition(), i * 3);
			sphereRadiuses[i] = sphere.getRadius();
			sphereAlbedos.set(sphere.getAlbedo(), i * 3);
		}

		device.queue.writeBuffer(buffers.projectionInverseUniform, 0, camera.getProjectionInverse());
		device.queue.writeBuffer(buffers.viewInverseUniform, 0, camera.getViewInverse());
		device.queue.writeBuffer(buffers.cameraPositionUniform, 0, camera.getPosition());
		device.queue.writeBuffer(buffers.spherePositions, 0, spherePositions);
		device.queue.writeBuffer(buffers.sphereRadiuses, 0, sphereRadiuses);
		device.queue.writeBuffer(buffers.sphereAlbedos, 0, sphereAlbedos);

		const time = performance.now();
		const encoder = device.createCommandEncoder();
		const renderPass = encoder.beginRenderPass({
			colorAttachments: [{
				view: this.#context.getCurrentTexture().createView(),
				clearValue: [0, 0, 0, 1],
				loadOp: "clear",
				storeOp: "store",
			}],
		});

		renderPass.setPipeline(this.#renderPipeline);
		renderPass.setBindGroup(0, this.#bindGroup);
		renderPass.setVertexBuffer(0, buffers.vertex);
		renderPass.draw(6);
		renderPass.end();

		device.queue.submit([encoder.finish()]);

		window["debug-render-time"].textContent = `${(performance.now() - time).toFixed(3)}ms`;
	}
}