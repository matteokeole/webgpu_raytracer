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
	hit: Hit,
}

struct Hit {
	p0: vec3f,
	normal0: vec3f,
	p1: vec3f,
	normal1: vec3f,
}

struct Sphere {
	position: vec3f,
	radius: f32,
	color: vec3f,
}

@vertex
fn vertex(input: VertexInput) -> VertexOutput {
	var output: VertexOutput;

	output.position = vec4f(input.position, 0, 1);

	return output;
}

@fragment
fn fragment(input: VertexOutput) -> @location(0) vec4f {
	let aspect_ratio: f32 = viewport.x / viewport.y;
	let position: vec2f = (input.position.xy / viewport * 2 - 1) * vec2f(aspect_ratio, 1);
	let camera: vec3f = vec3f(0, 0, 2);
	let light_direction: vec3f = normalize(vec3f(0, 1, 1));

	var sphere: Sphere;
	sphere.position = vec3f(0, 0, 0);
	sphere.radius = .5;
	sphere.color = vec3f(1);

	var ray: Ray;
	ray.origin = camera;
	ray.direction = vec3f(position, -1);

	let a: f32 = dot(ray.direction, ray.direction) * 2;
	let b: f32 = dot(ray.origin, ray.direction) * 2;
	let c: f32 = dot(ray.origin, ray.origin) - sphere.radius * sphere.radius;
	let discriminant: f32 = b * b - 2 * a * c;

	if (discriminant >= 0) {
		let t: f32 = sqrt(discriminant) / a;
		let t0: f32 = -b - t;
		let t1: f32 = -b + t;

		var hit: Hit;
		hit.p0 = ray.origin + ray.direction * t0;
		hit.normal0 = normalize(hit.p0 - sphere.position);
		// hit.p1 = ray.origin + ray.direction * t1;
		// hit.normal1 = normalize(hit.p1 - sphere.position);

		ray.hit = hit;

		let light: f32 = max(dot(hit.normal0, -light_direction), 0);

		return vec4f(sphere.color * light, 1);
	}

	return vec4f();
}

fn random(seed: f32) -> f32 {
	let n: f32 = seed * (seed + 195439) * (seed + 124395) * (seed + 845921);

	return n / 4294967295;
}