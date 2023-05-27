import {Camera, Scene} from "src";
import {Vector2} from "src/math";

export class Renderer {
	/** @type {Float32Array} */
	static VERTICES = Float32Array.of(
		-1,  1,
		 1,  1,
		-1, -1,
		 1,  1,
		 1, -1,
		-1, -1,
	);

	/**
	 * @private
	 * @type {?GPUDevice}
	 */
	#device;

	/**
	 * @private
	 * @type {?HTMLCanvasElement}
	 */
	#canvas;

	/**
	 * @private
	 * @type {?GPUCanvasContext}
	 */
	#context;

	/** @type {?Vector2} */
	viewport;

	/** @type {?Scene} */
	scene;

	/** @type {?Camera} */
	camera;

	/**
	 * @private
	 * @type {?Object.<String, GPUBuffer>}
	 */
	#buffers;

	/**
	 * @private
	 * @type {?GPUPipeline}
	 */
	#renderPipeline;

	/**
	 * @private
	 * @type {?GPUBindGroup}
	 */
	#bindGroup;

	constructor() {
		this.#canvas = document.createElement("canvas");
	}

	/** @returns {?HTMLCanvasElement} */
	getCanvas() {
		return this.#canvas;
	}

	async build() {
		const scene = this.scene;

		if (scene == null) throw "No scene bound to the renderer.";
		if (navigator.gpu == null) throw "WebGPU not supported.";

		const adapter = await navigator.gpu.requestAdapter();

		if (adapter == null) throw "Couldn't request WebGPU adapter.";

		const device = await adapter.requestDevice();
		const canvas = this.#canvas;
		const context = canvas.getContext("webgpu");
		const preferredCanvasFormat = navigator.gpu.getPreferredCanvasFormat();

		context.configure({
			device,
			format: preferredCanvasFormat,
		});

		const sphereCount = scene.getSpheres().length;
		const buffers = this.createBuffers(device, sphereCount);
		const bindGroupLayout = this.createBindGroupLayout(device);
		const bindGroup = this.createBindGroup(device, bindGroupLayout, buffers);
		const renderShaderModule = await this.createRenderShaderModule(device, "assets/shaders/render.wgsl");
		const pipelineLayout = this.createPipelineLayout(device, bindGroupLayout);
		const renderPipeline = this.createRenderPipeline(device, pipelineLayout, renderShaderModule, preferredCanvasFormat);
		const viewport = this.viewport;

		device.queue.writeBuffer(buffers.vertex, 0, Renderer.VERTICES);
		device.queue.writeBuffer(buffers.viewportUniform, 0, viewport);

		this.#device = device;
		this.#context = context;
		this.#buffers = buffers;
		this.#renderPipeline = renderPipeline;
		this.#bindGroup = bindGroup;
	}

	/**
	 * @param {GPUDevice} device
	 * @param {Number} sphereCount
	 * @returns {Object.<String, GPUBuffer>}
	 */
	createBuffers(device, sphereCount) {
		return {
			vertex: device.createBuffer({
				label: "Vertex buffer",
				size: Renderer.VERTICES.byteLength,
				usage: GPUBufferUsage.VERTEX | GPUBufferUsage.COPY_DST,
			}),
			viewportUniform: device.createBuffer({
				label: "Viewport uniform buffer",
				size: Float32Array.BYTES_PER_ELEMENT * 2,
				usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
			}),
			// Camera related buffers
			cameraPositionUniform: device.createBuffer({
				label: "Camera position uniform buffer",
				size: Float32Array.BYTES_PER_ELEMENT * 3,
				usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
			}),
			projectionInverseUniform: device.createBuffer({
				label: "Projection inverse uniform buffer",
				size: Float32Array.BYTES_PER_ELEMENT * 16,
				usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
			}),
			viewInverseUniform: device.createBuffer({
				label: "View inverse uniform buffer",
				size: Float32Array.BYTES_PER_ELEMENT * 16,
				usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
			}),
			// Scene related buffers
			spherePositions: device.createBuffer({
				label: "Sphere positions buffer",
				size: Float32Array.BYTES_PER_ELEMENT * sphereCount * 3,
				usage: GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_DST,
			}),
			sphereRadiuses: device.createBuffer({
				label: "Sphere radiuses buffer",
				size: Float32Array.BYTES_PER_ELEMENT * sphereCount,
				usage: GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_DST,
			}),
			sphereAlbedos: device.createBuffer({
				label: "Sphere albedos buffer",
				size: Float32Array.BYTES_PER_ELEMENT * sphereCount * 3,
				usage: GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_DST,
			}),
		};
	}

