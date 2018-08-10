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
    this.gl = canvas.getContext('webgl2')
    if (!this.gl) throw new Error('Missing WebGL2 context')

    this.program = Core.CreateShaderProgram(this.gl, vert, frag)
  }

  init () {
    const { gl, program } = this
    this.positionAttributeLocation = gl.getAttribLocation(program, 'a_position')
    this.positionBuffer = gl.createBuffer()

    gl.bindBuffer(gl.ARRAY_BUFFER, this.positionBuffer)

    this.positions = [0, 0, 0, 0.5, 0.7, 0]

    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(this.positions), gl.STATIC_DRAW)

    // create a collection of attribute state
    this.vertexArrayObject = gl.createVertexArray()

    // bind vertexArrayObject to be the current vertexArray
    gl.bindVertexArray(this.vertexArrayObject)

    // setup the attributes of the vertex array
    gl.enableVertexAttribArray(this.positionAttributeLocation)

    const size = 2 // 2 components per iteration
    const type = gl.FLOAT // the data is 32bit floats
    const normalize = false // don't normalize the data
    const stride = 0 // 0 = move forward size * sizeof(type) each iteration to get the next position
    const offset = 0 // start at the beginning of the buffer
    gl.vertexAttribPointer(this.positionAttributeLocation, size, type, normalize, stride, offset)
    // this.positionBuffer is now bound to a_position

    // draw ?
    // set viewport
    gl.viewport(0, 0, gl.canvas.width, gl.canvas.height)

    // clear screen
    gl.clearColor(0, 0, 0, 0)
    gl.clear(gl.COLOR_BUFFER_BIT)

    gl.useProgram(program)

    gl.bindVertexArray(this.vertexArrayObject)

    const primitiveType = gl.TRIANGLES
    const drawOffset = 0
    const count = 3
    gl.drawArrays(primitiveType, drawOffset, count)
  }

  render () {}

  oldRender (image) {
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

    // for (var i = 0; i < 50; i += 1) {
    //   this.setRectangle(gl, this.rand(300), this.rand(300), this.rand(300), this.rand(300))

    //   gl.uniform4f(colorUniformLocation, Math.random(), Math.random(), Math.random(), 1)

    //   const primitiveType = gl.TRIANGLES
    //   const drawOffset = 0
    //   const drawCount = 6
    //   gl.drawArrays(primitiveType, drawOffset, drawCount)
    // }

    const textureCoordLocation = gl.getActiveAttrib(program, 'a_texCoord')
    const textureCoordBuffer = gl.createBuffer()

    // bind texture buffer to ARRAY_BUFFER
    gl.bindBuffer(gl.ARRAY_BUFFER, textureCoordBuffer)
    gl.bufferData(
      gl.ARRAY_BUFFER,
      new Float32Array([0.0, 0.0, 1.0, 0.0, 0.0, 1.0, 0.0, 1.0, 1.0, 0.0, 1.0, 1.0]),
      gl.STATIC_DRAW
    )
    gl.enableVertexAttribArray(textureCoordLocation)
    gl.vertexAttribPointer(textureCoordLocation, 2, gl.FLOAT, false, 0, 0)

    // create a new texture
    const texture = gl.createTexture()
    gl.bindTexture(gl.TEXTURE_2D, texture)

    // set texture parameters to render any size image
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST)

    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image)

    // upload the image into the texture
    // const target = gl.TEXTURE_2D
    // const level = 0
    // const internalFormat = gl.RGBA
    // const format = gl.RGBA
    // const textureType = gl.UNSIGNED_BYTE
    // const pixels = image

    // gl.texImage2D(target, level, internalFormat, format, textureType, pixels)
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
