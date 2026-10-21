const {test} = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const source = fs.readFileSync(require('node:path').join(__dirname,'../app.js'),'utf8');
function boot(date='2026-10-19T12:00:00', storage=new Map(), fail=false) {
  const elements = new Map();
  const get = id => {
    if (!elements.has(id)) elements.set(id,{textContent:'',innerHTML:'',listeners:{},addEventListener(type,fn){this.listeners[type]=fn;}});
    return elements.get(id);
  };
  class Clock extends Date {constructor(...args){super(...(args.length?args:[date]));}}
  vm.runInNewContext(source,{Date:Clock,Intl,Number,JSON,setTimeout,clearTimeout,document:{getElementById:get},localStorage:{getItem:key=>storage.get(key)||null,setItem(key,value){if(fail)throw Error('Quota');storage.set(key,value);}}});
  return {get,storage,click:id=>get(id).listeners.click(),edit(index,field,value){
    const attrs={};
    const input={value:String(value),dataset:{index:String(index),field},matches:()=>true,setAttribute:(k,v)=>attrs[k]=v,removeAttribute:k=>delete attrs[k]};
    get('workout-list').listeners.input({target:input});
    return attrs;
  }};
}
test('starts on today with editable prescription and per-side defaults',()=>{
  const app=boot();
  assert.equal(app.get('workout-title').textContent,'Full Body A');
  assert.equal((app.get('workout-list').innerHTML.match(/type="number"/g)||[]).length,8);
  assert.match(app.get('workout-list').innerHTML,/value="2"/);
  assert.match(app.get('workout-list').innerHTML,/value="12"/);
  app.click('next-day'); assert.equal(app.get('workout-title').textContent,'Rest day');
  app.click('next-day'); assert.equal(app.get('workout-title').textContent,'Full Body B');
  app.click('next-day'); assert.match(app.get('workout-list').innerHTML,/Reps \/ side/);
  assert.match(app.get('workout-list').innerHTML,/value="10"/);
  app.click('today-button'); assert.equal(app.get('workout-title').textContent,'Full Body A');
});
test('stores edits per date, survives refresh and shows previous training next week',()=>{
  const app=boot(); app.edit(0,'sets',3); app.edit(0,'reps',10);
  app.click('next-day');
  const restored=boot(undefined,app.storage);
  assert.equal(restored.get('workout-title').textContent,'Full Body A');
  assert.match(restored.get('workout-list').innerHTML,/value="3"/);
  assert.match(restored.get('workout-list').innerHTML,/value="10"/);
  const nextWeek=boot('2026-10-26T12:00:00',app.storage);
  assert.match(nextWeek.get('workout-list').innerHTML,/Last · 2026-10-19 · 3 × 10/);
  nextWeek.edit(0,'sets',4);
  const old=boot(undefined,app.storage);
  assert.match(old.get('workout-list').innerHTML,/value="3"/);
});
test('rejects invalid input and reports failed storage',()=>{
  const app=boot();
  for(const value of ['',0,-1,1.5,100]) assert.equal(app.edit(0,'sets',value)['aria-invalid'],'true');
  assert.equal(app.storage.size,0);
  const blocked=boot(undefined,new Map(),true); blocked.edit(0,'reps',9);
  assert.match(blocked.get('save-status').textContent,/Could not save/);
});
test('handles calendar boundaries and resets navigation on reload',()=>{
  const app=boot('2026-12-31T12:00:00');
  app.click('next-day'); assert.match(app.get('day-label').textContent,/Jan 1/);
  app.click('previous-day'); assert.match(app.get('day-label').textContent,/Dec 31/);
  assert.equal(boot('2027-01-01T12:00:00').get('workout-title').textContent,'Rest day');
});
