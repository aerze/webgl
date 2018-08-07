import vert from './vertex.glsl'
import frag from './fragment.glsl'
import Core from './core.js'

const canvas = document.createElement('canvas')
canvas.width = 400;
canvas.height = 300;

document.body.appendChild(canvas)

const gl = new Core(canvas)
const program = Core.CreateShaderProgram(gl, vert, frag)

// look up attribute locations
const positionAttributeLocation = gl.getAttribLocation(program, 'a_position')

// create buffer
const positionBuffer = gl.createBuffer()

// bind to a bind point
gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer)

// put data in the buffer through the bind point
const positions = [
	0, 0,
	0, 0.5,
  0.7, 0
]

// copies data from the new 32 Array to the ARRAY_BUFFER which is also the position buffer
gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions), gl.STATIC_DRAW)

gl.viewport(0, 0, gl.canvas.width, gl.canvas.height)

gl.clearColor(0, 0, 0, 0) // set clear color?
gl.clear(gl.COLOR_BUFFER_BIT)
