import {Camera, Scene} from "src";
import {Vector2} from "src/math";

export class Renderer {
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
	 * @type {?GPUBindGroup}
	 */
	#bindGroup;

	/**
	 * @private
	 * @type {Number}
	 */
	#frameIndex;

	constructor() {
		this.#canvas = document.createElement("canvas");
		this.#frameIndex = 0;
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
		const pipelineLayout = this.createPipelineLayout(device, bindGroupLayout);
		const computePipeline = await this.createComputePipeline(device, pipelineLayout, "assets/shaders/compute.wgsl");
		const renderPipeline = await this.createRenderPipeline(device, pipelineLayout, "assets/shaders/vertex.wgsl", "assets/shaders/fragment.wgsl", preferredCanvasFormat);

		this.#device = device;
		this.#context = context;
		this.#buffers = buffers;
		this.#computePipeline = computePipeline;
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
			viewportUniform: device.createBuffer({
				label: "Viewport uniform buffer",
				size: Uint32Array.BYTES_PER_ELEMENT * 2,
				usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
			}),
			renderedImageStorage: device.createBuffer({
				label: "Rendered image storage buffer",
				size: Float32Array.BYTES_PER_ELEMENT * innerWidth * innerHeight,
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
					visibility: GPUShaderStage.FRAGMENT | GPUShaderStage.COMPUTE,
					buffer: {
						type: "uniform",
					},
				}, {
					binding: 1,
					visibility: GPUShaderStage.FRAGMENT | GPUShaderStage.COMPUTE,
					buffer: {
						type: "storage",
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
						buffer: buffers.renderedImageStorage,
					},
				},
			],
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
	 * @param {String} path
	 * @returns {GPUComputePipeline}
	 */
	async createComputePipeline(device, pipelineLayout, path) {
		return device.createComputePipeline({
			label: "Compute pipeline",
			layout: pipelineLayout,
			compute: {
				module: device.createShaderModule({
					label: "Compute shader module",
					code: await (await fetch(path)).text(),
				}),
				entryPoint: "main",
			},
		});
	}

	/**
	 * @param {GPUDevice} device
	 * @param {GPUPipelineLayout} pipelineLayout
	 * @param {String} vertexPath
	 * @param {String} fragmentPath
	 * @param {String} preferredCanvasFormat
	 * @returns {GPURenderPipeline}
	 */
	async createRenderPipeline(device, pipelineLayout, vertexPath, fragmentPath, preferredCanvasFormat) {
		return device.createRenderPipeline({
			label: "Render pipeline",
			layout: pipelineLayout,
			vertex: {
				module: device.createShaderModule({
					label: "Vertex shader module",
					code: await (await fetch(vertexPath)).text(),
				}),
				entryPoint: "main",
			},
			fragment: {
				module: device.createShaderModule({
					label: "Fragment shader module",
					code: await (await fetch(fragmentPath)).text(),
				}),
				entryPoint: "main",
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
		const viewport = new Uint32Array(this.viewport);
		const renderedImage = new Float32Array(viewport[0] * viewport[1]);

		canvas.width = viewport[0];
		canvas.height = viewport[1];

		device.queue.writeBuffer(this.#buffers.viewportUniform, 0, viewport);
		device.queue.writeBuffer(this.#buffers.renderedImageStorage, 0, renderedImage);
	}

	render() {
		const device = this.#device;
		const computePipeline = this.#computePipeline;
		const renderPipeline = this.#renderPipeline;
		const bindGroup = this.#bindGroup;
		const time = performance.now();

		const encoder = device.createCommandEncoder();

		const computePass = encoder.beginComputePass();
		computePass.setPipeline(computePipeline);
		computePass.setBindGroup(0, bindGroup);
		computePass.dispatchWorkgroups(4, 4, 1);
		computePass.end();

		const renderPass = encoder.beginRenderPass({
			colorAttachments: [
				{
					view: this.#context.getCurrentTexture().createView(),
					clearValue: Float32Array.of(0, 0, 0, 1),
					loadOp: "clear",
					storeOp: "store",
				},
			],
		});
		renderPass.setPipeline(renderPipeline);
		renderPass.setBindGroup(0, bindGroup);
		renderPass.draw(6);
		renderPass.end();

		device.queue.submit([encoder.finish()]);

		window["debug-render-time"].textContent = `${(performance.now() - time).toFixed(3)}ms`;
	}
}