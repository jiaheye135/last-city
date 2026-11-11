'use strict';
const $=id=>document.getElementById(id),C=City;let state=C.initial(),selected=null,timer=null,hover=null,frame=0,tutorial=null,touchCell=null;
const canvas=$('map'),ctx=canvas.getContext('2d');let W=800,H=460,scale=1,ox=400,oy=90;
const camera=CityCamera.create(),pointers=new Map(),art=CityArt.renderer(ctx),buildBirths=new Map();let gesture=null,speakerIndex=0,celebratedAt=-Infinity,lastDraw=0,residentNote=null,resumeTutorial=false;
function notice(text){$('toast').textContent=text;$('toast').style.display='block';clearTimeout(notice.t);notice.t=setTimeout(()=>$('toast').style.display='none',3000);}
function pause(){clearInterval(timer);timer=null;$('play').textContent='▶ 自動推進';}
function save(silent=false){try{localStorage.setItem('last-city-v1',JSON.stringify(state));if(!silent)notice('城市已存檔');}catch(e){notice('瀏覽器無法儲存，請使用匯出備份');}}
function render(){let r=C.rates(state),p=C.population(state);$('resources').replaceChildren();for(let [k,label,value,delta] of [['food','食物',state.food,r.food],['energy','能源',state.energy,r.energy],['materials','材料',state.materials,r.materials],['morale','士氣',state.morale,r.morale],['health','健康',state.health,null],['population','居民',p,null]]){let el=document.createElement('div');el.className='resource';el.id='resource-'+k;el.innerHTML=`<span>${label}</span><b>${Math.round(value)}${k==='morale'||k==='health'?'<small> / 100</small>':''}</b><small class="${delta<0?'negative':'positive'}">${delta===null?(k==='population'?'初始 30 名居民':'短缺時受損'):(delta>=0?'+':'')+delta+' / 日'}</small>`;$('resources').append(el);}
$('day').textContent=`第 ${state.day} 天 / 30`;updateStory();$('weather').textContent=state.day>=15&&state.day<=17?'塵幕 · 集光輸出 50%':'晴朗 · 高地微風';$('selection').textContent=selected?`已選 ${C.TYPES.find(t=>t.id===selected).name} · 點空地建造`:'選一種建築，拓展聚落';$('catalog').replaceChildren();for(let t of C.TYPES){let b=document.createElement('button');b.dataset.type=t.id;b.className='building'+(selected===t.id?' selected':'');b.disabled=state.status!=='playing';b.innerHTML=`<span class="symbol" style="background:${t.color}"></span><span>${t.name}</span><span>${t.cost}</span><small>${t.desc} · ${t.workers} 人力</small>`;b.title=`${t.name}：${t.cost} 材料`;b.onclick=()=>{selected=selected===t.id?null:t.id;touchCell=null;render();if(selected&&matchMedia('(max-width:700px)').matches)canvas.scrollIntoView({behavior:'smooth',block:'center'});};$('catalog').append(b);}
$('people').replaceChildren();state.residents.forEach(person=>{let el=document.createElement('button');el.className='person'+(person.alive?'':' dead');let icon=document.createElement('i'),name=document.createElement('span');name.textContent=person.name;el.append(icon,name);el.title=person.alive?'聽聽'+person.name+'的近況':'已逝';el.setAttribute('aria-label',person.name+'的近況');el.onclick=()=>{speakerIndex=state.residents.indexOf(person);residentNote=null;updateSpeaker();};$('people').append(el);});let active=C.staffing(state).filter(b=>b.active).reduce((n,b)=>n+C.TYPES.find(t=>t.id===b.type).workers,0);let summary=document.createElement('p');summary.className='muted';summary.style.gridColumn='1/-1';summary.textContent=`工作 ${active} 人 / 可用 ${p} 人 · 住宅 ${state.buildings.filter(b=>b.type==='home').length*10} 床`;$('people').append(summary);
$('log').replaceChildren();state.log.forEach(line=>{let el=document.createElement('p');el.textContent=line;$('log').append(el);});$('ration').checked=state.policy==='ration';$('ration').disabled=state.status!=='playing';$('next').disabled=!!C.pending(state)||state.status!=='playing';$('play').disabled=state.status!=='playing';$('event').replaceChildren();let e=C.pending(state);if(state.status!=='playing'){pause();let box=document.createElement('div');box.className='event-card';box.innerHTML=`<small>高地紀事 / ${state.status==='won'?'存續':'終章'}</small><h2>${state.status==='won'?'我們，迎來了明天。':'城市的燈光熄滅了。'}</h2><p>${state.status==='won'?'完成了 30 天的約定':'短缺或士氣崩潰使聚落無法繼續'}。存活 ${p} 人，士氣 ${state.morale}，健康 ${state.health}。可讀檔或重新開始。</p>`;$('event').append(box);}else if(e){pause();let box=document.createElement('div');box.className='event-card';let tag=document.createElement('small');tag.textContent='待決策 / 時間已暫停';let h=document.createElement('h3');h.textContent=e.title;let text=document.createElement('p');text.textContent=e.text;box.append(tag,h,text);e.choices.forEach((choice,i)=>{let b=document.createElement('button');b.textContent=choice.label;let detail=document.createElement('small');detail.textContent=choice.detail;b.append(detail);b.disabled=Object.entries(choice.effect).some(([k,v])=>v<0&&state[k]<-v);b.onclick=()=>{if(C.choose(state,i)){speakerIndex=0;save(true);render();notice(i===0&&e.day===1?'林晴收起鏡片：「再加一組陣列，今晚就有希望。」':'居民記住了你的決定');}};box.append(b);});$('event').append(box);}else{let info=document.createElement('p');info.className='muted';info.textContent='今日沒有待決事件。準備好後，結束這一天。';$('event').append(info);}updateTouchBuild();updateTutorial();}
function step(){if(!$('milestone').hidden)return notice('先看看第一夜的城市，再繼續我們的故事');if(tutorial&&tutorial.step<5)return notice('先完成目前教學步驟，或選擇跳過教學');let wasLit=state.opening?.status==='restored';if(C.advance(state)){residentNote=null;save(true);render();if(!wasLit&&state.opening?.status==='restored')celebrateOpening();}}
$('next').onclick=step;$('play').onclick=()=>{if(timer)pause();else if(!$('milestone').hidden)notice('先繼續我們的故事，再啟動自動推進');else if(tutorial)notice('教學期間請使用「結束這一天」');else if(C.pending(state))notice('請先完成事件決策');else{timer=setInterval(step,Number($('speed').value));$('play').textContent='Ⅱ 暫停';}};$('speed').onchange=()=>{if(timer){pause();$('play').click();}};
$('save').onclick=()=>{save();if(tutorial&&tutorial.step===6){tutorial.step=7;updateTutorial();}};$('load').onclick=()=>{try{let data=localStorage.getItem('last-city-v1');if(!data)return notice('目前沒有存檔');let loaded=C.validate(JSON.parse(data));pause();endTutorial(false);state=loaded;selected=null;resetScene();render();notice('已恢復城市');}catch(e){notice('無法讀取存檔：'+e.message);}};
$('export').onclick=()=>{let url=URL.createObjectURL(new Blob([JSON.stringify(state,null,2)],{type:'application/json'})),a=document.createElement('a');a.href=url;a.download=`last-city-day-${state.day}.json`;a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);};$('import').onclick=()=>$('file').click();$('file').onchange=async e=>{let file=e.target.files[0];if(!file)return;try{if(file.size>100000)throw Error('檔案過大');let next=C.validate(JSON.parse(await file.text()));pause();endTutorial(false);state=next;selected=null;resetScene();render();save(true);notice('已匯入城市');}catch(err){notice('匯入失敗：'+err.message);}e.target.value='';};
$('restart').onclick=()=>{pause();if(confirm('重新開始城市？目前未儲存的進度將離開。')){endTutorial(false);state=C.initial();selected=null;resetScene();render();$('arrival').showModal();}};$('help').onclick=()=>$('guide').showModal();$('cancel').onclick=()=>{selected=null;render();};document.addEventListener('keydown',e=>{if(e.key==='Escape'){selected=null;render();}});$('ration').onchange=e=>{state.policy=e.target.checked?'ration':'normal';render();save(true);};
function place(x,y){if(tutorial&&![3,4].includes(tutorial.step))return notice('先完成目前教學步驟，或選擇跳過教學');if(tutorial&&selected!==(tutorial.step===3?'farm':'solar'))return notice('請選擇教學提示的建築');if(!selected)return notice('請先選擇建築');let wasLit=state.opening?.status==='restored',type=selected;if(C.build(state,type,x,y)){buildBirths.set(x+','+y,performance.now()/1000);touchCell=null;render();save(true);reactToBuilding(type);if(!wasLit&&state.opening?.status==='restored')celebrateOpening();}else notice('無法建造：請確認空地、材料及遊戲狀態');}$('place').onclick=()=>place(Number($('bx').value)-1,Number($('by').value)-1);
function resize(){let rect=canvas.getBoundingClientRect();W=rect.width;H=rect.height;let dpr=Math.min(devicePixelRatio||1,2);canvas.width=W*dpr;canvas.height=H*dpr;ctx.setTransform(dpr,0,0,dpr,0,0);updateCamera();}
function updateCamera(){({scale,ox,oy}=CityCamera.layout(camera,W,H));$('zoom-level').textContent=Math.round(camera.zoom*100)+'%';}
function zoom(factor,x=W/2,y=H/2){CityCamera.zoomAt(camera,factor,x,y,W,H);updateCamera();}
$('zoom-in').onclick=()=>zoom(1.25);$('zoom-out').onclick=()=>zoom(.8);$('map-reset').onclick=()=>{Object.assign(camera,CityCamera.create());updateCamera();};
function draw(timestamp=0){requestAnimationFrame(draw);if(timestamp-lastDraw<32)return;lastDraw=timestamp;let reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;art.draw({state,w:W,h:H,scale,ox,oy,time:reduced?0:timestamp/1000,focus:touchCell||hover,selected,speakerIndex,transition:reduced?1:Math.min(1,Math.max(0,(timestamp/1000-celebratedAt)/3)),buildBirths});}
function point(e){let r=canvas.getBoundingClientRect(),dx=(e.clientX-r.left-ox)/(30*scale),dy=(e.clientY-r.top-oy)/(15*scale),x=Math.round((dy+dx)/2),y=Math.round((dy-dx)/2);return x>=0&&y>=0&&x<9&&y<9?{x,y}:null;}
function updateTouchBuild(){
 if(!selected)touchCell=null;
 $('touch-build').hidden=!touchCell||!selected;
 if(touchCell){let t=C.TYPES.find(t=>t.id===selected);$('touch-cell').textContent=`${t.name} · 空地 ${touchCell.x+1}, ${touchCell.y+1} · ${t.cost} 材料`;}
}
function tapMap(e){let p=point(e);if(!p)return;$('bx').value=p.x+1;$('by').value=p.y+1;hover=p;
 if(selected){if(e.pointerType==='touch'||matchMedia('(max-width:700px)').matches){if(state.buildings.some(b=>b.x===p.x&&b.y===p.y)){touchCell=null;updateTouchBuild();return notice('這裡已有建築，請選擇空地');}touchCell=p;updateTouchBuild();updateTutorial();}else place(p.x,p.y);}
 else{let b=state.buildings.find(b=>b.x===p.x&&b.y===p.y);if(b)notice(C.TYPES.find(t=>t.id===b.type).desc);}
}
$('touch-confirm').onclick=()=>{if(touchCell)place(touchCell.x,touchCell.y);};
function distance(){let [a,b]=[...pointers.values()];return b?Math.hypot(a.x-b.x,a.y-b.y):0;}
canvas.addEventListener('pointerdown',e=>{
 if(e.button!==0)return;canvas.setPointerCapture(e.pointerId);pointers.set(e.pointerId,{x:e.clientX,y:e.clientY});
 if(pointers.size===1)gesture={id:e.pointerId,startX:e.clientX,startY:e.clientY,moved:false,pinched:false};
 else if(gesture){gesture.pinched=true;gesture.distance=distance();}hover=null;
});
canvas.addEventListener('pointermove',e=>{
 if(!pointers.has(e.pointerId)){if(e.pointerType==='mouse')hover=point(e);return;}
 let prev=pointers.get(e.pointerId);pointers.set(e.pointerId,{x:e.clientX,y:e.clientY});if(!gesture)return;
 if(pointers.size>=2){let d=distance(),pts=[...pointers.values()],r=canvas.getBoundingClientRect();if(gesture.distance>0)zoom(d/gesture.distance,(pts[0].x+pts[1].x)/2-r.left,(pts[0].y+pts[1].y)/2-r.top);gesture.distance=d;gesture.pinched=true;}
 else if(!gesture.pinched){if(Math.hypot(e.clientX-gesture.startX,e.clientY-gesture.startY)>8)gesture.moved=true;if(gesture.moved){CityCamera.pan(camera,e.clientX-prev.x,e.clientY-prev.y,W,H);updateCamera();}}
});
function release(e,cancelled=false){if(!pointers.has(e.pointerId))return;let tap=!cancelled&&gesture&&!gesture.moved&&!gesture.pinched&&gesture.id===e.pointerId;pointers.delete(e.pointerId);if(tap)tapMap(e);if(!pointers.size)gesture=null;}
canvas.addEventListener('pointerup',e=>release(e));canvas.addEventListener('pointercancel',e=>release(e,true));canvas.addEventListener('lostpointercapture',e=>release(e,true));
canvas.addEventListener('pointerleave',()=>{if(!pointers.size)hover=null;});
canvas.addEventListener('wheel',e=>{if(!e.ctrlKey)return;e.preventDefault();let r=canvas.getBoundingClientRect();zoom(Math.exp(-e.deltaY*.01),e.clientX-r.left,e.clientY-r.top);},{passive:false});


