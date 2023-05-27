@binding(0) @group(0) var<uniform> viewport: vec2f;
@binding(1) @group(0) var<uniform> camera_position: vec3f;
@binding(2) @group(0) var<uniform> projection_inverse: mat4x4<f32>;
@binding(3) @group(0) var<uniform> view_inverse: mat4x4<f32>;
@binding(4) @group(0) var<storage, read> sphere_positions: array<f32>;
@binding(5) @group(0) var<storage, read> sphere_radiuses: array<f32>;
@binding(6) @group(0) var<storage, read> sphere_albedos: array<f32>;

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
	albedo: vec3f,
	is_null: bool,
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

	var ray: Ray;
	ray.origin = camera_position;
	ray.direction = (view_inverse * vec4f(normalize(position.xyz / position.w), 0)).xyz;

	return trace(ray);
}

fn trace(ray: Ray) -> vec4f {
	let background: vec4f = vec4f(0, 0, 0, 1);
	let light_direction: vec3f = normalize(vec3f(1, -1, -1));

	var closestT: f32 = 3.402823466e+38;
	var closestSphere: Sphere;
	closestSphere.is_null = true;

	for (var i: u32 = 0; i < arrayLength(&sphere_radiuses); i = i + 1) {
		let position: vec3f = vec3f(sphere_positions[i * 3], sphere_positions[i * 3 + 1], sphere_positions[i * 3 + 2]);
		let radius: f32 = sphere_radiuses[i];

		let origin: vec3f = ray.origin - position;

		let a: f32 = dot(ray.direction, ray.direction) * 2;
		let b: f32 = dot(origin, ray.direction) * 2;
		let c: f32 = dot(origin, origin) - radius * radius;
		let discriminant: f32 = b * b - 2 * a * c;

		if (discriminant < 0) {
			continue;
		}

		let t: f32 = (-b - sqrt(discriminant)) / a;

		if (t >= closestT) {
			continue;
		}

		closestT = t;
		closestSphere.position = position;
		closestSphere.radius = radius;
		closestSphere.albedo = vec3f(sphere_albedos[i * 3], sphere_albedos[i * 3 + 1], sphere_albedos[i * 3 + 2]);
		closestSphere.is_null = false;
	}

	if (closestSphere.is_null || closestT < 0) {
		return background;
	}

	let origin: vec3f = ray.origin - closestSphere.position;

	var hit: Hit;
	hit.point = origin + ray.direction * closestT;
	hit.normal = normalize(hit.point);

	let light: f32 = max(dot(hit.normal, -light_direction), 0);

	return vec4f(closestSphere.albedo * light, 1);
}