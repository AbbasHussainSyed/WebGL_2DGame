// FileName:        view.js
// Programmer:     Abbas Hussain Syed
// Date:           07/26/2024
// Purpose:        This file defines the code for our view.
//                 The "view" is our graphics area (i.e. the "canvas").


/**
 * The GameView class handles the rendering of the game objects and the display of the timer.
 */
class GameView {
    /**
     * Constructor for the GameView class.
     * @param {WebGL2RenderingContext} gl - The WebGL rendering context.
     */
    constructor(gl) {
        this.gl = gl;
        this.program = null;
        this.initShaders();
        this.initBuffers();
        this.initTimer();
    }

    /**
     * Initializes the shaders used for rendering.
     */
    initShaders() {
        const vertexShaderSource = `
            attribute vec2 aPosition;
            attribute vec4 aColor;
            varying vec4 vColor;
            void main() {
                gl_Position = vec4(aPosition, 0.0, 1.0);
                vColor = aColor;
            }
        `;
        const fragmentShaderSource = `
            precision mediump float;
            varying vec4 vColor;
            void main() {
                gl_FragColor = vColor;
            }
        `;

        const vertexShader = this.compileShader(this.gl.VERTEX_SHADER, vertexShaderSource);
        const fragmentShader = this.compileShader(this.gl.FRAGMENT_SHADER, fragmentShaderSource);

        this.program = this.gl.createProgram();
        this.gl.attachShader(this.program, vertexShader);
        this.gl.attachShader(this.program, fragmentShader);
        this.gl.linkProgram(this.program);

        if (!this.gl.getProgramParameter(this.program, this.gl.LINK_STATUS)) {
            console.error('Could not link shaders');
        }

        this.gl.useProgram(this.program);
    }

    /**
     * Compiles a shader of the given type.
     * @param {number} type - The type of shader (VERTEX_SHADER or FRAGMENT_SHADER).
     * @param {string} source - The source code of the shader.
     * @returns {WebGLShader} - The compiled shader.
     */
    compileShader(type, source) {
        const shader = this.gl.createShader(type);
        this.gl.shaderSource(shader, source);
        this.gl.compileShader(shader);
        if (!this.gl.getShaderParameter(shader, this.gl.COMPILE_STATUS)) {
            console.error('Shader compilation failed:', this.gl.getShaderInfoLog(shader));
            this.gl.deleteShader(shader);
            return null;
        }
        return shader;
    }

    /**
     * Initializes the buffers used for rendering the game objects.
     */
    initBuffers() {
        this.vertexBuffer = this.gl.createBuffer();
        this.colorBuffer = this.gl.createBuffer();
    }

    /**
     * Renders the game objects.
     * @param {Array} gameObjects - The game objects to be rendered.
     */
    render(gameObjects) {
        const gl = this.gl;
        gl.clear(gl.COLOR_BUFFER_BIT);

        for (let obj of gameObjects) {
            this.drawObject(obj);
        }
    }

    /**
     * Draws a single game object.
     * @param {Object} obj - The game object to be drawn.
     */
    drawObject(obj) {
        const gl = this.gl;

        gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexBuffer);
        const size = obj.size;
        const height = Math.sqrt(3) / 2 * size; // Equilateral triangle height

        const vertices = new Float32Array([
            obj.x, obj.y,
            obj.x + size / 2, obj.y - height,
            obj.x - size / 2, obj.y - height
        ]);
        gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);

        const position = gl.getAttribLocation(this.program, 'aPosition');
        gl.enableVertexAttribArray(position);
        gl.vertexAttribPointer(position, 2, gl.FLOAT, false, 0, 0);

        gl.bindBuffer(gl.ARRAY_BUFFER, this.colorBuffer);
        const colors = new Float32Array([
            ...obj.color,
            ...obj.color,
            ...obj.color
        ]);
        gl.bufferData(gl.ARRAY_BUFFER, colors, gl.STATIC_DRAW);

        const color = gl.getAttribLocation(this.program, 'aColor');
        gl.enableVertexAttribArray(color);
        gl.vertexAttribPointer(color, 4, gl.FLOAT, false, 0, 0);

        gl.drawArrays(gl.TRIANGLES, 0, 3);
    }

    /**
     * Initializes the timer element used to display the remaining time.
     */
    initTimer() {
        this.timerElement = document.createElement('div');
        this.timerElement.style.position = 'absolute';
        this.timerElement.style.top = '10px';
        this.timerElement.style.left = '10px';
        this.timerElement.style.color = 'yellow';
        this.timerElement.style.fontSize = '20px';
        this.timerElement.style.fontWeight = 'bold';
        document.body.appendChild(this.timerElement);
    }

    /**
     * Displays the remaining time on the screen.
     * @param {number} remainingTime - The remaining time in milliseconds.
     */
    displayTimer(remainingTime) {
        const minutes = Math.floor(remainingTime / 60000);
        const seconds = ((remainingTime % 60000) / 1000).toFixed(0);
        this.timerElement.textContent = `Time: ${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
    }
}