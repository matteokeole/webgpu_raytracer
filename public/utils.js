import {Material, Mesh} from "../src/index.js";

/**
 * @param {GPUDevice} device
 * @param {HTMLCanvasElement} canvas
 * @param {Number} meshCount
 * @param {Number} materialCount
 * @returns {Record.<String, GPUBuffer|GPUTexture>}
 */
export const createBuffers = (device, canvas, meshCount, materialCount) => [
	device.createTexture({
		size: {
			width: canvas.width,
			height: canvas.height,
		},
		format: "rgba8unorm",
		usage: GPUTextureUsage.TEXTURE_BINDING | GPUBufferUsage.COPY_DST,
	}),
	device.createBuffer({
		size: Float32Array.BYTES_PER_ELEMENT * canvas.width * canvas.height * 4,
		usage: GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_DST,
	}),
	device.createBuffer({
		size: 144,
		usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
	}),
	device.createBuffer({
		size: Float32Array.BYTES_PER_ELEMENT * Mesh.BUFFER_SIZE * meshCount,
		usage: GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_DST,
		mappedAtCreation: true,
	}),
	device.createBuffer({
		size: Float32Array.BYTES_PER_ELEMENT * Material.BUFFER_SIZE * materialCount,
		usage: GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_DST,
		mappedAtCreation: true,
	}),
	device.createBuffer({
		size: Float32Array.BYTES_PER_ELEMENT,
		usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
	}),
	device.createBuffer({
		size: Uint32Array.BYTES_PER_ELEMENT,
		usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
	}),
];

/**
 * @param {GPUDevice} device
 * @param {GPUShaderModule} computeShaderModule
 * @param {Record.<String, GPUBuffer>} buffers
 * @param {GPUTextureView} textureView
 * @returns {Array}
 */
export function createComputePipeline(device, computeShaderModule, buffers, textureView) {
	const
		textureComputeBindGroupLayout = device.createBindGroupLayout({
			entries: [
				{
					binding: 0,
					visibility: GPUShaderStage.COMPUTE,
					storageTexture: {
						format: "rgba8unorm",
						viewDimension: "2d",
					},
				}, {
					binding: 1,
					visibility: GPUShaderStage.COMPUTE,
					buffer: {
						type: "storage",
					},
				},
			],
		}),
		sceneComputeBindGroupLayout = device.createBindGroupLayout({
			entries: [
				{
					binding: 0,
					visibility: GPUShaderStage.COMPUTE,
					buffer: {
						type: "uniform",
					},
				}, {
					binding: 1,
					visibility: GPUShaderStage.COMPUTE,
					buffer: {
						type: "read-only-storage",
					},
				}, {
					binding: 2,
					visibility: GPUShaderStage.COMPUTE,
					buffer: {
						type: "read-only-storage",
					},
				},
			],
		}),
		flagsComputeBindGroupLayout = device.createBindGroupLayout({
			entries: [
				{
					binding: 0,
					visibility: GPUShaderStage.COMPUTE,
					buffer: {
						type: "uniform",
					},
				}, {
					binding: 1,
					visibility: GPUShaderStage.COMPUTE,
					buffer: {
						type: "uniform",
					},
				},
			],
		}),
		computePipelineLayout = device.createPipelineLayout({
			bindGroupLayouts: [
				textureComputeBindGroupLayout,
				sceneComputeBindGroupLayout,
				flagsComputeBindGroupLayout,
			],
		});

	return [
		device.createBindGroup({
			layout: textureComputeBindGroupLayout,
			entries: [
				{
					binding: 0,
					resource: textureView,
				}, {
					binding: 1,
					resource: {
						buffer: buffers.accumulationStorage,
					},
				},
			],
		}),
		device.createBindGroup({
			layout: sceneComputeBindGroupLayout,
			entries: [
				{
					binding: 0,
					resource: {
						buffer: buffers.cameraUniform,
					},
				}, {
					binding: 1,
					resource: {
						buffer: buffers.meshes,
					},
				}, {
					binding: 2,
					resource: {
						buffer: buffers.materials,
					},
				},
			],
		}),
		device.createBindGroup({
			layout: flagsComputeBindGroupLayout,
			entries: [
				{
					binding: 0,
					resource: {
						buffer: buffers.frameIndex,
					},
				}, {
					binding: 1,
					resource: {
						buffer: buffers.accumulate,
					},
				},
			],
		}),
		device.createComputePipeline({
			layout: computePipelineLayout,
			compute: {
				module: computeShaderModule,
				entryPoint: "main",
			},
		}),
	];
}

/**
 * @param {GPUDevice} device
 * @param {GPUShaderModule} vertexShaderModule
 * @param {GPUShaderModule} fragmentShaderModule
 * @param {GPUTextureView} textureView
 * @param {GPUSampler} textureSampler
 * @param {GPUTextureFormat} format
 * @returns {Array}
 */
export function createRenderPipeline(device, vertexShaderModule, fragmentShaderModule, textureView, textureSampler, format) {
	const
		renderBindGroupLayout = device.createBindGroupLayout({
			entries: [
				{
					binding: 0,
					visibility: GPUShaderStage.FRAGMENT,
					texture: {},
				}, {
					binding: 1,
					visibility: GPUShaderStage.FRAGMENT,
					sampler: {},
				},
			],
		}),
		renderPipelineLayout = device.createPipelineLayout({
			bindGroupLayouts: [renderBindGroupLayout],
		});

	return [
		device.createBindGroup({
			layout: renderBindGroupLayout,
			entries: [
				{
					binding: 0,
					resource: textureView,
				}, {
					binding: 1,
					resource: textureSampler,
				},
			],
		}),
		device.createRenderPipeline({
			layout: renderPipelineLayout,
			vertex: {
				module: vertexShaderModule,
				entryPoint: "main",
			},
			fragment: {
				module: fragmentShaderModule,
				entryPoint: "main",
				targets: [
					{
						format: format,
					}
				],
			},
		}),
	];
}