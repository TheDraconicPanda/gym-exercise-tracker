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
  assert.equal((app.get('workout-list').innerHTML.match(/type="number"/g)||[]).length,12);
  assert.match(app.get('workout-list').innerHTML,/value="2"/);
  assert.match(app.get('workout-list').innerHTML,/value="12"/);
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
  app.click('next-day'); assert.match(app.get('day-label').textContent,/Jan 2/);
  app.click('previous-day'); assert.match(app.get('day-label').textContent,/Dec 31/);
  assert.equal(boot('2027-01-01T12:00:00').get('workout-title').textContent,'Full Body C');
});

test('weight accepts decimals and zero, persists, and appears in history',()=>{
  const app=boot();
  app.edit(0,'weight',32.5);
  app.edit(0,'sets',3);
  assert.match(boot(undefined,app.storage).get('workout-list').innerHTML,/value="32.5"/);
  assert.match(boot('2026-10-26T12:00:00',app.storage).get('workout-list').innerHTML,/3 × 12 · 32.5 kg/);
  for(const value of [-1,10000,'abc']) assert.equal(app.edit(0,'weight',value)['aria-invalid'],'true');
  app.edit(0,'weight',0);
  assert.match(boot(undefined,app.storage).get('workout-list').innerHTML,/value="0"/);
  app.edit(0,'weight','');
  assert.match(boot(undefined,app.storage).get('workout-list').innerHTML,/placeholder="—" value=""/);
});
test('skips all rest days in both directions and opens the next workout on rest days',()=>{
  const app=boot('2026-10-20T12:00:00');
  assert.match(app.get('day-label').textContent,/Wednesday, Oct 21/);
  app.click('previous-day'); assert.match(app.get('day-label').textContent,/Monday, Oct 19/);
  app.click('previous-day'); assert.match(app.get('day-label').textContent,/Saturday, Oct 17/);
  app.click('next-day'); app.click('next-day'); app.click('next-day');
  assert.match(app.get('day-label').textContent,/Thursday, Oct 22/);
  app.click('next-day'); assert.match(app.get('day-label').textContent,/Saturday, Oct 24/);
  app.click('next-day'); assert.match(app.get('day-label').textContent,/Monday, Oct 26/);
  app.click('today-button'); assert.match(app.get('day-label').textContent,/Wednesday, Oct 21/);
});
test('existing sets and reps without weight remain readable',()=>{
  const storage=new Map([['gym-tracker-sessions-v1',JSON.stringify({'2026-10-19':{'monday-a':{0:{sets:4,reps:9}}}})]]);
  const app=boot(undefined,storage);
  assert.match(app.get('workout-list').innerHTML,/value="4"/);
  app.edit(0,'weight',20);
  const entry=JSON.parse(storage.get('gym-tracker-sessions-v1'))['2026-10-19']['monday-a'][0];
  assert.deepEqual(entry,{sets:4,reps:9,weight:20});
});

test('exercise guide toggles independently of saved workout values',()=>{
  const app=boot();
  assert.match(app.get('workout-list').innerHTML,/aria-expanded="false" aria-controls="exercise-guide-0"/);
  assert.match(app.get('workout-list').innerHTML,/images\/leg-press.svg/);
  const attrs={'aria-expanded':'false','aria-controls':'exercise-guide-0'};
  const button={getAttribute:key=>attrs[key],setAttribute:(key,value)=>attrs[key]=value};
  const panel=app.get('exercise-guide-0'); panel.hidden=true;
  const toggle=()=>app.get('workout-list').listeners.click({target:{closest:selector=>selector === ".exercise-toggle" ? button : null}});
  app.edit(0,'weight',42.5);
  toggle(); assert.equal(panel.hidden,false); assert.equal(attrs['aria-expanded'],'true');
  toggle(); assert.equal(panel.hidden,true); assert.equal(attrs['aria-expanded'],'false');
  app.get('workout-list').listeners.click({target:{closest:()=>null}});
  assert.equal(panel.hidden,true);
  assert.match(boot(undefined,app.storage).get('workout-list').innerHTML,/value="42.5"/);
});
test('every scheduled exercise has a bundled drawing and the main time label is removed',()=>{
  const path=require('node:path');
  const root=path.join(__dirname,'..');
  for(const date of ['2026-10-19','2026-10-21','2026-10-22','2026-10-24']) {
    const markup=boot(date+'T12:00:00').get('workout-list').innerHTML;
    const images=[...markup.matchAll(/<img src="([^"]+)"/g)];
    assert.ok(images.length>=3);
    for(const [,image] of images) {
      assert.ok(fs.readFileSync(path.join(root,image),'utf8').includes('<svg'));
    }
  }
  assert.ok(!fs.readFileSync(path.join(root,'index.html'),'utf8').includes('id="session-time"'));
});
