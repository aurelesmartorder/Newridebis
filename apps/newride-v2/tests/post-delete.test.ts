import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import vm from 'node:vm';
const code=readFileSync(new URL('../public/newridebis/social-delete.js',import.meta.url),'utf8');
const remove=vm.runInNewContext(code+'\ndeleteOwnedSocialPost');
const id='11111111-1111-4111-8111-111111111111', owner='22222222-2222-4222-8222-222222222222';
function client(result:unknown){const calls:unknown[]=[];const chain={delete(){calls.push('delete');return this},eq(k:string,v:string){calls.push([k,v]);return this},async select(){return result}};return {calls,from(table:string){assert.equal(table,'posts');return chain}}}
test('supprimer un post exige son identifiant ET le compte auteur dans la requête',async()=>{const c=client({data:[{id}],error:null});await remove(c,id,owner);assert.deepEqual(c.calls,['delete',['id',id],['user_id',owner]])});
test('une suppression refusée ou sans ligne confirmée ne devient pas une réussite',async()=>{for(const result of [{data:[],error:null},{data:null,error:{message:'RLS'}},{data:[{id:owner}],error:null}])await assert.rejects(()=>remove(client(result),id,owner));});
test('aucune requête de suppression ne part avec un identifiant malformé',async()=>{const c=client({});await assert.rejects(()=>remove(c,'foreign-id',owner));assert.deepEqual(c.calls,[])});
