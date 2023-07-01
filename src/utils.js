import {Material, Sphere} from "src";

/**
 * @param {GPUDevice} device
 * @param {HTMLCanvasElement} canvas
 * @param {Number} objectLength
 * @param {Number} materialLength
 * @returns {Object.<String, GPUBuffer>}
 */
export const createBuffers = (device, canvas, objectLength, materialLength) => [
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
		size: Float32Array.BYTES_PER_ELEMENT * Sphere.BUFFER_SIZE * objectLength,
		usage: GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_DST,
		mappedAtCreation: true,
	}),
	device.createBuffer({
		size: Float32Array.BYTES_PER_ELEMENT * Material.BUFFER_SIZE * materialLength,
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
 * @param {String} path
 * @returns {GPUShaderModule}
 */
export async function createShaderModule(device, path) {
	const source = await (await fetch(path)).text();

	return device.createShaderModule({
		code: source,
	});
}

/**
 * @param {GPUDevice} device
 * @param {GPUShaderModule} computeShaderModule
 * @param {Object.<String, GPUBuffer>} buffers
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
						buffer: buffers.camera,
					},
				}, {
					binding: 1,
					resource: {
						buffer: buffers.objects,
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
 * @param {Object.<String, GPUBuffer>} buffers
 * @param {GPUTextureView} textureView
 * @param {GPUSampler} textureSampler
 * @param {String} format
 * @returns {Array}
 */
export function createRenderPipeline(device, vertexShaderModule, fragmentShaderModule, buffers, textureView, textureSampler, format) {
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
				targets: [{format}],
			},
		}),
	];
}