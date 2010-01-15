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

b3d.sBox = function (size, pos, ori, nom) {
	this.size = size
	this.pos = pos
	this.ori = ori
	this.lmo = [0,0,0]
	this.damping = .9
	this.name = nom
}

b3d.dBall = function (size, pos, ori, nom) {
	this.size = size
	this.pos = pos
	this.ori = ori
	this.lmo = [0,0,0]
	this.damping = .9
	this.name = nom
}

b3d.world = function (gravity, timestep, ground) {
	if(gravity===undefined) gravity = -9.8
	if(timestep===undefined) timestep = 0.01
	if(ground===undefined) ground = 0
    debug("Initializing b3d gravity="+gravity + " timestep=" + timestep + " ground=" + ground,0)
    this.gravity = gravity
    this.timestep = timestep
    this.ground = ground
    this.statics = []
    this.dynamics = []

	this.step = function(steps) {
		if (steps==undefined) steps = 1
		for(var i=0; i<steps; i++) {
			for(var j=0; j<this.dynamics.length; j++) {
				obj = this.dynamics[j]
				debug("stepping " + obj.name,6)
				obj.pos[0] += obj.lmo[0]; obj.pos[1] += obj.lmo[1]; obj.pos[2] += obj.lmo[2]
				obj.lmo[1] += this.gravity * this.timestep
				if (obj.pos[1]-obj.size < this.ground) {
					obj.lmo[1] = -obj.lmo[1] * obj.damping
				}
			}
		}
	}

	this.addSBox = function(size, pos, ori, nom) {
		if (nom===undefined) nom="box" + this.statics.length
		this.statics.push(b3d.sBox(size, pos, ori, nom)) 
	}

	this.addDBall = function(size, pos, ori, nom) {
		if (nom===undefined) nom="ball" + this.statics.length
		this.dynamics.push(new b3d.dBall(size, pos, ori, nom)) 
	}

}
