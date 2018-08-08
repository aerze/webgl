// an attribute will receive data from a buffer
// vec2 - an array with [x, y]
attribute vec2 a_textCoord;
attribute vec2 a_position;
uniform vec2 u_resolution;
varying vec2 v_texCoord;


// all shaders have a main function
void main() {
  // convert the position from pixles to clispace (0.0 to 1.0)
  vec2 zeroToOne = a_position / u_resolution;

  // convert from 0-1 to 0-2
  vec2 zeroToTwo = zeroToOne * 2.0;

  // convert from 0-2 to -1-+1
  vec2 clipspace = zeroToTwo - 1.0;

  // gl_Position is a special variable a vertex shader
  // is basicall the return value it's responsible for setting
  gl_Position = vec4(clipspace * vec2(1, -1), 0, 1);

  v_texCoord = a_textCoord;
}