function resetScene(){celebratedAt=-Infinity;speakerIndex=0;residentNote=null;resumeTutorial=false;buildBirths.clear();$('milestone').hidden=true;Object.assign(camera,CityCamera.create());updateCamera();}
const ROLES={home:'居民',farm:'育苗員',solar:'能源技師',salvage:'回收員',clinic:'照護員',square:'花園照料員',kitchen:'廚師',beacon:'通訊員'};
function assignment(index){let left=index;for(let b of C.staffing(state)){if(!b.active)continue;let workers=C.TYPES.find(t=>t.id===b.type).workers;if(left<workers)return ROLES[b.type];left-=workers;}return '居民';}
function updateSpeaker(custom){if(custom)residentNote={index:speakerIndex,text:custom};let person=state.residents[speakerIndex%30];$('speaker-portrait').textContent=person.name.slice(-1);$('speaker-role').textContent=`${person.name} / ${({0:'工程師 · ',7:'廚師 · ',14:'修復師 · ',21:'照護志工 · ',29:'見習通訊員 · '})[speakerIndex]||''}${assignment(speakerIndex)}`;let quotes=state.opening?.status==='restored'?['「燈亮起來的那一刻，我才發現大家都在等。」','「今晚可以把手提燈留給值夜班的人了。」','「明天我想在窗邊放一盆小樹。」','「這條路我已經走熟了。這裡是家。」']:['「鏡片能換，但住宅還得再接一組陣列。」','「鍋子還熱著。只差一盞能照到飯桌的燈。」','「廢墟裡有能用的東西，別急著全丟掉。」','「我把床鋪好了。希望今晚不用摸黑。」'];let quote=!person.alive?'「我們會記得，你曾經住在這裡。」':state.health<40?'「這幾天有人撐不住了。我們需要照護和食物。」':state.food<30?'「糧倉快空了，下一餐要先想辦法。」':custom||(residentNote?.index===speakerIndex?residentNote.text:quotes[speakerIndex%quotes.length]);$('speaker-quote').textContent=quote;}
$('speaker-next').onclick=()=>{let indices=[0,7,14,21,29];speakerIndex=indices[(indices.indexOf(speakerIndex)+1)%indices.length];residentNote=null;updateSpeaker();};
function reactToBuilding(type){let reactions={farm:[7,'「水流進去了。下一次收成，大家就不用分那麼薄的一份了。」'],solar:[0,'「電線接好了。等你準備好，我們就試著讓整排住宅亮起來。」'],home:[21,'「多一個屋簷，就少一個人睡在風裡。」'],clinic:[14,'「傷口終於有地方能好好處理了。」'],square:[29,'「我們也可以蓋一個，不是為了活命的地方。」'],salvage:[14,'「舊世界留下的東西，還能接著用。」'],kitchen:[7,'「今天開始，大家可以一起吃飯了。」'],beacon:[0,'「如果還有人在外面，希望他們能聽見。」']};let [i,quote]=reactions[type];speakerIndex=i;updateSpeaker(quote);notice(C.TYPES.find(t=>t.id===type).name+'已完工 · '+(type==='farm'?'食物產出 +18 / 日':type==='solar'?'能源產出 +14 / 日':'居民有了新的生活空間'));}
function updateStory(){let opening=state.opening,legacy=!opening,p=C.openingProgress(state),restored=legacy||opening?.status==='restored',foodReady=C.rates(state).food>=0,missed=opening?.status==='missed';$('opening-mission').classList.toggle('restored',!!restored);$('mission-kicker').textContent=legacy?'高地紀事 / 延續舊存檔':restored?(foodReady?'序章 / 我們的家':'下一個約定 / 明天的晚餐'):missed?'序章 / 還沒熄滅的希望':'序章 / 第一盞燈';$('mission-title').textContent=legacy?'我們還在，故事就還沒結束。':restored?(foodReady?'有燈，有飯，有人在等。':'燈亮了，明天的晚餐呢？'):missed?'昨夜沒有光，今天還能重新接上。':'在夜幕降臨前，把光帶回來。';$('mission-text').textContent=legacy?'舊城市的進度已保留。繼續照顧食物、健康與士氣，完成三十天的約定。':restored?(!foodReady?'沈禾望向糧倉：「燈有了，但食物每天還在減少。再建一座水耕溫室，好嗎？」':opening.onTime?'第一夜的燈亮了。接下來，讓食物、健康與士氣一起穩定下來。':'晚了一點，但住宅終於有了燈。現在，照顧好留下來的人。'):missed?'沈禾替大家留了一盞手提燈。補足運作中的集光陣列，恢復住宅供電。':'備用電池只夠維持基本設備。林晴想在第一夜，替三十個人點亮住宅。';$('mission-checks').replaceChildren();$('mission-checks').hidden=legacy;let checks=restored?[[true,'住宅恢復供電'],[foodReady,'食物每日收支轉正'],[C.population(state)===30,'三十位居民仍在身旁']]:[[p.decision,'回應集光站事件'],[p.arrays,'兩組集光陣列運作'],[p.supply,'能源庫存與收支穩定']];for(let [done,label]of checks){let el=document.createElement('span');el.className=done?'checked':'';el.textContent=(done?'✓ ':'○ ')+label;$('mission-checks').append(el);}let ready=p.decision&&p.arrays&&p.supply;$('mission-action').textContent=restored?(legacy||foodReady?'看看我們的家':'加蓋水耕溫室'):!p.decision?'回應林晴':!p.arrays?'加蓋集光陣列':ready&&state.day===1?'迎接第一個夜晚 →':'查看能源收支';$('mission-action').disabled=state.status!=='playing';$('next').textContent=state.day===1?'迎接第一個夜晚 →':'結束這一天 →';$('scene-time').textContent=restored&&state.day<=3?'20:10 · 萬家燈火':state.day===1?(ready?'18:20 · 試著接通住宅':'17:40 · 日落前'):'高地時間 · 暮色';$('scene-chapter').textContent=restored?'高地聚落 / A PLACE TO CALL HOME':'高地聚落 / THE FIRST EVENING';updateSpeaker();}
$('mission-action').onclick=()=>{let p=C.openingProgress(state);if(!state.opening||state.opening.status==='restored'){if(state.opening&&C.rates(state).food<0){if(tutorial)return notice('請先依照教學操作，或跳過教學');selected='farm';render();}canvas.scrollIntoView({behavior:'smooth',block:'center'});return;}if(!p.decision){$('event').scrollIntoView({behavior:'smooth',block:'center'});return;}if(tutorial){notice('請先完成目前教學步驟，或跳過教學');return;}if(!p.arrays){selected='solar';render();canvas.scrollIntoView({behavior:'smooth',block:'center'});}else if(p.supply&&state.day===1){step();canvas.scrollIntoView({behavior:'smooth',block:'center'});}else $('resources').scrollIntoView({behavior:'smooth',block:'center'});};
function celebrateOpening(){pause();clearTimeout(notice.t);$('toast').style.display='none';resumeTutorial=!!tutorial;if(tutorial)endTutorial(false);selected=null;touchCell=null;updateTouchBuild();$('selection').textContent='第一個夜晚 · 看，住宅的燈亮了';celebratedAt=performance.now()/1000;$('milestone').hidden=false;$('milestone-title').textContent=state.opening.onTime?'今晚，不必再摸黑。':'我們的燈，終於亮了。';$('milestone-text').textContent=state.opening.onTime?'住宅的燈一盞盞亮起。林晴放下工具，沈禾把熱湯端到窗邊。士氣 +8。':'沈禾終於收起手提燈。晚了一夜，但沒有人放棄這裡。士氣 +4。';speakerIndex=7;updateSpeaker('「你看，整排屋子都亮了。要不要先來吃點東西？」');canvas.scrollIntoView({behavior:'smooth',block:'center'});}
$('milestone-close').onclick=()=>{$('milestone').hidden=true;if(resumeTutorial){resumeTutorial=false;tutorial={step:6,startDay:1};updateTutorial();}};
$('arrival-begin').onclick=()=>{$('arrival').close();canvas.scrollIntoView({behavior:'smooth',block:'center'});if($('arrival-tutorial').checked)startTutorial();};
$('arrival-load').onclick=()=>{$('arrival').close();$('load').click();canvas.scrollIntoView({behavior:'smooth',block:'center'});};

