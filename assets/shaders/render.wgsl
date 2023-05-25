@binding(0) @group(0) var<uniform> viewport: vec2f;
@binding(1) @group(0) var<uniform> projection_inverse: mat4x4<f32>;
@binding(2) @group(0) var<uniform> view_inverse: mat4x4<f32>;
@binding(3) @group(0) var<uniform> camera_position: vec3f;

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
	let uv: vec2f = input.position.xy / viewport * 2 - 1;
	let position: vec4f = projection_inverse * vec4f(uv, 1, 1);
	let ray_direction: vec3f = (view_inverse * vec4f(normalize(position.xyz / position.w), 0)).xyz;

	var ray: Ray;
	ray.origin = camera_position;
	ray.direction = ray_direction;

	return trace(ray);
}

fn trace(ray: Ray) -> vec4f {
	let light_direction: vec3f = normalize(vec3f(-1, -1, -1));
	let background: vec4f = vec4f(0, 0, 0, 1);

	var sphere: Sphere;
	sphere.position = vec3f(0, 0, 0);
	sphere.radius = .5;
	sphere.color = vec3f(.75, .34, .22);

	let a: f32 = dot(ray.direction, ray.direction);
	let b: f32 = dot(ray.origin, ray.direction) * 2;
	let c: f32 = dot(ray.origin, ray.origin) - sphere.radius * sphere.radius;
	let discriminant: f32 = b * b - 4 * a * c;

	if (discriminant < 0) {
		return background;
	}

	let t: f32 = (-b - sqrt(discriminant)) / (a * 2);

	if (t < 0) {
		return background;
	}

	var hit: Hit;
	hit.point = ray.origin + ray.direction * t;
	hit.normal = normalize(hit.point);

	let light: f32 = max(dot(hit.normal, -light_direction), 0);

	return vec4f(sphere.color * light, 1);
}

fn random(seed: f32) -> f32 {
	let n: f32 = seed * (seed + 195439) * (seed + 124395) * (seed + 845921);

	return n / 4294967295;
}