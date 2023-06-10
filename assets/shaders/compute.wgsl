@group(0) @binding(0) var texture_storage: texture_storage_2d<rgba8unorm, write>;
// @group(0) @binding(1) var texture: texture_2d<f32>;
@group(0) @binding(2) var<storage, read_write> accumulation: array<vec4f>;
@group(0) @binding(10) var<storage> objects: array<Sphere>;
@group(0) @binding(11) var<storage> materials: array<Material>;
@group(0) @binding(12) var<uniform> camera: Camera;
@group(0) @binding(13) var<uniform> time: f32;
@group(0) @binding(14) var<uniform> offset: u32;
@group(0) @binding(15) var<uniform> accumulate: u32;

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
	objectIndex: u32,
}

struct Sphere {
	@size(16) position: vec3f,
	radius: f32,
	materialIndex: f32,
}

struct Material {
	@size(16) albedo: vec3f,
	@size(16) emissionColor: vec3f,
	roughness: f32,
	emissionStrength: f32,
}

const INFINITY: f32 = 3.402823466e+38;
const BOUNCES: u32 = 5;
const BACKGROUND_COLOR: vec3f = vec3f();

var<private> state: u32;

@compute
@workgroup_size(8, 8, 1)
fn main(@builtin(global_invocation_id) global_invocation_id: vec3u) {
	let id: vec2f = vec2f(f32(global_invocation_id.x), f32(global_invocation_id.y));
	let viewport: vec2f = vec2f(textureDimensions(texture_storage));
	let uv: vec2f = (id / viewport * 2 - 1) * vec2f(1, 1);
	let position: vec4f = vec4f((camera.projection_inverse * vec4f(uv, 0, 1)).xyz, 0);
	let seed: u32 = get_seed(id, viewport);

	// let newSeed: u32 = global_invocation_id.x + global_invocation_id.y * viewport.x + offset;

	var light: vec3f;
	var throughput: vec3f = vec3f(1);

	var ray: Ray;
	ray.origin = camera.position;
	ray.direction = (camera.view_inverse * position).xyz;

	for (var i: u32; i < BOUNCES; i++) {
		let hit: Hit = trace(ray);

		if (hit.distance < 0) {
			light += BACKGROUND_COLOR * throughput;

			break;
		}

		let object: Sphere = objects[hit.objectIndex];
		let material: Material = materials[u32(object.materialIndex)];

		throughput *= material.albedo;
		light += material.emissionColor * material.emissionStrength;

		ray.origin = hit.position + hit.normal * .0001;
		ray.direction = normalize(hit.normal + normalize(random_vec(ray.direction, seed, time, -1, 1)));
	}

	if (accumulate == 0) {
		// textureStore(texture_storage, global_invocation_id.xy, vec4f(light, 1));
		accumulation[global_invocation_id.x + global_invocation_id.y * u32(viewport.x)] = vec4f(light, 1);
	} else {
		accumulation[global_invocation_id.x + global_invocation_id.y * u32(viewport.x)] += vec4f(light, 1);
	}

	/* let id: vec2f = vec2f(f32(global_invocation_id.x), f32(global_invocation_id.y));
	let viewport: vec2u = textureDimensions(texture_storage);
	// let uv: vec2f = (id / viewport * 2 - 1) * vec2f(1, 1);
	var seed = u32(viewport.x * global_invocation_id.y + global_invocation_id.x) + offset;
    var pcg = pcg_hash(seed);
    var v = f32(pcg) * (1.0 / 4294967295.0);
    // return vec4<f32>(v, v, v, 1.0);

	accumulation[global_invocation_id.x + global_invocation_id.y * u32(viewport.x)] = vec4f(v, v, v, 1); */
}

fn trace(ray: Ray) -> Hit {
	var closestT: f32 = INFINITY;
	var objectIndex: i32 = -1;

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

		if (t <= 0 || t >= closestT) {
			continue;
		}

		closestT = t;
		objectIndex = i32(i);
	}

	if (objectIndex < 0) {
		return rmiss(ray);
	}

	return rchit(ray, closestT, u32(objectIndex));
}

fn rchit(ray: Ray, distance: f32, objectIndex: u32) -> Hit {
	let object: Sphere = objects[objectIndex];
	let origin: vec3f = ray.origin - object.position;

	var hit: Hit;
	hit.distance = distance;
	hit.position = origin + ray.direction * distance;
	hit.normal = normalize(hit.position);
	hit.objectIndex = objectIndex;

	hit.position += object.position;

	return hit;
}

fn rmiss(ray: Ray) -> Hit {
	var hit: Hit;

	hit.distance = -1;

	return hit;
}

fn get_seed(uv: vec2f, viewport: vec2f) -> u32 {
	let uViewport: vec2u = vec2u(viewport);
	let pixelCoord: vec2u = vec2u(uv) * uViewport;
	let pixelIndex: u32 = pixelCoord.x + pixelCoord.y * uViewport.x;

	return pixelIndex;
}

fn random_f_inout(seed: u32) -> vec2f {
	var state = seed * 747796405 + 2891336453;
	var result = ((state >> ((state >> 28) + 4)) ^ state) * 277803737;
	result = (result >> 22) ^ result;
	return vec2f(f32(result) / 4294967295, f32(state));
}

fn random_vec(direction: vec3f, seed: u32, time: f32, min: f32, max: f32) -> vec3f {
	let range: f32 = (max - min);
	let rng1: vec2f = random_f_inout(seed);
	let rng2: vec2f = random_f_inout(u32(rng1.y));
	let rng3: vec2f = random_f_inout(u32(rng2.y));

	return vec3f(
		noise3(direction * rng1.x * time),
		noise3(direction * rng2.x * time),
		noise3(direction * rng3.x * time),
	) * range + min;
}

fn noise3(p: vec3f) -> f32 {
	let a = floor(p);
	var d: vec3f = p - a;
	d = d * d * (3. - 2. * d);
	let b = a.xxyy + vec4f(0., 1., 0., 1.);
	let k1 = perm4(b.xyxy);
	let k2 = perm4(k1.xyxy + b.zzww);
	let c = k2 + a.zzzz;
	let k3 = perm4(c);
	let k4 = perm4(c + 1.);
	let o1 = fract(k3 * (1. / 41.));
	let o2 = fract(k4 * (1. / 41.));
	let o3 = o2 * d.z + o1 * (1. - d.z);
	let o4 = o3.yw * d.x + o3.xz * (1. - d.x);

	return o4.y * d.y + o4.x * (1. - d.y);
}

fn mod289(x: vec4f) -> vec4f {
	return x - floor(x * (1. / 289.)) * 289.;
}

fn perm4(x: vec4f) -> vec4f {
	return mod289(((x * 34.) + 1.) * x);
}

fn pcg_hash(input: u32) -> u32 {
	state = input * 747796405u + 2891336453u;
	var word = ((state >> ((state >> 28u) + 4u)) ^ state) * 277803737u;
	return (word >> 22u) ^ word;
}