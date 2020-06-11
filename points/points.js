(() => {
    const canvasElement = document.querySelector('canvas')
    const gl = canvasElement.getContext('webgl')

    if (!gl) {
        console.error('WebGL is not supported.')
        return
    }

    gl.clearColor(0.0, 0.0, 0.0, 1.0)
    gl.clear(gl.COLOR_BUFFER_BIT)

    const loadShader = (type, src) => {
        const shader = gl.createShader(type)
        
        gl.shaderSource(shader, src)
        gl.compileShader(shader)

        if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
            console.error(`Error when compiling shaders: ${gl.getShaderInfoLog(shader)}`)
            gl.deleteShader(shader)
            return null
        }

        return shader
    }

    const vShaderSource = `
        attribute vec4 a_Position;
        void main() {
            gl_Position = a_Position;
            gl_PointSize = 5.0;
        }
    `

    const fShaderSource = `
        precision mediump float;

        uniform vec4 u_FragColor;
        void main() {
            gl_FragColor = u_FragColor;
        }
    `

    const vertexShader = loadShader(gl.VERTEX_SHADER, vShaderSource)
    const fragmentShader = loadShader(gl.FRAGMENT_SHADER, fShaderSource)
    
    const shaderProgram = gl.createProgram()
    gl.attachShader(shaderProgram, vertexShader)
    gl.attachShader(shaderProgram, fragmentShader)
    gl.linkProgram(shaderProgram)
    gl.useProgram(shaderProgram)


    if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {
        console.error(`Unable to initialize the shader program: ${gl.getProgramInfoLog(shaderProgram)}`)
        return null
    }


    let a_Position = gl.getAttribLocation(shaderProgram, 'a_Position')
    let u_FragColor = gl.getUniformLocation(shaderProgram, 'u_FragColor')


    const getRandomColor = () => Math.random().toFixed(2)
    const points = []
    let curr = 0

    const drawPoint = (e) => {
        const x = e.x
        const y = e.y
        const rect = e.target.getBoundingClientRect()

        const coords = {
            x: ((x - rect.left) - canvasElement.height / 2) / (canvasElement.height / 2),
            y: (canvasElement.width / 2 - (y - rect.top)) / (canvasElement.width / 2)
        }

        const color = [getRandomColor(), getRandomColor(), getRandomColor(), 1.0]

        curr < 10000 ? curr++ : curr = 0

        points[curr] = { coords, color }

        gl.clear(gl.COLOR_BUFFER_BIT)
        
        points.forEach(p => {
            gl.vertexAttrib3f(a_Position, p.coords.x, p.coords.y, 0.0)
            gl.uniform4f(u_FragColor, ...p.color)
            gl.drawArrays(gl.POINTS, 0, 1)
        })

    }

    canvasElement.onmousemove = (e) => drawPoint(e)
    
})()
