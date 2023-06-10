import {Material, Sphere} from "src";

/**
 * @param {GPUDevice} device
 * @param {HTMLCanvasElement} canvas
 * @param {Number} objectLength
 * @param {Number} materialLength
 * @returns {Object.<String, GPUBuffer>}
 */
export function createBuffers(device, canvas, objectLength, materialLength) {
	return {
		textureStorage: device.createTexture({
			size: {
				width: canvas.width,
				height: canvas.height,
			},
			format: "rgba8unorm",
			usage: GPUTextureUsage.TEXTURE_BINDING | GPUBufferUsage.COPY_DST,
		}),
		accumulationStorage: device.createBuffer({
			size: Float32Array.BYTES_PER_ELEMENT * canvas.width * canvas.height * 4,
			usage: GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_DST,
		}),
		camera: device.createBuffer({
			size: 144,
			usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
		}),
		backgroundColor: device.createBuffer({
			size: Float32Array.BYTES_PER_ELEMENT * 3,
			usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
		}),
		objects: device.createBuffer({
			size: Float32Array.BYTES_PER_ELEMENT * Sphere.BUFFER_SIZE * objectLength,
			usage: GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_DST,
			mappedAtCreation: true,
		}),
		materials: device.createBuffer({
			size: Float32Array.BYTES_PER_ELEMENT * Material.BUFFER_SIZE * materialLength,
			usage: GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_DST,
			mappedAtCreation: true,
		}),
		accumulate: device.createBuffer({
			size: Uint32Array.BYTES_PER_ELEMENT,
			usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
		}),
		offset: device.createBuffer({
			size: Uint32Array.BYTES_PER_ELEMENT,
			usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
		}),
		frameIndex: device.createBuffer({
			size: Float32Array.BYTES_PER_ELEMENT,
			usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
		}),
		viewport: device.createBuffer({
			size: Uint32Array.BYTES_PER_ELEMENT * 2,
			usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
		}),
	};
}

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
	const computeBindGroupLayout = device.createBindGroupLayout({
		entries: [
			{
				binding: 0,
				visibility: GPUShaderStage.COMPUTE,
				storageTexture: {
					format: "rgba8unorm",
					viewDimension: "2d",
				},
			}, {
				binding: 2,
				visibility: GPUShaderStage.COMPUTE,
				buffer: {
					type: "storage",
				},
			}, {
				binding: 10,
				visibility: GPUShaderStage.COMPUTE,
				buffer: {
					type: "uniform",
				},
			}, {
				binding: 11,
				visibility: GPUShaderStage.COMPUTE,
				buffer: {
					type: "uniform",
				},
			}, {
				binding: 12,
				visibility: GPUShaderStage.COMPUTE,
				buffer: {
					type: "read-only-storage",
				},
			}, {
				binding: 13,
				visibility: GPUShaderStage.COMPUTE,
				buffer: {
					type: "read-only-storage",
				},
			}, {
				binding: 20,
				visibility: GPUShaderStage.COMPUTE,
				buffer: {
					type: "uniform",
				},
			}, {
				binding: 21,
				visibility: GPUShaderStage.COMPUTE,
				buffer: {
					type: "uniform",
				},
			}, {
				binding: 22,
				visibility: GPUShaderStage.COMPUTE,
				buffer: {
					type: "uniform",
				},
			},
		],
	});

	const computePipelineLayout = device.createPipelineLayout({
		bindGroupLayouts: [computeBindGroupLayout],
	});

	return [
		device.createBindGroup({
			layout: computeBindGroupLayout,
			entries: [
				{
					binding: 0,
					resource: textureView,
				}, {
					binding: 2,
					resource: {
						buffer: buffers.accumulationStorage,
					},
				}, {
					binding: 10,
					resource: {
						buffer: buffers.camera,
					},
				}, {
					binding: 11,
					resource: {
						buffer: buffers.backgroundColor,
					},
				}, {
					binding: 12,
					resource: {
						buffer: buffers.objects,
					},
				}, {
					binding: 13,
					resource: {
						buffer: buffers.materials,
					},
				}, {
					binding: 20,
					resource: {
						buffer: buffers.accumulate,
					},
				}, {
					binding: 21,
					resource: {
						buffer: buffers.offset,
					},
				}, {
					binding: 22,
					resource: {
						buffer: buffers.frameIndex,
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
	const renderBindGroupLayout = device.createBindGroupLayout({
		entries: [
			{
				binding: 0,
				visibility: GPUShaderStage.FRAGMENT,
				texture: {},
			}, {
				binding: 1,
				visibility: GPUShaderStage.FRAGMENT,
				sampler: {},
			}, {
				binding: 2,
				visibility: GPUShaderStage.FRAGMENT,
				buffer: {
					type: "read-only-storage",
				},
			}, {
				binding: 10,
				visibility: GPUShaderStage.FRAGMENT,
				buffer: {
					type: "uniform",
				},
			}, {
				binding: 11,
				visibility: GPUShaderStage.FRAGMENT,
				buffer: {
					type: "uniform",
				},
			}, {
				binding: 20,
				visibility: GPUShaderStage.FRAGMENT,
				buffer: {
					type: "uniform",
				},
			},
		],
	});

	const renderPipelineLayout = device.createPipelineLayout({
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
				}, {
					binding: 2,
					resource: {
						buffer: buffers.accumulationStorage,
					},
				}, {
					binding: 10,
					resource: {
						buffer: buffers.accumulate,
					},
				}, {
					binding: 11,
					resource: {
						buffer: buffers.frameIndex,
					},
				}, {
					binding: 20,
					resource: {
						buffer: buffers.viewport,
					},
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