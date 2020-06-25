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

        uniform float u_Time;

        void main(){
            vec2 st = gl_FragCoord.xy/400.0;
            vec3 color = vec3(0.0);
            
            color.r = sin(st.x * (u_Time / 1000.0));
            color.g = sin(st.y * (u_Time / 1000.0));
            color.b = sin(u_Time / 1000.0);

            gl_FragColor = vec4(color,1.0);
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
    let u_Time = gl.getUniformLocation(shaderProgram, 'u_Time')

    let randomVelocity = () => {
        let velocity = (Math.random() - 0.5) / 50
        return { 'vx': velocity, 'vy': velocity }
    }

    let vertices = new Float32Array([0.0, 0.5, -0.5, -0.5, 0.5, -0.5])
    let velocity = [randomVelocity(), randomVelocity(), randomVelocity()]


    const drawTriangle = (delta) => {

        for(let i=0; i<vertices.length; i+=2) {
            let index = Math.floor(i / 2)

            if (vertices[i] > 1  || vertices[i] < -1) {
                velocity[index].vx = -velocity[index].vx
            }

            if (vertices[i+1] > 1  || vertices[i+1] < -1) {
                velocity[index].vy = -velocity[index].vy
            }


            vertices[i] += velocity[index].vx
            vertices[i+1] += velocity[index].vy
        }

        let vertexBuffer = gl.createBuffer()
        

        if (!vertexBuffer) {
            console.error('Unable to create the buffer object')
            return null
        }

        gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer)
        gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW)

        gl.vertexAttribPointer(a_Position, 2, gl.FLOAT, false, 0, 0)
        gl.enableVertexAttribArray(a_Position)

        gl.uniform1f(u_Time, delta)

        gl.drawArrays(gl.TRIANGLES, 0, 3)

        return
    }

    let before = performance.now()

    function render(now) {
        let delta = now - (before * 0.001)
        before = now
        gl.clear(gl.COLOR_BUFFER_BIT)
        drawTriangle(delta)
        requestAnimationFrame(render)
    }

    render()
    
    
})()
