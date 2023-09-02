import {AbstractRenderer} from "src";
import {Vector2} from "src/math";
import {createBuffers, createShaderModule, createComputePipeline, createRenderPipeline} from "./utils.js";

export class Renderer extends AbstractRenderer {
	/** @type {Object.<String, GPUBindGroup>} */
	#computeBindGroups;

	/** @type {Object.<String, GPUBindGroup>} */
	#renderBindGroups;

	/** @type {?GPUComputePipeline} */
	#computePipeline;

	/** @type {?GPURenderPipeline} */
	#renderPipeline;

	/** @type {?GPUTextureView} */
	#textureView;

	/** @type {?GPUTextureSampler} */
	#textureSampler;

	/** @type {Number} */
	#frameIndex;

	/** @type {Number} */
	#computeTime;

	/** @param {HTMLCanvasElement} canvas */
	constructor(canvas) {
		super(canvas);

		this.#computeBindGroups = {};
		this.#renderBindGroups = {};
		this.#frameIndex = 1;
		this.#computeTime = 0;
	}

	/** @override */
	async initialize() {
		if (navigator.gpu == null) throw "WebGPU is not supported.";

		const adapter = await navigator.gpu.requestAdapter();

		if (adapter == null) throw "Couldn't request WebGPU adapter.";

		this._device = await adapter.requestDevice();
		this._context = this._canvas.getContext("webgpu");
		this._canvasFormat = navigator.gpu.getPreferredCanvasFormat();

		this._context.configure({
			device: this._device,
			format: this._canvasFormat,
		});

		await this.createBuffers();
	}

	/** @override */
	async createBuffers() {
		[
			this._buffers.textureStorage,
			this._buffers.accumulationStorage,
			this._buffers.camera,
			this._buffers.meshes,
			this._buffers.materials,
			this._buffers.frameIndex,
			this._buffers.accumulate,
		] = createBuffers(this._device, this._canvas, this.scene.getMeshes().length, this.scene.getMaterials().length);

		this.#textureView = this._buffers.textureStorage.createView();
		this.#textureSampler = this._device.createSampler({
			addressModeU: "repeat",
			addressModeV: "repeat",
			magFilter: "linear",
			minFilter: "nearest",
			mipmapFilter: "nearest",
			maxAnisotropy: 1,
		});

		const computeShaderModule = await createShaderModule(this._device, "assets/shaders/compute.wgsl");
		[
			this.#computeBindGroups.texture,
			this.#computeBindGroups.scene,
			this.#computeBindGroups.flags,
			this.#computePipeline,
		] = createComputePipeline(this._device, computeShaderModule, this._buffers, this.#textureView);

		const vertexShaderModule = await createShaderModule(this._device, "assets/shaders/vertex.wgsl");
		const fragmentShaderModule = await createShaderModule(this._device, "assets/shaders/fragment.wgsl");
		[
			this.#renderBindGroups.texture,
			this.#renderPipeline,
		] = createRenderPipeline(this._device, vertexShaderModule, fragmentShaderModule, this.#textureView, this.#textureSampler, this._canvasFormat);

		this._device.queue.writeBuffer(this._buffers.accumulationStorage, 0, new Float32Array(this._canvas.width * this._canvas.height * 4));

		new Float32Array(this._buffers.meshes.getMappedRange()).set(this.scene.getMeshBuffer());
		this._buffers.meshes.unmap();

		new Float32Array(this._buffers.materials.getMappedRange()).set(this.scene.getMaterialBuffer());
		this._buffers.materials.unmap();
	}

	/**
	 * @override
	 * @param {Boolean} accumulate
	 */
	render(accumulate) {
		const commandEncoder = this._device.createCommandEncoder();

		if (!accumulate) this.#frameIndex = 0;

		this.#frameIndex++;
		this.#computeTime = performance.now();

		this._device.queue.writeBuffer(this._buffers.camera, 0, this.camera.getBuffer());
		this._device.queue.writeBuffer(this._buffers.frameIndex, 0, Uint32Array.of(this.#frameIndex));
		this._device.queue.writeBuffer(this._buffers.accumulate, 0, Uint32Array.of(accumulate));

		const workgroupCount = new Vector2(this._canvas.clientWidth, this._canvas.clientHeight).divideScalar(8);

		const computePass = commandEncoder.beginComputePass();
		computePass.setPipeline(this.#computePipeline);
		computePass.setBindGroup(0, this.#computeBindGroups.texture);
		computePass.setBindGroup(1, this.#computeBindGroups.scene);
		computePass.setBindGroup(2, this.#computeBindGroups.flags);
		computePass.dispatchWorkgroups(workgroupCount[0], workgroupCount[1], 1);
		computePass.end();

		const renderPass = commandEncoder.beginRenderPass({
			colorAttachments: [
				{
					view: this._context.getCurrentTexture().createView(),
					loadOp: "load",
					storeOp: "store",
				},
			],
		});
		renderPass.setPipeline(this.#renderPipeline);
		renderPass.setBindGroup(0, this.#renderBindGroups.texture);
		renderPass.draw(6);
		renderPass.end();

		this._device.queue.submit([commandEncoder.finish()]);

		window["debug-compute-time"].textContent = `${(performance.now() - this.#computeTime).toFixed(3)}ms`;
	}
}