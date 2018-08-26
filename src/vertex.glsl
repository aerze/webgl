#version 300 es
// [x, y]
in vec2 a_position;
// [1, 2, 3, 4, 5, 6, 7, 8]
uniform mat3 u_matrix;
void main() {
  gl_Position = vec4((u_matrix * vec3(a_position, 1)).xy, 0, 1);
}
