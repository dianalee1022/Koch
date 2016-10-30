
var canvas;
var gl;

var points = [];

var numTimesToSubdivide = 0;

var bufferId;

function init()
{
    canvas = document.getElementById( "gl-canvas" );
    
    gl = WebGLUtils.setupWebGL( canvas );
    if ( !gl ) { alert( "WebGL isn't available" ); }
        
    //
    //  Configure WebGL
    //
    gl.viewport( 0, 0, canvas.width, canvas.height );
    gl.clearColor( 1.0, 1.0, 1.0, 1.0 );

    //  Load shaders and initialize attribute buffers
    
    var program = initShaders( gl, "vertex-shader", "fragment-shader" );
    gl.useProgram( program );

    // Load the data into the GPU
    
    bufferId = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, bufferId );
    gl.bufferData( gl.ARRAY_BUFFER, 8*Math.pow(5, 8)+8, gl.STATIC_DRAW );



    // Associate out shader variables with our data buffer
    
    var vPosition = gl.getAttribLocation( program, "vPosition" );
    gl.vertexAttribPointer( vPosition, 2, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray( vPosition );
    
        document.getElementById("slider").onchange = function(event) {
        numTimesToSubdivide = event.target.value;
        render();
    };


    render();
};


function divideKoch( p1, p6, count )
{

    // check for end of recursion
    
    if ( count <= 0 ) {
        points.push(p6);
    }
    else {
		// First, get p2 and p5 (the bottom corner points of each rectangle) using mix
        // Considering that the rectangle's width is 1/4 of each segment, 
		// the remaining segments be 1- 1/4 = 3/4
		// Divide the segments, 3/4, by 2, which is 3/8 = 0.375
		// p2 should be located: 0.375 away from p1 towards p6
		// p5 should be located: 0.375 away from p6 towards p1
		// Thus, p5 is located 1 - 0.375 = 0.625 away from p1.
        var p2 = mix(p1, p6, 0.375);
		var p5 = mix(p1, p6, 0.625);

		// Using p2 and p5, obtain the remaining points via transformation
        // The idea is to rotate the vector (p2, p5) for 90 degrees for left & right sides of rectangle.
		// In order to do so, we have to move the vector to the origin.
        var origin = vec2(p5[0]-p2[0], p5[1]-p2[1]);
        // Then, rotate 90 degrees (sin(pi/2)=1, cos(pi/2)=0)
        var rotate = vec2(-origin[1], origin[0]);
        // Translate it back to the original position
        var p3 = vec2(rotate[0]+p2[0], rotate[1]+p2[1]);
        // Add the length of original mid-line section to left corner to get the right corner
        var p4 = vec2(p3[0] + p5[0]-p2[0], p3[1] + p5[1]- p2[1]);
 
		// Decrease counter for recursion
		--count;
        
        // Push points and perform recursion in the correct order
        // 1) Push the leftmost point
        points.push(p1);
		// 2) Recursively call the function on the leftmost line
		divideKoch( p1, p2, count);
        // 3) Recursively call the function on the left-side of the rectangle created
        divideKoch( p2, p3, count );      
        // 4) Recursively call the function on the top-side of the rectangle created
        divideKoch( p3, p4, count ); 
        // 5) Recursively call the function on the right-side of the rectangle created
        divideKoch( p4, p5, count ); 
        // 6) Recursively call the function on the rightmost line
		divideKoch( p5, p6, count);
		// 7) Push the rightmost point
        points.push(p6);
    }
}

window.onload = init;

function render()
{
    var vertices = [
        vec2( -0.9, -0.9 ),
        vec2(  0.9, -0.9 )
    ];
    points = [];
    points.push(vertices[0])
    divideKoch( vertices[0], vertices[1], numTimesToSubdivide);

    gl.bufferSubData(gl.ARRAY_BUFFER, 0, flatten(points));
    gl.clear( gl.COLOR_BUFFER_BIT );
    gl.drawArrays( gl.LINE_STRIP, 0, points.length );
    points = [];
    //requestAnimFrame(render);
}

