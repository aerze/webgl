import Katalyst from './Katalyst'

const { body } = document
body.style.margin = '0'
body.style.width = '100vw'
body.style.height = '100vh'
body.style.overflow = 'hidden'

const canvas = document.createElement('canvas')
canvas.width = body.clientWidth
canvas.height = body.clientHeight
body.appendChild(canvas)

const k = new Katalyst(canvas)
