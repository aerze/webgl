#version 300 es

// fragment shaders don't have a default precision so we need
// to pick one. mediump is a good default. It means "medium precision"
precision mediump float;

// declare output for the fragment shader
out vec4 outColor;

// texture
// uniform sampler2D u_image;

// coords from the vertex shader
// varying vec2 v_texCoord;

void main() {
  outColor = vec4(1, 0, 0.5, 1);

  // gl_FragColor is a special variable a fragment shader
  // is responsible for setting
  // gl_FragColor = vec4(1, 0, 0.5, 1); // return redish-purple

  // gl_FragColor = u_color; // return global color

  // look up a color from the texture
  // gl_FragColor = texture2D(u_image, v_texCoord);
}
