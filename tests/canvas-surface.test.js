'use strict';
const assert=require('node:assert/strict'),Surface=require('../canvas-surface');
let box={width:353,height:438.875},w=300,h=150,writes=0,paints=0,transforms=0;
const canvas={dataset:{},get width(){return w;},set width(v){w=v;writes++;},get height(){return h;},set height(v){h=v;writes++;},getBoundingClientRect(){return box;}};
const surface=Surface.create(canvas,{setTransform(){transforms++;}},size=>{assert.equal(w,Math.round(size.width*size.ratio));assert.equal(h,Math.round(size.height*size.ratio));paints++;});
assert.equal(surface.resize(2),true);assert.equal(w,706);assert.equal(h,878);assert.equal(paints,1);
// iOS toolbars can report many window resizes with the map's actual box unchanged.
for(let i=0;i<100;i++)assert.equal(surface.resize(2),false);
assert.equal(writes,2);assert.equal(paints,1);assert.equal(transforms,1);
box={width:353.01,height:438.88};assert.equal(surface.resize(2),false);assert.equal(writes,2);
// Rotation really changes the surface; it must be resized and painted immediately.
box={width:740,height:340};assert.equal(surface.resize(2),true);assert.equal(w,1480);assert.equal(h,680);assert.equal(paints,2);
assert.equal(surface.resize(1),true);assert.equal(w,740);assert.equal(paints,3);
box={width:0,height:0};assert.equal(surface.resize(1),false);assert.equal(paints,3);
box={width:740,height:340};assert.equal(surface.resize(1),false);
console.log('PASS canvas surface: toolbar resize storms keep bitmap, real resize repaints, rotation, pixel ratio and hidden surfaces');
