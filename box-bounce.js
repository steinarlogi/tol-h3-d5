/////////////////////////////////////////////////////////////////
//    S�nid�mi � T�lvugraf�k
//     Ferningur skoppar um gluggann.  Notandi getur breytt
//     hra�anum me� upp/ni�ur �rvum.
//
//    Hj�lmt�r Hafsteinsson, jan�ar 2022
/////////////////////////////////////////////////////////////////
var canvas;
var gl;

// N�verandi sta�setning mi�ju ferningsins
var box = vec2( 0.0, 0.0 );

// Stefna (og hra�i) fernings
var dX;
var dY;

// Sv��i� er fr� -maxX til maxX og -maxY til maxY
var maxX = 1.0;
var maxY = 1.0;
var buffer = 0.2;

// H�lf breidd/h�� ferningsins
var boxRad = 0.05;
var expansion = 1;

var scaleMatrix = mat4();
var locMatrix;

// Ferningurinn er upphaflega � mi�junni
var vertices = new Float32Array([-0.05, -0.05, 0.05, -0.05, 0.05, 0.05, -0.05, 0.05]);


window.onload = function init() {

    canvas = document.getElementById( "gl-canvas" );

    gl = WebGLUtils.setupWebGL( canvas );
    if ( !gl ) { alert( "WebGL isn't available" ); }

    gl.viewport( 0, 0, canvas.width, canvas.height );
    gl.clearColor( 0.8, 0.8, 0.8, 1.0 );

    // Gefa ferningnum slembistefnu � upphafi
    dX = Math.random()*0.1-0.05;
    dY = Math.random()*0.1-0.05;

    //
    //  Load shaders and initialize attribute buffers
    //
    var program = initShaders( gl, "vertex-shader", "fragment-shader" );
    gl.useProgram( program );

    // Load the data into the GPU
    var bufferId = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, bufferId );
    gl.bufferData( gl.ARRAY_BUFFER, flatten(vertices), gl.DYNAMIC_DRAW );

    // Associate out shader variables with our data buffer
    var vPosition = gl.getAttribLocation( program, "vPosition" );
    gl.vertexAttribPointer( vPosition, 2, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray( vPosition );

    locBox = gl.getUniformLocation( program, "boxPos" );
    locMatrix = gl.getUniformLocation(program, "scaleMatrix");

    // Me�h�ndlun �rvalykla
    window.addEventListener("keydown", function(e){
        switch( e.keyCode ) {
            case 38:	// upp �r
              expansion *= 1.05;
              boxRad = 0.1 * (expansion / 2);

              break;
            case 40:	// ni�ur �r
              expansion /= 1.05;
              boxRad = 0.1 * (expansion / 2);
                break;
            //Vinstri ör
            case 37:
              dX -= 0.001;
              break;
            //Hægri ör
            case 39:
              dX += 0.001;
              break;
        }
    }   );

    render();
}


function render() {

    // L�t ferninginn skoppa af veggjunum
    if (Math.abs(box[0] + dX) * expansion > maxX - boxRad) dX = -dX;
    if (Math.abs(box[1] + dY) * expansion > maxY - boxRad) dY = -dY;

    // Uppf�ra sta�setningu
    box[0] += dX;
    box[1] += dY;

    //uppfæra stærð.
    if (Math.abs(box[0]) * expansion > maxX - boxRad) box[0] = box[0] > 0 ? (maxX - boxRad) / expansion : -(maxX - boxRad) / expansion;
    if (Math.abs(box[1]) * expansion > maxY - boxRad) box[1] = box[1] > 0 ? (maxY - boxRad) / expansion : -(maxY - boxRad) / expansion;
    scaleMatrix = mult(translate(dX, dY, 0), mult(scalem(expansion, expansion, 1), translate(-dX, -dY, 0)));

    gl.clear( gl.COLOR_BUFFER_BIT );
    //
    gl.uniform2fv( locBox, flatten(box) );
    gl.uniformMatrix4fv( locMatrix, false, flatten(scaleMatrix));


    gl.drawArrays( gl.TRIANGLE_FAN, 0, 4 );

    window.requestAnimFrame(render);
}
