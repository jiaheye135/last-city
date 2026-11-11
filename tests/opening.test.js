'use strict';
const assert=require('node:assert/strict'),C=require('../engine.js');
let s=C.initial();assert.equal(s.opening.status,'pending');assert.equal(C.advance(s),false);assert(C.choose(s,0));assert(C.build(s,'solar',0,0));assert.equal(s.opening.status,'pending');assert.deepEqual(C.openingProgress(s),{decision:true,arrays:true,supply:true});assert(C.advance(s));assert.equal(s.day,2);assert.deepEqual(s.opening,{status:'restored',onTime:true});assert.equal(s.morale,73);let morale=s.morale;C.advance(s);assert.equal(s.morale,morale);
s=C.initial();C.choose(s,1);C.advance(s);assert.deepEqual(s.opening,{status:'missed',onTime:null});assert(C.build(s,'solar',0,0));assert.deepEqual(s.opening,{status:'restored',onTime:false});let after=s.morale;C.build(s,'solar',1,0);assert.equal(s.morale,after);
s=C.initial();s.resolved=[1];s.residents[28].alive=false;s.residents[29].alive=false;s.materials=1000;for(let i=0;i<7;i++)C.build(s,'beacon',i,0);C.build(s,'solar',0,1);assert.equal(C.openingProgress(s).arrays,false); // enough panels on the map, but understaffed.
s=C.initial();s.opening.onTime='yes';assert.throws(()=>C.validate(s));s=C.initial();delete s.opening;assert(C.validate(s));
console.log('PASS opening: on-time reward, dusk deadline, late recovery, one-time reward, staffing, legacy saves');
