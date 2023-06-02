@binding(0) @group(0) var texture: texture_storage_2d<rgba8unorm, write>;

struct Sphere {
	origin: vec3f,
	radius: f32,
}

struct Ray {
	origin: vec3f,
	direction: vec3f,
}

@compute
@workgroup_size(8, 8, 1)
fn main(@builtin(global_invocation_id) global_invocation_id : vec3u) {
	let viewport: vec2u = textureDimensions(texture);
	let id: vec2f = vec2f(f32(global_invocation_id.x), f32(global_invocation_id.y));

	// [0, 400] -> [-200, 200]
	let position: vec2f = (id - vec2f(viewport) * .5) / f32(viewport.x);

	var sphere: Sphere;
	sphere.origin = vec3f(0, 0, 3);
	sphere.radius = .5;

	var ray: Ray;
	ray.origin = vec3f(0, 0, 0);
	ray.direction = vec3f(position, 1);

	var color: vec3f = vec3f(0);

	if (trace(ray, sphere)) {
		color = vec3f(1);
	}

	textureStore(texture, global_invocation_id.xy, vec4f(color, 1));
}

fn trace(ray: Ray, sphere: Sphere) -> bool {
	let origin: vec3f = ray.origin - sphere.origin;

	let a: f32 = dot(ray.direction, ray.direction) * 2;
	let b: f32 = dot(origin, ray.direction) * 2;
	let c: f32 = dot(origin, origin) - sphere.radius * sphere.radius;
	let discriminant: f32 = b * b - 2 * a * c;

	return discriminant > 0;
}