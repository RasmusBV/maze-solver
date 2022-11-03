var __classPrivateFieldSet = (this && this.__classPrivateFieldSet) || function (receiver, state, value, kind, f) {
    if (kind === "m") throw new TypeError("Private method is not writable");
    if (kind === "a" && !f) throw new TypeError("Private accessor was defined without a setter");
    if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver)) throw new TypeError("Cannot write private member to an object whose class did not declare it");
    return (kind === "a" ? f.call(receiver, value) : f ? f.value = value : state.set(receiver, value)), value;
};
var __classPrivateFieldGet = (this && this.__classPrivateFieldGet) || function (receiver, state, kind, f) {
    if (kind === "a" && !f) throw new TypeError("Private accessor was defined without a getter");
    if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver)) throw new TypeError("Cannot read private member from an object whose class did not declare it");
    return kind === "m" ? f : kind === "a" ? f.call(receiver) : f ? f.value : state.get(receiver);
};
var _WebGLAPI_instances, _WebGLAPI_grid, _WebGLAPI_gl, _WebGLAPI_program, _WebGLAPI_positionLocation, _WebGLAPI_normalLocation, _WebGLAPI_worldViewProjectionLocation, _WebGLAPI_worldLocation, _WebGLAPI_reverseLightDirectionLocation, _WebGLAPI_colorLocation, _WebGLAPI_positionBuffer, _WebGLAPI_normalBuffer, _WebGLAPI_projectionMatrix, _WebGLAPI_viewProjectionMatrix, _WebGLAPI_rotationMatrix, _WebGLAPI_rotationZ, _WebGLAPI_rotationX, _WebGLAPI_radius, _WebGLAPI_currentZoom, _WebGLAPI_initWebGL, _WebGLAPI_rotationEventHandler, _WebGLAPI_zoomEventHandler, _WebGLAPI_drawScene, _WebGLAPI_drawSquare;
import { NGrid } from "./NGrid.js";
const vertexShader3D = `
attribute vec4 a_position;
attribute vec3 a_normal;

uniform mat4 u_worldViewProjection;
uniform mat4 u_world;

varying vec3 v_normal;

void main() {
  // Multiply the position by the matrix.
  gl_Position = u_worldViewProjection * a_position;

  // Pass the color and normal to the fragment shader.
  v_normal = mat3(u_world) * a_normal;
}
`;
const fragmentShader3D = `
precision mediump float;

// Passed in from the vertex shader.
varying vec3 v_normal;

uniform vec3 u_reverseLightDirection;
uniform vec4 u_color;

void main() {
  vec3 normal = normalize(v_normal);

  float light = dot(normal, u_reverseLightDirection);

  gl_FragColor = u_color;
  gl_FragColor.rbg *= max(light, 0.2);
}
`;
class WebGLUtils {
    static resizeCanvasToDisplaySize(canvas) {
        // Lookup the size the browser is displaying the canvas in CSS pixels.
        const displayWidth = canvas.clientWidth;
        const displayHeight = canvas.clientHeight;
        // Check if the canvas is not the same size.
        const needResize = canvas.width !== displayWidth ||
            canvas.height !== displayHeight;
        if (needResize) {
            // Make the canvas the same size
            canvas.width = displayWidth;
            canvas.height = displayHeight;
        }
        return needResize;
    }
    static createProgramFromScripts(gl, vertexShaderScript, fragmentShaderScript) {
        const vertexShader = this.createShader(gl, gl.VERTEX_SHADER, vertexShaderScript);
        const fragmentShader = this.createShader(gl, gl.FRAGMENT_SHADER, fragmentShaderScript);
        const program = gl.createProgram();
        if (!program) {
            throw new Error("Program not initializable!");
        }
        gl.attachShader(program, vertexShader);
        gl.attachShader(program, fragmentShader);
        gl.linkProgram(program);
        const success = gl.getProgramParameter(program, gl.LINK_STATUS);
        if (success) {
            return program;
        }
        console.log(gl.getProgramInfoLog(program));
        gl.deleteProgram(program);
        throw new Error("Program was not linked!");
    }
    static createShader(gl, type, source) {
        const shader = gl.createShader(type);
        if (!shader) {
            throw new Error("Shader not initializable!");
        }
        gl.shaderSource(shader, source);
        gl.compileShader(shader);
        const success = gl.getShaderParameter(shader, gl.COMPILE_STATUS);
        if (success) {
            return shader;
        }
        console.log(gl.getShaderInfoLog(shader));
        gl.deleteShader(shader);
        throw new Error("Shader was not compiled!");
    }
    static degToRad(angleInDegrees) {
        return angleInDegrees * Math.PI / 180;
    }
    static radToDeg(angleInRadians) {
        return angleInRadians * 180 / Math.PI;
    }
}
class V3 {
    static cross(a, b) {
        return [a[1] * b[2] - a[2] * b[1],
            a[2] * b[0] - a[0] * b[2],
            a[0] * b[1] - a[1] * b[0]];
    }
    static subtractVectors(a, b) {
        return [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
    }
    static normalize(v) {
        var length = Math.sqrt(v[0] * v[0] + v[1] * v[1] + v[2] * v[2]);
        // make sure we don't divide by 0.
        if (length === 0) {
            return [0, 0, 0];
        }
        else {
            return [v[0] / length, v[1] / length, v[2] / length];
        }
    }
}
class M4 {
    static translate(m, tx, ty, tz) {
        return M4.multiply(m, M4.translation(tx, ty, tz));
    }
    static translation(tx, ty, tz) {
        return [
            1, 0, 0, 0,
            0, 1, 0, 0,
            0, 0, 1, 0,
            tx, ty, tz, 1,
        ];
    }
    static xRotate(m, angleInRadians) {
        return M4.multiply(m, M4.xRotation(angleInRadians));
    }
    static xRotation(angleInRadians) {
        const c = Math.cos(angleInRadians);
        const s = Math.sin(angleInRadians);
        return [
            1, 0, 0, 0,
            0, c, s, 0,
            0, -s, c, 0,
            0, 0, 0, 1,
        ];
    }
    static yRotate(m, angleInRadians) {
        return M4.multiply(m, M4.yRotation(angleInRadians));
    }
    static yRotation(angleInRadians) {
        const c = Math.cos(angleInRadians);
        const s = Math.sin(angleInRadians);
        return [
            c, 0, -s, 0,
            0, 1, 0, 0,
            s, 0, c, 0,
            0, 0, 0, 1,
        ];
    }
    static zRotate(m, angleInRadians) {
        return M4.multiply(m, M4.zRotation(angleInRadians));
    }
    static zRotation(angleInRadians) {
        const c = Math.cos(angleInRadians);
        const s = Math.sin(angleInRadians);
        return [
            c, s, 0, 0,
            -s, c, 0, 0,
            0, 0, 1, 0,
            0, 0, 0, 1,
        ];
    }
    static scale(m, sx, sy, sz) {
        return M4.multiply(m, M4.scaling(sx, sy, sz));
    }
    static scaling(sx, sy, sz) {
        return [
            sx, 0, 0, 0,
            0, sy, 0, 0,
            0, 0, sz, 0,
            0, 0, 0, 1,
        ];
    }
    static multiply(a, b) {
        const b00 = b[0 * 4 + 0];
        const b01 = b[0 * 4 + 1];
        const b02 = b[0 * 4 + 2];
        const b03 = b[0 * 4 + 3];
        const b10 = b[1 * 4 + 0];
        const b11 = b[1 * 4 + 1];
        const b12 = b[1 * 4 + 2];
        const b13 = b[1 * 4 + 3];
        const b20 = b[2 * 4 + 0];
        const b21 = b[2 * 4 + 1];
        const b22 = b[2 * 4 + 2];
        const b23 = b[2 * 4 + 3];
        const b30 = b[3 * 4 + 0];
        const b31 = b[3 * 4 + 1];
        const b32 = b[3 * 4 + 2];
        const b33 = b[3 * 4 + 3];
        const a00 = a[0 * 4 + 0];
        const a01 = a[0 * 4 + 1];
        const a02 = a[0 * 4 + 2];
        const a03 = a[0 * 4 + 3];
        const a10 = a[1 * 4 + 0];
        const a11 = a[1 * 4 + 1];
        const a12 = a[1 * 4 + 2];
        const a13 = a[1 * 4 + 3];
        const a20 = a[2 * 4 + 0];
        const a21 = a[2 * 4 + 1];
        const a22 = a[2 * 4 + 2];
        const a23 = a[2 * 4 + 3];
        const a30 = a[3 * 4 + 0];
        const a31 = a[3 * 4 + 1];
        const a32 = a[3 * 4 + 2];
        const a33 = a[3 * 4 + 3];
        return [
            b00 * a00 + b01 * a10 + b02 * a20 + b03 * a30,
            b00 * a01 + b01 * a11 + b02 * a21 + b03 * a31,
            b00 * a02 + b01 * a12 + b02 * a22 + b03 * a32,
            b00 * a03 + b01 * a13 + b02 * a23 + b03 * a33,
            b10 * a00 + b11 * a10 + b12 * a20 + b13 * a30,
            b10 * a01 + b11 * a11 + b12 * a21 + b13 * a31,
            b10 * a02 + b11 * a12 + b12 * a22 + b13 * a32,
            b10 * a03 + b11 * a13 + b12 * a23 + b13 * a33,
            b20 * a00 + b21 * a10 + b22 * a20 + b23 * a30,
            b20 * a01 + b21 * a11 + b22 * a21 + b23 * a31,
            b20 * a02 + b21 * a12 + b22 * a22 + b23 * a32,
            b20 * a03 + b21 * a13 + b22 * a23 + b23 * a33,
            b30 * a00 + b31 * a10 + b32 * a20 + b33 * a30,
            b30 * a01 + b31 * a11 + b32 * a21 + b33 * a31,
            b30 * a02 + b31 * a12 + b32 * a22 + b33 * a32,
            b30 * a03 + b31 * a13 + b32 * a23 + b33 * a33,
        ];
    }
    static inverse(m) {
        var m00 = m[0 * 4 + 0];
        var m01 = m[0 * 4 + 1];
        var m02 = m[0 * 4 + 2];
        var m03 = m[0 * 4 + 3];
        var m10 = m[1 * 4 + 0];
        var m11 = m[1 * 4 + 1];
        var m12 = m[1 * 4 + 2];
        var m13 = m[1 * 4 + 3];
        var m20 = m[2 * 4 + 0];
        var m21 = m[2 * 4 + 1];
        var m22 = m[2 * 4 + 2];
        var m23 = m[2 * 4 + 3];
        var m30 = m[3 * 4 + 0];
        var m31 = m[3 * 4 + 1];
        var m32 = m[3 * 4 + 2];
        var m33 = m[3 * 4 + 3];
        var tmp_0 = m22 * m33;
        var tmp_1 = m32 * m23;
        var tmp_2 = m12 * m33;
        var tmp_3 = m32 * m13;
        var tmp_4 = m12 * m23;
        var tmp_5 = m22 * m13;
        var tmp_6 = m02 * m33;
        var tmp_7 = m32 * m03;
        var tmp_8 = m02 * m23;
        var tmp_9 = m22 * m03;
        var tmp_10 = m02 * m13;
        var tmp_11 = m12 * m03;
        var tmp_12 = m20 * m31;
        var tmp_13 = m30 * m21;
        var tmp_14 = m10 * m31;
        var tmp_15 = m30 * m11;
        var tmp_16 = m10 * m21;
        var tmp_17 = m20 * m11;
        var tmp_18 = m00 * m31;
        var tmp_19 = m30 * m01;
        var tmp_20 = m00 * m21;
        var tmp_21 = m20 * m01;
        var tmp_22 = m00 * m11;
        var tmp_23 = m10 * m01;
        var t0 = (tmp_0 * m11 + tmp_3 * m21 + tmp_4 * m31) -
            (tmp_1 * m11 + tmp_2 * m21 + tmp_5 * m31);
        var t1 = (tmp_1 * m01 + tmp_6 * m21 + tmp_9 * m31) -
            (tmp_0 * m01 + tmp_7 * m21 + tmp_8 * m31);
        var t2 = (tmp_2 * m01 + tmp_7 * m11 + tmp_10 * m31) -
            (tmp_3 * m01 + tmp_6 * m11 + tmp_11 * m31);
        var t3 = (tmp_5 * m01 + tmp_8 * m11 + tmp_11 * m21) -
            (tmp_4 * m01 + tmp_9 * m11 + tmp_10 * m21);
        var d = 1.0 / (m00 * t0 + m10 * t1 + m20 * t2 + m30 * t3);
        return [
            d * t0,
            d * t1,
            d * t2,
            d * t3,
            d * ((tmp_1 * m10 + tmp_2 * m20 + tmp_5 * m30) -
                (tmp_0 * m10 + tmp_3 * m20 + tmp_4 * m30)),
            d * ((tmp_0 * m00 + tmp_7 * m20 + tmp_8 * m30) -
                (tmp_1 * m00 + tmp_6 * m20 + tmp_9 * m30)),
            d * ((tmp_3 * m00 + tmp_6 * m10 + tmp_11 * m30) -
                (tmp_2 * m00 + tmp_7 * m10 + tmp_10 * m30)),
            d * ((tmp_4 * m00 + tmp_9 * m10 + tmp_10 * m20) -
                (tmp_5 * m00 + tmp_8 * m10 + tmp_11 * m20)),
            d * ((tmp_12 * m13 + tmp_15 * m23 + tmp_16 * m33) -
                (tmp_13 * m13 + tmp_14 * m23 + tmp_17 * m33)),
            d * ((tmp_13 * m03 + tmp_18 * m23 + tmp_21 * m33) -
                (tmp_12 * m03 + tmp_19 * m23 + tmp_20 * m33)),
            d * ((tmp_14 * m03 + tmp_19 * m13 + tmp_22 * m33) -
                (tmp_15 * m03 + tmp_18 * m13 + tmp_23 * m33)),
            d * ((tmp_17 * m03 + tmp_20 * m13 + tmp_23 * m23) -
                (tmp_16 * m03 + tmp_21 * m13 + tmp_22 * m23)),
            d * ((tmp_14 * m22 + tmp_17 * m32 + tmp_13 * m12) -
                (tmp_16 * m32 + tmp_12 * m12 + tmp_15 * m22)),
            d * ((tmp_20 * m32 + tmp_12 * m02 + tmp_19 * m22) -
                (tmp_18 * m22 + tmp_21 * m32 + tmp_13 * m02)),
            d * ((tmp_18 * m12 + tmp_23 * m32 + tmp_15 * m02) -
                (tmp_22 * m32 + tmp_14 * m02 + tmp_19 * m12)),
            d * ((tmp_22 * m22 + tmp_16 * m02 + tmp_21 * m12) -
                (tmp_20 * m12 + tmp_23 * m22 + tmp_17 * m02))
        ];
    }
    static perspective(fieldOfViewInRadians, aspect, zNear, zFar) {
        const f = Math.tan(Math.PI * 0.5 - 0.5 * fieldOfViewInRadians);
        const rangeInv = 1.0 / (zNear - zFar);
        return [
            f / aspect, 0, 0, 0,
            0, f, 0, 0,
            0, 0, (zNear + zFar) * rangeInv, -1,
            0, 0, zNear * zFar * rangeInv * 2, 0
        ];
    }
    static lookAt(cameraPosition, target, up = [0, 1, 0]) {
        const zAxis = V3.normalize(V3.subtractVectors(cameraPosition, target));
        const xAxis = V3.normalize(V3.cross(up, zAxis));
        const yAxis = V3.normalize(V3.cross(zAxis, xAxis));
        return [
            xAxis[0], xAxis[1], xAxis[2], 0,
            yAxis[0], yAxis[1], yAxis[2], 0,
            zAxis[0], zAxis[1], zAxis[2], 0,
            cameraPosition[0],
            cameraPosition[1],
            cameraPosition[2],
            1,
        ];
    }
    static identity() {
        return [
            1, 0, 0, 0,
            0, 1, 0, 0,
            0, 0, 1, 0,
            0, 0, 0, 1,
        ];
    }
}
class Primitives {
    static cube(width, height, depth) {
        const translation = [-width / 2, -height / 2, -depth / 2];
        return [
            //Back face
            0, 0, 0,
            0, height, 0,
            width, 0, 0,
            width, 0, 0,
            0, height, 0,
            width, height, 0,
            //Left face
            0, 0, 0,
            0, 0, depth,
            0, height, 0,
            0, height, 0,
            0, 0, depth,
            0, height, depth,
            //Bottom Face
            0, 0, 0,
            width, 0, 0,
            0, 0, depth,
            0, 0, depth,
            width, 0, 0,
            width, 0, depth,
            //Front face
            width, height, depth,
            0, height, depth,
            width, 0, depth,
            width, 0, depth,
            0, height, depth,
            0, 0, depth,
            //Right face
            width, height, depth,
            width, 0, depth,
            width, height, 0,
            width, height, 0,
            width, 0, depth,
            width, 0, 0,
            //Top face
            width, height, depth,
            width, height, 0,
            0, height, depth,
            0, height, depth,
            width, height, 0,
            0, height, 0,
        ].map((value, index) => value + translation[index % 3]);
    }
    static cubeNormals() {
        return [
            0, 0, -1,
            0, 0, -1,
            0, 0, -1,
            0, 0, -1,
            0, 0, -1,
            0, 0, -1,
            -1, 0, 0,
            -1, 0, 0,
            -1, 0, 0,
            -1, 0, 0,
            -1, 0, 0,
            -1, 0, 0,
            0, -1, 0,
            0, -1, 0,
            0, -1, 0,
            0, -1, 0,
            0, -1, 0,
            0, -1, 0,
            0, 0, 1,
            0, 0, 1,
            0, 0, 1,
            0, 0, 1,
            0, 0, 1,
            0, 0, 1,
            1, 0, 0,
            1, 0, 0,
            1, 0, 0,
            1, 0, 0,
            1, 0, 0,
            1, 0, 0,
            0, 1, 0,
            0, 1, 0,
            0, 1, 0,
            0, 1, 0,
            0, 1, 0,
            0, 1, 0,
        ];
    }
    static cubeColor() {
        return [
            200, 70, 120,
            200, 70, 120,
            200, 70, 120,
            200, 70, 120,
            200, 70, 120,
            200, 70, 120,
            120, 200, 70,
            120, 200, 70,
            120, 200, 70,
            120, 200, 70,
            120, 200, 70,
            120, 200, 70,
            70, 120, 200,
            70, 120, 200,
            70, 120, 200,
            70, 120, 200,
            70, 120, 200,
            70, 120, 200,
            200, 70, 120,
            200, 70, 120,
            200, 70, 120,
            200, 70, 120,
            200, 70, 120,
            200, 70, 120,
            120, 200, 70,
            120, 200, 70,
            120, 200, 70,
            120, 200, 70,
            120, 200, 70,
            120, 200, 70,
            70, 120, 200,
            70, 120, 200,
            70, 120, 200,
            70, 120, 200,
            70, 120, 200,
            70, 120, 200,
        ];
    }
}
class WebGLAPI {
    constructor(canvas) {
        _WebGLAPI_instances.add(this);
        _WebGLAPI_grid.set(this, void 0);
        _WebGLAPI_gl.set(this, void 0);
        _WebGLAPI_program.set(this, void 0);
        _WebGLAPI_positionLocation.set(this, void 0);
        _WebGLAPI_normalLocation.set(this, void 0);
        _WebGLAPI_worldViewProjectionLocation.set(this, void 0);
        _WebGLAPI_worldLocation.set(this, void 0);
        _WebGLAPI_reverseLightDirectionLocation.set(this, void 0);
        _WebGLAPI_colorLocation.set(this, void 0);
        _WebGLAPI_positionBuffer.set(this, void 0);
        _WebGLAPI_normalBuffer.set(this, void 0);
        _WebGLAPI_projectionMatrix.set(this, void 0);
        _WebGLAPI_viewProjectionMatrix.set(this, void 0);
        _WebGLAPI_rotationMatrix.set(this, M4.yRotation(0));
        _WebGLAPI_rotationZ.set(this, 0);
        _WebGLAPI_rotationX.set(this, 0);
        _WebGLAPI_radius.set(this, 0);
        _WebGLAPI_currentZoom.set(this, 0);
        this.kill = false;
        __classPrivateFieldSet(this, _WebGLAPI_grid, new NGrid([1, 1, 1], 1), "f");
        const gl = canvas.getContext('webgl');
        if (gl === null) {
            throw new Error("Bruh");
        }
        gl.clearColor(1, 1, 1, 1);
        __classPrivateFieldSet(this, _WebGLAPI_gl, gl, "f");
        __classPrivateFieldGet(this, _WebGLAPI_instances, "m", _WebGLAPI_initWebGL).call(this, gl);
        __classPrivateFieldGet(this, _WebGLAPI_instances, "m", _WebGLAPI_rotationEventHandler).call(this, canvas, this.changeRotation.bind(this));
        __classPrivateFieldGet(this, _WebGLAPI_instances, "m", _WebGLAPI_zoomEventHandler).call(this, canvas, this.changeZoom.bind(this));
    }
    changeCanvasSize(size) {
        __classPrivateFieldSet(this, _WebGLAPI_projectionMatrix, M4.perspective(WebGLUtils.degToRad(90), __classPrivateFieldGet(this, _WebGLAPI_gl, "f").canvas.clientWidth / __classPrivateFieldGet(this, _WebGLAPI_gl, "f").canvas.clientHeight, 1, 2000), "f");
        __classPrivateFieldSet(this, _WebGLAPI_viewProjectionMatrix, M4.multiply(__classPrivateFieldGet(this, _WebGLAPI_projectionMatrix, "f"), M4.inverse(M4.multiply(M4.xRotation(__classPrivateFieldGet(this, _WebGLAPI_rotationZ, "f")), M4.translation(0, 0, __classPrivateFieldGet(this, _WebGLAPI_currentZoom, "f"))))), "f");
    }
    setGrid(grid) {
        const radius = Math.sqrt(grid.dimensions[0] * grid.dimensions[0] + grid.dimensions[2] * grid.dimensions[2]) * 5;
        __classPrivateFieldSet(this, _WebGLAPI_viewProjectionMatrix, M4.multiply(__classPrivateFieldGet(this, _WebGLAPI_projectionMatrix, "f"), M4.inverse(M4.multiply(M4.xRotation(__classPrivateFieldGet(this, _WebGLAPI_rotationZ, "f")), M4.translation(0, 0, radius)))), "f");
        __classPrivateFieldSet(this, _WebGLAPI_radius, radius / (1.8), "f");
        __classPrivateFieldSet(this, _WebGLAPI_currentZoom, radius, "f");
        __classPrivateFieldSet(this, _WebGLAPI_grid, new NGrid(grid.dimensions, 0), "f");
        __classPrivateFieldGet(this, _WebGLAPI_grid, "f").insertSubGrid(grid, __classPrivateFieldGet(this, _WebGLAPI_grid, "f").getOriginVertex());
    }
    setGridCellValue(gridCell, value) {
        try {
            __classPrivateFieldGet(this, _WebGLAPI_grid, "f").assertVertex(gridCell);
        }
        catch (e) {
            {
                throw new RangeError(`No vertex in the grid at: ${JSON.stringify(gridCell)}`);
            }
        }
        __classPrivateFieldGet(this, _WebGLAPI_grid, "f").setVertexValue(gridCell, value);
    }
    getGridCellValue(gridCell) {
        try {
            __classPrivateFieldGet(this, _WebGLAPI_grid, "f").assertVertex(gridCell);
        }
        catch (e) {
            {
                throw new RangeError(`No vertex in the grid at: ${JSON.stringify(gridCell)}`);
            }
        }
        return __classPrivateFieldGet(this, _WebGLAPI_grid, "f").getVertexValue(gridCell);
    }
    changeRotation(angle) {
        __classPrivateFieldSet(this, _WebGLAPI_rotationX, __classPrivateFieldGet(this, _WebGLAPI_rotationX, "f") + angle[0], "f");
        __classPrivateFieldSet(this, _WebGLAPI_rotationZ, __classPrivateFieldGet(this, _WebGLAPI_rotationZ, "f") - angle[1], "f");
        __classPrivateFieldSet(this, _WebGLAPI_rotationZ, __classPrivateFieldGet(this, _WebGLAPI_rotationZ, "f") > Math.PI / 2 ? Math.PI / 2 : __classPrivateFieldGet(this, _WebGLAPI_rotationZ, "f"), "f");
        __classPrivateFieldSet(this, _WebGLAPI_rotationZ, __classPrivateFieldGet(this, _WebGLAPI_rotationZ, "f") < -Math.PI / 2 ? -Math.PI / 2 : __classPrivateFieldGet(this, _WebGLAPI_rotationZ, "f"), "f");
        __classPrivateFieldSet(this, _WebGLAPI_viewProjectionMatrix, M4.multiply(__classPrivateFieldGet(this, _WebGLAPI_projectionMatrix, "f"), M4.inverse(M4.multiply(M4.xRotation(__classPrivateFieldGet(this, _WebGLAPI_rotationZ, "f")), M4.translation(0, 0, __classPrivateFieldGet(this, _WebGLAPI_currentZoom, "f"))))), "f");
        __classPrivateFieldSet(this, _WebGLAPI_rotationMatrix, M4.yRotation(__classPrivateFieldGet(this, _WebGLAPI_rotationX, "f")), "f");
    }
    changeZoom(zoom) {
        __classPrivateFieldSet(this, _WebGLAPI_currentZoom, __classPrivateFieldGet(this, _WebGLAPI_currentZoom, "f") + zoom, "f");
        __classPrivateFieldSet(this, _WebGLAPI_currentZoom, Math.max(__classPrivateFieldGet(this, _WebGLAPI_currentZoom, "f"), __classPrivateFieldGet(this, _WebGLAPI_radius, "f")), "f");
        __classPrivateFieldSet(this, _WebGLAPI_currentZoom, Math.min(__classPrivateFieldGet(this, _WebGLAPI_currentZoom, "f"), __classPrivateFieldGet(this, _WebGLAPI_radius, "f") * 3), "f");
        __classPrivateFieldSet(this, _WebGLAPI_viewProjectionMatrix, M4.multiply(__classPrivateFieldGet(this, _WebGLAPI_projectionMatrix, "f"), M4.inverse(M4.multiply(M4.xRotation(__classPrivateFieldGet(this, _WebGLAPI_rotationZ, "f")), M4.translation(0, 0, __classPrivateFieldGet(this, _WebGLAPI_currentZoom, "f"))))), "f");
    }
}
_WebGLAPI_grid = new WeakMap(), _WebGLAPI_gl = new WeakMap(), _WebGLAPI_program = new WeakMap(), _WebGLAPI_positionLocation = new WeakMap(), _WebGLAPI_normalLocation = new WeakMap(), _WebGLAPI_worldViewProjectionLocation = new WeakMap(), _WebGLAPI_worldLocation = new WeakMap(), _WebGLAPI_reverseLightDirectionLocation = new WeakMap(), _WebGLAPI_colorLocation = new WeakMap(), _WebGLAPI_positionBuffer = new WeakMap(), _WebGLAPI_normalBuffer = new WeakMap(), _WebGLAPI_projectionMatrix = new WeakMap(), _WebGLAPI_viewProjectionMatrix = new WeakMap(), _WebGLAPI_rotationMatrix = new WeakMap(), _WebGLAPI_rotationZ = new WeakMap(), _WebGLAPI_rotationX = new WeakMap(), _WebGLAPI_radius = new WeakMap(), _WebGLAPI_currentZoom = new WeakMap(), _WebGLAPI_instances = new WeakSet(), _WebGLAPI_initWebGL = function _WebGLAPI_initWebGL(gl) {
    //Creating program
    __classPrivateFieldSet(this, _WebGLAPI_program, WebGLUtils.createProgramFromScripts(gl, vertexShader3D, fragmentShader3D), "f");
    //Attributes:
    __classPrivateFieldSet(this, _WebGLAPI_positionLocation, gl.getAttribLocation(__classPrivateFieldGet(this, _WebGLAPI_program, "f"), "a_position"), "f");
    __classPrivateFieldSet(this, _WebGLAPI_normalLocation, gl.getAttribLocation(__classPrivateFieldGet(this, _WebGLAPI_program, "f"), "a_normal"), "f");
    //Uniforms:
    __classPrivateFieldSet(this, _WebGLAPI_worldViewProjectionLocation, gl.getUniformLocation(__classPrivateFieldGet(this, _WebGLAPI_program, "f"), "u_worldViewProjection"), "f");
    __classPrivateFieldSet(this, _WebGLAPI_worldLocation, gl.getUniformLocation(__classPrivateFieldGet(this, _WebGLAPI_program, "f"), "u_world"), "f");
    __classPrivateFieldSet(this, _WebGLAPI_reverseLightDirectionLocation, gl.getUniformLocation(__classPrivateFieldGet(this, _WebGLAPI_program, "f"), "u_reverseLightDirection"), "f");
    __classPrivateFieldSet(this, _WebGLAPI_colorLocation, gl.getUniformLocation(__classPrivateFieldGet(this, _WebGLAPI_program, "f"), "u_color"), "f");
    //Setting up buffers:
    __classPrivateFieldSet(this, _WebGLAPI_positionBuffer, gl.createBuffer(), "f");
    gl.bindBuffer(gl.ARRAY_BUFFER, __classPrivateFieldGet(this, _WebGLAPI_positionBuffer, "f"));
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(Primitives.cube(5, 5, 5)), gl.STATIC_DRAW);
    __classPrivateFieldSet(this, _WebGLAPI_normalBuffer, gl.createBuffer(), "f");
    gl.bindBuffer(gl.ARRAY_BUFFER, __classPrivateFieldGet(this, _WebGLAPI_normalBuffer, "f"));
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(Primitives.cubeNormals()), gl.STATIC_DRAW);
    __classPrivateFieldSet(this, _WebGLAPI_projectionMatrix, M4.perspective(WebGLUtils.degToRad(90), gl.canvas.clientWidth / gl.canvas.clientHeight, 1, 2000), "f");
    __classPrivateFieldSet(this, _WebGLAPI_viewProjectionMatrix, M4.multiply(__classPrivateFieldGet(this, _WebGLAPI_projectionMatrix, "f"), M4.inverse(M4.translation(0, 0, 100))), "f");
    const animationFrameCallback = () => {
        __classPrivateFieldGet(this, _WebGLAPI_instances, "m", _WebGLAPI_drawScene).call(this);
        if (this.kill) {
            return;
        }
        requestAnimationFrame(animationFrameCallback);
    };
    animationFrameCallback();
}, _WebGLAPI_rotationEventHandler = function _WebGLAPI_rotationEventHandler(canvas, callbackFn) {
    const mouseCallback = (mouseEvent) => {
        callbackFn([(mouseEvent.pageX - lastPos[0]) / 100, (mouseEvent.pageY - lastPos[1]) / 100]);
        lastPos = [mouseEvent.clientX, mouseEvent.clientY];
    };
    const touchCallback = (mouseEvent) => {
        callbackFn([(mouseEvent.touches[0].clientX - lastPos[0]) / 100, (mouseEvent.touches[0].clientY - lastPos[1]) / 100]);
        lastPos = [mouseEvent.touches[0].clientX, mouseEvent.touches[0].clientY];
    };
    let lastPos;
    canvas.addEventListener('mousedown', (event) => {
        lastPos = [event.pageX, event.pageY];
        canvas.addEventListener('mousemove', mouseCallback);
    });
    document.addEventListener('mouseup', () => {
        canvas.removeEventListener('mousemove', mouseCallback);
    });
    canvas.addEventListener('touchstart', (event) => {
        lastPos = [event.touches[0].pageX, event.touches[0].pageY];
        canvas.addEventListener('touchmove', touchCallback);
    });
    document.addEventListener('touchend', () => {
        canvas.removeEventListener('touchmove', touchCallback);
    });
    document.addEventListener('touchcancel', () => {
        canvas.removeEventListener('touchmove', touchCallback);
    });
}, _WebGLAPI_zoomEventHandler = function _WebGLAPI_zoomEventHandler(canvas, callbackFn) {
    canvas.addEventListener('wheel', (event) => {
        callbackFn(event.deltaY / 10);
    });
}, _WebGLAPI_drawScene = function _WebGLAPI_drawScene() {
    const centerOfGrid = __classPrivateFieldGet(this, _WebGLAPI_grid, "f").dimensions.map((value) => (value / 2) * 5);
    //Drawing on screen:
    WebGLUtils.resizeCanvasToDisplaySize(__classPrivateFieldGet(this, _WebGLAPI_gl, "f").canvas);
    __classPrivateFieldGet(this, _WebGLAPI_gl, "f").viewport(0, 0, __classPrivateFieldGet(this, _WebGLAPI_gl, "f").canvas.width, __classPrivateFieldGet(this, _WebGLAPI_gl, "f").canvas.height);
    __classPrivateFieldGet(this, _WebGLAPI_gl, "f").clear(__classPrivateFieldGet(this, _WebGLAPI_gl, "f").COLOR_BUFFER_BIT | __classPrivateFieldGet(this, _WebGLAPI_gl, "f").DEPTH_BUFFER_BIT);
    __classPrivateFieldGet(this, _WebGLAPI_gl, "f").enable(__classPrivateFieldGet(this, _WebGLAPI_gl, "f").CULL_FACE);
    __classPrivateFieldGet(this, _WebGLAPI_gl, "f").enable(__classPrivateFieldGet(this, _WebGLAPI_gl, "f").DEPTH_TEST);
    for (let i = 0; i < __classPrivateFieldGet(this, _WebGLAPI_grid, "f").dimensions[0]; i++) {
        for (let j = 0; j < __classPrivateFieldGet(this, _WebGLAPI_grid, "f").dimensions[1]; j++) {
            for (let k = 0; k < __classPrivateFieldGet(this, _WebGLAPI_grid, "f").dimensions[2]; k++) {
                const pointer = [i, j, k];
                __classPrivateFieldGet(this, _WebGLAPI_grid, "f").assertVertex(pointer);
                const value = __classPrivateFieldGet(this, _WebGLAPI_grid, "f").getVertexValue(pointer);
                if (value === 1) {
                    continue;
                }
                const translation = pointer.map((value, index) => value * 5 - centerOfGrid[index]);
                __classPrivateFieldGet(this, _WebGLAPI_instances, "m", _WebGLAPI_drawSquare).call(this, __classPrivateFieldGet(this, _WebGLAPI_gl, "f"), translation, 5, 1.15);
            }
        }
    }
    __classPrivateFieldGet(this, _WebGLAPI_gl, "f").clear(__classPrivateFieldGet(this, _WebGLAPI_gl, "f").DEPTH_BUFFER_BIT);
    for (let i = 0; i < __classPrivateFieldGet(this, _WebGLAPI_grid, "f").dimensions[0]; i++) {
        for (let j = 0; j < __classPrivateFieldGet(this, _WebGLAPI_grid, "f").dimensions[1]; j++) {
            for (let k = 0; k < __classPrivateFieldGet(this, _WebGLAPI_grid, "f").dimensions[2]; k++) {
                const pointer = [i, j, k];
                __classPrivateFieldGet(this, _WebGLAPI_grid, "f").assertVertex(pointer);
                let value = __classPrivateFieldGet(this, _WebGLAPI_grid, "f").getVertexValue(pointer);
                if (value === 1) {
                    continue;
                }
                const translation = pointer.map((value, index) => value * 5 - centerOfGrid[index]);
                if (pointer[0] === 0 && pointer[1] === 0 && pointer[2] === 0) {
                    value = 4;
                }
                else if (pointer[0] === __classPrivateFieldGet(this, _WebGLAPI_grid, "f").dimensions[0] - 1 && pointer[1] === __classPrivateFieldGet(this, _WebGLAPI_grid, "f").dimensions[1] - 1 && pointer[2] === __classPrivateFieldGet(this, _WebGLAPI_grid, "f").dimensions[2] - 1) {
                    value = 4;
                }
                __classPrivateFieldGet(this, _WebGLAPI_instances, "m", _WebGLAPI_drawSquare).call(this, __classPrivateFieldGet(this, _WebGLAPI_gl, "f"), translation, value, 1);
            }
        }
    }
}, _WebGLAPI_drawSquare = function _WebGLAPI_drawSquare(gl, coordinates, value, scale) {
    let color;
    switch (value) {
        case 0:
            color = [1, 1, 1, 0.5];
            break;
        case 2:
            color = [46 / 256, 151 / 256, 255 / 256, 1];
            break;
        case 3:
            color = [0 / 256, 255 / 256, 94 / 256, 1];
            break;
        case 4:
            color = [171 / 256, 171 / 256, 171 / 256, 1];
            break;
        default:
            color = [0, 0, 0, 1];
    }
    gl.useProgram(__classPrivateFieldGet(this, _WebGLAPI_program, "f"));
    gl.enableVertexAttribArray(__classPrivateFieldGet(this, _WebGLAPI_positionLocation, "f"));
    gl.bindBuffer(gl.ARRAY_BUFFER, __classPrivateFieldGet(this, _WebGLAPI_positionBuffer, "f"));
    gl.vertexAttribPointer(__classPrivateFieldGet(this, _WebGLAPI_positionLocation, "f"), 3, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(__classPrivateFieldGet(this, _WebGLAPI_normalLocation, "f"));
    gl.bindBuffer(gl.ARRAY_BUFFER, __classPrivateFieldGet(this, _WebGLAPI_normalBuffer, "f"));
    gl.vertexAttribPointer(__classPrivateFieldGet(this, _WebGLAPI_normalLocation, "f"), 3, gl.FLOAT, false, 0, 0);
    const worldMatrix = M4.scale(M4.multiply(__classPrivateFieldGet(this, _WebGLAPI_rotationMatrix, "f"), M4.translation(...coordinates)), scale, scale, scale);
    const worldViewProjectionMatrix = M4.multiply(__classPrivateFieldGet(this, _WebGLAPI_viewProjectionMatrix, "f"), worldMatrix);
    gl.uniformMatrix4fv(__classPrivateFieldGet(this, _WebGLAPI_worldViewProjectionLocation, "f"), false, worldViewProjectionMatrix);
    gl.uniformMatrix4fv(__classPrivateFieldGet(this, _WebGLAPI_worldLocation, "f"), false, worldMatrix);
    gl.uniform3fv(__classPrivateFieldGet(this, _WebGLAPI_reverseLightDirectionLocation, "f"), V3.normalize([0, 1, 1]));
    gl.uniform4fv(__classPrivateFieldGet(this, _WebGLAPI_colorLocation, "f"), color);
    gl.drawArrays(gl.TRIANGLES, 0, 6 * 6);
};
export { WebGLAPI };
