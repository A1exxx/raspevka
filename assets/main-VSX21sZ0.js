import{m as W,c as Pt,a as cn,f as Pn,h as rt,M as js,P as Gs}from"./note-map-ClIaVDR2.js";class Ws{constructor(t){this.notes=Array.from({length:t},()=>({greenMs:0,scoredMs:0,activeMs:0,sumCents:0,centsMs:0})),this.g={ms:0,sumC:0,sumC2:0,reversals:0,lastC:null,lastDir:0}}record(t,n,s,a,o=null){const i=this.notes[t];if(i&&(i.activeMs+=s,!!a&&(i.scoredMs+=s,n==="green"?i.greenMs+=s:n==="yellow"&&(i.greenMs+=s*.5),o!=null&&Number.isFinite(o)))){i.sumCents+=o*s,i.centsMs+=s;const c=this.g;if(c.ms+=s,c.sumC+=o*s,c.sumC2+=o*o*s,c.lastC!=null){const l=o-c.lastC;if(Math.abs(l)>2){const r=l>0?1:-1;c.lastDir&&r!==c.lastDir&&(c.reversals+=1),c.lastDir=r}}c.lastC=o}}result(){let t=0,n=0,s=0,a=0,o=0;for(const d of this.notes)t+=d.greenMs,n+=d.activeMs,s+=d.sumCents,a+=d.centsMs,d.activeMs>0&&d.greenMs/d.activeMs>=.5&&(o+=1);const i=n>0?t/n:0,c=i>=.85?3:i>=.6?2:i>=.35?1:0,l=this.g;let r=0;if(l.ms>0){const d=l.sumC/l.ms,b=Math.max(0,l.sumC2/l.ms-d*d);r=Math.sqrt(b)}const u=l.ms/1e3,v=u>0?l.reversals/2/u:0,h=v>=3.5&&v<=8.5&&r>=15&&r<=130;return{pct:i,stars:c,notesHit:o,notesTotal:this.notes.length,avgCents:a>0?s/a:0,perNote:this.notes.map(d=>d.activeMs>0?d.greenMs/d.activeMs:0),stability:r,vibrato:{present:h,rateHz:v}}}}const ln={light:{grid:"rgba(27,36,48,.07)",gridC:"rgba(27,36,48,.18)",label:"rgba(27,36,48,.42)",hitLine:"rgba(14,141,127,.6)",note:"rgba(14,141,127,.26)",noteActive:"rgba(14,141,127,.95)",noteGlow:"rgba(14,141,127,.5)",green:"#2fab84",yellow:"#e0a64a",red:"#e0544b",free:"#0e8d7f",glow:0},dark:{grid:"rgba(255,255,255,.055)",gridC:"rgba(255,255,255,.14)",label:"rgba(255,255,255,.45)",hitLine:"rgba(61,229,201,.7)",note:"rgba(61,229,201,.2)",noteActive:"rgba(61,229,201,.95)",noteGlow:"rgba(61,229,201,.85)",green:"#3ee6a8",yellow:"#ffc24d",red:"#ff6b61",free:"#3de5c9",glow:10}};class Us{constructor(t,n,s={}){this.theme=ln[s.theme]||ln.light,this.canvas=t,this.ctx=t.getContext("2d"),this.ex=n,this.secPerBeat=60/(n.tempo||90),this.greenCents=n.greenCents||20,this.yellowCents=n.yellowCents||40,this.pxPerSec=s.pxPerSec||150,this.hitFrac=s.hitFrac??.26,this.leadIn=s.leadIn??2.2;let a=this.leadIn;this.timed=n.notes.map(i=>{const c=i.beats*this.secPerBeat,l={midi:i.midi,hz:W(i.midi),start:a,end:a+c,dur:c};return a+=c+(i.gap||0)*this.secPerBeat,l}),this.totalTime=a+.6;const o=n.notes.map(i=>i.midi);this.minMidi=Math.min(...o)-3,this.maxMidi=Math.max(...o)+3,this.trail=[]}yFor(t,n){const s=W(this.minMidi),a=W(this.maxMidi),o=Math.max(s,Math.min(a,t)),i=Math.log2(o/s)/Math.log2(a/s);return n-i*n}activeAt(t){for(let n=0;n<this.timed.length;n++)if(t>=this.timed[n].start&&t<this.timed[n].end)return{index:n,seg:this.timed[n]};return null}evaluate(t,n,s){const a=this.activeAt(t);if(!a)return{index:-1,zone:null,voiced:!1};if(!s||!n)return{index:a.index,zone:"red",voiced:!1};const o=Math.abs(Pt(n,a.seg.hz));return{index:a.index,zone:cn(o,this.greenCents,this.yellowCents),voiced:!0}}draw(t,n,s){const a=this.ctx,o=this.canvas.clientWidth,i=this.canvas.clientHeight,c=o*this.hitFrac;a.clearRect(0,0,o,i);const l=this.theme;for(let p=Math.ceil(this.minMidi);p<=this.maxMidi;p++){const E=this.yFor(W(p),i),k=Pn(p),C=k&&k.startsWith("C");a.strokeStyle=C?l.gridC:l.grid,a.lineWidth=1,a.beginPath(),a.moveTo(0,E),a.lineTo(o,E),a.stroke(),C&&(a.fillStyle=l.label,a.font="10px Inter, sans-serif",a.fillText(k,4,E-3))}a.strokeStyle=l.hitLine,a.lineWidth=2,a.setLineDash([5,6]),a.beginPath(),a.moveTo(c,0),a.lineTo(c,i),a.stroke(),a.setLineDash([]);const r=this.activeAt(t),u=r?r.index:-1,v=16;for(let p=0;p<this.timed.length;p++){const E=this.timed[p],k=c+(E.start-t)*this.pxPerSec,C=E.dur*this.pxPerSec;if(k+C<-20||k>o+20)continue;const H=this.yFor(E.hz,i),g=p===u,S=8;a.fillStyle=g?l.noteActive:l.note,Ys(a,k,H-v/2,Math.max(C,10),v,S),a.fill(),g&&(a.shadowColor=l.noteGlow,a.shadowBlur=18+l.glow,a.fill(),a.shadowBlur=0)}let h=null,d="#5e6b7a";if(s&&n)if(h=this.yFor(n,i),r){const p=cn(Math.abs(Pt(n,r.seg.hz)),this.greenCents,this.yellowCents);d=p==="green"?l.green:p==="yellow"?l.yellow:l.red}else d=l.free;for(this.trail.push(h);this.trail.length>70;)this.trail.shift();const b=this.trail.length,m=2.2;a.strokeStyle=d,a.lineWidth=3,a.lineJoin="round",a.globalAlpha=.45,l.glow&&(a.shadowColor=d,a.shadowBlur=l.glow),a.beginPath();let f=!1;for(let p=0;p<b;p++){const E=this.trail[p];if(E==null){f=!1;continue}const k=c-(b-1-p)*m;f?a.lineTo(k,E):(a.moveTo(k,E),f=!0)}a.stroke(),a.shadowBlur=0;for(let p=0;p<b;p++){const E=this.trail[p];if(E==null)continue;const k=c-(b-1-p)*m;a.globalAlpha=.12+p/b*.5,a.fillStyle=d,a.beginPath(),a.arc(k,E,2,0,Math.PI*2),a.fill()}a.globalAlpha=1,h!=null&&(a.fillStyle=d,a.shadowColor=d,a.shadowBlur=16,a.beginPath(),a.arc(c,h,7,0,Math.PI*2),a.fill(),a.shadowBlur=0)}}function Ys(e,t,n,s,a,o){const i=Math.min(o,a/2,s/2);e.beginPath(),e.moveTo(t+i,n),e.arcTo(t+s,n,t+s,n+a,i),e.arcTo(t+s,n+a,t,n+a,i),e.arcTo(t,n+a,t,n,i),e.arcTo(t,n,t+s,n,i),e.closePath()}const Ks=(()=>{try{return/Mobi|Android|iPhone|iPad|iPod/i.test(navigator.userAgent)||(navigator.maxTouchPoints||0)>1}catch{return!1}})(),Js=Ks?2.8:1.8;let qn=Js,kt=null;function le(e){if(!(!Number.isFinite(e)||e<=0)&&(qn=e,kt&&kt.__rtGain))try{kt.__rtGain.gain.setTargetAtTime(e,kt.currentTime,.02)}catch{}}function Fn(e){if(e.__rtMaster)return kt=e,e.__rtMaster;const t=e.createDynamicsCompressor();t.threshold.value=-10,t.knee.value=24,t.ratio.value=4,t.attack.value=.003,t.release.value=.25;const n=e.createGain();return n.gain.value=qn,t.connect(n).connect(e.destination),e.__rtMaster=t,e.__rtGain=n,kt=e,t}function dt(e,t,n=.6,s=0,a=.22,o="piano"){const i=e.currentTime+s,c=e.createGain();c.connect(Fn(e));const l=[];let r=n;const u=(v,h,d,b)=>{const m=e.createOscillator(),f=e.createGain();m.type=v,m.frequency.value=h,f.gain.value=d,m.connect(f).connect(b),m.start(i),m.stop(i+r+.08),l.push(m)};if(o==="piano")r=Math.max(1.6,n),c.gain.setValueAtTime(1e-4,i),c.gain.linearRampToValueAtTime(a,i+.008),c.gain.exponentialRampToValueAtTime(1e-4,i+r),[[1,1],[2,.5],[3,.25],[4,.12]].forEach(([v,h])=>u("sine",t*v,h,c));else if(o==="guitar"){r=Math.max(1.3,n);const v=e.createBiquadFilter();v.type="lowpass",v.frequency.setValueAtTime(3800,i),v.frequency.exponentialRampToValueAtTime(700,i+r),v.connect(c),c.gain.setValueAtTime(1e-4,i),c.gain.linearRampToValueAtTime(a,i+.006),c.gain.exponentialRampToValueAtTime(1e-4,i+r),[[1,1],[2,.32]].forEach(([h,d])=>u("sawtooth",t*h,d,v))}else r=Math.max(.2,n),c.gain.setValueAtTime(0,i),c.gain.linearRampToValueAtTime(a,i+.025),c.gain.setValueAtTime(a,i+Math.max(.05,r-.1)),c.gain.linearRampToValueAtTime(0,i+r),u("triangle",t,1,c),u("triangle",t*2,.18,c);return{dur:n,stop(){try{l.forEach(v=>{v.stop(),v.disconnect()}),c.disconnect()}catch{}}}}function rn(e,t,n=0,s=1.4,a=.14,o="piano"){return[0,4,7].forEach(i=>{const c=440*Math.pow(2,(t+i-69)/12);dt(e,c,s,n,a,o)}),s}function Xs(e,t,n,s="piano",a=.22){const o=60/(n||90);let i=0;const c=[];for(const l of t){const r=440*Math.pow(2,(l.midi-69)/12);c.push(dt(e,r,Math.max(.18,l.beats*o*.92),i,a,s)),i+=(l.beats+(l.gap||0))*o}return{dur:i,stop(){c.forEach(l=>l&&l.stop&&l.stop())}}}function Jt(e,t=0,n=!1){const s=e.currentTime+t,a=e.createOscillator(),o=e.createGain();a.frequency.value=n?1600:1050;const i=n?.4:.26;o.gain.setValueAtTime(1e-4,s),o.gain.exponentialRampToValueAtTime(i,s+.005),o.gain.exponentialRampToValueAtTime(1e-4,s+.08),a.connect(o).connect(Fn(e)),a.start(s),a.stop(s+.1)}function Qs(e,t,n,s=.05){const a=[0,7,12].map(o=>{const i=440*Math.pow(2,(t+o-69)/12);return dt(e,i,n,0,s,"soft")});return{stop(){try{a.forEach(o=>o.stop())}catch{}}}}function dn(e){if(e.__noise)return e.__noise;const t=e.createBuffer(1,Math.floor(e.sampleRate*.5),e.sampleRate),n=t.getChannelData(0);for(let s=0;s<n.length;s++)n[s]=Math.random()*2-1;return e.__noise=t,t}const un={pop:{kick:[0,4],snare:[2,6],hatOpen:[7],bass:[[0,0],[3,0],[4,7]],stab:[3,7],swing:0},funk:{kick:[0,3,6],snare:[2,6],hatOpen:[3,7],bass:[[0,0],[1,7],[4,0],[6,7]],stab:[1,3,5,7],swing:.18},soft:{kick:[0,4],snare:[6],hatOpen:[],bass:[[0,0],[4,7]],stab:[3],swing:0},drive:{kick:[0,2,4,6],snare:[2,6],hatOpen:[],bass:[[0,0],[2,0],[4,7],[6,7]],stab:[4],swing:0},march:{kick:[0,2,4,6],snare:[4],hatOpen:[0,4],bass:[[0,0],[2,7],[4,0],[6,7]],stab:[],swing:0},swing:{kick:[0,4],snare:[2,6],hatOpen:[3,7],bass:[[0,0],[3,5],[4,7],[6,12]],stab:[3,7],swing:.34},ballad:{kick:[0],snare:[4],hatOpen:[],bass:[[0,0],[4,7]],stab:[2,6],swing:0},latin:{kick:[0,3,6],snare:[2,7],hatOpen:[5],bass:[[0,0],[3,7],[6,5]],stab:[2,5],swing:0}};function Zs(e,{rootMidi:t=60,tempo:n=100,dur:s=16,style:a="pop",gain:o=.5,when:i=0}={}){const c=un[a]||un.pop,l=e.currentTime+i,r=60/n,u=r/2,v=r*4,h=Math.ceil(s/v)+1,d=e.createGain();d.gain.value=o;const b=e.createDynamicsCompressor();b.threshold.value=-12,b.ratio.value=4,d.connect(b).connect(e.destination);const m=[],f=g=>{const S=e.createOscillator(),$=e.createGain();S.frequency.setValueAtTime(150,g),S.frequency.exponentialRampToValueAtTime(48,g+.12),$.gain.setValueAtTime(.9,g),$.gain.exponentialRampToValueAtTime(.001,g+.18),S.connect($).connect(d),S.start(g),S.stop(g+.2),m.push(S)},p=g=>{const S=e.createBufferSource();S.buffer=dn(e);const $=e.createBiquadFilter();$.type="bandpass",$.frequency.value=1800,$.Q.value=.7;const w=e.createGain();w.gain.setValueAtTime(.5,g),w.gain.exponentialRampToValueAtTime(.001,g+.14),S.connect($).connect(w).connect(d),S.start(g),S.stop(g+.16),m.push(S)},E=(g,S)=>{const $=e.createBufferSource();$.buffer=dn(e);const w=e.createBiquadFilter();w.type="highpass",w.frequency.value=7e3;const L=e.createGain(),I=S?.12:.035;L.gain.setValueAtTime(.22,g),L.gain.exponentialRampToValueAtTime(.001,g+I),$.connect(w).connect(L).connect(d),$.start(g),$.stop(g+I+.02),m.push($)},k=(g,S,$)=>{const w=e.createOscillator(),L=e.createGain();w.type="triangle",w.frequency.value=W(S),L.gain.setValueAtTime(1e-4,g),L.gain.linearRampToValueAtTime(.4,g+.01),L.gain.setValueAtTime(.4,g+$*.5),L.gain.exponentialRampToValueAtTime(.001,g+$),w.connect(L).connect(d),w.start(g),w.stop(g+$+.02),m.push(w)},C=g=>{[t,t+7,t+12].forEach(S=>{const $=e.createOscillator(),w=e.createGain();$.type="triangle",$.frequency.value=W(S),w.gain.setValueAtTime(1e-4,g),w.gain.linearRampToValueAtTime(.09,g+.008),w.gain.exponentialRampToValueAtTime(.001,g+.17),$.connect(w).connect(d),$.start(g),$.stop(g+.2),m.push($)})},H=t-12;for(let g=0;g<h;g++){const S=l+g*v,$=w=>S+w*u+(w%2?c.swing*u:0);c.kick.forEach(w=>f($(w))),c.snare.forEach(w=>p($(w)));for(let w=0;w<8;w++)E($(w),c.hatOpen.includes(w));c.bass.forEach(([w,L])=>k($(w),H+L,u*1.6)),c.stab.forEach(w=>C($(w)))}return{duck(g){const S=g?o*.25:o;try{d.gain.setTargetAtTime(S,e.currentTime,.04)}catch{}},stop(){try{m.forEach(g=>{try{g.stop()}catch{}g.disconnect&&g.disconnect()}),d.disconnect(),b.disconnect()}catch{}}}}const Ae="raspevka.clock.v1";function Dn(){try{return Number(localStorage.getItem(Ae))||0}catch{return 0}}function vt(){return Date.now()+Dn()}function Nn(){return new Date(vt())}function lt(e=Nn()){return e.toISOString().slice(0,10)}function zn(){return Math.round(Dn()/864e5)}function ta(e){try{localStorage.setItem(Ae,String(Math.round(e)*864e5))}catch{}}function fe(e){ta(zn()+e)}function pe(){try{localStorage.removeItem(Ae)}catch{}}const Ce="raspevka.progress.v1";function x(){try{return JSON.parse(localStorage.getItem(Ce))||{}}catch{return{}}}function F(e){try{localStorage.setItem(Ce,JSON.stringify(e))}catch{}}function On(){try{localStorage.removeItem(Ce)}catch{}}function ea(){const e=x();return e.range&&Number.isFinite(e.range.low)?e.range:null}function Vn(e){const t=x(),n=lt(),s=lt(new Date(vt()-864e5)),a=lt(new Date(vt()-2*864e5));let o=!1;return t.lastDate!==n?(t.lastDate===s?t.streak=(t.streak||0)+1:t.lastDate===a&&(t.freezes||0)>0?(t.freezes-=1,o=!0,t.streak=(t.streak||0)+1):t.streak=1,t.lastDate=n,t.streak>0&&t.streak%7===0&&(t.freezes=Math.min(2,(t.freezes||0)+1))):t.streak||(t.streak=1),t.history=t.history||[],t.history.push({date:n,pct:e.pct,stars:e.stars}),t.history.length>200&&(t.history=t.history.slice(-200)),t.total=(t.total||0)+1,F(t),{streak:t.streak,total:t.total,freezeSpent:o}}function re(){return x().streak||0}function Xt(){return x().freezes||0}function na(e){const t=x();return t.freezes=Math.max(0,Math.min(2,Math.round(e))),F(t),t.freezes}function sa(){const e=lt();return(x().history||[]).some(t=>t.date===e)}function ge(e){const t=x();return t.streak=Math.max(0,Math.round(e)),t.lastDate=lt(),F(t),t.streak}function aa(){return x().history||[]}function ia(){return x().rangeHistory||[]}function oa(){return x().total||0}function ca(e){const t=x();return t.leads=t.leads||[],t.leads.push({ts:vt(),...e}),t.leads.length>50&&(t.leads=t.leads.slice(-50)),F(t),t.leads}function Dt(){return x().examsPassed||[]}function la(e){const t=x();return t.examsPassed=t.examsPassed||[],t.examsPassed.includes(e)||(t.examsPassed.push(e),F(t)),t.examsPassed}function ra(e){return(x().blockItems||{})[e]||[]}function mn(e,t){const n=x();n.blockItems=n.blockItems||{};const s=n.blockItems[e]||[];return s.includes(t)||(s.push(t),n.blockItems[e]=s,F(n)),s}function Y(){return x().modeKey||"ionian"}function _n(e){const t=x();return t.modeKey=e,F(t),e}function xt(){return x().tier||"free"}function Gt(e){const t=x();return t.tier=e,F(t),e}const Mt=5,da=25;function qt(){return Mt}function ft(){const e=x();let t=e.energy==null?Mt:e.energy;if(t<Mt&&e.energyTs){const n=Math.floor((vt()-e.energyTs)/(da*6e4));n>0&&(t=Math.min(Mt,t+n))}return t}function Wt(e){const t=x(),n=Math.max(0,Math.min(Mt,Math.round(e)));return t.energy=n,t.energyTs=n<Mt?vt():null,F(t),n}function Le(e){return Wt(ft()+e)}function He(){return x().groove||"off"}function jn(e){const t=x();return t.groove=e,F(t),e}function ua(e){const t=x();if(!t.range||!Number.isFinite(t.range.low))return{extended:null};let n=null;return e>t.range.high?(t.range.high=e,n="high"):e<t.range.low&&(t.range.low=e,n="low"),n&&(t.rangeHistory=t.rangeHistory||[],t.rangeHistory.push({date:lt(),low:t.range.low,high:t.range.high}),t.rangeHistory.length>100&&(t.rangeHistory=t.rangeHistory.slice(-100)),F(t)),{extended:n,midi:e}}function st(){const e=x();return e.voice&&e.voice.key?e.voice:null}function hn(e,t=null,n=null){const s=x(),a=s.voice||{};return s.voice={key:e,low:t??a.low??null,high:n??a.high??null},t!=null&&n!=null&&(s.range={low:Math.round(t),high:Math.round(n)},s.rangeHistory=s.rangeHistory||[],s.rangeHistory.push({date:lt(),low:Math.round(t),high:Math.round(n)}),s.rangeHistory.length>100&&(s.rangeHistory=s.rangeHistory.slice(-100))),F(s),s.voice}const ma={easy:.6,medium:.8,fast:1};function Re(){return x().difficulty||"easy"}function Gn(e){const t=x();return t.difficulty=e,F(t),e}function ha(){return ma[Re()]||.6}function Lt(){return x().guide!==!1}function Wn(e){const t=x();return t.guide=!!e,F(t),t.guide}function pt(){return x().headphones===!0}function Un(e){const t=x();return t.headphones=!!e,F(t),t.headphones}function ba(){return Lt()?pt()?"continuous":"prehear":"off"}function gt(){const e=x().timbre;return e==="guitar"||e==="soft"?e:"piano"}function Yn(e){const t=x();return t.timbre=e,F(t),t.timbre}function Kn(){try{const e=navigator.userAgent||"";return/Mobi|Android|iPhone|iPad|iPod/i.test(e)||(navigator.maxTouchPoints||0)>1}catch{return!1}}const Pe={quiet:1,normal:1.8,loud:2.8,max:4.2};function va(){return Kn()?"loud":"normal"}function de(){const e=x().volume;return Pe[e]?e:va()}function ue(){return Pe[de()]}function Jn(e){const t=x();return Pe[e]&&(t.volume=e,F(t)),de()}const qe={speaker:.09,wired:.12,bt:.24};function fa(){return"speaker"}function me(){const e=x().route;return qe[e]?e:fa()}function pa(e){const t=x();return qe[e]&&(t.route=e,delete t.latencyManual,F(t)),me()}function Fe(){const e=x().latencyManual;return Number.isFinite(e)?e:qe[me()]}function bn(e){const t=x();return t.latencyManual=Math.max(0,Math.min(.5,e)),F(t),t.latencyManual}function Ct(){return x().darkStage===!0}function ga(e){const t=x();return t.darkStage=!!e,F(t),t.darkStage}function ye(){return x().rhythmPad!==!1}function ya(e){const t=x();return t.rhythmPad=!!e,F(t),t.rhythmPad}function At(){return x().micAGC===!0}function wa(e){const t=x();return t.micAGC=!!e,F(t),t.micAGC}const Xn={low:1.5,med:3,high:5.5};function Ea(){return Kn()?"high":"med"}function De(){const e=x().sensitivity;return Xn[e]?e:Ea()}function Ne(){return Xn[De()]}function Qn(e){const t=x();return t.sensitivity=e,F(t),e}function Zn(){return x().breathBest||0}function $a(e){const t=x();return t.breathBest=Math.max(t.breathBest||0,e),F(t),t.breathBest}const ze=5,ka=7;function Qt(){return x().paywallEnabled===!0}function we(e){const t=x();return t.paywallEnabled=!!e,F(t),t.paywallEnabled}function ts(){const e=x();return e.trialStart||(e.trialStart=vt(),F(e)),e.trialStart}function Oe(){const e=x().trialStart;if(!e)return null;const t=ka-Math.floor((vt()-e)/864e5);return Math.max(0,t)}function xa(){const e=Oe();return e!=null&&e>0}function Ma(){const e=x();delete e.trialStart,F(e)}function La(){return xt()!=="free"||xa()}function es(){const e=x();return e.uses&&e.uses.date===lt()?e.uses.count:0}function ns(){const e=x(),t=lt();return e.uses=e.uses&&e.uses.date===t?{date:t,count:e.uses.count+1}:{date:t,count:1},F(e),e.uses.count}function Ta(){return!Qt()||La()?!1:es()>=ze}function Sa(){return x().devMode===!0}function Zt(e){const t=x();return t.devMode=!!e,F(t),t.devMode}function Ia(e){const t=x();return t.examsPassed=e.slice(),F(t),t.examsPassed}function Ba(){const e=x();delete e.examsPassed,delete e.blockItems,F(e)}const te="raspevka.analytics.v1",vn=500;function Aa(e,t={}){try{const n=JSON.parse(localStorage.getItem(te)||"[]");n.push({t:Date.now(),type:e,...t}),n.length>vn&&n.splice(0,n.length-vn),localStorage.setItem(te,JSON.stringify(n))}catch{}}function Ca(){try{return JSON.parse(localStorage.getItem(te)||"[]")}catch{return[]}}function Ha(){try{localStorage.removeItem(te)}catch{}}function Ra(){const e=Ca(),t=e.filter(a=>a.type==="exercise_done"),n={};for(const a of t)(n[a.id||"—"]=n[a.id||"—"]||[]).push(a.pct||0);const s=Object.entries(n).map(([a,o])=>({id:a,runs:o.length,avgPct:Math.round(o.reduce((i,c)=>i+c,0)/o.length)})).sort((a,o)=>o.runs-a.runs);return{total:e.length,sessions:t.length,perEx:s}}const ee=[{key:"ionian",name:"Ионийский (мажор)",intervals:[0,2,4,5,7,9,11],tier:"free"},{key:"aeolian",name:"Эолийский (минор)",intervals:[0,2,3,5,7,8,10],tier:"standard"},{key:"dorian",name:"Дорийский",intervals:[0,2,3,5,7,9,10],tier:"pro"},{key:"phrygian",name:"Фригийский",intervals:[0,1,3,5,7,8,10],tier:"pro"},{key:"lydian",name:"Лидийский",intervals:[0,2,4,6,7,9,11],tier:"pro"},{key:"mixolydian",name:"Миксолидийский",intervals:[0,2,4,5,7,9,10],tier:"pro"},{key:"locrian",name:"Локрийский",intervals:[0,1,3,5,6,8,10],tier:"pro"},{key:"harm_major",name:"Гармонический мажор",intervals:[0,2,4,5,7,8,11],tier:"pro"},{key:"harm_minor",name:"Гармонический минор",intervals:[0,2,3,5,7,8,11],tier:"pro"}],fn={free:0,standard:1,pro:2};function Ve(e){return ee.find(t=>t.key===e)||ee[0]}function ss(e,t="free"){const n=Ve(e);return fn[n.tier]<=fn[t||"free"]}function Pa(e,t){const n=t.intervals,s=Math.round(e)-1,a=Math.floor(s/7),o=(s%7+7)%7;return n[o]+12*a}function yt(e,t){const n=Ve(t);return e.map(s=>Pa(s,n))}const qa="#0e8d7f",Fa="#0a766a",Da="#687485",Na="#ffffff",pn="#2a3340",za="#cfd6e0",Oa=[0,2,4,5,7,9,11],gn=e=>Oa.includes((e%12+12)%12),Va=e=>`C${Math.floor(e/12)-1}`;function as(e,t){if(e==null||t==null)return"";let n=Math.round(e)-2,s=Math.round(t)+2;for(;(n%12+12)%12!==0;)n--;for(;(s%12+12)%12!==11;)s++;const a=13,o=54,i=9,c=33,l=d=>d>=e&&d<=t,r=[];for(let d=n;d<=s;d++)gn(d)&&r.push(d);const u=r.length*a,v={};r.forEach((d,b)=>{v[d]=b*a});let h="";r.forEach((d,b)=>{const m=b*a;h+=`<rect x="${m}" y="0" width="${a-1}" height="${o}" rx="2.5" fill="${l(d)?qa:Na}" stroke="${za}" stroke-width="1"/>`,(d%12+12)%12===0&&(h+=`<text x="${m+(a-1)/2}" y="${o+11}" text-anchor="middle" fill="${Da}" font-size="8">${Va(d)}</text>`)});for(let d=n;d<=s;d++){if(gn(d))continue;const b=v[d-1];if(b==null)continue;const m=b+a-i/2;h+=`<rect x="${m}" y="0" width="${i}" height="${c}" rx="2" fill="${l(d)?Fa:pn}" stroke="${pn}" stroke-width="1"/>`}return`
    <div class="mini-kb">
      <svg viewBox="0 0 ${u} ${o+14}" preserveAspectRatio="xMidYMid meet" role="img" aria-label="Диапазон голоса на клавиатуре">
        ${h}
      </svg>
    </div>`}function Te(e){if(!Array.isArray(e)||!e.length)return'<span class="ex-glyph"></span>';const t=e.map(m=>typeof m=="number"?{midi:m,beats:1,gap:0}:{midi:m.midi,beats:m.beats||1,gap:m.gap||0}),n=t.map(m=>m.midi),s=Math.min(...n),a=Math.max(...n),o=Math.max(1,a-s)+1,i=t.reduce((m,f)=>m+f.beats+f.gap,0),c=Math.max(5,Math.min(16,150/i)),l=10,r=1.6,u=l-4;let v=0,h="";for(const m of t){const f=Math.max(3,m.beats*c-r),p=(a-m.midi)*l+2,E=m.midi===a?' class="gh-hi"':"";h+=`<rect${E} x="${v.toFixed(1)}" y="${p}" width="${f.toFixed(1)}" height="${u}" rx="2"/>`,v+=(m.beats+m.gap)*c}const d=v,b=o*l;return`<span class="ex-glyph"><svg viewBox="0 0 ${d.toFixed(0)} ${b}" preserveAspectRatio="xMidYMid meet" role="img" aria-label="Рисунок мелодии упражнения">${h}</svg></span>`}const yn=["#0e8d7f","#12a36b","#e0a64a","#5b8def","#e0544b","#9b6dd6"];function Nt(e=1){if(window.matchMedia&&window.matchMedia("(prefers-reduced-motion: reduce)").matches)return;const t=e>=2?36:18,n=document.createElement("div");n.setAttribute("aria-hidden","true"),n.style.cssText="position:fixed;inset:0;pointer-events:none;z-index:999;overflow:hidden",document.body.appendChild(n);const s=window.innerWidth;for(let a=0;a<t;a++){const o=document.createElement("i"),i=5+Math.random()*6,c=Math.random()<.4;o.style.cssText=`position:absolute;top:-12px;left:${Math.random()*s}px;width:${i}px;height:${c?i:i*.45}px;background:${yn[a%yn.length]};border-radius:${c?"50%":"2px"};will-change:transform,opacity`,n.appendChild(o);const l=320+Math.random()*380,r=(Math.random()-.5)*160,u=1100+Math.random()*900;o.animate([{transform:"translate(0,0) rotate(0deg)",opacity:1},{transform:`translate(${r}px,${l}px) rotate(${(Math.random()-.5)*540}deg)`,opacity:0}],{duration:u,delay:Math.random()*250,easing:"cubic-bezier(.2,.6,.35,1)",fill:"forwards"})}setTimeout(()=>n.remove(),2600)}function ne(e=12){try{navigator.vibrate&&navigator.vibrate(e)}catch{}}let is=!1;function ct(e,t,n,s,a={}){const{onExit:o,onAgain:i,onComplete:c,onResult:l,onNext:r,nextLabel:u,explain:v}=a;if(le(ue()),v){Se(e,s,{onExit:o,onStart:()=>ct(e,t,n,s,{...a,explain:!1}),onModeChange:a.rebuild?()=>ct(e,t,n,a.rebuild(),{...a,explain:!0}):null});return}const h=a.reps,d=a.repIndex||0,b=h&&h.length&&h[d]||0,m=s.root!=null?s.root:s.notes[0].midi,f=b?{...s,root:m+b,notes:s.notes.map(M=>({...M,midi:M.midi+b}))}:s,p=h&&h.length>1?` · ${d+1}/${h.length}`:"";e.innerHTML=`
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
        ${Ut()}
      </details>
      ${h&&h.length>1?'<button class="btn btn-ghost btn-skip" id="endearly">Закончить на этом повторе → итог</button>':""}
    </div>
  `;const E=document.getElementById("hw"),k=E.getContext("2d"),C=document.getElementById("msg"),H=document.getElementById("livebar"),g=document.getElementById("target"),S=document.getElementById("yours"),$=document.getElementById("cue");function w(){const M=Math.min(window.devicePixelRatio||1,2);E.width=E.clientWidth*M,E.height=E.clientHeight*M,k.setTransform(M,0,0,M,0,0)}w(),window.addEventListener("resize",w);const L=ha(),I={...f,tempo:Math.max(40,Math.round(f.tempo*L))},T=new Us(E,I,{theme:Ct()?"dark":"light"}),R=new Ws(f.notes.length),y=Fe(),A=pt()||me()!=="speaker";let P=null,z=null,q=0,Z=0,tt=!1,mt=!1,Ot=0,Ye=-1,Ke=!1;const Vt=document.getElementById("endearly");Vt&&Vt.addEventListener("click",()=>{Ke=!0,Vt.textContent="Хорошо — после этого повтора итог ✓",Vt.disabled=!0});const wt=[],be=[],St=(M,O)=>{const _=setTimeout(M,O);return be.push(_),_};function Je(){wt.forEach(M=>M&&M.stop&&M.stop()),wt.length=0}function ve(){z&&(cancelAnimationFrame(z),z=null),be.forEach(clearTimeout),be.length=0,window.removeEventListener("resize",w),document.removeEventListener("visibilitychange",Xe),Je()}function Xe(){document.hidden?(z&&(cancelAnimationFrame(z),z=null),Je(),q&&!tt&&(tt=!0,mt=!0)):mt&&(mt=!1,Qe())}document.addEventListener("visibilitychange",Xe),document.getElementById("exit").addEventListener("click",()=>{ve(),o()});function Qe(){ve(),ct(e,t,n,s,{...a,explain:!1})}Yt(document.getElementById("gsettings"),Qe,t);const _t=f.root!=null?f.root:f.notes[0].midi,It=gt();T.draw(0,null,!1);function Os(M){$.innerHTML='<button class="btn btn-ghost btn-skip" id="skipref">Пропустить образец →</button>',document.getElementById("skipref").addEventListener("click",M)}function Ze(){$.innerHTML=""}d===0?(C.textContent="Слушай тонику…",rn(t.ctx,_t,0,1.4,.14,It),St(()=>{C.textContent="Образец…";const M=Xs(t.ctx,I.notes,I.tempo,It),O=St(()=>{Ze(),tn()},M.dur*1e3+250);Os(()=>{clearTimeout(O),M.stop(),Ze(),tn()})},1650)):(C.textContent=(b>0?"↑ выше":"↓ ниже")+` · повтор ${d+1}/${h.length}`,rn(t.ctx,_t,0,.8,.14,It),St(()=>{Jt(t.ctx,0,!0),St(en,480)},950));function tn(){let M=3;const O=()=>{M>0?(Jt(t.ctx),C.textContent="Приготовься… "+M,M-=1,St(O,600)):en()};O()}function en(){const M=ba();C.textContent=M==="continuous"?"Пой за подсказкой!":M==="prehear"?"Слушай тон и повторяй!":"Пой!",n.reset(),q=performance.now(),Z=q,Ot=q,M==="continuous"?T.timed.forEach(G=>{wt.push(dt(t.ctx,G.hz,Math.max(.2,G.dur*.92),G.start,.1,It))}):M==="prehear"&&T.timed.forEach(G=>{const U=Math.min(.4,G.dur);wt.push(dt(t.ctx,G.hz,U,Math.max(0,G.start-U),.18,It))}),f.drone&&wt.push(Qs(t.ctx,_t,T.totalTime+.5,.05));const O=He(),_=O==="auto"?f.grooveStyle||"pop":O;_!=="off"&&(P=Zs(t.ctx,{rootMidi:_t,tempo:I.tempo,dur:T.totalTime,style:_,gain:.45}),wt.push(P)),nn()}function nn(){const M=performance.now(),O=(M-q)/1e3,_=M-Z;Z=M;const G=t.read();let U=!1,et=null;if(G){const ht=n.process(G);U=ht.voiced&&t.rms()>.0025,et=ht.smoothedHz}P&&!A&&P.duck(U);const nt=T.evaluate(O-y,U?et:null,U);if(nt.index>=0){let ht=null;nt.voiced&&et&&T.timed[nt.index]&&(ht=Pt(et,T.timed[nt.index].hz)),R.record(nt.index,nt.zone,_,nt.voiced,ht),nt.zone==="green"&&nt.voiced&&nt.index!==Ye&&(ne(12),Ye=nt.index)}T.draw(O,U?et:null,U);const Et=T.activeAt(O);if(g.textContent=Et?_a(Et.seg.midi):"—",U&&et){Ot=M;const ht=rt(et);S.textContent=ht?ht.name:"—";const _s=nt.zone==="green"?"var(--green)":nt.zone==="yellow"?"var(--yellow)":"var(--coral)";if(S.style.color=Et?_s:"var(--text)",H.style.width=Math.min(100,t.rms()*350)+"%",Et){const on=Pt(et,Et.seg.hz);Math.abs(on)<=20?($.textContent="в точку",$.style.color="var(--green)"):on<0?($.textContent="↑ выше",$.style.color="var(--amber)"):($.textContent="↓ ниже",$.style.color="var(--amber)")}else $.textContent=""}else S.textContent="—",S.style.color="var(--text-dim)",H.style.width="0%",Et&&M-Ot>5e3?($.textContent="не слышу голос — спой громче",$.style.color="var(--coral)"):$.textContent="";O<T.totalTime?z=requestAnimationFrame(nn):tt||(tt=!0,Vs())}function Vs(){const M=R.result();ve();const O=a._acc||[];if(O.push(M),!Ke&&h&&h.length>1&&d<h.length-1){ct(e,t,n,s,{...a,repIndex:d+1,_acc:O});return}const _=O.reduce((U,et)=>U+(et.pct||0),0)/O.length,G={pct:_,stars:_>=.85?3:_>=.6?2:_>=.35?1:0,notesHit:M.notesHit,notesTotal:M.notesTotal,avgCents:M.avgCents,perNote:M.perNote,stability:M.stability,vibrato:M.vibrato,repsDone:O.length};if(Aa("exercise_done",{id:s.id,pct:Math.round(_*100),stability:Math.round(M.stability||0),reps:O.length}),l&&l(G),c){c(G);return}if(_>=.5&&Vn({pct:_,stars:G.stars}),_<.4){if(ft()>0){Le(-1),an(G);return}}else _>=.5&&Le(_>=.8?2:1);sn(G)}function sn(M){M.stars>=2&&(Nt(M.stars>=3?2:1),ne(M.stars>=3?30:15));const O="★".repeat(M.stars)+"☆".repeat(3-M.stars),_=Math.round(M.pct*100),G=M.stars>=3?"Отлично!":M.stars===2?"Хорошо!":M.stars===1?"Неплохо":"Ещё разок",U=En(M,s);e.innerHTML=`
      <div class="screen summary">
        <div class="stars">${O}</div>
        <div class="verdict">${G}</div>
        <div class="big-pct">${_}<span>%</span></div>
        <p class="hint">средняя точность${M.repsDone>1?` за ${M.repsDone} повтор${M.repsDone<5?"а":"ов"}`:""}</p>
        ${wn(ft(),qt())}
        ${Ga(M)}
        <div class="card tip-card"><p class="how"><b>Разбор.</b> ${U}</p></div>
        ${Ut()}
        ${r?`<button class="btn btn-primary" id="next" style="width:100%">${u||"Дальше"} →</button>`:""}
        <div class="row">
          <button class="btn btn-ghost" id="menu">Меню</button>
          <button class="btn ${r?"btn-ghost":"btn-primary"}" id="again">Ещё раз</button>
        </div>
      </div>
    `,Yt(e,()=>sn(M),t),document.getElementById("again").addEventListener("click",i),document.getElementById("menu").addEventListener("click",o);const et=document.getElementById("next");et&&et.addEventListener("click",r)}function an(M){const O=Math.round(M.pct*100),_=En(M,s);e.innerHTML=`
      <div class="screen summary">
        <div class="verdict" style="color:var(--coral)">Сложновато — попробуем ещё</div>
        <div class="big-pct" style="color:var(--coral)">${O}<span>%</span></div>
        ${wn(ft(),qt())}
        <div class="card tip-card"><p class="how"><b>Подсказка.</b> ${_}</p></div>
        <p class="hint">Энергия −1 (восстанавливается со временем). Сбавь темп или включи «подсказку тоном» — станет легче.</p>
        ${Ut()}
        <div class="row">
          <button class="btn btn-ghost" id="menu">Меню</button>
          <button class="btn btn-primary" id="again">Пройти заново</button>
        </div>
        ${r?`<button class="btn btn-ghost" id="next" style="width:100%">${u||"Дальше"} →</button>`:""}
      </div>`;const G=()=>ct(e,t,n,s,{...a,explain:!1,repIndex:0,_acc:void 0});Yt(e,()=>an(M),t),document.getElementById("menu").addEventListener("click",o),document.getElementById("again").addEventListener("click",G);const U=document.getElementById("next");U&&U.addEventListener("click",r)}}function _a(e){const t=rt(440*Math.pow(2,(e-69)/12));return t?t.name:""}function ja(){return'<svg viewBox="0 0 24 24" width="15" height="15" fill="currentColor"><path d="M13 2 4 14h6l-1 8 9-12h-6z"/></svg>'}function wn(e,t){const n=Array.from({length:t},(s,a)=>`<span class="en-pip ${a<e?"on":""}"></span>`).join("");return`<div class="energy-row"><span class="en-ic">${ja()}</span><div class="energy-pips">${n}</div></div>`}function Ga(e){if(e.stability==null)return"";const t=e.stability,n=t<15?"ровно":t<30?"почти ровно":"дрожит",s=t<15?"var(--green)":t<30?"var(--amber)":"var(--coral)",o=e.vibrato&&e.vibrato.present?`есть · ${e.vibrato.rateHz.toFixed(1)} Гц`:"нет";return`<div class="stat-chips">
    <span class="stat-chip">ровность: <b style="color:${s}">${n}</b></span>
    <span class="stat-chip">вибрато: <b>${o}</b></span>
  </div>`}function Wa(e){if(e.modeKey===void 0)return"";const t=Y(),n=xt();return`<div class="settings" style="margin-bottom:8px">
      <div class="seg-label">Лад распевки</div>
      <select id="modeSel" class="lad-select">${ee.map(a=>{const o=!ss(a.key,n);return`<option value="${a.key}" ${a.key===t?"selected":""} ${o?"disabled":""}>${a.name}${o?" 🔒":""}</option>`}).join("")}</select>
    </div>`}function Se(e,t,{onExit:n,onStart:s,onModeChange:a}){e.innerHTML=`
    <div class="screen breathe-intro">
      <div class="game-top"><button class="icon-btn" id="back">‹ Меню</button></div>
      <div class="brand"><h1>${t.name}</h1>
        <p>Слог: <b>«${t.syllable}»</b></p></div>
      <div class="card">
        ${t.desc?`<p class="blurb">${t.desc}</p>`:""}
        ${t.how?`<p class="how"><b>Как делать.</b> ${t.how}</p>`:""}
        <div class="ex-glyph preview-contour" title="Форма распевки: выше плашка — выше нота, длиннее — дольше">${Te(t.notes)}</div>
        <p class="how mech"><b>Как устроена игра.</b> Ноты едут к вертикальной линии слева. Пой так, чтобы твой светящийся шарик совпал с нотой по высоте: <b style="color:var(--green)">зелёный</b> — точно, <b style="color:var(--amber)">жёлтый</b> — почти, <b style="color:var(--coral)">красный</b> — мимо. Сначала прозвучит <b>аккорд тоники</b> и образец мелодии — это твоя опора, чтобы попасть. «Подсказка тоном» подыгрывает нужную ноту (без наушников — коротко перед тем, как её петь).</p>
      </div>
      ${Wa(t)}
      ${Ut()}
      <button class="btn btn-primary" id="go" style="width:100%">Начать</button>
    </div>
  `,document.getElementById("back").addEventListener("click",n),document.getElementById("go").addEventListener("click",s),Yt(e,()=>Se(e,t,{onExit:n,onStart:s,onModeChange:a}));const o=document.getElementById("modeSel");o&&o.addEventListener("change",()=>{_n(o.value),a?a():Se(e,t,{onExit:n,onStart:s,onModeChange:a})})}function Ut(){const e=Re(),t=Lt(),n=pt(),s=gt(),a=(u,v)=>`<button data-diff="${u}" class="${e===u?"on":""}">${v}</button>`,o=(u,v)=>`<button data-timbre="${u}" class="${s===u?"on":""}">${v}</button>`,i=He(),c=(u,v)=>`<button data-groove="${u}" class="${i===u?"on":""}">${v}</button>`,l=de(),r=(u,v)=>`<button data-vol="${u}" class="${l===u?"on":""}">${v}</button>`;return`
    <div class="settings inline-settings">
      <div class="seg-label">Громкость подсказки</div>
      <div class="seg">${r("quiet","Тихо")}${r("normal","Норм")}${r("loud","Громко")}${r("max","Макс")}</div>
      <div class="seg-label">Темп</div>
      <div class="seg">${a("easy","Медл.")}${a("medium","Средне")}${a("fast","Быстро")}</div>
      <div class="toggle-row">
        <button class="toggle ${t?"on":""}" data-guidetoggle="1">Подсказка тоном: ${t?"вкл":"выкл"}</button>
      </div>
      <details class="more-settings" ${is?"open":""}>
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
  `}function Yt(e,t,n){e.querySelectorAll("[data-diff]").forEach(i=>{i.addEventListener("click",()=>{Gn(i.dataset.diff),t()})}),e.querySelectorAll("[data-timbre]").forEach(i=>{i.addEventListener("click",()=>{Yn(i.dataset.timbre),t()})}),e.querySelectorAll("[data-groove]").forEach(i=>{i.addEventListener("click",()=>{jn(i.dataset.groove),t()})}),e.querySelectorAll("[data-vol]").forEach(i=>{i.addEventListener("click",()=>{if(Jn(i.dataset.vol),le(ue()),n&&n.ctx)try{dt(n.ctx,523.25,.5,0,.22,gt())}catch{}t()})});const s=e.querySelector("[data-guidetoggle]");s&&s.addEventListener("click",()=>{Wn(!Lt()),t()});const a=e.querySelector("[data-hptoggle]");a&&a.addEventListener("click",()=>{Un(!pt()),t()});const o=e.querySelector(".more-settings");o&&o.addEventListener("toggle",()=>{is=o.open})}function En(e,t){if(e.stars>=3)return"Чисто и точно! Можно прибавить темп или взять упражнение посложнее.";const n=[],s=e.avgCents;s<=-18?n.push("Ты чаще занижал — тяни ноту чуть выше, поддержи дыханием (опора живота)."):s>=18&&n.push("Ты чаще завышал — не дави, расслабь гортань, целься чуть ниже.");const a=e.perNote.length;if(a>=3){const i=t.notes.map((l,r)=>({i:r,midi:l.midi})).sort((l,r)=>r.midi-l.midi).slice(0,Math.max(1,Math.round(a/3)));i.reduce((l,r)=>l+(e.perNote[r.i]||0),0)/i.length<e.pct-.15&&n.push("Верхние ноты даются хуже — не тянись вверх горлом, добавь головной резонанс и воздух.")}return n.length||n.push("Целься в центр ноты и держи ровно. Включи «подсказку тоном» — попадать заметно легче."),n.join(" ")}const N=(e,t=1,n=0)=>n?{midi:e,beats:t,gap:n}:{midi:e,beats:t};function os(e){const t=(n,s,a=0)=>N(e+n,s,a);return{id:"vhold",name:"Пять гласных",syllable:"И-Э-А-О-У",tempo:78,kind:"vowel",root:e,grooveStyle:"soft",greenCents:25,desc:"Унификация гласных: держим позицию, меняем только гласную «И-Э-А-О-У».",how:"Пой «И-Э-А-О-У» ровно, без «прыжков» голосом при смене гласной. Сначала стаккато с паузами, потом строка повторяется выше — позиция единая.",notes:[t(0,.5,.5),t(0,.5,.5),t(0,.5,.5),t(0,.5,.5),t(0,.5,.5),t(0,.5),t(0,.5),t(0,.5),t(0,.5),t(0,1),t(4,.25),t(4,.25),t(4,.25),t(4,.25),t(4,1,2),t(4,.25),t(4,.25),t(4,.25),t(4,.25),t(4,1)]}}function cs(e){const t=(n,s)=>N(e+n,s);return{id:"vscale",name:"Лесенка гласных",syllable:"И-Э-А-О-У",tempo:124,kind:"scale",root:e,grooveStyle:"pop",desc:"Точность высоты при смене гласной — каждая гласная ведёт по двум нотам.",how:"Пой «И-Э-А-О-У» легко и точно, попадая в каждую ноту слига. Не зажимайся.",notes:[t(0,.5),t(2,.5),t(5,.5),t(7,.5),t(9,.5),t(7,.5),t(5,.5),t(2,.5),t(7,1),t(5,3)]}}function ls(e){return{id:"vagil",name:"Зигзаг",syllable:"И-Э-И-А-И-О-И-У",tempo:100,kind:"agility",root:e,grooveStyle:"funk",desc:"Беглость и точность: зигзаг по ступеням вверх и обратно.",how:"Лёгко и быстро веди голос по нотам зигзагом вверх, не зажимаясь. Гласные чёткие.",notes:[0,3,1,5,3,7,5,8,7,3,5,1,0].map(n=>N(e+n,.5))}}function rs(e){const t=(n,s)=>N(e+n,s);return{id:"vclimb",name:"Качели на квинте",syllable:"И-Э-А-О-У",tempo:92,kind:"jump",root:e,grooveStyle:"soft",desc:"Гибкость и точность интервала: скачки на квинту вверх и зеркально вниз.",how:"Чисто бери скачок на квинту (без зажима), пробежку пой ровно. Вторая половина — то же зеркально вниз. Опора дыханием.",notes:[t(0,.5),t(7,.5),t(0,.5),t(7,.5),t(0,.5),t(7,.5),t(0,.5),t(7,.5),t(0,.5),t(7,.5),t(0,.25),t(2,.25),t(4,.25),t(5,.25),t(7,2),t(7,.5),t(0,.5),t(7,.5),t(0,.5),t(7,.5),t(0,.5),t(7,.5),t(0,.5),t(7,.5),t(0,.5),t(7,.25),t(5,.25),t(4,.25),t(2,.25),t(0,2)]}}function ds(e){const t=(n,s,a=0)=>N(e+n,s,a);return{id:"jcharles",name:"Волна гласных",syllable:"И-Э-А-О-У",tempo:130,kind:"agility",root:e,grooveStyle:"swing",desc:"Гибкость и позиция гласных: повторяющийся мотив, затем плавный спуск.",how:"Лёгко веди гласные по мотиву, в конце мягко спустись. Без зажима, позиция единая.",notes:[t(0,.5),t(2,.5),t(5,.5,.5),t(0,.5),t(2,.5),t(5,.5,.5),t(0,.5),t(2,.5),t(5,.5),t(8,1),t(7,.5),t(5,.5),t(2,.5),t(0,.5),t(2,.5),t(5,.5,.5),t(0,.5),t(2,.5),t(5,.5),t(8,1),t(7,1.5)]}}function us(e,t="ionian"){const n=yt([1,2,3,2,1],t);return{id:"vowels",name:"Цепочка гласных",syllable:"Ми-Ме-Ма",tempo:90,kind:"scale",root:e,modeKey:t,grooveStyle:"swing",desc:"Выравнивание гласных и сохранение позиции при смене звука.",how:"Пой по кругу гласные «Ми-Ме-Ма-Мо», широко раскрывая рот, держи единую позицию.",notes:n.map(s=>N(e+s,1))}}function ms(e,t="ionian"){const n=yt([1,1,3,2,1,1,-2,-2,1,1,3,2,1],t);return{id:"jump5",name:"Скачок к V ступени",syllable:"Ям",tempo:100,kind:"jump",root:e,modeKey:t,grooveStyle:"latin",desc:"Точная атака интервала: скачок на квинту вниз к нижней доминанте и обратно.",how:"Пой на «Ям». Перед скачком на квинту вниз не зажимайся — целься точно в нижнюю ноту.",notes:n.map(s=>N(e+s,1))}}function hs(e,t="ionian"){const s=yt([1,2,3,4,5,6,7,8,8,7,6,5,4,3,2,1],t);return{id:"lad",name:"Ладовая «ЯМ»",syllable:"Ям",tempo:100,kind:"scale",root:e,modeKey:t,drone:!0,grooveStyle:"march",desc:"Слух и ощущение ладовой окраски — гамма лада вверх и вниз.",how:"Пой на «Ям» по ступеням лада вверх до октавы и обратно. Слушай окраску лада.",notes:s.map(a=>N(e+a,1))}}function bs(e,t=8){return{id:"sustain",name:"Удержание ноты",syllable:"А",tempo:70,kind:"sustain",root:e,grooveStyle:"ballad",desc:"Учит держать ровный стабильный звук и дыхательную опору — основа пения.",how:"Слушай образец, потом тяни ноту на «А» как можно ровнее. Держи шарик в зелёной зоне без дрожи.",notes:[N(e,t)]}}function vs(e){return{id:"vibrato",name:"Вибрато",syllable:"А",tempo:60,kind:"vibrato",root:e,grooveStyle:"ballad",greenCents:55,yellowCents:95,desc:"Ровное вибрато — мягкое «качание» высоты примерно 5–6 раз в секунду.",how:"Сначала тяни ровную «А». Когда звук устойчив — добавь лёгкую «волну» голосом, 5–6 колебаний в секунду. Колебание идёт от дыхания и опоры, не дави горлом. На итоге увидишь частоту своего вибрато.",notes:[N(e,10)]}}function fs(e){return{id:"vwobble",name:"Раскачка вибрато",syllable:"А",tempo:120,kind:"vibrato",root:e,grooveStyle:"soft",greenCents:55,desc:"Запуск вибрато: ровный звук с лёгким «качанием» высоты — основа естественного вибрато.",how:"Пой «А» и добавь мягкое колебание голосом — вверх-вниз небольшими шагами. Колебание идёт от опоры дыхания, не дави горлом.",notes:[0,1,0,1,0,1,0,5,6,5,6,5,6,5].map(n=>N(e+n,.5))}}function ps(e){const t=(n,s,a=0)=>N(e+n,s,a);return{id:"timbre",name:"Тёплый тон",syllable:"Мо",tempo:96,kind:"scale",root:e,grooveStyle:"ballad",desc:"Качество тембра: ровный, округлый звук при движении голоса по нотам.",how:"Пой «Мо» округло и тепло, держи одинаковый тембр на каждой ноте. Не зажимай, звук в маску.",notes:[t(0,.5),t(2,.5),t(4,1),t(0,.5),t(2,.5),t(4,.5),t(2,.5),t(0,.5,.5),t(0,.5),t(2,.5),t(4,.5),t(5,.5),t(7,.5),t(5,.5),t(4,.5),t(2,.5),t(7,.5),t(5,.5),t(4,.5),t(2,.5),t(7,.5),t(5,.5),t(4,.5),t(2,.5),t(0,1),t(7,1),t(0,1)]}}function gs(e){const t=(n,s)=>N(e+n,s);return{id:"timbre2",name:"Ровный тон на двух",syllable:"А",tempo:72,kind:"sustain",root:e,grooveStyle:"ballad",desc:"Единый тембр при переходе между двумя высотами (вниз на кварту и обратно).",how:"Держи одинаковый округлый звук на обеих нотах — не «бели» нижнюю и не зажимай верхнюю.",notes:[t(0,2),t(-5,2),t(0,2),t(-5,2),t(0,4)]}}function ys(e){const t=(n,s)=>N(e+n,s);return{id:"regarp",name:"Через регистры",syllable:"Но",tempo:92,kind:"jump",root:e,grooveStyle:"soft",desc:"Плавный переход (passaggio): с тоники всё выше — кварта, квинта, октава.",how:"Пой «Но», возвращаясь к тонике и беря всё выше (кварта → квинта → октава). Без «слома» на переходе — мягко.",notes:[t(0,1),t(5,3),t(0,1),t(7,3),t(0,1),t(12,3),t(0,4)]}}function ws(e){const t=(n,s)=>N(e+n,s);return{id:"regoct",name:"Октавная связка",syllable:"А",tempo:84,kind:"jump",root:e,grooveStyle:"soft",desc:"Связка регистров на октаве — без резкого «переключения» голоса.",how:"Спокойно прыгай на октаву вверх и возвращайся на долгую тонику. Верх не криком, а на опоре и резонансе.",notes:Array.from({length:4}).flatMap(()=>[t(0,2),t(12,2),t(0,4)])}}function Es(e){const t=(n,s)=>N(e+n,s);return{id:"belt",name:"Белтинг — гамма",syllable:"Эй",tempo:112,kind:"scale",root:e,grooveStyle:"drive",desc:"Яркая опёртая подача (белтинг) на пятинотной гамме — мощно, но без зажима.",how:"Пой «Эй» ярко и звонко, опираясь дыханием. Звук вперёд (в маску), горло свободно. Не дави на верхних нотах.",notes:[t(0,.5),t(2,.5),t(4,.5),t(5,.5),t(7,1),t(5,.5),t(4,.5),t(2,.5),t(0,2)]}}function $s(e){const t=(n,s)=>N(e+n,s);return{id:"beltoct",name:"Белт-арпеджио",syllable:"Эй",tempo:100,kind:"jump",root:e,grooveStyle:"drive",desc:"Опёртая атака верха через арпеджио до октавы — энергично и безопасно.",how:"Поднимайся по арпеджио ярко и точно, на опоре. Верхнюю ноту не тяни горлом — звук на дыхании и в резонаторах.",notes:[t(0,.5),t(4,.5),t(7,.5),t(12,2),t(7,.5),t(4,.5),t(0,2)]}}function ks(e){return{id:"artic",name:"Стаккато-арпеджио",syllable:"Та",tempo:126,kind:"agility",root:e,grooveStyle:"funk",desc:"Чёткая артикуляция и точная атака: арпеджио отрывистыми ясными слогами.",how:"Пой «Та-Та-Та» коротко и чётко по арпеджио вверх-вниз, с паузой после каждого слога. Согласная ясная, звук не «расползается».",notes:[0,4,7,4,0,0,4,7,4,0].map(n=>N(e+n,.5,.5))}}function xs(e){return{id:"artic2",name:"Слоги по группам",syllable:"Та-Ка",tempo:120,kind:"agility",root:e,grooveStyle:"funk",desc:"Дикция в движении: чёткие слоги группами по соседним ступеням.",how:"Пой «Та-Ка-Та-Ка-Та» по нотам вверх-вниз, между группами — короткая пауза на вдох. Каждый слог ясный, ритм ровный.",notes:[0,2,4,2,0,0,2,4,2,0].map((n,s)=>N(e+n,.5,s%5===4?.5:0))}}function Ms(e){return{id:"resist",name:"Фигура-волчок",syllable:"Ма",tempo:116,kind:"agility",root:e,grooveStyle:"march",desc:"Выносливость и ровность: устойчивый мотив-«волчок» много раз без потери опоры.",how:"Пой «Ма» по фигуре вверх-вниз ровно и не уставая. Дыхание ровное, опора держится до конца.",notes:[0,1,3,1,0,1,3,1,0,1,3,1,0].map(n=>N(e+n,.5))}}function Ls(e){const t=(s,a,o=0)=>N(e+s,a,o),n=[0,2,4,5,7,5,4,2];return{id:"resist2",name:"Выносливая гамма",syllable:"Ма",tempo:92,kind:"agility",root:e,grooveStyle:"march",desc:"Дыхательная выносливость: длинный ровный пробег по гамме без добора воздуха.",how:"Пой «Ма» шестнадцатыми ровно и точно на одном дыхании; в конце — взлёт к октаве и долгая тоника. Распредели воздух до конца.",notes:[...n.map(s=>t(s,.25)),...n.map(s=>t(s,.25)),t(0,.25),t(2,.25),t(4,.25),t(5,.25),t(7,1.25),t(5,.25),t(4,.25),t(2,.25),t(0,1),t(0,.5),t(4,.5),t(0,.5),t(7,.5),t(0,.5),t(12,1.5),t(0,3,1)]}}function Ts(e,t="ionian"){const n=yt([1,2,3,4,5,4,3,2,1],t);return{id:"scale5",name:"Гамма «Ма-Мэ»",syllable:"Ма",tempo:104,kind:"scale",root:e,modeKey:t,grooveStyle:"pop",desc:"Тренирует точность интонации — чистое попадание в каждую ступень гаммы.",how:"Пой «Ма» и попадай в каждую ноту, которая подъезжает к линии. Старайся держать зелёный.",notes:n.map(s=>N(e+s,1))}}function Ss(e,t="ionian"){const n=yt([1,2,3,4,5,6,5,4,3,2,1],t);return{id:"agility",name:"Беглость «Ма»",syllable:"Ма",tempo:138,kind:"agility",root:e,modeKey:t,grooveStyle:"funk",desc:"Развивает беглость: быстрые и точные переходы между нотами (как в Vocalista).",how:"Пой «Ма» легко и быстро, попадая в каждую ноту пробегающего пассажа. Не зажимайся.",notes:n.map(s=>N(e+s,.5))}}function Is(e){return{id:"jump",name:"Октавный скачок",syllable:"А",tempo:84,kind:"jump",root:e,grooveStyle:"drive",desc:"Учит координации между нижним и верхним регистром голоса.",how:"Пой «А», точно прыгая на октаву вверх и обратно вниз. Целься в центр ноты.",notes:[N(e,2),N(e+12,2),N(e,2),N(e+12,2)]}}function _e(e,t="ionian"){const n=yt([1,2,3,2,1],t);return{id:"hum3",name:"Мычание по гамме",syllable:"М",tempo:92,kind:"hum",root:e,modeKey:t,grooveStyle:"soft",desc:"Мягкая активация голоса и резонаторов на «м-м-м» — три ступеньки вверх и обратно.",how:"Сомкни губы и мычи «м», идя по нотам: вверх три ступени и вниз. Звук в маску/нос.",notes:n.map(s=>N(e+s,1))}}function je(e,t="ionian"){const n=yt([1,2,3,4,5,4,3,2,1,5,1],t);return{id:"trill",name:"Губной тренаж «brrr»",syllable:"brrr",tempo:120,kind:"trill",root:e,modeKey:t,grooveStyle:"drive",desc:"Ровный воздушный поток и гибкость: пять ступеней вверх-вниз и скачок на квинту.",how:"Губами «brrr» (если не выходит — на «Р»). Веди по нотам ровно, в конце — скачок на квинту и тонику.",notes:n.map(s=>N(e+s,.75))}}function Ge(e,t,n,s=4){const a=e.notes.map(u=>u.midi),o=Math.min(...a),i=Math.max(...a);if(!Number.isFinite(t)||!Number.isFinite(n))return[0];const c=Math.max(0,Math.min(s,n-i)),l=Math.max(0,Math.min(s,o-t)),r=[];for(let u=0;u<=c;u++)r.push(u);for(let u=c-1;u>=-l;u--)r.push(u);return r.length?r:[0]}const J=(e,t)=>({s:e,b:t});function jt(e,t){const n=[];for(let s=0;s<t;s++)n.push(...e.map(a=>({...a})));return n}const Ht={air1:{id:"air1",name:"Дыхание: длинные с / ш",kind:"rhythm",tempo:70,desc:"Ровный длинный выдох на «с» и «ш» под метроном — опора и расход воздуха.",how:"«с-с-с» тянем на 4 клика → вдох носом → «ш-ш-ш» на 4 клика → вдох носом. Выдох ровный, без толчков.",steps:jt([J("с",4),J("вдох",2),J("ш",4),J("вдох",2)],4)},air2:{id:"air2",name:"Дыхание: короткий с + 5 ш",kind:"rhythm",tempo:80,desc:"Короткий толчок «с» и серия «ш» — активный выдох и чувство ритма.",how:"Короткий «с», пауза, затем 5 коротких «ш». Между «с» и «ш» НЕ дышим; вдох носом — после серии.",steps:jt([J("с",.5),J("rest",.5),J("ш",.5),J("ш",.5),J("ш",.5),J("ш",.5),J("ш",.5),J("вдох",2)],6)},air3:{id:"air3",name:"Артикуляция: 15 с + 15 ш",kind:"rhythm",tempo:80,desc:"Чёткие короткие «с» и «ш» в ровном пульсе — артикуляция и дыхание.",how:"15 коротких «с» → вдох носом → 15 коротких «ш». Держи ровный пульс с метрономом.",steps:[...jt([J("с",.5)],15),J("вдох",2),...jt([J("ш",.5)],15)]}},Ua={с:"С-с-с",ш:"Ш-ш-ш",вдох:"Вдох носом",rest:"·"},$n=[0,4,7,9,12,9,7,4];function Bs(e,t,n,s,{onExit:a,onComplete:o,skipExplain:i}={}){let c=null,l=!1,r=[];const u=[];function v(){r.forEach(p=>p&&p.stop&&p.stop()),r=[]}function h(){c&&(cancelAnimationFrame(c),c=null),u.forEach(clearTimeout),u.length=0,v(),document.removeEventListener("visibilitychange",d)}function d(){document.hidden?(c&&(cancelAnimationFrame(c),c=null),v(),l=!0):l&&(l=!1,b())}function b(){h(),e.innerHTML=`
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
    `,document.getElementById("back").addEventListener("click",()=>{h(),a()}),document.getElementById("go").addEventListener("click",m)}function m(){document.addEventListener("visibilitychange",d);const p=60/s.tempo;let E=0;const k=s.steps.map(y=>{const A={...y,start:E,end:E+y.b};return E+=y.b,A}),C=E,H=C*p;e.innerHTML=`
      <div class="screen breathe">
        <div class="game-top">
          <button class="icon-btn" id="quit">‹ Прервать</button>
          <button class="icon-btn" id="padtgl">♪ подложка ${ye()?"вкл":"выкл"}</button>
        </div>
        <div class="rhythm-stage">
          <div class="rhythm-beat" id="beat"></div>
          <div class="rhythm-label" id="lbl">Приготовься…</div>
        </div>
        <div class="bar"><i id="prog"></i></div>
      </div>
    `,document.getElementById("quit").addEventListener("click",()=>{h(),a()});const g=document.getElementById("lbl"),S=document.getElementById("beat"),$=document.getElementById("prog");if(ye())for(let y=0;y<Math.ceil(C);y++){const A=n+$n[y%$n.length],P=440*Math.pow(2,(A-69)/12);r.push(dt(t.ctx,P,p*.9,y*p,.07,"soft"))}const w=document.getElementById("padtgl");w&&w.addEventListener("click",()=>{const y=!ye();ya(y),y||v(),w.textContent=y?"♪ подложка вкл":"♪ подложка выкл"});const L=performance.now();let I=-1,T=!1;function R(){const y=(performance.now()-L)/1e3,A=y/p,P=Math.floor(A);P>I&&P<Math.ceil(C)&&(I=P,Jt(t.ctx,0,P%4===0),S.classList.remove("pulse"),S.offsetWidth,S.classList.add("pulse"));const z=k.find(q=>A>=q.start&&A<q.end);z&&(g.textContent=Ua[z.s]||"",g.style.color=z.s==="вдох"?"var(--gold)":z.s==="rest"?"var(--text-dim)":"var(--accent-2)"),$.style.width=Math.min(100,y/H*100)+"%",y<H?c=requestAnimationFrame(R):T||(T=!0,f())}c=requestAnimationFrame(R)}function f(){if(h(),o){o({pct:null,rhythm:!0});return}e.innerHTML=`
      <div class="screen summary">
        <div class="stars">🫁</div>
        <div class="verdict">Готово!</div>
        <p class="hint">Дыхание и артикуляция размяты. Голос готов к распевке.</p>
        <div class="row">
          <button class="btn btn-ghost" id="menu">Меню</button>
          <button class="btn btn-primary" id="again">Ещё раз</button>
        </div>
      </div>
    `,document.getElementById("menu").addEventListener("click",a),document.getElementById("again").addEventListener("click",b)}i?m():b()}const se=[{key:"bass",name:"Бас",group:"муж",low:40,high:64,center:48,blurb:"Самый низкий мужской голос, глубокий и плотный."},{key:"baritone",name:"Баритон",group:"муж",low:43,high:67,center:52,blurb:"Средний мужской голос — самый распространённый."},{key:"tenor",name:"Тенор",group:"муж",low:48,high:72,center:57,blurb:"Высокий мужской голос, яркий и звонкий."},{key:"contralto",name:"Контральто",group:"жен",low:53,high:77,center:60,blurb:"Низкий женский голос, тёплый и насыщенный."},{key:"mezzo",name:"Меццо-сопрано",group:"жен",low:57,high:81,center:64,blurb:"Средний женский голос — самый частый у женщин."},{key:"soprano",name:"Сопрано",group:"жен",low:60,high:84,center:67,blurb:"Высокий женский голос, светлый и парящий."}];function ut(e){return se.find(t=>t.key===e)||null}function ot(e){return Pn(Math.round(e))||""}function kn(e){return`${ot(e.low)}–${ot(e.high)}`}function Ya(e,t){const n=(e+t)/2;let s=se[0],a=1/0;for(const o of se){const i=(o.low+o.high)/2,c=.6*Math.abs(e-o.low)+.4*Math.abs(n-i);c<a&&(a=c,s=o)}return s}function Ka(e,t,n,{onExit:s}){const a=st(),o=a&&ut(a.key),i=o?o.center:60,c=a&&a.low!=null&&a.high!=null?{low:a.low,high:a.high}:o?{low:o.low,high:o.high}:{low:48,high:72},l=[{title:"Дыхание: длинные с / ш",tip:"Ровный длинный выдох в такт.",rhythm:Ht.air1},{title:"Дыхание: короткий с + 5 ш",tip:"Активный выдох, вдох носом после серии.",rhythm:Ht.air2},{title:"Артикуляция: 15 с + 15 ш",tip:"Чётко и ровно с метрономом.",rhythm:Ht.air3},{title:"Мычание по гамме «М»",tip:"Мягко, в маску. Сначала прозвучит тоника.",ex:_e(i)},{title:"Губной тренаж «brrr»",tip:"Губами «brrr» или на «Р», ровно.",ex:je(i)}];let r=0;const u=[];function v(){if(r>=l.length)return d();const b=l[r];h(b,r,()=>{const m=f=>{u.push(f),r+=1,v()};if(b.rhythm)Bs(e,t,i,b.rhythm,{onExit:s,onComplete:m,skipExplain:!0});else{const f=Ge(b.ex,c.low,c.high,2);ct(e,t,n,b.ex,{onExit:s,onComplete:m,reps:f})}})}function h(b,m,f){e.innerHTML=`
      <div class="screen interstitial">
        <div class="game-top"><button class="icon-btn" id="quit">‹ Прервать</button></div>
        <div class="step-count">Упражнение ${m+1} из ${l.length}</div>
        <div class="brand"><h1>${b.title}</h1><p>${b.tip}</p></div>
        ${b.rhythm?`<div class="card"><p class="how"><b>Как.</b> ${b.rhythm.how}</p></div>`:""}
        <div class="progress-dots">
          ${l.map((p,E)=>`<span class="dot ${E<m?"done":E===m?"now":""}"></span>`).join("")}
        </div>
        <button class="btn btn-primary" id="go" style="width:100%">Начать</button>
      </div>
    `,document.getElementById("go").addEventListener("click",f),document.getElementById("quit").addEventListener("click",s)}function d(){const b=u.filter(H=>H&&typeof H.pct=="number"),m=b.length?b.reduce((H,g)=>H+g.pct,0)/b.length:1,f=m>=.85?3:m>=.6?2:m>=.35?1:0,{streak:p,freezeSpent:E}=Vn({pct:m,stars:f});Nt(2),ne(30);const k="★".repeat(f)+"☆".repeat(3-f),C=Math.round(m*100);e.innerHTML=`
      <div class="screen summary">
        <div class="stars">${k}</div>
        <div class="verdict">Распевка завершена!</div>
        <div class="big-pct">${C}<span>%</span></div>
        <p class="hint">средняя точность по ${b.length} ${b.length===1?"распевке":"распевкам"} с нотами</p>
        <div class="streak-badge">🔥 Стрик: ${p} ${p===1?"день":"дн."}${E?" · ❄ заморозка спасла стрик":""}</div>
        <button class="btn btn-primary" id="menu" style="width:100%">В меню</button>
      </div>
    `,document.getElementById("menu").addEventListener("click",s)}v()}function We(e,t,n,{onDone:s,onExit:a,canSkip:o=!1}){let i=null;const c=()=>{i&&cancelAnimationFrame(i),i=null};function l(){c(),n.reset();const h=st(),d=h&&ut(h.key);let b=d?d.group:"муж";e.innerHTML=`
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
            <button data-gender="муж" class="${b==="муж"?"on":""}">Мужские</button>
            <button data-gender="жен" class="${b==="жен"?"on":""}">Женские</button>
          </div>
        </div>
        <div class="card list">
          <div class="list-sep">Или выбери сам</div>
          <div id="voiceCards"></div>
        </div>
      </div>
    `,document.getElementById("back").addEventListener("click",a),document.getElementById("detect").addEventListener("click",r);function m(){const f=st();document.getElementById("voiceCards").innerHTML=se.filter(p=>p.group===b).map(p=>`
          <button class="list-item voice-card" data-pick="${p.key}">
            <span class="li-main">${p.name}${f&&f.key===p.key?" ·  выбран":""}</span>
            <span class="li-sub">${p.group==="муж"?"мужской":"женский"} · ${kn(p)}</span>
          </button>`).join(""),document.querySelectorAll("[data-pick]").forEach(p=>p.addEventListener("click",()=>{hn(p.dataset.pick),s(st())}))}document.querySelectorAll("[data-gender]").forEach(f=>f.addEventListener("click",()=>{b=f.dataset.gender,document.querySelectorAll("[data-gender]").forEach(p=>p.classList.toggle("on",p.dataset.gender===b)),m()})),m()}function r(){c(),e.innerHTML=`
      <div class="screen breathe-intro">
        <div class="game-top"><button class="icon-btn" id="back">‹ Назад</button></div>
        <div class="brand"><h1>Определим голос</h1></div>
        <div class="card">
          <p class="blurb">Сначала споёшь свою самую низкую удобную ноту, потом — самую высокую (без напряжения!). По диапазону подскажу твой тембр.</p>
          <p class="how mech"><b>Как.</b> Пой ровно и держи ноту — когда звук станет стабильным, пойдёт отсчёт и я её запишу. Верх <b>не форсируй</b>: бери только то, что берётся легко.</p>
        </div>
        <button class="btn btn-primary" id="go" style="width:100%">Поехали</button>
      </div>
    `,document.getElementById("back").addEventListener("click",l),document.getElementById("go").addEventListener("click",()=>u("low"))}function u(h,d=null){c();const b=h==="low";e.innerHTML=`
      <div class="screen onboard">
        <div class="game-top"><button class="icon-btn" id="back">‹ Назад</button></div>
        <div class="brand"><h1>${b?"Нижняя нота":"Верхняя нота"}</h1>
          <p>${b?"Спой свою <b>самую низкую удобную</b> ноту и тяни ровно.":"Теперь <b>самую высокую</b> — мягко, <b>без напряжения</b>."}</p></div>
        <div class="note-display silent" id="note">—</div>
        <div class="stability"><div class="stability-fill" id="stab"></div></div>
        <p class="hint" id="status">Пой и держи ровно…</p>
        ${d!=null?`<p class="hint">Низ записан: <b>${ot(d)}</b></p>`:""}
      </div>
    `,document.getElementById("back").addEventListener("click",()=>b?r():u("low"));const m=document.getElementById("note"),f=document.getElementById("status"),p=document.getElementById("stab"),E=[],k=24,C=1200;let H=0;function g(L){const I=Math.min(...L),T=Math.max(...L);return 1200*Math.log2(T/I)}function S(L){const I=[...L].sort((T,R)=>T-R);return I[Math.floor(I.length/2)]}n.reset(),n.setRange&&n.setRange(55,1300);function $(){const L=t.read();if(L){const{smoothedHz:I,voiced:T}=n.process(L);if(T&&I){const R=rt(I),y=R.name.match(/^([A-G]#?)(-?\d+)$/);if(m.className="note-display green",m.innerHTML=y?`${y[1]}<span class="oct">${y[2]}</span>`:R.name,E.push(I),E.length>k&&E.shift(),E.length>=k&&g(E)<110){H||(H=performance.now());const P=performance.now()-H;p.style.width=Math.min(100,P/C*100)+"%";const z=Math.ceil((C-P)/1e3);if(f.textContent=P<C?`Держи… ${Math.max(1,z)}`:"Готово!",P>=C)return w(Math.round(rt(S(E)).midi))}else H=0,p.style.width="0%",f.textContent="Держи ровнее…"}else m.className="note-display silent",m.textContent="—",H=0,p.style.width="0%",E.length&&(E.length=0),f.textContent="Пой и держи ровно…"}i=requestAnimationFrame($)}$();function w(L){if(c(),b)u("high",L);else{let I=d,T=L;T<=I&&(T=I+7),v(I,T)}}}function v(h,d){c();const b=Ya(h,d);hn(b.key,h,d),Nt(2),ne(25),e.innerHTML=`
      <div class="screen summary">
        <div class="verdict" style="font-size:18px;color:var(--text-dim)">Похоже, твой голос —</div>
        <div class="voice-result">${b.name}</div>
        <p class="hint">${b.blurb}</p>
        <div class="card" style="text-align:left;width:100%">
          <p class="how"><b>Твой диапазон:</b> ${ot(h)} – ${ot(d)}</p>
          ${as(h,d)}
          <p class="how"><b>Обычный диапазон для ${b.name.toLowerCase()}:</b> ${kn(b)}</p>
          <p class="how mech">Это ориентир по диапазону, а не окончательный вердикт — точный тембр определит педагог. Упражнения подстроятся под тебя.</p>
        </div>
        <div class="row">
          <button class="btn btn-ghost" id="redo">Переопределить</button>
          <button class="btn btn-primary" id="ok">Готово</button>
        </div>
      </div>
    `,document.getElementById("redo").addEventListener("click",r),document.getElementById("ok").addEventListener("click",()=>s(st()))}l()}function xn(e,t,n,s,a,o){e.beginPath(),e.moveTo(t+o,n),e.arcTo(t+s,n,t+s,n+a,o),e.arcTo(t+s,n+a,t,n+a,o),e.arcTo(t,n+a,t,n,o),e.arcTo(t,n,t+s,n,o),e.closePath()}function Ja({headline:e="Мой прогресс",big:t="",sub:n=""}){const o=document.createElement("canvas");o.width=1080,o.height=1080;const i=o.getContext("2d");return i.fillStyle="#eef2f4",i.fillRect(0,0,1080,1080),i.fillStyle="#ffffff",i.shadowColor="rgba(20,33,55,.18)",i.shadowBlur=60,i.shadowOffsetY=24,xn(i,90,120,900,780,48),i.fill(),i.shadowColor="transparent",i.shadowBlur=0,i.shadowOffsetY=0,i.fillStyle="#0e8d7f",xn(i,90,120,900,150,48),i.fill(),i.fillStyle="#0e8d7f",i.fillRect(90,230,900,40),i.fillStyle="#ffffff",i.font="700 46px system-ui, sans-serif",i.textBaseline="middle",i.fillText("Распевка",130,195),i.font="500 30px system-ui, sans-serif",i.fillStyle="rgba(255,255,255,.9)",i.textAlign="right",i.fillText("вокальный тренажёр",950,195),i.textAlign="left",i.fillStyle="#5c6775",i.font="600 40px system-ui, sans-serif",i.fillText(e,150,380),i.fillStyle="#1b2430",i.font="800 150px system-ui, sans-serif",i.fillText(t,146,520),i.fillStyle="#0a766a",i.font="600 44px system-ui, sans-serif",i.fillText(n,150,660),i.fillStyle="#9aa6b2",i.font="500 32px system-ui, sans-serif",i.fillText("a1exxx.github.io/raspevka",150,840),o}async function Mn(e){const t=Ja(e),n=await new Promise(i=>t.toBlob(i,"image/png"));if(!n)return;const s=new File([n],"raspevka.png",{type:"image/png"});try{if(navigator.canShare&&navigator.canShare({files:[s]})){await navigator.share({files:[s],title:"Распевка",text:e.sub||"Мой прогресс в Распевке"});return}}catch{}const a=URL.createObjectURL(n),o=document.createElement("a");o.href=a,o.download="raspevka.png",document.body.appendChild(o),o.click(),o.remove(),setTimeout(()=>URL.revokeObjectURL(a),4e3)}function Xa(e){return e.toISOString().slice(0,10)}function Qa(e){if(!e||e.length<2)return"";const t=e.length,n=e.map(d=>d.low),s=e.map(d=>d.high),a=Math.min(...n)-1,o=Math.max(...s)+1,i=Math.max(1,o-a),c=300,l=70,r=5,u=d=>(r+d*(c-2*r)/(t-1)).toFixed(1),v=d=>(r+(1-(d-a)/i)*(l-2*r)).toFixed(1),h=d=>d.map((b,m)=>`${m?"L":"M"}${u(m)} ${v(b)}`).join(" ");return`
    <div class="seg-label" style="margin-top:14px">Рост диапазона</div>
    <svg class="range-tl" viewBox="0 0 ${c} ${l}" preserveAspectRatio="none" role="img" aria-label="График роста диапазона">
      <path d="${h(s)}" class="tl-high"/>
      <path d="${h(n)}" class="tl-low"/>
      <circle cx="${u(t-1)}" cy="${v(s[t-1])}" r="3.5" class="tl-dot-h"/>
      <circle cx="${u(t-1)}" cy="${v(n[t-1])}" r="3.5" class="tl-dot-l"/>
    </svg>`}function Za(e,{onExit:t}){const n=aa(),s=ia(),a=re(),o=oa(),i=Zn(),c=st(),l=c&&ut(c.key),r=new Set(n.map(f=>f.date)),u=[];for(let f=13;f>=0;f--){const p=new Date(Date.now()-f*864e5);u.push(`<span class="cal-dot ${r.has(Xa(p))?"done":""}"></span>`)}const v=n.slice(-12),h=v.length?v.map(f=>{const p=Math.round((f.pct||0)*100);return`<div class="acc-bar ${f.stars>=3?"g":f.stars===2?"a":"c"}" style="height:${Math.max(6,p)}%" title="${p}%"></div>`}).join(""):'<p class="hint">Пройди распевку — здесь появится история точности.</p>';let d="";const b=s.length?s[s.length-1]:c&&c.low!=null?c:null;if(b&&b.low!=null){const f=b.high-b.low;let p="";if(s.length>=2){const E=s[0],k=b.high-b.low-(E.high-E.low);k>0&&(p=` · <span style="color:var(--green)">+${k} пт с начала</span>`)}d=`
      <div class="card" style="text-align:left;width:100%">
        <div class="seg-label">Диапазон голоса</div>
        <p class="how" style="margin-top:6px"><b>${ot(b.low)} – ${ot(b.high)}</b> · ${f} полутонов${p}</p>
        ${as(b.low,b.high)}
        ${Qa(s)}
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
        <div class="acc-chart">${h}</div>
      </div>

      ${d}

      <button class="btn btn-primary" id="share" style="width:100%">Поделиться прогрессом</button>
      <button class="btn btn-ghost" id="back2" style="width:100%">В меню</button>
    </div>
  `,document.getElementById("back").addEventListener("click",t),document.getElementById("back2").addEventListener("click",t);const m=document.getElementById("share");m&&m.addEventListener("click",()=>{if(b&&b.low!=null){const f=b.high-b.low;Mn({headline:"Мой диапазон",big:`${ot(b.low)}–${ot(b.high)}`,sub:`${f} полутонов${a>0?` · стрик ${a}`:""}`})}else Mn({headline:"Мой прогресс",big:`${a}`,sub:"дней подряд в Распевке"})})}const ti=[0,2,4,5,7,9,11],Ln=e=>ti.includes((e%12+12)%12);function Tn(e){const t=rt(W(e));return t?t.name:""}function ei(e,t,n,{onExit:s,lowMidi:a=41,highMidi:o=81}){let i=null;const c=a-2,l=o+2,r=W(c),u=W(l);e.innerHTML=`
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
  `,document.getElementById("back").addEventListener("click",()=>{I(),s()});function v(){const T=De();document.getElementById("sens").innerHTML=[["low","Низкая"],["med","Средняя"],["high","Высокая"]].map(([R,y])=>`<button data-sens="${R}" class="${T===R?"on":""}">${y}</button>`).join(""),document.querySelectorAll("[data-sens]").forEach(R=>R.addEventListener("click",()=>{Qn(R.dataset.sens),t.setSensitivity&&t.setSensitivity(Ne()),v()}))}v();const h=document.getElementById("note"),d=document.getElementById("cents"),b=document.getElementById("lvl"),m=document.getElementById("fs"),f=m.getContext("2d");function p(){const T=Math.min(window.devicePixelRatio||1,2);m.width=m.clientWidth*T,m.height=m.clientHeight*T,f.setTransform(T,0,0,T,0,0)}p(),window.addEventListener("resize",p);function E(T,R){const y=Math.max(r,Math.min(u,T)),A=Math.log2(y/r)/Math.log2(u/r);return R-A*R}const k=[];n.setRange&&n.setRange(55,1300),n.reset();const C=document.getElementById("cele");let H=null,g=0,S=0,$=null;function w(T){C&&(C.innerHTML=`<svg viewBox="0 0 24 24" fill="currentColor" width="18" height="18"><path d="M12 2l2.4 6.3L21 9l-5 4.1L17.8 20 12 16.3 6.2 20 8 13.1 3 9l6.6-.7z"/></svg> ${T}`,C.hidden=!1,clearTimeout($),$=setTimeout(()=>{C&&(C.hidden=!0)},3400))}function L(){const T=m.clientWidth,R=m.clientHeight;f.clearRect(0,0,T,R),f.font="10px Inter, sans-serif";for(let q=Math.ceil(c);q<=l;q++){const Z=E(W(q),R),tt=(q%12+12)%12===0;f.strokeStyle=tt?"rgba(27,36,48,.20)":Ln(q)?"rgba(27,36,48,.08)":"rgba(27,36,48,.03)",f.lineWidth=1,f.beginPath(),f.moveTo(34,Z),f.lineTo(T,Z),f.stroke(),Ln(q)&&(f.fillStyle=tt?"rgba(27,36,48,.55)":"rgba(27,36,48,.32)",f.fillText(Tn(q),4,Z+3))}const y=t.read();let A=!1,P=null;if(y){const q=n.process(y);A=q.voiced&&t.rms()>.0025,P=q.smoothedHz}if(A&&P){const q=rt(P),Z=(q.name||"").match(/^([A-G]#?)(-?\d+)$/);h.innerHTML=Z?`${Z[1]}<span class="oct">${Z[2]}</span>`:q.name,h.classList.remove("silent"),d.textContent=`центы: ${q.cents>0?"+":""}${q.cents}`,b.style.width=Math.min(100,t.rms()*350)+"%";const tt=E(P,R);k.push(tt);const mt=Math.round(69+12*Math.log2(P/440));Math.abs(q.cents)<42?(mt===H?g++:(H=mt,g=1),g===26&&Date.now()-S>4e3&&ua(mt).extended&&(S=Date.now(),w(`Новая нота — ${Tn(mt)}! Диапазон растёт.`))):(H=null,g=0)}else h.textContent="—",h.classList.add("silent"),d.textContent="центы: —",b.style.width="0%",k.push(null),H=null,g=0;for(;k.length>90;)k.shift();const z=T-28;for(let q=0;q<k.length;q++){if(k[q]==null)continue;const Z=z-(k.length-1-q)*2.4,tt=q===k.length-1;f.fillStyle=tt?"#2fab84":"rgba(47,171,132,.35)",tt&&(f.shadowColor="#2fab84",f.shadowBlur=16),f.beginPath(),f.arc(Z,k[q],tt?8:2.5,0,Math.PI*2),f.fill(),f.shadowBlur=0}i=requestAnimationFrame(L)}L();function I(){i&&cancelAnimationFrame(i),i=null,window.removeEventListener("resize",p),clearTimeout($)}}const ni=""+new URL("belly-breathing-B0wu-xNS.webp",import.meta.url).href;function si(){return`
    <div class="breathe-diagram">
      <img class="belly-img" src="${ni}" alt="Дыхание животом: слева спокойный живот (выдох), справа надутый живот (вдох)" />
      <div class="belly-caps"><span>Выдох · живот мягкий</span><span>Вдох · живот надут</span></div>
      <p class="diagram-note">Не стесняйся: на вдохе <b>живот округляется вперёд</b> (как справа на картинке), воздух идёт вниз. Плечи и грудь почти неподвижны — не тянись вверх.</p>
    </div>`}const As={box:{title:"Дыхание по квадрату",kind:"paced",belly:!0,blurb:"Успокаивает и выравнивает дыхание перед пением. Вдох, задержка, выдох и пауза — все по 4 секунды. Дыши животом, плечи расслаблены.",cycles:4,phases:[{label:"Вдох",sec:4,from:.5,to:1},{label:"Задержка",sec:4,from:1,to:1},{label:"Выдох",sec:4,from:1,to:.5},{label:"Пауза",sec:4,from:.5,to:.5}]},belly:{title:"Дыхание животом",kind:"paced",belly:!0,blurb:"База певческого дыхания: вдох на 4 счёта — живот расширяется, выдох длиннее, на 6 счётов — ровно и плавно. Грудь и плечи неподвижны.",cycles:5,phases:[{label:"Вдох (живот)",sec:4,from:.5,to:1},{label:"Выдох ровно",sec:6,from:1,to:.5}]},hiss:{title:"Долгий выдох «с-с-с»",kind:"exhale",blurb:"Тренирует опору и ровный воздушный поток. Глубоко вдохни животом, затем выдыхай на звук «с-с-с» как можно дольше и РОВНО — без толчков. Я замерю время.",goals:[{sec:8,label:"хорошо"},{sec:15,label:"отлично"},{sec:20,label:"превосходно"}]}};function Cs(e,t,n,{onExit:s,onNext:a,nextLabel:o,onDone:i}){const c=As[n];let l=null;function r(){return`
      ${a?`<button class="btn btn-primary" id="next" style="width:100%">${o||"Дальше"} →</button>`:""}
      <div class="row"><button class="btn btn-ghost" id="menu">Меню</button>
      <button class="btn ${a?"btn-ghost":"btn-primary"}" id="again">Ещё раз</button></div>`}function u(f){document.getElementById("menu").addEventListener("click",s),document.getElementById("again").addEventListener("click",f);const p=document.getElementById("next");p&&p.addEventListener("click",a)}function v(){e.innerHTML=`
      <div class="screen breathe-intro">
        <div class="game-top"><button class="icon-btn" id="back">‹ ${a?"Назад":"Меню"}</button></div>
        <div class="brand"><h1>${c.title}</h1></div>
        <div class="card"><p class="blurb">${c.blurb}</p>${c.belly?si():""}</div>
        <button class="btn btn-primary" id="go" style="width:100%">Начать упражнение</button>
      </div>
    `,document.getElementById("back").addEventListener("click",s),document.getElementById("go").addEventListener("click",c.kind==="paced"?h:d)}function h(){e.innerHTML=`
      <div class="screen breathe">
        <div class="game-top"><button class="icon-btn" id="quit">‹ Прервать</button></div>
        <div class="breathe-stage">
          <div class="breathe-ring"><div class="breathe-core" id="core"></div></div>
          <div class="breathe-phase" id="phase">Приготовься…</div>
          <div class="breathe-count" id="count"></div>
        </div>
        <div class="breathe-cycles" id="cycles"></div>
      </div>
    `,document.getElementById("quit").addEventListener("click",()=>{m(),s()});const f=document.getElementById("core"),p=document.getElementById("phase"),E=document.getElementById("count"),k=document.getElementById("cycles");c.cycles*c.phases.length;let C=0,H=0,g=performance.now();S();function S(){k.innerHTML=Array.from({length:c.cycles},(L,I)=>`<span class="dot ${I<C?"done":I===C?"now":""}"></span>`).join("")}function $(){const L=c.phases[H],I=(performance.now()-g)/1e3,T=Math.min(1,I/L.sec),R=L.from+(L.to-L.from)*ai(T);if(f.style.transform=`scale(${R})`,p.textContent=L.label,E.textContent=Math.ceil(L.sec-I),I>=L.sec){if(H+=1,H>=c.phases.length&&(H=0,C+=1,S()),C>=c.cycles)return w();g=performance.now()}l=requestAnimationFrame($)}l=requestAnimationFrame($);function w(){m(),i&&i(),e.innerHTML=`
        <div class="screen summary">
          <div class="stars">🫁</div>
          <div class="verdict">Готово!</div>
          <p class="hint">${c.cycles} циклов дыхания пройдено. Голос готов к распевке.</p>
          ${r()}
        </div>`,u(h)}}function d(){e.innerHTML=`
      <div class="screen breathe">
        <div class="game-top"><button class="icon-btn" id="quit">‹ Прервать</button></div>
        <div class="breathe-stage">
          <div class="big-timer" id="timer">0.0</div>
          <div class="breathe-phase" id="phase">Вдохни глубоко и тяни «с-с-с»…</div>
        </div>
        <div class="bar"><i id="vol"></i></div>
        ${b()}
      </div>
    `,document.getElementById("quit").addEventListener("click",()=>{m(),s()});const f=document.getElementById("timer"),p=document.getElementById("phase"),E=document.getElementById("vol"),k=.012,C=.6;let H="ready",g=0,S=0;function $(){t.read();const L=t.rms();E.style.width=Math.min(100,L*400)+"%";const I=performance.now();if(H==="ready")L>k&&(H="running",g=I,S=I,p.textContent="Тяни ровно!");else if(H==="running"&&(L>k&&(S=I),f.textContent=((I-g)/1e3).toFixed(1),I-S>C*1e3))return w((S-g)/1e3);l=requestAnimationFrame($)}l=requestAnimationFrame($);function w(L){m(),i&&i(),L=Math.max(0,Math.round(L*10)/10);const I=$a(L),T=[...c.goals].reverse().find(y=>L>=y.sec),R=T?T.label[0].toUpperCase()+T.label.slice(1)+"!":"Попробуй ещё";e.innerHTML=`
        <div class="screen summary">
          <div class="big-pct">${L.toFixed(1)}<span>сек</span></div>
          <div class="verdict">${R}</div>
          <p class="hint">ровный выдох на «с-с-с» · твой рекорд: <b>${I.toFixed(1)} сек</b></p>
          ${r()}
        </div>`,u(d)}}function b(){const f=Zn();return f?`<p class="hint">Твой рекорд: <b>${f.toFixed(1)} сек</b></p>`:'<p class="hint">Замерим твой ровный выдох.</p>'}function m(){l&&cancelAnimationFrame(l),l=null}v()}function ai(e){return e<.5?2*e*e:1-Math.pow(-2*e+2,2)/2}const Bt=[{t:"Опора дыхания",b:"Вдох — живот мягко наполняется (плечи не поднимаются). На выдохе живот плавно поджимается и «держит» звук ровным. Это фундамент: без опоры голос дрожит и быстро устаёт."},{t:"Звук «в маску»",b:"Направляй звук в область носа и скул — голос начинает звенеть, а не «застревать» в горле. Поймать ощущение помогает мычание «м-м-м»."},{t:"Зевок в горле",b:"Лёгкое ощущение начала зевка освобождает гортань и расширяет пространство во рту. Звук становится объёмнее и свободнее, уходит зажим."},{t:"Не дави на верх",b:"Высокие ноты берутся не силой, а лёгкостью и опорой. Давишь — связки зажимаются и можно сорвать голос. Расширение диапазона — это недели, не один день."},{t:"Мягкая атака",b:"Начинай ноту мягко, без толчка горлом. Представь, что звук «вытекает», а не «выстреливает». Это бережёт связки и звучит красивее."},{t:"Округляй гласные",b:"Пой гласные округло, будто внутри звучит «о». Это выравнивает тембр по всему диапазону и убирает резкость и «плоскость»."},{t:"Губной тренаж «бррр»",b:"Вибрация губами снимает зажим и выравнивает поток воздуха. Лучшая разминка перед пением — и проверка, что дыхание ровное."},{t:"Береги голос",b:"Связки любят воду и отдых. Не пой на больном горле, делай паузы, не больше 20–30 минут подряд. Боль — всегда сигнал «стоп»."}];function ii(e,{onExit:t}){let n=0;function s(){const a=Bt[n],o=Bt.map((i,c)=>`<span class="dot ${c===n?"now":c<n?"done":""}"></span>`).join("");e.innerHTML=`
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
      </div>`,document.getElementById("back").addEventListener("click",t),document.getElementById("prev").addEventListener("click",()=>{n>0&&(n--,s())}),document.getElementById("next").addEventListener("click",()=>{n<Bt.length-1?(n++,s()):t()})}s()}const oi=[0,2,4,5,7,9,12],ci=e=>e[Math.floor(Math.random()*e.length)];function li(e){const t=rt(W(e));return t?t.name:""}function Hs(e,t,n,{onExit:s,root:a=60}){let i=0,c=0,l=null,r="idle",u=a,v=0,h=null;const d=gt?gt():"piano";e.innerHTML=`
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
    </div>`;const b=document.getElementById("status"),m=document.getElementById("bigq"),f=document.getElementById("cue"),p=document.getElementById("lvl"),E=document.getElementById("score");document.getElementById("back").addEventListener("click",()=>{L(),s()}),document.getElementById("replay").addEventListener("click",k),document.getElementById("skip").addEventListener("click",()=>{H("Пропущено"),S(1300)}),n.setRange&&n.setRange(55,1300),n.reset();function k(){t.ctx&&dt(t.ctx,W(u),1.3,0,.3,d),f.textContent="Слушай…",r="wait",clearTimeout(h),h=setTimeout(()=>{r="sing",f.textContent="Теперь спой эту ноту"},1350)}function C(){i++,u=a+ci(oi),v=0,m.textContent="?",m.classList.add("silent"),b.textContent=`Раунд ${i} / 8`,k()}function H(I){m.textContent=li(u),m.classList.remove("silent"),I&&(f.textContent=I),r="done"}function g(){c++,E.textContent=`Верно: ${c} / 8`,H("Верно! Бра-во."),m.classList.add("hit"),S(1300)}function S(I){clearTimeout(h),h=setTimeout(()=>{m.classList.remove("hit"),i>=8?$():C()},I)}function $(){L(),e.innerHTML=`
      <div class="screen summary">
        <div class="brand"><h1>Слух</h1></div>
        <div class="big-pct">${c}<span>/8</span></div>
        <p class="verdict">${c>=7?"Отличный слух!":c>=4?"Хорошо, продолжай!":"Слух тренируется — ещё раз!"}</p>
        <div class="row" style="max-width:360px">
          <button class="btn btn-ghost" id="again">Ещё раз</button>
          <button class="btn btn-primary" id="menu">В меню</button>
        </div>
      </div>`,document.getElementById("again").addEventListener("click",()=>Hs(e,t,n,{onExit:s,root:a})),document.getElementById("menu").addEventListener("click",s)}function w(){const I=t.read();let T=!1,R=null;if(I){const y=n.process(I);T=y.voiced&&t.rms()>.0025,R=y.smoothedHz}if(p.style.width=(T?Math.min(100,t.rms()*350):0)+"%",r==="sing"&&T&&R){const y=Math.abs(Pt(R,W(u)));y<45?v++:v=Math.max(0,v-2),f.textContent=y<45?"Держи…":R<W(u)?"↑ выше":"↓ ниже",v>=22&&g()}l=requestAnimationFrame(w)}function L(){l&&cancelAnimationFrame(l),l=null,clearTimeout(h)}C(),w()}function $t(e,t,n,s){return{id:e,name:t,tempo:n,syllable:"Ля",make(a){return{id:e,name:t,syllable:"Ля",tempo:n,kind:"song",root:a,desc:"Простая мелодия — веди голос по нотам и попадай в каждую.",how:"Пой на «ля», спокойно следуя за нотами. Это не упражнение, а маленькая песня.",notes:s.map(([o,i])=>({midi:a+o,beats:i}))}}}}const Rs=[$t("s1","Лесенка",96,[[0,1],[2,1],[4,1],[5,1],[7,2],[5,1],[4,1],[2,1],[0,2]]),$t("s2","Колыбельная",76,[[7,1],[5,1],[4,2],[5,1],[4,1],[2,2],[0,1],[2,1],[4,1],[2,1],[0,3]]),$t("s3","Прогулка",104,[[0,1],[0,1],[4,1],[4,1],[7,1],[5,1],[4,2],[2,1],[2,1],[5,1],[4,1],[2,1],[0,2]]),$t("s4","Ручеёк",112,[[0,.5],[2,.5],[4,.5],[5,.5],[7,1],[9,1],[7,1],[5,1],[4,.5],[2,.5],[0,2]]),$t("s5","Колокол",88,[[4,1],[7,1],[9,2],[7,1],[4,1],[5,2],[2,1],[4,1],[0,3]]),$t("s6","Закат",80,[[12,2],[9,1],[7,1],[5,2],[4,1],[2,1],[0,3]])],ri=e=>e.make(60).notes.map(t=>t.midi);function di(){return'<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2"><rect x="5" y="11" width="14" height="9" rx="2"/><path d="M8 11V8a4 4 0 0 1 8 0v3"/></svg>'}const Sn={free:"Free",standard:"Standard",pro:"Pro"};function ui(e,{onExit:t}){function n(){const s=xt(),a=Y(),o=["free","standard","pro"].map(c=>`<button data-tier="${c}" class="${s===c?"on":""}">${Sn[c]}</button>`).join(""),i=ee.map(c=>{const l=ss(c.key,s),r=c.key===a;return`
        <button class="mode-item ${l?"":"locked"} ${r?"sel":""}" data-mode="${c.key}" ${l?"":"disabled"}>
          <span class="mode-name">${c.name}${r?" · выбран":""}</span>
          ${l?"":`<span class="mode-lock">${di()} ${Sn[c.tier]}</span>`}
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
      </div>`,document.getElementById("back").addEventListener("click",t),document.querySelectorAll("[data-tier]").forEach(c=>c.addEventListener("click",()=>{Gt(c.dataset.tier),n()})),document.querySelectorAll("[data-mode]:not([disabled])").forEach(c=>c.addEventListener("click",()=>{_n(c.dataset.mode),n()}))}n()}const Ie={hum3:_e,trill:je,sustain:bs,scale5:Ts,agility:Ss,jump:Is,vowels:us,jump5:ms,lad:hs,vibrato:vs,vhold:os,vscale:cs,vagil:ls,vclimb:rs,jcharles:ds,vwobble:fs,timbre:ps,timbre2:gs,regarp:ys,regoct:ws,belt:Es,beltoct:$s,artic:ks,artic2:xs,resist:Ms,resist2:Ls},V=(e,t)=>({t:"ex",id:e,name:t}),In=(e,t)=>({t:"breath",id:e,name:t}),at=[{id:"b1",title:"Базовый импульс",sub:"Дыхание, опора, мягкая активация",items:[In("belly","Дыхание животом"),In("hiss","Долгий выдох «с-с-с»"),V("hum3","Мычание по гамме"),V("trill","Губной тренаж «brrr»")],exam:{exId:"hum3",pass:.55}},{id:"b2",title:"Ясность гласных",sub:"Выравнивание гласных и точность",items:[V("vhold","Пять гласных"),V("vscale","Лесенка гласных"),V("jcharles","Волна гласных"),V("vclimb","Качели на квинте"),V("vagil","Зигзаг")],exam:{exId:"vscale",pass:.6}},{id:"b3",title:"Интонация и гибкость",sub:"Гаммы, беглость, скачки",items:[V("scale5","Гамма «Ма-Мэ»"),V("agility","Беглость «Ма»"),V("jump","Октавный скачок")],exam:{exId:"agility",pass:.55}},{id:"b4",title:"Лад и музыкальное мышление",sub:"Лады, атака интервалов",items:[V("lad","Ладовая «ЯМ»"),V("jump5","Скачок к V ступени")],exam:{exId:"lad",pass:.55}},{id:"b5",title:"Вибрато",sub:"Ровный звук и мягкое колебание",items:[V("sustain","Удержание ноты"),V("vwobble","Раскачка вибрато"),V("vibrato","Вибрато")],exam:{exId:"vibrato",pass:.5}},{id:"b6",title:"Тембр и тон",sub:"Округлый, ровный звук",items:[V("timbre","Тёплый тон"),V("timbre2","Ровный тон на двух")],exam:{exId:"timbre",pass:.55}},{id:"b7",title:"Регистры и переходы",sub:"Грудной/головной, passaggio",items:[V("regarp","Через регистры"),V("regoct","Октавная связка")],exam:{exId:"regarp",pass:.5}},{id:"b8",title:"Белтинг",sub:"Яркая опёртая подача верха",items:[V("belt","Белтинг — гамма"),V("beltoct","Белт-арпеджио")],exam:{exId:"belt",pass:.55}},{id:"b9",title:"Артикуляция",sub:"Чёткая дикция и атака",items:[V("artic","Стаккато-арпеджио"),V("artic2","Слоги по группам")],exam:{exId:"artic",pass:.6}},{id:"b10",title:"Сопротивление",sub:"Выносливость и опора",items:[V("resist","Фигура-волчок"),V("resist2","Выносливая гамма")],exam:{exId:"resist2",pass:.5}}];function mi(e,t){return e<=0?!0:t.includes(at[e-1].id)}function Ps(){return`<div class="teacher-cta">
    <span>Педагог разберёт нюансы быстрее и покажет на твоём голосе.</span>
    <button class="btn btn-ghost" id="toSchool">Записаться на урок</button>
  </div>`}function hi(e,{blocks:t,examsPassed:n,onExit:s,onOpenBlock:a,onSchool:o}){const i=t.filter(r=>n.includes(r.id)).length,c=t.map((r,u)=>{const v=n.includes(r.id),h=mi(u,n),d=v?"done":h?"open":"locked",b=v?"✓":h?`${u+1}`:"🔒";return`<button class="block-card ${d}" data-block="${u}" ${h?"":"disabled"}>
        <span class="bc-badge">${b}</span>
        <span class="bc-main"><b>${r.title}</b><span class="bc-sub">${r.sub}</span></span>
        <span class="bc-arrow">${h?"›":""}</span>
      </button>`}).join("");e.innerHTML=`
    <div class="screen catalog">
      <div class="game-top"><button class="icon-btn" id="back">‹ Меню</button></div>
      <div class="brand"><h1>Программа обучения</h1><p>Блоки открываются по мере прохождения. Каждый блок завершается экзаменом.</p></div>
      <div class="prog-wrap"><div class="prog-bar"><i style="width:${Math.round(i/t.length*100)}%"></i></div><span class="prog-txt">${i} / ${t.length} блоков пройдено</span></div>
      <div class="block-list">${c}</div>
      ${Ps()}
      <p class="hint">Это самостоятельная практика. Полноценный разбор и постановку голоса даёт педагог.</p>
    </div>
  `,document.getElementById("back").addEventListener("click",s),e.querySelectorAll("[data-block]").forEach(r=>r.addEventListener("click",()=>a(Number(r.dataset.block))));const l=document.getElementById("toSchool");l&&o&&l.addEventListener("click",o)}function bi(e,{block:t,index:n,examsPassed:s,doneItems:a,onExit:o,onRunItem:i,onExam:c,onSchool:l}){const r=s.includes(t.id),u=t.items.map((d,b)=>{const m=a.includes(d.id),f=d.t==="breath"?'<span class="bi-tag">дыхание</span>':"";return`<button class="block-item" data-item="${b}">
        <span class="bi-check ${m?"on":""}">${m?"✓":b+1}</span>
        <span class="bi-name">${d.name}${f}</span>
        <span class="bc-arrow">›</span>
      </button>`}).join(""),v=t.items.every(d=>a.includes(d.id));e.innerHTML=`
    <div class="screen catalog">
      <div class="game-top"><button class="icon-btn" id="back">‹ Программа</button></div>
      <div class="brand"><h1>${t.title}</h1><p>${t.sub}</p></div>
      <div class="block-list">${u}</div>
      <button class="btn ${v?"btn-primary":"btn-ghost"}" id="exam" style="width:100%;margin-top:6px">
        ${r?"✓ Экзамен сдан · пересдать":"Экзамен блока"}
      </button>
      <p class="hint">${v?"Все упражнения пройдены — можно сдавать экзамен.":"Пройди упражнения, потом сдай экзамен. Можно и сразу — как удобнее."}</p>
      ${Ps()}
    </div>
  `,document.getElementById("back").addEventListener("click",o),e.querySelectorAll("[data-item]").forEach(d=>d.addEventListener("click",()=>i(t,Number(d.dataset.item)))),document.getElementById("exam").addEventListener("click",()=>c(t));const h=document.getElementById("toSchool");h&&l&&h.addEventListener("click",l)}function vi(){const e=["audio/webm;codecs=opus","audio/webm","audio/mp4","audio/ogg"];for(const t of e)try{if(window.MediaRecorder&&MediaRecorder.isTypeSupported(t))return t}catch{}return""}function fi(e,t,{onExit:n}){let s=null,a=[],o=null,i=null,c=0,l=!1;function r(b){const m=Math.floor(b/1e3);return`${Math.floor(m/60)}:${String(m%60).padStart(2,"0")}`}function u(){e.innerHTML=`
      <div class="screen recorder">
        <div class="game-top"><button class="icon-btn" id="back">‹ Меню</button></div>
        <div class="brand"><h1>Запись голоса</h1><p>Запиши себя и послушай со стороны — так слышно прогресс и ошибки, которые в моменте не замечаешь.</p></div>
        <div class="rec-timer ${l?"live":""}" id="timer">${r(0)}</div>
        <button class="btn ${l?"btn-danger":"btn-primary"} rec-btn" id="rec">${l?"■ Остановить":"● Записать"}</button>
        <audio id="player" controls ${o?"":"hidden"} style="width:100%;margin-top:16px"></audio>
        <p class="hint" style="margin-top:14px">Запись хранится только в этой сессии и никуда не отправляется. ${window.MediaRecorder?"":"<br>⚠️ Браузер не поддерживает запись."}</p>
      </div>
    `,document.getElementById("back").addEventListener("click",()=>{d(),n()});const b=document.getElementById("rec");if(!window.MediaRecorder){b.disabled=!0;return}b.addEventListener("click",l?h:v);const m=document.getElementById("player");o&&m&&(m.src=o)}function v(){if(!t.stream)return;if(a=[],o){try{URL.revokeObjectURL(o)}catch{}o=null}try{const m=vi();s=m?new MediaRecorder(t.stream,{mimeType:m}):new MediaRecorder(t.stream)}catch{return}s.ondataavailable=m=>{m.data&&m.data.size&&a.push(m.data)},s.onstop=()=>{const m=new Blob(a,{type:s.mimeType||"audio/webm"});o=URL.createObjectURL(m),l=!1,u()},s.start(),l=!0,c=typeof performance<"u"?performance.now():Date.now(),u();const b=()=>document.getElementById("timer");i=setInterval(()=>{const m=b();m&&(m.textContent=r((typeof performance<"u"?performance.now():Date.now())-c))},250)}function h(){clearInterval(i),i=null;try{s&&s.state!=="inactive"&&s.stop()}catch{l=!1,u()}}function d(){clearInterval(i),i=null;try{s&&s.state!=="inactive"&&s.stop()}catch{}if(o)try{URL.revokeObjectURL(o)}catch{}}u()}const pi="./backing/raspevka-rise.mp3",gi=[0,2,4,5,7,9,11],Bn=e=>gi.includes((e%12+12)%12);function yi(e){const t=rt(W(e));return t?t.name:""}function An(e){return e=Math.max(0,Math.floor(e||0)),`${Math.floor(e/60)}:${String(e%60).padStart(2,"0")}`}function wi(e,t,n,{onExit:s,lowMidi:a=40,highMidi:o=76}){let i=null;const c=a-2,l=o+2,r=W(c),u=W(l),v=new Audio(pi);v.preload="auto",e.innerHTML=`
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
  `;const h=document.getElementById("back"),d=document.getElementById("play"),b=document.getElementById("cur"),m=document.getElementById("dur"),f=document.getElementById("seek"),p=document.getElementById("note"),E=document.getElementById("fs"),k=E.getContext("2d");function C(){const w=Math.min(window.devicePixelRatio||1,2);E.width=E.clientWidth*w,E.height=E.clientHeight*w,k.setTransform(w,0,0,w,0,0)}C(),window.addEventListener("resize",C),v.addEventListener("loadedmetadata",()=>{m.textContent=An(v.duration)}),v.addEventListener("ended",()=>{d.textContent="▶ Слушать"}),d.addEventListener("click",()=>{v.paused?(v.play().catch(()=>{}),d.textContent="⏸ Пауза"):(v.pause(),d.textContent="▶ Слушать")}),h.addEventListener("click",()=>{$(),s()});function H(w,L){const I=Math.max(r,Math.min(u,w)),T=Math.log2(I/r)/Math.log2(u/r);return L-T*L}const g=[];n.setRange&&n.setRange(55,1300),n.reset();function S(){const w=E.clientWidth,L=E.clientHeight;k.clearRect(0,0,w,L),k.font="10px Inter, sans-serif";for(let A=Math.ceil(c);A<=l;A++){const P=H(W(A),L),z=(A%12+12)%12===0;k.strokeStyle=z?"rgba(27,36,48,.20)":Bn(A)?"rgba(27,36,48,.08)":"rgba(27,36,48,.03)",k.lineWidth=1,k.beginPath(),k.moveTo(34,P),k.lineTo(w,P),k.stroke(),Bn(A)&&(k.fillStyle=z?"rgba(27,36,48,.55)":"rgba(27,36,48,.32)",k.fillText(yi(A),4,P+3))}v.duration&&(f.style.width=Math.min(100,v.currentTime/v.duration*100)+"%",b.textContent=An(v.currentTime));const I=t.read();let T=!1,R=null;if(I){const A=n.process(I);T=A.voiced&&t.rms()>.0025,R=A.smoothedHz}if(T&&R){const A=rt(R),P=(A.name||"").match(/^([A-G]#?)(-?\d+)$/);p.innerHTML=P?`${P[1]}<span class="oct">${P[2]}</span>`:A.name,p.classList.remove("silent"),g.push(H(R,L))}else p.textContent="—",p.classList.add("silent"),g.push(null);for(;g.length>90;)g.shift();const y=w-28;for(let A=0;A<g.length;A++){if(g[A]==null)continue;const P=y-(g.length-1-A)*2.4,z=A===g.length-1;k.fillStyle=z?"#2fab84":"rgba(47,171,132,.35)",z&&(k.shadowColor="#2fab84",k.shadowBlur=16),k.beginPath(),k.arc(P,g[A],z?8:2.5,0,Math.PI*2),k.fill(),k.shadowBlur=0}i=requestAnimationFrame(S)}S();function $(){i&&cancelAnimationFrame(i),i=null,window.removeEventListener("resize",C);try{v.pause(),v.src=""}catch{}}}async function Ei(e){return!1}function $i(e,{onExit:t}){const n=st(),s=n&&ut(n.key),a=ea(),o={voiceType:s?s.name:null,range:a&&Number.isFinite(a.low)?`${ot(a.low)}–${ot(a.high)}`:null,streak:re(),blocks:Dt().length},i=[o.voiceType,o.range?`диапазон ${o.range}`:null,o.streak?`стрик ${o.streak}`:null,o.blocks?`блоков ${o.blocks}`:null].filter(Boolean).join(" · ")||"пока без данных";let c="any";function l(){e.innerHTML=`
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
    `,document.getElementById("back").addEventListener("click",t),e.querySelectorAll("#lf-pref [data-pref]").forEach(u=>u.addEventListener("click",()=>{c=u.dataset.pref,e.querySelectorAll("#lf-pref [data-pref]").forEach(v=>v.classList.toggle("on",v.dataset.pref===c))})),document.getElementById("lf-send").addEventListener("click",async()=>{const u=document.getElementById("lf-name").value.trim(),v=document.getElementById("lf-contact").value.trim(),h=document.getElementById("lf-goal").value.trim();if(!u||!v){document.getElementById("lf-err").textContent="Заполни имя и контакт — иначе педагог не сможет ответить.";return}const d=document.getElementById("lf-send");d.disabled=!0,d.textContent="Отправляю…",ca({name:u,contact:v,pref:c,goal:h,stats:o}),await Ei(),r(u)})}function r(u){Nt(1),e.innerHTML=`
      <div class="screen summary leadform-done">
        <div class="lf-check"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M5 13l4 4L19 7"/></svg></div>
        <div class="verdict">Заявка принята!</div>
        <p class="hint">Спасибо, ${u}! Педагог свяжется по твоему контакту и подберёт время бесплатного урока. Пока — продолжай практиковаться.</p>
        <button class="btn btn-primary" id="lf-ok" style="width:100%;max-width:360px">Вернуться</button>
      </div>
    `,document.getElementById("lf-ok").addEventListener("click",t)}l()}function ki(e,t,{onExit:n,onVoice:s,onCalibrate:a}){let o=!1;function i(r,u,v){return`<div class="seg">${r.map(([h,d])=>`<button data-${v}="${h}" class="${u===h?"on":""}">${d}</button>`).join("")}</div>`}function c(){const r=Ra();if(!r.sessions)return"";const u=r.perEx.slice(0,6).map(v=>`<div class="an-row"><span>${v.id}</span><span>${v.runs}× · ${v.avgPct}%</span></div>`).join("");return`
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
          ${i([["quiet","Тихо"],["normal","Норм"],["loud","Громко"],["max","Макс"]],de(),"vol")}

          <div class="seg-label">Вывод звука <span class="set-hint">влияет на компенсацию задержки</span></div>
          ${i([["speaker","Динамик"],["wired","Провод"],["bt","Bluetooth"]],me(),"route")}
          ${a?`<div class="set-row" style="margin-top:8px"><div class="seg-label" style="margin:0">Точная калибровка</div><button class="toggle" id="calib">${Math.round(Fe()*1e3)} мс · настроить ›</button></div>`:""}

          <div class="seg-label">Чувствительность микрофона</div>
          ${i([["low","Низкая"],["med","Средняя"],["high","Высокая"]],De(),"sens")}

          <div class="seg-label">Темп распевок</div>
          ${i([["easy","Медл."],["medium","Средне"],["fast","Быстро"]],Re(),"diff")}

          <div class="seg-label">Звук подсказки</div>
          ${i([["piano","Пиано"],["guitar","Гитара"],["soft","Мягкий"]],gt(),"timbre")}

          <div class="seg-label">Грув (ритм-подложка) <span class="set-hint">Авто — своя под каждую распевку</span></div>
          ${i([["off","Выкл"],["auto","Авто"],["pop","Поп"],["funk","Фанк"],["soft","Мягкий"]],He(),"groove")}

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
    `,document.getElementById("back").addEventListener("click",n),document.getElementById("voice").addEventListener("click",s),e.querySelectorAll("[data-vol]").forEach(h=>h.addEventListener("click",()=>{if(Jn(h.dataset.vol),le(ue()),t&&t.ctx)try{dt(t.ctx,523.25,.5,0,.22,gt())}catch{}l()})),e.querySelectorAll("[data-route]").forEach(h=>h.addEventListener("click",()=>{pa(h.dataset.route),l()})),e.querySelectorAll("[data-sens]").forEach(h=>h.addEventListener("click",()=>{Qn(h.dataset.sens),t&&t.setSensitivity&&t.setSensitivity(Ne()),l()})),e.querySelectorAll("[data-diff]").forEach(h=>h.addEventListener("click",()=>{Gn(h.dataset.diff),l()})),e.querySelectorAll("[data-timbre]").forEach(h=>h.addEventListener("click",()=>{Yn(h.dataset.timbre),l()})),e.querySelectorAll("[data-groove]").forEach(h=>h.addEventListener("click",()=>{jn(h.dataset.groove),l()})),document.getElementById("guide").addEventListener("click",()=>{Wn(!Lt()),l()}),document.getElementById("hp").addEventListener("click",()=>{Un(!pt()),l()}),document.getElementById("darkstage").addEventListener("click",()=>{ga(!Ct()),l()}),document.getElementById("agc").addEventListener("click",()=>{const h=!At();wa(h),t&&t.setAGC&&t.setAGC(h),l()});const v=document.getElementById("calib");v&&a&&v.addEventListener("click",a),document.getElementById("reset").addEventListener("click",()=>{if(!o){o=!0,l();return}On(),Ha(),n()})}l()}function xi(e,t,{k:n=4,minRms:s=.012,window:a=.5}={}){if(!Array.isArray(e)||e.length<3)return null;const o=e.filter(l=>l.t<t).map(l=>l.rms).sort((l,r)=>l-r);if(!o.length)return null;const i=o[Math.floor(o.length/2)]||0,c=Math.max(s,i*n);for(const l of e)if(!(l.t<=t)){if(l.t-t>a)break;if(l.rms>=c)return l.t-t}return null}function Mi(e,t=.03,n=.4){const s=e.filter(a=>Number.isFinite(a)&&a>=t&&a<=n).sort((a,o)=>a-o);return s.length<2?null:s[Math.floor(s.length/2)]}const Li=e=>new Promise(t=>setTimeout(t,e));function Ti(e,t,{onExit:n}){let s=!1,a="";function o(){const l=Math.round(Fe()*1e3);e.innerHTML=`
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
    `,document.getElementById("back").addEventListener("click",n),document.getElementById("measure").addEventListener("click",c);const r=document.getElementById("slider");r.addEventListener("input",()=>{const u=Number(r.value);document.getElementById("slval").textContent=u+" мс",document.getElementById("curms").textContent=u,bn(u/1e3)})}function i(){return new Promise(l=>{const r=t.ctx;if(!r){l(null);return}const u=[],v=r.currentTime,h=typeof performance<"u"?performance.now():Date.now(),d=v+.15;Jt(r,.15,!0);const b=()=>{t.read(),u.push({t:r.currentTime,rms:t.rms()});const m=r.currentTime-v,f=((typeof performance<"u"?performance.now():Date.now())-h)/1e3;m<.7&&f<1.3?setTimeout(b,16):l(xi(u,d))};b()})}async function c(){if(s)return;s=!0,a="",o();const l=[];for(let u=0;u<3;u++)a=`Замер ${u+1} из 3…`,o(),l.push(await i()),await Li(300);const r=Mi(l);s=!1,r==null?a="Не удалось расслышать эхо (тихо, наушники или сильный шум). Подстрой вручную ползунком ниже или выбери тип вывода в настройках.":(bn(r),a=`Готово: задержка ≈ ${Math.round(r*1e3)} мс — сохранено.`),o()}o()}function qs(e,{onExit:t}){const n=()=>qs(e,{onExit:t}),s=zn(),a=lt(),o=Oe(),i=(l,r)=>`
    <div class="seg-label">${l}</div>
    <div class="seg">${r.map(([u,v,h])=>`<button data-act="${u}" class="${h?"on":""}">${v}</button>`).join("")}</div>`;e.innerHTML=`
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

        <div class="seg-label" style="margin-top:12px">Стрик: ${re()} · заморозки: ${Xt()}</div>
        <div class="seg">
          <button data-act="s0">Стрик 0</button>
          <button data-act="s6">Стрик 6</button>
          <button data-act="s13">Стрик 13</button>
          <button data-act="fz">Заморозка +1</button>
        </div>

        <div class="seg-label" style="margin-top:12px">Энергия: ${ft()}/${qt()}</div>
        <div class="seg">
          <button data-act="e0">0</button>
          <button data-act="e1">1</button>
          <button data-act="emax">Полная</button>
        </div>

        ${i(`Пейволл (soft, ${ze}/день): сегодня использовано ${es()}`,[["pw-on","Вкл",Qt()],["pw-off","Выкл",!Qt()],["pw-use","+1 распевка",!1]])}

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
  `,document.getElementById("back").addEventListener("click",t),document.getElementById("exitDev").addEventListener("click",()=>{Zt(!1),pe(),t()}),document.getElementById("simNew").addEventListener("click",()=>{On(),pe(),Zt(!0),we(!0),n()});const c={"d-1":()=>fe(-1),"d+1":()=>fe(1),"d+7":()=>fe(7),d0:()=>pe(),s0:()=>ge(0),s6:()=>ge(6),s13:()=>ge(13),fz:()=>na(Xt()+1),e0:()=>Wt(0),e1:()=>Wt(1),emax:()=>Wt(qt()),"pw-on":()=>we(!0),"pw-off":()=>we(!1),"pw-use":()=>ns(),"tr-start":()=>ts(),"tr-reset":()=>Ma(),"tier-free":()=>Gt("free"),"tier-std":()=>Gt("standard"),"tier-pro":()=>Gt("pro"),"bl-all":()=>Ia(at.map(l=>l.id)),"bl-none":()=>Ba()};e.querySelectorAll("[data-act]").forEach(l=>{l.addEventListener("click",()=>{c[l.dataset.act](),n()})})}function Si(e,{onExit:t,onTrialStarted:n,onTeacher:s}){const a=Oe()!=null;e.innerHTML=`
    <div class="screen summary">
      <div class="game-top"><button class="icon-btn" id="back">‹ Меню</button></div>
      <div class="brand">
        <h1>На сегодня — всё 🎉</h1>
        <p>Ты прошёл ${ze} бесплатных распевок за день. Голосу полезен отдых — а завтра лимит обновится.</p>
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
  `,document.getElementById("back").addEventListener("click",t),document.getElementById("tomorrow").addEventListener("click",t),document.getElementById("teacher").addEventListener("click",s);const o=document.getElementById("trial");o&&o.addEventListener("click",()=>{ts(),Nt(2),n()})}const Ii=[{icon:"🎤",title:"Микрофон",body:"Круглая кнопка внизу экрана включает и выключает микрофон. Мы слушаем только высоту тона — ничего не записываем и не отправляем. Если браузер не дал доступ — нажми кнопку ещё раз и выбери «Разрешить»."},{icon:"🔊",title:"Плохо слышно подсказку?",body:"Настройки → «Громкость подсказки». На телефоне ставь «Громко» или «Макс». Звук подсказки (пиано/гитара/мягкий) — там же."},{icon:"🎧",title:"Звук опаздывает или «не туда» засчитывает?",body:"Это задержка вывода. Настройки → «Вывод звука»: выбери Динамик / Провод / Bluetooth (Bluetooth опаздывает сильнее всего). Для идеала — «Точная калибровка»: приложение само измерит задержку твоего устройства."},{icon:"🎵",title:"Подсказка тоном",body:"Без наушников подсказка звучит КОРОТКО перед нотой и молчит, пока поёшь — иначе микрофон ловит динамик. В наушниках включи тумблер «Наушники» — и подсказка будет вести тебя непрерывно."},{icon:"⚙️",title:"Темп и настройки прямо в упражнении",body:"На экране упражнения есть панель «Темп и подсказка тоном» (значок ⚙) — меняй темп на лету, проход мягко перезапустится. Продвинутое (тембр, грув, наушники) — под спойлером «Ещё настройки звука»."},{icon:"🎼",title:"Распевка идёт по твоему диапазону",body:"Каждая распевка начинается от низа твоего диапазона, поднимается по полутонам до верха и возвращается вниз — как на занятии с педагогом. Счётчик повторов виден сверху (например 3/17). Выйти можно в любой момент."},{icon:"🎹",title:"Лад распевок",body:"Для гаммовых распевок лад (мажор/минор и другие) выбирается прямо на экране перед стартом. Чем выше тариф — тем больше ладов открыто."},{icon:"⚡",title:"Энергия, стрик и заморозка",body:"Энергия тратится при провале (<40%) и копится за точные распевки; сама восстанавливается со временем. Стрик 🔥 — дни подряд. Заморозка ❄ спасает один пропущенный день (даётся за каждые 7 дней подряд)."},{icon:"🏆",title:"Программа обучения",body:"Главный путь: блоки открываются по очереди, каждый завершается экзаменом. Внутри блока после каждого упражнения — кнопка «Дальше» к следующему. Застрял — кнопка «Урок с педагогом» внизу."},{icon:"🌙",title:"Тёмный экран пения",body:"Настройки → «Тёмный экран пения»: светящийся след голоса на тёмной сцене. Дело вкуса — попробуй оба."}];function Bi(e,{onExit:t,onSettings:n}){const s=Ii.map(o=>`
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
  `,document.getElementById("back").addEventListener("click",t);const a=document.getElementById("toSettings");a&&n&&a.addEventListener("click",n)}const B=document.getElementById("app"),j=new js({fftSize:2048});let K=null,Ee=null;const Ai=60,Kt=[{label:"Мычание по гамме",sub:"«М» · I-II-III-II-I",ic:"lips",cat:"warm",make:e=>_e(e,Y())},{label:"Губной тренаж «brrr»",sub:"brrr / «Р» · 5 нот + квинта",ic:"wave",cat:"warm",make:e=>je(e,Y())},{label:"Удержание ноты",sub:"держать ровный звук",ic:"fork",cat:"warm",make:e=>bs(e,8)},{label:"Гамма «Ма-Мэ»",sub:"попадать в ноты гаммы",ic:"stairs",cat:"pitch",make:e=>Ts(e,Y())},{label:"Беглость «Ма»",sub:"быстрые ноты — как в рекламе",ic:"bolt",cat:"pitch",make:e=>Ss(e,Y())},{label:"Октавный скачок",sub:"прыжок на октаву и назад",ic:"arrows",cat:"pitch",make:e=>Is(e)},{label:"Цепочка гласных",sub:"Ми-Ме-Ма · выравнивание",ic:"lips",cat:"vowel",make:e=>us(e,Y())},{label:"Пять гласных",sub:"И-Э-А-О-У · позиция",ic:"lips",cat:"vowel",make:e=>os(e)},{label:"Лесенка гласных",sub:"И-Э-А-О-У · точность",ic:"stairs",cat:"vowel",make:e=>cs(e,Y())},{label:"Волна гласных",sub:"мотив с паузами + спуск",ic:"wave",cat:"vowel",make:e=>ds(e,Y())},{label:"Качели на квинте",sub:"И-Э-А-О-У · скачки",ic:"arrows",cat:"vowel",make:e=>rs(e,Y())},{label:"Зигзаг",sub:"гибкость на гласных",ic:"bolt",cat:"vowel",make:e=>ls(e,Y())},{label:"Скачок к V ступени",sub:"Ям · атака интервала",ic:"arrows",cat:"pitch",make:e=>ms(e,Y())},{label:"Ладовая «ЯМ»",sub:"гамма лада вверх-вниз",ic:"stairs",cat:"pitch",make:e=>hs(e,Y())},{label:"Вибрато",sub:"ровная волна голосом",ic:"wave",cat:"vib",make:e=>vs(e)},{label:"Раскачка вибрато",sub:"А · запуск вибрато",ic:"wave",cat:"vib",make:e=>fs(e)},{label:"Тёплый тон",sub:"Мо · качество тембра",ic:"fork",cat:"vib",make:e=>ps(e)},{label:"Ровный тон на двух",sub:"А · единый тембр",ic:"fork",cat:"vib",make:e=>gs(e)},{label:"Через регистры",sub:"Но · passaggio",ic:"arrows",cat:"reg",make:e=>ys(e)},{label:"Октавная связка",sub:"А · соединить регистры",ic:"arrows",cat:"reg",make:e=>ws(e)},{label:"Белтинг — гамма",sub:"Эй · яркая подача",ic:"bolt",cat:"reg",make:e=>Es(e)},{label:"Белт-арпеджио",sub:"Эй · опёртый верх",ic:"arrows",cat:"reg",make:e=>$s(e)},{label:"Стаккато-арпеджио",sub:"Та · артикуляция",ic:"bolt",cat:"artic",make:e=>ks(e)},{label:"Слоги по группам",sub:"Та-Ка · дикция",ic:"lips",cat:"artic",make:e=>xs(e)},{label:"Фигура-волчок",sub:"Ма · выносливость",ic:"stairs",cat:"artic",make:e=>Ms(e)},{label:"Выносливая гамма",sub:"Ма · длинный пробег",ic:"stairs",cat:"artic",make:e=>Ls(e)}],Ci=[["warm","Разогрев"],["vowel","Гласные"],["pitch","Точность и гибкость"],["vib","Вибрато и тембр"],["reg","Регистры и сила"],["artic","Дикция и выносливость"]];function Ft(){const e=st(),t=e&&ut(e.key);return t?t.center:Ai}function ae(){const e=st(),t=e&&ut(e.key);return e&&e.low!=null&&e.high!=null?{low:e.low,high:e.high}:t?{low:t.low,high:t.high}:{low:48,high:72}}function it(){if(!K)return;const e=st(),t=e&&ut(e.key);t?K.setRange(W(t.low-5),W(t.high+5)):K.setRange(60,1200)}const Hi=["Голос — это мышца. Сегодня сделаем её сильнее.","Дыши животом — и звук польётся сам.","Чисто — не значит громко. Решает точность.","Каждая распевка чуть-чуть расширяет диапазон.","Расслабь челюсть и плечи — голос любит свободу.","Лучшие певцы тоже начинали с простого «мычания».","Тёплый голос начинается с тёплого дыхания.","Не тянись за верхней нотой горлом — она придёт сама.","5 минут каждый день дают больше, чем час раз в неделю.","Улыбнись — и тембр станет светлее.","Зевни перед распевкой — гортань скажет спасибо.","Пой так, будто тебя уже любят слушать."];function Ri(e){const t=e.slice();for(let n=t.length-1;n>0;n--){const s=Math.floor(Math.random()*(n+1));[t[n],t[s]]=[t[s],t[n]]}return t}function Pi(){Q();const e=Ri(Hi);B.innerHTML=`
    <div class="screen splash">
      <div class="splash-core">
        <div class="eq" aria-hidden="true"><i></i><i></i><i></i><i></i><i></i></div>
        <h1 class="splash-title">Распевка</h1>
        <p class="splash-tip" id="tip">${e[0]}</p>
      </div>
      <div class="splash-bar"><i></i></div>
    </div>
  `;const t=window.matchMedia&&window.matchMedia("(prefers-reduced-motion: reduce)").matches;setTimeout(qi,t?1600:2800)}function qi(){zi();try{new URLSearchParams(location.search).has("dev")&&Zt(!0)}catch{}if(!st()&&!x().welcomed){Fi();return}D()}function Fi(){Q(),B.innerHTML=`
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
  `;const e=()=>F({...x(),welcomed:!0});document.getElementById("wlc-skip").addEventListener("click",()=>{e(),D()}),document.getElementById("wlc-go").addEventListener("click",()=>{e(),X(()=>We(B,j,K,{onDone:()=>{it(),Di()},onExit:D}))})}function Di(){Q(),B.innerHTML=`
    <div class="screen welcome">
      <div class="brand"><h1>Отлично! 🎉</h1>
        <p>Упражнения уже подстроились под твой голос. Попробуем первую распевку — мягкое мычание, 1 минута.</p></div>
      <button class="btn btn-primary" id="fe-go" style="width:100%">Первая распевка →</button>
      <button class="btn btn-ghost" id="fe-guide" style="width:100%">💡 Как тут всё устроено · 1 минута</button>
      <button class="btn btn-ghost" id="fe-menu" style="width:100%">В меню</button>
    </div>
  `,document.getElementById("fe-go").addEventListener("click",()=>oe(0)),document.getElementById("fe-guide").addEventListener("click",Ds),document.getElementById("fe-menu").addEventListener("click",D)}let bt="off";async function Fs(){try{if(!j.ready){j.setAGC(At());const{sampleRate:e}=await j.start();K||(K=new Gs(e,{fftSize:2048,minClarity:.85})),j.setSensitivity(Ne()),le(ue()),it()}return bt="listening",ie(),!0}catch{return bt="denied",ie(),!1}}async function Ni(){if(bt==="listening"){try{await j.suspend()}catch{}bt="off",ie()}else await Fs()}function zi(){const e=document.getElementById("mic-fab");e&&(e.hidden=!1,e.__wired||(e.addEventListener("click",Ni),e.__wired=!0),ie())}function ie(){const e=document.getElementById("mic-fab");if(!e)return;e.className="mic-fab "+bt;const t=e.querySelector(".mic-fab-txt");t&&(t.textContent=bt==="listening"?"Слушаю":bt==="denied"?"Нет доступа · нажми":"Включить микрофон"),e.setAttribute("aria-pressed",bt==="listening"?"true":"false")}async function X(e){if(!await Fs()){Oi(e);return}e()}function Oi(e){Q(),B.innerHTML=`
    <div class="screen">
      <div class="game-top"><button class="icon-btn" id="back">‹ Меню</button></div>
      <div class="brand"><h1>Нужен микрофон</h1>
        <p>Чтобы слышать твой голос, разреши доступ к микрофону. На телефоне нужен HTTPS, в браузере — «Разрешить».</p></div>
      <div class="card">
        <p class="hint" style="margin-bottom:16px">Нажми кнопку и выбери «Разрешить». Микрофон можно выключить в любой момент кнопкой внизу экрана.</p>
        <button class="btn btn-primary" id="grant" style="width:100%">Разрешить микрофон</button>
      </div>
    </div>
  `,document.getElementById("back").addEventListener("click",D),document.getElementById("grant").addEventListener("click",()=>X(e))}function $e(e){return`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">${{mic:'<path d="M12 3a3 3 0 0 0-3 3v6a3 3 0 0 0 6 0V6a3 3 0 0 0-3-3z"/><path d="M5 11a7 7 0 0 0 14 0M12 18v3"/>',chart:'<path d="M4 20V10M10 20V4M16 20v-7M22 20H2"/>',tuner:'<circle cx="12" cy="12" r="8"/><path d="M12 12l4-3"/><path d="M12 4v2M12 18v2M4 12h2M18 12h2"/>',wave:'<path d="M2 12h2l2-6 3 14 3-12 2 8 2-4h6"/>',note:'<circle cx="7" cy="18" r="3"/><circle cx="18" cy="16" r="3"/><path d="M10 18V5l11-2v13"/>',lips:'<path d="M3 12c4-5 14-5 18 0-4 5-14 5-18 0z"/><path d="M3 12h18"/>',fork:'<path d="M9 3v8a3 3 0 0 0 6 0V3"/><path d="M12 14v7"/>',stairs:'<path d="M3 19h4v-4h4v-4h4V7h4"/>',bolt:'<path d="M13 2 4 14h6l-1 8 9-12h-6z"/>',arrows:'<path d="M8 8l4-4 4 4M8 16l4 4 4-4M12 4v16"/>'}[e]||""}</svg>`}function Vi(){return'<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2c1 3-1 4-2 6-1 1.7-.5 3.5 1 4 .8.3 1-.7.5-1.5 2 .6 3.5 2.3 3.5 4.5A5 5 0 0 1 7 19c-1.7-1-2.7-3-2.5-5 .2-2.4 2-3.7 2.8-5.6C8.4 6 9 3.6 12 2z"/></svg>'}const ke=e=>e%10===1&&e%100!==11?"день":"дн.";function D(){Q();const e=(y,A)=>{const P=y.make(60).notes;return`
    <button class="ex-tile" data-ex="${A}">
      ${Te(P)}
      <span class="ex-tile-main">${y.label}</span>
      <span class="ex-tile-sub">${y.sub}</span>
    </button>`},t=Ci.map(([y,A])=>{const P=Kt.map((z,q)=>z.cat===y?e(z,q):"").join("");return`<div class="cat-title">${A}</div><div class="ex-row">${P}</div>`}).join(""),n=Dt(),s=at.findIndex(y=>!n.includes(y.id)),a=Math.round(n.length/at.length*100),o=Object.entries(As).map(([y,A])=>`
    <button class="thin-item" data-breath="${y}"><span>${A.title}</span><span class="thin-sub">${A.kind==="exhale"?"выдох":"дыхание"}</span></button>
  `).join(""),i=Object.entries(Ht).map(([y,A])=>`
    <button class="thin-item" data-rhythm="${y}"><span>${A.name}</span><span class="thin-sub">метроном</span></button>
  `).join(""),c=Rs.map((y,A)=>`
    <button class="ex-tile" data-song="${A}">
      ${Te(ri(y))}
      <span class="ex-tile-main">${y.name}</span>
      <span class="ex-tile-sub">мелодия · на «ля»</span>
    </button>`).join(""),l=re(),r=st(),u=r&&ut(r.key),v=sa(),h=Nn(),d=(h.getDate()+h.getMonth())%Kt.length,b=Kt[d],m=Ve(Y()).name,f=ft(),p=qt();B.innerHTML=`
    <div class="screen home">
      <header class="home-head">
        <h1>Распевка</h1>
        <div class="home-chips">
          <div class="energy-chip" title="Энергия — копится за точные распевки"><svg viewBox="0 0 24 24" fill="currentColor"><path d="M13 2 4 14h6l-1 8 9-12h-6z"/></svg>${f}/${p}</div>
          ${l>0?`<div class="streak-chip" title="Стрик: ${l} ${ke(l)} подряд">${Vi()} ${l}</div>`:""}
          ${Xt()>0?`<div class="energy-chip" title="Заморозка стрика — страхует 1 пропущенный день">❄ ${Xt()}</div>`:""}
          ${Sa()?'<button class="gear-btn" data-dev aria-label="Тест-режим" title="Тест-режим">🧪</button>':""}
          <button class="gear-btn" data-settings aria-label="Настройки"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg></button>
        </div>
      </header>

      <button class="hero-card" id="session">
        <div class="hero-eyebrow">Сегодня</div>
        <div class="hero-title">Полная распевка</div>
        <div class="hero-sub">${v?`Сегодня выполнено ✓${l>0?` · стрик ${l} ${ke(l)}`:""} — возвращайся завтра`:"Дыхание → распевка · ~10 минут"}</div>
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
        <button class="tile tile-hl" data-freesing="1">${$e("wave")}<span class="tile-main">Распевайся</span><span class="tile-sub">видеть свой голос</span></button>
        <button class="tile" data-voice="1">${$e("mic")}<span class="tile-main">Мой голос</span><span class="tile-sub">${u?u.name:"определить"}</span></button>
        <button class="tile" data-dash="1">${$e("chart")}<span class="tile-main">Прогресс</span><span class="tile-sub">${l>0?l+" "+ke(l)+" подряд":"статистика"}</span></button>
      </div>

      <button class="focus-chip" data-focus>
        <span class="fc-label">Фокус дня — <b>${b.label}</b></span>
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
  `,document.getElementById("session").addEventListener("click",()=>{const y=()=>X(()=>{it(),Ka(B,j,K,{onExit:D})});x().safetyAccepted?y():Wi(y)});const E=B.querySelector("[data-focus]");E&&E.addEventListener("click",()=>oe(d)),B.querySelector("[data-voice]").addEventListener("click",()=>{X(()=>We(B,j,K,{onDone:()=>{it(),D()},onExit:D}))}),B.querySelector("[data-dash]").addEventListener("click",()=>Za(B,{onExit:D})),B.querySelector("[data-freesing]").addEventListener("click",()=>{X(()=>{const y=ae();ei(B,j,K,{onExit:()=>{it(),D()},lowMidi:y.low,highMidi:y.high})})}),B.querySelectorAll("[data-ex]").forEach(y=>{y.addEventListener("click",()=>oe(Number(y.dataset.ex)))}),B.querySelectorAll("[data-breath]").forEach(y=>{y.addEventListener("click",()=>X(()=>Cs(B,j,y.dataset.breath,{onExit:D})))}),B.querySelectorAll("[data-rhythm]").forEach(y=>{y.addEventListener("click",()=>Bs(B,j,Ft(),Ht[y.dataset.rhythm],{onExit:D}))});const k=B.querySelector("[data-path]");k&&k.addEventListener("click",Ue);const C=B.querySelector("[data-ear]");C&&C.addEventListener("click",()=>X(()=>{it(),Hs(B,j,K,{onExit:D,root:Ft()})}));const H=B.querySelector("[data-theory]");H&&H.addEventListener("click",()=>ii(B,{onExit:D}));const g=B.querySelector("[data-record]");g&&g.addEventListener("click",()=>X(()=>fi(B,j,{onExit:D})));const S=B.querySelector("[data-backing]");S&&S.addEventListener("click",()=>X(()=>{const y=ae();wi(B,j,K,{onExit:()=>{it(),D()},lowMidi:y.low,highMidi:y.high})}));const $=B.querySelector("[data-modes]");$&&$.addEventListener("click",ji);const w=B.querySelector("[data-settings]");w&&w.addEventListener("click",Rt);const L=B.querySelector("[data-teacher]");L&&L.addEventListener("click",()=>zt(D)),B.querySelectorAll("[data-song]").forEach(y=>{y.addEventListener("click",()=>zs(Number(y.dataset.song)))});const I=B.querySelector("[data-guide]");I&&I.addEventListener("click",Ds);const T=B.querySelector("[data-dev]");T&&T.addEventListener("click",Cn);const R=B.querySelector(".home-head h1");if(R){let y=0,A=0;R.addEventListener("click",()=>{const P=Date.now();y=P-A<600?y+1:1,A=P,y>=7&&(y=0,Zt(!0),Cn())})}}function Cn(){Q(),qs(B,{onExit:D})}function Ds(){Q(),Bi(B,{onExit:D,onSettings:Rt})}function _i(){Q(),Si(B,{onExit:D,onTrialStarted:D,onTeacher:()=>zt(D)})}function Ns(e){if(Ta()){_i();return}Qt()&&ns(),e()}function oe(e,t=!0){if(t){Ns(()=>Hn(e,t));return}Hn(e,t)}function ce(e){const t=ae(),n=e(60),s=Math.min(...n.notes.map(c=>c.midi))-60,a=t.low-s,o=e(a),i=Ge(o,t.low,t.high,48);return{ex:o,reps:i}}function Hn(e,t){X(()=>{it();const n=o=>Kt[e].make(o),{ex:s,reps:a}=ce(n);ct(B,j,K,s,{explain:t,reps:a,rebuild:()=>ce(n).ex,onExit:D,onAgain:()=>oe(e,!1)})})}function zs(e,t=!0){if(t){Ns(()=>Rn(e,t));return}Rn(e,t)}function Rn(e,t){X(()=>{const n=Rs[e].make(Ft());ct(B,j,K,n,{explain:t,reps:[0],onExit:D,onAgain:()=>zs(e,!1)})})}function ji(){Q(),ui(B,{onExit:D})}function Ue(){Q(),hi(B,{blocks:at,examsPassed:Dt(),onExit:D,onOpenBlock:Tt,onSchool:zt})}function Tt(e){Q();const t=at[e];bi(B,{block:t,index:e,examsPassed:Dt(),doneItems:ra(t.id),onExit:Ue,onRunItem:Be,onExam:he,onSchool:zt})}function Be(e,t){const n=e.items[t],s=at.indexOf(e),a=e.items[t+1],o=()=>a?Be(e,t+1):he(e);X(()=>{if(it(),n.t==="breath"){Cs(B,j,n.id,{onExit:()=>Tt(s),onDone:()=>mn(e.id,n.id),onNext:o,nextLabel:a?`Дальше: ${a.name}`:"К экзамену блока"});return}const i=r=>Ie[n.id](r,Y()),{ex:c,reps:l}=ce(i);ct(B,j,K,c,{explain:!0,reps:l,rebuild:()=>ce(i).ex,onResult:r=>{r.pct>=.5&&mn(e.id,n.id)},onExit:()=>Tt(s),onAgain:()=>Be(e,t),nextLabel:a?`Дальше: ${a.name}`:"К экзамену блока",onNext:o})})}function he(e){X(()=>{it();const t=Ie[e.exam.exId](Ft(),Y()),n=ae(),s=Ge(t,n.low,n.high,2);ct(B,j,K,t,{explain:!0,reps:s,rebuild:()=>Ie[e.exam.exId](Ft(),Y()),onComplete:a=>Gi(e,a),onExit:()=>Tt(at.indexOf(e)),onAgain:()=>he(e)})})}function Gi(e,t){Q();const n=Math.round(t.pct*100),s=t.pct>=e.exam.pass;s?la(e.id):ft()>0&&Le(-1);const a=at.indexOf(e),o=s&&a+1<at.length,i=s?"var(--green)":"var(--coral)";B.innerHTML=`
    <div class="screen summary">
      <div class="verdict" style="color:${i}">${s?"Экзамен сдан!":"Пока не сдан"}</div>
      <div class="big-pct" style="color:${i}">${n}<span>%</span></div>
      <p class="hint">${s?`Блок «${e.title}» пройден.${o?" Открыт следующий блок.":""}`:`Нужно ${Math.round(e.exam.pass*100)}%. Энергия −1 (восстановится со временем). Можно пересдать сразу.`}</p>
      <div class="teacher-cta"><span>Разобрать ошибки с педагогом — быстрее.</span><button class="btn btn-ghost" id="toSchool">На урок</button></div>
      <div class="row">
        <button class="btn btn-ghost" id="toBlock">К блоку</button>
        <button class="btn btn-primary" id="primary">${s?o?"Следующий блок":"К программе":"Пересдать"}</button>
      </div>
    </div>`,document.getElementById("toBlock").addEventListener("click",()=>Tt(a)),document.getElementById("toSchool").addEventListener("click",zt),document.getElementById("primary").addEventListener("click",()=>{s?o?Tt(a+1):Ue():he(e)})}function zt(e){Q(),$i(B,{onExit:typeof e=="function"?e:D})}function Rt(){Q(),ki(B,j,{onExit:D,onVoice:()=>X(()=>We(B,j,K,{onDone:()=>{it(),Rt()},onExit:Rt})),onCalibrate:()=>X(()=>Ti(B,j,{onExit:Rt}))})}function Wi(e){Q(),B.innerHTML=`
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
  `,document.getElementById("accept").addEventListener("click",()=>{F({...x(),safetyAccepted:!0}),e()}),document.getElementById("safety-back").addEventListener("click",D)}function Q(){Ee&&cancelAnimationFrame(Ee),Ee=null}"serviceWorker"in navigator&&window.addEventListener("load",()=>{navigator.serviceWorker.register("./sw.js").catch(()=>{})});let xe=null;async function Me(){try{const e=await fetch(`./version.json?_=${Date.now()}`,{cache:"no-store"});if(!e.ok)return;const t=String((await e.json()).v||"");if(!t||t==="0")return;if(xe==null){xe=t;return}if(t!==xe&&!document.getElementById("updbar")){const n=document.createElement("div");n.id="updbar",n.className="update-banner",n.innerHTML='<span>Доступна новая версия</span><button class="btn btn-primary" id="updgo">Обновить</button>',document.body.appendChild(n),document.getElementById("updgo").addEventListener("click",()=>location.reload())}}catch{}}Me(),setInterval(Me,300*1e3),window.addEventListener("focus",Me);Pi();
