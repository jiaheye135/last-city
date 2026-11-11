/* Page gestures are independent of game startup and the canvas camera. */
(function(){
'use strict';
const outsideMap=target=>!target?.closest?.('#map');
const options={passive:false,capture:true};
let touch=null,lastTap=null;
for(const name of ['gesturestart','gesturechange'])document.addEventListener(name,event=>event.preventDefault(),options);
document.addEventListener('touchstart',event=>{
 const first=event.touches[0];
 touch=first?{x:first.clientX,y:first.clientY,moved:false,multi:event.touches.length>1}:null;
 if(event.touches.length>1&&outsideMap(event.target))event.preventDefault();
},options);
document.addEventListener('touchmove',event=>{
 const first=event.touches[0];
 if(touch&&first&&Math.hypot(first.clientX-touch.x,first.clientY-touch.y)>10)touch.moved=true;
 if(touch&&event.touches.length>1)touch.multi=true;
 if(event.touches.length>1&&outsideMap(event.target))event.preventDefault();
},options);
document.addEventListener('touchend',event=>{
 if(!touch||touch.moved||touch.multi||event.touches.length||!outsideMap(event.target)){lastTap=null;return;}
 // Keep native activation of controls; prevent smart-zoom double taps on text.
 const now=event.timeStamp,interactive=event.target?.closest?.('button,input,select,textarea,a,label');
 if(!interactive&&lastTap&&now-lastTap.time<300&&Math.hypot(touch.x-lastTap.x,touch.y-lastTap.y)<24){event.preventDefault();lastTap=null;}
 else lastTap={time:now,x:touch.x,y:touch.y};
 touch=null;
},options);
document.addEventListener('touchcancel',()=>{touch=null;lastTap=null;},options);
// Bubble after the canvas's wheel listener so camera zoom continues to work.
document.addEventListener('wheel',event=>{if(event.ctrlKey||event.metaKey)event.preventDefault();},{passive:false});
document.addEventListener('keydown',event=>{if((event.ctrlKey||event.metaKey)&&['+','-','=','0','Add','Subtract'].includes(event.key))event.preventDefault();});
function prepareRecovery(){
 const viewport=window.visualViewport;if(!viewport)return;
 const button=document.createElement('button');button.id='restore-page-view';button.type='button';button.textContent='恢復正常顯示';button.hidden=true;button.title='重新開啟目前網址；已儲存的城市進度仍可讀取';document.body.append(button);
 button.addEventListener('click',()=>{const url=new URL(window.location.href);url.searchParams.set('view',Date.now().toString());window.location.replace(url.href);});
 const update=()=>{button.hidden=viewport.scale<=1.05;if(!button.hidden){button.style.left=(viewport.offsetLeft+12)+'px';button.style.top=(viewport.offsetTop+12)+'px';}};
 viewport.addEventListener('resize',update);viewport.addEventListener('scroll',update);window.addEventListener('pageshow',update);update();
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',prepareRecovery,{once:true});else prepareRecovery();
})();
