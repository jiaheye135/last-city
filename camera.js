/* Original map camera math; no external dependencies. */
(function(root){
'use strict';
function create(){return {zoom:1,x:0,y:0};}
function layout(c,w,h){let base=Math.min(w/640,h/450),scale=base*c.zoom;return {scale,ox:w/2+c.x,oy:h/2-115*scale+c.y};}
function clamp(c,w,h){c.x=Math.max(-w*.8,Math.min(w*.8,c.x));c.y=Math.max(-h*.8,Math.min(h*.8,c.y));return c;}
function zoomAt(c,factor,px,py,w,h){let a=layout(c,w,h),z=Math.max(1,Math.min(3,c.zoom*factor)),ratio=z/c.zoom;c.zoom=z;let b=layout(c,w,h);c.x+=(px-a.ox)* (1-ratio)+a.ox-b.ox;c.y+=(py-a.oy)*(1-ratio)+a.oy-b.oy;return clamp(c,w,h);}
function pan(c,dx,dy,w,h){c.x+=dx;c.y+=dy;return clamp(c,w,h);}
const api={create,layout,zoomAt,pan};if(typeof module!=='undefined')module.exports=api;else root.CityCamera=api;
})(globalThis);
