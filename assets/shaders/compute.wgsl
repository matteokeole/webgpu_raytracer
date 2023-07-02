@group(0) @binding(0) var texture_storage: texture_storage_2d<rgba8unorm, write>;
@group(0) @binding(1) var<storage, read_write> accumulation: array<vec4f>;
@group(1) @binding(0) var<uniform> camera: Camera;
@group(1) @binding(1) var<storage> objects: array<Sphere>;
@group(1) @binding(2) var<storage> materials: array<Material>;
@group(2) @binding(0) var<uniform> frame_index: u32;
@group(2) @binding(1) var<uniform> accumulate: u32;

struct Camera {
	projection_inverse: mat4x4f,
	view_inverse: mat4x4f,
	position: vec3f,
}

struct Ray {
	origin: vec3f,
	direction: vec3f,
}

struct Hit {
	distance: f32,
	position: vec3f,
	normal: vec3f,
	object_index: u32,
}

struct Sphere {
	@size(16) position: vec3f,
	radius: f32,
	material_index: f32,
}

struct Material {
	@size(16) albedo: vec3f,
	@size(16) emission_color: vec3f,
	roughness: f32,
	emission_strength: f32,
}

const F32_MAX: f32 = 4294967295;
const BOUNCES: u32 = 4;
const BACKGROUND_COLOR: vec3f = vec3f(.6, .7, .9);

@compute
@workgroup_size(8, 8, 1)
fn main(@builtin(global_invocation_id) global_invocation_id: vec3u) {
	let viewport: vec2u = textureDimensions(texture_storage);
	let index: u32 = global_invocation_id.x + global_invocation_id.y * viewport.x;
	var seed: u32 = index * frame_index;

	let sample: vec4f = rgen(global_invocation_id, viewport, &seed);

	if (accumulate == 0) {
		accumulation[index] = sample;

		textureStore(texture_storage, global_invocation_id.xy, sample);
	} else {
		accumulation[index] += sample;

		textureStore(texture_storage, global_invocation_id.xy, accumulation[index] / f32(frame_index));
	}
}

fn rgen(global_invocation_id: vec3u, viewport: vec2u, seed: ptr<function, u32>) -> vec4f {
	let uv: vec2f = vec2f(global_invocation_id.xy) / vec2f(viewport) * 2 - 1;
	let position: vec4f = vec4f((camera.projection_inverse * vec4f(uv, 0, 1)).xyz, 0);

	var light: vec3f;
	var throughput: vec3f = vec3f(1);

	var ray: Ray;
	ray.origin = camera.position;
	ray.direction = (camera.view_inverse * position).xyz;

	var hit: Hit;

	for (var i: u32; i < BOUNCES; i++) {
		*seed += i;

		hit = rint(ray);

		if (hit.distance < 0) {
			light += BACKGROUND_COLOR * throughput;

			break;
		}

		let object: Sphere = objects[hit.object_index];
		let material: Material = materials[u32(object.material_index)];

		light += material.emission_color * material.emission_strength;
		throughput *= material.albedo;

		let diffuse: vec3f = normalize(hit.normal + random_vec_unit(seed));
		let specular: vec3f = reflect(ray.direction, hit.normal);

		ray.origin = hit.position + hit.normal * .0001;
		ray.direction = mix(specular, diffuse, material.roughness);
	}

	return vec4f(light, 1);
}

fn rint(ray: Ray) -> Hit {
	var closest_t: f32 = F32_MAX;
	var object_index: i32 = -1;

	for (var i: u32; i < arrayLength(&objects); i++) {
		let sphere: Sphere = objects[i];

		let origin: vec3f = ray.origin - sphere.position;
		let a: f32 = dot(ray.direction, ray.direction) * 2;
		let b: f32 = dot(origin, ray.direction) * 2;
		let c: f32 = dot(origin, origin) - sphere.radius * sphere.radius;
		let discriminant: f32 = b * b - 2 * a * c;

		if (discriminant < 0) {
			continue;
		}

		let t: f32 = (-b - sqrt(discriminant)) / a;

		if (t <= 0 || t >= closest_t) {
			continue;
		}

		closest_t = t;
		object_index = i32(i);
	}

	if (object_index < 0) {
		return rmiss();
	}

	return rchit(ray, closest_t, u32(object_index));
}

fn rchit(ray: Ray, distance: f32, object_index: u32) -> Hit {
	let object: Sphere = objects[object_index];
	let origin: vec3f = ray.origin - object.position;
	let position: vec3f = origin + ray.direction * distance;

	var hit: Hit;
	hit.distance = distance;
	hit.position = position + object.position;
	hit.normal = normalize(position);
	hit.object_index = object_index;

	return hit;
}

fn rmiss() -> Hit {
	var hit: Hit;
	hit.distance = -1;

	return hit;
}

fn pcg_hash(input: u32) -> u32 {
	let state: u32 = input * 747796405u + 2891336453u;
	let word: u32 = ((state >> ((state >> 28u) + 4u)) ^ state) * 277803737u;

	return (word >> 22u) ^ word;
}

fn random_float(seed: ptr<function, u32>) -> f32 {
	*seed = pcg_hash(*seed);

	return f32(*seed) / F32_MAX;
}

fn random_vec_unit(seed: ptr<function, u32>) -> vec3f {
	return normalize(
		vec3f(
			random_float(seed),
			random_float(seed),
			random_float(seed),
		) * 2 - 1,
	);
}