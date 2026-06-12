import{m as W,c as qt,a as en,f as Bn,h as rt,M as zs,P as Ns}from"./note-map-ClIaVDR2.js";class Os{constructor(t){this.notes=Array.from({length:t},()=>({greenMs:0,scoredMs:0,activeMs:0,sumCents:0,centsMs:0})),this.g={ms:0,sumC:0,sumC2:0,reversals:0,lastC:null,lastDir:0}}record(t,n,s,a,o=null){const i=this.notes[t];if(i&&(i.activeMs+=s,!!a&&(i.scoredMs+=s,n==="green"?i.greenMs+=s:n==="yellow"&&(i.greenMs+=s*.5),o!=null&&Number.isFinite(o)))){i.sumCents+=o*s,i.centsMs+=s;const c=this.g;if(c.ms+=s,c.sumC+=o*s,c.sumC2+=o*o*s,c.lastC!=null){const l=o-c.lastC;if(Math.abs(l)>2){const r=l>0?1:-1;c.lastDir&&r!==c.lastDir&&(c.reversals+=1),c.lastDir=r}}c.lastC=o}}result(){let t=0,n=0,s=0,a=0,o=0;for(const d of this.notes)t+=d.greenMs,n+=d.activeMs,s+=d.sumCents,a+=d.centsMs,d.activeMs>0&&d.greenMs/d.activeMs>=.5&&(o+=1);const i=n>0?t/n:0,c=i>=.85?3:i>=.6?2:i>=.35?1:0,l=this.g;let r=0;if(l.ms>0){const d=l.sumC/l.ms,h=Math.max(0,l.sumC2/l.ms-d*d);r=Math.sqrt(h)}const u=l.ms/1e3,b=u>0?l.reversals/2/u:0,v=b>=3.5&&b<=8.5&&r>=15&&r<=130;return{pct:i,stars:c,notesHit:o,notesTotal:this.notes.length,avgCents:a>0?s/a:0,perNote:this.notes.map(d=>d.activeMs>0?d.greenMs/d.activeMs:0),stability:r,vibrato:{present:v,rateHz:b}}}}const nn={light:{grid:"rgba(27,36,48,.07)",gridC:"rgba(27,36,48,.18)",label:"rgba(27,36,48,.42)",hitLine:"rgba(14,141,127,.6)",note:"rgba(14,141,127,.26)",noteActive:"rgba(14,141,127,.95)",noteGlow:"rgba(14,141,127,.5)",green:"#2fab84",yellow:"#e0a64a",red:"#e0544b",free:"#0e8d7f",glow:0},dark:{grid:"rgba(255,255,255,.055)",gridC:"rgba(255,255,255,.14)",label:"rgba(255,255,255,.45)",hitLine:"rgba(61,229,201,.7)",note:"rgba(61,229,201,.2)",noteActive:"rgba(61,229,201,.95)",noteGlow:"rgba(61,229,201,.85)",green:"#3ee6a8",yellow:"#ffc24d",red:"#ff6b61",free:"#3de5c9",glow:10}};class Vs{constructor(t,n,s={}){this.theme=nn[s.theme]||nn.light,this.canvas=t,this.ctx=t.getContext("2d"),this.ex=n,this.secPerBeat=60/(n.tempo||90),this.greenCents=n.greenCents||20,this.yellowCents=n.yellowCents||40,this.pxPerSec=s.pxPerSec||150,this.hitFrac=s.hitFrac??.26,this.leadIn=s.leadIn??2.2;let a=this.leadIn;this.timed=n.notes.map(i=>{const c=i.beats*this.secPerBeat,l={midi:i.midi,hz:W(i.midi),start:a,end:a+c,dur:c};return a+=c+(i.gap||0)*this.secPerBeat,l}),this.totalTime=a+.6;const o=n.notes.map(i=>i.midi);this.minMidi=Math.min(...o)-3,this.maxMidi=Math.max(...o)+3,this.trail=[]}yFor(t,n){const s=W(this.minMidi),a=W(this.maxMidi),o=Math.max(s,Math.min(a,t)),i=Math.log2(o/s)/Math.log2(a/s);return n-i*n}activeAt(t){for(let n=0;n<this.timed.length;n++)if(t>=this.timed[n].start&&t<this.timed[n].end)return{index:n,seg:this.timed[n]};return null}evaluate(t,n,s){const a=this.activeAt(t);if(!a)return{index:-1,zone:null,voiced:!1};if(!s||!n)return{index:a.index,zone:"red",voiced:!1};const o=Math.abs(qt(n,a.seg.hz));return{index:a.index,zone:en(o,this.greenCents,this.yellowCents),voiced:!0}}draw(t,n,s){const a=this.ctx,o=this.canvas.clientWidth,i=this.canvas.clientHeight,c=o*this.hitFrac;a.clearRect(0,0,o,i);const l=this.theme;for(let p=Math.ceil(this.minMidi);p<=this.maxMidi;p++){const w=this.yFor(W(p),i),k=Bn(p),H=k&&k.startsWith("C");a.strokeStyle=H?l.gridC:l.grid,a.lineWidth=1,a.beginPath(),a.moveTo(0,w),a.lineTo(o,w),a.stroke(),H&&(a.fillStyle=l.label,a.font="10px Inter, sans-serif",a.fillText(k,4,w-3))}a.strokeStyle=l.hitLine,a.lineWidth=2,a.setLineDash([5,6]),a.beginPath(),a.moveTo(c,0),a.lineTo(c,i),a.stroke(),a.setLineDash([]);const r=this.activeAt(t),u=r?r.index:-1,b=16;for(let p=0;p<this.timed.length;p++){const w=this.timed[p],k=c+(w.start-t)*this.pxPerSec,H=w.dur*this.pxPerSec;if(k+H<-20||k>o+20)continue;const R=this.yFor(w.hz,i),g=p===u,S=8;a.fillStyle=g?l.noteActive:l.note,_s(a,k,R-b/2,Math.max(H,10),b,S),a.fill(),g&&(a.shadowColor=l.noteGlow,a.shadowBlur=18+l.glow,a.fill(),a.shadowBlur=0)}let v=null,d="#5e6b7a";if(s&&n)if(v=this.yFor(n,i),r){const p=en(Math.abs(qt(n,r.seg.hz)),this.greenCents,this.yellowCents);d=p==="green"?l.green:p==="yellow"?l.yellow:l.red}else d=l.free;for(this.trail.push(v);this.trail.length>70;)this.trail.shift();const h=this.trail.length,m=2.2;a.strokeStyle=d,a.lineWidth=3,a.lineJoin="round",a.globalAlpha=.45,l.glow&&(a.shadowColor=d,a.shadowBlur=l.glow),a.beginPath();let f=!1;for(let p=0;p<h;p++){const w=this.trail[p];if(w==null){f=!1;continue}const k=c-(h-1-p)*m;f?a.lineTo(k,w):(a.moveTo(k,w),f=!0)}a.stroke(),a.shadowBlur=0;for(let p=0;p<h;p++){const w=this.trail[p];if(w==null)continue;const k=c-(h-1-p)*m;a.globalAlpha=.12+p/h*.5,a.fillStyle=d,a.beginPath(),a.arc(k,w,2,0,Math.PI*2),a.fill()}a.globalAlpha=1,v!=null&&(a.fillStyle=d,a.shadowColor=d,a.shadowBlur=16,a.beginPath(),a.arc(c,v,7,0,Math.PI*2),a.fill(),a.shadowBlur=0)}}function _s(e,t,n,s,a,o){const i=Math.min(o,a/2,s/2);e.beginPath(),e.moveTo(t+i,n),e.arcTo(t+s,n,t+s,n+a,i),e.arcTo(t+s,n+a,t,n+a,i),e.arcTo(t,n+a,t,n,i),e.arcTo(t,n,t+s,n,i),e.closePath()}const js=(()=>{try{return/Mobi|Android|iPhone|iPad|iPod/i.test(navigator.userAgent)||(navigator.maxTouchPoints||0)>1}catch{return!1}})(),Gs=js?2.8:1.8;let An=Gs,kt=null;function ce(e){if(!(!Number.isFinite(e)||e<=0)&&(An=e,kt&&kt.__rtGain))try{kt.__rtGain.gain.setTargetAtTime(e,kt.currentTime,.02)}catch{}}function Cn(e){if(e.__rtMaster)return kt=e,e.__rtMaster;const t=e.createDynamicsCompressor();t.threshold.value=-10,t.knee.value=24,t.ratio.value=4,t.attack.value=.003,t.release.value=.25;const n=e.createGain();return n.gain.value=An,t.connect(n).connect(e.destination),e.__rtMaster=t,e.__rtGain=n,kt=e,t}function dt(e,t,n=.6,s=0,a=.22,o="piano"){const i=e.currentTime+s,c=e.createGain();c.connect(Cn(e));const l=[];let r=n;const u=(b,v,d,h)=>{const m=e.createOscillator(),f=e.createGain();m.type=b,m.frequency.value=v,f.gain.value=d,m.connect(f).connect(h),m.start(i),m.stop(i+r+.08),l.push(m)};if(o==="piano")r=Math.max(1.6,n),c.gain.setValueAtTime(1e-4,i),c.gain.linearRampToValueAtTime(a,i+.008),c.gain.exponentialRampToValueAtTime(1e-4,i+r),[[1,1],[2,.5],[3,.25],[4,.12]].forEach(([b,v])=>u("sine",t*b,v,c));else if(o==="guitar"){r=Math.max(1.3,n);const b=e.createBiquadFilter();b.type="lowpass",b.frequency.setValueAtTime(3800,i),b.frequency.exponentialRampToValueAtTime(700,i+r),b.connect(c),c.gain.setValueAtTime(1e-4,i),c.gain.linearRampToValueAtTime(a,i+.006),c.gain.exponentialRampToValueAtTime(1e-4,i+r),[[1,1],[2,.32]].forEach(([v,d])=>u("sawtooth",t*v,d,b))}else r=Math.max(.2,n),c.gain.setValueAtTime(0,i),c.gain.linearRampToValueAtTime(a,i+.025),c.gain.setValueAtTime(a,i+Math.max(.05,r-.1)),c.gain.linearRampToValueAtTime(0,i+r),u("triangle",t,1,c),u("triangle",t*2,.18,c);return{dur:n,stop(){try{l.forEach(b=>{b.stop(),b.disconnect()}),c.disconnect()}catch{}}}}function sn(e,t,n=0,s=1.4,a=.14,o="piano"){return[0,4,7].forEach(i=>{const c=440*Math.pow(2,(t+i-69)/12);dt(e,c,s,n,a,o)}),s}function Ws(e,t,n,s="piano",a=.22){const o=60/(n||90);let i=0;const c=[];for(const l of t){const r=440*Math.pow(2,(l.midi-69)/12);c.push(dt(e,r,Math.max(.18,l.beats*o*.92),i,a,s)),i+=(l.beats+(l.gap||0))*o}return{dur:i,stop(){c.forEach(l=>l&&l.stop&&l.stop())}}}function Kt(e,t=0,n=!1){const s=e.currentTime+t,a=e.createOscillator(),o=e.createGain();a.frequency.value=n?1600:1050;const i=n?.4:.26;o.gain.setValueAtTime(1e-4,s),o.gain.exponentialRampToValueAtTime(i,s+.005),o.gain.exponentialRampToValueAtTime(1e-4,s+.08),a.connect(o).connect(Cn(e)),a.start(s),a.stop(s+.1)}function Us(e,t,n,s=.05){const a=[0,7,12].map(o=>{const i=440*Math.pow(2,(t+o-69)/12);return dt(e,i,n,0,s,"soft")});return{stop(){try{a.forEach(o=>o.stop())}catch{}}}}function an(e){if(e.__noise)return e.__noise;const t=e.createBuffer(1,Math.floor(e.sampleRate*.5),e.sampleRate),n=t.getChannelData(0);for(let s=0;s<n.length;s++)n[s]=Math.random()*2-1;return e.__noise=t,t}const on={pop:{kick:[0,4],snare:[2,6],hatOpen:[7],bass:[[0,0],[3,0],[4,7]],stab:[3,7],swing:0},funk:{kick:[0,3,6],snare:[2,6],hatOpen:[3,7],bass:[[0,0],[1,7],[4,0],[6,7]],stab:[1,3,5,7],swing:.18},soft:{kick:[0,4],snare:[6],hatOpen:[],bass:[[0,0],[4,7]],stab:[3],swing:0},drive:{kick:[0,2,4,6],snare:[2,6],hatOpen:[],bass:[[0,0],[2,0],[4,7],[6,7]],stab:[4],swing:0},march:{kick:[0,2,4,6],snare:[4],hatOpen:[0,4],bass:[[0,0],[2,7],[4,0],[6,7]],stab:[],swing:0},swing:{kick:[0,4],snare:[2,6],hatOpen:[3,7],bass:[[0,0],[3,5],[4,7],[6,12]],stab:[3,7],swing:.34},ballad:{kick:[0],snare:[4],hatOpen:[],bass:[[0,0],[4,7]],stab:[2,6],swing:0},latin:{kick:[0,3,6],snare:[2,7],hatOpen:[5],bass:[[0,0],[3,7],[6,5]],stab:[2,5],swing:0}};function Ys(e,{rootMidi:t=60,tempo:n=100,dur:s=16,style:a="pop",gain:o=.5,when:i=0}={}){const c=on[a]||on.pop,l=e.currentTime+i,r=60/n,u=r/2,b=r*4,v=Math.ceil(s/b)+1,d=e.createGain();d.gain.value=o;const h=e.createDynamicsCompressor();h.threshold.value=-12,h.ratio.value=4,d.connect(h).connect(e.destination);const m=[],f=g=>{const S=e.createOscillator(),E=e.createGain();S.frequency.setValueAtTime(150,g),S.frequency.exponentialRampToValueAtTime(48,g+.12),E.gain.setValueAtTime(.9,g),E.gain.exponentialRampToValueAtTime(.001,g+.18),S.connect(E).connect(d),S.start(g),S.stop(g+.2),m.push(S)},p=g=>{const S=e.createBufferSource();S.buffer=an(e);const E=e.createBiquadFilter();E.type="bandpass",E.frequency.value=1800,E.Q.value=.7;const $=e.createGain();$.gain.setValueAtTime(.5,g),$.gain.exponentialRampToValueAtTime(.001,g+.14),S.connect(E).connect($).connect(d),S.start(g),S.stop(g+.16),m.push(S)},w=(g,S)=>{const E=e.createBufferSource();E.buffer=an(e);const $=e.createBiquadFilter();$.type="highpass",$.frequency.value=7e3;const M=e.createGain(),I=S?.12:.035;M.gain.setValueAtTime(.22,g),M.gain.exponentialRampToValueAtTime(.001,g+I),E.connect($).connect(M).connect(d),E.start(g),E.stop(g+I+.02),m.push(E)},k=(g,S,E)=>{const $=e.createOscillator(),M=e.createGain();$.type="triangle",$.frequency.value=W(S),M.gain.setValueAtTime(1e-4,g),M.gain.linearRampToValueAtTime(.4,g+.01),M.gain.setValueAtTime(.4,g+E*.5),M.gain.exponentialRampToValueAtTime(.001,g+E),$.connect(M).connect(d),$.start(g),$.stop(g+E+.02),m.push($)},H=g=>{[t,t+7,t+12].forEach(S=>{const E=e.createOscillator(),$=e.createGain();E.type="triangle",E.frequency.value=W(S),$.gain.setValueAtTime(1e-4,g),$.gain.linearRampToValueAtTime(.09,g+.008),$.gain.exponentialRampToValueAtTime(.001,g+.17),E.connect($).connect(d),E.start(g),E.stop(g+.2),m.push(E)})},R=t-12;for(let g=0;g<v;g++){const S=l+g*b,E=$=>S+$*u+($%2?c.swing*u:0);c.kick.forEach($=>f(E($))),c.snare.forEach($=>p(E($)));for(let $=0;$<8;$++)w(E($),c.hatOpen.includes($));c.bass.forEach(([$,M])=>k(E($),R+M,u*1.6)),c.stab.forEach($=>H(E($)))}return{duck(g){const S=g?o*.25:o;try{d.gain.setTargetAtTime(S,e.currentTime,.04)}catch{}},stop(){try{m.forEach(g=>{try{g.stop()}catch{}g.disconnect&&g.disconnect()}),d.disconnect(),h.disconnect()}catch{}}}}const Te="raspevka.clock.v1";function Hn(){try{return Number(localStorage.getItem(Te))||0}catch{return 0}}function bt(){return Date.now()+Hn()}function Rn(){return new Date(bt())}function lt(e=Rn()){return e.toISOString().slice(0,10)}function qn(){return Math.round(Hn()/864e5)}function Ks(e){try{localStorage.setItem(Te,String(Math.round(e)*864e5))}catch{}}function be(e){Ks(qn()+e)}function fe(){try{localStorage.removeItem(Te)}catch{}}const Se="raspevka.progress.v1";function x(){try{return JSON.parse(localStorage.getItem(Se))||{}}catch{return{}}}function P(e){try{localStorage.setItem(Se,JSON.stringify(e))}catch{}}function Pn(){try{localStorage.removeItem(Se)}catch{}}function Js(){const e=x();return e.range&&Number.isFinite(e.range.low)?e.range:null}function Fn(e){const t=x(),n=lt(),s=lt(new Date(bt()-864e5)),a=lt(new Date(bt()-2*864e5));let o=!1;return t.lastDate!==n?(t.lastDate===s?t.streak=(t.streak||0)+1:t.lastDate===a&&(t.freezes||0)>0?(t.freezes-=1,o=!0,t.streak=(t.streak||0)+1):t.streak=1,t.lastDate=n,t.streak>0&&t.streak%7===0&&(t.freezes=Math.min(2,(t.freezes||0)+1))):t.streak||(t.streak=1),t.history=t.history||[],t.history.push({date:n,pct:e.pct,stars:e.stars}),t.history.length>200&&(t.history=t.history.slice(-200)),t.total=(t.total||0)+1,P(t),{streak:t.streak,total:t.total,freezeSpent:o}}function le(){return x().streak||0}function Jt(){return x().freezes||0}function Xs(e){const t=x();return t.freezes=Math.max(0,Math.min(2,Math.round(e))),P(t),t.freezes}function Qs(){const e=lt();return(x().history||[]).some(t=>t.date===e)}function pe(e){const t=x();return t.streak=Math.max(0,Math.round(e)),t.lastDate=lt(),P(t),t.streak}function Zs(){return x().history||[]}function ta(){return x().rangeHistory||[]}function ea(){return x().total||0}function na(e){const t=x();return t.leads=t.leads||[],t.leads.push({ts:bt(),...e}),t.leads.length>50&&(t.leads=t.leads.slice(-50)),P(t),t.leads}function Dt(){return x().examsPassed||[]}function sa(e){const t=x();return t.examsPassed=t.examsPassed||[],t.examsPassed.includes(e)||(t.examsPassed.push(e),P(t)),t.examsPassed}function aa(e){return(x().blockItems||{})[e]||[]}function cn(e,t){const n=x();n.blockItems=n.blockItems||{};const s=n.blockItems[e]||[];return s.includes(t)||(s.push(t),n.blockItems[e]=s,P(n)),s}function Y(){return x().modeKey||"ionian"}function Dn(e){const t=x();return t.modeKey=e,P(t),e}function xt(){return x().tier||"free"}function jt(e){const t=x();return t.tier=e,P(t),e}const Mt=5,ia=25;function Pt(){return Mt}function ft(){const e=x();let t=e.energy==null?Mt:e.energy;if(t<Mt&&e.energyTs){const n=Math.floor((bt()-e.energyTs)/(ia*6e4));n>0&&(t=Math.min(Mt,t+n))}return t}function Gt(e){const t=x(),n=Math.max(0,Math.min(Mt,Math.round(e)));return t.energy=n,t.energyTs=n<Mt?bt():null,P(t),n}function $e(e){return Gt(ft()+e)}function Ie(){return x().groove||"off"}function zn(e){const t=x();return t.groove=e,P(t),e}function oa(e){const t=x();if(!t.range||!Number.isFinite(t.range.low))return{extended:null};let n=null;return e>t.range.high?(t.range.high=e,n="high"):e<t.range.low&&(t.range.low=e,n="low"),n&&(t.rangeHistory=t.rangeHistory||[],t.rangeHistory.push({date:lt(),low:t.range.low,high:t.range.high}),t.rangeHistory.length>100&&(t.rangeHistory=t.rangeHistory.slice(-100)),P(t)),{extended:n,midi:e}}function st(){const e=x();return e.voice&&e.voice.key?e.voice:null}function ln(e,t=null,n=null){const s=x(),a=s.voice||{};return s.voice={key:e,low:t??a.low??null,high:n??a.high??null},t!=null&&n!=null&&(s.range={low:Math.round(t),high:Math.round(n)},s.rangeHistory=s.rangeHistory||[],s.rangeHistory.push({date:lt(),low:Math.round(t),high:Math.round(n)}),s.rangeHistory.length>100&&(s.rangeHistory=s.rangeHistory.slice(-100))),P(s),s.voice}const ca={easy:.6,medium:.8,fast:1};function Be(){return x().difficulty||"easy"}function Nn(e){const t=x();return t.difficulty=e,P(t),e}function la(){return ca[Be()]||.6}function Lt(){return x().guide!==!1}function On(e){const t=x();return t.guide=!!e,P(t),t.guide}function pt(){return x().headphones===!0}function Vn(e){const t=x();return t.headphones=!!e,P(t),t.headphones}function ra(){return Lt()?pt()?"continuous":"prehear":"off"}function gt(){const e=x().timbre;return e==="guitar"||e==="soft"?e:"piano"}function _n(e){const t=x();return t.timbre=e,P(t),t.timbre}function jn(){try{const e=navigator.userAgent||"";return/Mobi|Android|iPhone|iPad|iPod/i.test(e)||(navigator.maxTouchPoints||0)>1}catch{return!1}}const Ae={quiet:1,normal:1.8,loud:2.8,max:4.2};function da(){return jn()?"loud":"normal"}function re(){const e=x().volume;return Ae[e]?e:da()}function de(){return Ae[re()]}function Gn(e){const t=x();return Ae[e]&&(t.volume=e,P(t)),re()}const Ce={speaker:.09,wired:.12,bt:.24};function ua(){return"speaker"}function ue(){const e=x().route;return Ce[e]?e:ua()}function ma(e){const t=x();return Ce[e]&&(t.route=e,delete t.latencyManual,P(t)),ue()}function He(){const e=x().latencyManual;return Number.isFinite(e)?e:Ce[ue()]}function rn(e){const t=x();return t.latencyManual=Math.max(0,Math.min(.5,e)),P(t),t.latencyManual}function Ct(){return x().darkStage===!0}function ha(e){const t=x();return t.darkStage=!!e,P(t),t.darkStage}function At(){return x().micAGC===!0}function va(e){const t=x();return t.micAGC=!!e,P(t),t.micAGC}const Wn={low:1.5,med:3,high:5.5};function ba(){return jn()?"high":"med"}function Re(){const e=x().sensitivity;return Wn[e]?e:ba()}function qe(){return Wn[Re()]}function Un(e){const t=x();return t.sensitivity=e,P(t),e}function Yn(){return x().breathBest||0}function fa(e){const t=x();return t.breathBest=Math.max(t.breathBest||0,e),P(t),t.breathBest}const Pe=5,pa=7;function Xt(){return x().paywallEnabled===!0}function ge(e){const t=x();return t.paywallEnabled=!!e,P(t),t.paywallEnabled}function Kn(){const e=x();return e.trialStart||(e.trialStart=bt(),P(e)),e.trialStart}function Fe(){const e=x().trialStart;if(!e)return null;const t=pa-Math.floor((bt()-e)/864e5);return Math.max(0,t)}function ga(){const e=Fe();return e!=null&&e>0}function ya(){const e=x();delete e.trialStart,P(e)}function wa(){return xt()!=="free"||ga()}function Jn(){const e=x();return e.uses&&e.uses.date===lt()?e.uses.count:0}function Xn(){const e=x(),t=lt();return e.uses=e.uses&&e.uses.date===t?{date:t,count:e.uses.count+1}:{date:t,count:1},P(e),e.uses.count}function Ea(){return!Xt()||wa()?!1:Jn()>=Pe}function $a(){return x().devMode===!0}function Qt(e){const t=x();return t.devMode=!!e,P(t),t.devMode}function ka(e){const t=x();return t.examsPassed=e.slice(),P(t),t.examsPassed}function xa(){const e=x();delete e.examsPassed,delete e.blockItems,P(e)}const Zt="raspevka.analytics.v1",dn=500;function Ma(e,t={}){try{const n=JSON.parse(localStorage.getItem(Zt)||"[]");n.push({t:Date.now(),type:e,...t}),n.length>dn&&n.splice(0,n.length-dn),localStorage.setItem(Zt,JSON.stringify(n))}catch{}}function La(){try{return JSON.parse(localStorage.getItem(Zt)||"[]")}catch{return[]}}function Ta(){try{localStorage.removeItem(Zt)}catch{}}function Sa(){const e=La(),t=e.filter(a=>a.type==="exercise_done"),n={};for(const a of t)(n[a.id||"—"]=n[a.id||"—"]||[]).push(a.pct||0);const s=Object.entries(n).map(([a,o])=>({id:a,runs:o.length,avgPct:Math.round(o.reduce((i,c)=>i+c,0)/o.length)})).sort((a,o)=>o.runs-a.runs);return{total:e.length,sessions:t.length,perEx:s}}const te=[{key:"ionian",name:"Ионийский (мажор)",intervals:[0,2,4,5,7,9,11],tier:"free"},{key:"aeolian",name:"Эолийский (минор)",intervals:[0,2,3,5,7,8,10],tier:"standard"},{key:"dorian",name:"Дорийский",intervals:[0,2,3,5,7,9,10],tier:"pro"},{key:"phrygian",name:"Фригийский",intervals:[0,1,3,5,7,8,10],tier:"pro"},{key:"lydian",name:"Лидийский",intervals:[0,2,4,6,7,9,11],tier:"pro"},{key:"mixolydian",name:"Миксолидийский",intervals:[0,2,4,5,7,9,10],tier:"pro"},{key:"locrian",name:"Локрийский",intervals:[0,1,3,5,6,8,10],tier:"pro"},{key:"harm_major",name:"Гармонический мажор",intervals:[0,2,4,5,7,8,11],tier:"pro"},{key:"harm_minor",name:"Гармонический минор",intervals:[0,2,3,5,7,8,11],tier:"pro"}],un={free:0,standard:1,pro:2};function De(e){return te.find(t=>t.key===e)||te[0]}function Qn(e,t="free"){const n=De(e);return un[n.tier]<=un[t||"free"]}function Ia(e,t){const n=t.intervals,s=Math.round(e)-1,a=Math.floor(s/7),o=(s%7+7)%7;return n[o]+12*a}function yt(e,t){const n=De(t);return e.map(s=>Ia(s,n))}const Ba="#0e8d7f",Aa="#0a766a",Ca="#687485",Ha="#ffffff",mn="#2a3340",Ra="#cfd6e0",qa=[0,2,4,5,7,9,11],hn=e=>qa.includes((e%12+12)%12),Pa=e=>`C${Math.floor(e/12)-1}`;function Zn(e,t){if(e==null||t==null)return"";let n=Math.round(e)-2,s=Math.round(t)+2;for(;(n%12+12)%12!==0;)n--;for(;(s%12+12)%12!==11;)s++;const a=13,o=54,i=9,c=33,l=d=>d>=e&&d<=t,r=[];for(let d=n;d<=s;d++)hn(d)&&r.push(d);const u=r.length*a,b={};r.forEach((d,h)=>{b[d]=h*a});let v="";r.forEach((d,h)=>{const m=h*a;v+=`<rect x="${m}" y="0" width="${a-1}" height="${o}" rx="2.5" fill="${l(d)?Ba:Ha}" stroke="${Ra}" stroke-width="1"/>`,(d%12+12)%12===0&&(v+=`<text x="${m+(a-1)/2}" y="${o+11}" text-anchor="middle" fill="${Ca}" font-size="8">${Pa(d)}</text>`)});for(let d=n;d<=s;d++){if(hn(d))continue;const h=b[d-1];if(h==null)continue;const m=h+a-i/2;v+=`<rect x="${m}" y="0" width="${i}" height="${c}" rx="2" fill="${l(d)?Aa:mn}" stroke="${mn}" stroke-width="1"/>`}return`
    <div class="mini-kb">
      <svg viewBox="0 0 ${u} ${o+14}" preserveAspectRatio="xMidYMid meet" role="img" aria-label="Диапазон голоса на клавиатуре">
        ${v}
      </svg>
    </div>`}function ke(e){if(!Array.isArray(e)||!e.length)return'<span class="ex-glyph"></span>';const t=e.map(m=>typeof m=="number"?{midi:m,beats:1,gap:0}:{midi:m.midi,beats:m.beats||1,gap:m.gap||0}),n=t.map(m=>m.midi),s=Math.min(...n),a=Math.max(...n),o=Math.max(1,a-s)+1,i=t.reduce((m,f)=>m+f.beats+f.gap,0),c=Math.max(5,Math.min(16,150/i)),l=10,r=1.6,u=l-4;let b=0,v="";for(const m of t){const f=Math.max(3,m.beats*c-r),p=(a-m.midi)*l+2,w=m.midi===a?' class="gh-hi"':"";v+=`<rect${w} x="${b.toFixed(1)}" y="${p}" width="${f.toFixed(1)}" height="${u}" rx="2"/>`,b+=(m.beats+m.gap)*c}const d=b,h=o*l;return`<span class="ex-glyph"><svg viewBox="0 0 ${d.toFixed(0)} ${h}" preserveAspectRatio="xMidYMid meet" role="img" aria-label="Рисунок мелодии упражнения">${v}</svg></span>`}const vn=["#0e8d7f","#12a36b","#e0a64a","#5b8def","#e0544b","#9b6dd6"];function zt(e=1){if(window.matchMedia&&window.matchMedia("(prefers-reduced-motion: reduce)").matches)return;const t=e>=2?36:18,n=document.createElement("div");n.setAttribute("aria-hidden","true"),n.style.cssText="position:fixed;inset:0;pointer-events:none;z-index:999;overflow:hidden",document.body.appendChild(n);const s=window.innerWidth;for(let a=0;a<t;a++){const o=document.createElement("i"),i=5+Math.random()*6,c=Math.random()<.4;o.style.cssText=`position:absolute;top:-12px;left:${Math.random()*s}px;width:${i}px;height:${c?i:i*.45}px;background:${vn[a%vn.length]};border-radius:${c?"50%":"2px"};will-change:transform,opacity`,n.appendChild(o);const l=320+Math.random()*380,r=(Math.random()-.5)*160,u=1100+Math.random()*900;o.animate([{transform:"translate(0,0) rotate(0deg)",opacity:1},{transform:`translate(${r}px,${l}px) rotate(${(Math.random()-.5)*540}deg)`,opacity:0}],{duration:u,delay:Math.random()*250,easing:"cubic-bezier(.2,.6,.35,1)",fill:"forwards"})}setTimeout(()=>n.remove(),2600)}function ee(e=12){try{navigator.vibrate&&navigator.vibrate(e)}catch{}}let ts=!1;function ct(e,t,n,s,a={}){const{onExit:o,onAgain:i,onComplete:c,onResult:l,onNext:r,nextLabel:u,explain:b}=a;if(ce(de()),b){xe(e,s,{onExit:o,onStart:()=>ct(e,t,n,s,{...a,explain:!1}),onModeChange:a.rebuild?()=>ct(e,t,n,a.rebuild(),{...a,explain:!0}):null});return}const v=a.reps,d=a.repIndex||0,h=v&&v.length&&v[d]||0,m=s.root!=null?s.root:s.notes[0].midi,f=h?{...s,root:m+h,notes:s.notes.map(L=>({...L,midi:L.midi+h}))}:s,p=v&&v.length>1?` · ${d+1}/${v.length}`:"";e.innerHTML=`
    <div class="screen game ${Ct()?"stage-dark":""}">
      <div class="game-top">
        <button class="icon-btn" id="exit">‹ Меню</button>
        <div class="ex-name">${f.name} · <span class="syl">«${f.syllable}»</span>${p}</div>
      </div>
      <div class="trace-wrap"><canvas class="trace" id="hw"></canvas></div>
      <div class="hud">
        <div class="hud-msg" id="msg">Слушай эталон…</div>
        <div class="hud-meter"><i id="livebar"></i></div>
        <div class="hud-notes">
          <span>цель: <b id="target">—</b></span>
          <span>ты: <b id="yours">—</b></span>
        </div>
        <div class="cue" id="cue"></div>
      </div>
      <details class="game-settings" id="gsettings">
        <summary>Темп и подсказка тоном</summary>
        ${Wt()}
      </details>
    </div>
  `;const w=document.getElementById("hw"),k=w.getContext("2d"),H=document.getElementById("msg"),R=document.getElementById("livebar"),g=document.getElementById("target"),S=document.getElementById("yours"),E=document.getElementById("cue");function $(){const L=Math.min(window.devicePixelRatio||1,2);w.width=w.clientWidth*L,w.height=w.clientHeight*L,k.setTransform(L,0,0,L,0,0)}$(),window.addEventListener("resize",$);const M=la(),I={...f,tempo:Math.max(40,Math.round(f.tempo*M))},T=new Vs(w,I,{theme:Ct()?"dark":"light"}),A=new Os(f.notes.length),y=He(),C=pt()||ue()!=="speaker";let q=null,V=null,F=0,Z=0,tt=!1,mt=!1,Ot=0,je=-1;const wt=[],he=[],St=(L,N)=>{const _=setTimeout(L,N);return he.push(_),_};function Ge(){wt.forEach(L=>L&&L.stop&&L.stop()),wt.length=0}function ve(){V&&(cancelAnimationFrame(V),V=null),he.forEach(clearTimeout),he.length=0,window.removeEventListener("resize",$),document.removeEventListener("visibilitychange",We),Ge()}function We(){document.hidden?(V&&(cancelAnimationFrame(V),V=null),Ge(),F&&!tt&&(tt=!0,mt=!0)):mt&&(mt=!1,Ue())}document.addEventListener("visibilitychange",We),document.getElementById("exit").addEventListener("click",()=>{ve(),o()});function Ue(){ve(),ct(e,t,n,s,{...a,explain:!1})}Ut(document.getElementById("gsettings"),Ue,t);const Vt=f.root!=null?f.root:f.notes[0].midi,It=gt();T.draw(0,null,!1);function Ps(L){E.innerHTML='<button class="btn btn-ghost btn-skip" id="skipref">Пропустить образец →</button>',document.getElementById("skipref").addEventListener("click",L)}function Ye(){E.innerHTML=""}d===0?(H.textContent="Слушай тонику…",sn(t.ctx,Vt,0,1.4,.14,It),St(()=>{H.textContent="Образец…";const L=Ws(t.ctx,I.notes,I.tempo,It),N=St(()=>{Ye(),Ke()},L.dur*1e3+250);Ps(()=>{clearTimeout(N),L.stop(),Ye(),Ke()})},1650)):(H.textContent=(h>0?"↑ выше":"↓ ниже")+` · повтор ${d+1}/${v.length}`,sn(t.ctx,Vt,0,.8,.14,It),St(()=>{Kt(t.ctx,0,!0),St(Je,480)},950));function Ke(){let L=3;const N=()=>{L>0?(Kt(t.ctx),H.textContent="Приготовься… "+L,L-=1,St(N,600)):Je()};N()}function Je(){const L=ra();H.textContent=L==="continuous"?"Пой за подсказкой!":L==="prehear"?"Слушай тон и повторяй!":"Пой!",n.reset(),F=performance.now(),Z=F,Ot=F,L==="continuous"?T.timed.forEach(G=>{wt.push(dt(t.ctx,G.hz,Math.max(.2,G.dur*.92),G.start,.1,It))}):L==="prehear"&&T.timed.forEach(G=>{const U=Math.min(.4,G.dur);wt.push(dt(t.ctx,G.hz,U,Math.max(0,G.start-U),.18,It))}),f.drone&&wt.push(Us(t.ctx,Vt,T.totalTime+.5,.05));const N=Ie(),_=N==="auto"?f.grooveStyle||"pop":N;_!=="off"&&(q=Ys(t.ctx,{rootMidi:Vt,tempo:I.tempo,dur:T.totalTime,style:_,gain:.45}),wt.push(q)),Xe()}function Xe(){const L=performance.now(),N=(L-F)/1e3,_=L-Z;Z=L;const G=t.read();let U=!1,et=null;if(G){const ht=n.process(G);U=ht.voiced&&t.rms()>.0025,et=ht.smoothedHz}q&&!C&&q.duck(U);const nt=T.evaluate(N-y,U?et:null,U);if(nt.index>=0){let ht=null;nt.voiced&&et&&T.timed[nt.index]&&(ht=qt(et,T.timed[nt.index].hz)),A.record(nt.index,nt.zone,_,nt.voiced,ht),nt.zone==="green"&&nt.voiced&&nt.index!==je&&(ee(12),je=nt.index)}T.draw(N,U?et:null,U);const Et=T.activeAt(N);if(g.textContent=Et?Fa(Et.seg.midi):"—",U&&et){Ot=L;const ht=rt(et);S.textContent=ht?ht.name:"—";const Ds=nt.zone==="green"?"var(--green)":nt.zone==="yellow"?"var(--yellow)":"var(--coral)";if(S.style.color=Et?Ds:"var(--text)",R.style.width=Math.min(100,t.rms()*350)+"%",Et){const tn=qt(et,Et.seg.hz);Math.abs(tn)<=20?(E.textContent="в точку",E.style.color="var(--green)"):tn<0?(E.textContent="↑ выше",E.style.color="var(--amber)"):(E.textContent="↓ ниже",E.style.color="var(--amber)")}else E.textContent=""}else S.textContent="—",S.style.color="var(--text-dim)",R.style.width="0%",Et&&L-Ot>5e3?(E.textContent="не слышу голос — спой громче",E.style.color="var(--coral)"):E.textContent="";N<T.totalTime?V=requestAnimationFrame(Xe):tt||(tt=!0,Fs())}function Fs(){const L=A.result();ve();const N=a._acc||[];if(N.push(L),v&&v.length>1&&d<v.length-1){ct(e,t,n,s,{...a,repIndex:d+1,_acc:N});return}const _=N.reduce((U,et)=>U+(et.pct||0),0)/N.length,G={pct:_,stars:_>=.85?3:_>=.6?2:_>=.35?1:0,notesHit:L.notesHit,notesTotal:L.notesTotal,avgCents:L.avgCents,perNote:L.perNote,stability:L.stability,vibrato:L.vibrato,repsDone:N.length};if(Ma("exercise_done",{id:s.id,pct:Math.round(_*100),stability:Math.round(L.stability||0),reps:N.length}),l&&l(G),c){c(G);return}if(_>=.5&&Fn({pct:_,stars:G.stars}),_<.4){if(ft()>0){$e(-1),Ze(G);return}}else _>=.5&&$e(_>=.8?2:1);Qe(G)}function Qe(L){L.stars>=2&&(zt(L.stars>=3?2:1),ee(L.stars>=3?30:15));const N="★".repeat(L.stars)+"☆".repeat(3-L.stars),_=Math.round(L.pct*100),G=L.stars>=3?"Отлично!":L.stars===2?"Хорошо!":L.stars===1?"Неплохо":"Ещё разок",U=fn(L,s);e.innerHTML=`
      <div class="screen summary">
        <div class="stars">${N}</div>
        <div class="verdict">${G}</div>
        <div class="big-pct">${_}<span>%</span></div>
        <p class="hint">средняя точность${L.repsDone>1?` за ${L.repsDone} повтор${L.repsDone<5?"а":"ов"}`:""}</p>
        ${bn(ft(),Pt())}
        ${za(L)}
        <div class="card tip-card"><p class="how"><b>Разбор.</b> ${U}</p></div>
        ${Wt()}
        ${r?`<button class="btn btn-primary" id="next" style="width:100%">${u||"Дальше"} →</button>`:""}
        <div class="row">
          <button class="btn btn-ghost" id="menu">Меню</button>
          <button class="btn ${r?"btn-ghost":"btn-primary"}" id="again">Ещё раз</button>
        </div>
      </div>
    `,Ut(e,()=>Qe(L),t),document.getElementById("again").addEventListener("click",i),document.getElementById("menu").addEventListener("click",o);const et=document.getElementById("next");et&&et.addEventListener("click",r)}function Ze(L){const N=Math.round(L.pct*100),_=fn(L,s);e.innerHTML=`
      <div class="screen summary">
        <div class="verdict" style="color:var(--coral)">Сложновато — попробуем ещё</div>
        <div class="big-pct" style="color:var(--coral)">${N}<span>%</span></div>
        ${bn(ft(),Pt())}
        <div class="card tip-card"><p class="how"><b>Подсказка.</b> ${_}</p></div>
        <p class="hint">Энергия −1 (восстанавливается со временем). Сбавь темп или включи «подсказку тоном» — станет легче.</p>
        ${Wt()}
        <div class="row">
          <button class="btn btn-ghost" id="menu">Меню</button>
          <button class="btn btn-primary" id="again">Пройти заново</button>
        </div>
        ${r?`<button class="btn btn-ghost" id="next" style="width:100%">${u||"Дальше"} →</button>`:""}
      </div>`;const G=()=>ct(e,t,n,s,{...a,explain:!1,repIndex:0,_acc:void 0});Ut(e,()=>Ze(L),t),document.getElementById("menu").addEventListener("click",o),document.getElementById("again").addEventListener("click",G);const U=document.getElementById("next");U&&U.addEventListener("click",r)}}function Fa(e){const t=rt(440*Math.pow(2,(e-69)/12));return t?t.name:""}function Da(){return'<svg viewBox="0 0 24 24" width="15" height="15" fill="currentColor"><path d="M13 2 4 14h6l-1 8 9-12h-6z"/></svg>'}function bn(e,t){const n=Array.from({length:t},(s,a)=>`<span class="en-pip ${a<e?"on":""}"></span>`).join("");return`<div class="energy-row"><span class="en-ic">${Da()}</span><div class="energy-pips">${n}</div></div>`}function za(e){if(e.stability==null)return"";const t=e.stability,n=t<15?"ровно":t<30?"почти ровно":"дрожит",s=t<15?"var(--green)":t<30?"var(--amber)":"var(--coral)",o=e.vibrato&&e.vibrato.present?`есть · ${e.vibrato.rateHz.toFixed(1)} Гц`:"нет";return`<div class="stat-chips">
    <span class="stat-chip">ровность: <b style="color:${s}">${n}</b></span>
    <span class="stat-chip">вибрато: <b>${o}</b></span>
  </div>`}function Na(e){if(e.modeKey===void 0)return"";const t=Y(),n=xt();return`<div class="settings" style="margin-bottom:8px">
      <div class="seg-label">Лад распевки</div>
      <select id="modeSel" class="lad-select">${te.map(a=>{const o=!Qn(a.key,n);return`<option value="${a.key}" ${a.key===t?"selected":""} ${o?"disabled":""}>${a.name}${o?" 🔒":""}</option>`}).join("")}</select>
    </div>`}function xe(e,t,{onExit:n,onStart:s,onModeChange:a}){e.innerHTML=`
    <div class="screen breathe-intro">
      <div class="game-top"><button class="icon-btn" id="back">‹ Меню</button></div>
      <div class="brand"><h1>${t.name}</h1>
        <p>Слог: <b>«${t.syllable}»</b></p></div>
      <div class="card">
        ${t.desc?`<p class="blurb">${t.desc}</p>`:""}
        ${t.how?`<p class="how"><b>Как делать.</b> ${t.how}</p>`:""}
        <div class="ex-glyph preview-contour" title="Форма распевки: выше плашка — выше нота, длиннее — дольше">${ke(t.notes)}</div>
        <p class="how mech"><b>Как устроена игра.</b> Ноты едут к вертикальной линии слева. Пой так, чтобы твой светящийся шарик совпал с нотой по высоте: <b style="color:var(--green)">зелёный</b> — точно, <b style="color:var(--amber)">жёлтый</b> — почти, <b style="color:var(--coral)">красный</b> — мимо. Сначала прозвучит <b>аккорд тоники</b> и образец мелодии — это твоя опора, чтобы попасть. «Подсказка тоном» подыгрывает нужную ноту (без наушников — коротко перед тем, как её петь).</p>
      </div>
      ${Na(t)}
      ${Wt()}
      <button class="btn btn-primary" id="go" style="width:100%">Начать</button>
    </div>
  `,document.getElementById("back").addEventListener("click",n),document.getElementById("go").addEventListener("click",s),Ut(e,()=>xe(e,t,{onExit:n,onStart:s,onModeChange:a}));const o=document.getElementById("modeSel");o&&o.addEventListener("change",()=>{Dn(o.value),a?a():xe(e,t,{onExit:n,onStart:s,onModeChange:a})})}function Wt(){const e=Be(),t=Lt(),n=pt(),s=gt(),a=(u,b)=>`<button data-diff="${u}" class="${e===u?"on":""}">${b}</button>`,o=(u,b)=>`<button data-timbre="${u}" class="${s===u?"on":""}">${b}</button>`,i=Ie(),c=(u,b)=>`<button data-groove="${u}" class="${i===u?"on":""}">${b}</button>`,l=re(),r=(u,b)=>`<button data-vol="${u}" class="${l===u?"on":""}">${b}</button>`;return`
    <div class="settings inline-settings">
      <div class="seg-label">Громкость подсказки</div>
      <div class="seg">${r("quiet","Тихо")}${r("normal","Норм")}${r("loud","Громко")}${r("max","Макс")}</div>
      <div class="seg-label">Темп</div>
      <div class="seg">${a("easy","Медл.")}${a("medium","Средне")}${a("fast","Быстро")}</div>
      <div class="toggle-row">
        <button class="toggle ${t?"on":""}" data-guidetoggle="1">Подсказка тоном: ${t?"вкл":"выкл"}</button>
      </div>
      <details class="more-settings" ${ts?"open":""}>
        <summary>Ещё настройки звука: тембр, грув, наушники</summary>
        <div class="seg-label">Звук подсказки</div>
        <div class="seg">${o("piano","Пиано")}${o("guitar","Гитара")}${o("soft","Мягкий")}</div>
        <div class="seg-label">Грув (ритм-подложка · лучше в наушниках)</div>
        <div class="seg">${c("off","Выкл")}${c("auto","Авто")}${c("pop","Поп")}${c("funk","Фанк")}${c("soft","Мягкий")}</div>
        <div class="toggle-row">
          <button class="toggle ${n?"on":""}" data-hptoggle="1">Наушники: ${n?"да":"нет"}</button>
        </div>
      </details>
    </div>
  `}function Ut(e,t,n){e.querySelectorAll("[data-diff]").forEach(i=>{i.addEventListener("click",()=>{Nn(i.dataset.diff),t()})}),e.querySelectorAll("[data-timbre]").forEach(i=>{i.addEventListener("click",()=>{_n(i.dataset.timbre),t()})}),e.querySelectorAll("[data-groove]").forEach(i=>{i.addEventListener("click",()=>{zn(i.dataset.groove),t()})}),e.querySelectorAll("[data-vol]").forEach(i=>{i.addEventListener("click",()=>{if(Gn(i.dataset.vol),ce(de()),n&&n.ctx)try{dt(n.ctx,523.25,.5,0,.22,gt())}catch{}t()})});const s=e.querySelector("[data-guidetoggle]");s&&s.addEventListener("click",()=>{On(!Lt()),t()});const a=e.querySelector("[data-hptoggle]");a&&a.addEventListener("click",()=>{Vn(!pt()),t()});const o=e.querySelector(".more-settings");o&&o.addEventListener("toggle",()=>{ts=o.open})}function fn(e,t){if(e.stars>=3)return"Чисто и точно! Можно прибавить темп или взять упражнение посложнее.";const n=[],s=e.avgCents;s<=-18?n.push("Ты чаще занижал — тяни ноту чуть выше, поддержи дыханием (опора живота)."):s>=18&&n.push("Ты чаще завышал — не дави, расслабь гортань, целься чуть ниже.");const a=e.perNote.length;if(a>=3){const i=t.notes.map((l,r)=>({i:r,midi:l.midi})).sort((l,r)=>r.midi-l.midi).slice(0,Math.max(1,Math.round(a/3)));i.reduce((l,r)=>l+(e.perNote[r.i]||0),0)/i.length<e.pct-.15&&n.push("Верхние ноты даются хуже — не тянись вверх горлом, добавь головной резонанс и воздух.")}return n.length||n.push("Целься в центр ноты и держи ровно. Включи «подсказку тоном» — попадать заметно легче."),n.join(" ")}const z=(e,t=1,n=0)=>n?{midi:e,beats:t,gap:n}:{midi:e,beats:t};function es(e){const t=(n,s,a=0)=>z(e+n,s,a);return{id:"vhold",name:"Пять гласных",syllable:"И-Э-А-О-У",tempo:78,kind:"vowel",root:e,grooveStyle:"soft",greenCents:25,desc:"Унификация гласных: держим позицию, меняем только гласную «И-Э-А-О-У».",how:"Пой «И-Э-А-О-У» ровно, без «прыжков» голосом при смене гласной. Сначала стаккато с паузами, потом строка повторяется выше — позиция единая.",notes:[t(0,.5,.5),t(0,.5,.5),t(0,.5,.5),t(0,.5,.5),t(0,.5,.5),t(0,.5),t(0,.5),t(0,.5),t(0,.5),t(0,1),t(4,.25),t(4,.25),t(4,.25),t(4,.25),t(4,1,2),t(4,.25),t(4,.25),t(4,.25),t(4,.25),t(4,1)]}}function ns(e){const t=(n,s)=>z(e+n,s);return{id:"vscale",name:"Лесенка гласных",syllable:"И-Э-А-О-У",tempo:124,kind:"scale",root:e,grooveStyle:"pop",desc:"Точность высоты при смене гласной — каждая гласная ведёт по двум нотам.",how:"Пой «И-Э-А-О-У» легко и точно, попадая в каждую ноту слига. Не зажимайся.",notes:[t(0,.5),t(2,.5),t(5,.5),t(7,.5),t(9,.5),t(7,.5),t(5,.5),t(2,.5),t(7,1),t(5,3)]}}function ss(e){return{id:"vagil",name:"Зигзаг",syllable:"И-Э-И-А-И-О-И-У",tempo:100,kind:"agility",root:e,grooveStyle:"funk",desc:"Беглость и точность: зигзаг по ступеням вверх и обратно.",how:"Лёгко и быстро веди голос по нотам зигзагом вверх, не зажимаясь. Гласные чёткие.",notes:[0,3,1,5,3,7,5,8,7,3,5,1,0].map(n=>z(e+n,.5))}}function as(e){const t=(n,s)=>z(e+n,s);return{id:"vclimb",name:"Качели на квинте",syllable:"И-Э-А-О-У",tempo:92,kind:"jump",root:e,grooveStyle:"soft",desc:"Гибкость и точность интервала: скачки на квинту вверх и зеркально вниз.",how:"Чисто бери скачок на квинту (без зажима), пробежку пой ровно. Вторая половина — то же зеркально вниз. Опора дыханием.",notes:[t(0,.5),t(7,.5),t(0,.5),t(7,.5),t(0,.5),t(7,.5),t(0,.5),t(7,.5),t(0,.5),t(7,.5),t(0,.25),t(2,.25),t(4,.25),t(5,.25),t(7,2),t(7,.5),t(0,.5),t(7,.5),t(0,.5),t(7,.5),t(0,.5),t(7,.5),t(0,.5),t(7,.5),t(0,.5),t(7,.25),t(5,.25),t(4,.25),t(2,.25),t(0,2)]}}function is(e){const t=(n,s,a=0)=>z(e+n,s,a);return{id:"jcharles",name:"Волна гласных",syllable:"И-Э-А-О-У",tempo:130,kind:"agility",root:e,grooveStyle:"swing",desc:"Гибкость и позиция гласных: повторяющийся мотив, затем плавный спуск.",how:"Лёгко веди гласные по мотиву, в конце мягко спустись. Без зажима, позиция единая.",notes:[t(0,.5),t(2,.5),t(5,.5,.5),t(0,.5),t(2,.5),t(5,.5,.5),t(0,.5),t(2,.5),t(5,.5),t(8,1),t(7,.5),t(5,.5),t(2,.5),t(0,.5),t(2,.5),t(5,.5,.5),t(0,.5),t(2,.5),t(5,.5),t(8,1),t(7,1.5)]}}function os(e,t="ionian"){const n=yt([1,2,3,2,1],t);return{id:"vowels",name:"Цепочка гласных",syllable:"Ми-Ме-Ма",tempo:90,kind:"scale",root:e,modeKey:t,grooveStyle:"swing",desc:"Выравнивание гласных и сохранение позиции при смене звука.",how:"Пой по кругу гласные «Ми-Ме-Ма-Мо», широко раскрывая рот, держи единую позицию.",notes:n.map(s=>z(e+s,1))}}function cs(e,t="ionian"){const n=yt([1,1,3,2,1,1,5,1,1,3,2,1],t);return{id:"jump5",name:"Скачок к V ступени",syllable:"Ям",tempo:100,kind:"jump",root:e,modeKey:t,grooveStyle:"latin",desc:"Точная атака интервалов и контроль регистра при скачках.",how:"Пой на «Ям». Перед скачком на квинту не зажимайся — целься точно в ноту.",notes:n.map(s=>z(e+s,1))}}function ls(e,t="ionian"){const s=yt([1,2,3,4,5,6,7,8,8,7,6,5,4,3,2,1],t);return{id:"lad",name:"Ладовая «ЯМ»",syllable:"Ям",tempo:100,kind:"scale",root:e,modeKey:t,drone:!0,grooveStyle:"march",desc:"Слух и ощущение ладовой окраски — гамма лада вверх и вниз.",how:"Пой на «Ям» по ступеням лада вверх до октавы и обратно. Слушай окраску лада.",notes:s.map(a=>z(e+a,1))}}function rs(e,t=8){return{id:"sustain",name:"Удержание ноты",syllable:"А",tempo:70,kind:"sustain",root:e,grooveStyle:"ballad",desc:"Учит держать ровный стабильный звук и дыхательную опору — основа пения.",how:"Слушай образец, потом тяни ноту на «А» как можно ровнее. Держи шарик в зелёной зоне без дрожи.",notes:[z(e,t)]}}function ds(e){return{id:"vibrato",name:"Вибрато",syllable:"А",tempo:60,kind:"vibrato",root:e,grooveStyle:"ballad",greenCents:55,yellowCents:95,desc:"Ровное вибрато — мягкое «качание» высоты примерно 5–6 раз в секунду.",how:"Сначала тяни ровную «А». Когда звук устойчив — добавь лёгкую «волну» голосом, 5–6 колебаний в секунду. Колебание идёт от дыхания и опоры, не дави горлом. На итоге увидишь частоту своего вибрато.",notes:[z(e,10)]}}function us(e){return{id:"vwobble",name:"Раскачка вибрато",syllable:"А",tempo:120,kind:"vibrato",root:e,grooveStyle:"soft",greenCents:55,desc:"Запуск вибрато: ровный звук с лёгким «качанием» высоты — основа естественного вибрато.",how:"Пой «А» и добавь мягкое колебание голосом — вверх-вниз небольшими шагами. Колебание идёт от опоры дыхания, не дави горлом.",notes:[0,1,0,1,0,1,0,5,6,5,6,5,6,5].map(n=>z(e+n,.5))}}function ms(e){return{id:"timbre",name:"Тёплый тон",syllable:"Мо",tempo:96,kind:"scale",root:e,grooveStyle:"ballad",desc:"Качество тембра: ровный, округлый звук при движении голоса по нотам.",how:"Пой «Мо» округло и тепло, держи одинаковый тембр на каждой ноте. Не зажимай, звук в маску.",notes:[0,1,3,0,1,3,1,0,0,1,3,5,7,5].map(n=>z(e+n,.5))}}function hs(e){const t=(n,s)=>z(e+n,s);return{id:"timbre2",name:"Ровный тон на двух",syllable:"А",tempo:72,kind:"sustain",root:e,grooveStyle:"ballad",desc:"Единый тембр при переходе между двумя высотами (вниз на кварту и обратно).",how:"Держи одинаковый округлый звук на обеих нотах — не «бели» нижнюю и не зажимай верхнюю.",notes:[t(0,2),t(-5,2),t(0,2),t(-5,2),t(0,4)]}}function vs(e){const t=(n,s)=>z(e+n,s);return{id:"regarp",name:"Через регистры",syllable:"Но",tempo:92,kind:"jump",root:e,grooveStyle:"soft",desc:"Плавный переход (passaggio): с тоники всё выше — кварта, квинта, октава.",how:"Пой «Но», возвращаясь к тонике и беря всё выше (кварта → квинта → октава). Без «слома» на переходе — мягко.",notes:[t(0,1),t(5,3),t(0,1),t(7,3),t(0,1),t(12,3),t(0,4)]}}function bs(e){const t=(n,s)=>z(e+n,s);return{id:"regoct",name:"Октавная связка",syllable:"А",tempo:84,kind:"jump",root:e,grooveStyle:"soft",desc:"Связка регистров на октаве — без резкого «переключения» голоса.",how:"Спокойно прыгай на октаву вверх и возвращайся на долгую тонику. Верх не криком, а на опоре и резонансе.",notes:Array.from({length:4}).flatMap(()=>[t(0,2),t(12,2),t(0,4)])}}function fs(e){const t=(n,s)=>z(e+n,s);return{id:"belt",name:"Белтинг — гамма",syllable:"Эй",tempo:112,kind:"scale",root:e,grooveStyle:"drive",desc:"Яркая опёртая подача (белтинг) на пятинотной гамме — мощно, но без зажима.",how:"Пой «Эй» ярко и звонко, опираясь дыханием. Звук вперёд (в маску), горло свободно. Не дави на верхних нотах.",notes:[t(0,.5),t(2,.5),t(4,.5),t(5,.5),t(7,1),t(5,.5),t(4,.5),t(2,.5),t(0,2)]}}function ps(e){const t=(n,s)=>z(e+n,s);return{id:"beltoct",name:"Белт-арпеджио",syllable:"Эй",tempo:100,kind:"jump",root:e,grooveStyle:"drive",desc:"Опёртая атака верха через арпеджио до октавы — энергично и безопасно.",how:"Поднимайся по арпеджио ярко и точно, на опоре. Верхнюю ноту не тяни горлом — звук на дыхании и в резонаторах.",notes:[t(0,.5),t(4,.5),t(7,.5),t(12,2),t(7,.5),t(4,.5),t(0,2)]}}function gs(e){return{id:"artic",name:"Стаккато-арпеджио",syllable:"Та",tempo:126,kind:"agility",root:e,grooveStyle:"funk",desc:"Чёткая артикуляция и точная атака: арпеджио отрывистыми ясными слогами.",how:"Пой «Та-Та-Та» коротко и чётко по арпеджио вверх-вниз, с паузой после каждого слога. Согласная ясная, звук не «расползается».",notes:[0,4,7,4,0,0,4,7,4,0].map(n=>z(e+n,.5,.5))}}function ys(e){return{id:"artic2",name:"Слоги по группам",syllable:"Та-Ка",tempo:120,kind:"agility",root:e,grooveStyle:"funk",desc:"Дикция в движении: чёткие слоги группами по соседним ступеням.",how:"Пой «Та-Ка-Та-Ка-Та» по нотам вверх-вниз, между группами — короткая пауза на вдох. Каждый слог ясный, ритм ровный.",notes:[0,2,4,2,0,0,2,4,2,0].map((n,s)=>z(e+n,.5,s%5===4?.5:0))}}function ws(e){return{id:"resist",name:"Фигура-волчок",syllable:"Ма",tempo:116,kind:"agility",root:e,grooveStyle:"march",desc:"Выносливость и ровность: устойчивый мотив-«волчок» много раз без потери опоры.",how:"Пой «Ма» по фигуре вверх-вниз ровно и не уставая. Дыхание ровное, опора держится до конца.",notes:[0,1,3,1,0,1,3,1,0,1,3,1,0].map(n=>z(e+n,.5))}}function Es(e){const t=(s,a,o=0)=>z(e+s,a,o),n=[0,2,4,5,7,5,4,2];return{id:"resist2",name:"Выносливая гамма",syllable:"Ма",tempo:92,kind:"agility",root:e,grooveStyle:"march",desc:"Дыхательная выносливость: длинный ровный пробег по гамме без добора воздуха.",how:"Пой «Ма» шестнадцатыми ровно и точно на одном дыхании; в конце — взлёт к октаве и долгая тоника. Распредели воздух до конца.",notes:[...n.map(s=>t(s,.25)),...n.map(s=>t(s,.25)),t(0,.25),t(2,.25),t(4,.25),t(5,.25),t(7,1.25),t(5,.25),t(4,.25),t(2,.25),t(0,1),t(0,.5),t(4,.5),t(0,.5),t(7,.5),t(0,.5),t(12,1.5),t(0,3,1)]}}function $s(e,t="ionian"){const n=yt([1,2,3,4,5,4,3,2,1],t);return{id:"scale5",name:"Гамма «Ма-Мэ»",syllable:"Ма",tempo:104,kind:"scale",root:e,modeKey:t,grooveStyle:"pop",desc:"Тренирует точность интонации — чистое попадание в каждую ступень гаммы.",how:"Пой «Ма» и попадай в каждую ноту, которая подъезжает к линии. Старайся держать зелёный.",notes:n.map(s=>z(e+s,1))}}function ks(e,t="ionian"){const n=yt([1,2,3,4,5,6,5,4,3,2,1],t);return{id:"agility",name:"Беглость «Ма»",syllable:"Ма",tempo:138,kind:"agility",root:e,modeKey:t,grooveStyle:"funk",desc:"Развивает беглость: быстрые и точные переходы между нотами (как в Vocalista).",how:"Пой «Ма» легко и быстро, попадая в каждую ноту пробегающего пассажа. Не зажимайся.",notes:n.map(s=>z(e+s,.5))}}function xs(e){return{id:"jump",name:"Октавный скачок",syllable:"А",tempo:84,kind:"jump",root:e,grooveStyle:"drive",desc:"Учит координации между нижним и верхним регистром голоса.",how:"Пой «А», точно прыгая на октаву вверх и обратно вниз. Целься в центр ноты.",notes:[z(e,2),z(e+12,2),z(e,2),z(e+12,2)]}}function ze(e,t="ionian"){const n=yt([1,2,3,2,1],t);return{id:"hum3",name:"Мычание по гамме",syllable:"М",tempo:92,kind:"hum",root:e,modeKey:t,grooveStyle:"soft",desc:"Мягкая активация голоса и резонаторов на «м-м-м» — три ступеньки вверх и обратно.",how:"Сомкни губы и мычи «м», идя по нотам: вверх три ступени и вниз. Звук в маску/нос.",notes:n.map(s=>z(e+s,1))}}function Ne(e,t="ionian"){const n=yt([1,2,3,4,5,4,3,2,1,5,1],t);return{id:"trill",name:"Губной тренаж «brrr»",syllable:"brrr",tempo:120,kind:"trill",root:e,modeKey:t,grooveStyle:"drive",desc:"Ровный воздушный поток и гибкость: пять ступеней вверх-вниз и скачок на квинту.",how:"Губами «brrr» (если не выходит — на «Р»). Веди по нотам ровно, в конце — скачок на квинту и тонику.",notes:n.map(s=>z(e+s,.75))}}function Oe(e,t,n,s=4){const a=e.notes.map(u=>u.midi),o=Math.min(...a),i=Math.max(...a);if(!Number.isFinite(t)||!Number.isFinite(n))return[0];const c=Math.max(0,Math.min(s,n-i)),l=Math.max(0,Math.min(s,o-t)),r=[];for(let u=0;u<=c;u++)r.push(u);for(let u=c-1;u>=-l;u--)r.push(u);return r.length?r:[0]}const J=(e,t)=>({s:e,b:t});function _t(e,t){const n=[];for(let s=0;s<t;s++)n.push(...e.map(a=>({...a})));return n}const Ht={air1:{id:"air1",name:"Дыхание: длинные с / ш",kind:"rhythm",tempo:70,desc:"Ровный длинный выдох на «с» и «ш» под метроном — опора и расход воздуха.",how:"«с-с-с» тянем на 4 клика → вдох носом → «ш-ш-ш» на 4 клика → вдох носом. Выдох ровный, без толчков.",steps:_t([J("с",4),J("вдох",2),J("ш",4),J("вдох",2)],4)},air2:{id:"air2",name:"Дыхание: короткий с + 5 ш",kind:"rhythm",tempo:80,desc:"Короткий толчок «с» и серия «ш» — активный выдох и чувство ритма.",how:"Короткий «с», пауза, затем 5 коротких «ш». Между «с» и «ш» НЕ дышим; вдох носом — после серии.",steps:_t([J("с",.5),J("rest",.5),J("ш",.5),J("ш",.5),J("ш",.5),J("ш",.5),J("ш",.5),J("вдох",2)],6)},air3:{id:"air3",name:"Артикуляция: 15 с + 15 ш",kind:"rhythm",tempo:80,desc:"Чёткие короткие «с» и «ш» в ровном пульсе — артикуляция и дыхание.",how:"15 коротких «с» → вдох носом → 15 коротких «ш». Держи ровный пульс с метрономом.",steps:[..._t([J("с",.5)],15),J("вдох",2),..._t([J("ш",.5)],15)]}},Oa={с:"С-с-с",ш:"Ш-ш-ш",вдох:"Вдох носом",rest:"·"},pn=[0,4,7,9,12,9,7,4];function Ms(e,t,n,s,{onExit:a,onComplete:o,skipExplain:i}={}){let c=null,l=!1,r=[];const u=[];function b(){r.forEach(p=>p&&p.stop&&p.stop()),r=[]}function v(){c&&(cancelAnimationFrame(c),c=null),u.forEach(clearTimeout),u.length=0,b(),document.removeEventListener("visibilitychange",d)}function d(){document.hidden?(c&&(cancelAnimationFrame(c),c=null),b(),l=!0):l&&(l=!1,h())}function h(){v(),e.innerHTML=`
      <div class="screen breathe-intro">
        <div class="game-top"><button class="icon-btn" id="back">‹ Меню</button></div>
        <div class="brand"><h1>${s.name}</h1></div>
        <div class="card">
          <p class="blurb">${s.desc}</p>
          <p class="how"><b>Как.</b> ${s.how}</p>
          <p class="how mech">Идёт метроном и тихая подложка. Делай звук в такт щелчкам, между подходами — спокойный вдох носом.</p>
        </div>
        <button class="btn btn-primary" id="go" style="width:100%">Начать</button>
      </div>
    `,document.getElementById("back").addEventListener("click",()=>{v(),a()}),document.getElementById("go").addEventListener("click",m)}function m(){document.addEventListener("visibilitychange",d);const p=60/s.tempo;let w=0;const k=s.steps.map(A=>{const y={...A,start:w,end:w+A.b};return w+=A.b,y}),H=w,R=H*p;e.innerHTML=`
      <div class="screen breathe">
        <div class="game-top"><button class="icon-btn" id="quit">‹ Прервать</button></div>
        <div class="rhythm-stage">
          <div class="rhythm-beat" id="beat"></div>
          <div class="rhythm-label" id="lbl">Приготовься…</div>
        </div>
        <div class="bar"><i id="prog"></i></div>
      </div>
    `,document.getElementById("quit").addEventListener("click",()=>{v(),a()});const g=document.getElementById("lbl"),S=document.getElementById("beat"),E=document.getElementById("prog");for(let A=0;A<Math.ceil(H);A++){const y=n+pn[A%pn.length],C=440*Math.pow(2,(y-69)/12);r.push(dt(t.ctx,C,p*.9,A*p,.07,"soft"))}const $=performance.now();let M=-1,I=!1;function T(){const A=(performance.now()-$)/1e3,y=A/p,C=Math.floor(y);C>M&&C<Math.ceil(H)&&(M=C,Kt(t.ctx,0,C%4===0),S.classList.remove("pulse"),S.offsetWidth,S.classList.add("pulse"));const q=k.find(V=>y>=V.start&&y<V.end);q&&(g.textContent=Oa[q.s]||"",g.style.color=q.s==="вдох"?"var(--gold)":q.s==="rest"?"var(--text-dim)":"var(--accent-2)"),E.style.width=Math.min(100,A/R*100)+"%",A<R?c=requestAnimationFrame(T):I||(I=!0,f())}c=requestAnimationFrame(T)}function f(){if(v(),o){o({pct:null,rhythm:!0});return}e.innerHTML=`
      <div class="screen summary">
        <div class="stars">🫁</div>
        <div class="verdict">Готово!</div>
        <p class="hint">Дыхание и артикуляция размяты. Голос готов к распевке.</p>
        <div class="row">
          <button class="btn btn-ghost" id="menu">Меню</button>
          <button class="btn btn-primary" id="again">Ещё раз</button>
        </div>
      </div>
    `,document.getElementById("menu").addEventListener("click",a),document.getElementById("again").addEventListener("click",h)}i?m():h()}const ne=[{key:"bass",name:"Бас",group:"муж",low:40,high:64,center:48,blurb:"Самый низкий мужской голос, глубокий и плотный."},{key:"baritone",name:"Баритон",group:"муж",low:43,high:67,center:52,blurb:"Средний мужской голос — самый распространённый."},{key:"tenor",name:"Тенор",group:"муж",low:48,high:72,center:57,blurb:"Высокий мужской голос, яркий и звонкий."},{key:"contralto",name:"Контральто",group:"жен",low:53,high:77,center:60,blurb:"Низкий женский голос, тёплый и насыщенный."},{key:"mezzo",name:"Меццо-сопрано",group:"жен",low:57,high:81,center:64,blurb:"Средний женский голос — самый частый у женщин."},{key:"soprano",name:"Сопрано",group:"жен",low:60,high:84,center:67,blurb:"Высокий женский голос, светлый и парящий."}];function ut(e){return ne.find(t=>t.key===e)||null}function ot(e){return Bn(Math.round(e))||""}function gn(e){return`${ot(e.low)}–${ot(e.high)}`}function Va(e,t){const n=(e+t)/2;let s=ne[0],a=1/0;for(const o of ne){const i=(o.low+o.high)/2,c=.6*Math.abs(e-o.low)+.4*Math.abs(n-i);c<a&&(a=c,s=o)}return s}function _a(e,t,n,{onExit:s}){const a=st(),o=a&&ut(a.key),i=o?o.center:60,c=a&&a.low!=null&&a.high!=null?{low:a.low,high:a.high}:o?{low:o.low,high:o.high}:{low:48,high:72},l=[{title:"Дыхание: длинные с / ш",tip:"Ровный длинный выдох в такт.",rhythm:Ht.air1},{title:"Дыхание: короткий с + 5 ш",tip:"Активный выдох, вдох носом после серии.",rhythm:Ht.air2},{title:"Артикуляция: 15 с + 15 ш",tip:"Чётко и ровно с метрономом.",rhythm:Ht.air3},{title:"Мычание по гамме «М»",tip:"Мягко, в маску. Сначала прозвучит тоника.",ex:ze(i)},{title:"Губной тренаж «brrr»",tip:"Губами «brrr» или на «Р», ровно.",ex:Ne(i)}];let r=0;const u=[];function b(){if(r>=l.length)return d();const h=l[r];v(h,r,()=>{const m=f=>{u.push(f),r+=1,b()};if(h.rhythm)Ms(e,t,i,h.rhythm,{onExit:s,onComplete:m,skipExplain:!0});else{const f=Oe(h.ex,c.low,c.high,2);ct(e,t,n,h.ex,{onExit:s,onComplete:m,reps:f})}})}function v(h,m,f){e.innerHTML=`
      <div class="screen interstitial">
        <div class="game-top"><button class="icon-btn" id="quit">‹ Прервать</button></div>
        <div class="step-count">Упражнение ${m+1} из ${l.length}</div>
        <div class="brand"><h1>${h.title}</h1><p>${h.tip}</p></div>
        ${h.rhythm?`<div class="card"><p class="how"><b>Как.</b> ${h.rhythm.how}</p></div>`:""}
        <div class="progress-dots">
          ${l.map((p,w)=>`<span class="dot ${w<m?"done":w===m?"now":""}"></span>`).join("")}
        </div>
        <button class="btn btn-primary" id="go" style="width:100%">Начать</button>
      </div>
    `,document.getElementById("go").addEventListener("click",f),document.getElementById("quit").addEventListener("click",s)}function d(){const h=u.filter(R=>R&&typeof R.pct=="number"),m=h.length?h.reduce((R,g)=>R+g.pct,0)/h.length:1,f=m>=.85?3:m>=.6?2:m>=.35?1:0,{streak:p,freezeSpent:w}=Fn({pct:m,stars:f});zt(2),ee(30);const k="★".repeat(f)+"☆".repeat(3-f),H=Math.round(m*100);e.innerHTML=`
      <div class="screen summary">
        <div class="stars">${k}</div>
        <div class="verdict">Распевка завершена!</div>
        <div class="big-pct">${H}<span>%</span></div>
        <p class="hint">средняя точность по ${h.length} ${h.length===1?"распевке":"распевкам"} с нотами</p>
        <div class="streak-badge">🔥 Стрик: ${p} ${p===1?"день":"дн."}${w?" · ❄ заморозка спасла стрик":""}</div>
        <button class="btn btn-primary" id="menu" style="width:100%">В меню</button>
      </div>
    `,document.getElementById("menu").addEventListener("click",s)}b()}function Ve(e,t,n,{onDone:s,onExit:a,canSkip:o=!1}){let i=null;const c=()=>{i&&cancelAnimationFrame(i),i=null};function l(){c(),n.reset();const v=st(),d=v&&ut(v.key);let h=d?d.group:"муж";e.innerHTML=`
      <div class="screen">
        <div class="game-top">
          <button class="icon-btn" id="back">${o?"Пропустить":"‹ Меню"}</button>
        </div>
        <div class="brand"><h1>Твой голос</h1>
          <p>Знаешь свой тембр — выбери. Не знаешь — определим за минуту.</p></div>
        <button class="btn btn-primary" id="detect" style="width:100%">Определить мой голос</button>
        <div class="settings">
          <div class="seg-label">Тембр голоса</div>
          <div class="seg" id="genderSeg">
            <button data-gender="муж" class="${h==="муж"?"on":""}">Мужские</button>
            <button data-gender="жен" class="${h==="жен"?"on":""}">Женские</button>
          </div>
        </div>
        <div class="card list">
          <div class="list-sep">Или выбери сам</div>
          <div id="voiceCards"></div>
        </div>
      </div>
    `,document.getElementById("back").addEventListener("click",a),document.getElementById("detect").addEventListener("click",r);function m(){const f=st();document.getElementById("voiceCards").innerHTML=ne.filter(p=>p.group===h).map(p=>`
          <button class="list-item voice-card" data-pick="${p.key}">
            <span class="li-main">${p.name}${f&&f.key===p.key?" ·  выбран":""}</span>
            <span class="li-sub">${p.group==="муж"?"мужской":"женский"} · ${gn(p)}</span>
          </button>`).join(""),document.querySelectorAll("[data-pick]").forEach(p=>p.addEventListener("click",()=>{ln(p.dataset.pick),s(st())}))}document.querySelectorAll("[data-gender]").forEach(f=>f.addEventListener("click",()=>{h=f.dataset.gender,document.querySelectorAll("[data-gender]").forEach(p=>p.classList.toggle("on",p.dataset.gender===h)),m()})),m()}function r(){c(),e.innerHTML=`
      <div class="screen breathe-intro">
        <div class="game-top"><button class="icon-btn" id="back">‹ Назад</button></div>
        <div class="brand"><h1>Определим голос</h1></div>
        <div class="card">
          <p class="blurb">Сначала споёшь свою самую низкую удобную ноту, потом — самую высокую (без напряжения!). По диапазону подскажу твой тембр.</p>
          <p class="how mech"><b>Как.</b> Пой ровно и держи ноту — когда звук станет стабильным, пойдёт отсчёт и я её запишу. Верх <b>не форсируй</b>: бери только то, что берётся легко.</p>
        </div>
        <button class="btn btn-primary" id="go" style="width:100%">Поехали</button>
      </div>
    `,document.getElementById("back").addEventListener("click",l),document.getElementById("go").addEventListener("click",()=>u("low"))}function u(v,d=null){c();const h=v==="low";e.innerHTML=`
      <div class="screen onboard">
        <div class="game-top"><button class="icon-btn" id="back">‹ Назад</button></div>
        <div class="brand"><h1>${h?"Нижняя нота":"Верхняя нота"}</h1>
          <p>${h?"Спой свою <b>самую низкую удобную</b> ноту и тяни ровно.":"Теперь <b>самую высокую</b> — мягко, <b>без напряжения</b>."}</p></div>
        <div class="note-display silent" id="note">—</div>
        <div class="stability"><div class="stability-fill" id="stab"></div></div>
        <p class="hint" id="status">Пой и держи ровно…</p>
        ${d!=null?`<p class="hint">Низ записан: <b>${ot(d)}</b></p>`:""}
      </div>
    `,document.getElementById("back").addEventListener("click",()=>h?r():u("low"));const m=document.getElementById("note"),f=document.getElementById("status"),p=document.getElementById("stab"),w=[],k=24,H=1200;let R=0;function g(M){const I=Math.min(...M),T=Math.max(...M);return 1200*Math.log2(T/I)}function S(M){const I=[...M].sort((T,A)=>T-A);return I[Math.floor(I.length/2)]}n.reset(),n.setRange&&n.setRange(55,1300);function E(){const M=t.read();if(M){const{smoothedHz:I,voiced:T}=n.process(M);if(T&&I){const A=rt(I),y=A.name.match(/^([A-G]#?)(-?\d+)$/);if(m.className="note-display green",m.innerHTML=y?`${y[1]}<span class="oct">${y[2]}</span>`:A.name,w.push(I),w.length>k&&w.shift(),w.length>=k&&g(w)<110){R||(R=performance.now());const q=performance.now()-R;p.style.width=Math.min(100,q/H*100)+"%";const V=Math.ceil((H-q)/1e3);if(f.textContent=q<H?`Держи… ${Math.max(1,V)}`:"Готово!",q>=H)return $(Math.round(rt(S(w)).midi))}else R=0,p.style.width="0%",f.textContent="Держи ровнее…"}else m.className="note-display silent",m.textContent="—",R=0,p.style.width="0%",w.length&&(w.length=0),f.textContent="Пой и держи ровно…"}i=requestAnimationFrame(E)}E();function $(M){if(c(),h)u("high",M);else{let I=d,T=M;T<=I&&(T=I+7),b(I,T)}}}function b(v,d){c();const h=Va(v,d);ln(h.key,v,d),zt(2),ee(25),e.innerHTML=`
      <div class="screen summary">
        <div class="verdict" style="font-size:18px;color:var(--text-dim)">Похоже, твой голос —</div>
        <div class="voice-result">${h.name}</div>
        <p class="hint">${h.blurb}</p>
        <div class="card" style="text-align:left;width:100%">
          <p class="how"><b>Твой диапазон:</b> ${ot(v)} – ${ot(d)}</p>
          ${Zn(v,d)}
          <p class="how"><b>Обычный диапазон для ${h.name.toLowerCase()}:</b> ${gn(h)}</p>
          <p class="how mech">Это ориентир по диапазону, а не окончательный вердикт — точный тембр определит педагог. Упражнения подстроятся под тебя.</p>
        </div>
        <div class="row">
          <button class="btn btn-ghost" id="redo">Переопределить</button>
          <button class="btn btn-primary" id="ok">Готово</button>
        </div>
      </div>
    `,document.getElementById("redo").addEventListener("click",r),document.getElementById("ok").addEventListener("click",()=>s(st()))}l()}function yn(e,t,n,s,a,o){e.beginPath(),e.moveTo(t+o,n),e.arcTo(t+s,n,t+s,n+a,o),e.arcTo(t+s,n+a,t,n+a,o),e.arcTo(t,n+a,t,n,o),e.arcTo(t,n,t+s,n,o),e.closePath()}function ja({headline:e="Мой прогресс",big:t="",sub:n=""}){const o=document.createElement("canvas");o.width=1080,o.height=1080;const i=o.getContext("2d");return i.fillStyle="#eef2f4",i.fillRect(0,0,1080,1080),i.fillStyle="#ffffff",i.shadowColor="rgba(20,33,55,.18)",i.shadowBlur=60,i.shadowOffsetY=24,yn(i,90,120,900,780,48),i.fill(),i.shadowColor="transparent",i.shadowBlur=0,i.shadowOffsetY=0,i.fillStyle="#0e8d7f",yn(i,90,120,900,150,48),i.fill(),i.fillStyle="#0e8d7f",i.fillRect(90,230,900,40),i.fillStyle="#ffffff",i.font="700 46px system-ui, sans-serif",i.textBaseline="middle",i.fillText("Распевка",130,195),i.font="500 30px system-ui, sans-serif",i.fillStyle="rgba(255,255,255,.9)",i.textAlign="right",i.fillText("вокальный тренажёр",950,195),i.textAlign="left",i.fillStyle="#5c6775",i.font="600 40px system-ui, sans-serif",i.fillText(e,150,380),i.fillStyle="#1b2430",i.font="800 150px system-ui, sans-serif",i.fillText(t,146,520),i.fillStyle="#0a766a",i.font="600 44px system-ui, sans-serif",i.fillText(n,150,660),i.fillStyle="#9aa6b2",i.font="500 32px system-ui, sans-serif",i.fillText("a1exxx.github.io/raspevka",150,840),o}async function wn(e){const t=ja(e),n=await new Promise(i=>t.toBlob(i,"image/png"));if(!n)return;const s=new File([n],"raspevka.png",{type:"image/png"});try{if(navigator.canShare&&navigator.canShare({files:[s]})){await navigator.share({files:[s],title:"Распевка",text:e.sub||"Мой прогресс в Распевке"});return}}catch{}const a=URL.createObjectURL(n),o=document.createElement("a");o.href=a,o.download="raspevka.png",document.body.appendChild(o),o.click(),o.remove(),setTimeout(()=>URL.revokeObjectURL(a),4e3)}function Ga(e){return e.toISOString().slice(0,10)}function Wa(e){if(!e||e.length<2)return"";const t=e.length,n=e.map(d=>d.low),s=e.map(d=>d.high),a=Math.min(...n)-1,o=Math.max(...s)+1,i=Math.max(1,o-a),c=300,l=70,r=5,u=d=>(r+d*(c-2*r)/(t-1)).toFixed(1),b=d=>(r+(1-(d-a)/i)*(l-2*r)).toFixed(1),v=d=>d.map((h,m)=>`${m?"L":"M"}${u(m)} ${b(h)}`).join(" ");return`
    <div class="seg-label" style="margin-top:14px">Рост диапазона</div>
    <svg class="range-tl" viewBox="0 0 ${c} ${l}" preserveAspectRatio="none" role="img" aria-label="График роста диапазона">
      <path d="${v(s)}" class="tl-high"/>
      <path d="${v(n)}" class="tl-low"/>
      <circle cx="${u(t-1)}" cy="${b(s[t-1])}" r="3.5" class="tl-dot-h"/>
      <circle cx="${u(t-1)}" cy="${b(n[t-1])}" r="3.5" class="tl-dot-l"/>
    </svg>`}function Ua(e,{onExit:t}){const n=Zs(),s=ta(),a=le(),o=ea(),i=Yn(),c=st(),l=c&&ut(c.key),r=new Set(n.map(f=>f.date)),u=[];for(let f=13;f>=0;f--){const p=new Date(Date.now()-f*864e5);u.push(`<span class="cal-dot ${r.has(Ga(p))?"done":""}"></span>`)}const b=n.slice(-12),v=b.length?b.map(f=>{const p=Math.round((f.pct||0)*100);return`<div class="acc-bar ${f.stars>=3?"g":f.stars===2?"a":"c"}" style="height:${Math.max(6,p)}%" title="${p}%"></div>`}).join(""):'<p class="hint">Пройди распевку — здесь появится история точности.</p>';let d="";const h=s.length?s[s.length-1]:c&&c.low!=null?c:null;if(h&&h.low!=null){const f=h.high-h.low;let p="";if(s.length>=2){const w=s[0],k=h.high-h.low-(w.high-w.low);k>0&&(p=` · <span style="color:var(--green)">+${k} пт с начала</span>`)}d=`
      <div class="card" style="text-align:left;width:100%">
        <div class="seg-label">Диапазон голоса</div>
        <p class="how" style="margin-top:6px"><b>${ot(h.low)} – ${ot(h.high)}</b> · ${f} полутонов${p}</p>
        ${Zn(h.low,h.high)}
        ${Wa(s)}
        ${l?`<p class="how">Тембр: ${l.name}</p>`:""}
      </div>`}e.innerHTML=`
    <div class="screen">
      <div class="game-top"><button class="icon-btn" id="back">‹ Меню</button></div>
      <div class="brand"><h1>Прогресс</h1></div>

      <div class="stat-row">
        <div class="stat-tile"><div class="stat-num">${a}</div><div class="stat-lbl">стрик, дн.</div></div>
        <div class="stat-tile"><div class="stat-num">${o}</div><div class="stat-lbl">сессий</div></div>
        <div class="stat-tile"><div class="stat-num">${i?i.toFixed(0):"—"}</div><div class="stat-lbl">выдох, сек</div></div>
      </div>

      <div class="card" style="width:100%">
        <div class="seg-label">Последние 14 дней</div>
        <div class="cal-row">${u.join("")}</div>
      </div>

      <div class="card" style="width:100%">
        <div class="seg-label">Точность последних занятий</div>
        <div class="acc-chart">${v}</div>
      </div>

      ${d}

      <button class="btn btn-primary" id="share" style="width:100%">Поделиться прогрессом</button>
      <button class="btn btn-ghost" id="back2" style="width:100%">В меню</button>
    </div>
  `,document.getElementById("back").addEventListener("click",t),document.getElementById("back2").addEventListener("click",t);const m=document.getElementById("share");m&&m.addEventListener("click",()=>{if(h&&h.low!=null){const f=h.high-h.low;wn({headline:"Мой диапазон",big:`${ot(h.low)}–${ot(h.high)}`,sub:`${f} полутонов${a>0?` · стрик ${a}`:""}`})}else wn({headline:"Мой прогресс",big:`${a}`,sub:"дней подряд в Распевке"})})}const Ya=[0,2,4,5,7,9,11],En=e=>Ya.includes((e%12+12)%12);function $n(e){const t=rt(W(e));return t?t.name:""}function Ka(e,t,n,{onExit:s,lowMidi:a=41,highMidi:o=81}){let i=null;const c=a-2,l=o+2,r=W(c),u=W(l);e.innerHTML=`
    <div class="screen freesing">
      <div class="game-top"><button class="icon-btn" id="back">‹ Меню</button></div>
      <div class="brand"><h1>Распевайся</h1><p>Мычи или тяни звук — и смотри, где твой голос. Без оценки.</p></div>
      <div class="fs-note silent" id="note">—</div>
      <div class="cents-row"><span id="cents">центы: —</span></div>
      <div class="bar"><i id="lvl"></i></div>
      <div class="settings" style="margin-top:6px">
        <div class="seg-label">Чувствительность микрофона</div>
        <div class="seg" id="sens"></div>
      </div>
      <div class="trace-wrap"><canvas class="trace fs-canvas" id="fs"></canvas></div>
      <p class="hint">Если индикатор почти не двигается — подними чувствительность. Если дёргается от шума — опусти. Шарик показывает твою ноту.</p>
      <div class="celebrate" id="cele" hidden></div>
    </div>
  `,document.getElementById("back").addEventListener("click",()=>{I(),s()});function b(){const T=Re();document.getElementById("sens").innerHTML=[["low","Низкая"],["med","Средняя"],["high","Высокая"]].map(([A,y])=>`<button data-sens="${A}" class="${T===A?"on":""}">${y}</button>`).join(""),document.querySelectorAll("[data-sens]").forEach(A=>A.addEventListener("click",()=>{Un(A.dataset.sens),t.setSensitivity&&t.setSensitivity(qe()),b()}))}b();const v=document.getElementById("note"),d=document.getElementById("cents"),h=document.getElementById("lvl"),m=document.getElementById("fs"),f=m.getContext("2d");function p(){const T=Math.min(window.devicePixelRatio||1,2);m.width=m.clientWidth*T,m.height=m.clientHeight*T,f.setTransform(T,0,0,T,0,0)}p(),window.addEventListener("resize",p);function w(T,A){const y=Math.max(r,Math.min(u,T)),C=Math.log2(y/r)/Math.log2(u/r);return A-C*A}const k=[];n.setRange&&n.setRange(55,1300),n.reset();const H=document.getElementById("cele");let R=null,g=0,S=0,E=null;function $(T){H&&(H.innerHTML=`<svg viewBox="0 0 24 24" fill="currentColor" width="18" height="18"><path d="M12 2l2.4 6.3L21 9l-5 4.1L17.8 20 12 16.3 6.2 20 8 13.1 3 9l6.6-.7z"/></svg> ${T}`,H.hidden=!1,clearTimeout(E),E=setTimeout(()=>{H&&(H.hidden=!0)},3400))}function M(){const T=m.clientWidth,A=m.clientHeight;f.clearRect(0,0,T,A),f.font="10px Inter, sans-serif";for(let F=Math.ceil(c);F<=l;F++){const Z=w(W(F),A),tt=(F%12+12)%12===0;f.strokeStyle=tt?"rgba(27,36,48,.20)":En(F)?"rgba(27,36,48,.08)":"rgba(27,36,48,.03)",f.lineWidth=1,f.beginPath(),f.moveTo(34,Z),f.lineTo(T,Z),f.stroke(),En(F)&&(f.fillStyle=tt?"rgba(27,36,48,.55)":"rgba(27,36,48,.32)",f.fillText($n(F),4,Z+3))}const y=t.read();let C=!1,q=null;if(y){const F=n.process(y);C=F.voiced&&t.rms()>.0025,q=F.smoothedHz}if(C&&q){const F=rt(q),Z=(F.name||"").match(/^([A-G]#?)(-?\d+)$/);v.innerHTML=Z?`${Z[1]}<span class="oct">${Z[2]}</span>`:F.name,v.classList.remove("silent"),d.textContent=`центы: ${F.cents>0?"+":""}${F.cents}`,h.style.width=Math.min(100,t.rms()*350)+"%";const tt=w(q,A);k.push(tt);const mt=Math.round(69+12*Math.log2(q/440));Math.abs(F.cents)<42?(mt===R?g++:(R=mt,g=1),g===26&&Date.now()-S>4e3&&oa(mt).extended&&(S=Date.now(),$(`Новая нота — ${$n(mt)}! Диапазон растёт.`))):(R=null,g=0)}else v.textContent="—",v.classList.add("silent"),d.textContent="центы: —",h.style.width="0%",k.push(null),R=null,g=0;for(;k.length>90;)k.shift();const V=T-28;for(let F=0;F<k.length;F++){if(k[F]==null)continue;const Z=V-(k.length-1-F)*2.4,tt=F===k.length-1;f.fillStyle=tt?"#2fab84":"rgba(47,171,132,.35)",tt&&(f.shadowColor="#2fab84",f.shadowBlur=16),f.beginPath(),f.arc(Z,k[F],tt?8:2.5,0,Math.PI*2),f.fill(),f.shadowBlur=0}i=requestAnimationFrame(M)}M();function I(){i&&cancelAnimationFrame(i),i=null,window.removeEventListener("resize",p),clearTimeout(E)}}const Ja=""+new URL("belly-breathing-B0wu-xNS.webp",import.meta.url).href;function Xa(){return`
    <div class="breathe-diagram">
      <img class="belly-img" src="${Ja}" alt="Дыхание животом: слева спокойный живот (выдох), справа надутый живот (вдох)" />
      <div class="belly-caps"><span>Выдох · живот мягкий</span><span>Вдох · живот надут</span></div>
      <p class="diagram-note">Не стесняйся: на вдохе <b>живот округляется вперёд</b> (как справа на картинке), воздух идёт вниз. Плечи и грудь почти неподвижны — не тянись вверх.</p>
    </div>`}const Ls={box:{title:"Дыхание по квадрату",kind:"paced",belly:!0,blurb:"Успокаивает и выравнивает дыхание перед пением. Вдох, задержка, выдох и пауза — все по 4 секунды. Дыши животом, плечи расслаблены.",cycles:4,phases:[{label:"Вдох",sec:4,from:.5,to:1},{label:"Задержка",sec:4,from:1,to:1},{label:"Выдох",sec:4,from:1,to:.5},{label:"Пауза",sec:4,from:.5,to:.5}]},belly:{title:"Дыхание животом",kind:"paced",belly:!0,blurb:"База певческого дыхания: вдох на 4 счёта — живот расширяется, выдох длиннее, на 6 счётов — ровно и плавно. Грудь и плечи неподвижны.",cycles:5,phases:[{label:"Вдох (живот)",sec:4,from:.5,to:1},{label:"Выдох ровно",sec:6,from:1,to:.5}]},hiss:{title:"Долгий выдох «с-с-с»",kind:"exhale",blurb:"Тренирует опору и ровный воздушный поток. Глубоко вдохни животом, затем выдыхай на звук «с-с-с» как можно дольше и РОВНО — без толчков. Я замерю время.",goals:[{sec:8,label:"хорошо"},{sec:15,label:"отлично"},{sec:20,label:"превосходно"}]}};function Ts(e,t,n,{onExit:s,onNext:a,nextLabel:o,onDone:i}){const c=Ls[n];let l=null;function r(){return`
      ${a?`<button class="btn btn-primary" id="next" style="width:100%">${o||"Дальше"} →</button>`:""}
      <div class="row"><button class="btn btn-ghost" id="menu">Меню</button>
      <button class="btn ${a?"btn-ghost":"btn-primary"}" id="again">Ещё раз</button></div>`}function u(f){document.getElementById("menu").addEventListener("click",s),document.getElementById("again").addEventListener("click",f);const p=document.getElementById("next");p&&p.addEventListener("click",a)}function b(){e.innerHTML=`
      <div class="screen breathe-intro">
        <div class="game-top"><button class="icon-btn" id="back">‹ ${a?"Назад":"Меню"}</button></div>
        <div class="brand"><h1>${c.title}</h1></div>
        <div class="card"><p class="blurb">${c.blurb}</p>${c.belly?Xa():""}</div>
        <button class="btn btn-primary" id="go" style="width:100%">Начать упражнение</button>
      </div>
    `,document.getElementById("back").addEventListener("click",s),document.getElementById("go").addEventListener("click",c.kind==="paced"?v:d)}function v(){e.innerHTML=`
      <div class="screen breathe">
        <div class="game-top"><button class="icon-btn" id="quit">‹ Прервать</button></div>
        <div class="breathe-stage">
          <div class="breathe-ring"><div class="breathe-core" id="core"></div></div>
          <div class="breathe-phase" id="phase">Приготовься…</div>
          <div class="breathe-count" id="count"></div>
        </div>
        <div class="breathe-cycles" id="cycles"></div>
      </div>
    `,document.getElementById("quit").addEventListener("click",()=>{m(),s()});const f=document.getElementById("core"),p=document.getElementById("phase"),w=document.getElementById("count"),k=document.getElementById("cycles");c.cycles*c.phases.length;let H=0,R=0,g=performance.now();S();function S(){k.innerHTML=Array.from({length:c.cycles},(M,I)=>`<span class="dot ${I<H?"done":I===H?"now":""}"></span>`).join("")}function E(){const M=c.phases[R],I=(performance.now()-g)/1e3,T=Math.min(1,I/M.sec),A=M.from+(M.to-M.from)*Qa(T);if(f.style.transform=`scale(${A})`,p.textContent=M.label,w.textContent=Math.ceil(M.sec-I),I>=M.sec){if(R+=1,R>=c.phases.length&&(R=0,H+=1,S()),H>=c.cycles)return $();g=performance.now()}l=requestAnimationFrame(E)}l=requestAnimationFrame(E);function $(){m(),i&&i(),e.innerHTML=`
        <div class="screen summary">
          <div class="stars">🫁</div>
          <div class="verdict">Готово!</div>
          <p class="hint">${c.cycles} циклов дыхания пройдено. Голос готов к распевке.</p>
          ${r()}
        </div>`,u(v)}}function d(){e.innerHTML=`
      <div class="screen breathe">
        <div class="game-top"><button class="icon-btn" id="quit">‹ Прервать</button></div>
        <div class="breathe-stage">
          <div class="big-timer" id="timer">0.0</div>
          <div class="breathe-phase" id="phase">Вдохни глубоко и тяни «с-с-с»…</div>
        </div>
        <div class="bar"><i id="vol"></i></div>
        ${h()}
      </div>
    `,document.getElementById("quit").addEventListener("click",()=>{m(),s()});const f=document.getElementById("timer"),p=document.getElementById("phase"),w=document.getElementById("vol"),k=.012,H=.6;let R="ready",g=0,S=0;function E(){t.read();const M=t.rms();w.style.width=Math.min(100,M*400)+"%";const I=performance.now();if(R==="ready")M>k&&(R="running",g=I,S=I,p.textContent="Тяни ровно!");else if(R==="running"&&(M>k&&(S=I),f.textContent=((I-g)/1e3).toFixed(1),I-S>H*1e3))return $((S-g)/1e3);l=requestAnimationFrame(E)}l=requestAnimationFrame(E);function $(M){m(),i&&i(),M=Math.max(0,Math.round(M*10)/10);const I=fa(M),T=[...c.goals].reverse().find(y=>M>=y.sec),A=T?T.label[0].toUpperCase()+T.label.slice(1)+"!":"Попробуй ещё";e.innerHTML=`
        <div class="screen summary">
          <div class="big-pct">${M.toFixed(1)}<span>сек</span></div>
          <div class="verdict">${A}</div>
          <p class="hint">ровный выдох на «с-с-с» · твой рекорд: <b>${I.toFixed(1)} сек</b></p>
          ${r()}
        </div>`,u(d)}}function h(){const f=Yn();return f?`<p class="hint">Твой рекорд: <b>${f.toFixed(1)} сек</b></p>`:'<p class="hint">Замерим твой ровный выдох.</p>'}function m(){l&&cancelAnimationFrame(l),l=null}b()}function Qa(e){return e<.5?2*e*e:1-Math.pow(-2*e+2,2)/2}const Bt=[{t:"Опора дыхания",b:"Вдох — живот мягко наполняется (плечи не поднимаются). На выдохе живот плавно поджимается и «держит» звук ровным. Это фундамент: без опоры голос дрожит и быстро устаёт."},{t:"Звук «в маску»",b:"Направляй звук в область носа и скул — голос начинает звенеть, а не «застревать» в горле. Поймать ощущение помогает мычание «м-м-м»."},{t:"Зевок в горле",b:"Лёгкое ощущение начала зевка освобождает гортань и расширяет пространство во рту. Звук становится объёмнее и свободнее, уходит зажим."},{t:"Не дави на верх",b:"Высокие ноты берутся не силой, а лёгкостью и опорой. Давишь — связки зажимаются и можно сорвать голос. Расширение диапазона — это недели, не один день."},{t:"Мягкая атака",b:"Начинай ноту мягко, без толчка горлом. Представь, что звук «вытекает», а не «выстреливает». Это бережёт связки и звучит красивее."},{t:"Округляй гласные",b:"Пой гласные округло, будто внутри звучит «о». Это выравнивает тембр по всему диапазону и убирает резкость и «плоскость»."},{t:"Губной тренаж «бррр»",b:"Вибрация губами снимает зажим и выравнивает поток воздуха. Лучшая разминка перед пением — и проверка, что дыхание ровное."},{t:"Береги голос",b:"Связки любят воду и отдых. Не пой на больном горле, делай паузы, не больше 20–30 минут подряд. Боль — всегда сигнал «стоп»."}];function Za(e,{onExit:t}){let n=0;function s(){const a=Bt[n],o=Bt.map((i,c)=>`<span class="dot ${c===n?"now":c<n?"done":""}"></span>`).join("");e.innerHTML=`
      <div class="screen">
        <div class="game-top"><button class="icon-btn" id="back">‹ Меню</button></div>
        <div class="brand"><h1>Теория голоса</h1><p>Короткие уроки — по одному в день достаточно.</p></div>
        <div class="card theory-card">
          <div class="th-num">${n+1} / ${Bt.length}</div>
          <h3 class="th-title">${a.t}</h3>
          <p class="th-body">${a.b}</p>
        </div>
        <div class="progress-dots">${o}</div>
        <div class="row">
          <button class="btn btn-ghost" id="prev" ${n===0?"disabled":""}>Назад</button>
          <button class="btn btn-primary" id="next">${n===Bt.length-1?"Готово":"Далее"}</button>
        </div>
      </div>`,document.getElementById("back").addEventListener("click",t),document.getElementById("prev").addEventListener("click",()=>{n>0&&(n--,s())}),document.getElementById("next").addEventListener("click",()=>{n<Bt.length-1?(n++,s()):t()})}s()}const ti=[0,2,4,5,7,9,12],ei=e=>e[Math.floor(Math.random()*e.length)];function ni(e){const t=rt(W(e));return t?t.name:""}function Ss(e,t,n,{onExit:s,root:a=60}){let i=0,c=0,l=null,r="idle",u=a,b=0,v=null;const d=gt?gt():"piano";e.innerHTML=`
    <div class="screen ear">
      <div class="game-top"><button class="icon-btn" id="back">‹ Меню</button></div>
      <div class="brand"><h1>Спой за мной</h1><p>Слушай ноту и повтори её голосом. Имя ноты скрыто — тренируем слух.</p></div>
      <div class="ear-status" id="status">Раунд 1 / 8</div>
      <div class="ear-target silent" id="bigq">?</div>
      <div class="cents-row"><span id="cue">Нажми «Слушать»</span></div>
      <div class="bar"><i id="lvl"></i></div>
      <div class="row">
        <button class="btn btn-ghost" id="replay">Слушать</button>
        <button class="btn btn-ghost" id="skip">Пропустить</button>
      </div>
      <div class="ear-score" id="score">Верно: 0 / 8</div>
    </div>`;const h=document.getElementById("status"),m=document.getElementById("bigq"),f=document.getElementById("cue"),p=document.getElementById("lvl"),w=document.getElementById("score");document.getElementById("back").addEventListener("click",()=>{M(),s()}),document.getElementById("replay").addEventListener("click",k),document.getElementById("skip").addEventListener("click",()=>{R("Пропущено"),S(1300)}),n.setRange&&n.setRange(55,1300),n.reset();function k(){t.ctx&&dt(t.ctx,W(u),1.3,0,.3,d),f.textContent="Слушай…",r="wait",clearTimeout(v),v=setTimeout(()=>{r="sing",f.textContent="Теперь спой эту ноту"},1350)}function H(){i++,u=a+ei(ti),b=0,m.textContent="?",m.classList.add("silent"),h.textContent=`Раунд ${i} / 8`,k()}function R(I){m.textContent=ni(u),m.classList.remove("silent"),I&&(f.textContent=I),r="done"}function g(){c++,w.textContent=`Верно: ${c} / 8`,R("Верно! Бра-во."),m.classList.add("hit"),S(1300)}function S(I){clearTimeout(v),v=setTimeout(()=>{m.classList.remove("hit"),i>=8?E():H()},I)}function E(){M(),e.innerHTML=`
      <div class="screen summary">
        <div class="brand"><h1>Слух</h1></div>
        <div class="big-pct">${c}<span>/8</span></div>
        <p class="verdict">${c>=7?"Отличный слух!":c>=4?"Хорошо, продолжай!":"Слух тренируется — ещё раз!"}</p>
        <div class="row" style="max-width:360px">
          <button class="btn btn-ghost" id="again">Ещё раз</button>
          <button class="btn btn-primary" id="menu">В меню</button>
        </div>
      </div>`,document.getElementById("again").addEventListener("click",()=>Ss(e,t,n,{onExit:s,root:a})),document.getElementById("menu").addEventListener("click",s)}function $(){const I=t.read();let T=!1,A=null;if(I){const y=n.process(I);T=y.voiced&&t.rms()>.0025,A=y.smoothedHz}if(p.style.width=(T?Math.min(100,t.rms()*350):0)+"%",r==="sing"&&T&&A){const y=Math.abs(qt(A,W(u)));y<45?b++:b=Math.max(0,b-2),f.textContent=y<45?"Держи…":A<W(u)?"↑ выше":"↓ ниже",b>=22&&g()}l=requestAnimationFrame($)}function M(){l&&cancelAnimationFrame(l),l=null,clearTimeout(v)}H(),$()}function $t(e,t,n,s){return{id:e,name:t,tempo:n,syllable:"Ля",make(a){return{id:e,name:t,syllable:"Ля",tempo:n,kind:"song",root:a,desc:"Простая мелодия — веди голос по нотам и попадай в каждую.",how:"Пой на «ля», спокойно следуя за нотами. Это не упражнение, а маленькая песня.",notes:s.map(([o,i])=>({midi:a+o,beats:i}))}}}}const Is=[$t("s1","Лесенка",96,[[0,1],[2,1],[4,1],[5,1],[7,2],[5,1],[4,1],[2,1],[0,2]]),$t("s2","Колыбельная",76,[[7,1],[5,1],[4,2],[5,1],[4,1],[2,2],[0,1],[2,1],[4,1],[2,1],[0,3]]),$t("s3","Прогулка",104,[[0,1],[0,1],[4,1],[4,1],[7,1],[5,1],[4,2],[2,1],[2,1],[5,1],[4,1],[2,1],[0,2]]),$t("s4","Ручеёк",112,[[0,.5],[2,.5],[4,.5],[5,.5],[7,1],[9,1],[7,1],[5,1],[4,.5],[2,.5],[0,2]]),$t("s5","Колокол",88,[[4,1],[7,1],[9,2],[7,1],[4,1],[5,2],[2,1],[4,1],[0,3]]),$t("s6","Закат",80,[[12,2],[9,1],[7,1],[5,2],[4,1],[2,1],[0,3]])],si=e=>e.make(60).notes.map(t=>t.midi);function ai(){return'<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2"><rect x="5" y="11" width="14" height="9" rx="2"/><path d="M8 11V8a4 4 0 0 1 8 0v3"/></svg>'}const kn={free:"Free",standard:"Standard",pro:"Pro"};function ii(e,{onExit:t}){function n(){const s=xt(),a=Y(),o=["free","standard","pro"].map(c=>`<button data-tier="${c}" class="${s===c?"on":""}">${kn[c]}</button>`).join(""),i=te.map(c=>{const l=Qn(c.key,s),r=c.key===a;return`
        <button class="mode-item ${l?"":"locked"} ${r?"sel":""}" data-mode="${c.key}" ${l?"":"disabled"}>
          <span class="mode-name">${c.name}${r?" · выбран":""}</span>
          ${l?"":`<span class="mode-lock">${ai()} ${kn[c.tier]}</span>`}
        </button>`}).join("");e.innerHTML=`
      <div class="screen">
        <div class="game-top"><button class="icon-btn" id="back">‹ Меню</button></div>
        <div class="brand"><h1>Лад распевок</h1>
          <p>Лад меняет окраску ладовых упражнений («Ладовая ЯМ»). На младших тарифах часть ладов закрыта.</p></div>
        <div class="settings">
          <div class="seg-label">Тариф (демо)</div>
          <div class="seg" id="tierSeg">${o}</div>
        </div>
        <div class="card list">
          <div class="list-sep">Лады</div>
          ${i}
        </div>
      </div>`,document.getElementById("back").addEventListener("click",t),document.querySelectorAll("[data-tier]").forEach(c=>c.addEventListener("click",()=>{jt(c.dataset.tier),n()})),document.querySelectorAll("[data-mode]:not([disabled])").forEach(c=>c.addEventListener("click",()=>{Dn(c.dataset.mode),n()}))}n()}const Me={hum3:ze,trill:Ne,sustain:rs,scale5:$s,agility:ks,jump:xs,vowels:os,jump5:cs,lad:ls,vibrato:ds,vhold:es,vscale:ns,vagil:ss,vclimb:as,jcharles:is,vwobble:us,timbre:ms,timbre2:hs,regarp:vs,regoct:bs,belt:fs,beltoct:ps,artic:gs,artic2:ys,resist:ws,resist2:Es},O=(e,t)=>({t:"ex",id:e,name:t}),xn=(e,t)=>({t:"breath",id:e,name:t}),at=[{id:"b1",title:"Базовый импульс",sub:"Дыхание, опора, мягкая активация",items:[xn("belly","Дыхание животом"),xn("hiss","Долгий выдох «с-с-с»"),O("hum3","Мычание по гамме"),O("trill","Губной тренаж «brrr»")],exam:{exId:"hum3",pass:.55}},{id:"b2",title:"Ясность гласных",sub:"Выравнивание гласных и точность",items:[O("vhold","Пять гласных"),O("vscale","Лесенка гласных"),O("jcharles","Волна гласных"),O("vclimb","Качели на квинте"),O("vagil","Зигзаг")],exam:{exId:"vscale",pass:.6}},{id:"b3",title:"Интонация и гибкость",sub:"Гаммы, беглость, скачки",items:[O("scale5","Гамма «Ма-Мэ»"),O("agility","Беглость «Ма»"),O("jump","Октавный скачок")],exam:{exId:"agility",pass:.55}},{id:"b4",title:"Лад и музыкальное мышление",sub:"Лады, атака интервалов",items:[O("lad","Ладовая «ЯМ»"),O("jump5","Скачок к V ступени")],exam:{exId:"lad",pass:.55}},{id:"b5",title:"Вибрато",sub:"Ровный звук и мягкое колебание",items:[O("sustain","Удержание ноты"),O("vwobble","Раскачка вибрато"),O("vibrato","Вибрато")],exam:{exId:"vibrato",pass:.5}},{id:"b6",title:"Тембр и тон",sub:"Округлый, ровный звук",items:[O("timbre","Тёплый тон"),O("timbre2","Ровный тон на двух")],exam:{exId:"timbre",pass:.55}},{id:"b7",title:"Регистры и переходы",sub:"Грудной/головной, passaggio",items:[O("regarp","Через регистры"),O("regoct","Октавная связка")],exam:{exId:"regarp",pass:.5}},{id:"b8",title:"Белтинг",sub:"Яркая опёртая подача верха",items:[O("belt","Белтинг — гамма"),O("beltoct","Белт-арпеджио")],exam:{exId:"belt",pass:.55}},{id:"b9",title:"Артикуляция",sub:"Чёткая дикция и атака",items:[O("artic","Стаккато-арпеджио"),O("artic2","Слоги по группам")],exam:{exId:"artic",pass:.6}},{id:"b10",title:"Сопротивление",sub:"Выносливость и опора",items:[O("resist","Фигура-волчок"),O("resist2","Выносливая гамма")],exam:{exId:"resist2",pass:.5}}];function oi(e,t){return e<=0?!0:t.includes(at[e-1].id)}function Bs(){return`<div class="teacher-cta">
    <span>Педагог разберёт нюансы быстрее и покажет на твоём голосе.</span>
    <button class="btn btn-ghost" id="toSchool">Записаться на урок</button>
  </div>`}function ci(e,{blocks:t,examsPassed:n,onExit:s,onOpenBlock:a,onSchool:o}){const i=t.filter(r=>n.includes(r.id)).length,c=t.map((r,u)=>{const b=n.includes(r.id),v=oi(u,n),d=b?"done":v?"open":"locked",h=b?"✓":v?`${u+1}`:"🔒";return`<button class="block-card ${d}" data-block="${u}" ${v?"":"disabled"}>
        <span class="bc-badge">${h}</span>
        <span class="bc-main"><b>${r.title}</b><span class="bc-sub">${r.sub}</span></span>
        <span class="bc-arrow">${v?"›":""}</span>
      </button>`}).join("");e.innerHTML=`
    <div class="screen catalog">
      <div class="game-top"><button class="icon-btn" id="back">‹ Меню</button></div>
      <div class="brand"><h1>Программа обучения</h1><p>Блоки открываются по мере прохождения. Каждый блок завершается экзаменом.</p></div>
      <div class="prog-wrap"><div class="prog-bar"><i style="width:${Math.round(i/t.length*100)}%"></i></div><span class="prog-txt">${i} / ${t.length} блоков пройдено</span></div>
      <div class="block-list">${c}</div>
      ${Bs()}
      <p class="hint">Это самостоятельная практика. Полноценный разбор и постановку голоса даёт педагог.</p>
    </div>
  `,document.getElementById("back").addEventListener("click",s),e.querySelectorAll("[data-block]").forEach(r=>r.addEventListener("click",()=>a(Number(r.dataset.block))));const l=document.getElementById("toSchool");l&&o&&l.addEventListener("click",o)}function li(e,{block:t,index:n,examsPassed:s,doneItems:a,onExit:o,onRunItem:i,onExam:c,onSchool:l}){const r=s.includes(t.id),u=t.items.map((d,h)=>{const m=a.includes(d.id),f=d.t==="breath"?'<span class="bi-tag">дыхание</span>':"";return`<button class="block-item" data-item="${h}">
        <span class="bi-check ${m?"on":""}">${m?"✓":h+1}</span>
        <span class="bi-name">${d.name}${f}</span>
        <span class="bc-arrow">›</span>
      </button>`}).join(""),b=t.items.every(d=>a.includes(d.id));e.innerHTML=`
    <div class="screen catalog">
      <div class="game-top"><button class="icon-btn" id="back">‹ Программа</button></div>
      <div class="brand"><h1>${t.title}</h1><p>${t.sub}</p></div>
      <div class="block-list">${u}</div>
      <button class="btn ${b?"btn-primary":"btn-ghost"}" id="exam" style="width:100%;margin-top:6px">
        ${r?"✓ Экзамен сдан · пересдать":"Экзамен блока"}
      </button>
      <p class="hint">${b?"Все упражнения пройдены — можно сдавать экзамен.":"Пройди упражнения, потом сдай экзамен. Можно и сразу — как удобнее."}</p>
      ${Bs()}
    </div>
  `,document.getElementById("back").addEventListener("click",o),e.querySelectorAll("[data-item]").forEach(d=>d.addEventListener("click",()=>i(t,Number(d.dataset.item)))),document.getElementById("exam").addEventListener("click",()=>c(t));const v=document.getElementById("toSchool");v&&l&&v.addEventListener("click",l)}function ri(){const e=["audio/webm;codecs=opus","audio/webm","audio/mp4","audio/ogg"];for(const t of e)try{if(window.MediaRecorder&&MediaRecorder.isTypeSupported(t))return t}catch{}return""}function di(e,t,{onExit:n}){let s=null,a=[],o=null,i=null,c=0,l=!1;function r(h){const m=Math.floor(h/1e3);return`${Math.floor(m/60)}:${String(m%60).padStart(2,"0")}`}function u(){e.innerHTML=`
      <div class="screen recorder">
        <div class="game-top"><button class="icon-btn" id="back">‹ Меню</button></div>
        <div class="brand"><h1>Запись голоса</h1><p>Запиши себя и послушай со стороны — так слышно прогресс и ошибки, которые в моменте не замечаешь.</p></div>
        <div class="rec-timer ${l?"live":""}" id="timer">${r(0)}</div>
        <button class="btn ${l?"btn-danger":"btn-primary"} rec-btn" id="rec">${l?"■ Остановить":"● Записать"}</button>
        <audio id="player" controls ${o?"":"hidden"} style="width:100%;margin-top:16px"></audio>
        <p class="hint" style="margin-top:14px">Запись хранится только в этой сессии и никуда не отправляется. ${window.MediaRecorder?"":"<br>⚠️ Браузер не поддерживает запись."}</p>
      </div>
    `,document.getElementById("back").addEventListener("click",()=>{d(),n()});const h=document.getElementById("rec");if(!window.MediaRecorder){h.disabled=!0;return}h.addEventListener("click",l?v:b);const m=document.getElementById("player");o&&m&&(m.src=o)}function b(){if(!t.stream)return;if(a=[],o){try{URL.revokeObjectURL(o)}catch{}o=null}try{const m=ri();s=m?new MediaRecorder(t.stream,{mimeType:m}):new MediaRecorder(t.stream)}catch{return}s.ondataavailable=m=>{m.data&&m.data.size&&a.push(m.data)},s.onstop=()=>{const m=new Blob(a,{type:s.mimeType||"audio/webm"});o=URL.createObjectURL(m),l=!1,u()},s.start(),l=!0,c=typeof performance<"u"?performance.now():Date.now(),u();const h=()=>document.getElementById("timer");i=setInterval(()=>{const m=h();m&&(m.textContent=r((typeof performance<"u"?performance.now():Date.now())-c))},250)}function v(){clearInterval(i),i=null;try{s&&s.state!=="inactive"&&s.stop()}catch{l=!1,u()}}function d(){clearInterval(i),i=null;try{s&&s.state!=="inactive"&&s.stop()}catch{}if(o)try{URL.revokeObjectURL(o)}catch{}}u()}const ui="./backing/raspevka-rise.mp3",mi=[0,2,4,5,7,9,11],Mn=e=>mi.includes((e%12+12)%12);function hi(e){const t=rt(W(e));return t?t.name:""}function Ln(e){return e=Math.max(0,Math.floor(e||0)),`${Math.floor(e/60)}:${String(e%60).padStart(2,"0")}`}function vi(e,t,n,{onExit:s,lowMidi:a=40,highMidi:o=76}){let i=null;const c=a-2,l=o+2,r=W(c),u=W(l),b=new Audio(ui);b.preload="auto",e.innerHTML=`
    <div class="screen freesing backing">
      <div class="game-top"><button class="icon-btn" id="back">‹ Меню</button></div>
      <div class="brand"><h1>Пой под фонограмму</h1><p>Твоя распевка-с-повышением. Пой вместе с мелодией — и смотри, где твой голос. Лучше в наушниках.</p></div>
      <div class="player">
        <button class="btn btn-primary" id="play" style="width:auto;padding:12px 22px">▶ Слушать</button>
        <div class="player-time"><span id="cur">0:00</span> / <span id="dur">…</span></div>
      </div>
      <div class="bar"><i id="seek"></i></div>
      <div class="fs-note silent" id="note">—</div>
      <div class="trace-wrap"><canvas class="trace fs-canvas" id="fs"></canvas></div>
      <p class="hint" id="hint">Нажми «Слушать» и пой за мелодией. Шарик показывает твою ноту.</p>
    </div>
  `;const v=document.getElementById("back"),d=document.getElementById("play"),h=document.getElementById("cur"),m=document.getElementById("dur"),f=document.getElementById("seek"),p=document.getElementById("note"),w=document.getElementById("fs"),k=w.getContext("2d");function H(){const $=Math.min(window.devicePixelRatio||1,2);w.width=w.clientWidth*$,w.height=w.clientHeight*$,k.setTransform($,0,0,$,0,0)}H(),window.addEventListener("resize",H),b.addEventListener("loadedmetadata",()=>{m.textContent=Ln(b.duration)}),b.addEventListener("ended",()=>{d.textContent="▶ Слушать"}),d.addEventListener("click",()=>{b.paused?(b.play().catch(()=>{}),d.textContent="⏸ Пауза"):(b.pause(),d.textContent="▶ Слушать")}),v.addEventListener("click",()=>{E(),s()});function R($,M){const I=Math.max(r,Math.min(u,$)),T=Math.log2(I/r)/Math.log2(u/r);return M-T*M}const g=[];n.setRange&&n.setRange(55,1300),n.reset();function S(){const $=w.clientWidth,M=w.clientHeight;k.clearRect(0,0,$,M),k.font="10px Inter, sans-serif";for(let C=Math.ceil(c);C<=l;C++){const q=R(W(C),M),V=(C%12+12)%12===0;k.strokeStyle=V?"rgba(27,36,48,.20)":Mn(C)?"rgba(27,36,48,.08)":"rgba(27,36,48,.03)",k.lineWidth=1,k.beginPath(),k.moveTo(34,q),k.lineTo($,q),k.stroke(),Mn(C)&&(k.fillStyle=V?"rgba(27,36,48,.55)":"rgba(27,36,48,.32)",k.fillText(hi(C),4,q+3))}b.duration&&(f.style.width=Math.min(100,b.currentTime/b.duration*100)+"%",h.textContent=Ln(b.currentTime));const I=t.read();let T=!1,A=null;if(I){const C=n.process(I);T=C.voiced&&t.rms()>.0025,A=C.smoothedHz}if(T&&A){const C=rt(A),q=(C.name||"").match(/^([A-G]#?)(-?\d+)$/);p.innerHTML=q?`${q[1]}<span class="oct">${q[2]}</span>`:C.name,p.classList.remove("silent"),g.push(R(A,M))}else p.textContent="—",p.classList.add("silent"),g.push(null);for(;g.length>90;)g.shift();const y=$-28;for(let C=0;C<g.length;C++){if(g[C]==null)continue;const q=y-(g.length-1-C)*2.4,V=C===g.length-1;k.fillStyle=V?"#2fab84":"rgba(47,171,132,.35)",V&&(k.shadowColor="#2fab84",k.shadowBlur=16),k.beginPath(),k.arc(q,g[C],V?8:2.5,0,Math.PI*2),k.fill(),k.shadowBlur=0}i=requestAnimationFrame(S)}S();function E(){i&&cancelAnimationFrame(i),i=null,window.removeEventListener("resize",H);try{b.pause(),b.src=""}catch{}}}async function bi(e){return!1}function fi(e,{onExit:t}){const n=st(),s=n&&ut(n.key),a=Js(),o={voiceType:s?s.name:null,range:a&&Number.isFinite(a.low)?`${ot(a.low)}–${ot(a.high)}`:null,streak:le(),blocks:Dt().length},i=[o.voiceType,o.range?`диапазон ${o.range}`:null,o.streak?`стрик ${o.streak}`:null,o.blocks?`блоков ${o.blocks}`:null].filter(Boolean).join(" · ")||"пока без данных";let c="any";function l(){e.innerHTML=`
      <div class="screen leadform">
        <div class="game-top"><button class="icon-btn" id="back">‹ Назад</button></div>
        <div class="brand"><h1>Урок с педагогом</h1><p>Бесплатный пробный урок в школе «Прояви». Педагог поставит голос быстрее, чем в одиночку.</p></div>
        <div class="card">
          <label class="field"><span>Как тебя зовут</span>
            <input id="lf-name" type="text" autocomplete="name" placeholder="Имя" /></label>
          <label class="field"><span>Куда написать (Telegram или телефон)</span>
            <input id="lf-contact" type="text" inputmode="text" placeholder="@username или +7…" /></label>
          <div class="field"><span>Педагог</span>
            <div class="seg" id="lf-pref">
              <button data-pref="any" class="on">Без разницы</button>
              <button data-pref="male">Мужчина</button>
              <button data-pref="female">Женщина</button>
            </div>
          </div>
          <label class="field"><span>Что хочешь (необязательно)</span>
            <textarea id="lf-goal" rows="3" placeholder="Например: хочу петь чисто и расширить диапазон"></textarea></label>
          <p class="hint" style="margin:2px 0 12px">К заявке приложим твой прогресс: <b>${i}</b> — педагогу сразу видно, с чего начать.</p>
          <button class="btn btn-primary" id="lf-send" style="width:100%">Записаться на бесплатный пробный</button>
          <p class="hint" id="lf-err" style="color:var(--coral);margin-top:8px"></p>
        </div>
      </div>
    `,document.getElementById("back").addEventListener("click",t),e.querySelectorAll("#lf-pref [data-pref]").forEach(u=>u.addEventListener("click",()=>{c=u.dataset.pref,e.querySelectorAll("#lf-pref [data-pref]").forEach(b=>b.classList.toggle("on",b.dataset.pref===c))})),document.getElementById("lf-send").addEventListener("click",async()=>{const u=document.getElementById("lf-name").value.trim(),b=document.getElementById("lf-contact").value.trim(),v=document.getElementById("lf-goal").value.trim();if(!u||!b){document.getElementById("lf-err").textContent="Заполни имя и контакт — иначе педагог не сможет ответить.";return}const d=document.getElementById("lf-send");d.disabled=!0,d.textContent="Отправляю…",na({name:u,contact:b,pref:c,goal:v,stats:o}),await bi(),r(u)})}function r(u){zt(1),e.innerHTML=`
      <div class="screen summary leadform-done">
        <div class="lf-check"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M5 13l4 4L19 7"/></svg></div>
        <div class="verdict">Заявка принята!</div>
        <p class="hint">Спасибо, ${u}! Педагог свяжется по твоему контакту и подберёт время бесплатного урока. Пока — продолжай практиковаться.</p>
        <button class="btn btn-primary" id="lf-ok" style="width:100%;max-width:360px">Вернуться</button>
      </div>
    `,document.getElementById("lf-ok").addEventListener("click",t)}l()}function pi(e,t,{onExit:n,onVoice:s,onCalibrate:a}){let o=!1;function i(r,u,b){return`<div class="seg">${r.map(([v,d])=>`<button data-${b}="${v}" class="${u===v?"on":""}">${d}</button>`).join("")}</div>`}function c(){const r=Sa();if(!r.sessions)return"";const u=r.perEx.slice(0,6).map(b=>`<div class="an-row"><span>${b.id}</span><span>${b.runs}× · ${b.avgPct}%</span></div>`).join("");return`
      <div class="card">
        <div class="seg-label">Аналитика (локально) <span class="set-hint">${r.sessions} прохождений</span></div>
        <div class="an-list">${u}</div>
      </div>`}function l(){const r=st(),u=r&&ut(r.key);e.innerHTML=`
      <div class="screen settings-screen">
        <div class="game-top"><button class="icon-btn" id="back">‹ Меню</button></div>
        <div class="brand"><h1>Настройки</h1><p>Звук, голос и поведение распевок — в одном месте.</p></div>

        <div class="card settings">
          <div class="set-row"><div class="seg-label">Мой голос</div>
            <button class="toggle" id="voice">${u?u.name:"Определить тембр голоса"} ›</button></div>

          <div class="seg-label">Громкость подсказки <span class="set-hint">на телефоне ставь «Громко/Макс»</span></div>
          ${i([["quiet","Тихо"],["normal","Норм"],["loud","Громко"],["max","Макс"]],re(),"vol")}

          <div class="seg-label">Вывод звука <span class="set-hint">влияет на компенсацию задержки</span></div>
          ${i([["speaker","Динамик"],["wired","Провод"],["bt","Bluetooth"]],ue(),"route")}
          ${a?`<div class="set-row" style="margin-top:8px"><div class="seg-label" style="margin:0">Точная калибровка</div><button class="toggle" id="calib">${Math.round(He()*1e3)} мс · настроить ›</button></div>`:""}

          <div class="seg-label">Чувствительность микрофона</div>
          ${i([["low","Низкая"],["med","Средняя"],["high","Высокая"]],Re(),"sens")}

          <div class="seg-label">Темп распевок</div>
          ${i([["easy","Медл."],["medium","Средне"],["fast","Быстро"]],Be(),"diff")}

          <div class="seg-label">Звук подсказки</div>
          ${i([["piano","Пиано"],["guitar","Гитара"],["soft","Мягкий"]],gt(),"timbre")}

          <div class="seg-label">Грув (ритм-подложка) <span class="set-hint">Авто — своя под каждую распевку</span></div>
          ${i([["off","Выкл"],["auto","Авто"],["pop","Поп"],["funk","Фанк"],["soft","Мягкий"]],Ie(),"groove")}

          <div class="toggle-row" style="margin-top:10px">
            <button class="toggle ${Lt()?"on":""}" id="guide">Подсказка тоном: ${Lt()?"вкл":"выкл"}</button>
            <button class="toggle ${pt()?"on":""}" id="hp">Наушники: ${pt()?"да":"нет"}</button>
          </div>
          <button class="toggle ${Ct()?"on":""}" id="darkstage" style="width:100%;margin-top:8px">Тёмный экран пения: ${Ct()?"вкл":"выкл"} <span class="set-hint">светящийся след голоса</span></button>
          <button class="toggle ${At()?"on":""}" id="agc" style="width:100%;margin-top:8px">Авто-громкость микро (AGC): ${At()?"вкл":"выкл"} <span class="set-hint">${At()?"громче на телефоне":"ровнее долгие ноты"}</span></button>
        </div>

        ${c()}

        <div class="card">
          <div class="seg-label">Сброс данных</div>
          <p class="hint" style="margin:4px 0 10px">Удалит прогресс, стрик, диапазон и настройки на этом устройстве. Отменить нельзя.</p>
          <button class="btn ${o?"btn-danger":"btn-ghost"}" id="reset" style="width:100%">${o?"Точно сбросить? Нажми ещё раз":"Сбросить всё"}</button>
        </div>
      </div>
    `,document.getElementById("back").addEventListener("click",n),document.getElementById("voice").addEventListener("click",s),e.querySelectorAll("[data-vol]").forEach(v=>v.addEventListener("click",()=>{if(Gn(v.dataset.vol),ce(de()),t&&t.ctx)try{dt(t.ctx,523.25,.5,0,.22,gt())}catch{}l()})),e.querySelectorAll("[data-route]").forEach(v=>v.addEventListener("click",()=>{ma(v.dataset.route),l()})),e.querySelectorAll("[data-sens]").forEach(v=>v.addEventListener("click",()=>{Un(v.dataset.sens),t&&t.setSensitivity&&t.setSensitivity(qe()),l()})),e.querySelectorAll("[data-diff]").forEach(v=>v.addEventListener("click",()=>{Nn(v.dataset.diff),l()})),e.querySelectorAll("[data-timbre]").forEach(v=>v.addEventListener("click",()=>{_n(v.dataset.timbre),l()})),e.querySelectorAll("[data-groove]").forEach(v=>v.addEventListener("click",()=>{zn(v.dataset.groove),l()})),document.getElementById("guide").addEventListener("click",()=>{On(!Lt()),l()}),document.getElementById("hp").addEventListener("click",()=>{Vn(!pt()),l()}),document.getElementById("darkstage").addEventListener("click",()=>{ha(!Ct()),l()}),document.getElementById("agc").addEventListener("click",()=>{const v=!At();va(v),t&&t.setAGC&&t.setAGC(v),l()});const b=document.getElementById("calib");b&&a&&b.addEventListener("click",a),document.getElementById("reset").addEventListener("click",()=>{if(!o){o=!0,l();return}Pn(),Ta(),n()})}l()}function gi(e,t,{k:n=4,minRms:s=.012,window:a=.5}={}){if(!Array.isArray(e)||e.length<3)return null;const o=e.filter(l=>l.t<t).map(l=>l.rms).sort((l,r)=>l-r);if(!o.length)return null;const i=o[Math.floor(o.length/2)]||0,c=Math.max(s,i*n);for(const l of e)if(!(l.t<=t)){if(l.t-t>a)break;if(l.rms>=c)return l.t-t}return null}function yi(e,t=.03,n=.4){const s=e.filter(a=>Number.isFinite(a)&&a>=t&&a<=n).sort((a,o)=>a-o);return s.length<2?null:s[Math.floor(s.length/2)]}const wi=e=>new Promise(t=>setTimeout(t,e));function Ei(e,t,{onExit:n}){let s=!1,a="";function o(){const l=Math.round(He()*1e3);e.innerHTML=`
      <div class="screen calibrate">
        <div class="game-top"><button class="icon-btn" id="back">‹ Назад</button></div>
        <div class="brand"><h1>Калибровка задержки</h1>
          <p>Звук с динамика доходит до микрофона не мгновенно — особенно по Bluetooth. Измерим задержку, чтобы счёт был честным.</p></div>

        <div class="card">
          <div class="cal-big"><b id="curms">${l}</b> мс <span class="set-hint">текущая компенсация</span></div>
          <p class="hint" style="margin:6px 0 14px">Положи телефон перед собой, без наушников, в тишине. Нажми «Измерить» — прозвучат 3 щелчка, приложение поймает их эхо.</p>
          <button class="btn btn-primary" id="measure" style="width:100%" ${s?"disabled":""}>${s?"Измеряю…":"Измерить задержку"}</button>
          ${a?`<p class="hint" id="note" style="margin-top:12px">${a}</p>`:""}
        </div>

        <div class="card">
          <div class="seg-label">Тонкая подстройка вручную</div>
          <input type="range" id="slider" min="30" max="400" step="5" value="${l}" class="cal-slider" />
          <div class="cal-slider-row"><span>30 мс</span><span id="slval">${l} мс</span><span>400 мс</span></div>
          <p class="hint" style="margin-top:8px">Если в упражнении кажется, что счёт «опаздывает» — увеличь; если «спешит» — уменьши.</p>
        </div>
      </div>
    `,document.getElementById("back").addEventListener("click",n),document.getElementById("measure").addEventListener("click",c);const r=document.getElementById("slider");r.addEventListener("input",()=>{const u=Number(r.value);document.getElementById("slval").textContent=u+" мс",document.getElementById("curms").textContent=u,rn(u/1e3)})}function i(){return new Promise(l=>{const r=t.ctx;if(!r){l(null);return}const u=[],b=r.currentTime,v=typeof performance<"u"?performance.now():Date.now(),d=b+.15;Kt(r,.15,!0);const h=()=>{t.read(),u.push({t:r.currentTime,rms:t.rms()});const m=r.currentTime-b,f=((typeof performance<"u"?performance.now():Date.now())-v)/1e3;m<.7&&f<1.3?setTimeout(h,16):l(gi(u,d))};h()})}async function c(){if(s)return;s=!0,a="",o();const l=[];for(let u=0;u<3;u++)a=`Замер ${u+1} из 3…`,o(),l.push(await i()),await wi(300);const r=yi(l);s=!1,r==null?a="Не удалось расслышать эхо (тихо, наушники или сильный шум). Подстрой вручную ползунком ниже или выбери тип вывода в настройках.":(rn(r),a=`Готово: задержка ≈ ${Math.round(r*1e3)} мс — сохранено.`),o()}o()}function As(e,{onExit:t}){const n=()=>As(e,{onExit:t}),s=qn(),a=lt(),o=Fe(),i=(l,r)=>`
    <div class="seg-label">${l}</div>
    <div class="seg">${r.map(([u,b,v])=>`<button data-act="${u}" class="${v?"on":""}">${b}</button>`).join("")}</div>`;e.innerHTML=`
    <div class="screen catalog">
      <div class="game-top"><button class="icon-btn" id="back">‹ Меню</button></div>
      <div class="brand"><h1>Тест-режим</h1>
        <p>Перемотка времени и состояние — чтобы проверять стрик, энергию, триал и пейволл без ожидания. На пользователей не влияет.</p></div>

      <div class="card" style="text-align:left">
        <div class="seg-label">Время · сейчас «${a}» ${s!==0?`(смещение ${s>0?"+":""}${s} дн.)`:"(реальное)"}</div>
        <div class="seg">
          <button data-act="d-1">−1 день</button>
          <button data-act="d+1">+1 день</button>
          <button data-act="d+7">+7 дней</button>
          <button data-act="d0">Реальное</button>
        </div>

        <div class="seg-label" style="margin-top:12px">Стрик: ${le()} · заморозки: ${Jt()}</div>
        <div class="seg">
          <button data-act="s0">Стрик 0</button>
          <button data-act="s6">Стрик 6</button>
          <button data-act="s13">Стрик 13</button>
          <button data-act="fz">Заморозка +1</button>
        </div>

        <div class="seg-label" style="margin-top:12px">Энергия: ${ft()}/${Pt()}</div>
        <div class="seg">
          <button data-act="e0">0</button>
          <button data-act="e1">1</button>
          <button data-act="emax">Полная</button>
        </div>

        ${i(`Пейволл (soft, ${Pe}/день): сегодня использовано ${Jn()}`,[["pw-on","Вкл",Xt()],["pw-off","Выкл",!Xt()],["pw-use","+1 распевка",!1]])}

        <div class="seg-label" style="margin-top:12px">Триал: ${o==null?"не начат":o>0?`активен, осталось ${o} дн.`:"истёк"}</div>
        <div class="seg">
          <button data-act="tr-start">Старт</button>
          <button data-act="tr-reset">Сброс</button>
        </div>

        ${i("Тариф",[["tier-free","Free",xt()==="free"],["tier-std","Standard",xt()==="standard"],["tier-pro","Pro",xt()==="pro"]])}

        <div class="seg-label" style="margin-top:12px">Программа: сдано ${Dt().length}/${at.length}</div>
        <div class="seg">
          <button data-act="bl-all">Открыть все блоки</button>
          <button data-act="bl-none">Закрыть все</button>
        </div>
      </div>

      <button class="btn btn-ghost" id="simNew" style="width:100%">🧪 Симуляция нового пользователя (сброс + пейволл вкл)</button>
      <button class="btn btn-ghost" id="exitDev" style="width:100%">Выключить тест-режим</button>
      <p class="hint">Смещение времени живёт отдельно от прогресса: «Реальное» возвращает время, не трогая данные.</p>
    </div>
  `,document.getElementById("back").addEventListener("click",t),document.getElementById("exitDev").addEventListener("click",()=>{Qt(!1),fe(),t()}),document.getElementById("simNew").addEventListener("click",()=>{Pn(),fe(),Qt(!0),ge(!0),n()});const c={"d-1":()=>be(-1),"d+1":()=>be(1),"d+7":()=>be(7),d0:()=>fe(),s0:()=>pe(0),s6:()=>pe(6),s13:()=>pe(13),fz:()=>Xs(Jt()+1),e0:()=>Gt(0),e1:()=>Gt(1),emax:()=>Gt(Pt()),"pw-on":()=>ge(!0),"pw-off":()=>ge(!1),"pw-use":()=>Xn(),"tr-start":()=>Kn(),"tr-reset":()=>ya(),"tier-free":()=>jt("free"),"tier-std":()=>jt("standard"),"tier-pro":()=>jt("pro"),"bl-all":()=>ka(at.map(l=>l.id)),"bl-none":()=>xa()};e.querySelectorAll("[data-act]").forEach(l=>{l.addEventListener("click",()=>{c[l.dataset.act](),n()})})}function $i(e,{onExit:t,onTrialStarted:n,onTeacher:s}){const a=Fe()!=null;e.innerHTML=`
    <div class="screen summary">
      <div class="game-top"><button class="icon-btn" id="back">‹ Меню</button></div>
      <div class="brand">
        <h1>На сегодня — всё 🎉</h1>
        <p>Ты прошёл ${Pe} бесплатных распевок за день. Голосу полезен отдых — а завтра лимит обновится.</p>
      </div>
      <div class="card" style="text-align:left">
        <p class="how"><b>Хочешь без лимитов?</b></p>
        <ul class="safety-list" style="margin-top:10px">
          <li>Все распевки и блоки программы без ограничений</li>
          <li>Все лады (Standard/Pro)</li>
          <li>Тёмная сцена и грув-подложки</li>
        </ul>
        ${a?'<p class="hint" style="margin-top:12px">Пробный период уже использован. Подписка появится вместе с релизом в магазинах приложений.</p>':`<button class="btn btn-primary" id="trial" style="width:100%;margin-top:14px">Попробовать 7 дней бесплатно</button>
             <p class="hint" style="margin-top:8px">Без карты и автосписаний — просто открываем всё на неделю.</p>`}
      </div>
      <div class="teacher-cta">
        <span>Быстрее всего голос растёт с живым педагогом.</span>
        <button class="btn btn-ghost" id="teacher">Бесплатный пробный урок</button>
      </div>
      <button class="btn btn-ghost" id="tomorrow" style="width:100%">Вернусь завтра</button>
    </div>
  `,document.getElementById("back").addEventListener("click",t),document.getElementById("tomorrow").addEventListener("click",t),document.getElementById("teacher").addEventListener("click",s);const o=document.getElementById("trial");o&&o.addEventListener("click",()=>{Kn(),zt(2),n()})}const ki=[{icon:"🎤",title:"Микрофон",body:"Круглая кнопка внизу экрана включает и выключает микрофон. Мы слушаем только высоту тона — ничего не записываем и не отправляем. Если браузер не дал доступ — нажми кнопку ещё раз и выбери «Разрешить»."},{icon:"🔊",title:"Плохо слышно подсказку?",body:"Настройки → «Громкость подсказки». На телефоне ставь «Громко» или «Макс». Звук подсказки (пиано/гитара/мягкий) — там же."},{icon:"🎧",title:"Звук опаздывает или «не туда» засчитывает?",body:"Это задержка вывода. Настройки → «Вывод звука»: выбери Динамик / Провод / Bluetooth (Bluetooth опаздывает сильнее всего). Для идеала — «Точная калибровка»: приложение само измерит задержку твоего устройства."},{icon:"🎵",title:"Подсказка тоном",body:"Без наушников подсказка звучит КОРОТКО перед нотой и молчит, пока поёшь — иначе микрофон ловит динамик. В наушниках включи тумблер «Наушники» — и подсказка будет вести тебя непрерывно."},{icon:"⚙️",title:"Темп и настройки прямо в упражнении",body:"На экране упражнения есть панель «Темп и подсказка тоном» (значок ⚙) — меняй темп на лету, проход мягко перезапустится. Продвинутое (тембр, грув, наушники) — под спойлером «Ещё настройки звука»."},{icon:"🎼",title:"Распевка идёт по твоему диапазону",body:"Каждая распевка начинается от низа твоего диапазона, поднимается по полутонам до верха и возвращается вниз — как на занятии с педагогом. Счётчик повторов виден сверху (например 3/17). Выйти можно в любой момент."},{icon:"🎹",title:"Лад распевок",body:"Для гаммовых распевок лад (мажор/минор и другие) выбирается прямо на экране перед стартом. Чем выше тариф — тем больше ладов открыто."},{icon:"⚡",title:"Энергия, стрик и заморозка",body:"Энергия тратится при провале (<40%) и копится за точные распевки; сама восстанавливается со временем. Стрик 🔥 — дни подряд. Заморозка ❄ спасает один пропущенный день (даётся за каждые 7 дней подряд)."},{icon:"🏆",title:"Программа обучения",body:"Главный путь: блоки открываются по очереди, каждый завершается экзаменом. Внутри блока после каждого упражнения — кнопка «Дальше» к следующему. Застрял — кнопка «Урок с педагогом» внизу."},{icon:"🌙",title:"Тёмный экран пения",body:"Настройки → «Тёмный экран пения»: светящийся след голоса на тёмной сцене. Дело вкуса — попробуй оба."}];function xi(e,{onExit:t,onSettings:n}){const s=ki.map(o=>`
    <div class="card guide-card">
      <div class="guide-head"><span class="guide-ic">${o.icon}</span><b>${o.title}</b></div>
      <p class="how">${o.body}</p>
    </div>`).join("");e.innerHTML=`
    <div class="screen catalog">
      <div class="game-top"><button class="icon-btn" id="back">‹ Меню</button></div>
      <div class="brand"><h1>Как тут всё устроено</h1>
        <p>Короткий гид: что где находится и что подкрутить, если что-то не получается.</p></div>
      ${s}
      ${n?'<button class="btn btn-primary" id="toSettings" style="width:100%">Открыть настройки</button>':""}
      <p class="hint">Гид всегда под лампочкой 💡 в нижнем левом углу главного экрана.</p>
    </div>
  `,document.getElementById("back").addEventListener("click",t);const a=document.getElementById("toSettings");a&&n&&a.addEventListener("click",n)}const B=document.getElementById("app"),j=new zs({fftSize:2048});let K=null,ye=null;const Mi=60,Yt=[{label:"Мычание по гамме",sub:"«М» · I-II-III-II-I",ic:"lips",cat:"warm",make:e=>ze(e,Y())},{label:"Губной тренаж «brrr»",sub:"brrr / «Р» · 5 нот + квинта",ic:"wave",cat:"warm",make:e=>Ne(e,Y())},{label:"Удержание ноты",sub:"держать ровный звук",ic:"fork",cat:"warm",make:e=>rs(e,8)},{label:"Гамма «Ма-Мэ»",sub:"попадать в ноты гаммы",ic:"stairs",cat:"pitch",make:e=>$s(e,Y())},{label:"Беглость «Ма»",sub:"быстрые ноты — как в рекламе",ic:"bolt",cat:"pitch",make:e=>ks(e,Y())},{label:"Октавный скачок",sub:"прыжок на октаву и назад",ic:"arrows",cat:"pitch",make:e=>xs(e)},{label:"Цепочка гласных",sub:"Ми-Ме-Ма · выравнивание",ic:"lips",cat:"vowel",make:e=>os(e,Y())},{label:"Пять гласных",sub:"И-Э-А-О-У · позиция",ic:"lips",cat:"vowel",make:e=>es(e)},{label:"Лесенка гласных",sub:"И-Э-А-О-У · точность",ic:"stairs",cat:"vowel",make:e=>ns(e,Y())},{label:"Волна гласных",sub:"мотив с паузами + спуск",ic:"wave",cat:"vowel",make:e=>is(e,Y())},{label:"Качели на квинте",sub:"И-Э-А-О-У · скачки",ic:"arrows",cat:"vowel",make:e=>as(e,Y())},{label:"Зигзаг",sub:"гибкость на гласных",ic:"bolt",cat:"vowel",make:e=>ss(e,Y())},{label:"Скачок к V ступени",sub:"Ям · атака интервала",ic:"arrows",cat:"pitch",make:e=>cs(e,Y())},{label:"Ладовая «ЯМ»",sub:"гамма лада вверх-вниз",ic:"stairs",cat:"pitch",make:e=>ls(e,Y())},{label:"Вибрато",sub:"ровная волна голосом",ic:"wave",cat:"vib",make:e=>ds(e)},{label:"Раскачка вибрато",sub:"А · запуск вибрато",ic:"wave",cat:"vib",make:e=>us(e)},{label:"Тёплый тон",sub:"Мо · качество тембра",ic:"fork",cat:"vib",make:e=>ms(e)},{label:"Ровный тон на двух",sub:"А · единый тембр",ic:"fork",cat:"vib",make:e=>hs(e)},{label:"Через регистры",sub:"Но · passaggio",ic:"arrows",cat:"reg",make:e=>vs(e)},{label:"Октавная связка",sub:"А · соединить регистры",ic:"arrows",cat:"reg",make:e=>bs(e)},{label:"Белтинг — гамма",sub:"Эй · яркая подача",ic:"bolt",cat:"reg",make:e=>fs(e)},{label:"Белт-арпеджио",sub:"Эй · опёртый верх",ic:"arrows",cat:"reg",make:e=>ps(e)},{label:"Стаккато-арпеджио",sub:"Та · артикуляция",ic:"bolt",cat:"artic",make:e=>gs(e)},{label:"Слоги по группам",sub:"Та-Ка · дикция",ic:"lips",cat:"artic",make:e=>ys(e)},{label:"Фигура-волчок",sub:"Ма · выносливость",ic:"stairs",cat:"artic",make:e=>ws(e)},{label:"Выносливая гамма",sub:"Ма · длинный пробег",ic:"stairs",cat:"artic",make:e=>Es(e)}],Li=[["warm","Разогрев"],["vowel","Гласные"],["pitch","Точность и гибкость"],["vib","Вибрато и тембр"],["reg","Регистры и сила"],["artic","Дикция и выносливость"]];function Ft(){const e=st(),t=e&&ut(e.key);return t?t.center:Mi}function se(){const e=st(),t=e&&ut(e.key);return e&&e.low!=null&&e.high!=null?{low:e.low,high:e.high}:t?{low:t.low,high:t.high}:{low:48,high:72}}function it(){if(!K)return;const e=st(),t=e&&ut(e.key);t?K.setRange(W(t.low-5),W(t.high+5)):K.setRange(60,1200)}const Ti=["Голос — это мышца. Сегодня сделаем её сильнее.","Дыши животом — и звук польётся сам.","Чисто — не значит громко. Решает точность.","Каждая распевка чуть-чуть расширяет диапазон.","Расслабь челюсть и плечи — голос любит свободу.","Лучшие певцы тоже начинали с простого «мычания».","Тёплый голос начинается с тёплого дыхания.","Не тянись за верхней нотой горлом — она придёт сама.","5 минут каждый день дают больше, чем час раз в неделю.","Улыбнись — и тембр станет светлее.","Зевни перед распевкой — гортань скажет спасибо.","Пой так, будто тебя уже любят слушать."];function Si(e){const t=e.slice();for(let n=t.length-1;n>0;n--){const s=Math.floor(Math.random()*(n+1));[t[n],t[s]]=[t[s],t[n]]}return t}function Ii(){Q();const e=Si(Ti);B.innerHTML=`
    <div class="screen splash">
      <div class="splash-core">
        <div class="eq" aria-hidden="true"><i></i><i></i><i></i><i></i><i></i></div>
        <h1 class="splash-title">Распевка</h1>
        <p class="splash-tip" id="tip">${e[0]}</p>
      </div>
      <div class="splash-bar"><i></i></div>
    </div>
  `;const t=window.matchMedia&&window.matchMedia("(prefers-reduced-motion: reduce)").matches;setTimeout(Bi,t?1600:2800)}function Bi(){Ri();try{new URLSearchParams(location.search).has("dev")&&Qt(!0)}catch{}if(!st()&&!x().welcomed){Ai();return}D()}function Ai(){Q(),B.innerHTML=`
    <div class="screen welcome">
      <div class="brand">
        <div class="eq eq-static" aria-hidden="true"><i></i><i></i><i></i><i></i><i></i></div>
        <h1>Привет! Это «Распевка»</h1>
        <p>Игровой тренажёр голоса: пой — и смотри, как твой голос попадает в ноты. Начнём с волшебного: за минуту узнаем твой тембр голоса и диапазон.</p>
      </div>
      <button class="btn btn-primary" id="wlc-go" style="width:100%">🎤 Определить мой голос · 1 минута</button>
      <button class="btn btn-ghost" id="wlc-skip" style="width:100%">Сначала осмотрюсь</button>
      <p class="hint">Понадобится доступ к микрофону — мы слушаем только высоту тона, ничего не записываем и не отправляем.</p>
    </div>
  `;const e=()=>P({...x(),welcomed:!0});document.getElementById("wlc-skip").addEventListener("click",()=>{e(),D()}),document.getElementById("wlc-go").addEventListener("click",()=>{e(),X(()=>Ve(B,j,K,{onDone:()=>{it(),Ci()},onExit:D}))})}function Ci(){Q(),B.innerHTML=`
    <div class="screen welcome">
      <div class="brand"><h1>Отлично! 🎉</h1>
        <p>Упражнения уже подстроились под твой голос. Попробуем первую распевку — мягкое мычание, 1 минута.</p></div>
      <button class="btn btn-primary" id="fe-go" style="width:100%">Первая распевка →</button>
      <button class="btn btn-ghost" id="fe-guide" style="width:100%">💡 Как тут всё устроено · 1 минута</button>
      <button class="btn btn-ghost" id="fe-menu" style="width:100%">В меню</button>
    </div>
  `,document.getElementById("fe-go").addEventListener("click",()=>ie(0)),document.getElementById("fe-guide").addEventListener("click",Hs),document.getElementById("fe-menu").addEventListener("click",D)}let vt="off";async function Cs(){try{if(!j.ready){j.setAGC(At());const{sampleRate:e}=await j.start();K||(K=new Ns(e,{fftSize:2048,minClarity:.85})),j.setSensitivity(qe()),ce(de()),it()}return vt="listening",ae(),!0}catch{return vt="denied",ae(),!1}}async function Hi(){if(vt==="listening"){try{await j.suspend()}catch{}vt="off",ae()}else await Cs()}function Ri(){const e=document.getElementById("mic-fab");e&&(e.hidden=!1,e.__wired||(e.addEventListener("click",Hi),e.__wired=!0),ae())}function ae(){const e=document.getElementById("mic-fab");if(!e)return;e.className="mic-fab "+vt;const t=e.querySelector(".mic-fab-txt");t&&(t.textContent=vt==="listening"?"Слушаю":vt==="denied"?"Нет доступа · нажми":"Включить микрофон"),e.setAttribute("aria-pressed",vt==="listening"?"true":"false")}async function X(e){if(!await Cs()){qi(e);return}e()}function qi(e){Q(),B.innerHTML=`
    <div class="screen">
      <div class="game-top"><button class="icon-btn" id="back">‹ Меню</button></div>
      <div class="brand"><h1>Нужен микрофон</h1>
        <p>Чтобы слышать твой голос, разреши доступ к микрофону. На телефоне нужен HTTPS, в браузере — «Разрешить».</p></div>
      <div class="card">
        <p class="hint" style="margin-bottom:16px">Нажми кнопку и выбери «Разрешить». Микрофон можно выключить в любой момент кнопкой внизу экрана.</p>
        <button class="btn btn-primary" id="grant" style="width:100%">Разрешить микрофон</button>
      </div>
    </div>
  `,document.getElementById("back").addEventListener("click",D),document.getElementById("grant").addEventListener("click",()=>X(e))}function we(e){return`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">${{mic:'<path d="M12 3a3 3 0 0 0-3 3v6a3 3 0 0 0 6 0V6a3 3 0 0 0-3-3z"/><path d="M5 11a7 7 0 0 0 14 0M12 18v3"/>',chart:'<path d="M4 20V10M10 20V4M16 20v-7M22 20H2"/>',tuner:'<circle cx="12" cy="12" r="8"/><path d="M12 12l4-3"/><path d="M12 4v2M12 18v2M4 12h2M18 12h2"/>',wave:'<path d="M2 12h2l2-6 3 14 3-12 2 8 2-4h6"/>',note:'<circle cx="7" cy="18" r="3"/><circle cx="18" cy="16" r="3"/><path d="M10 18V5l11-2v13"/>',lips:'<path d="M3 12c4-5 14-5 18 0-4 5-14 5-18 0z"/><path d="M3 12h18"/>',fork:'<path d="M9 3v8a3 3 0 0 0 6 0V3"/><path d="M12 14v7"/>',stairs:'<path d="M3 19h4v-4h4v-4h4V7h4"/>',bolt:'<path d="M13 2 4 14h6l-1 8 9-12h-6z"/>',arrows:'<path d="M8 8l4-4 4 4M8 16l4 4 4-4M12 4v16"/>'}[e]||""}</svg>`}function Pi(){return'<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2c1 3-1 4-2 6-1 1.7-.5 3.5 1 4 .8.3 1-.7.5-1.5 2 .6 3.5 2.3 3.5 4.5A5 5 0 0 1 7 19c-1.7-1-2.7-3-2.5-5 .2-2.4 2-3.7 2.8-5.6C8.4 6 9 3.6 12 2z"/></svg>'}const Ee=e=>e%10===1&&e%100!==11?"день":"дн.";function D(){Q();const e=(y,C)=>{const q=y.make(60).notes;return`
    <button class="ex-tile" data-ex="${C}">
      ${ke(q)}
      <span class="ex-tile-main">${y.label}</span>
      <span class="ex-tile-sub">${y.sub}</span>
    </button>`},t=Li.map(([y,C])=>{const q=Yt.map((V,F)=>V.cat===y?e(V,F):"").join("");return`<div class="cat-title">${C}</div><div class="ex-row">${q}</div>`}).join(""),n=Dt(),s=at.findIndex(y=>!n.includes(y.id)),a=Math.round(n.length/at.length*100),o=Object.entries(Ls).map(([y,C])=>`
    <button class="thin-item" data-breath="${y}"><span>${C.title}</span><span class="thin-sub">${C.kind==="exhale"?"выдох":"дыхание"}</span></button>
  `).join(""),i=Object.entries(Ht).map(([y,C])=>`
    <button class="thin-item" data-rhythm="${y}"><span>${C.name}</span><span class="thin-sub">метроном</span></button>
  `).join(""),c=Is.map((y,C)=>`
    <button class="ex-tile" data-song="${C}">
      ${ke(si(y))}
      <span class="ex-tile-main">${y.name}</span>
      <span class="ex-tile-sub">мелодия · на «ля»</span>
    </button>`).join(""),l=le(),r=st(),u=r&&ut(r.key),b=Qs(),v=Rn(),d=(v.getDate()+v.getMonth())%Yt.length,h=Yt[d],m=De(Y()).name,f=ft(),p=Pt();B.innerHTML=`
    <div class="screen home">
      <header class="home-head">
        <h1>Распевка</h1>
        <div class="home-chips">
          <div class="energy-chip" title="Энергия — копится за точные распевки"><svg viewBox="0 0 24 24" fill="currentColor"><path d="M13 2 4 14h6l-1 8 9-12h-6z"/></svg>${f}/${p}</div>
          ${l>0?`<div class="streak-chip" title="Стрик: ${l} ${Ee(l)} подряд">${Pi()} ${l}</div>`:""}
          ${Jt()>0?`<div class="energy-chip" title="Заморозка стрика — страхует 1 пропущенный день">❄ ${Jt()}</div>`:""}
          ${$a()?'<button class="gear-btn" data-dev aria-label="Тест-режим" title="Тест-режим">🧪</button>':""}
          <button class="gear-btn" data-settings aria-label="Настройки"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg></button>
        </div>
      </header>

      <button class="hero-card" id="session">
        <div class="hero-eyebrow">Сегодня</div>
        <div class="hero-title">Полная распевка</div>
        <div class="hero-sub">${b?`Сегодня выполнено ✓${l>0?` · стрик ${l} ${Ee(l)}`:""} — возвращайся завтра`:"Дыхание → распевка · ~10 минут"}</div>
        <span class="hero-arrow">→</span>
      </button>

      <button class="hero-card program-card" data-path>
        <div class="hero-eyebrow">Программа обучения</div>
        <div class="hero-title pc-title">${s===-1?"Все блоки пройдены! 🏆":`Блок ${s+1} · ${at[s].title}`}</div>
        <div class="prog-bar pc-bar"><i style="width:${a}%"></i></div>
        <div class="hero-sub">${n.length} / ${at.length} блоков · каждый завершается экзаменом</div>
        <span class="hero-arrow">→</span>
      </button>

      <div class="tiles">
        <button class="tile tile-hl" data-freesing="1">${we("wave")}<span class="tile-main">Распевайся</span><span class="tile-sub">видеть свой голос</span></button>
        <button class="tile" data-voice="1">${we("mic")}<span class="tile-main">Мой голос</span><span class="tile-sub">${u?u.name:"определить"}</span></button>
        <button class="tile" data-dash="1">${we("chart")}<span class="tile-main">Прогресс</span><span class="tile-sub">${l>0?l+" "+Ee(l)+" подряд":"статистика"}</span></button>
      </div>

      <button class="focus-chip" data-focus>
        <span class="fc-label">Фокус дня — <b>${h.label}</b></span>
        <span class="fc-go">→</span>
      </button>

      <section class="home-sec">
        <div class="sec-title">Свободная практика</div>
        ${t}
      </section>
      <section class="home-sec">
        <div class="sec-title">Дыхание и ритм</div>
        <div class="thin-list">${i}${o}</div>
      </section>
      <section class="home-sec">
        <div class="sec-title">Песни</div>
        <div class="ex-row">${c}</div>
      </section>
      <section class="home-sec">
        <div class="sec-title">Инструменты</div>
        <div class="thin-list">
          <button class="thin-item" data-ear><span>Спой за мной</span><span class="thin-sub">тренировка слуха</span></button>
          <button class="thin-item" data-theory><span>Теория голоса</span><span class="thin-sub">карточки</span></button>
          <button class="thin-item" data-record><span>Запись голоса</span><span class="thin-sub">послушай себя</span></button>
          <button class="thin-item" data-backing><span>Пой под фонограмму</span><span class="thin-sub">распевка с повышением</span></button>
          <button class="thin-item" data-modes><span>Лад распевок</span><span class="thin-sub">${m}</span></button>
        </div>
      </section>
      <button class="thin-item thin-cta" data-teacher style="width:100%"><span>Урок с живым педагогом</span><span class="thin-sub">бесплатный пробный →</span></button>
      <p class="hint">Темп и «подсказку тоном» настраивай прямо в упражнении — значок ⚙.</p>
    </div>
    <!-- вне .screen: у неё transform от entrance-анимации, который ломает position:fixed -->
    <button class="guide-fab" data-guide aria-label="Подсказки" title="Как тут всё устроено">💡</button>
  `,document.getElementById("session").addEventListener("click",()=>{const y=()=>X(()=>{it(),_a(B,j,K,{onExit:D})});x().safetyAccepted?y():Ni(y)});const w=B.querySelector("[data-focus]");w&&w.addEventListener("click",()=>ie(d)),B.querySelector("[data-voice]").addEventListener("click",()=>{X(()=>Ve(B,j,K,{onDone:()=>{it(),D()},onExit:D}))}),B.querySelector("[data-dash]").addEventListener("click",()=>Ua(B,{onExit:D})),B.querySelector("[data-freesing]").addEventListener("click",()=>{X(()=>{const y=se();Ka(B,j,K,{onExit:()=>{it(),D()},lowMidi:y.low,highMidi:y.high})})}),B.querySelectorAll("[data-ex]").forEach(y=>{y.addEventListener("click",()=>ie(Number(y.dataset.ex)))}),B.querySelectorAll("[data-breath]").forEach(y=>{y.addEventListener("click",()=>X(()=>Ts(B,j,y.dataset.breath,{onExit:D})))}),B.querySelectorAll("[data-rhythm]").forEach(y=>{y.addEventListener("click",()=>Ms(B,j,Ft(),Ht[y.dataset.rhythm],{onExit:D}))});const k=B.querySelector("[data-path]");k&&k.addEventListener("click",_e);const H=B.querySelector("[data-ear]");H&&H.addEventListener("click",()=>X(()=>{it(),Ss(B,j,K,{onExit:D,root:Ft()})}));const R=B.querySelector("[data-theory]");R&&R.addEventListener("click",()=>Za(B,{onExit:D}));const g=B.querySelector("[data-record]");g&&g.addEventListener("click",()=>X(()=>di(B,j,{onExit:D})));const S=B.querySelector("[data-backing]");S&&S.addEventListener("click",()=>X(()=>{const y=se();vi(B,j,K,{onExit:()=>{it(),D()},lowMidi:y.low,highMidi:y.high})}));const E=B.querySelector("[data-modes]");E&&E.addEventListener("click",Di);const $=B.querySelector("[data-settings]");$&&$.addEventListener("click",Rt);const M=B.querySelector("[data-teacher]");M&&M.addEventListener("click",()=>Nt(D)),B.querySelectorAll("[data-song]").forEach(y=>{y.addEventListener("click",()=>qs(Number(y.dataset.song)))});const I=B.querySelector("[data-guide]");I&&I.addEventListener("click",Hs);const T=B.querySelector("[data-dev]");T&&T.addEventListener("click",Tn);const A=B.querySelector(".home-head h1");if(A){let y=0,C=0;A.addEventListener("click",()=>{const q=Date.now();y=q-C<600?y+1:1,C=q,y>=7&&(y=0,Qt(!0),Tn())})}}function Tn(){Q(),As(B,{onExit:D})}function Hs(){Q(),xi(B,{onExit:D,onSettings:Rt})}function Fi(){Q(),$i(B,{onExit:D,onTrialStarted:D,onTeacher:()=>Nt(D)})}function Rs(e){if(Ea()){Fi();return}Xt()&&Xn(),e()}function ie(e,t=!0){if(t){Rs(()=>Sn(e,t));return}Sn(e,t)}function oe(e){const t=se(),n=e(60),s=Math.min(...n.notes.map(c=>c.midi))-60,a=t.low-s,o=e(a),i=Oe(o,t.low,t.high,48);return{ex:o,reps:i}}function Sn(e,t){X(()=>{it();const n=o=>Yt[e].make(o),{ex:s,reps:a}=oe(n);ct(B,j,K,s,{explain:t,reps:a,rebuild:()=>oe(n).ex,onExit:D,onAgain:()=>ie(e,!1)})})}function qs(e,t=!0){if(t){Rs(()=>In(e,t));return}In(e,t)}function In(e,t){X(()=>{const n=Is[e].make(Ft());ct(B,j,K,n,{explain:t,reps:[0],onExit:D,onAgain:()=>qs(e,!1)})})}function Di(){Q(),ii(B,{onExit:D})}function _e(){Q(),ci(B,{blocks:at,examsPassed:Dt(),onExit:D,onOpenBlock:Tt,onSchool:Nt})}function Tt(e){Q();const t=at[e];li(B,{block:t,index:e,examsPassed:Dt(),doneItems:aa(t.id),onExit:_e,onRunItem:Le,onExam:me,onSchool:Nt})}function Le(e,t){const n=e.items[t],s=at.indexOf(e),a=e.items[t+1],o=()=>a?Le(e,t+1):me(e);X(()=>{if(it(),n.t==="breath"){Ts(B,j,n.id,{onExit:()=>Tt(s),onDone:()=>cn(e.id,n.id),onNext:o,nextLabel:a?`Дальше: ${a.name}`:"К экзамену блока"});return}const i=r=>Me[n.id](r,Y()),{ex:c,reps:l}=oe(i);ct(B,j,K,c,{explain:!0,reps:l,rebuild:()=>oe(i).ex,onResult:r=>{r.pct>=.5&&cn(e.id,n.id)},onExit:()=>Tt(s),onAgain:()=>Le(e,t),nextLabel:a?`Дальше: ${a.name}`:"К экзамену блока",onNext:o})})}function me(e){X(()=>{it();const t=Me[e.exam.exId](Ft(),Y()),n=se(),s=Oe(t,n.low,n.high,2);ct(B,j,K,t,{explain:!0,reps:s,rebuild:()=>Me[e.exam.exId](Ft(),Y()),onComplete:a=>zi(e,a),onExit:()=>Tt(at.indexOf(e)),onAgain:()=>me(e)})})}function zi(e,t){Q();const n=Math.round(t.pct*100),s=t.pct>=e.exam.pass;s?sa(e.id):ft()>0&&$e(-1);const a=at.indexOf(e),o=s&&a+1<at.length,i=s?"var(--green)":"var(--coral)";B.innerHTML=`
    <div class="screen summary">
      <div class="verdict" style="color:${i}">${s?"Экзамен сдан!":"Пока не сдан"}</div>
      <div class="big-pct" style="color:${i}">${n}<span>%</span></div>
      <p class="hint">${s?`Блок «${e.title}» пройден.${o?" Открыт следующий блок.":""}`:`Нужно ${Math.round(e.exam.pass*100)}%. Энергия −1 (восстановится со временем). Можно пересдать сразу.`}</p>
      <div class="teacher-cta"><span>Разобрать ошибки с педагогом — быстрее.</span><button class="btn btn-ghost" id="toSchool">На урок</button></div>
      <div class="row">
        <button class="btn btn-ghost" id="toBlock">К блоку</button>
        <button class="btn btn-primary" id="primary">${s?o?"Следующий блок":"К программе":"Пересдать"}</button>
      </div>
    </div>`,document.getElementById("toBlock").addEventListener("click",()=>Tt(a)),document.getElementById("toSchool").addEventListener("click",Nt),document.getElementById("primary").addEventListener("click",()=>{s?o?Tt(a+1):_e():me(e)})}function Nt(e){Q(),fi(B,{onExit:typeof e=="function"?e:D})}function Rt(){Q(),pi(B,j,{onExit:D,onVoice:()=>X(()=>Ve(B,j,K,{onDone:()=>{it(),Rt()},onExit:Rt})),onCalibrate:()=>X(()=>Ei(B,j,{onExit:Rt}))})}function Ni(e){Q(),B.innerHTML=`
    <div class="screen">
      <div class="game-top"><button class="icon-btn" id="safety-back">‹ Меню</button></div>
      <div class="brand"><h1>Береги голос</h1></div>
      <div class="card">
        <ul class="safety-list">
          <li><b>Больно — остановись.</b> Любой дискомфорт в горле = стоп и отдых.</li>
          <li><b>Разогрев обязателен.</b> Не начинай с высоких или быстрых упражнений.</li>
          <li><b>Не форсируй верх.</b> Расширение диапазона — это недели, не один день.</li>
          <li><b>Не пой на больном горле.</b> Связки отекают — высок риск травмы.</li>
          <li><b>Пей воду</b> и делай перерывы — не больше 20–30 минут подряд.</li>
        </ul>
        <p class="hint" style="margin-top:14px">
          Приложение помогает тренироваться, но <b>не заменяет педагога или фониатра</b>.
          При проблемах с голосом обратись к специалисту.
        </p>
        <button class="btn btn-primary" id="accept" style="width:100%;margin-top:18px">Понятно, начать</button>
      </div>
    </div>
  `,document.getElementById("accept").addEventListener("click",()=>{P({...x(),safetyAccepted:!0}),e()}),document.getElementById("safety-back").addEventListener("click",D)}function Q(){ye&&cancelAnimationFrame(ye),ye=null}"serviceWorker"in navigator&&window.addEventListener("load",()=>{navigator.serviceWorker.register("./sw.js").catch(()=>{})});Ii();
