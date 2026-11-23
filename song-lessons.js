/* Song lesson studio: teaches user-authored or permissioned notation, not song lyrics. */
(function(){
"use strict";
const supported=new Set(["S","r","R","g","G","M","M^","P","d","D","n","N","S'","—"]);
const semitones={S:0,r:1,R:2,g:3,G:4,M:5,"M^":6,P:7,d:8,D:9,n:10,N:11,"S'":12};
const aliases={Sa:"S",Re:"R",Ga:"G",Ma:"M",Pa:"P",Dha:"D",Ni:"N",SA:"S",RE:"R",GA:"G",MA:"M",PA:"P",DHA:"D",NI:"N"};
const name={S:"Sa",r:"Komal Re",R:"Re",g:"Komal Ga",G:"Ga",M:"Ma","M^":"Tivra Ma",P:"Pa",d:"Komal Dha",D:"Dha",n:"Komal Ni",N:"Ni","S'":"Upper Sa","—":"Rest"};
const exercises=[
 {id:"original-krishna",title:"Krishna Morning — Original Practice",kind:"Bhakti",film:"Original devotional-style exercise",notation:"S R G P | G R S — | R G P D | P G R S",description:"Begin with soft Sa, then practise a gentle rise and fall in four phrases."},
 {id:"original-ganesha",title:"Ganesha Greeting — Original Practice",kind:"Bhakti",film:"Original devotional-style exercise",notation:"S S R G | P G R S | S R G P | G R S —",description:"Practise repeating Sa gently and moving between Re and Ga."},
 {id:"original-rama",title:"Rama Evening — Original Practice",kind:"Bhakti",film:"Original devotional-style exercise",notation:"S R G R | S — R G | P D P G | R S — —",description:"Work on balanced short notes and relaxed, deliberate rests."},
 {id:"original-film",title:"Cinema Mood — Original Practice",kind:"Bollywood",film:"Original film-style exercise (not from a movie)",notation:"S G R S | R G P G | R S — S | G P D P | G R S —",description:"A playful original film-style phrase; listen to how repetition creates a hook."}
];
function parse(text){
 const raw=String(text||"").trim();if(!raw)return {error:"Add sargam notation first."};
 if(raw.length>3000)return {error:"Notation is too long (maximum 3000 characters)."};
 // Deliberately reject words/lyrics and accidentals the teaching engine cannot evaluate.
 const parts=raw.replace(/[|,;]+/g," | ").replace(/[\r\n]+/g," | ").split(/\s+/).filter(Boolean);
 const tokens=[];let phrase=0;
 for(const rawToken of parts){
   const token=aliases[rawToken]||rawToken;
   if(token==="|"){if(tokens.length&&tokens[tokens.length-1]!=="|"){tokens.push("|");phrase++}continue}
   if(/^[—–-]+$/.test(token)){tokens.push("—");continue}
   if(!supported.has(token))return {error:'Unsupported symbol "'+token.slice(0,30)+'". Use space-separated S R G M M^ P D N S'+"'"+' (also r g d n for komal notes), — for rests, and | between phrases. Lyrics cannot be assessed as sargam.'};
   tokens.push(token);
 }
 while(tokens[tokens.length-1]==="|")tokens.pop();
 const notes=tokens.filter(x=>x!=="|");
 if(!notes.length||!notes.some(x=>x!=="—"))return {error:"Please include at least one playable swara."};
 if(notes.length>96)return {error:"Keep a guided lesson to 96 notes or fewer. Split a long song into sections."};
 const groups=[];let group=[];for(const n of tokens){if(n==="|"){if(group.length)groups.push(group);group=[]}else group.push(n)}if(group.length)groups.push(group);
 return {notes,display:tokens,phrases:groups.length,groups};
}
const $=id=>document.getElementById(id);
let selected=null,filter="All",phraseSession=null;
let loopState={running:false,token:0,timer:null,nodes:[],iteration:0,bpm:48,phraseId:"",stream:null,source:null,analyser:null,frame:0,lastMicSample:0,adaptive:false,phase:"idle",lastScore:null};
function form(){
 const el=$("songLessonStudio");if(!el)return;
 if(Array.isArray(s.songs)){let changed=false;for(const item of s.songs){if(!item.lessonId){item.lessonId=crypto.randomUUID().replace(/-/g,"");changed=true}}if(changed)saveStore()}
 el.innerHTML='<div class="song-studio-head"><div><span class="song-studio-kicker">LEARN • PRACTISE • PERFORM</span><h2>Song Learning Studio</h2></div><span class="pill">A-scale friendly</span></div><p>Turn your saved or community sargam into a guided, note-by-note flute lesson. Original practice melodies are available even before you save songs.</p><div class="song-studio-controls"><label>Explore<select id="songLessonFilter"><option>All</option><option>Bollywood</option><option>Bhakti</option><option>Other</option></select></label><label>Find a lesson<input id="songLessonFind" placeholder="Search titles, film, notes"></label></div><div id="songLessonList" class="song-lesson-list"></div><div id="songLessonDetail" class="song-lesson-detail" aria-live="polite"></div>';
 $("songLessonFilter").onchange=e=>{filter=e.target.value;draw()};
 $("songLessonFind").oninput=draw;
 draw();
}
function lessons(){
 const privateItems=(Array.isArray(s.songs)?s.songs:[]).map((x,i)=>({...x,kind:x.kind||"Bollywood",source:"My notebook",key:"private-"+(x.lessonId||i),privateIndex:i}));
 return [...exercises.map(x=>({...x,source:"Original exercises",key:x.id})),...privateItems];
}
function draw(){
 const list=$("songLessonList");if(!list)return;
 list.replaceChildren();const search=String($("songLessonFind")?.value||"").toLowerCase();
 let filtered=lessons().filter(x=>(filter==="All"||x.kind===filter)&&[x.title,x.film,x.notation].some(v=>String(v||"").toLowerCase().includes(search)));
 for(const item of filtered){
  const row=document.createElement("div");row.className="song-lesson-item";
  const meta=document.createElement("div");const title=document.createElement("strong");title.textContent=item.title||"Untitled";const small=document.createElement("small");small.textContent=(item.kind||"Other")+" · "+item.source+(item.film?" · "+item.film:"");meta.append(title,small);
  const btn=document.createElement("button");btn.textContent="Study →";btn.onclick=()=>select(item);
  row.append(meta,btn);list.append(row)
 }
 if(!filtered.length){const p=document.createElement("p");p.className="muted";p.textContent="No matching lessons. Try a different filter or save your own notation.";list.append(p)}
}
function select(item){
 stopPhraseLoop(false);selected=item;const detail=$("songLessonDetail");if(!detail)return;detail.replaceChildren();
 const title=document.createElement("h3");title.textContent=item.title;
 const parsed=parse(item.notation);
 const sub=document.createElement("p");sub.className="muted";sub.textContent=item.description||"Listen to each phrase, identify the swaras, then play it slowly with your microphone.";
 detail.append(title,sub);
 if(parsed.error){const p=document.createElement("p");p.className="song-lesson-error";p.textContent=parsed.error;detail.append(p);return}
 const stats=document.createElement("p");stats.textContent=parsed.notes.length+" beats/notes · "+parsed.phrases+" phrases · Reference Sa "+(Number(s.sa)||440).toFixed(1)+" Hz";
 detail.append(stats);
 const phrase=document.createElement("div");phrase.className="song-lesson-phrase";
 parsed.display.forEach(n=>{const chip=document.createElement("span");chip.textContent=n==="|"?"│":n;chip.title=name[n]||"Phrase boundary";if(n==="|")chip.className="break";phrase.append(chip)});
 detail.append(phrase);
 const help=document.createElement("p");help.className="muted";help.textContent="Teaching steps: ① Listen to the phrase ② Say the swaras aloud ③ Play them slowly ④ Start microphone-checked Learn mode. Bars (│) separate phrases; rests count as beats.";
 detail.append(help);
 const actions=document.createElement("div");actions.className="row";
 const listen=document.createElement("button");listen.textContent="♫ Hear my notes";listen.onclick=()=>{try{const base=Number(s.sa)||440;parsed.notes.forEach((n,i)=>{if(n!=="—"&&semitones[n]!==undefined)tone(base*Math.pow(2,semitones[n]/12),i*.57,.39)})}catch(e){alert("Could not play: "+e.message)}};
 const begin=document.createElement("button");begin.className="primary";begin.textContent="🎯 Practice full song";begin.onclick=()=>openLesson(item,parsed);
 actions.append(listen,begin);detail.append(actions);
 const phraseArea=document.createElement("div");phraseArea.className="song-phrase-coach";phraseArea.id="songPhraseCoach";detail.append(phraseArea);
 phraseSession={item,parsed,index:0};renderPhraseCoach();detail.scrollIntoView({block:"nearest",behavior:"smooth"});
}

function phraseKey(item){return "songphrases-"+String(item.key||"unknown")+"-"+String(item.notation||"").length+"-"+String(item.notation||"").slice(0,48)}
function progressStore(){s.songPhraseProgress=s.songPhraseProgress&&typeof s.songPhraseProgress==="object"?s.songPhraseProgress:{};return s.songPhraseProgress}
function unlocked(item){const x=progressStore()[phraseKey(item)];return Math.max(0,Math.min(95,Number(x?.unlocked)||0))}
function saveUnlock(item,number,verified=false,score=null){const p=progressStore(),key=phraseKey(item),previous=p[key]||{};const next=Math.max(unlocked(item),number),verifiedPhrases={...(previous.verifiedPhrases||{})};if(verified)verifiedPhrases[number]=Math.max(0,Math.min(100,Math.round(Number(score)||0)));p[key]={unlocked:next,verifiedPhrases,updated:new Date().toISOString()};const keys=Object.keys(p).sort((a,b)=>String(p[a].updated||"").localeCompare(String(p[b].updated||"")));while(keys.length>100)delete p[keys.shift()];saveStore()}

function stopPhraseLoop(announce=true){
 loopState.token++;
 if(loopState.frame){cancelAnimationFrame(loopState.frame);loopState.frame=0}
 if(loopState.source){try{loopState.source.disconnect()}catch{}loopState.source=null}
 if(loopState.stream){loopState.stream.getTracks().forEach(track=>track.stop());loopState.stream=null}
 loopState.analyser=null;loopState.phase="idle";loopState.lastMicSample=0;
 if(loopState.timer!==null){clearTimeout(loopState.timer);loopState.timer=null}
 for(const osc of loopState.nodes){try{osc.stop()}catch{}try{osc.disconnect()}catch{}}
 loopState.nodes=[];
 loopState.running=false;
 if(announce)loopMessage("Loop stopped. Try again or practise with the teacher.");
 const btn=$("phraseLoopStart");if(btn)btn.textContent="▶ Start loop";
}
function loopMessage(text){
 const el=$("phraseLoopStatus");if(el)el.textContent=text
}
function loopSettings(){
 const bpm=Math.max(35,Math.min(120,Number($("phraseLoopBpm")?.value)||48));
 const count=Math.max(1,Math.min(8,Number($("phraseLoopCount")?.value)||3));
 const rise=!!$("phraseLoopRise")?.checked;
 const adaptive=!!$("phraseLoopAdaptive")?.checked;
 return {bpm,count,rise,adaptive}
}
function scheduleLoopCycle(seq,bpm){
 const context=ac(),beat=60/bpm,base=Number(s.sa)||440;
 const beginning=context.currentTime+.075;
 seq.forEach((note,i)=>{
  if(note==="—"||semitones[note]===undefined)return;
  const frequency=base*Math.pow(2,semitones[note]/12);
  const oscillator=context.createOscillator(),gain=context.createGain(),at=beginning+i*beat;
  oscillator.type="sine";oscillator.frequency.setValueAtTime(frequency,at);
  gain.gain.setValueAtTime(.0001,at);gain.gain.exponentialRampToValueAtTime(.095,at+.018);
  gain.gain.exponentialRampToValueAtTime(.0001,at+Math.max(.1,beat*.82));
  oscillator.connect(gain);gain.connect(context.destination);
  oscillator.start(at);oscillator.stop(at+Math.max(.1,beat*.82)+.04);
  loopState.nodes.push(oscillator);
 });
 return Math.ceil((seq.length*beat+.18)*1000)
}
function evaluateLoopRound(seq,bpm,token){
 return new Promise(resolve=>{
  if(!loopState.analyser||!loopState.stream||token!==loopState.token)return resolve(null);
  const beat=60000/bpm,duration=beat*seq.length,started=performance.now(),notes=seq.map(()=>({heard:0,good:0})),buffer=new Float32Array(loopState.analyser.fftSize);
  loopState.phase="play";
  loopMessage("Your turn: play the phrase at "+bpm+" BPM. No reference tones during assessment.");
  let settled=false;
  function finish(){
   if(settled)return;settled=true;
   loopState.frame=0;
   const pitched=notes.filter((_,i)=>seq[i]!=="—");
   const measured=pitched.filter(n=>n.heard>=2);
   const coverage=pitched.length?measured.length/pitched.length:0;
   const total=measured.reduce((a,n)=>a+n.heard,0),correct=measured.reduce((a,n)=>a+n.good,0);
   const accuracy=total?Math.round(correct/total*100):0;
   // Require *every* pitched note to be measurable and >=75% overall accuracy.
   resolve({coverage,accuracy,pass:pitched.length>0&&coverage===1&&accuracy>=75,measured:measured.length,totalNotes:pitched.length});
  }
  function sample(now){
   if(token!==loopState.token||!loopState.running)return finish();
   if(now-started>=duration)return finish();
   if(now-loopState.lastMicSample>=125){
    loopState.lastMicSample=now;
    const step=Math.min(seq.length-1,Math.floor((now-started)/beat));
    const n=seq[step];
    if(n!=="—"&&semitones[n]!==undefined){
      loopState.analyser.getFloatTimeDomainData(buffer);
      const pitch=corr(buffer,ac().sampleRate),expected=(Number(s.sa)||440)*Math.pow(2,semitones[n]/12);
      if(pitch>0&&expected>0){const result=window.compareSwaraPitch(pitch,expected);notes[step].heard++;if(result.near)notes[step].good++}
    }
   }
   loopState.frame=requestAnimationFrame(sample);
  }
  loopState.frame=requestAnimationFrame(sample);
 })
}
async function beginPhraseLoop(){
 if(!phraseSession)return;
 stopPhraseLoop(false);
 const {item,parsed,index}=phraseSession;
 const seq=parsed.groups[index]?.slice(),settings=loopSettings();
 if(!seq?.length)return;
 const sessionId=phraseKey(item)+"-"+index,token=loopState.token;
 loopState.running=true;loopState.iteration=0;loopState.bpm=settings.bpm;loopState.phraseId=sessionId;loopState.adaptive=settings.adaptive;
 const start=$("phraseLoopStart");if(start)start.textContent="■ Stop loop";
 try{
  const context=ac();await context.resume();
  if(settings.adaptive){
   if(!navigator.mediaDevices?.getUserMedia)throw Error("Microphone is not supported on this browser.");
   const stream=await navigator.mediaDevices.getUserMedia({audio:{echoCancellation:false,noiseSuppression:false,autoGainControl:false}});
   if(token!==loopState.token){stream.getTracks().forEach(t=>t.stop());return}
   loopState.stream=stream;loopState.source=context.createMediaStreamSource(stream);
   loopState.analyser=context.createAnalyser();loopState.analyser.fftSize=4096;
   loopState.source.connect(loopState.analyser);
  }
 }catch(e){stopPhraseLoop(false);loopMessage("Could not start adaptive practice: "+e.message+". For no-mic practice, turn off Adaptive tempo.");return}
 if(token!==loopState.token)return;
 async function cycle(){
  if(!loopState.running||token!==loopState.token)return;
  const number=++loopState.iteration,bpm=loopState.bpm;
  loopState.phase="listen";
  loopMessage("Round "+number+"/"+settings.count+" at "+bpm+" BPM: first listen to the reference phrase.");
  let wait;
  try{wait=scheduleLoopCycle(seq,bpm)}catch(e){stopPhraseLoop(false);loopMessage("Audio playback failed: "+e.message);return}
  // Await reference playback; never evaluate mic while synthesized reference notes sound.
  await new Promise(resolve=>{loopState.timer=setTimeout(resolve,wait)});
  loopState.timer=null;
  if(!loopState.running||token!==loopState.token)return;
  // A short quiet gap reduces residual speaker tone being read as the user's flute.
  let verdict=null;
  if(settings.adaptive){
   await new Promise(resolve=>{loopState.timer=setTimeout(resolve,250)});
   loopState.timer=null;
   if(!loopState.running||token!==loopState.token)return;
   verdict=await evaluateLoopRound(seq,bpm,token);
   if(!loopState.running||token!==loopState.token)return;
   loopState.lastScore=verdict;
   const status=verdict.pass?"✓ Good intonation":"↻ Repeat at the same speed";
   loopMessage(status+" · "+verdict.accuracy+"% in tune · "+verdict.measured+"/"+verdict.totalNotes+" notes measured.");
  }
  loopState.nodes=[];
  if(number>=settings.count){
   const finalText=settings.adaptive?(verdict?.pass?"Final round passed.":"Finished. Repeat this tempo to improve consistency."):"All loops played.";
   stopPhraseLoop(false);loopMessage(finalText+" Try guided phrase practice for verified progression.");
   return;
  }
  if(settings.adaptive){
   if(verdict?.pass)loopState.bpm=Math.min(120,loopState.bpm+5);
  }else if(settings.rise)loopState.bpm=Math.min(120,loopState.bpm+5);
  if(token!==loopState.token||!loopState.running)return;
  loopState.timer=setTimeout(()=>{loopState.timer=null;cycle()},settings.adaptive?950:150);
 }
 cycle();
}

function renderPhraseCoach(){
 stopPhraseLoop(false);
 const outer=$("songPhraseCoach");if(!outer||!phraseSession)return;
 outer.replaceChildren();const {item,parsed}=phraseSession;const total=parsed.groups.length;
 const heading=document.createElement("h3");heading.textContent="🎼 Phrase-by-phrase teacher";outer.append(heading);
 const expl=document.createElement("p");expl.className="muted";expl.textContent="Listen to one phrase, repeat the swaras, then complete it in microphone-guided Learn mode. Completing a phrase unlocks the next. Manual practice can be marked separately without an accuracy grade.";outer.append(expl);
 const selector=document.createElement("div");selector.className="song-phrase-select";
 for(let i=0;i<total;i++){const b=document.createElement("button"),locked=i>unlocked(item);const verified=progressStore()[phraseKey(item)]?.verifiedPhrases||{};b.textContent=(verified[i+1]!==undefined?"✓ ":i<unlocked(item)?"○ ":i===unlocked(item)?"▶ ":"🔒 ")+"Phrase "+(i+1)+(verified[i+1]!==undefined?" · "+verified[i+1]+"%":"");b.disabled=locked;b.className=i===phraseSession.index?"selected":"";b.onclick=()=>{phraseSession.index=i;renderPhraseCoach()};selector.append(b)}outer.append(selector);
 const index=phraseSession.index;if(index>unlocked(item))phraseSession.index=unlocked(item);
 const seq=parsed.groups[phraseSession.index];const label=document.createElement("p");label.textContent="Phrase "+(phraseSession.index+1)+" of "+total+" · "+seq.length+" beats";outer.append(label);
 const chips=document.createElement("div");chips.className="song-lesson-phrase";for(const n of seq){const span=document.createElement("span");span.textContent=n;span.title=name[n]||n;chips.append(span)}outer.append(chips);
 const note=document.createElement("p");note.className="muted";note.textContent="Teacher sequence: ① Hear ② Sing ③ Play ④ Check pitch stability. Rests (—) are silent beats.";outer.append(note);
 const row=document.createElement("div");row.className="row";
 const listen=document.createElement("button");listen.textContent="♫ Listen to phrase";listen.onclick=()=>{try{const base=Number(s.sa)||440;seq.forEach((n,i)=>{if(n!=="—"&&semitones[n]!==undefined)tone(base*Math.pow(2,semitones[n]/12),i*.65,.4)})}catch(e){alert(e.message)}};
 const start=document.createElement("button");start.textContent="🎙 Practise with teacher";start.className="primary";start.onclick=()=>{
  stopPhraseLoop(false);
  const mission={id:"phrase-"+String(item.key||"song").slice(0,40)+"-"+phraseSession.index,name:String(item.title).slice(0,75)+" · Phrase "+(phraseSession.index+1),kind:"Song phrase",bpm:48,seq:seq.slice(),help:"Listen, sing, then play each swara. Two seconds of steady pitch per note. Phrase progress is earned only with measured completion."};
  if(!window.surQuest?.openExercise?.(mission))return;
  tab("quest");
 };
 const manual=document.createElement("button");manual.textContent="✓ Mark manually practised";manual.onclick=()=>{if(!confirm("Mark this phrase practised without microphone verification? This only unlocks the next phrase; no pitch accuracy is awarded."))return;completePhrase(false)};
 row.append(listen,start,manual);outer.append(row);
 const loop=document.createElement("div");loop.className="phrase-loop-panel";
 loop.innerHTML='<h4>🔁 Phrase Loop Trainer</h4><p class="muted">Repeat this phrase at a comfortable tempo. Choose automatic tempo increases, or select Adaptive tempo to listen to your flute and advance only after a good round. Each adaptive round plays a reference, then gives you a silent turn. Looping never unlocks a phrase.</p><div class="phrase-loop-settings"><label>Starting tempo (BPM)<input id="phraseLoopBpm" type="number" min="35" max="120" step="5" value="48"></label><label>Repetitions<select id="phraseLoopCount"><option value="2">2 times</option><option value="3" selected>3 times</option><option value="4">4 times</option><option value="6">6 times</option><option value="8">8 times</option></select></label></div><label class="phrase-loop-checkbox"><input type="checkbox" id="phraseLoopRise"> Increase tempo by 5 BPM after each repetition</label><label class="phrase-loop-checkbox"><input type="checkbox" id="phraseLoopAdaptive"> 🎙 Adaptive tempo: raise speed only after at least 75% in-tune playing and every note measured</label><div class="row"><button type="button" class="primary" id="phraseLoopStart">▶ Start loop</button><button type="button" id="phraseLoopSlow">Start slowly (40 BPM)</button></div><p id="phraseLoopStatus" role="status">Ready: listen and play the phrase repeatedly before your guided attempt.</p>';
 outer.append(loop);
 $("phraseLoopStart").onclick=()=>loopState.running?stopPhraseLoop():beginPhraseLoop();
 $("phraseLoopAdaptive").onchange=()=>{$("phraseLoopRise").disabled=$("phraseLoopAdaptive").checked;$("phraseLoopRise").checked=false;stopPhraseLoop(false)};
 $("phraseLoopSlow").onclick=()=>{stopPhraseLoop(false);$("phraseLoopBpm").value="40";loopMessage("Set to 40 BPM. Press Start loop when ready.")};

 const msg=document.createElement("p");msg.className="muted";msg.id="phraseCoachStatus";msg.textContent="Unlocked "+Math.min(total,unlocked(item)+1)+" of "+total+" phrases. Mastery needs microphone-verified practice.";outer.append(msg);
}
function completePhrase(verified,score=null){
 if(!phraseSession)return;
 const item=phraseSession.item,number=phraseSession.index+1;
 saveUnlock(item,number,verified,score);
 const total=phraseSession.parsed.groups.length;
 if(number<total)phraseSession.index=number;
 renderPhraseCoach();
 const label=$("phraseCoachStatus");
 if(label)label.textContent=verified?"✓ Phrase verified! Pitch accuracy: "+Math.round(score)+"%. Next phrase unlocked.":"Phrase marked as manually practised (not pitch-verified).";
}
function handleQuestFinish(report){
 if(!phraseSession||!report?.lesson?.id?.startsWith("phrase-"))return;
 const expected="phrase-"+String(phraseSession.item.key||"song").slice(0,40)+"-"+phraseSession.index;
 if(report.lesson.id!==expected)return;
 const evidence=report.lesson.seq.map((n,i)=>({note:n,skipped:report.skippedIndices.includes(i),steady:!!report.evidence[i]?.steady,samples:report.evidence[i]?.samples||0,inTune:report.evidence[i]?.inTune||0}));
 const sounded=evidence.filter(x=>x.note!=="—");
 const good=!!report.microphone&&sounded.length>0&&sounded.every(x=>x.steady&&!x.skipped);
 if(good){const total=sounded.reduce((n,x)=>n+x.samples,0);const percent=total?100*sounded.reduce((n,x)=>n+x.inTune,0)/total:100;completePhrase(true,percent)}else{
  const label=$("phraseCoachStatus");
  if(label)label.textContent="Phrase attempt finished, but some notes were skipped or not held steadily. Replay and try again to unlock.";
 }
}
window.addEventListener("bansuri-quest-finished",e=>handleQuestFinish(e.detail));

function openLesson(item,parsed){
 stopPhraseLoop(false);
 if(!window.surQuest?.openExercise){alert("Sur Quest is unavailable. Reload Bansuri Guru and try again.");return}
 const prior=document.querySelector("#quest:not(.hidden)");
 if(!window.surQuest.openExercise({id:"song-"+String(item.key||"community").slice(0,75),name:String(item.title).slice(0,100),kind:(item.kind||"Song")+" notation",bpm:52,seq:parsed.notes.slice(),help:"Play the notes you selected from "+item.source+". Hold each pitch steadily; rest where marked. This is user-supplied notation, not a verified official score."}))return;
 tab("quest");
 if(prior)window.scrollTo({top:0,behavior:"smooth"});
}
function openCommunity(item){
 stopPhraseLoop(false);
 const p=parse(item.notation);
 if(p.error){alert(p.error);return}
 tab("songs");select({title:item.title,film:item.film||"",notation:item.notation,kind:"Bollywood",source:"Community shared notation",key:"community-"+item.id});
}
function refresh(){draw()}
window.addEventListener("pagehide",()=>stopPhraseLoop(false));
window.addEventListener("visibilitychange",()=>{if(document.hidden)stopPhraseLoop(false)});
document.querySelectorAll('#nav [data-tab]').forEach(b=>b.addEventListener('click',()=>{if(b.dataset.tab!=="songs")stopPhraseLoop(false)}));
window.bansuriSongStudio={parse,refresh,openCommunity,stopLoop:()=>stopPhraseLoop(false)};
form();
})();
