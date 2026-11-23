/* Six-hole Hindustani bansuri fingering reference; register and tradition matter. */
(function(){
"use strict";
const $=id=>document.getElementById(id);
const intervals={S:0,r:1,R:2,g:3,G:4,M:5,"M^":6,P:7,d:8,D:9,n:10,N:11,"S'":12};
const names={S:"Sa",r:"Komal Re",R:"Re",g:"Komal Ga",G:"Ga",M:"Shuddha Ma","M^":"Tivra Ma",P:"Pa",d:"Komal Dha",D:"Dha",n:"Komal Ni",N:"Ni","S'":"Upper Sa"};
const fingerings={
 S:{holes:"XXXOOO",register:"Middle",confidence:"Common basic fingering",tip:"Cover holes 1–3 closest to the blowing end. Keep the bottom three open."},
 R:{holes:"XXOOOO",register:"Middle",confidence:"Common basic fingering",tip:"Lift the finger from hole 3 while keeping holes 1–2 covered."},
 G:{holes:"XOOOOO",register:"Middle",confidence:"Common basic fingering",tip:"Lift hole 2. Keep only hole 1 covered."},
 M:{holes:"HOOOOO",register:"Middle",confidence:"Approximate; check tuning",tip:"Shuddha Ma often uses a partial covering of hole 1. The exact opening varies by flute and teacher."},
 "M^":{holes:"OOOOOO",register:"Middle",confidence:"Common option, instrument-dependent",tip:"All six holes open can produce tivra Ma on many six-hole bansuris. Confirm pitch on your flute."},
 P:{holes:"XXXXXX",register:"Middle (overblown)",confidence:"Common option, register-dependent",tip:"All six closed naturally gives lower Pa. For middle Pa, increase air speed carefully to reach the upper register, without forcing. Some teachers use an alternative vented fingering."},
 D:{holes:"XXXXXO",register:"Middle (overblown)",confidence:"Common option, register-dependent",tip:"Common middle Dha uses five holes covered with an appropriate higher-register air stream; this fingering at a gentler breath can sound in a lower register."},
 N:{holes:"XXXXOO",register:"Middle (overblown)",confidence:"Common option, register-dependent",tip:"Common middle Ni with four covered holes uses higher-register support; check octave carefully."},
 "S'":{holes:"XXXOOO",register:"Upper",confidence:"Common basic fingering",tip:"Same three-covered-hole pattern as middle Sa, played in the upper register. Do not force the breath."}
};
const altered={r:"Komal Re is generally produced using a partial hole opening or alternate fingering, depending on your flute. Consult a qualified teacher and confirm with the tuner.",g:"Komal Ga is generally produced with a partially covered hole. Fingering varies with instrument geometry.",d:"Komal Dha can require half-holing or other cross-fingerings. Do not treat a generic diagram as exact.",n:"Komal Ni is commonly obtained using partial covering or alternate fingerings. Consult an instrument-specific chart."};
const labels={X:"Covered",O:"Open",H:"Partly covered"};
let current="S";
function node(tag,value,cls){const e=document.createElement(tag);if(value!==undefined)e.textContent=String(value);if(cls)e.className=cls;return e}
function render(){
 const root=$("fingeringGuide");if(!root)return;root.replaceChildren();
 root.append(node("h2","🪈 Six-hole Bansuri Fingering Guide"),node("p","Illustrative Hindustani bansuri fingerings with Sa at three covered holes. Hole 1 is nearest the blowing hole. These are starting references, not guaranteed fingerings for every bamboo flute.","muted"));
 const selection=node("div",undefined,"finger-select");
 for(const key of Object.keys(names)){
  const btn=node("button",names[key]);btn.type="button";btn.dataset.note=key;btn.className=current===key?"chosen":"";btn.onclick=()=>{current=key;render()};
  selection.append(btn)
 }root.append(selection);
 const card=node("div",undefined,"finger-card");
 const entry=fingerings[current];
 const noteTitle=node("h3",names[current]);card.append(noteTitle);
 const freq=(Number(s.sa)||440)*Math.pow(2,intervals[current]/12);
 card.append(node("p","Target pitch: "+freq.toFixed(1)+" Hz · Reference Sa: "+(Number(s.sa)||440).toFixed(1)+" Hz","finger-frequency"));
 if(entry){
  card.append(node("p",entry.register+" register · "+entry.confidence,"finger-confidence"));
  const diagram=node("div",undefined,"finger-instrument");
  const blow=node("div","Blowing end","finger-blow");diagram.append(blow);
  entry.holes.split("").forEach((status,i)=>{
   const hole=node("div",undefined,"finger-hole "+(status==="X"?"closed":status==="H"?"half":"open"));
   hole.setAttribute("aria-label","Hole "+(i+1)+": "+labels[status]);
   hole.append(node("span",String(i+1),"finger-number"));diagram.append(hole)
  });
  diagram.append(node("span","Foot end","finger-foot"));card.append(diagram);
  card.append(node("p",entry.tip,"finger-tip"));
 }else{
  card.append(node("p","No universally reliable six-hole pattern is shown for this altered swara.","finger-warning"),node("p",altered[current],"finger-tip"));
 }
 const legend=node("div",undefined,"finger-legend");for(const [cls,symbol,text] of [["closed","●","Covered"],["open","○","Open"],["half","◐","Half-covered"]])legend.append(node("span",symbol+" "+text,cls));card.append(legend);
 const actions=node("div",undefined,"row"),listen=node("button","♫ Hear target note","primary"),quest=node("button","🎯 Practise in Sur Quest");
 listen.onclick=()=>{try{tone(freq,0,.7)}catch(e){alert("Could not play reference: "+e.message)}};
 quest.onclick=()=>{
  const seq=["S",current,"S"].filter(x=>intervals[x]!==undefined);
  if(!window.surQuest?.openExercise?.({id:"fingering-"+current,name:names[current]+" · Fingering practice",kind:"Fingering & pitch",bpm:44,seq,help:"Check the finger positions visually, then play each target note and hold it steadily. The guide cannot detect finger placement."}))return;
  tab("quest");
 };
 actions.append(listen,quest);card.append(actions);root.append(card);
 root.append(node("p","For komal notes, some Ma/Pa options and high registers, fingering and air stream differ across flutes and teaching traditions. The microphone checks acoustic pitch, not finger placement.","finger-disclaimer"));
}
window.addEventListener("bansuri-sa-changed",render);
window.bansuriFingering={render,openNote:n=>{if(names[n])current=n;tab("fingering");render()},fingerings};
render();
})();