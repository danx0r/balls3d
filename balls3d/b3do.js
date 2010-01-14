/*
(c) 2010 Katalabs, Inc.
All Rights Reserved

b3d o3d wrapper

*/

var b3do = b3do || {};

// global variables
var g_o3dElement
var g_client
var g_o3d
var g_math
var g_pack
var g_viewInfo
var g_eyePosition = [0, 0, 20]
var g_target = [0, 0, 19]
var g_camAngleY = 0


// move camera in direction it's looking
function moveCamera(d) {
	var dx=Math.sin(g_camAngleY)
	var dz=Math.cos(g_camAngleY)
	g_eyePosition[0] -= dx*d
	g_eyePosition[2] -= dz*d
	setCamera()
}

// move camera in direction perpendicular to where it's looking
function slideCamera(d) {
	var dx=Math.sin(g_camAngleY+Math.PI*.5)
	var dz=Math.cos(g_camAngleY+Math.PI*.5)
	g_eyePosition[0] -= dx*d
	g_eyePosition[2] -= dz*d
	setCamera()
}

// pan camera about Y (up) axis
function turnCamera(d) {
	g_camAngleY += d
}

// compute camera target as offset from eye position given camera angle, and set view
function setCamera() {
	var dx=Math.sin(g_camAngleY)
	var dz=Math.cos(g_camAngleY)
	g_target = g_eyePosition.slice()
	g_target[0] -= dx
	g_target[2] -= dz
    g_viewInfo.drawContext.view = g_math.matrix4.lookAt(
            g_eyePosition,     // eye
            g_target,        // target
            [0, 1, 0])    // up
	debug("ang: " + g_camAngleY + " eye: " + g_eyePosition + " targ: " + g_target, 0)
}

/// right now I'm doing this stupidly as I don't really get prototype inheritance

b3do.world = function (gravity, timestep, ground) {
    // Init global variables.
	this.world = new b3d.world(gravity, timestep, ground)
	this.pack = g_pack

	this.addDBall = function(size, pos, ori, nom, shape) {
		///	if no o3d primitive specified, create one:
		this.world.addDBall(size, pos, ori, nom)
		ball = this.world.dynamics[this.world.dynamics.length-1]	///	get the ball we just made
		if (shape==undefined) {
			debug("g_viewInfo: " + window.g_viewInfo,4)
			this.shape = o3djs.primitives.createSphere(
	            this.pack,
    	        o3djs.material.createBasicMaterial(this.pack, window.g_viewInfo, [1,0,0,1]),
        	    size,     // Radius of the sphere.
            	30,        // Number of meridians.
            	20)
		}
        ball.o3d_transform = this.pack.createObject('Transform')
        ball.o3d_transform.addShape(this.shape)
        ball.o3d_transform.translate(pos)
		///	need to do rotation
        ball.o3d_transform.parent = g_client.root;
	}
	
	this.step = function(steps) {
		this.world.step(steps)
		for (var j = 0; j < this.world.dynamics.length; j++) {
			obj = this.world.dynamics[j]
			debug("debug B: " + obj.pos)
//			window.g_transformArray[1].identity()
//			window.g_transformArray[1].translate(obj.pos)
			obj.o3d_transform.identity()
			obj.o3d_transform.translate(obj.pos)
			/// FIXME: orientation!
		}
	}
}

/**
 * Initializes global variables, positions camera, draws shapes.
 * @param {Array} clientElements Array of o3d object elements.
 */
function main(clientElements) {

    initGlobals(clientElements)

    // Set up the view and projection transformations.
    initContext()

    // Add the shapes to the transform heirarchy.
    createShapes()

	g_world = new b3do.world(-10.0,0.01,0,g_pack)
	g_world.addDBall(.5, [0,2,0], [0,0,0,1])
	debug("g_world: " + g_world + " gravity: " + g_world.world.gravity,1)
	debug("dynamics[0].pos: " + g_world.world.dynamics[0],3)
}

/**
 * Creates the client area.
 */
function initClient() {
    window.g_finished = false    // for selenium testing.
	g_debug_http = new XMLHttpRequest()

    // Runs the sample in V8. Comment out this line to run it in the browser
    // JavaScript engine, for example if you want to debug it.
    o3djs.util.setMainEngine(o3djs.util.Engine.V8)

    o3djs.util.makeClients(main)
}


/**
 * Initializes global variables and libraries.
 */
function initGlobals(clientElements) {
    g_o3dElement = clientElements[0]
    window.g_client = g_client = g_o3dElement.client
    g_o3d = g_o3dElement.o3d
    g_math = o3djs.math

    // Create a pack to manage the objects created.
    g_pack = g_client.createPack()

    // Create the render graph for a view.
    g_viewInfo = o3djs.rendergraph.createBasicView(
            g_pack,
            g_client.root,
            g_client.renderGraphRoot)
    window.document.onkeypress = keyPressedCallback
	window.g_viewInfo = g_viewInfo
}

/**
 * Sets up reasonable view and projection matrices.
 */
function initContext() {
    // Set up a perspective transformation for the projection.
    g_viewInfo.drawContext.projection = g_math.matrix4.perspective(
            g_math.degToRad(30), // 30 degree frustum.
            g_o3dElement.clientWidth / g_o3dElement.clientHeight, // Aspect ratio.
            1,                                    // Near plane.
            5000)                            // Far plane.

    // Set up our view transformation to look towards the world origin where the
    // primitives are located.
    g_viewInfo.drawContext.view = g_math.matrix4.lookAt(
            g_eyePosition,     // eye
            g_target,        // target
            [0, 1, 0])    // up
}

/**
 * Creates a material based on the given single color.
 * @param {!o3djs.math.Vector4} baseColor A 4-component vector with
 *         the R,G,B, and A components of a color.
 * @return {!o3d.Material} A phong material whose overall pigment is
 *         baseColor.
 */
function createMaterial(baseColor) {
    // Create a new, empty Material object.
    return o3djs.material.createBasicMaterial(g_pack, g_viewInfo, baseColor)
}

/**
 * Creates shapes using the primitives utility library, and adds them to the
 * transform graph at the root node.
 */
function createShapes() {
    var cube = o3djs.primitives.createCube(
            g_pack,
            createMaterial([0,1,0,1]), // A green phong-shaded material.
            Math.sqrt(2))                                    // The length of each side of the cube.
	g_cube = cube
    var sphere = o3djs.primitives.createSphere(
            g_pack,
            createMaterial([1,0,0,1]),
            0.5,     // Radius of the sphere.
            30,        // Number of meridians.
            20)        // Number of parallels.
	g_sphere=sphere

    var plane = o3djs.primitives.createPlane(
            g_pack,
            createMaterial([0,1,1,1]),
            10,            // Width.
            10,    // Depth.
            1,            // Horizontal subdivisions.
            1)         // Vertical subdivisions.

    // Add the shapes to the transforms.
    var transformTable = [
        {shape: cube, translation: [-3, 1, 0]},
     //   {shape: sphere, translation: [0, 3, 0]},
        {shape: plane, translation: [0, -.5, 0]},
    ]

	g_transformArray=[0,0,0]
    for (var tt = 0; tt < transformTable.length; ++tt) {
        var transform = g_pack.createObject('Transform')
        transform.addShape(transformTable[tt].shape)
        transform.translate(transformTable[tt].translation)
        transform.parent = g_client.root;
		g_transformArray[tt]=transform
    }
	window.g_transformArray = g_transformArray
}

