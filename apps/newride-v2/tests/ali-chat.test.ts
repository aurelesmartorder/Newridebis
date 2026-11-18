import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import vm from 'node:vm';
const bridge=readFileSync(new URL('../public/newridebis/bridge.js',import.meta.url),'utf8');
const start=bridge.indexOf('  async function nativeAliChat(');
const end=bridge.indexOf('  async function loadNativeAliHistory(',start);
const id='12345678-1234-4234-8234-123456789012';
function setup(response:any){let current:any={id:'A'};const state:any={chatHistory:[],activeChatMessages:[]};const writes:any[]=[];const calls:any[]=[];const context:any={window:{},console, S:state,AbortController,setTimeout,clearTimeout,notice:()=>{},notify:()=>{},sbClient:{auth:{getSession:async()=>({data:{session:{access_token:'test-token',user:{id:'A'}}}})},from:()=>({insert:(rows:any)=>{writes.push(rows);return {select:()=>({single:async()=>({data:{id:writes.length},error:null})})}}})},fetch:async(_url:any,options:any)=>{calls.push(options);return response()}};Object.defineProperty(context,'CURRENT_USER',{get:()=>current});const run=vm.runInNewContext(bridge.slice(start,end)+'\nnativeAliChat',context);return {run,state,writes,calls,switchAccount:()=>{current={id:'B'}}}}
test('a valid server reply renders and persists rather than throwing ReferenceError',async()=>{const t=setup(async()=>({ok:true,json:async()=>({reply:'Réponse de recette'})}));await t.run('Ma question',null,id);assert.equal(t.state.chatHistory[1].content,'Réponse de recette');assert.equal(t.state.nativeChatBusy,false);assert.equal(t.writes[1][0].content,'Réponse de recette');assert.equal(t.calls[0].headers.Authorization,'Bearer test-token')});
test('server error preserves the question without inventing an ALI answer',async()=>{const t=setup(async()=>({ok:false,status:500,json:async()=>({})}));await t.run('Question conservée',null,id);assert.equal(t.state.chatHistory.length,1);assert.ok(t.state.nativeChatError);assert.equal(t.writes.length,1)});
test('late account A response never writes to account B',async()=>{let finish:any;const t=setup(()=>new Promise(r=>{finish=r}));const pending=t.run('Question A',null,id);await new Promise(r=>setTimeout(r,0));t.switchAccount();finish({ok:true,json:async()=>({reply:'Privé A'})});await pending;assert.equal(t.state.chatHistory.length,1);assert.equal(t.writes.length,1)});
