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
    const VERTEX_SIZE = 4
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

    this.loop = this.loop.bind(this)

    this.positionLocation = gl.getAttribLocation(program, 'a_position')

    this.matrixLocation = gl.getUniformLocation(program, 'u_matrix')
    this.colorLocation = gl.getUniformLocation(program, 'u_color')

    this.vertexData = new ArrayBuffer(VERTEX_DATA_SIZE)
    this.vertexPositionData = new Float32Array(this.vertexData)

    this.vertexBufferObject = gl.createBuffer()
    gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexBufferObject)
    gl.bufferData(gl.ARRAY_BUFFER, this.vertexData.byteLength, gl.DYNAMIC_DRAW)

    this.vao = gl.createVertexArray()
    gl.bindVertexArray(this.vao)
    gl.enableVertexAttribArray(this.positionLocation)
    gl.vertexAttribPointer(this.positionLocation, 2, gl.FLOAT, false, 0, 0)

    this.last = 0
    this.count = 6

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

    gl.drawArrays(gl.TRIANGLES, 0, this.count)

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

    console.log('draw', this.vertexPositionData)
    console.log(gl.getActiveUniform(this.program, this.colorLocation))
    console.log(gl.getUniform(this.program, this.colorLocation))

    gl.uniform4f(this.colorLocation, 1, 0, 1, 1)
    gl.bufferSubData(gl.ARRAY_BUFFER, 0, this.vertexPositionData)
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
