import vert from './vertex.glsl'
import frag from './fragment.glsl'
import WebGL from './WebGl'
import Matrix from './Matrix'

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
    const VERTEX_BYTE_SIZE = 4 * 2 // 4 bytes per 32Float, 2 position floats
    console.log('VERTEX_BYTE_SIZE', VERTEX_BYTE_SIZE, VERTEX_BYTE_SIZE * 8)

    // the max amount of entities expected floor((2 ^ 16) / 6)
    // const MAX_BATCH = 10922
    const MAX_BATCH = 1
    console.log('MAX_BATCH', MAX_BATCH)
    // the amount of vertices per quad
    const VERTICES_PER_QUAD = 6
    console.log('VERTICES_PER_QUAD', VERTICES_PER_QUAD)
    // the amount of vertices per entity
    const VERTICES_PER_ENTITY = 4
    console.log('VERTICES_PER_ENTITY', VERTICES_PER_ENTITY)
    // max vertices in vertex array
    const MAX_VERTICES_PER_QUAD = MAX_BATCH * VERTICES_PER_QUAD
    console.log('MAX_VERTICES_PER_QUAD', MAX_VERTICES_PER_QUAD)
    // the size of max entity vertices
    const VERTEX_DATA_SIZE = VERTEX_BYTE_SIZE * MAX_BATCH * VERTICES_PER_QUAD
    console.log('VERTEX_DATA_SIZE', VERTEX_DATA_SIZE)
    // the size of max quad vertices
    const INDEX_DATA_SIZE = MAX_VERTICES_PER_QUAD
    console.log('INDEX_DATA_SIZE', INDEX_DATA_SIZE)

    // bind loop func
    this.loop = this.loop.bind(this)

    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA)
    gl.enable(gl.BLEND)
    gl.useProgram(this.program)

    // get attrs locations
    this.positionLocation = gl.getAttribLocation(program, 'a_position')
    // get uniform locations
    this.matrixLocation = gl.getUniformLocation(program, 'u_matrix')
    this.colorLocation = gl.getUniformLocation(program, 'u_color')

    // create local index array
    this.indexData = new Uint16Array(INDEX_DATA_SIZE)
    // initialize index buffer object
    this.indexBufferObject = gl.createBuffer()
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.indexBufferObject)
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, this.indexData.byteLength, gl.STATIC_DRAW)

    let i, j
    for (i = j = 0; i < MAX_VERTICES_PER_QUAD; i += VERTICES_PER_QUAD, j += VERTICES_PER_ENTITY) {
      this.indexData[i + 0] = j + 0
      this.indexData[i + 1] = j + 1
      this.indexData[i + 2] = j + 2
      this.indexData[i + 3] = j + 2
      this.indexData[i + 4] = j + 1
      this.indexData[i + 5] = j + 3
    }
    console.log('indices', this.indexData, this.indexData.byteLength, 'bytes')
    gl.bufferSubData(gl.ELEMENT_ARRAY_BUFFER, 0, this.indexData)

    // create local vertex Array
    this.vertexData = new ArrayBuffer(VERTEX_DATA_SIZE)
    // create view into vertex array
    this.vertexPositionData = new Float32Array(this.vertexData)
    // initialize vertex buffer object
    this.vertexBufferObject = gl.createBuffer()
    gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexBufferObject)
    gl.bufferData(gl.ARRAY_BUFFER, this.vertexData.byteLength, gl.DYNAMIC_DRAW)

    console.log('vertices', this.vertexData, this.vertexData.byteLength, 'bytes')
    // enable and initialize attribute pointers
    this.vao = gl.createVertexArray()
    gl.bindVertexArray(this.vao)
    gl.enableVertexAttribArray(this.positionLocation)
    gl.vertexAttribPointer(this.positionLocation, 2, gl.FLOAT, false, VERTEX_BYTE_SIZE, 0)

    this.last = 0
    this.verticesCount = 1 * VERTICES_PER_QUAD

    this.trans = [0, 0]
    this.angle = 0
    this.scale = [1, 1]

    this.box = { x: 0, y: 0, w: 20, h: 20, c: [255, 255, 0] }

    window.requestAnimationFrame(this.loop)
  }

  loop (now) {
    const { gl, program } = this
    const delta = (now || 0) - this.last
    console.log('loop ∆', delta)
    this.last = now

    this.resizeCanvas()
    gl.viewport(0, 0, gl.canvas.width, gl.canvas.height)
    gl.clearColor(0, 0, 0, 1)
    gl.clear(gl.COLOR_BUFFER_BIT)

    gl.useProgram(program)
    gl.bindVertexArray(this.vao)

    this.update()
    this.draw()

    // gl.drawArrays(gl.TRIANGLES, 0, this.count)

    if (this.play) requestAnimationFrame(this.loop)
  }

  update () {
    const { gl } = this
    const { width, height } = gl.canvas
    const [tx, ty] = this.trans
    const angle = this.angle
    const [sx, sy] = this.scale

    const matrix = Matrix.fromTransformation(width, height, tx, ty, angle, sx, sy)
    console.log('update', matrix.contents)

    gl.uniformMatrix3fv(this.matrixLocation, false, matrix.contents)
  }

  draw () {
    const { gl, box } = this
    const { x, y, w, h } = box

    let offset = 0

    const left = x
    const right = x + w
    const top = y
    const bottom = y + h

    const x0 = left
    const y0 = top

    const x1 = right
    const y1 = top

    const x2 = left
    const y2 = bottom

    const x3 = left
    const y3 = bottom

    const x4 = right
    const y4 = top

    const x5 = right
    const y5 = bottom

    // left, top
    this.vertexPositionData[offset++] = x0
    this.vertexPositionData[offset++] = y0

    // right, top
    this.vertexPositionData[offset++] = x1
    this.vertexPositionData[offset++] = y1

    // left, bot
    this.vertexPositionData[offset++] = x2
    this.vertexPositionData[offset++] = y2

    // left, bot
    this.vertexPositionData[offset++] = x3
    this.vertexPositionData[offset++] = y3

    // right, top
    this.vertexPositionData[offset++] = x4
    this.vertexPositionData[offset++] = y4

    // right, bot
    this.vertexPositionData[offset++] = x5
    this.vertexPositionData[offset++] = y5

    console.log('vertices', this.vertexPositionData, this.vertexPositionData.byteLength, 'bytes')

    gl.uniform4f(this.colorLocation, 1, 0, 1, 1)
    gl.bufferSubData(gl.ARRAY_BUFFER, 0, this.vertexPositionData)
    gl.drawArrays(gl.TRIANGLES, 0, this.verticesCount)
    // gl.drawElements(gl.TRIANGLES, 3, gl.UNSIGNED_SHORT, 0)
  }

  /**
   * Make the drawing buffer match the size of the stretched canvas
   */
  resizeCanvas () {
    const { canvas } = this.gl
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
