import {test} from 'node:test';
import assert from 'node:assert/strict';
import {answer} from '../lib/bots.ts';
const k={sources:[],rules:[{id:'g',trigger:'hello',reply:'Welcome!'},{id:'h',trigger:'what are your opening hours?',reply:'9am–5pm',aliases:['when are you available','business hours']},{id:'q',trigger:'get a quote',reply:'Email us.'}]};
test('greetings, capitalization, punctuation and reordering',()=>{for(const q of ['hi','Hey!','HELLO','hey there','good morning','helllo'])assert.equal(answer(k,q).text,'Welcome!',q);for(const q of ['when do you open','opening hours','hours opening','what time do you open','when are you available','business hours'])assert.equal(answer(k,q).text,'9am–5pm',q);assert.equal(answer(k,'quote get').text,'Email us.');});
test('small typo and transposition',()=>{assert.equal(answer(k,'get a qoute').text,'Email us.');assert.equal(answer(k,'get a quot').text,'Email us.');});
test('does not turn negation, extra constraints or short words into rules',()=>{for(const q of ['no','bye','are you open tomorrow','not opening hours','hello refund','closed for holidays','where do you open'])assert.match(answer(k,q).source,/Fallback/,q);});
test('exact rule takes priority, uncertain overlaps ask to clarify',()=>{const conflict={sources:[],rules:[...k.rules,{id:'g2',trigger:'hi',reply:'Hello there.'}]};assert.equal(answer(conflict,'hi').text,'Hello there.');assert.match(answer(conflict,'hey').source,/Clarification/);});
test('untrained and knowledge fallback still work',()=>{assert.equal(answer(undefined,'hi').source,'Not trained');assert.equal(answer({rules:[],sources:[{id:'s',title:'Services',content:'We repair leaking taps.'}]},'taps').text,'We repair leaking taps.');});
