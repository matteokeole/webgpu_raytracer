@binding(0) @group(0) var texture: texture_storage_2d<rgba8unorm, write>;
@binding(10) @group(0) var<uniform> camera: Camera;

struct Camera {
	position: vec3f,
	direction: vec3f,
}

struct Ray {
	origin: vec3f,
	direction: vec3f,
}

struct Sphere {
	position: vec3f,
	radius: f32,
	albedo: vec3f,
}

@compute
@workgroup_size(1, 1, 1)
fn main(@builtin(global_invocation_id) global_invocation_id: vec3u) {
	let viewport: vec2u = textureDimensions(texture);
	let id: vec2f = vec2f(f32(global_invocation_id.x), f32(global_invocation_id.y));

	let half_viewport: vec2f = vec2f(viewport) * .5;
	let width: f32 = f32(viewport.x);

	// TODO: Simplify
	// [0, 400] -> [-200, 200]
	let position: vec2f = (id - half_viewport) / width;

	var sphere: Sphere;
	sphere.position = vec3f(0, 0, 3);
	sphere.radius = .5;
	sphere.albedo = vec3f(1, .2, 0);

	var ray: Ray;
	ray.origin = camera.position;
	// TODO: Why Z changes the sphere size?
	ray.direction = vec3f(position, 1);

	var color: vec3f = vec3f();

	if (trace(ray, sphere)) {
		color = sphere.albedo;
	}

	textureStore(texture, global_invocation_id.xy, vec4f(color, 1));
}

fn trace(ray: Ray, sphere: Sphere) -> bool {
	let origin: vec3f = ray.origin - sphere.position;

	let a: f32 = dot(ray.direction, ray.direction) * 2;
	let b: f32 = dot(origin, ray.direction) * 2;
	let c: f32 = dot(origin, origin) - sphere.radius * sphere.radius;
	let discriminant: f32 = b * b - 2 * a * c;

	return discriminant > 0;
}