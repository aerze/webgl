import vert from './vertex.glsl'
import frag from './fragment.glsl'

class WebGL {
  /**
   * Compiles shader from source
   * @param {WebGLRenderingContext} gl
   * @param {string} source
   * @param {number} type
   */
  static compileShader (gl, source, type) {
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
  static createShaderProgram (gl, vsSource, fsSource) {
    const program = gl.createProgram()
    const vShader = WebGL.compileShader(gl, vsSource, gl.VERTEX_SHADER)
    const fShader = WebGL.compileShader(gl, fsSource, gl.FRAGMENT_SHADER)
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
   * Creates a program using 2 shaders
   * @param {WebGLRenderingContext} gl
   * @param {number} target - buffer target
   * @param {number} size
   * @param {number} usage
   */
  static createBuffer (gl, target, size, usage) {
    const buffer = gl.createBuffer()
    gl.bindBuffer(target, buffer)
    gl.bufferData(target, size, usage)
    return buffer
  }
}

class Renderer {
  /**
   * Make the drawing buffer match the size of the stretched canvas
   * @param {HTMLCanvasElement} canvas
   */
  static resize (canvas) {
    // css pixels to real pixels
    // const ratio = window.devicePixelRatio || 1
    const ratio = 1
    const { clientWidth, clientHeight, width, height } = canvas
    const displayWidth = Math.floor(clientWidth * ratio)
    const displayHeight = Math.floor(clientHeight * ratio)

    if (width !== displayWidth || height !== displayHeight) {
      canvas.width = clientWidth
      canvas.height = clientHeight
    }
  }
}

class Entity {
  constructor (x = 0, y = 0, width = 20, height = 20, color = [1, 1, 0]) {
    this.x = x
    this.y = y
    this.w = width
    this.h = height
    this.c = color
  }
}

export default class Katalyst {
  /**
   * @param {HTMLCanvasElement} canvas
   */
  constructor (canvas) {
    // get webgl context
    const gl = (this.gl = canvas.getContext('webgl2'))
    // create program from shaders
    const program = (this.program = WebGL.createShaderProgram(gl, vert, frag))
    // this will determine the size of the blocks
    const VERTEX_SIZE = 8 + 4
    // the max amount of entities expected floor((2 ^ 16) / 6)
    const MAX_BATCH = 10922
    // the amount of vertices per quad
    const VERTICES_PER_QUAD = 6
    // the amount of vertices per entity
    const VERTICES_PER_ENTITY = 4
    // max vertices in vertex array
    const MAX_VERTICES_PER_QUAD = MAX_BATCH * VERTICES_PER_QUAD
    // the size of max entity vertices
    const VERTEX_DATA_SIZE = VERTEX_SIZE * MAX_BATCH * 4
    // the size of max quad vertices
    const INDEX_DATA_SIZE = MAX_VERTICES_PER_QUAD * 2

    // create various arrays

    // will contain entity vertex data
    this.vertexData = new ArrayBuffer(VERTEX_DATA_SIZE)
    // will contain entity to quad vertex index data
    this.vertexIndexData = new Uint16Array(INDEX_DATA_SIZE)
    // a 32bit float ArrayView into vertex data array
    this.vertexPositionView = new Float32Array(this.vertexData)
    // a 32bit unsigned integer ArrayView into the vertex data array
    this.vertexColorView = new Uint32Array(this.vertexData)
    // will contain all entities to be rendered
    this.entities = [new Entity(), new Entity(50, 50), new Entity(80, 90)]

    // store locations of shader inputs
    this.positionLocation = gl.getAttribLocation(program, 'a_position')
    this.resolutionLocation = gl.getUniformLocation(program, 'u_resolution')
    this.colorLocation = gl.getUniformLocation(program, 'u_color')
    this.matrixLocation = gl.getUniformLocation(program, 'u_matrix')

    // create bufferObjects for the vertex and index array
    this.indexBufferObject = WebGL.createBuffer(
      gl,
      gl.ELEMENT_ARRAY_BUFFER,
      this.vertexIndexData.byteLength,
      gl.STATIC_DRAW
    )
    this.vertexBufferObject = WebGL.createBuffer(gl, gl.ARRAY_BUFFER, this.vertexData.byteLength, gl.DYNAMIC_DRAW)

    // enable stuff
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA)
    gl.enable(gl.BLEND)
    gl.useProgram(program)

    // pre fill index array with indices mapping the 4 entity vertices to 6 quad vertices
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.indexBufferObject)
    let i, j
    for (i = j = 0; i < MAX_BATCH * VERTICES_PER_QUAD; i += VERTICES_PER_QUAD, j += VERTICES_PER_ENTITY) {
      this.vertexIndexData[i + 0] = j + 0
      this.vertexIndexData[i + 1] = j + 1
      this.vertexIndexData[i + 2] = j + 2
      this.vertexIndexData[i + 3] = j + 0
      this.vertexIndexData[i + 4] = j + 3
      this.vertexIndexData[i + 5] = j + 1
    }
    gl.bufferSubData(gl.ELEMENT_ARRAY_BUFFER, 0, this.vertexIndexData)
    // end buffer fill
  }
}
