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
// look up uniform locations
const resolutionUniformLocation = gl.getUniformLocation(program, 'u_resolution')

// create buffer
const positionBuffer = gl.createBuffer()

// bind to a bind point
gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer)

// put data in the buffer through the bind point
// vec4 defaults to [x:0, y:0, z:0, w:1]
// vec2 defaults to [x:0, y:0]
const positions = [
//x    y
  10, 20,
  80, 20,
  10, 30,
  10, 30,
  80, 20,
  80, 30
]

// copies data from the new 32 Array to the ARRAY_BUFFER which is also the position buffer
gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions), gl.STATIC_DRAW)

// redfine clipspace as 0 to canvas dimensions
gl.viewport(0, 0, gl.canvas.width, gl.canvas.height)

// clear the canvas
gl.clearColor(0, 0, 0, 0) // set clear color?
gl.clear(gl.COLOR_BUFFER_BIT)

// Tell it to use our program (pair of shaders)
// binds the current gl program (like gl.bindBuffer)
gl.useProgram(program)

// set the resolution uniform
gl.uniform2f(resolutionUniformLocation, gl.canvas.width, gl.canvas.height)

// supply data from the buffer to the attrib in the shader
gl.enableVertexAttribArray(positionAttributeLocation)

// bind the position buffer
gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer)

const size = 2
const type = gl.FLOAT
const normalize = false
const stride = 0
const offset = 0

// position buffer now permanently bound to vec4 a_position
gl.vertexAttribPointer(positionAttributeLocation, size, type, normalize, stride, offset)

const primitiveType = gl.TRIANGLES
const drawOffset = 0
const drawCount = 6

gl.drawArrays(primitiveType, drawOffset, drawCount)
