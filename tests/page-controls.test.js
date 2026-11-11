'use strict';
const assert=require('node:assert/strict'),vm=require('node:vm'),fs=require('node:fs');
const listeners=new Map(),document={readyState:'loading',addEventListener(type,fn,options){listeners.set(type,{fn,options});}};
vm.runInNewContext(fs.readFileSync(require.resolve('../page-controls.js'),'utf8'),{document,window:{}});
function target(map=false,interactive=false){return {closest(selector){return selector==='#map'?(map?this:null):(interactive?this:null);}};}
function send(type,props={}){let event={target:target(),touches:[],timeStamp:1000,prevented:false,preventDefault(){this.prevented=true;},...props};listeners.get(type).fn(event);return event;}
const finger=(x=30,y=40)=>({clientX:x,clientY:y});
assert.equal(listeners.get('touchstart').options.passive,false);
assert.equal(send('touchstart',{touches:[finger(),finger(60,70)]}).prevented,true);
assert.equal(send('touchmove',{touches:[finger(),finger(65,75)],target:target(true)}).prevented,false);
assert.equal(send('gesturestart').prevented,true);
assert.equal(send('wheel',{ctrlKey:true,target:target(true)}).prevented,true);
assert.equal(send('wheel').prevented,false);
assert.equal(send('keydown',{ctrlKey:true,key:'+'}).prevented,true);
assert.equal(send('keydown',{key:'ArrowDown'}).prevented,false);
send('touchstart',{touches:[finger()]});assert.equal(send('touchmove',{touches:[finger(30,100)]}).prevented,false);assert.equal(send('touchend').prevented,false);
function tap(time,element=target()){send('touchstart',{touches:[finger()],target:element});return send('touchend',{timeStamp:time,target:element});}
assert.equal(tap(2000).prevented,false);assert.equal(tap(2200).prevented,true);
assert.equal(tap(3000,target(false,true)).prevented,false);assert.equal(tap(3200,target(false,true)).prevented,false);
assert.equal(tap(4000,target(true)).prevented,false);assert.equal(tap(4200,target(true)).prevented,false);
console.log('PASS page controls: independent startup, page pinch blocked, map gestures preserved, scrolling, taps and shortcuts');
