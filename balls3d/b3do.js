/*
(c) 2010 Katalabs, Inc.
All Rights Reserved

b3d o3d wrapper

b3do.pack(o3d_pack) // create a world associated with this pack -- o3d_pack.b3d_world
  o3d_pack.b3d_step() // does o3d_pack.b3d_world.step() and updates all elements that have b3d bodies

b3do.dBall(o3d_pack, o3d_shape=None) // create a dynamic ball, add to o3d_pack.b3d_world.  If no shape, create as sphere, add to pack
b3do.sBox(o3d_pack, o3d_shape=None) // create a static box, add to o3d_pack.b3d_world.  If no shape, create as cube, add to pack
*/

var b3do = b3do || {};

/// right now I'm doing this stupidly as I don't really get prototype inheritance

b3do.world = function (gravity, timestep, ground, pack) {
	this.world = new b3d.world(gravity, timestep, ground)
	this.pack = pack

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
