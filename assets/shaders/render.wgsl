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
	distance: f32,
	position: vec3f,
	normal: vec3f,
	objectIndex: u32,
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
	let ray_direction: vec3f = (view_inverse * vec4f(normalize(position.xyz / position.w), 0)).xyz;

	let background_color: vec3f = vec3f();
	let light_direction: vec3f = normalize(vec3(-1));

	let bounces: u32 = 2;
	var multiplier: f32 = 1;
	var color: vec3f;

	var ray: Ray;
	ray.origin = camera_position;
	ray.direction = ray_direction;

	for (var i: u32 = 0; i < bounces; i++) {
		let hit: Hit = trace(ray);

		if (hit.distance < 0) {
			color += background_color * multiplier;

			break;
		}

		let light: f32 = max(dot(hit.normal, -light_direction), 0);
		let object: Sphere = getObject(hit.objectIndex);

		color += object.albedo * light * multiplier;

		multiplier *= .7;

		ray.origin = hit.position + hit.normal * .0001;
		ray.direction = reflect(ray.direction, hit.normal);
	}

	return vec4f(color, 1);
}

fn trace(ray: Ray) -> Hit {
	var closestT: f32 = 3.402823466e+38;
	var objectIndex: i32 = -1;

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

		if (t <= 0 || t >= closestT) {
			continue;
		}

		closestT = t;
		objectIndex = i32(i);
	}

	if (objectIndex < 0) {
		return miss(ray);
	}

	return closestHit(ray, closestT, u32(objectIndex));
}

fn closestHit(ray: Ray, distance: f32, objectIndex: u32) -> Hit {
	let object: Sphere = getObject(objectIndex);
	let origin: vec3f = ray.origin - object.position;

	var hit: Hit;
	hit.distance = distance;
	hit.position = origin + ray.direction * distance;
	hit.normal = normalize(hit.position);
	hit.objectIndex = objectIndex;

	hit.position += object.position;

	return hit;
}

fn miss(ray: Ray) -> Hit {
	var hit: Hit;

	hit.distance = -1;

	return hit;
}

fn getObject(index: u32) -> Sphere {
	var object: Sphere;
	object.position = vec3f(sphere_positions[index * 3], sphere_positions[index * 3 + 1], sphere_positions[index * 3 + 2]);
	object.radius = sphere_radiuses[index];
	object.albedo = vec3f(sphere_albedos[index * 3], sphere_albedos[index * 3 + 1], sphere_albedos[index * 3 + 2]);

	return object;
}