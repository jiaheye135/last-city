/* All scenery, buildings and people below are newly authored procedural artwork. */
(function(root){
'use strict';
function renderer(ctx){
 let scale=1,ox=0,oy=0,time=0,night=0,power=0;
 const point=(x,y,z=0)=>[ox+(x-y)*30*scale,oy+(x+y)*15*scale-z*scale];
 const noise=(a,b=0)=>{let n=Math.sin(a*127.1+b*311.7)*43758.5453;return n-Math.floor(n);};
 function poly(p,fill,stroke,width=1){ctx.beginPath();p.forEach((v,i)=>i?ctx.lineTo(...v):ctx.moveTo(...v));ctx.closePath();if(fill){ctx.fillStyle=fill;ctx.fill();}if(stroke){ctx.strokeStyle=stroke;ctx.lineWidth=width*scale;ctx.stroke();}}
 function path(p,color,width=1){ctx.beginPath();p.forEach((v,i)=>i?ctx.lineTo(...v):ctx.moveTo(...v));ctx.strokeStyle=color;ctx.lineWidth=width*scale;ctx.lineCap='round';ctx.lineJoin='round';ctx.stroke();}
 function ellipse(p,rx,ry,color){ctx.fillStyle=color;ctx.beginPath();ctx.ellipse(p[0],p[1],rx*scale,ry*scale,0,0,Math.PI*2);ctx.fill();}
 function face(points,color){poly(points.map(v=>point(...v)),color);}
 function box(x,y,w,d,h,roof,left='#837d6c',right='#556469',z=0){let a=[x-w/2,y-d/2],b=[x+w/2,y-d/2],c=[x+w/2,y+d/2],d1=[x-w/2,y+d/2];poly([point(...b,z),point(...c,z),point(...c,z+h),point(...b,z+h)],right);poly([point(...c,z),point(...d1,z),point(...d1,z+h),point(...c,z+h)],left);poly([point(...a,z+h),point(...b,z+h),point(...c,z+h),point(...d1,z+h)],roof,'#eff2cb18',.5);}
 function tree(x,y,size=1,dry=false){let p=point(x,y);ellipse([p[0]+5*scale,p[1]+2*scale],8*size,3*size,'#061b2340');path([point(x,y,0),point(x,y,27*size)],'#6e6654',2.5*size);path([point(x,y,15*size),point(x-.12*size,y,23*size)],'#6e6654',1);if(!dry){ellipse(point(x,y,26*size),11*size,13*size,'#344c41');ellipse(point(x-.06,y,31*size),9*size,11*size,'#4c6b51');ellipse(point(x-.15,y-.06,34*size),6*size,7*size,night>.5?'#526c58':'#719064');}}
 function lamp(x,y,lit=1){let p=point(x,y,25);path([point(x,y),p],'#8c8874',1.3);if(lit>0){glow(p,19,'#ffc67c',.3*lit);ellipse(p,2,3,'#ffe2a3');}else ellipse(p,2,3,'#6d7168');}
 function glow(p,size,color,alpha=1){ctx.save();ctx.globalAlpha=alpha;let g=ctx.createRadialGradient(...p,0,...p,size*scale);g.addColorStop(0,color+'aa');g.addColorStop(.25,color+'38');g.addColorStop(1,color+'00');ctx.fillStyle=g;ctx.fillRect(p[0]-size*scale,p[1]-size*scale,size*scale*2,size*scale*2);ctx.restore();}
 function windowPanel(x,y,z,lit,side='front'){let p=side==='front'?[[x-.06,y,z],[x+.06,y,z],[x+.06,y,z+7],[x-.06,y,z+7]]:[[x,y-.065,z],[x,y+.065,z],[x,y+.065,z+7],[x,y-.065,z+7]];poly(p.map(v=>point(...v)),lit?'#ffd697':'#35494f','#414d49',.8);if(lit){glow(point(x,y,z+3),14,'#ffbc69',.32);path([point(x,y,z),point(x,y,z+7)],'#c59157',.5);}}
 function home(b,lit){let {x,y}=b;box(x,y,.82,.72,2,'#80765e','#575c52','#3b4947');box(x,y,.68,.6,26,'#b9ae88','#ad9b7a','#6c7971',2);
 // A pitched roof with a ridge, overhanging eaves and standing seams.
 let p1=[x-.4,y-.35,29],p2=[x+.4,y-.35,29],p3=[x+.4,y+.35,29],p4=[x-.4,y+.35,29],r1=[x-.4,y,42],r2=[x+.4,y,42];
 poly([p1,p2,r2,r1].map(v=>point(...v)),'#7f8d82');poly([r1,r2,p3,p4].map(v=>point(...v)),b.x%2?'#576b68':'#637e77');for(let i=-.3;i<.4;i+=.14)path([point(x+i,y,42),point(x+i,y+.35,29)],'#a4ae9138',.6);
 box(x-.18,y-.08,.12,.13,15,'#aaa58b','#78847c','#505e5a',29);windowPanel(x-.16,y+.306,13,lit);windowPanel(x+.16,y+.306,13,lit);windowPanel(x+.345,y-.12,13,lit,'side');
 face([[x-.06,y+.311,2],[x+.06,y+.311,2],[x+.06,y+.311,14],[x-.06,y+.311,14]],'#4b554e');box(x,y+.39,.22,.13,3,'#beb18a','#7f7c60','#6a705d');box(x-.28,y+.4,.13,.12,4,'#66784f','#6c694a','#48594a');ellipse(point(x-.28,y+.4,8),3,4,'#95a269');if(lit)glow(point(x,y+.5,1),25,'#e8ae62',.25);
 }
 function greenhouse(b,lit){let{x,y}=b;box(x,y,.88,.78,5,'#9c9e76','#5d7564','#465e58');for(let j=0;j<4;j++){box(x-.28+j*.18,y,.1,.62,1,'#4e654b','#3c5341','#3c5341',6);for(let k=0;k<3;k++)ellipse(point(x-.28+j*.18,y-.2+k*.2,10),2.5,4,'#80a578');}
 let a=[x-.44,y-.39,7],bb=[x+.44,y-.39,7],c=[x+.44,y+.39,7],d=[x-.44,y+.39,7],rr1=[x-.44,y,30],rr2=[x+.44,y,30];
 ctx.save();ctx.globalAlpha=.66;poly([rr1,rr2,c,d].map(v=>point(...v)),'#89b6ae');poly([a,bb,rr2,rr1].map(v=>point(...v)),'#c1d6bf');ctx.restore();for(let v of[-.44,-.22,0,.22,.44])path([point(x+v,y-.39,7),point(x+v,y,30),point(x+v,y+.39,7)],'#ced1ae',1.1);path([point(...d),point(...c)],'#d1cfaa',1.2);path([point(...rr1),point(...rr2)],'#e3dbb0',1.2);box(x+.45,y+.22,.12,.17,14,'#8eaea8','#668e89','#416968');if(lit)glow(point(x,y,12),30,'#c5dc8a',.23);
 }
 function solar(b,lit){let{x,y}=b;box(x,y,.8,.8,3,'#728b7e','#485e59','#354e51');for(let j=0;j<3;j++){let xx=x-.27+j*.27;path([point(xx,y,3),point(xx,y,18)],'#a9aaa0',1.5);let p=[[xx-.11,y-.35,25],[xx+.11,y-.35,25],[xx+.11,y+.35,13],[xx-.11,y+.35,13]];poly(p.map(v=>point(...v)),'#386d83','#a0b6ad',1);for(let k=0;k<4;k++){let yy=y-.3+k*.17,zz=25-(yy-(y-.35))/.7*12;path([point(xx-.1,yy,zz),point(xx+.1,yy,zz)],'#77abc0',.5);}path([point(xx,y-.35,25),point(xx,y+.35,13)],'#8cb5c3',.4);}box(x+.35,y+.25,.14,.16,12,'#a3ad92','#68877f','#477178');ellipse(point(x+.43,y+.29,9),1.5,1.5,lit?'#e6db9b':'#86a28c');}
 function smoke(x,y,z){for(let i=0;i<5;i++){let t=(time*.18+i*.23)%1;ellipse(point(x+Math.sin(t*5)*t*.22,y,z+t*30),2+t*5,2+t*4,`rgba(196,197,174,${(1-t)*.16})`);}}
 function workshop(b,lit){let{x,y}=b;box(x,y,.85,.75,24,'#997b5e','#8d7a60','#5d6863');for(let j=0;j<3;j++){let xx=x-.27+j*.27;face([[xx-.14,y-.42,25],[xx+.14,y-.42,25],[xx+.14,y+.42,30],[xx-.14,y+.42,30]],'#a38b68');path([point(xx-.14,y-.42,25),point(xx-.14,y+.42,30)],'#d2b98b',.7);}box(x+.24,y-.23,.13,.13,27,'#9c9b84','#727f74','#556c65',25);if(lit)smoke(x+.24,y-.23,53);windowPanel(x-.18,y+.38,12,lit);windowPanel(x+.05,y+.38,12,lit);box(x-.38,y+.5,.2,.17,8,'#b29b6a','#877754','#5e6551');box(x-.12,y+.52,.17,.15,5,'#a38e60','#877754','#5e6551');box(x+.46,y+.15,.12,.28,9,'#8c9c88','#6c8072','#415f58');}
 function clinic(b,lit){let{x,y}=b;box(x,y,.76,.7,29,'#c6c2a1','#b6b697','#7f9787');box(x,y,.87,.8,4,'#789f8c','#6d8d7d','#4c746b',29);poly([point(x-.4,y+.36,23),point(x+.4,y+.36,23),point(x+.4,y+.57,17),point(x-.4,y+.57,17)],'#70978a');windowPanel(x-.23,y+.36,10,lit);windowPanel(x+.22,y+.36,10,lit);let p=point(x,y,35);ctx.fillStyle='#f4e4ba';ctx.fillRect(p[0]-7*scale,p[1]-2*scale,14*scale,4*scale);ctx.fillRect(p[0]-2*scale,p[1]-6*scale,4*scale,12*scale);lamp(x-.5,y+.5,lit?1:.1);}
 function garden(b,lit){let{x,y}=b;box(x,y,.9,.9,2,'#7a8b67','#5e7759','#48654f');tree(x,y,1.25);for(let j of[-1,1]){box(x+j*.3,y+.3,.27,.12,6,'#b19a70','#8b785c','#6e6a54');box(x+j*.3,y+.35,.27,.03,7,'#bca77c','#8b785c','#6e6a54',3);}lamp(x+.4,y-.3,lit?1:.15);for(let j=0;j<5;j++)ellipse(point(x-.3+j*.14,y-.3,3),1.8,2.4,j%2?'#d8b27c':'#b4c17c');}
 function kitchen(b,lit){let{x,y}=b;box(x,y,.8,.7,24,'#c1aa7e','#b3996d','#7f856c');box(x-.2,y-.1,.15,.15,24,'#c4bd9c','#8d9c87','#687e71',24);if(lit)smoke(x-.2,y-.1,48);poly([[x-.45,y+.36,25],[x+.45,y+.36,25],[x+.45,y+.66,17],[x-.45,y+.66,17]].map(v=>point(...v)),'#c08c59');for(let j=0;j<3;j++){let xx=x-.32+j*.3;path([point(xx,y+.37,25),point(xx,y+.66,17)],'#e3c28d',2);}box(x,y+.48,.6,.19,8,'#cfb784','#8c8866','#6e7d64');windowPanel(x+.41,y-.12,12,lit,'side');if(lit)glow(point(x,y+.4,13),25,'#ffcb7e',.35);}
 function beacon(b,lit){let{x,y}=b;box(x,y,.7,.7,17,'#afaaa1','#929e91','#627e7c');for(let j of[-1,1])path([point(x+j*.2,y,16),point(x+j*.06,y,67)],'#b6bbb1',1.8);for(let z=22;z<65;z+=9)path([point(x-.17,y,z),point(x+.17,y,z+8),point(x-.17,y,z+8)],'#81978f',.8);let p=point(x,y,68);ellipse(p,3,3,lit?'#f3c08a':'#a2ada0');if(lit){glow(p,25,'#f4bd7b',.5);ctx.strokeStyle='#b3dbcf55';ctx.lineWidth=scale;ctx.beginPath();ctx.ellipse(...p,(10+time*6%22)*scale,(5+time*3%11)*scale,0,Math.PI,Math.PI*2);ctx.stroke();}windowPanel(x,y+.36,7,lit);}
 const makers={home, farm:greenhouse,solar,salvage:workshop,clinic,square:garden,kitchen,beacon};
 function building(b,lit,active=true){ellipse(point(b.x+.15,b.y+.16),23,10,'#0a242c42');makers[b.type](b,active&&lit);if(!active){let p=point(b.x,b.y,48);ctx.font=`${11*scale}px system-ui`;ctx.fillStyle='#efbd8c';ctx.fillText('Ⅱ',...p);}}
 function ruin(x,y,seed){box(x,y,.6,.5,3,'#72796a','#535e55','#374f4d');let h=10+seed*17;face([[x-.3,y-.25,2],[x-.3,y+.25,2],[x-.3,y+.25,h],[x-.3,y+.08,h-6],[x-.3,y-.25,h+4]],'#798372');face([[x-.3,y+.25,2],[x+.2,y+.25,2],[x+.2,y+.25,h*.5],[x+.05,y+.25,h*.65],[x-.3,y+.25,h]],'#586f60');for(let i=0;i<3;i++)box(x+noise(i,seed)*.5-.2,y+noise(i+5,seed)*.5-.2,.1,.09,3,'#b2ac8b','#6d7866','#536d5e');tree(x+.2,y-.1,.35);}
 function scenery(w,h){
 let bg=ctx.createLinearGradient(0,0,0,h);bg.addColorStop(0,night>.5?'#142d41':'#9d8e78');bg.addColorStop(.32,night>.5?'#25444f':'#697f79');bg.addColorStop(1,'#142e36');ctx.fillStyle=bg;ctx.fillRect(0,0,w,h);
 // Original layered ridges and the remains of an old viaduct.
 for(let layer=0;layer<3;layer++){let p=[[0,h*.5]];for(let i=0;i<=12;i++)p.push([i*w/12,h*(.18+layer*.085)-noise(i,layer)*h*.11]);p.push([w,h],[0,h]);poly(p,night>.5?['#29454e','#294b50','#284d4f'][layer]:['#70867e','#597a72','#3a6260'][layer]);}
 ctx.save();ctx.globalAlpha=night>.5?.25:.3;let bridge=h*.28;path([[0,bridge],[w*.26,bridge-18],[w*.37,bridge-15]],'#c5bca0',7);path([[w*.47,bridge-7],[w*.72,bridge+10],[w,bridge+2]],'#c5bca0',7);for(let i=0;i<7;i++){let xx=i*w/6;path([[xx,bridge+5],[xx-8,h*.61]],'#a4aa93',5);}ctx.restore();
 if(night>.3){for(let i=0;i<45;i++){let x=noise(i,3)*w,y=noise(i,8)*h*.33;ctx.fillStyle=`rgba(240,224,181,${.12+noise(i)*.4})`;ctx.fillRect(x,y,i%5===0?2:1,1);}let moon=[w*.82,h*.12];ctx.fillStyle='#e1d5b4';ctx.beginPath();ctx.arc(...moon,10,0,Math.PI*2);ctx.fill();ctx.fillStyle='#193442';ctx.beginPath();ctx.arc(moon[0]+4,moon[1]-3,9,0,Math.PI*2);ctx.fill();}
 else{let sun=ctx.createRadialGradient(w*.77,h*.13,1,w*.77,h*.13,w*.4);sun.addColorStop(0,'#f9c28870');sun.addColorStop(1,'#edbf8c00');ctx.fillStyle=sun;ctx.fillRect(0,0,w,h);}
 let edge=[[-1.1,-1],[3,-1.6],[7,-.9],[9.2,.3],[9.6,4.8],[9,8.3],[6.6,9.5],[2.8,9.3],[-.9,8.5],[-1.6,5],[-1.4,1.4]];let top=edge.map(v=>point(...v));poly(top.map(p=>[p[0],p[1]+27*scale]),'#183a3d');for(let i=0;i<top.length;i++){let j=(i+1)%top.length;poly([top[i],top[j],[top[j][0],top[j][1]+27*scale],[top[i][0],top[i][1]+27*scale]],i%2?'#34564e':'#3e5d50');path([[top[i][0],top[i][1]+14*scale],[top[j][0],top[j][1]+18*scale]],'#81907430',1.5);}poly(top,night>.5?'#405c4e':'#61775a','#80947280',1);
 for(let i=0;i<125;i++){let x=noise(i,8)*10-1,y=noise(i,9)*10-1;let p=point(x,y);ellipse(p,3+noise(i)*8,1.5+noise(i)*3,night>.5?'#71916a13':'#a0a87720');}
 }
 function ground(state,focus,selected){let has=(x,y)=>state.buildings.some(b=>b.x===x&&b.y===y);for(let x=0;x<9;x++)for(let y=0;y<9;y++){
 let corners=[[x,y-.48],[x+.48,y],[x,y+.48],[x-.48,y]]; // quiet broken pavers, with construction grid only while building.
 if(selected)poly([point(x-.5,y-.5),point(x+.5,y-.5),point(x+.5,y+.5),point(x-.5,y+.5)],'#a6c19e06','#bfccb52b',.6);
 if(x===4||y===4||y===3&&x>=2&&x<=6)poly([point(x-.48,y-.2),point(x+.48,y-.2),point(x+.48,y+.2),point(x-.48,y+.2)],'#b9b18c38');
 if(!has(x,y)&&noise(x,y)>.77&&!(x===4||y===4))ruin(x,y,noise(y,x));else if(!has(x,y)&&noise(x+15,y)>.76)tree(x-.15,y+.1,.35+noise(y,x)*.25);
 if(focus&&focus.x===x&&focus.y===y){let p=[point(x-.5,y-.5),point(x+.5,y-.5),point(x+.5,y+.5),point(x-.5,y+.5)];poly(p,has(x,y)?'#d9806355':'#a9dcad55',has(x,y)?'#f0aa8d':'#e5f1b9',1.5);}
 }
 // Walkway edging and small lights connect the residential row.
 path([point(2.4,3.7,1),point(6.4,3.7,1)],'#d6c69a70',.7);for(let x of[2,4,6])lamp(x,3.8,power);
 for(let i=0;i<16;i++){let v=i/2;tree(-.7,v,.4+noise(i)*.7,i%6===0);if(i%2===0)tree(v,8.8,.45+noise(i+10)*.55);}
 // Water cistern and laundry are scenery, never paid production buildings.
 box(7.8,1.3,.32,.4,12,'#afb09a','#7e9586','#567a73');path([point(3,2.5,25),point(5,2.5,25)],'#d2c5a3',.6);for(let j=0;j<4;j++){let x=3.25+j*.4;face([[x,2.5,24],[x+.18,2.5,24],[x+.18,2.5,17],[x,2.5,17]],['#d4ba8c','#809d8a','#c5c5a0','#ad866a'][j]);}
 }
 function citizen(person,i,buildings,now,assigned){
 const home=buildings.filter(b=>b.type==='home')[i%Math.max(1,buildings.filter(b=>b.type==='home').length)]||{x:4,y:3};
 const job=assigned||home;
 let t=assigned?(now*.045+i*.147)%1:.5,travel=t<.32||t>.74,progress=t<.32?t/.32:t>.74?1-(t-.74)/.26:1;
 // Two connected legs rather than a floating loop: home → lane → workplace.
 let x,y;if(progress<.5){x=home.x+(job.x-home.x)*progress*2;y=home.y+.47;}else{x=job.x;y=home.y+.47+(job.y+.48-home.y-.47)*(progress-.5)*2;}
 if(!travel){x+=((i%3)-1)*.11;y+=(Math.floor(i/3)%2)*.12;}
 const p=point(x,y,1),s=Math.max(.8,scale),bob=travel?Math.sin(now*9+i)*.8:0;
 ellipse(p,2,1,'#0a202a55');ctx.fillStyle=['#cfaa78','#95afa2','#d1c2a0','#8ca9ae'][i%4];ctx.fillRect(p[0]-1.7*s,p[1]-7*s+bob,3.4*s,5*s);ctx.fillStyle='#e2c3a0';ctx.beginPath();ctx.arc(p[0],p[1]-8.5*s+bob,1.7*s,0,7);ctx.fill();path([[p[0]-s,p[1]-2*s],[p[0]-s-(travel?Math.sin(now*9+i)*s:0),p[1]]],'#283b3c',.9);path([[p[0]+s,p[1]-2*s],[p[0]+s+(travel?Math.sin(now*9+i)*s:0),p[1]]],'#283b3c',.9);
 if(!travel&&job.type==='salvage'&&i%3===0){let swing=Math.sin(now*5+i)*2;path([[p[0]+s,p[1]-5*s],[p[0]+(4+swing)*s,p[1]-7*s]],'#d2b57f',1);}
 if(travel&&i%4===0){ctx.fillStyle='#b49769';ctx.fillRect(p[0]+s,p[1]-5*s,4*s,3*s);}
 return {p,name:person.name,job:job.type};
 }
 function draw(opts){let{state,w,h,scale:s,ox:x,oy:y,time:t,focus,selected,transition=1,speakerIndex=0}=opts;scale=s;ox=x;oy=y;time=t;let restored=state.opening?state.opening.status==='restored':state.energy>0;night=restored&&(state.day<=3||state.day%3===0)?1:0;power=state.energy>0&&restored?transition:0;scenery(w,h);ground(state,focus,selected);
 let active=City.staffing(state),entities=[],assignments=active.filter(b=>b.active).flatMap(b=>Array(City.TYPES.find(t=>t.id===b.type).workers).fill(b));active.forEach((b,i)=>entities.push({depth:b.x+b.y,draw:()=>{let born=opts.buildBirths?.get(b.x+','+b.y),age=born===undefined?10:t-born,p=point(b.x,b.y);if(age>=0&&age<1){let ease=1-Math.pow(1-age,3);ctx.save();ctx.translate(...p);ctx.scale(.6+.4*ease,.6+.4*ease);ctx.translate(-p[0],-p[1]);building(b,power>Math.min(.9,i*.075),b.active);ctx.restore();}else building(b,power>Math.min(.9,i*.075),b.active);if(age>=0&&age<2){ctx.save();ctx.globalAlpha=1-age/2;ctx.strokeStyle='#ead6a3';ctx.lineWidth=1.5*scale;ctx.beginPath();ctx.ellipse(...p,(24+age*10)*scale,(12+age*5)*scale,0,0,Math.PI*2);ctx.stroke();ctx.restore();}}}));let people=state.residents.filter(r=>r.alive),locations=[];
 people.forEach((p,i)=>{let job=assignments[i]||state.buildings.find(b=>b.type==='home')||{x:4,y:4};entities.push({depth:job.x+job.y+.5,draw:()=>{locations[i]=citizen(p,i,state.buildings,t,assignments[i]);}});});entities.sort((a,b)=>a.depth-b.depth).forEach(e=>e.draw());
 if(night){ctx.fillStyle='rgba(3,20,38,.28)';ctx.fillRect(0,0,w,h);active.filter(b=>b.type==='home'&&b.active).forEach((b,i)=>{if(power<=i*.075)return;windowPanel(b.x-.16,b.y+.306,13,true);windowPanel(b.x+.16,b.y+.306,13,true);windowPanel(b.x+.345,b.y-.12,13,true,'side');glow(point(b.x,b.y+.38,9),42,'#ffc77b',.5*power);glow(point(b.x,b.y+.65,0),27,'#ffc77b',.3*power);});for(let x of[2,4,6])lamp(x,3.8,power);}
 for(let i=0;i<9;i++){let p=point(2+noise(i)*5,2+noise(i+30)*5,8+Math.sin(t*.6+i)*7);glow(p,4,'#dfdb97',(.2+Math.sin(t+i)*.15)*power);}
 if(focus){let b=state.buildings.find(b=>b.x===focus.x&&b.y===focus.y),p=point(focus.x,focus.y,64),label=b?City.TYPES.find(t=>t.id===b.type).name:`空地 ${focus.x+1}, ${focus.y+1}`;ctx.font='12px system-ui';let width=ctx.measureText(label).width+20;ctx.fillStyle='#132e37ed';ctx.fillRect(p[0]-width/2,p[1]-18,width,26);ctx.fillStyle='#f6dfad';ctx.textAlign='center';ctx.fillText(label,p[0],p[1]);ctx.textAlign='start';}
 // One named speech beat is visible periodically, tied to an actual resident marker.
 if(!selected&&locations[speakerIndex%people.length]&&Math.floor(t/8)%2===0){let loc=locations[speakerIndex%people.length],p=loc.p;ctx.font='11px system-ui';let label=power?'燈亮了。':'天快黑了…',ww=ctx.measureText(label).width+14;ctx.fillStyle='#e8d9b9';ctx.fillRect(p[0]-ww/2,p[1]-38,ww,20);poly([[p[0]-3,p[1]-18],[p[0]+3,p[1]-18],[p[0],p[1]-13]],'#e8d9b9');ctx.fillStyle='#30423d';ctx.textAlign='center';ctx.fillText(label,p[0],p[1]-24);ctx.textAlign='start';}
 // A quiet corner stamp anchors the scene, rather than a visible board-game platform.
 ctx.font='10px system-ui';ctx.letterSpacing='2px';ctx.fillStyle='#e1dbc18a';ctx.fillText(restored?'高地 / 有光的地方':'高地 / 廢墟之上的新家',20,h-18);ctx.letterSpacing='0px';
 }
 return {draw};
}
root.CityArt={renderer};
})(globalThis);
