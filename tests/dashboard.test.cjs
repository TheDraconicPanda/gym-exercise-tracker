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
  return {get,storage,click:id=>get(id).listeners.click(),move(id,day){
    get('schedule-days').listeners.change({target:{matches:()=>true,dataset:{workout:id},value:String(day)}});
  },edit(index,field,value){
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
  assert.match(app.get('workout-list').innerHTML,/images\/monday-illustrations.png/);
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
    assert.equal((markup.match(/class="exercise-illustration"/g)||[]).length,images.length);
    for(const [,left,top] of markup.matchAll(/style="left:-(\d+)%;top:-(\d+)%;/g)) {
      assert.ok(['0','100'].includes(left)); assert.ok(['0','90','94','100'].includes(top));
    }
    for(const [,image] of images) {
      const bytes=fs.readFileSync(path.join(root,image));
      assert.equal(bytes.subarray(0,8).toString('hex'),'89504e470d0a1a0a');
    }
  }
  assert.ok(!fs.readFileSync(path.join(root,'index.html'),'utf8').includes('id="session-time"'));
});

test('corrected exercise guides render whole standalone images with clear movement cues',()=>{
  const monday=boot().get('workout-list').innerHTML;
  const wednesday=boot('2026-10-21T12:00:00').get('workout-list').innerHTML;
  const saturday=boot('2026-10-24T12:00:00').get('workout-list').innerHTML;
  for(const [markup,slug] of [[monday,'chest-press'],[monday,'hamstring-curl'],[wednesday,'lat-pulldown'],[wednesday,'biceps-curl'],[saturday,'chest-press-variation']]) {
    assert.ok(markup.includes(`data-layout="standalone"><img src="images/${slug}-steps.png"`));
    const image=markup.match(new RegExp(`<img src="images/${slug}-steps.png"[^>]+>`))[0];
    assert.match(image,/style=""/);
    assert.doesNotMatch(image,/NaN|undefined/);
  }
  assert.match(monday,/Curl your lower legs down and back/);
  assert.match(wednesday,/Sit facing the machine/);
  assert.match(saturday,/palms facing each other/);
});

test('moves Monday to Tuesday, swaps Wednesday and Thursday, and navigates by date',()=>{
  const app=boot();
  app.move('monday-a',1);
  assert.match(app.get('day-label').textContent,/Tuesday, Oct 20/);
  app.move('thursday-light',2);
  app.click('next-day');
  assert.equal(app.get('workout-title').textContent,'Light + Core');
  assert.match(app.get('day-label').textContent,/Wednesday, Oct 21/);
  app.click('next-day');
  assert.equal(app.get('workout-title').textContent,'Full Body B');
  assert.match(app.get('day-label').textContent,/Thursday, Oct 22/);
  app.click('previous-day');
  assert.equal(app.get('workout-title').textContent,'Light + Core');
  assert.equal(app.get('planned-days').textContent,'Tue · Wed · Thu · Sat');
  const refreshed=boot('2026-10-20T12:00:00',app.storage);
  assert.equal(refreshed.get('workout-title').textContent,'Full Body A');
  assert.match(refreshed.get('day-label').textContent,/Tuesday, Oct 20/);
  assert.match(boot('2026-10-26T12:00:00',app.storage).get('day-label').textContent,/Monday, Oct 26/);
});
test('moves saved data with both workouts in a swap and preserves earlier history',()=>{
  const app=boot('2026-10-21T12:00:00');
  app.edit(0,'weight',45.5); app.edit(0,'sets',3);
  app.click('next-day'); app.edit(0,'weight',17.5);
  app.move('thursday-light',2);
  assert.match(app.get('day-label').textContent,/Wednesday, Oct 21/);
  assert.match(app.get('workout-list').innerHTML,/value="17.5"/);
  const data=JSON.parse(app.storage.get('gym-tracker-sessions-v1'));
  assert.equal(data['2026-10-21']['thursday-light'][0].weight,17.5);
  assert.equal(data['2026-10-22']['wednesday-b'][0].weight,45.5);
  assert.equal(data['2026-10-22']['wednesday-b'][0].sets,3);
  assert.equal(data['2026-10-21']['wednesday-b'],undefined);
  app.click('next-day'); assert.match(app.get('workout-list').innerHTML,/value="45.5"/);
  const next=boot('2026-10-28T12:00:00',app.storage);
  assert.match(next.get('workout-list').innerHTML,/Last · 2026-10-22 · 3 × 12 · 45.5 kg/);
});
test('failed schedule persistence leaves data and selected day unchanged',()=>{
  const storage=new Map([['gym-tracker-sessions-v1',JSON.stringify({'2026-10-19':{'monday-a':{0:{sets:3,reps:8,weight:30}}}})]]);
  const before=storage.get('gym-tracker-sessions-v1');
  const app=boot(undefined,storage,true);
  app.move('monday-a',1);
  assert.match(app.get('day-label').textContent,/Monday, Oct 19/);
  assert.match(app.get('schedule-status').textContent,/No workouts were moved/);
  assert.equal(storage.get('gym-tracker-sessions-v1'),before);
  app.click('next-day'); assert.match(app.get('day-label').textContent,/Wednesday, Oct 21/);
  app.click('previous-day'); assert.match(app.get('workout-list').innerHTML,/value="30"/);
});
test('Sunday moves cross month boundaries and next week retains its default schedule',()=>{
  const app=boot('2026-12-31T12:00:00');
  app.move('thursday-light',6);
  assert.match(app.get('day-label').textContent,/Sunday, Jan 3/);
  assert.equal(app.get('workout-title').textContent,'Light + Core');
  app.click('next-day'); assert.match(app.get('day-label').textContent,/Monday, Jan 4/);
  app.click('previous-day'); assert.match(app.get('day-label').textContent,/Sunday, Jan 3/);
  assert.equal(boot('2027-01-03T12:00:00',app.storage).get('workout-title').textContent,'Light + Core');
});
test('rescheduling preserves weeks already saved and supports repeated moves',()=>{
  const app=boot(); app.edit(0,'weight',22); app.move('monday-a',1); app.move('monday-a',4);
  assert.match(app.get('day-label').textContent,/Friday, Oct 23/);
  const next=boot('2026-10-26T12:00:00',app.storage); next.move('monday-a',1);
  const previous=boot('2026-10-23T12:00:00',app.storage);
  assert.equal(previous.get('workout-title').textContent,'Full Body A');
  assert.match(previous.get('workout-list').innerHTML,/value="22"/);
  previous.move('monday-a',0);
  assert.match(previous.get('day-label').textContent,/Monday, Oct 19/);
  assert.equal(boot('2026-10-27T12:00:00',app.storage).get('workout-title').textContent,'Full Body A');
});

test('hip abductor uses its own outward-motion guide and outer-glute description',()=>{
  const markup=boot('2026-10-24T12:00:00').get('workout-list').innerHTML;
  assert.ok(markup.includes('data-layout="standalone"><img src="images/hip-abduction-steps.png"'));
  assert.match(markup,/pads on the outside of the thighs/);
  assert.match(markup,/Push your knees outward/);
  assert.match(markup,/upper outer glutes/);
  const image=markup.match(/<img src="images\/hip-abduction-steps.png"[^>]+>/)[0];
  assert.match(image,/style=""/);
});