// The tutorial observes real game actions; it never grants resources or resets the city.
const LESSONS=[
 {title:'歡迎接手這座城市',text:'30 位居民在這裡等著明天。接下來用幾個真實操作，學會處理事件、補足食物與能源，再結束第一天。教學不會重設城市，也不會額外贈送資源。',target:'#day',action:'開始教學'},
 {title:'先看每天的收支',text:'上方大數字是庫存，小數字是每日淨變化。初始食物每天 −12，表示供應不足；材料可用來建造。目標是在庫存用完前，讓食物與能源穩定。',target:'#resources',action:'我看懂了'},
 {title:'先回應居民的緊急事件',text:'點選事件中的一個方案。建議「更換鏡片」：花 10 材料，補充 15 能源。兩個方案都可繼續教學；事件未處理，時間就會暫停。',target:'#event'},
 {title:'為居民加蓋一座溫室',text:'選擇「水耕溫室」，再點地圖任一空地。也可保留下方 X / Y 的空地座標，按「在此建造」。花費 22 材料，每天增加 18 食物；建成後食物淨收益會轉正。',target:'[data-type="farm"]'},
 {title:'補上新的能源供應',text:'選擇「集光陣列」，再點另一塊空地。花費 18 材料、使用 2 人力，每天產出 14 能源。已蓋好的格子不能重複建造；可用座標選擇其他空地。',target:'[data-type="solar"]'},
 {title:'準備好了，迎接第一夜',text:'確認食物與能源的每日淨變化後，按「迎接第一個夜晚」（之後是「結束這一天」）。這會結算所有建築產量與居民消耗。教學期間暫停自動推進，讓你有時間確認結果。',target:'#next'},
 {title:'把城市保存下來',text:'日期已推進，庫存也已完成結算。現在按頁首「存檔」。遊戲平時也會自動存檔；若要備份到別的裝置，可使用「匯出」。',target:'#save'},
 {title:'你已學會讓城市運作',text:'接下來試著建造照護站與共享花園，保護健康和士氣。注意每棟建築的人力需求，以及第 15–17 天的沙塵。目標是完成第 30 天，讓居民一起活下來。',target:'#people',action:'完成教學'}
];
function startTutorial(){
 if(state.status!=='playing')return notice('請先重新開始城市，再進行教學');
 pause();tutorial={step:0,startDay:state.day};selected=null;updateTutorial();$('tutorial').scrollIntoView({behavior:'smooth',block:'start'});
}
function endTutorial(remember=true){tutorial=null;document.body.classList.remove('tutorial-active');$('tutorial').hidden=true;document.querySelectorAll('.tutorial-focus,.tutorial-support').forEach(el=>el.classList.remove('tutorial-focus','tutorial-support'));if(remember)try{localStorage.setItem('last-city-tutorial-done','1');}catch(e){} }
function updateTutorial(){
 document.querySelectorAll('.tutorial-focus,.tutorial-support').forEach(el=>el.classList.remove('tutorial-focus','tutorial-support'));
 if(!tutorial){document.body.classList.remove('tutorial-active');$('tutorial').hidden=true;return;}document.body.classList.add('tutorial-active');
 if(tutorial.step===2&&!C.pending(state))tutorial.step=3;
 if(tutorial.step===3&&state.buildings.filter(b=>b.type==='farm').length>=2)tutorial.step=4;
 if(tutorial.step===4&&state.buildings.filter(b=>b.type==='solar').length>=2)tutorial.step=5;
 if(tutorial.step===5&&state.day>tutorial.startDay)tutorial.step=6;
 if(state.status!=='playing'){endTutorial();return;}
 let changed=$('tutorial').dataset.step!==String(tutorial.step);$('tutorial').dataset.step=String(tutorial.step);let lesson=LESSONS[tutorial.step];$('tutorial').hidden=false;$('tutorial-progress').textContent=`新手教學 · ${tutorial.step+1} / ${LESSONS.length}`;$('tutorial-title').textContent=lesson.title;$('tutorial-text').textContent=lesson.text;
 $('tutorial-next').hidden=!lesson.action;$('tutorial-next').textContent=lesson.action||'下一步';
 let placing=(tutorial.step===3&&selected==='farm')||(tutorial.step===4&&selected==='solar');let target=document.querySelector(placing?'#map':lesson.target);if(placing){document.querySelector('.coordinate').classList.add('tutorial-support');document.querySelector('.map-tools').classList.add('tutorial-support');if(touchCell)$('touch-build').classList.add('tutorial-support');$('tutorial-text').textContent='已選好建築。點亮框地圖中的空地；手機再按「確認建造」。可單指拖曳、雙指縮放，也可輸入座標建造。';}if(target)target.classList.add('tutorial-focus');if(changed)$('tutorial').scrollIntoView({behavior:'smooth',block:'start'});
 if(tutorial.step===3||tutorial.step===4){let type=tutorial.step===3?'farm':'solar',cost=C.TYPES.find(t=>t.id===type).cost;if(state.materials<cost)$('tutorial-text').textContent+=' 目前材料不足；可先跳過教學，推進取得材料後再重開教學。';}
}
$('tutorial-start').onclick=startTutorial;
$('tutorial-skip').onclick=()=>{endTutorial();notice('已離開教學，可隨時從頁首重新開啟');};
$('tutorial-next').onclick=()=>{if(!tutorial)return;if(tutorial.step===7){endTutorial();notice('教學完成，接下來由你帶領城市');}else{tutorial.step++;updateTutorial();}};
$('tutorial-locate').onclick=()=>{if(!tutorial)return;let target=document.querySelector('.tutorial-focus');target?.scrollIntoView({behavior:'smooth',block:'center'});};

window.addEventListener('resize',resize);document.addEventListener('visibilitychange',()=>{if(document.hidden)pause();});render();resize();draw();
try{$('arrival-load').hidden=!localStorage.getItem('last-city-v1');if(!localStorage.getItem('last-city-arrival-seen')){$('arrival').showModal();localStorage.setItem('last-city-arrival-seen','1');}}catch(e){$('arrival').showModal();}

// Suppress browser zoom gestures. The canvas keeps its own camera zoom handler.
for(const eventName of ['gesturestart','gesturechange']){
 document.addEventListener(eventName,event=>event.preventDefault(),{passive:false});
}
document.addEventListener('wheel',event=>{
 if(event.ctrlKey||event.metaKey)event.preventDefault();
},{passive:false});
document.addEventListener('keydown',event=>{
 if((event.ctrlKey||event.metaKey)&&['+','-','=','0','Add','Subtract'].includes(event.key))event.preventDefault();
});
document.addEventListener('touchmove',event=>{
 if(event.touches.length>1&&!event.target.closest('#map'))event.preventDefault();
},{passive:false});