	/**
	 * @param {GPUDevice} device
	 * @returns {GPUBindGroupLayout}
	 */
	createBindGroupLayout(device) {
		return device.createBindGroupLayout({
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
	}

	/**
	 * @param {GPUDevice} device
	 * @param {GPUBindGroupLayout} bindGroupLayout
	 * @param {Object.<String, GPUBuffer>} buffers
	 * @returns {GPUBindGroup}
	 */
	createBindGroup(device, bindGroupLayout, buffers) {
		return device.createBindGroup({
			label: "Bind group",
			layout: bindGroupLayout,
			entries: [
				{
					binding: 0,
					resource: {
						buffer: buffers.viewportUniform,
					},
				}, {
					binding: 1,
					resource: {
						buffer: buffers.cameraPositionUniform,
					},
				}, {
					binding: 2,
					resource: {
						buffer: buffers.projectionInverseUniform,
					},
				}, {
					binding: 3,
					resource: {
						buffer: buffers.viewInverseUniform,
					},
				}, {
					binding: 4,
					resource: {
						buffer: buffers.spherePositions,
					},
				}, {
					binding: 5,
					resource: {
						buffer: buffers.sphereRadiuses,
					},
				}, {
					binding: 6,
					resource: {
						buffer: buffers.sphereAlbedos,
					},
				}, 
			],
		});
	}

	/**
	 * @param {GPUDevice} device
	 * @param {String} path
	 * @returns {GPUShaderModule}
	 */
	async createRenderShaderModule(device, path) {
		const source = await (await fetch(path)).text();

		return device.createShaderModule({
			label: "Render shader module",
			code: source,
		});
	}

	/**
	 * @param {GPUDevice} device
	 * @param {GPUBindGroupLayout} bindGroupLayout
	 * @returns {GPUPipelineLayout}
	 */
	createPipelineLayout(device, bindGroupLayout) {
		return device.createPipelineLayout({
			label: "Pipeline layout",
			bindGroupLayouts: [bindGroupLayout],
		});
	}

	/**
	 * @param {GPUDevice} device
	 * @param {GPUPipelineLayout} pipelineLayout
	 * @param {GPUShaderModule} renderShaderModule
	 * @param {String} preferredCanvasFormat
	 * @returns {GPURenderPipeline}
	 */
	createRenderPipeline(device, pipelineLayout, renderShaderModule, preferredCanvasFormat) {
		return device.createRenderPipeline({
			label: "Render pipeline",
			layout: pipelineLayout,
			vertex: {
				module: renderShaderModule,
				entryPoint: "vertex",
				buffers: [
					{
						arrayStride: 8,
						attributes: [
							{
								format: "float32x2",
								offset: 0,
								shaderLocation: 0,
							},
						],
					},
				],
			},
			fragment: {
				module: renderShaderModule,
				entryPoint: "fragment",
				targets: [
					{
						format: preferredCanvasFormat,
					},
				],
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
		const device = this.#device;
		const canvas = this.#canvas;
		const viewport = this.viewport;
		const viewportUniform = this.#buffers.viewportUniform;

		canvas.width = viewport[0];
		canvas.height = viewport[1];

		device.queue.writeBuffer(viewportUniform, 0, viewport);
	}

	render() {
		const device = this.#device;
		const buffers = this.#buffers;
		const renderPipeline = this.#renderPipeline;
		const bindGroup = this.#bindGroup;
		const spheres = this.scene.getSpheres();
		const sphereCount = spheres.length;
		const camera = this.camera;
		const spherePositions = new Float32Array(sphereCount * 3);
		const sphereRadiuses = new Float32Array(sphereCount);
		const sphereAlbedos = new Float32Array(sphereCount * 3);

		for (let i = 0, sphere; i < sphereCount; i++) {
			sphere = spheres[i];

			spherePositions.set(sphere.position, i * 3);
			sphereRadiuses[i] = sphere.radius;
			sphereAlbedos.set(sphere.albedo, i * 3);
		}

		device.queue.writeBuffer(buffers.projectionInverseUniform, 0, camera.getProjectionInverse());
		device.queue.writeBuffer(buffers.viewInverseUniform, 0, camera.getViewInverse());
		device.queue.writeBuffer(buffers.cameraPositionUniform, 0, camera.position);
		device.queue.writeBuffer(buffers.spherePositions, 0, spherePositions);
		device.queue.writeBuffer(buffers.sphereRadiuses, 0, sphereRadiuses);
		device.queue.writeBuffer(buffers.sphereAlbedos, 0, sphereAlbedos);

		const time = performance.now();
		const encoder = device.createCommandEncoder();
		const renderPass = this.beginRenderPass(encoder);

		renderPass.setPipeline(renderPipeline);
		renderPass.setBindGroup(0, bindGroup);
		renderPass.setVertexBuffer(0, buffers.vertex);
		renderPass.draw(6);
		renderPass.end();

		device.queue.submit([encoder.finish()]);

		window["debug-render-time"].textContent = `${(performance.now() - time).toFixed(3)}ms`;
	}

	/** @returns {GPURenderPass} */
	beginRenderPass(encoder) {
		const context = this.#context;

		return encoder.beginRenderPass({
			colorAttachments: [
				{
					view: context.getCurrentTexture().createView(),
					clearValue: Float32Array.of(0, 0, 0, 1),
					loadOp: "clear",
					storeOp: "store",
				},
			],
		});
	}
}