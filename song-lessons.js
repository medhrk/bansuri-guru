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
 return {notes,display:tokens,phrases:phrase+1};
}
const $=id=>document.getElementById(id);
let selected=null,filter="All";
function form(){
 const el=$("songLessonStudio");if(!el)return;
 el.innerHTML='<div class="song-studio-head"><div><span class="song-studio-kicker">LEARN • PRACTISE • PERFORM</span><h2>Song Learning Studio</h2></div><span class="pill">A-scale friendly</span></div><p>Turn your saved or community sargam into a guided, note-by-note flute lesson. Original practice melodies are available even before you save songs.</p><div class="song-studio-controls"><label>Explore<select id="songLessonFilter"><option>All</option><option>Bollywood</option><option>Bhakti</option><option>Other</option></select></label><label>Find a lesson<input id="songLessonFind" placeholder="Search titles, film, notes"></label></div><div id="songLessonList" class="song-lesson-list"></div><div id="songLessonDetail" class="song-lesson-detail" aria-live="polite"></div>';
 $("songLessonFilter").onchange=e=>{filter=e.target.value;draw()};
 $("songLessonFind").oninput=draw;
 draw();
}
function lessons(){
 const privateItems=(Array.isArray(s.songs)?s.songs:[]).map((x,i)=>({...x,kind:x.kind||"Bollywood",source:"My notebook",key:"private-"+i,privateIndex:i}));
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
 selected=item;const detail=$("songLessonDetail");if(!detail)return;detail.replaceChildren();
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
 const begin=document.createElement("button");begin.className="primary";begin.textContent="🎯 Guided lesson";begin.onclick=()=>openLesson(item,parsed);
 actions.append(listen,begin);detail.append(actions);detail.scrollIntoView({block:"nearest",behavior:"smooth"});
}
function openLesson(item,parsed){
 if(!window.surQuest?.openExercise){alert("Sur Quest is unavailable. Reload Bansuri Guru and try again.");return}
 const prior=document.querySelector("#quest:not(.hidden)");
 window.surQuest.openExercise({id:"song-"+String(item.key||"community").slice(0,75),name:String(item.title).slice(0,100),kind:(item.kind||"Song")+" notation",bpm:52,seq:parsed.notes.slice(),help:"Play the notes you selected from "+item.source+". Hold each pitch steadily; rest where marked. This is user-supplied notation, not a verified official score."});
 tab("quest");
 if(prior)window.scrollTo({top:0,behavior:"smooth"});
}
function openCommunity(item){
 const p=parse(item.notation);
 if(p.error){alert(p.error);return}
 openLesson({title:item.title,kind:"Community",source:"Community shared notation",key:item.id},p);
}
function refresh(){draw()}
window.bansuriSongStudio={parse,refresh,openCommunity};
form();
})();
