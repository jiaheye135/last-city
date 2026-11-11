'use strict';
const assert=require('node:assert/strict'),vm=require('node:vm'),fs=require('node:fs');
let mobile=false;const selection={rangeCount:0,removeAllRanges(){this.rangeCount=0;}};
const listeners=new Map(),document={readyState:'loading',activeElement:null,addEventListener(type,fn,options){let list=listeners.get(type)||[];list.push({fn,options});listeners.set(type,list);}};
vm.runInNewContext(fs.readFileSync(require.resolve('../page-controls.js'),'utf8'),{document,window:{addEventListener(type,fn,options){listeners.set('window:'+type,[{fn,options}]);},matchMedia:()=>({matches:mobile}),getSelection:()=>selection}});
function target(map=false,interactive=false,isEditable=false){return {closest(selector){if(selector==='#map')return map?this:null;return (selector.includes('button')?(interactive||isEditable):isEditable)?this:null;}};}
function send(type,props={}){let event={target:target(),touches:[],timeStamp:1000,prevented:false,preventDefault(){this.prevented=true;},...props};for(const listener of listeners.get(type))listener.fn(event);return event;}
const finger=(x=30,y=40)=>({clientX:x,clientY:y});
assert.equal(listeners.get('touchstart')[0].options.passive,false);
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
assert.equal(tap(3000,target(false,true)).prevented,false);assert.equal(tap(3350,target(false,true)).prevented,true);assert.equal(tap(3750,target(false,true)).prevented,true);
assert.equal(tap(5000,target(false,true,true)).prevented,false);assert.equal(tap(5200,target(false,true,true)).prevented,false);
assert.equal(send('window:gesturestart').prevented,true);assert.equal(send('gestureend').prevented,true);
assert.equal(tap(4000,target(true)).prevented,false);assert.equal(tap(4200,target(true)).prevented,false);
mobile=true;
for(const name of ['selectstart','contextmenu','dragstart','copy','cut','paste']){
 assert.equal(send(name).prevented,true,name+' should be blocked on mobile game text');
 assert.equal(send(name,{target:target(false,true,true)}).prevented,false,name+' should remain available in form fields');
}
assert.equal(send('keydown',{ctrlKey:true,key:'a'}).prevented,true);
assert.equal(send('keydown',{metaKey:true,key:'C',target:target(false,true,true)}).prevented,false);
selection.rangeCount=1;send('selectionchange');assert.equal(selection.rangeCount,0);
document.activeElement=target(false,true,true);selection.rangeCount=1;send('selectionchange');assert.equal(selection.rangeCount,1);document.activeElement=null;
mobile=false;assert.equal(send('contextmenu').prevented,false);assert.equal(send('keydown',{ctrlKey:true,key:'a'}).prevented,false);
console.log('PASS page controls: independent startup, page pinch blocked, map gestures preserved, scrolling, taps and shortcuts');
