/*
(c) 2010 Katalabs, Inc.
All Rights Reserved
API:
    world = b3d.createWorld(floor=0, gravity=-9.8, timestep=0.01)
    box1=world.addBox(name,size,position,orientation)
    ball1=world.addBall(name,size,position,orientation)
    world.step(steps=1)
    box1.getPosition()
    box1.getOrientation()
    box1.getTransform()
    ///etc
*/

var b3d = b3d || {};

/// return distance squared
b3d.dist2 = function(b1, b2) {
	var dx = b1.pos[0]-b2.pos[0]
	var dy = b1.pos[1]-b2.pos[1]
	var dz = b1.pos[2]-b2.pos[2]
	return dx*dx + dy*dy + dz*dz
}

///	normalize a vector3 (as array); this is probably piss-slow -- use o3d?
b3d.normalize = function(v){
	d2 = v[0] * v[0] + v[1] * v[1] + v[2] * v[2]
	di = 1.0 / Math.pow(d2, .5)
	return [v[0] * di, v[1] * di, v[2] * di]
}

b3d.sBox = function (size, pos, ori, nom, bounce) {
	this.size = size
	this.pos = pos
	this.ori = ori
	this.vel = [0,0,0]
	if (bounce===undefined) bounce=.7
	this.damping = bounce
	this.name = nom
}

b3d.dBall = function (size, pos, ori, nom, bounce) {
	this.size = size								//	radius
	this.pos = pos
	this.ori = ori
	this.vel = [0,0,0]								// in meters/timestep
	if (bounce===undefined) bounce=.7
	this.damping = bounce
	this.name = nom
	
	/// check for collision with another ball. return false, or normal (vector pointing from this to b2)
	this.touchesBall = function(b2){
		debug("touchesBall dist2: "+b3d.dist2(this, b2),3)
		if (b3d.dist2(this, b2) > (this.size+b2.size)*(this.size+b2.size)) return false
		return true
	}
}

b3d.world = function (gravity, timestep, ground) {
	if(gravity===undefined) gravity = -9.8
	if(timestep===undefined) timestep = 0.01
	if(ground===undefined) ground = 0
    debug("Initializing b3d gravity="+gravity + " timestep=" + timestep + " ground=" + ground,0)
    this.gravity = gravity * timestep*timestep // in meters/timestep**2
    this.timestep = timestep
    this.ground = ground
    this.statics = []
    this.dynamics = []
	this.tick=0
	
	debug("normalize: "+b3d.normalize([1,2,3]))

	this.step = function(steps) {
		if (steps==undefined) steps = 1
		for(var i=0; i<steps; i++) {
			for(var j=0; j<this.dynamics.length; j++) {
				obj = this.dynamics[j]
				debug("stepping " + obj.name,6)
				obj.pos[0] += obj.vel[0]; obj.pos[1] += obj.vel[1]; obj.pos[2] += obj.vel[2]
				if (obj.pos[1] - obj.size < this.ground) {
					if (obj.vel[1] < 0) {
						obj.vel[1] = -obj.vel[1] * obj.damping
					}
				}
				else {
					obj.vel[1] += this.gravity
				}
//				console.log("tick,"+this.tick+",pos,"+obj.pos[1]+",vel,"+obj.vel[1]+",next,"+(obj.vel[1]+this.gravity))
			}
			this.tick++
		}
	}

	this.addSBox = function(size, pos, ori, nom, bounce) {
		if (nom===undefined) nom="box" + this.statics.length
		this.statics.push(new b3d.sBox(size, pos, ori, nom, bounce))
	}

	this.addDBall = function(size, pos, ori, nom, bounce) {
		if (nom===undefined) nom="ball" + this.statics.length
		this.dynamics.push(new b3d.dBall(size, pos, ori, nom, bounce)) 
	}

}
