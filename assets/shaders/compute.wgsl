@binding(2) @group(0) var<storage, read_write> image: array<f32>;

@compute
@workgroup_size(8, 8)
fn compute() {}