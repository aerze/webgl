import vert from './vertex.glsl'
import frag from './fragment.glsl'

export default class Core {
  /**
   * Compiles shader from source
   * @param {WebGLRenderingContext} gl
   * @param {string} source
   * @param {number} type
   */
  static CompileShader (gl, source, type) {
    var shader = gl.createShader(type)
    gl.shaderSource(shader, source)
    gl.compileShader(shader)

    const success = gl.getShaderParameter(shader, gl.COMPILE_STATUS)
    const shaderInfo = gl.getShaderInfoLog(shader)
    if (shaderInfo) console.log(shaderInfo)
    if (success) return shader

    gl.deleteShader(shader)
    throw Error('Shader failed to compile')
  }

  /**
   * Creates a program using 2 shaders
   * @param {WebGLRenderingContext} gl
   * @param {string} vsSource - vertex shader
   * @param {string} fsSource - fragment shader
   */
  static CreateShaderProgram (gl, vsSource, fsSource) {
    const program = gl.createProgram()
    const vShader = Core.CompileShader(gl, vsSource, gl.VERTEX_SHADER)
    const fShader = Core.CompileShader(gl, fsSource, gl.FRAGMENT_SHADER)
    gl.attachShader(program, vShader)
    gl.attachShader(program, fShader)
    gl.linkProgram(program)

    const success = gl.getProgramParameter(program, gl.LINK_STATUS)
    const programInfo = gl.getProgramInfoLog(program)
    if (programInfo) console.log(programInfo)
    if (success) return program

    gl.deleteProgram(program)
    throw Error('Program failed to link')
  }

  /**
   * @param {HTMLCanvasElement} canvas
   */
  constructor (canvas) {
    this.gl = canvas.getContext('webgl')
    if (!this.gl) throw new Error('Missing WebGL context')

    this.program = Core.CreateShaderProgram(this.gl, vert, frag)
  }

  main () {
    const { gl, program } = this
    const positionAttributeLocation = gl.getAttribLocation(program, 'a_position')
    const resolutionUniformLocation = gl.getUniformLocation(program, 'u_resolution')
    const colorUniformLocation = gl.getUniformLocation(program, 'u_color')

    const positionBuffer = gl.createBuffer()

    // bind to a bind point
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer)

    // put data in the buffer through the bind point
    // vec4 defaults to [x:0, y:0, z:0, w:1]
    // vec2 defaults to [x:0, y:0]
    const positions = [
      // x   y
      10,
      20,
      80,
      20,
      10,
      30,
      10,
      30,
      80,
      20,
      80,
      30
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

    for (var i = 0; i < 50; i += 1) {
      this.setRectangle(gl, this.rand(300), this.rand(300), this.rand(300), this.rand(300))

      gl.uniform4f(colorUniformLocation, Math.random(), Math.random(), Math.random(), 1)

      const primitiveType = gl.TRIANGLES
      const drawOffset = 0
      const drawCount = 6
      gl.drawArrays(primitiveType, drawOffset, drawCount)
    }
  }

  rand (range) {
    return Math.floor(Math.random() * range)
  }

  /**
   * @param {WebGLRenderingContext} gl
   * @param {number} x
   * @param {number} y
   * @param {number} width
   * @param {number} height
   */
  setRectangle (gl, x, y, width, height) {
    const left = x
    const right = x + width
    const top = y
    const bottom = y + height

    const rectangleArray = new Float32Array([
      left,
      top,
      right,
      top,
      left,
      bottom,
      left,
      bottom,
      right,
      top,
      right,
      bottom
    ])

    // gl.bufferData() affects whatever buffer is currently
    // bound to the 'ARRAY_BUFFER' bind point
    gl.bufferData(gl.ARRAY_BUFFER, rectangleArray, gl.STATIC_DRAW)
  }
}
