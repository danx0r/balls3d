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
var V3 = V3 || {}

///	normalize a vector3 (as array); this is probably piss-slow -- use o3d?
V3.normalize = function(v){
	d2 = v[0] * v[0] + v[1] * v[1] + v[2] * v[2]
	di = 1.0 / Math.pow(d2, .5)
	return [v[0] * di, v[1] * di, v[2] * di]
}

/// add vector3 as array
V3.add = function(v1, v2){
	return [v1[0] + v2[0], v1[1] + v2[1], v1[2] + v2[2]]
}

/// average vector3 as array
V3.avg = function(v1, v2){
	return [(v1[0] + v2[0]) * .5, (v1[1] + v2[1]) * .5, (v1[2] + v2[2]) * .5]
}

/// subtract vector3 as array
V3.sub = function(v1, v2){
	return [v1[0] - v2[0], v1[1] - v2[1], v1[2] - v2[2]]
}

/// mul vector3 as array (2nd can be scalar)
V3.mul = function(v1, v2){
	if (v2.length == 3) 
		return [v1[0] * v2[0], v1[1] * v2[1], v1[2] * v2[2]]
	return [v1[0] * v2, v1[1] * v2, v1[2] * v2]
}

/// return distance squared
V3.dist2 = function(b1, b2) {
	var dx = b1[0]-b2[0]
	var dy = b1[1]-b2[1]
	var dz = b1[2]-b2[2]
	return dx*dx + dy*dy + dz*dz
}

V3.dist = function(v1, v2){
	return Math.pow(V3.dist2(v1, v2), .5)
}

V3.dot = function(v1, v2){
	return (v1[0] * v2[0] + v1[1] * v2[1] + v1[2] * v2[2])
}

V3.length = function(v){
	return Math.pow((v[0] * v[0] + v[1] * v[1] + v[2] * v[2]), .5)
}

/// cos of angle between 2 vectors (sw33t)
V3.cos = function(v1, v2){
	l1 = V3.length(v1)
	l2 = V3.length(v2)
	dot = V3.dot(v1, v2)
	cos = dot / (l1 * l2)
	return cos
}

b3d.sBox = function(size, pos, ori, nom, bounce){
	this.size = size
	this.pos = pos
	this.ori = ori
	this.vel = [0, 0, 0]
	if (bounce === undefined) 
		bounce = .7
	this.damping = bounce
	this.name = nom
}

b3d.dBall = function(size, pos, ori, nom, bounce){
	this.size = size //	radius
	this.pos = pos
	this.ori = ori
	this.vel = [0, 0, 0] // in meters/timestep
	if (bounce === undefined) 
		bounce = .7
	this.damping = bounce
	this.name = nom
	
	/// check for collision with another ball. return false, or normal (normalized vector pointing from this to b2)
	this.touchesBall = function(b2){
		debug("touchesBall dist2: " + V3.dist2(this.pos, b2.pos), 3)
		if (V3.dist2(this.pos, b2.pos) > (this.size + b2.size) * (this.size + b2.size)) 
			return false
		return V3.normalize(V3.sub(b2.pos, this.pos))
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
	
	this.step = function(steps) {
		if (steps==undefined) steps = 1
		for(var i=0; i<steps; i++) {
			for(var j=0; j<this.dynamics.length; j++) {
				obj = this.dynamics[j]
				debug("stepping " + obj.name,6)
				obj.pos[0] += obj.vel[0]; obj.pos[1] += obj.vel[1]; obj.pos[2] += obj.vel[2]
				
				/// check collision obj--ground
				if (obj.pos[1] - obj.size < this.ground) {
					if (obj.vel[1] < 0) {
						obj.vel[1] = -obj.vel[1] * obj.damping
					}
				}
				else {
					///	check against other dynamic objects
					collision = false
					for (var k=j+1; k<this.dynamics.length; k++) {
						b2 = this.dynamics[k]
						if (n = obj.touchesBall(b2)) {
							var v1, v2
							/// here comes that momentous exchange I've been blogging about
							v1 = obj.vel
							v2 = b2.vel
							va = V3.avg(v1, v2) // this is the mutual ref frame
							console.log("v1," + v1 + ",v2," + v2 + ",va," + va + ",norm," + n)
							
							v1 = V3.sub(v1, va) // v1 in mututal frame (yes subtract)
							v2 = V3.sub(v2, va) // v2 likewise
							c = V3.cos(v1, n) // cos of angle between our trajectory and normal
							d = V3.dist(v1, v2) // mutual velocity
							e = V3.mul(n, c * d) // yup -- e==exchange vector
							console.log("v1," + v1 + ",v2," + v2 +",c," + c + ",d," + d + ",e," + e)

							v1 = V3.sub(v1, e) // bounce off plane perp to normal
							v2 = V3.add(v2, e) // and vice versa
							console.log("v1," + v1 + ",v2," + v2)
							
							v1 = V3.add(v1, va) // revert to zero ref frame
							v2 = V3.add(v2, va) // ditto
							console.log("v1," + v1 + ",v2," + v2)
							obj.vel = v1
							b2.vel = v2
							console.log("-------")
							collision = true
							break
						}
					}
					///	if no collisions, do gravity (otherwise bad things!)
					if (collision==false) {
						obj.vel[1] += this.gravity
					}
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
