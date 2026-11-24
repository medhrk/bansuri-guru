import test, {before, after, beforeEach} from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {initializeTestEnvironment, assertSucceeds, assertFails} from "@firebase/rules-unit-testing";
import {doc,setDoc,getDoc,updateDoc,deleteDoc,collection,query,where,getDocs} from "firebase/firestore";
let env;
const alice="alice-uid",bob="bob-uid";
const backup=uid=>["users",uid,"practice","current"];
const post=(uid=alice)=>({ownerUid:uid,title:"Original practice",film:"Original",notation:"S R G P | G R S",isPublic:true,publishedAt:"2026-11-24T08:30:00Z",updatedAt:"2026-11-24T08:30:00Z"});
before(async()=>{
 if(!process.env.FIRESTORE_EMULATOR_HOST)throw Error("Use npm run test:rules (starts Firestore emulator)");
 env=await initializeTestEnvironment({projectId:"demo-bansuri-rules",firestore:{rules:readFileSync(new URL("../firestore.rules",import.meta.url),"utf8")}});
});
after(async()=>{if(env)await env.cleanup()});
beforeEach(async()=>env.clearFirestore());
const as=uid=>uid?env.authenticatedContext(uid).firestore():env.unauthenticatedContext().firestore();
async function seed(path,data){await env.withSecurityRulesDisabled(async c=>setDoc(doc(c.firestore(),...path),data))}
test("guest cannot access private user backup",async()=>{
 await seed(backup(alice),{logs:[]});
 await assertFails(getDoc(doc(as(),...backup(alice))));
 await assertFails(setDoc(doc(as(),...backup(alice)),{logs:[]}));
});
test("owner can create, read, modify and delete own backup",async()=>{
 const d=doc(as(alice),...backup(alice));
 await assertSucceeds(setDoc(d,{logs:[]}));
 assert.equal((await assertSucceeds(getDoc(d))).exists(),true);
 await assertSucceeds(updateDoc(d,{goal:30}));
 await assertSucceeds(deleteDoc(d));
 await assertFails(setDoc(doc(as(alice),"users",alice,"practice","other"),{logs:[]}));
});
test("signed-in Bob cannot read, change or delete Alice's backup",async()=>{
 await seed(backup(alice),{logs:[]});
 const d=doc(as(bob),...backup(alice));
 await assertFails(getDoc(d));
 await assertFails(updateDoc(d,{goal:999}));
 await assertFails(setDoc(d,{logs:["overwrite"]}));
 await assertFails(deleteDoc(d));
});
test("unknown private collections denied",async()=>{
 const d=doc(as(alice),"admin","configuration");
 await assertFails(setDoc(d,{isAdmin:true}));
 await assertFails(getDoc(d));
});
test("owner can publish and visitors can read and list published notations",async()=>{
 await assertSucceeds(setDoc(doc(as(alice),"publicSongs","song-1"),post()));
 const guest=as();
 assert.equal((await assertSucceeds(getDoc(doc(guest,"publicSongs","song-1")))).exists(),true);
 const result=await assertSucceeds(getDocs(query(collection(guest,"publicSongs"),where("isPublic","==",true))));
 assert.equal(result.size,1);
});
test("visitors and other accounts cannot modify an author's notation",async()=>{
 await seed(["publicSongs","song-1"],post());
 await assertFails(setDoc(doc(as(),"publicSongs","song-2"),post()));
 await assertFails(updateDoc(doc(as(),"publicSongs","song-1"),{title:"hijacked"}));
 await assertFails(updateDoc(doc(as(bob),"publicSongs","song-1"),{title:"hijacked"}));
 await assertFails(deleteDoc(doc(as(bob),"publicSongs","song-1")));
});
test("author can change title but not owner, initial publication time or public flag",async()=>{
 await seed(["publicSongs","song-1"],post());
 const d=doc(as(alice),"publicSongs","song-1");
 await assertSucceeds(updateDoc(d,{title:"My original update",updatedAt:"2026-11-24T09:00:00Z"}));
 await assertFails(updateDoc(d,{ownerUid:bob}));
 await assertFails(updateDoc(d,{publishedAt:"2026-11-24T09:01:00Z"}));
 await assertFails(updateDoc(d,{isPublic:false}));
 await assertSucceeds(deleteDoc(d));
});
test("forged authors, oversized notation and extra fields rejected",async()=>{
 await assertFails(setDoc(doc(as(bob),"publicSongs","fake-owner"),post(alice)));
 await assertFails(setDoc(doc(as(alice),"publicSongs","too-long"),{...post(),notation:"S ".repeat(1800)}));
 await assertFails(setDoc(doc(as(alice),"publicSongs","extra-field"),{...post(),isAdmin:true}));
});
test("hidden community document not accessible to guest",async()=>{
 await seed(["publicSongs","hidden"],{...post(),isPublic:false});
 await assertFails(getDoc(doc(as(),"publicSongs","hidden")));
});
