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
	point: vec3f,
	normal: vec3f,
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
	var position: vec2f = (input.position.xy / viewport * 2 - 1) * vec2f(aspect_ratio, -1);
	let light_direction: vec3f = normalize(vec3f(-1, -1, -1));
	let background: vec4f = vec4f();

	var sphere: Sphere;
	sphere.position = vec3f();
	sphere.radius = .5;
	sphere.color = vec3f(1, .3, 0);

	var ray: Ray;
	ray.origin = vec3f(0, 0, 1);
	ray.direction = vec3f(position, -1);

	let a: f32 = dot(ray.direction, ray.direction) * 2;
	let b: f32 = dot(ray.origin, ray.direction) * 2;
	let c: f32 = dot(ray.origin, ray.origin) - sphere.radius * sphere.radius;
	let discriminant: f32 = b * b - 2 * a * c;

	if (discriminant < 0) {
		return background;
	}

	let t: f32 = (-b - sqrt(discriminant)) / a;

	var hit: Hit;
	hit.point = ray.origin + ray.direction * t;
	hit.normal = normalize(hit.point - sphere.position);

	ray.hit = hit;

	let light: f32 = max(dot(hit.normal, -light_direction), 0);

	return vec4f(sphere.color * light, 1);
}

fn random(seed: f32) -> f32 {
	let n: f32 = seed * (seed + 195439) * (seed + 124395) * (seed + 845921);

	return n / 4294967295;
}