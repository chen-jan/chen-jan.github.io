const {test} = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const zlib = require('node:zlib');
const path = require('node:path');
const source = fs.readFileSync(path.join(__dirname, '..', '..', 'assets', 'minimal.js'), 'utf8');

function page({reduced = false} = {}) {
  const document = {activeElement:null, documentElement:{classList:{add(){}}, style:{}}};
  const media = new Map();
  const animations = [];
  const panels = {};
  for (const id of ['research','experience','building','scholarships','music']) {
    panels[id] = {
      id, hidden:true, inert:false, style:{}, scrolls:[], rendered:null,
      contains(element) { return element?.panel === id; },
      getBoundingClientRect() { return {height:this.hidden ? 0 : parseFloat(this.rendered?.height || '240')}; },
      scrollIntoView(options) { this.scrolls.push(options); },
      animate(frames, options) {
        let resolve, reject;
        const finished = new Promise((a,b) => { resolve=a; reject=b; });
        const animation = {frames, options, finished,
          cancel:() => { this.rendered=null; reject(new Error('cancelled')); },
          finish:() => { this.rendered=null; resolve(); }
        };
        animations.push(animation);
        return animation;
      }
    };
  }
  const triggers = [...Object.keys(panels), 'research'].map((id,i) => ({
    dataset:{panel:id}, attrs:{'aria-expanded':'false'},
    getAttribute(key) {return this.attrs[key];},
    setAttribute(key,value) {this.attrs[key]=value;},
    addEventListener(event,fn) {this[event]=fn;},
    closest() {return i===5 ? {} : null;},
    focus() {document.activeElement=this;}
  }));
  const toggle = {attrs:{}, setAttribute(k,v){this.attrs[k]=v;},addEventListener(e,f){this[e]=f;}};
  document.querySelectorAll = () => triggers;
  document.getElementById = id => id==='theme-toggle' ? toggle : panels[id];
  const windowListeners = [];
  vm.runInNewContext(source, {
    document, URLSearchParams, location:{search:'',hash:''},
    getComputedStyle(panel) {return panel.rendered || {marginTop:'17px',marginBottom:'28px',opacity:'1'};},
    localStorage:{getItem(){return null;},setItem(){}},
    window:{
      addEventListener(name) {windowListeners.push(name);},
      matchMedia(query) {
        const value={matches:query.includes('reduce')&&reduced, addEventListener(_,fn){this.change=fn;}};
        media.set(query,value);return value;
      }
    }
  });
  return {document, panels, triggers, toggle, animations, media, windowListeners};
}

test('rapid reversal continues from the visible frame and keeps all triggers in sync', async () => {
  const p=page();p.triggers[0].click();
  p.panels.research.rendered={height:'108px',marginTop:'7px',marginBottom:'12px',opacity:'.45'};
  p.triggers[0].click();
  assert.equal(p.animations[1].frames[0].height,'108px');
  assert.equal(p.animations[1].frames[0].marginTop,'7px');
  assert.equal(p.triggers[5].attrs['aria-expanded'],'false');
  assert.equal(p.panels.research.inert,true);
  p.animations[1].finish();await Promise.resolve();
  assert.equal(p.panels.research.hidden,true);
  assert.equal(p.panels.research.style.overflow,'');
});

test('the bottom index scrolls after opening, never during a zero-height frame', async () => {
  const p=page();p.triggers[5].click();
  assert.equal(p.panels.research.scrolls.length,0);
  p.animations[0].finish();await Promise.resolve();
  assert.equal(p.panels.research.scrolls.length,1);
  assert.equal(p.panels.research.hidden,false);
});

test('closing restores keyboard focus before making content inert', () => {
  const p=page({reduced:true});p.triggers[0].click();
  p.document.activeElement={panel:'research'};
  p.triggers[0].click();
  assert.equal(p.document.activeElement,p.triggers[0]);
  assert.equal(p.panels.research.inert,true);
  assert.equal(p.panels.research.hidden,true);
});

test('reduced motion opens immediately and settles an animation when enabled mid-flight', () => {
  const p=page({reduced:true});p.triggers[0].click();
  assert.equal(p.animations.length,0);
  assert.equal(p.panels.research.hidden,false);
  const q=page();q.triggers[0].click();
  const preference=q.media.get('(prefers-reduced-motion: reduce)');
  preference.matches=true;preference.change({matches:true});
  assert.equal(q.panels.research.hidden,false);
  assert.equal(q.panels.research.style.overflow,'');
});

test('theme toggling remains available with reduced motion', () => {
  const p=page({reduced:true});p.toggle.click();
  assert.equal(p.document.documentElement.style.colorScheme,'dark');
  assert.equal(p.toggle.attrs['aria-pressed'],'true');
});

test('interaction code stays lightweight and installs no continuous scroll work', () => {
  const p=page();
  assert.ok(zlib.gzipSync(source).length < 2000);
  assert.ok(!p.windowListeners.includes('scroll'));
  assert.ok(!/requestAnimationFrame|setInterval/.test(source));
});
