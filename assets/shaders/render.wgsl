@binding(0) @group(0) var<uniform> viewport: vec2f;
@binding(1) @group(0) var<uniform> time: f32;
@binding(2) @group(0) var<storage, read_write> image: array<f32>;

struct VertexInput {
	@location(0) position: vec2f,
}

struct VertexOutput {
	@builtin(position) position: vec4f,
}

struct Ray {
	origin: vec3f,
	direction: vec3f,
}

struct Sphere {
	position: vec3f,
	radius: f32,
}

@vertex
fn vertex(input: VertexInput) -> VertexOutput {
	var output: VertexOutput;

	output.position = vec4f(input.position, 0, 1);

	return output;
}

@fragment
fn fragment(input: VertexOutput) -> @location(0) vec4f {
	let position: vec2f = input.position.xy / viewport * 2 - 1;
	let camera: vec3f = vec3f(0, 0, 0);

	var sphere: Sphere;
	sphere.position = vec3f(0, 0, 3);
	sphere.radius = .5;

	var ray: Ray;
	ray.origin = sphere.position - camera;
	ray.direction = vec3f(position, 1) - ray.origin;

	let a: f32 = dot(ray.direction, ray.direction);
	let b: f32 = dot(ray.origin, ray.direction) * 2;
	let c: f32 = dot(ray.origin, ray.origin) - sphere.radius * sphere.radius;
	let discriminant: f32 = b * b - 4 * a * c;

	if (discriminant >= 0) {
		return vec4f(1);
	}

	return vec4f();
}

fn random(seed: f32) -> f32 {
	let n: f32 = seed * (seed + 195439) * (seed + 124395) * (seed + 845921);

	return n / 4294967295;
}