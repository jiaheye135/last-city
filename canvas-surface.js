/* Keep the current bitmap during browser-chrome resize notifications. */
(function(root){
'use strict';
function create(canvas,context,onResize){
 let last=null,revision=0;
 function resize(pixelRatio=1){
  const rect=canvas.getBoundingClientRect(),width=rect.width,height=rect.height;
  if(!Number.isFinite(width)||!Number.isFinite(height)||width<=0||height<=0)return false;
  const ratio=Number.isFinite(pixelRatio)&&pixelRatio>0?pixelRatio:1;
  const bitmapWidth=Math.max(1,Math.round(width*ratio)),bitmapHeight=Math.max(1,Math.round(height*ratio));
  if(last&&canvas.width===bitmapWidth&&canvas.height===bitmapHeight&&last.ratio===ratio&&Math.abs(last.width-width)<.5&&Math.abs(last.height-height)<.5)return false;
  // Assigning even the same canvas.width clears its bitmap. Never do that on scroll.
  if(canvas.width!==bitmapWidth)canvas.width=bitmapWidth;
  if(canvas.height!==bitmapHeight)canvas.height=bitmapHeight;
  context.setTransform(ratio,0,0,ratio,0,0);
  last={width,height,ratio};revision++;
  if(canvas.dataset)canvas.dataset.surfaceRevision=String(revision);
  onResize(last); // Repaint synchronously, before the browser can show a blank frame.
  return true;
 }
 return {resize};
}
const api={create};if(typeof module!=='undefined')module.exports=api;else root.CitySurface=api;
})(globalThis);
