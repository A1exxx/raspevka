import{m as W,c as qt,a as Ze,f as Tn,h as rt,M as Ds,P as Fs}from"./note-map-ClIaVDR2.js";class zs{constructor(e){this.notes=Array.from({length:e},()=>({greenMs:0,scoredMs:0,activeMs:0,sumCents:0,centsMs:0})),this.g={ms:0,sumC:0,sumC2:0,reversals:0,lastC:null,lastDir:0}}record(e,n,a,s,o=null){const i=this.notes[e];if(i&&(i.activeMs+=a,!!s&&(i.scoredMs+=a,n==="green"?i.greenMs+=a:n==="yellow"&&(i.greenMs+=a*.5),o!=null&&Number.isFinite(o)))){i.sumCents+=o*a,i.centsMs+=a;const c=this.g;if(c.ms+=a,c.sumC+=o*a,c.sumC2+=o*o*a,c.lastC!=null){const l=o-c.lastC;if(Math.abs(l)>2){const r=l>0?1:-1;c.lastDir&&r!==c.lastDir&&(c.reversals+=1),c.lastDir=r}}c.lastC=o}}result(){let e=0,n=0,a=0,s=0,o=0;for(const d of this.notes)e+=d.greenMs,n+=d.activeMs,a+=d.sumCents,s+=d.centsMs,d.activeMs>0&&d.greenMs/d.activeMs>=.5&&(o+=1);const i=n>0?e/n:0,c=i>=.85?3:i>=.6?2:i>=.35?1:0,l=this.g;let r=0;if(l.ms>0){const d=l.sumC/l.ms,v=Math.max(0,l.sumC2/l.ms-d*d);r=Math.sqrt(v)}const u=l.ms/1e3,f=u>0?l.reversals/2/u:0,h=f>=3.5&&f<=8.5&&r>=15&&r<=130;return{pct:i,stars:c,notesHit:o,notesTotal:this.notes.length,avgCents:s>0?a/s:0,perNote:this.notes.map(d=>d.activeMs>0?d.greenMs/d.activeMs:0),stability:r,vibrato:{present:h,rateHz:f}}}}const tn={light:{grid:"rgba(27,36,48,.07)",gridC:"rgba(27,36,48,.18)",label:"rgba(27,36,48,.42)",hitLine:"rgba(14,141,127,.6)",note:"rgba(14,141,127,.26)",noteActive:"rgba(14,141,127,.95)",noteGlow:"rgba(14,141,127,.5)",green:"#2fab84",yellow:"#e0a64a",red:"#e0544b",free:"#0e8d7f",glow:0},dark:{grid:"rgba(255,255,255,.055)",gridC:"rgba(255,255,255,.14)",label:"rgba(255,255,255,.45)",hitLine:"rgba(61,229,201,.7)",note:"rgba(61,229,201,.2)",noteActive:"rgba(61,229,201,.95)",noteGlow:"rgba(61,229,201,.85)",green:"#3ee6a8",yellow:"#ffc24d",red:"#ff6b61",free:"#3de5c9",glow:10}};class Vs{constructor(e,n,a={}){this.theme=tn[a.theme]||tn.light,this.canvas=e,this.ctx=e.getContext("2d"),this.ex=n,this.secPerBeat=60/(n.tempo||90),this.greenCents=n.greenCents||20,this.yellowCents=n.yellowCents||40,this.pxPerSec=a.pxPerSec||150,this.hitFrac=a.hitFrac??.26,this.leadIn=a.leadIn??2.2;let s=this.leadIn;this.timed=n.notes.map(i=>{const c=i.beats*this.secPerBeat,l={midi:i.midi,hz:W(i.midi),start:s,end:s+c,dur:c};return s+=c+(i.gap||0)*this.secPerBeat,l}),this.totalTime=s+.6;const o=n.notes.map(i=>i.midi);this.minMidi=Math.min(...o)-3,this.maxMidi=Math.max(...o)+3,this.trail=[]}yFor(e,n){const a=W(this.minMidi),s=W(this.maxMidi),o=Math.max(a,Math.min(s,e)),i=Math.log2(o/a)/Math.log2(s/a);return n-i*n}activeAt(e){for(let n=0;n<this.timed.length;n++)if(e>=this.timed[n].start&&e<this.timed[n].end)return{index:n,seg:this.timed[n]};return null}evaluate(e,n,a){const s=this.activeAt(e);if(!s)return{index:-1,zone:null,voiced:!1};if(!a||!n)return{index:s.index,zone:"red",voiced:!1};const o=Math.abs(qt(n,s.seg.hz));return{index:s.index,zone:Ze(o,this.greenCents,this.yellowCents),voiced:!0}}draw(e,n,a){const s=this.ctx,o=this.canvas.clientWidth,i=this.canvas.clientHeight,c=o*this.hitFrac;s.clearRect(0,0,o,i);const l=this.theme;for(let p=Math.ceil(this.minMidi);p<=this.maxMidi;p++){const $=this.yFor(W(p),i),y=Tn(p),C=y&&y.startsWith("C");s.strokeStyle=C?l.gridC:l.grid,s.lineWidth=1,s.beginPath(),s.moveTo(0,$),s.lineTo(o,$),s.stroke(),C&&(s.fillStyle=l.label,s.font="10px Inter, sans-serif",s.fillText(y,4,$-3))}s.strokeStyle=l.hitLine,s.lineWidth=2,s.setLineDash([5,6]),s.beginPath(),s.moveTo(c,0),s.lineTo(c,i),s.stroke(),s.setLineDash([]);const r=this.activeAt(e),u=r?r.index:-1,f=16;for(let p=0;p<this.timed.length;p++){const $=this.timed[p],y=c+($.start-e)*this.pxPerSec,C=$.dur*this.pxPerSec;if(y+C<-20||y>o+20)continue;const H=this.yFor($.hz,i),g=p===u,B=8;s.fillStyle=g?l.noteActive:l.note,Ns(s,y,H-f/2,Math.max(C,10),f,B),s.fill(),g&&(s.shadowColor=l.noteGlow,s.shadowBlur=18+l.glow,s.fill(),s.shadowBlur=0)}let h=null,d="#5e6b7a";if(a&&n)if(h=this.yFor(n,i),r){const p=Ze(Math.abs(qt(n,r.seg.hz)),this.greenCents,this.yellowCents);d=p==="green"?l.green:p==="yellow"?l.yellow:l.red}else d=l.free;for(this.trail.push(h);this.trail.length>70;)this.trail.shift();const v=this.trail.length,m=2.2;s.strokeStyle=d,s.lineWidth=3,s.lineJoin="round",s.globalAlpha=.45,l.glow&&(s.shadowColor=d,s.shadowBlur=l.glow),s.beginPath();let b=!1;for(let p=0;p<v;p++){const $=this.trail[p];if($==null){b=!1;continue}const y=c-(v-1-p)*m;b?s.lineTo(y,$):(s.moveTo(y,$),b=!0)}s.stroke(),s.shadowBlur=0;for(let p=0;p<v;p++){const $=this.trail[p];if($==null)continue;const y=c-(v-1-p)*m;s.globalAlpha=.12+p/v*.5,s.fillStyle=d,s.beginPath(),s.arc(y,$,2,0,Math.PI*2),s.fill()}s.globalAlpha=1,h!=null&&(s.fillStyle=d,s.shadowColor=d,s.shadowBlur=16,s.beginPath(),s.arc(c,h,7,0,Math.PI*2),s.fill(),s.shadowBlur=0)}}function Ns(t,e,n,a,s,o){const i=Math.min(o,s/2,a/2);t.beginPath(),t.moveTo(e+i,n),t.arcTo(e+a,n,e+a,n+s,i),t.arcTo(e+a,n+s,e,n+s,i),t.arcTo(e,n+s,e,n,i),t.arcTo(e,n,e+a,n,i),t.closePath()}const Os=(()=>{try{return/Mobi|Android|iPhone|iPad|iPod/i.test(navigator.userAgent)||(navigator.maxTouchPoints||0)>1}catch{return!1}})(),js=Os?2.8:1.8;let Sn=js,kt=null;function ce(t){if(!(!Number.isFinite(t)||t<=0)&&(Sn=t,kt&&kt.__rtGain))try{kt.__rtGain.gain.setTargetAtTime(t,kt.currentTime,.02)}catch{}}function Bn(t){if(t.__rtMaster)return kt=t,t.__rtMaster;const e=t.createDynamicsCompressor();e.threshold.value=-10,e.knee.value=24,e.ratio.value=4,e.attack.value=.003,e.release.value=.25;const n=t.createGain();return n.gain.value=Sn,e.connect(n).connect(t.destination),t.__rtMaster=e,t.__rtGain=n,kt=t,e}function vt(t,e,n=.6,a=0,s=.22,o="piano"){const i=t.currentTime+a,c=t.createGain();c.connect(Bn(t));const l=[];let r=n;const u=(f,h,d,v)=>{const m=t.createOscillator(),b=t.createGain();m.type=f,m.frequency.value=h,b.gain.value=d,m.connect(b).connect(v),m.start(i),m.stop(i+r+.08),l.push(m)};if(o==="piano")r=Math.max(1.6,n),c.gain.setValueAtTime(1e-4,i),c.gain.linearRampToValueAtTime(s,i+.008),c.gain.exponentialRampToValueAtTime(1e-4,i+r),[[1,1],[2,.5],[3,.25],[4,.12]].forEach(([f,h])=>u("sine",e*f,h,c));else if(o==="guitar"){r=Math.max(1.3,n);const f=t.createBiquadFilter();f.type="lowpass",f.frequency.setValueAtTime(3800,i),f.frequency.exponentialRampToValueAtTime(700,i+r),f.connect(c),c.gain.setValueAtTime(1e-4,i),c.gain.linearRampToValueAtTime(s,i+.006),c.gain.exponentialRampToValueAtTime(1e-4,i+r),[[1,1],[2,.32]].forEach(([h,d])=>u("sawtooth",e*h,d,f))}else r=Math.max(.2,n),c.gain.setValueAtTime(0,i),c.gain.linearRampToValueAtTime(s,i+.025),c.gain.setValueAtTime(s,i+Math.max(.05,r-.1)),c.gain.linearRampToValueAtTime(0,i+r),u("triangle",e,1,c),u("triangle",e*2,.18,c);return{dur:n,stop(){try{l.forEach(f=>{f.stop(),f.disconnect()}),c.disconnect()}catch{}}}}function en(t,e,n=0,a=1.4,s=.14,o="piano"){return[0,4,7].forEach(i=>{const c=440*Math.pow(2,(e+i-69)/12);vt(t,c,a,n,s,o)}),a}function _s(t,e,n,a="piano",s=.22){const o=60/(n||90);let i=0;for(const c of e){const l=440*Math.pow(2,(c.midi-69)/12);vt(t,l,Math.max(.18,c.beats*o*.92),i,s,a),i+=(c.beats+(c.gap||0))*o}return i}function Kt(t,e=0,n=!1){const a=t.currentTime+e,s=t.createOscillator(),o=t.createGain();s.frequency.value=n?1600:1050;const i=n?.4:.26;o.gain.setValueAtTime(1e-4,a),o.gain.exponentialRampToValueAtTime(i,a+.005),o.gain.exponentialRampToValueAtTime(1e-4,a+.08),s.connect(o).connect(Bn(t)),s.start(a),s.stop(a+.1)}function In(t,e,n,a=.05){const s=[0,7,12].map(o=>{const i=440*Math.pow(2,(e+o-69)/12);return vt(t,i,n,0,a,"soft")});return{stop(){try{s.forEach(o=>o.stop())}catch{}}}}function nn(t){if(t.__noise)return t.__noise;const e=t.createBuffer(1,Math.floor(t.sampleRate*.5),t.sampleRate),n=e.getChannelData(0);for(let a=0;a<n.length;a++)n[a]=Math.random()*2-1;return t.__noise=e,e}const sn={pop:{kick:[0,4],snare:[2,6],hatOpen:[7],bass:[[0,0],[3,0],[4,7]],stab:[3,7],swing:0},funk:{kick:[0,3,6],snare:[2,6],hatOpen:[3,7],bass:[[0,0],[1,7],[4,0],[6,7]],stab:[1,3,5,7],swing:.18},soft:{kick:[0,4],snare:[6],hatOpen:[],bass:[[0,0],[4,7]],stab:[3],swing:0},drive:{kick:[0,2,4,6],snare:[2,6],hatOpen:[],bass:[[0,0],[2,0],[4,7],[6,7]],stab:[4],swing:0},march:{kick:[0,2,4,6],snare:[4],hatOpen:[0,4],bass:[[0,0],[2,7],[4,0],[6,7]],stab:[],swing:0},swing:{kick:[0,4],snare:[2,6],hatOpen:[3,7],bass:[[0,0],[3,5],[4,7],[6,12]],stab:[3,7],swing:.34},ballad:{kick:[0],snare:[4],hatOpen:[],bass:[[0,0],[4,7]],stab:[2,6],swing:0},latin:{kick:[0,3,6],snare:[2,7],hatOpen:[5],bass:[[0,0],[3,7],[6,5]],stab:[2,5],swing:0}};function Gs(t,{rootMidi:e=60,tempo:n=100,dur:a=16,style:s="pop",gain:o=.5,when:i=0}={}){const c=sn[s]||sn.pop,l=t.currentTime+i,r=60/n,u=r/2,f=r*4,h=Math.ceil(a/f)+1,d=t.createGain();d.gain.value=o;const v=t.createDynamicsCompressor();v.threshold.value=-12,v.ratio.value=4,d.connect(v).connect(t.destination);const m=[],b=g=>{const B=t.createOscillator(),k=t.createGain();B.frequency.setValueAtTime(150,g),B.frequency.exponentialRampToValueAtTime(48,g+.12),k.gain.setValueAtTime(.9,g),k.gain.exponentialRampToValueAtTime(.001,g+.18),B.connect(k).connect(d),B.start(g),B.stop(g+.2),m.push(B)},p=g=>{const B=t.createBufferSource();B.buffer=nn(t);const k=t.createBiquadFilter();k.type="bandpass",k.frequency.value=1800,k.Q.value=.7;const w=t.createGain();w.gain.setValueAtTime(.5,g),w.gain.exponentialRampToValueAtTime(.001,g+.14),B.connect(k).connect(w).connect(d),B.start(g),B.stop(g+.16),m.push(B)},$=(g,B)=>{const k=t.createBufferSource();k.buffer=nn(t);const w=t.createBiquadFilter();w.type="highpass",w.frequency.value=7e3;const M=t.createGain(),L=B?.12:.035;M.gain.setValueAtTime(.22,g),M.gain.exponentialRampToValueAtTime(.001,g+L),k.connect(w).connect(M).connect(d),k.start(g),k.stop(g+L+.02),m.push(k)},y=(g,B,k)=>{const w=t.createOscillator(),M=t.createGain();w.type="triangle",w.frequency.value=W(B),M.gain.setValueAtTime(1e-4,g),M.gain.linearRampToValueAtTime(.4,g+.01),M.gain.setValueAtTime(.4,g+k*.5),M.gain.exponentialRampToValueAtTime(.001,g+k),w.connect(M).connect(d),w.start(g),w.stop(g+k+.02),m.push(w)},C=g=>{[e,e+7,e+12].forEach(B=>{const k=t.createOscillator(),w=t.createGain();k.type="triangle",k.frequency.value=W(B),w.gain.setValueAtTime(1e-4,g),w.gain.linearRampToValueAtTime(.09,g+.008),w.gain.exponentialRampToValueAtTime(.001,g+.17),k.connect(w).connect(d),k.start(g),k.stop(g+.2),m.push(k)})},H=e-12;for(let g=0;g<h;g++){const B=l+g*f,k=w=>B+w*u+(w%2?c.swing*u:0);c.kick.forEach(w=>b(k(w))),c.snare.forEach(w=>p(k(w)));for(let w=0;w<8;w++)$(k(w),c.hatOpen.includes(w));c.bass.forEach(([w,M])=>y(k(w),H+M,u*1.6)),c.stab.forEach(w=>C(k(w)))}return{duck(g){const B=g?o*.25:o;try{d.gain.setTargetAtTime(B,t.currentTime,.04)}catch{}},stop(){try{m.forEach(g=>{try{g.stop()}catch{}g.disconnect&&g.disconnect()}),d.disconnect(),v.disconnect()}catch{}}}}const Te="raspevka.clock.v1";function Cn(){try{return Number(localStorage.getItem(Te))||0}catch{return 0}}function ft(){return Date.now()+Cn()}function An(){return new Date(ft())}function lt(t=An()){return t.toISOString().slice(0,10)}function Hn(){return Math.round(Cn()/864e5)}function Ws(t){try{localStorage.setItem(Te,String(Math.round(t)*864e5))}catch{}}function fe(t){Ws(Hn()+t)}function be(){try{localStorage.removeItem(Te)}catch{}}const Se="raspevka.progress.v1";function x(){try{return JSON.parse(localStorage.getItem(Se))||{}}catch{return{}}}function P(t){try{localStorage.setItem(Se,JSON.stringify(t))}catch{}}function Rn(){try{localStorage.removeItem(Se)}catch{}}function Us(){const t=x();return t.range&&Number.isFinite(t.range.low)?t.range:null}function qn(t){const e=x(),n=lt(),a=lt(new Date(ft()-864e5)),s=lt(new Date(ft()-2*864e5));let o=!1;return e.lastDate!==n?(e.lastDate===a?e.streak=(e.streak||0)+1:e.lastDate===s&&(e.freezes||0)>0?(e.freezes-=1,o=!0,e.streak=(e.streak||0)+1):e.streak=1,e.lastDate=n,e.streak>0&&e.streak%7===0&&(e.freezes=Math.min(2,(e.freezes||0)+1))):e.streak||(e.streak=1),e.history=e.history||[],e.history.push({date:n,pct:t.pct,stars:t.stars}),e.history.length>200&&(e.history=e.history.slice(-200)),e.total=(e.total||0)+1,P(e),{streak:e.streak,total:e.total,freezeSpent:o}}function le(){return x().streak||0}function Jt(){return x().freezes||0}function Ys(t){const e=x();return e.freezes=Math.max(0,Math.min(2,Math.round(t))),P(e),e.freezes}function Ks(){const t=lt();return(x().history||[]).some(e=>e.date===t)}function pe(t){const e=x();return e.streak=Math.max(0,Math.round(t)),e.lastDate=lt(),P(e),e.streak}function Js(){return x().history||[]}function Xs(){return x().rangeHistory||[]}function Qs(){return x().total||0}function Zs(t){const e=x();return e.leads=e.leads||[],e.leads.push({ts:ft(),...t}),e.leads.length>50&&(e.leads=e.leads.slice(-50)),P(e),e.leads}function Ft(){return x().examsPassed||[]}function ta(t){const e=x();return e.examsPassed=e.examsPassed||[],e.examsPassed.includes(t)||(e.examsPassed.push(t),P(e)),e.examsPassed}function ea(t){return(x().blockItems||{})[t]||[]}function an(t,e){const n=x();n.blockItems=n.blockItems||{};const a=n.blockItems[t]||[];return a.includes(e)||(a.push(e),n.blockItems[t]=a,P(n)),a}function Y(){return x().modeKey||"ionian"}function Pn(t){const e=x();return e.modeKey=t,P(e),t}function xt(){return x().tier||"free"}function _t(t){const e=x();return e.tier=t,P(e),t}const Mt=5,na=25;function Pt(){return Mt}function bt(){const t=x();let e=t.energy==null?Mt:t.energy;if(e<Mt&&t.energyTs){const n=Math.floor((ft()-t.energyTs)/(na*6e4));n>0&&(e=Math.min(Mt,e+n))}return e}function Gt(t){const e=x(),n=Math.max(0,Math.min(Mt,Math.round(t)));return e.energy=n,e.energyTs=n<Mt?ft():null,P(e),n}function $e(t){return Gt(bt()+t)}function Be(){return x().groove||"off"}function Dn(t){const e=x();return e.groove=t,P(e),t}function sa(t){const e=x();if(!e.range||!Number.isFinite(e.range.low))return{extended:null};let n=null;return t>e.range.high?(e.range.high=t,n="high"):t<e.range.low&&(e.range.low=t,n="low"),n&&(e.rangeHistory=e.rangeHistory||[],e.rangeHistory.push({date:lt(),low:e.range.low,high:e.range.high}),e.rangeHistory.length>100&&(e.rangeHistory=e.rangeHistory.slice(-100)),P(e)),{extended:n,midi:t}}function st(){const t=x();return t.voice&&t.voice.key?t.voice:null}function on(t,e=null,n=null){const a=x(),s=a.voice||{};return a.voice={key:t,low:e??s.low??null,high:n??s.high??null},e!=null&&n!=null&&(a.range={low:Math.round(e),high:Math.round(n)},a.rangeHistory=a.rangeHistory||[],a.rangeHistory.push({date:lt(),low:Math.round(e),high:Math.round(n)}),a.rangeHistory.length>100&&(a.rangeHistory=a.rangeHistory.slice(-100))),P(a),a.voice}const aa={easy:.6,medium:.8,fast:1};function Ie(){return x().difficulty||"easy"}function Fn(t){const e=x();return e.difficulty=t,P(e),t}function ia(){return aa[Ie()]||.6}function Lt(){return x().guide!==!1}function zn(t){const e=x();return e.guide=!!t,P(e),e.guide}function pt(){return x().headphones===!0}function Vn(t){const e=x();return e.headphones=!!t,P(e),e.headphones}function oa(){return Lt()?pt()?"continuous":"prehear":"off"}function gt(){const t=x().timbre;return t==="guitar"||t==="soft"?t:"piano"}function Nn(t){const e=x();return e.timbre=t,P(e),e.timbre}function On(){try{const t=navigator.userAgent||"";return/Mobi|Android|iPhone|iPad|iPod/i.test(t)||(navigator.maxTouchPoints||0)>1}catch{return!1}}const Ce={quiet:1,normal:1.8,loud:2.8,max:4.2};function ca(){return On()?"loud":"normal"}function re(){const t=x().volume;return Ce[t]?t:ca()}function de(){return Ce[re()]}function jn(t){const e=x();return Ce[t]&&(e.volume=t,P(e)),re()}const Ae={speaker:.09,wired:.12,bt:.24};function la(){return"speaker"}function ue(){const t=x().route;return Ae[t]?t:la()}function ra(t){const e=x();return Ae[t]&&(e.route=t,delete e.latencyManual,P(e)),ue()}function He(){const t=x().latencyManual;return Number.isFinite(t)?t:Ae[ue()]}function cn(t){const e=x();return e.latencyManual=Math.max(0,Math.min(.5,t)),P(e),e.latencyManual}function At(){return x().darkStage===!0}function da(t){const e=x();return e.darkStage=!!t,P(e),e.darkStage}function Ct(){return x().micAGC===!0}function ua(t){const e=x();return e.micAGC=!!t,P(e),e.micAGC}const _n={low:1.5,med:3,high:5.5};function ma(){return On()?"high":"med"}function Re(){const t=x().sensitivity;return _n[t]?t:ma()}function qe(){return _n[Re()]}function Gn(t){const e=x();return e.sensitivity=t,P(e),t}function Wn(){return x().breathBest||0}function ha(t){const e=x();return e.breathBest=Math.max(e.breathBest||0,t),P(e),e.breathBest}const Pe=5,va=7;function Xt(){return x().paywallEnabled===!0}function ge(t){const e=x();return e.paywallEnabled=!!t,P(e),e.paywallEnabled}function Un(){const t=x();return t.trialStart||(t.trialStart=ft(),P(t)),t.trialStart}function De(){const t=x().trialStart;if(!t)return null;const e=va-Math.floor((ft()-t)/864e5);return Math.max(0,e)}function fa(){const t=De();return t!=null&&t>0}function ba(){const t=x();delete t.trialStart,P(t)}function pa(){return xt()!=="free"||fa()}function Yn(){const t=x();return t.uses&&t.uses.date===lt()?t.uses.count:0}function Kn(){const t=x(),e=lt();return t.uses=t.uses&&t.uses.date===e?{date:e,count:t.uses.count+1}:{date:e,count:1},P(t),t.uses.count}function ga(){return!Xt()||pa()?!1:Yn()>=Pe}function ya(){return x().devMode===!0}function Qt(t){const e=x();return e.devMode=!!t,P(e),e.devMode}function wa(t){const e=x();return e.examsPassed=t.slice(),P(e),e.examsPassed}function Ea(){const t=x();delete t.examsPassed,delete t.blockItems,P(t)}const Zt="raspevka.analytics.v1",ln=500;function $a(t,e={}){try{const n=JSON.parse(localStorage.getItem(Zt)||"[]");n.push({t:Date.now(),type:t,...e}),n.length>ln&&n.splice(0,n.length-ln),localStorage.setItem(Zt,JSON.stringify(n))}catch{}}function ka(){try{return JSON.parse(localStorage.getItem(Zt)||"[]")}catch{return[]}}function xa(){try{localStorage.removeItem(Zt)}catch{}}function Ma(){const t=ka(),e=t.filter(s=>s.type==="exercise_done"),n={};for(const s of e)(n[s.id||"—"]=n[s.id||"—"]||[]).push(s.pct||0);const a=Object.entries(n).map(([s,o])=>({id:s,runs:o.length,avgPct:Math.round(o.reduce((i,c)=>i+c,0)/o.length)})).sort((s,o)=>o.runs-s.runs);return{total:t.length,sessions:e.length,perEx:a}}const te=[{key:"ionian",name:"Ионийский (мажор)",intervals:[0,2,4,5,7,9,11],tier:"free"},{key:"aeolian",name:"Эолийский (минор)",intervals:[0,2,3,5,7,8,10],tier:"standard"},{key:"dorian",name:"Дорийский",intervals:[0,2,3,5,7,9,10],tier:"pro"},{key:"phrygian",name:"Фригийский",intervals:[0,1,3,5,7,8,10],tier:"pro"},{key:"lydian",name:"Лидийский",intervals:[0,2,4,6,7,9,11],tier:"pro"},{key:"mixolydian",name:"Миксолидийский",intervals:[0,2,4,5,7,9,10],tier:"pro"},{key:"locrian",name:"Локрийский",intervals:[0,1,3,5,6,8,10],tier:"pro"},{key:"harm_major",name:"Гармонический мажор",intervals:[0,2,4,5,7,8,11],tier:"pro"},{key:"harm_minor",name:"Гармонический минор",intervals:[0,2,3,5,7,8,11],tier:"pro"}],rn={free:0,standard:1,pro:2};function Fe(t){return te.find(e=>e.key===t)||te[0]}function Jn(t,e="free"){const n=Fe(t);return rn[n.tier]<=rn[e||"free"]}function La(t,e){const n=e.intervals,a=Math.round(t)-1,s=Math.floor(a/7),o=(a%7+7)%7;return n[o]+12*s}function yt(t,e){const n=Fe(e);return t.map(a=>La(a,n))}const Ta="#0e8d7f",Sa="#0a766a",Ba="#687485",Ia="#ffffff",dn="#2a3340",Ca="#cfd6e0",Aa=[0,2,4,5,7,9,11],un=t=>Aa.includes((t%12+12)%12),Ha=t=>`C${Math.floor(t/12)-1}`;function Xn(t,e){if(t==null||e==null)return"";let n=Math.round(t)-2,a=Math.round(e)+2;for(;(n%12+12)%12!==0;)n--;for(;(a%12+12)%12!==11;)a++;const s=13,o=54,i=9,c=33,l=d=>d>=t&&d<=e,r=[];for(let d=n;d<=a;d++)un(d)&&r.push(d);const u=r.length*s,f={};r.forEach((d,v)=>{f[d]=v*s});let h="";r.forEach((d,v)=>{const m=v*s;h+=`<rect x="${m}" y="0" width="${s-1}" height="${o}" rx="2.5" fill="${l(d)?Ta:Ia}" stroke="${Ca}" stroke-width="1"/>`,(d%12+12)%12===0&&(h+=`<text x="${m+(s-1)/2}" y="${o+11}" text-anchor="middle" fill="${Ba}" font-size="8">${Ha(d)}</text>`)});for(let d=n;d<=a;d++){if(un(d))continue;const v=f[d-1];if(v==null)continue;const m=v+s-i/2;h+=`<rect x="${m}" y="0" width="${i}" height="${c}" rx="2" fill="${l(d)?Sa:dn}" stroke="${dn}" stroke-width="1"/>`}return`
    <div class="mini-kb">
      <svg viewBox="0 0 ${u} ${o+14}" preserveAspectRatio="xMidYMid meet" role="img" aria-label="Диапазон голоса на клавиатуре">
        ${h}
      </svg>
    </div>`}function ke(t){if(!Array.isArray(t)||!t.length)return'<span class="ex-glyph"></span>';const e=t.map(m=>typeof m=="number"?{midi:m,beats:1,gap:0}:{midi:m.midi,beats:m.beats||1,gap:m.gap||0}),n=e.map(m=>m.midi),a=Math.min(...n),s=Math.max(...n),o=Math.max(1,s-a)+1,i=e.reduce((m,b)=>m+b.beats+b.gap,0),c=Math.max(5,Math.min(16,150/i)),l=10,r=1.6,u=l-4;let f=0,h="";for(const m of e){const b=Math.max(3,m.beats*c-r),p=(s-m.midi)*l+2,$=m.midi===s?' class="gh-hi"':"";h+=`<rect${$} x="${f.toFixed(1)}" y="${p}" width="${b.toFixed(1)}" height="${u}" rx="2"/>`,f+=(m.beats+m.gap)*c}const d=f,v=o*l;return`<span class="ex-glyph"><svg viewBox="0 0 ${d.toFixed(0)} ${v}" preserveAspectRatio="xMidYMid meet" role="img" aria-label="Рисунок мелодии упражнения">${h}</svg></span>`}const mn=["#0e8d7f","#12a36b","#e0a64a","#5b8def","#e0544b","#9b6dd6"];function zt(t=1){if(window.matchMedia&&window.matchMedia("(prefers-reduced-motion: reduce)").matches)return;const e=t>=2?36:18,n=document.createElement("div");n.setAttribute("aria-hidden","true"),n.style.cssText="position:fixed;inset:0;pointer-events:none;z-index:999;overflow:hidden",document.body.appendChild(n);const a=window.innerWidth;for(let s=0;s<e;s++){const o=document.createElement("i"),i=5+Math.random()*6,c=Math.random()<.4;o.style.cssText=`position:absolute;top:-12px;left:${Math.random()*a}px;width:${i}px;height:${c?i:i*.45}px;background:${mn[s%mn.length]};border-radius:${c?"50%":"2px"};will-change:transform,opacity`,n.appendChild(o);const l=320+Math.random()*380,r=(Math.random()-.5)*160,u=1100+Math.random()*900;o.animate([{transform:"translate(0,0) rotate(0deg)",opacity:1},{transform:`translate(${r}px,${l}px) rotate(${(Math.random()-.5)*540}deg)`,opacity:0}],{duration:u,delay:Math.random()*250,easing:"cubic-bezier(.2,.6,.35,1)",fill:"forwards"})}setTimeout(()=>n.remove(),2600)}function ee(t=12){try{navigator.vibrate&&navigator.vibrate(t)}catch{}}let Qn=!1;function ct(t,e,n,a,s={}){const{onExit:o,onAgain:i,onComplete:c,onResult:l,onNext:r,nextLabel:u,explain:f}=s;if(ce(de()),f){xe(t,a,{onExit:o,onStart:()=>ct(t,e,n,a,{...s,explain:!1}),onModeChange:s.rebuild?()=>ct(t,e,n,s.rebuild(),{...s,explain:!0}):null});return}const h=s.reps,d=s.repIndex||0,v=h&&h.length&&h[d]||0,m=a.root!=null?a.root:a.notes[0].midi,b=v?{...a,root:m+v,notes:a.notes.map(S=>({...S,midi:S.midi+v}))}:a,p=h&&h.length>1?` · ${d+1}/${h.length}`:"";t.innerHTML=`
    <div class="screen game ${At()?"stage-dark":""}">
      <div class="game-top">
        <button class="icon-btn" id="exit">‹ Меню</button>
        <div class="ex-name">${b.name} · <span class="syl">«${b.syllable}»</span>${p}</div>
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
  `;const $=document.getElementById("hw"),y=$.getContext("2d"),C=document.getElementById("msg"),H=document.getElementById("livebar"),g=document.getElementById("target"),B=document.getElementById("yours"),k=document.getElementById("cue");function w(){const S=Math.min(window.devicePixelRatio||1,2);$.width=$.clientWidth*S,$.height=$.clientHeight*S,y.setTransform(S,0,0,S,0,0)}w(),window.addEventListener("resize",w);const M=ia(),L={...b,tempo:Math.max(40,Math.round(b.tempo*M))},T=new Vs($,L,{theme:At()?"dark":"light"}),R=new zs(b.notes.length),E=He(),A=pt()||ue()!=="speaker";let q=null,_=null,D=0,Z=0,tt=!1,ut=!1,Nt=0,_e=-1;const wt=[],he=[],St=(S,N)=>{const O=setTimeout(S,N);return he.push(O),O};function Ge(){wt.forEach(S=>S&&S.stop&&S.stop()),wt.length=0}function ve(){_&&(cancelAnimationFrame(_),_=null),he.forEach(clearTimeout),he.length=0,window.removeEventListener("resize",w),document.removeEventListener("visibilitychange",We),Ge()}function We(){document.hidden?(_&&(cancelAnimationFrame(_),_=null),Ge(),D&&!tt&&(tt=!0,ut=!0)):ut&&(ut=!1,Ue())}document.addEventListener("visibilitychange",We),document.getElementById("exit").addEventListener("click",()=>{ve(),o()});function Ue(){ve(),ct(t,e,n,a,{...s,explain:!1})}Ut(document.getElementById("gsettings"),Ue,e);const Ot=b.root!=null?b.root:b.notes[0].midi,Bt=gt();T.draw(0,null,!1),d===0?(C.textContent="Слушай тонику…",en(e.ctx,Ot,0,1.4,.14,Bt),St(()=>{C.textContent="Образец…";const S=_s(e.ctx,L.notes,L.tempo,Bt);St(Rs,S*1e3+250)},1650)):(C.textContent=(v>0?"↑ выше":"↓ ниже")+` · повтор ${d+1}/${h.length}`,en(e.ctx,Ot,0,.8,.14,Bt),St(()=>{Kt(e.ctx,0,!0),St(Ye,480)},950));function Rs(){let S=3;const N=()=>{S>0?(Kt(e.ctx),C.textContent="Приготовься… "+S,S-=1,St(N,600)):Ye()};N()}function Ye(){const S=oa();C.textContent=S==="continuous"?"Пой за подсказкой!":S==="prehear"?"Слушай тон и повторяй!":"Пой!",n.reset(),D=performance.now(),Z=D,Nt=D,S==="continuous"?T.timed.forEach(G=>{wt.push(vt(e.ctx,G.hz,Math.max(.2,G.dur*.92),G.start,.1,Bt))}):S==="prehear"&&T.timed.forEach(G=>{const U=Math.min(.4,G.dur);wt.push(vt(e.ctx,G.hz,U,Math.max(0,G.start-U),.18,Bt))}),b.drone&&wt.push(In(e.ctx,Ot,T.totalTime+.5,.05));const N=Be(),O=N==="auto"?b.grooveStyle||"pop":N;O!=="off"&&(q=Gs(e.ctx,{rootMidi:Ot,tempo:L.tempo,dur:T.totalTime,style:O,gain:.45}),wt.push(q)),Ke()}function Ke(){const S=performance.now(),N=(S-D)/1e3,O=S-Z;Z=S;const G=e.read();let U=!1,et=null;if(G){const mt=n.process(G);U=mt.voiced&&e.rms()>.0025,et=mt.smoothedHz}q&&!A&&q.duck(U);const nt=T.evaluate(N-E,U?et:null,U);if(nt.index>=0){let mt=null;nt.voiced&&et&&T.timed[nt.index]&&(mt=qt(et,T.timed[nt.index].hz)),R.record(nt.index,nt.zone,O,nt.voiced,mt),nt.zone==="green"&&nt.voiced&&nt.index!==_e&&(ee(12),_e=nt.index)}T.draw(N,U?et:null,U);const Et=T.activeAt(N);if(g.textContent=Et?Ra(Et.seg.midi):"—",U&&et){Nt=S;const mt=rt(et);B.textContent=mt?mt.name:"—";const Ps=nt.zone==="green"?"var(--green)":nt.zone==="yellow"?"var(--yellow)":"var(--coral)";if(B.style.color=Et?Ps:"var(--text)",H.style.width=Math.min(100,e.rms()*350)+"%",Et){const Qe=qt(et,Et.seg.hz);Math.abs(Qe)<=20?(k.textContent="в точку",k.style.color="var(--green)"):Qe<0?(k.textContent="↑ выше",k.style.color="var(--amber)"):(k.textContent="↓ ниже",k.style.color="var(--amber)")}else k.textContent=""}else B.textContent="—",B.style.color="var(--text-dim)",H.style.width="0%",Et&&S-Nt>5e3?(k.textContent="не слышу голос — спой громче",k.style.color="var(--coral)"):k.textContent="";N<T.totalTime?_=requestAnimationFrame(Ke):tt||(tt=!0,qs())}function qs(){const S=R.result();ve();const N=s._acc||[];if(N.push(S),h&&h.length>1&&d<h.length-1){ct(t,e,n,a,{...s,repIndex:d+1,_acc:N});return}const O=N.reduce((U,et)=>U+(et.pct||0),0)/N.length,G={pct:O,stars:O>=.85?3:O>=.6?2:O>=.35?1:0,notesHit:S.notesHit,notesTotal:S.notesTotal,avgCents:S.avgCents,perNote:S.perNote,stability:S.stability,vibrato:S.vibrato,repsDone:N.length};if($a("exercise_done",{id:a.id,pct:Math.round(O*100),stability:Math.round(S.stability||0),reps:N.length}),l&&l(G),c){c(G);return}if(O>=.5&&qn({pct:O,stars:G.stars}),O<.4){if(bt()>0){$e(-1),Xe(G);return}}else O>=.5&&$e(O>=.8?2:1);Je(G)}function Je(S){S.stars>=2&&(zt(S.stars>=3?2:1),ee(S.stars>=3?30:15));const N="★".repeat(S.stars)+"☆".repeat(3-S.stars),O=Math.round(S.pct*100),G=S.stars>=3?"Отлично!":S.stars===2?"Хорошо!":S.stars===1?"Неплохо":"Ещё разок",U=vn(S,a);t.innerHTML=`
      <div class="screen summary">
        <div class="stars">${N}</div>
        <div class="verdict">${G}</div>
        <div class="big-pct">${O}<span>%</span></div>
        <p class="hint">средняя точность${S.repsDone>1?` за ${S.repsDone} повтор${S.repsDone<5?"а":"ов"}`:""}</p>
        ${hn(bt(),Pt())}
        ${Pa(S)}
        <div class="card tip-card"><p class="how"><b>Разбор.</b> ${U}</p></div>
        ${Wt()}
        ${r?`<button class="btn btn-primary" id="next" style="width:100%">${u||"Дальше"} →</button>`:""}
        <div class="row">
          <button class="btn btn-ghost" id="menu">Меню</button>
          <button class="btn ${r?"btn-ghost":"btn-primary"}" id="again">Ещё раз</button>
        </div>
      </div>
    `,Ut(t,()=>Je(S),e),document.getElementById("again").addEventListener("click",i),document.getElementById("menu").addEventListener("click",o);const et=document.getElementById("next");et&&et.addEventListener("click",r)}function Xe(S){const N=Math.round(S.pct*100),O=vn(S,a);t.innerHTML=`
      <div class="screen summary">
        <div class="verdict" style="color:var(--coral)">Сложновато — попробуем ещё</div>
        <div class="big-pct" style="color:var(--coral)">${N}<span>%</span></div>
        ${hn(bt(),Pt())}
        <div class="card tip-card"><p class="how"><b>Подсказка.</b> ${O}</p></div>
        <p class="hint">Энергия −1 (восстанавливается со временем). Сбавь темп или включи «подсказку тоном» — станет легче.</p>
        ${Wt()}
        <div class="row">
          <button class="btn btn-ghost" id="menu">Меню</button>
          <button class="btn btn-primary" id="again">Пройти заново</button>
        </div>
        ${r?`<button class="btn btn-ghost" id="next" style="width:100%">${u||"Дальше"} →</button>`:""}
      </div>`;const G=()=>ct(t,e,n,a,{...s,explain:!1,repIndex:0,_acc:void 0});Ut(t,()=>Xe(S),e),document.getElementById("menu").addEventListener("click",o),document.getElementById("again").addEventListener("click",G);const U=document.getElementById("next");U&&U.addEventListener("click",r)}}function Ra(t){const e=rt(440*Math.pow(2,(t-69)/12));return e?e.name:""}function qa(){return'<svg viewBox="0 0 24 24" width="15" height="15" fill="currentColor"><path d="M13 2 4 14h6l-1 8 9-12h-6z"/></svg>'}function hn(t,e){const n=Array.from({length:e},(a,s)=>`<span class="en-pip ${s<t?"on":""}"></span>`).join("");return`<div class="energy-row"><span class="en-ic">${qa()}</span><div class="energy-pips">${n}</div></div>`}function Pa(t){if(t.stability==null)return"";const e=t.stability,n=e<15?"ровно":e<30?"почти ровно":"дрожит",a=e<15?"var(--green)":e<30?"var(--amber)":"var(--coral)",o=t.vibrato&&t.vibrato.present?`есть · ${t.vibrato.rateHz.toFixed(1)} Гц`:"нет";return`<div class="stat-chips">
    <span class="stat-chip">ровность: <b style="color:${a}">${n}</b></span>
    <span class="stat-chip">вибрато: <b>${o}</b></span>
  </div>`}function Da(t){if(t.modeKey===void 0)return"";const e=Y(),n=xt();return`<div class="settings" style="margin-bottom:8px">
      <div class="seg-label">Лад распевки</div>
      <select id="modeSel" class="lad-select">${te.map(s=>{const o=!Jn(s.key,n);return`<option value="${s.key}" ${s.key===e?"selected":""} ${o?"disabled":""}>${s.name}${o?" 🔒":""}</option>`}).join("")}</select>
    </div>`}function xe(t,e,{onExit:n,onStart:a,onModeChange:s}){t.innerHTML=`
    <div class="screen breathe-intro">
      <div class="game-top"><button class="icon-btn" id="back">‹ Меню</button></div>
      <div class="brand"><h1>${e.name}</h1>
        <p>Слог: <b>«${e.syllable}»</b></p></div>
      <div class="card">
        ${e.desc?`<p class="blurb">${e.desc}</p>`:""}
        ${e.how?`<p class="how"><b>Как делать.</b> ${e.how}</p>`:""}
        <div class="ex-glyph preview-contour" title="Форма распевки: выше плашка — выше нота, длиннее — дольше">${ke(e.notes)}</div>
        <p class="how mech"><b>Как устроена игра.</b> Ноты едут к вертикальной линии слева. Пой так, чтобы твой светящийся шарик совпал с нотой по высоте: <b style="color:var(--green)">зелёный</b> — точно, <b style="color:var(--amber)">жёлтый</b> — почти, <b style="color:var(--coral)">красный</b> — мимо. Сначала прозвучит <b>аккорд тоники</b> и образец мелодии — это твоя опора, чтобы попасть. «Подсказка тоном» подыгрывает нужную ноту (без наушников — коротко перед тем, как её петь).</p>
      </div>
      ${Da(e)}
      ${Wt()}
      <button class="btn btn-primary" id="go" style="width:100%">Начать</button>
    </div>
  `,document.getElementById("back").addEventListener("click",n),document.getElementById("go").addEventListener("click",a),Ut(t,()=>xe(t,e,{onExit:n,onStart:a,onModeChange:s}));const o=document.getElementById("modeSel");o&&o.addEventListener("change",()=>{Pn(o.value),s?s():xe(t,e,{onExit:n,onStart:a,onModeChange:s})})}function Wt(){const t=Ie(),e=Lt(),n=pt(),a=gt(),s=(u,f)=>`<button data-diff="${u}" class="${t===u?"on":""}">${f}</button>`,o=(u,f)=>`<button data-timbre="${u}" class="${a===u?"on":""}">${f}</button>`,i=Be(),c=(u,f)=>`<button data-groove="${u}" class="${i===u?"on":""}">${f}</button>`,l=re(),r=(u,f)=>`<button data-vol="${u}" class="${l===u?"on":""}">${f}</button>`;return`
    <div class="settings inline-settings">
      <div class="seg-label">Громкость подсказки</div>
      <div class="seg">${r("quiet","Тихо")}${r("normal","Норм")}${r("loud","Громко")}${r("max","Макс")}</div>
      <div class="seg-label">Темп</div>
      <div class="seg">${s("easy","Медл.")}${s("medium","Средне")}${s("fast","Быстро")}</div>
      <div class="toggle-row">
        <button class="toggle ${e?"on":""}" data-guidetoggle="1">Подсказка тоном: ${e?"вкл":"выкл"}</button>
      </div>
      <details class="more-settings" ${Qn?"open":""}>
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
  `}function Ut(t,e,n){t.querySelectorAll("[data-diff]").forEach(i=>{i.addEventListener("click",()=>{Fn(i.dataset.diff),e()})}),t.querySelectorAll("[data-timbre]").forEach(i=>{i.addEventListener("click",()=>{Nn(i.dataset.timbre),e()})}),t.querySelectorAll("[data-groove]").forEach(i=>{i.addEventListener("click",()=>{Dn(i.dataset.groove),e()})}),t.querySelectorAll("[data-vol]").forEach(i=>{i.addEventListener("click",()=>{if(jn(i.dataset.vol),ce(de()),n&&n.ctx)try{vt(n.ctx,523.25,.5,0,.22,gt())}catch{}e()})});const a=t.querySelector("[data-guidetoggle]");a&&a.addEventListener("click",()=>{zn(!Lt()),e()});const s=t.querySelector("[data-hptoggle]");s&&s.addEventListener("click",()=>{Vn(!pt()),e()});const o=t.querySelector(".more-settings");o&&o.addEventListener("toggle",()=>{Qn=o.open})}function vn(t,e){if(t.stars>=3)return"Чисто и точно! Можно прибавить темп или взять упражнение посложнее.";const n=[],a=t.avgCents;a<=-18?n.push("Ты чаще занижал — тяни ноту чуть выше, поддержи дыханием (опора живота)."):a>=18&&n.push("Ты чаще завышал — не дави, расслабь гортань, целься чуть ниже.");const s=t.perNote.length;if(s>=3){const i=e.notes.map((l,r)=>({i:r,midi:l.midi})).sort((l,r)=>r.midi-l.midi).slice(0,Math.max(1,Math.round(s/3)));i.reduce((l,r)=>l+(t.perNote[r.i]||0),0)/i.length<t.pct-.15&&n.push("Верхние ноты даются хуже — не тянись вверх горлом, добавь головной резонанс и воздух.")}return n.length||n.push("Целься в центр ноты и держи ровно. Включи «подсказку тоном» — попадать заметно легче."),n.join(" ")}const z=(t,e=1,n=0)=>n?{midi:t,beats:e,gap:n}:{midi:t,beats:e};function Zn(t){const e=(n,a,s=0)=>z(t+n,a,s);return{id:"vhold",name:"Calm Down Vowels",syllable:"И-Э-А-О-У",tempo:78,kind:"vowel",root:t,grooveStyle:"soft",greenCents:25,desc:"Унификация гласных: держим позицию, меняем только гласную «И-Э-А-О-У».",how:"Пой «И-Э-А-О-У» ровно, без «прыжков» голосом при смене гласной. Сначала стаккато с паузами, потом строка повторяется выше — позиция единая.",notes:[e(0,.5,.5),e(0,.5,.5),e(0,.5,.5),e(0,.5,.5),e(0,.5,.5),e(0,.5),e(0,.5),e(0,.5),e(0,.5),e(0,1),e(4,.25),e(4,.25),e(4,.25),e(4,.25),e(4,1,2),e(4,.25),e(4,.25),e(4,.25),e(4,.25),e(4,1)]}}function ts(t){const e=(n,a)=>z(t+n,a);return{id:"vscale",name:"Disco Vowels",syllable:"И-Э-А-О-У",tempo:124,kind:"scale",root:t,grooveStyle:"pop",desc:"Точность высоты при смене гласной — каждая гласная ведёт по двум нотам.",how:"Пой «И-Э-А-О-У» легко и точно, попадая в каждую ноту слига. Не зажимайся.",notes:[e(0,.5),e(2,.5),e(5,.5),e(7,.5),e(9,.5),e(7,.5),e(5,.5),e(2,.5),e(7,1),e(5,3)]}}function es(t){return{id:"vagil",name:"No Bubble Gum",syllable:"И-Э-И-А-И-О-И-У",tempo:100,kind:"agility",root:t,grooveStyle:"funk",desc:"Беглость и точность: зигзаг по ступеням вверх и обратно.",how:"Лёгко и быстро веди голос по нотам зигзагом вверх, не зажимаясь. Гласные чёткие.",notes:[0,3,1,5,3,7,5,8,7,3,5,1,0].map(n=>z(t+n,.5))}}function ns(t){const e=(n,a)=>z(t+n,a);return{id:"vclimb",name:"High Five",syllable:"И-Э-А-О-У",tempo:92,kind:"jump",root:t,grooveStyle:"soft",desc:"Гибкость и точность интервала: скачки на квинту вверх и зеркально вниз.",how:"Чисто бери скачок на квинту (без зажима), пробежку пой ровно. Вторая половина — то же зеркально вниз. Опора дыханием.",notes:[e(0,.5),e(7,.5),e(0,.5),e(7,.5),e(0,.5),e(7,.5),e(0,.5),e(7,.5),e(0,.5),e(7,.5),e(0,.25),e(2,.25),e(4,.25),e(5,.25),e(7,2),e(7,.5),e(0,.5),e(7,.5),e(0,.5),e(7,.5),e(0,.5),e(7,.5),e(0,.5),e(7,.5),e(0,.5),e(7,.25),e(5,.25),e(4,.25),e(2,.25),e(0,2)]}}function ss(t){const e=(n,a,s=0)=>z(t+n,a,s);return{id:"jcharles",name:"James Charles Warm Up",syllable:"И-Э-А-О-У",tempo:130,kind:"agility",root:t,grooveStyle:"swing",desc:"Гибкость и позиция гласных: повторяющийся мотив, затем плавный спуск.",how:"Лёгко веди гласные по мотиву, в конце мягко спустись. Без зажима, позиция единая.",notes:[e(0,.5),e(2,.5),e(5,.5,.5),e(0,.5),e(2,.5),e(5,.5,.5),e(0,.5),e(2,.5),e(5,.5),e(8,1),e(7,.5),e(5,.5),e(2,.5),e(0,.5),e(2,.5),e(5,.5,.5),e(0,.5),e(2,.5),e(5,.5),e(8,1),e(7,1.5)]}}function as(t,e="ionian"){const n=yt([1,2,3,2,1],e);return{id:"vowels",name:"Цепочка гласных",syllable:"Ми-Ме-Ма",tempo:90,kind:"scale",root:t,modeKey:e,grooveStyle:"swing",desc:"Выравнивание гласных и сохранение позиции при смене звука.",how:"Пой по кругу гласные «Ми-Ме-Ма-Мо», широко раскрывая рот, держи единую позицию.",notes:n.map(a=>z(t+a,1))}}function is(t,e="ionian"){const n=yt([1,1,3,2,1,1,5,1,1,3,2,1],e);return{id:"jump5",name:"Скачок к V ступени",syllable:"Ям",tempo:100,kind:"jump",root:t,modeKey:e,grooveStyle:"latin",desc:"Точная атака интервалов и контроль регистра при скачках.",how:"Пой на «Ям». Перед скачком на квинту не зажимайся — целься точно в ноту.",notes:n.map(a=>z(t+a,1))}}function os(t,e="ionian"){const a=yt([1,2,3,4,5,6,7,8,7,6,5,4,3,2,1],e);return{id:"lad",name:"Ладовая «ЯМ»",syllable:"Ям",tempo:100,kind:"scale",root:t,modeKey:e,drone:!0,grooveStyle:"march",desc:"Слух и ощущение ладовой окраски — гамма лада вверх и вниз.",how:"Пой на «Ям» по ступеням лада вверх до октавы и обратно. Слушай окраску лада.",notes:a.map(s=>z(t+s,1))}}function cs(t,e=8){return{id:"sustain",name:"Удержание ноты",syllable:"А",tempo:70,kind:"sustain",root:t,grooveStyle:"ballad",desc:"Учит держать ровный стабильный звук и дыхательную опору — основа пения.",how:"Слушай образец, потом тяни ноту на «А» как можно ровнее. Держи шарик в зелёной зоне без дрожи.",notes:[z(t,e)]}}function ls(t){return{id:"vibrato",name:"Вибрато",syllable:"А",tempo:60,kind:"vibrato",root:t,grooveStyle:"ballad",greenCents:55,yellowCents:95,desc:"Ровное вибрато — мягкое «качание» высоты примерно 5–6 раз в секунду.",how:"Сначала тяни ровную «А». Когда звук устойчив — добавь лёгкую «волну» голосом, 5–6 колебаний в секунду. Колебание идёт от дыхания и опоры, не дави горлом. На итоге увидишь частоту своего вибрато.",notes:[z(t,10)]}}function rs(t){return{id:"vwobble",name:"Раскачка вибрато",syllable:"А",tempo:120,kind:"vibrato",root:t,grooveStyle:"soft",greenCents:55,desc:"Запуск вибрато: ровный звук с лёгким «качанием» высоты — основа естественного вибрато.",how:"Пой «А» и добавь мягкое колебание голосом — вверх-вниз небольшими шагами. Колебание идёт от опоры дыхания, не дави горлом.",notes:[0,1,0,1,0,1,0,5,6,5,6,5,6,5].map(n=>z(t+n,.5))}}function ds(t){return{id:"timbre",name:"Тёплый тон",syllable:"Мо",tempo:96,kind:"scale",root:t,grooveStyle:"ballad",desc:"Качество тембра: ровный, округлый звук при движении голоса по нотам.",how:"Пой «Мо» округло и тепло, держи одинаковый тембр на каждой ноте. Не зажимай, звук в маску.",notes:[0,1,3,0,1,3,1,0,0,1,3,5,7,5].map(n=>z(t+n,.5))}}function us(t){return{id:"timbre2",name:"Ровный тон на двух",syllable:"А",tempo:80,kind:"sustain",root:t,grooveStyle:"ballad",desc:"Единый тембр при переходе между двумя высотами (вниз на кварту и обратно).",how:"Держи одинаковый округлый звук на обеих нотах — не «бели» нижнюю и не зажимай верхнюю.",notes:[0,0,0,-5,-5,0,0,-5,-5].map(n=>z(t+n,1))}}function ms(t){return{id:"regarp",name:"Через регистры",syllable:"Но",tempo:92,kind:"jump",root:t,grooveStyle:"soft",desc:"Плавный переход (passaggio): соединяем нижний и верхний регистр через опорные тоны аккорда.",how:"Пой «Но», возвращаясь к тонике и беря всё выше (терция → квинта → октава). Без «слома» на переходе — мягко.",notes:[0,3,0,7,0,12,0,7,0,3].map(n=>z(t+n,.6))}}function hs(t){return{id:"regoct",name:"Октавная связка",syllable:"А",tempo:76,kind:"jump",root:t,grooveStyle:"soft",desc:"Связка регистров на октаве — без резкого «переключения» голоса.",how:"Спокойно прыгай на октаву вверх и обратно, целься в центр ноты. Верх не криком, а на опоре и резонансе.",notes:[0,12,0,12].map(n=>z(t+n,1.5))}}function vs(t){return{id:"belt",name:"Белтинг — гамма",syllable:"Эй",tempo:112,kind:"scale",root:t,grooveStyle:"drive",desc:"Яркая опёртая подача (белтинг) на пятинотной гамме — мощно, но без зажима.",how:"Пой «Эй» ярко и звонко, опираясь дыханием. Звук вперёд (в маску), горло свободно. Не дави на верхних нотах.",notes:[0,1,3,5,7,5,3,1,0].map(n=>z(t+n,.6))}}function fs(t){return{id:"beltoct",name:"Белт — октава",syllable:"Эй",tempo:100,kind:"jump",root:t,grooveStyle:"drive",desc:"Опёртая атака верхней ноты через октаву — энергично и безопасно.",how:"Бери октаву вверх ярко и точно, на опоре. Не тянись горлом — звук на дыхании и в резонаторах.",notes:[0,12,0,12,0,12,0].map(n=>z(t+n,.8))}}function bs(t){return{id:"artic",name:"Чёткое стаккато",syllable:"Та",tempo:132,kind:"agility",root:t,grooveStyle:"funk",desc:"Чёткая артикуляция и точная атака: одна нота, быстрые ясные слоги.",how:"Пой «Та-Та-Та» коротко и чётко на одной высоте, с паузой после каждого слога. Согласная ясная, звук не «расползается».",notes:[0,0,0,0,0,0,0,0].map(n=>z(t+n,.5,.5))}}function ps(t){return{id:"artic2",name:"Слоги по группам",syllable:"Та-Ка",tempo:120,kind:"agility",root:t,grooveStyle:"funk",desc:"Дикция при смене высоты: чёткие слоги группами на двух нотах.",how:"Пой «Та-Ка-Та» группами, чисто меняя высоту вниз и обратно. Каждый слог ясный, ритм ровный.",notes:[0,0,0,-5,-5,-5,0,0,0,-5,-5,-5].map((n,a)=>z(t+n,.5,a%3===2?.5:0))}}function gs(t){return{id:"resist",name:"Стамина-фигура",syllable:"Ма",tempo:116,kind:"agility",root:t,grooveStyle:"march",desc:"Выносливость и ровность: устойчивый мотив-«волчок» много раз без потери опоры.",how:"Пой «Ма» по фигуре вверх-вниз ровно и не уставая. Дыхание ровное, опора держится до конца.",notes:[0,1,3,1,0,1,3,1,0,1,3,1,0].map(n=>z(t+n,.5))}}function ys(t){return{id:"resist2",name:"Выносливая гамма",syllable:"Ма",tempo:126,kind:"agility",root:t,grooveStyle:"march",desc:"Дыхательная выносливость: длинный ровный пробег по гамме без добора воздуха.",how:"Пой «Ма» по гамме вверх-вниз дважды на одном дыхании, ровно и точно. Распредели воздух до конца.",notes:[0,1,3,5,7,5,3,1,0,1,3,5,7,5,3,1,0].map(n=>z(t+n,.5))}}function ws(t,e="ionian"){const n=yt([1,2,3,4,5,4,3,2,1],e);return{id:"scale5",name:"Гамма «Ма-Мэ»",syllable:"Ма",tempo:104,kind:"scale",root:t,modeKey:e,grooveStyle:"pop",desc:"Тренирует точность интонации — чистое попадание в каждую ступень гаммы.",how:"Пой «Ма» и попадай в каждую ноту, которая подъезжает к линии. Старайся держать зелёный.",notes:n.map(a=>z(t+a,1))}}function Es(t,e="ionian"){const n=yt([1,2,3,4,5,6,5,4,3,2,1],e);return{id:"agility",name:"Беглость «Ма»",syllable:"Ма",tempo:138,kind:"agility",root:t,modeKey:e,grooveStyle:"funk",desc:"Развивает беглость: быстрые и точные переходы между нотами (как в Vocalista).",how:"Пой «Ма» легко и быстро, попадая в каждую ноту пробегающего пассажа. Не зажимайся.",notes:n.map(a=>z(t+a,.5))}}function $s(t){return{id:"jump",name:"Октавный скачок",syllable:"А",tempo:84,kind:"jump",root:t,grooveStyle:"drive",desc:"Учит координации между нижним и верхним регистром голоса.",how:"Пой «А», точно прыгая на октаву вверх и обратно вниз. Целься в центр ноты.",notes:[z(t+12,2),z(t,2),z(t+12,2),z(t,2)]}}function ze(t,e="ionian"){const n=yt([1,2,3,2,1],e);return{id:"hum3",name:"Мычание по гамме",syllable:"М",tempo:92,kind:"hum",root:t,modeKey:e,grooveStyle:"soft",desc:"Мягкая активация голоса и резонаторов на «м-м-м» — три ступеньки вверх и обратно.",how:"Сомкни губы и мычи «м», идя по нотам: вверх три ступени и вниз. Звук в маску/нос.",notes:n.map(a=>z(t+a,1))}}function Ve(t,e="ionian"){const n=yt([1,2,3,4,5,4,3,2,1,5,1],e);return{id:"trill",name:"Губной тренаж «brrr»",syllable:"brrr",tempo:120,kind:"trill",root:t,modeKey:e,grooveStyle:"drive",desc:"Ровный воздушный поток и гибкость: пять ступеней вверх-вниз и скачок на квинту.",how:"Губами «brrr» (если не выходит — на «Р»). Веди по нотам ровно, в конце — скачок на квинту и тонику.",notes:n.map(a=>z(t+a,.75))}}function Ne(t,e,n,a=4){const s=t.notes.map(u=>u.midi),o=Math.min(...s),i=Math.max(...s);if(!Number.isFinite(e)||!Number.isFinite(n))return[0];const c=Math.max(0,Math.min(a,n-i)),l=Math.max(0,Math.min(a,o-e)),r=[];for(let u=0;u<=c;u++)r.push(u);for(let u=c-1;u>=-l;u--)r.push(u);return r.length?r:[0]}const J=(t,e)=>({s:t,b:e});function jt(t,e){const n=[];for(let a=0;a<e;a++)n.push(...t.map(s=>({...s})));return n}const Ht={air1:{id:"air1",name:"Дыхание: длинные с / ш",kind:"rhythm",tempo:70,desc:"Ровный длинный выдох на «с» и «ш» под метроном — опора и расход воздуха.",how:"«с-с-с» тянем на 4 клика → вдох носом → «ш-ш-ш» на 4 клика → вдох носом. Выдох ровный, без толчков.",steps:jt([J("с",4),J("вдох",2),J("ш",4),J("вдох",2)],4)},air2:{id:"air2",name:"Дыхание: короткий с + 5 ш",kind:"rhythm",tempo:80,desc:"Короткий толчок «с» и серия «ш» — активный выдох и чувство ритма.",how:"Короткий «с», пауза, затем 5 коротких «ш». Между «с» и «ш» НЕ дышим; вдох носом — после серии.",steps:jt([J("с",.5),J("rest",.5),J("ш",.5),J("ш",.5),J("ш",.5),J("ш",.5),J("ш",.5),J("вдох",2)],6)},air3:{id:"air3",name:"Артикуляция: 15 с + 15 ш",kind:"rhythm",tempo:80,desc:"Чёткие короткие «с» и «ш» в ровном пульсе — артикуляция и дыхание.",how:"15 коротких «с» → вдох носом → 15 коротких «ш». Держи ровный пульс с метрономом.",steps:[...jt([J("с",.5)],15),J("вдох",2),...jt([J("ш",.5)],15)]}},Fa={с:"С-с-с",ш:"Ш-ш-ш",вдох:"Вдох носом",rest:"·"};function ks(t,e,n,a,{onExit:s,onComplete:o}={}){let i=null,c=null,l=!1;const r=[];function u(){i&&(cancelAnimationFrame(i),i=null),r.forEach(clearTimeout),r.length=0,c&&(c.stop(),c=null),document.removeEventListener("visibilitychange",f)}function f(){document.hidden?(i&&(cancelAnimationFrame(i),i=null),c&&(c.stop(),c=null),l=!0):l&&(l=!1,h())}function h(){u(),t.innerHTML=`
      <div class="screen breathe-intro">
        <div class="game-top"><button class="icon-btn" id="back">‹ Меню</button></div>
        <div class="brand"><h1>${a.name}</h1></div>
        <div class="card">
          <p class="blurb">${a.desc}</p>
          <p class="how"><b>Как.</b> ${a.how}</p>
          <p class="how mech">Идёт метроном и тихая подложка. Делай звук в такт щелчкам, между подходами — спокойный вдох носом.</p>
        </div>
        <button class="btn btn-primary" id="go" style="width:100%">Начать</button>
      </div>
    `,document.getElementById("back").addEventListener("click",()=>{u(),s()}),document.getElementById("go").addEventListener("click",d)}function d(){document.addEventListener("visibilitychange",f);const m=60/a.tempo;let b=0;const p=a.steps.map(L=>{const T={...L,start:b,end:b+L.b};return b+=L.b,T}),$=b,y=$*m;t.innerHTML=`
      <div class="screen breathe">
        <div class="game-top"><button class="icon-btn" id="quit">‹ Прервать</button></div>
        <div class="rhythm-stage">
          <div class="rhythm-beat" id="beat"></div>
          <div class="rhythm-label" id="lbl">Приготовься…</div>
        </div>
        <div class="bar"><i id="prog"></i></div>
      </div>
    `,document.getElementById("quit").addEventListener("click",()=>{u(),s()});const C=document.getElementById("lbl"),H=document.getElementById("beat"),g=document.getElementById("prog");c=In(e.ctx,n,y+.4);const B=performance.now();let k=-1,w=!1;function M(){const L=(performance.now()-B)/1e3,T=L/m,R=Math.floor(T);R>k&&R<Math.ceil($)&&(k=R,Kt(e.ctx,0,R%4===0),H.classList.remove("pulse"),H.offsetWidth,H.classList.add("pulse"));const E=p.find(A=>T>=A.start&&T<A.end);E&&(C.textContent=Fa[E.s]||"",C.style.color=E.s==="вдох"?"var(--gold)":E.s==="rest"?"var(--text-dim)":"var(--accent-2)"),g.style.width=Math.min(100,L/y*100)+"%",L<y?i=requestAnimationFrame(M):w||(w=!0,v())}i=requestAnimationFrame(M)}function v(){if(u(),o){o({pct:null,rhythm:!0});return}t.innerHTML=`
      <div class="screen summary">
        <div class="stars">🫁</div>
        <div class="verdict">Готово!</div>
        <p class="hint">Дыхание и артикуляция размяты. Голос готов к распевке.</p>
        <div class="row">
          <button class="btn btn-ghost" id="menu">Меню</button>
          <button class="btn btn-primary" id="again">Ещё раз</button>
        </div>
      </div>
    `,document.getElementById("menu").addEventListener("click",s),document.getElementById("again").addEventListener("click",h)}h()}const ne=[{key:"bass",name:"Бас",group:"муж",low:40,high:64,center:48,blurb:"Самый низкий мужской голос, глубокий и плотный."},{key:"baritone",name:"Баритон",group:"муж",low:43,high:67,center:52,blurb:"Средний мужской голос — самый распространённый."},{key:"tenor",name:"Тенор",group:"муж",low:48,high:72,center:57,blurb:"Высокий мужской голос, яркий и звонкий."},{key:"contralto",name:"Контральто",group:"жен",low:53,high:77,center:60,blurb:"Низкий женский голос, тёплый и насыщенный."},{key:"mezzo",name:"Меццо-сопрано",group:"жен",low:57,high:81,center:64,blurb:"Средний женский голос — самый частый у женщин."},{key:"soprano",name:"Сопрано",group:"жен",low:60,high:84,center:67,blurb:"Высокий женский голос, светлый и парящий."}];function dt(t){return ne.find(e=>e.key===t)||null}function ot(t){return Tn(Math.round(t))||""}function fn(t){return`${ot(t.low)}–${ot(t.high)}`}function za(t,e){const n=(t+e)/2;let a=ne[0],s=1/0;for(const o of ne){const i=(o.low+o.high)/2,c=.6*Math.abs(t-o.low)+.4*Math.abs(n-i);c<s&&(s=c,a=o)}return a}function Va(t,e,n,{onExit:a}){const s=st(),o=s&&dt(s.key),i=o?o.center:60,c=s&&s.low!=null&&s.high!=null?{low:s.low,high:s.high}:o?{low:o.low,high:o.high}:{low:48,high:72},l=[{title:"Дыхание: длинные с / ш",tip:"Ровный длинный выдох в такт.",rhythm:Ht.air1},{title:"Дыхание: короткий с + 5 ш",tip:"Активный выдох, вдох носом после серии.",rhythm:Ht.air2},{title:"Артикуляция: 15 с + 15 ш",tip:"Чётко и ровно с метрономом.",rhythm:Ht.air3},{title:"Мычание по гамме «М»",tip:"Мягко, в маску. Сначала прозвучит тоника.",ex:ze(i)},{title:"Губной тренаж «brrr»",tip:"Губами «brrr» или на «Р», ровно.",ex:Ve(i)}];let r=0;const u=[];function f(){if(r>=l.length)return d();const v=l[r];h(v,r,()=>{const m=b=>{u.push(b),r+=1,f()};if(v.rhythm)ks(t,e,i,v.rhythm,{onExit:a,onComplete:m});else{const b=Ne(v.ex,c.low,c.high,2);ct(t,e,n,v.ex,{onExit:a,onComplete:m,reps:b})}})}function h(v,m,b){t.innerHTML=`
      <div class="screen interstitial">
        <div class="game-top"><button class="icon-btn" id="quit">‹ Прервать</button></div>
        <div class="step-count">Упражнение ${m+1} из ${l.length}</div>
        <div class="brand"><h1>${v.title}</h1><p>${v.tip}</p></div>
        <div class="progress-dots">
          ${l.map((p,$)=>`<span class="dot ${$<m?"done":$===m?"now":""}"></span>`).join("")}
        </div>
        <button class="btn btn-primary" id="go" style="width:100%">Начать</button>
      </div>
    `,document.getElementById("go").addEventListener("click",b),document.getElementById("quit").addEventListener("click",a)}function d(){const v=u.filter(H=>H&&typeof H.pct=="number"),m=v.length?v.reduce((H,g)=>H+g.pct,0)/v.length:1,b=m>=.85?3:m>=.6?2:m>=.35?1:0,{streak:p,freezeSpent:$}=qn({pct:m,stars:b});zt(2),ee(30);const y="★".repeat(b)+"☆".repeat(3-b),C=Math.round(m*100);t.innerHTML=`
      <div class="screen summary">
        <div class="stars">${y}</div>
        <div class="verdict">Распевка завершена!</div>
        <div class="big-pct">${C}<span>%</span></div>
        <p class="hint">средняя точность по ${v.length} ${v.length===1?"распевке":"распевкам"} с нотами</p>
        <div class="streak-badge">🔥 Стрик: ${p} ${p===1?"день":"дн."}${$?" · ❄ заморозка спасла стрик":""}</div>
        <button class="btn btn-primary" id="menu" style="width:100%">В меню</button>
      </div>
    `,document.getElementById("menu").addEventListener("click",a)}f()}function Oe(t,e,n,{onDone:a,onExit:s,canSkip:o=!1}){let i=null;const c=()=>{i&&cancelAnimationFrame(i),i=null};function l(){c(),n.reset();const h=st(),d=h&&dt(h.key);let v=d?d.group:"муж";t.innerHTML=`
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
            <button data-gender="муж" class="${v==="муж"?"on":""}">Мужские</button>
            <button data-gender="жен" class="${v==="жен"?"on":""}">Женские</button>
          </div>
        </div>
        <div class="card list">
          <div class="list-sep">Или выбери сам</div>
          <div id="voiceCards"></div>
        </div>
      </div>
    `,document.getElementById("back").addEventListener("click",s),document.getElementById("detect").addEventListener("click",r);function m(){const b=st();document.getElementById("voiceCards").innerHTML=ne.filter(p=>p.group===v).map(p=>`
          <button class="list-item voice-card" data-pick="${p.key}">
            <span class="li-main">${p.name}${b&&b.key===p.key?" ·  выбран":""}</span>
            <span class="li-sub">${p.group==="муж"?"мужской":"женский"} · ${fn(p)}</span>
          </button>`).join(""),document.querySelectorAll("[data-pick]").forEach(p=>p.addEventListener("click",()=>{on(p.dataset.pick),a(st())}))}document.querySelectorAll("[data-gender]").forEach(b=>b.addEventListener("click",()=>{v=b.dataset.gender,document.querySelectorAll("[data-gender]").forEach(p=>p.classList.toggle("on",p.dataset.gender===v)),m()})),m()}function r(){c(),t.innerHTML=`
      <div class="screen breathe-intro">
        <div class="game-top"><button class="icon-btn" id="back">‹ Назад</button></div>
        <div class="brand"><h1>Определим голос</h1></div>
        <div class="card">
          <p class="blurb">Сначала споёшь свою самую низкую удобную ноту, потом — самую высокую (без напряжения!). По диапазону подскажу твой тембр.</p>
          <p class="how mech"><b>Как.</b> Пой ровно и держи ноту — когда звук станет стабильным, пойдёт отсчёт и я её запишу. Верх <b>не форсируй</b>: бери только то, что берётся легко.</p>
        </div>
        <button class="btn btn-primary" id="go" style="width:100%">Поехали</button>
      </div>
    `,document.getElementById("back").addEventListener("click",l),document.getElementById("go").addEventListener("click",()=>u("low"))}function u(h,d=null){c();const v=h==="low";t.innerHTML=`
      <div class="screen onboard">
        <div class="game-top"><button class="icon-btn" id="back">‹ Назад</button></div>
        <div class="brand"><h1>${v?"Нижняя нота":"Верхняя нота"}</h1>
          <p>${v?"Спой свою <b>самую низкую удобную</b> ноту и тяни ровно.":"Теперь <b>самую высокую</b> — мягко, <b>без напряжения</b>."}</p></div>
        <div class="note-display silent" id="note">—</div>
        <div class="stability"><div class="stability-fill" id="stab"></div></div>
        <p class="hint" id="status">Пой и держи ровно…</p>
        ${d!=null?`<p class="hint">Низ записан: <b>${ot(d)}</b></p>`:""}
      </div>
    `,document.getElementById("back").addEventListener("click",()=>v?r():u("low"));const m=document.getElementById("note"),b=document.getElementById("status"),p=document.getElementById("stab"),$=[],y=24,C=1200;let H=0;function g(M){const L=Math.min(...M),T=Math.max(...M);return 1200*Math.log2(T/L)}function B(M){const L=[...M].sort((T,R)=>T-R);return L[Math.floor(L.length/2)]}n.reset(),n.setRange&&n.setRange(55,1300);function k(){const M=e.read();if(M){const{smoothedHz:L,voiced:T}=n.process(M);if(T&&L){const R=rt(L),E=R.name.match(/^([A-G]#?)(-?\d+)$/);if(m.className="note-display green",m.innerHTML=E?`${E[1]}<span class="oct">${E[2]}</span>`:R.name,$.push(L),$.length>y&&$.shift(),$.length>=y&&g($)<110){H||(H=performance.now());const q=performance.now()-H;p.style.width=Math.min(100,q/C*100)+"%";const _=Math.ceil((C-q)/1e3);if(b.textContent=q<C?`Держи… ${Math.max(1,_)}`:"Готово!",q>=C)return w(Math.round(rt(B($)).midi))}else H=0,p.style.width="0%",b.textContent="Держи ровнее…"}else m.className="note-display silent",m.textContent="—",H=0,p.style.width="0%",$.length&&($.length=0),b.textContent="Пой и держи ровно…"}i=requestAnimationFrame(k)}k();function w(M){if(c(),v)u("high",M);else{let L=d,T=M;T<=L&&(T=L+7),f(L,T)}}}function f(h,d){c();const v=za(h,d);on(v.key,h,d),zt(2),ee(25),t.innerHTML=`
      <div class="screen summary">
        <div class="verdict" style="font-size:18px;color:var(--text-dim)">Похоже, твой голос —</div>
        <div class="voice-result">${v.name}</div>
        <p class="hint">${v.blurb}</p>
        <div class="card" style="text-align:left;width:100%">
          <p class="how"><b>Твой диапазон:</b> ${ot(h)} – ${ot(d)}</p>
          ${Xn(h,d)}
          <p class="how"><b>Обычный диапазон для ${v.name.toLowerCase()}:</b> ${fn(v)}</p>
          <p class="how mech">Это ориентир по диапазону, а не окончательный вердикт — точный тембр определит педагог. Упражнения подстроятся под тебя.</p>
        </div>
        <div class="row">
          <button class="btn btn-ghost" id="redo">Переопределить</button>
          <button class="btn btn-primary" id="ok">Готово</button>
        </div>
      </div>
    `,document.getElementById("redo").addEventListener("click",r),document.getElementById("ok").addEventListener("click",()=>a(st()))}l()}function bn(t,e,n,a,s,o){t.beginPath(),t.moveTo(e+o,n),t.arcTo(e+a,n,e+a,n+s,o),t.arcTo(e+a,n+s,e,n+s,o),t.arcTo(e,n+s,e,n,o),t.arcTo(e,n,e+a,n,o),t.closePath()}function Na({headline:t="Мой прогресс",big:e="",sub:n=""}){const o=document.createElement("canvas");o.width=1080,o.height=1080;const i=o.getContext("2d");return i.fillStyle="#eef2f4",i.fillRect(0,0,1080,1080),i.fillStyle="#ffffff",i.shadowColor="rgba(20,33,55,.18)",i.shadowBlur=60,i.shadowOffsetY=24,bn(i,90,120,900,780,48),i.fill(),i.shadowColor="transparent",i.shadowBlur=0,i.shadowOffsetY=0,i.fillStyle="#0e8d7f",bn(i,90,120,900,150,48),i.fill(),i.fillStyle="#0e8d7f",i.fillRect(90,230,900,40),i.fillStyle="#ffffff",i.font="700 46px system-ui, sans-serif",i.textBaseline="middle",i.fillText("Распевка",130,195),i.font="500 30px system-ui, sans-serif",i.fillStyle="rgba(255,255,255,.9)",i.textAlign="right",i.fillText("вокальный тренажёр",950,195),i.textAlign="left",i.fillStyle="#5c6775",i.font="600 40px system-ui, sans-serif",i.fillText(t,150,380),i.fillStyle="#1b2430",i.font="800 150px system-ui, sans-serif",i.fillText(e,146,520),i.fillStyle="#0a766a",i.font="600 44px system-ui, sans-serif",i.fillText(n,150,660),i.fillStyle="#9aa6b2",i.font="500 32px system-ui, sans-serif",i.fillText("a1exxx.github.io/raspevka",150,840),o}async function pn(t){const e=Na(t),n=await new Promise(i=>e.toBlob(i,"image/png"));if(!n)return;const a=new File([n],"raspevka.png",{type:"image/png"});try{if(navigator.canShare&&navigator.canShare({files:[a]})){await navigator.share({files:[a],title:"Распевка",text:t.sub||"Мой прогресс в Распевке"});return}}catch{}const s=URL.createObjectURL(n),o=document.createElement("a");o.href=s,o.download="raspevka.png",document.body.appendChild(o),o.click(),o.remove(),setTimeout(()=>URL.revokeObjectURL(s),4e3)}function Oa(t){return t.toISOString().slice(0,10)}function ja(t){if(!t||t.length<2)return"";const e=t.length,n=t.map(d=>d.low),a=t.map(d=>d.high),s=Math.min(...n)-1,o=Math.max(...a)+1,i=Math.max(1,o-s),c=300,l=70,r=5,u=d=>(r+d*(c-2*r)/(e-1)).toFixed(1),f=d=>(r+(1-(d-s)/i)*(l-2*r)).toFixed(1),h=d=>d.map((v,m)=>`${m?"L":"M"}${u(m)} ${f(v)}`).join(" ");return`
    <div class="seg-label" style="margin-top:14px">Рост диапазона</div>
    <svg class="range-tl" viewBox="0 0 ${c} ${l}" preserveAspectRatio="none" role="img" aria-label="График роста диапазона">
      <path d="${h(a)}" class="tl-high"/>
      <path d="${h(n)}" class="tl-low"/>
      <circle cx="${u(e-1)}" cy="${f(a[e-1])}" r="3.5" class="tl-dot-h"/>
      <circle cx="${u(e-1)}" cy="${f(n[e-1])}" r="3.5" class="tl-dot-l"/>
    </svg>`}function _a(t,{onExit:e}){const n=Js(),a=Xs(),s=le(),o=Qs(),i=Wn(),c=st(),l=c&&dt(c.key),r=new Set(n.map(b=>b.date)),u=[];for(let b=13;b>=0;b--){const p=new Date(Date.now()-b*864e5);u.push(`<span class="cal-dot ${r.has(Oa(p))?"done":""}"></span>`)}const f=n.slice(-12),h=f.length?f.map(b=>{const p=Math.round((b.pct||0)*100);return`<div class="acc-bar ${b.stars>=3?"g":b.stars===2?"a":"c"}" style="height:${Math.max(6,p)}%" title="${p}%"></div>`}).join(""):'<p class="hint">Пройди распевку — здесь появится история точности.</p>';let d="";const v=a.length?a[a.length-1]:c&&c.low!=null?c:null;if(v&&v.low!=null){const b=v.high-v.low;let p="";if(a.length>=2){const $=a[0],y=v.high-v.low-($.high-$.low);y>0&&(p=` · <span style="color:var(--green)">+${y} пт с начала</span>`)}d=`
      <div class="card" style="text-align:left;width:100%">
        <div class="seg-label">Диапазон голоса</div>
        <p class="how" style="margin-top:6px"><b>${ot(v.low)} – ${ot(v.high)}</b> · ${b} полутонов${p}</p>
        ${Xn(v.low,v.high)}
        ${ja(a)}
        ${l?`<p class="how">Тембр: ${l.name}</p>`:""}
      </div>`}t.innerHTML=`
    <div class="screen">
      <div class="game-top"><button class="icon-btn" id="back">‹ Меню</button></div>
      <div class="brand"><h1>Прогресс</h1></div>

      <div class="stat-row">
        <div class="stat-tile"><div class="stat-num">${s}</div><div class="stat-lbl">стрик, дн.</div></div>
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
  `,document.getElementById("back").addEventListener("click",e),document.getElementById("back2").addEventListener("click",e);const m=document.getElementById("share");m&&m.addEventListener("click",()=>{if(v&&v.low!=null){const b=v.high-v.low;pn({headline:"Мой диапазон",big:`${ot(v.low)}–${ot(v.high)}`,sub:`${b} полутонов${s>0?` · стрик ${s}`:""}`})}else pn({headline:"Мой прогресс",big:`${s}`,sub:"дней подряд в Распевке"})})}const Ga=[0,2,4,5,7,9,11],gn=t=>Ga.includes((t%12+12)%12);function yn(t){const e=rt(W(t));return e?e.name:""}function Wa(t,e,n,{onExit:a,lowMidi:s=41,highMidi:o=81}){let i=null;const c=s-2,l=o+2,r=W(c),u=W(l);t.innerHTML=`
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
  `,document.getElementById("back").addEventListener("click",()=>{L(),a()});function f(){const T=Re();document.getElementById("sens").innerHTML=[["low","Низкая"],["med","Средняя"],["high","Высокая"]].map(([R,E])=>`<button data-sens="${R}" class="${T===R?"on":""}">${E}</button>`).join(""),document.querySelectorAll("[data-sens]").forEach(R=>R.addEventListener("click",()=>{Gn(R.dataset.sens),e.setSensitivity&&e.setSensitivity(qe()),f()}))}f();const h=document.getElementById("note"),d=document.getElementById("cents"),v=document.getElementById("lvl"),m=document.getElementById("fs"),b=m.getContext("2d");function p(){const T=Math.min(window.devicePixelRatio||1,2);m.width=m.clientWidth*T,m.height=m.clientHeight*T,b.setTransform(T,0,0,T,0,0)}p(),window.addEventListener("resize",p);function $(T,R){const E=Math.max(r,Math.min(u,T)),A=Math.log2(E/r)/Math.log2(u/r);return R-A*R}const y=[];n.setRange&&n.setRange(55,1300),n.reset();const C=document.getElementById("cele");let H=null,g=0,B=0,k=null;function w(T){C&&(C.innerHTML=`<svg viewBox="0 0 24 24" fill="currentColor" width="18" height="18"><path d="M12 2l2.4 6.3L21 9l-5 4.1L17.8 20 12 16.3 6.2 20 8 13.1 3 9l6.6-.7z"/></svg> ${T}`,C.hidden=!1,clearTimeout(k),k=setTimeout(()=>{C&&(C.hidden=!0)},3400))}function M(){const T=m.clientWidth,R=m.clientHeight;b.clearRect(0,0,T,R),b.font="10px Inter, sans-serif";for(let D=Math.ceil(c);D<=l;D++){const Z=$(W(D),R),tt=(D%12+12)%12===0;b.strokeStyle=tt?"rgba(27,36,48,.20)":gn(D)?"rgba(27,36,48,.08)":"rgba(27,36,48,.03)",b.lineWidth=1,b.beginPath(),b.moveTo(34,Z),b.lineTo(T,Z),b.stroke(),gn(D)&&(b.fillStyle=tt?"rgba(27,36,48,.55)":"rgba(27,36,48,.32)",b.fillText(yn(D),4,Z+3))}const E=e.read();let A=!1,q=null;if(E){const D=n.process(E);A=D.voiced&&e.rms()>.0025,q=D.smoothedHz}if(A&&q){const D=rt(q),Z=(D.name||"").match(/^([A-G]#?)(-?\d+)$/);h.innerHTML=Z?`${Z[1]}<span class="oct">${Z[2]}</span>`:D.name,h.classList.remove("silent"),d.textContent=`центы: ${D.cents>0?"+":""}${D.cents}`,v.style.width=Math.min(100,e.rms()*350)+"%";const tt=$(q,R);y.push(tt);const ut=Math.round(69+12*Math.log2(q/440));Math.abs(D.cents)<42?(ut===H?g++:(H=ut,g=1),g===26&&Date.now()-B>4e3&&sa(ut).extended&&(B=Date.now(),w(`Новая нота — ${yn(ut)}! Диапазон растёт.`))):(H=null,g=0)}else h.textContent="—",h.classList.add("silent"),d.textContent="центы: —",v.style.width="0%",y.push(null),H=null,g=0;for(;y.length>90;)y.shift();const _=T-28;for(let D=0;D<y.length;D++){if(y[D]==null)continue;const Z=_-(y.length-1-D)*2.4,tt=D===y.length-1;b.fillStyle=tt?"#2fab84":"rgba(47,171,132,.35)",tt&&(b.shadowColor="#2fab84",b.shadowBlur=16),b.beginPath(),b.arc(Z,y[D],tt?8:2.5,0,Math.PI*2),b.fill(),b.shadowBlur=0}i=requestAnimationFrame(M)}M();function L(){i&&cancelAnimationFrame(i),i=null,window.removeEventListener("resize",p),clearTimeout(k)}}const Ua=""+new URL("belly-breathing-B0wu-xNS.webp",import.meta.url).href;function Ya(){return`
    <div class="breathe-diagram">
      <img class="belly-img" src="${Ua}" alt="Дыхание животом: слева спокойный живот (выдох), справа надутый живот (вдох)" />
      <div class="belly-caps"><span>Выдох · живот мягкий</span><span>Вдох · живот надут</span></div>
      <p class="diagram-note">Не стесняйся: на вдохе <b>живот округляется вперёд</b> (как справа на картинке), воздух идёт вниз. Плечи и грудь почти неподвижны — не тянись вверх.</p>
    </div>`}const xs={box:{title:"Дыхание по квадрату",kind:"paced",belly:!0,blurb:"Успокаивает и выравнивает дыхание перед пением. Вдох, задержка, выдох и пауза — все по 4 секунды. Дыши животом, плечи расслаблены.",cycles:4,phases:[{label:"Вдох",sec:4,from:.5,to:1},{label:"Задержка",sec:4,from:1,to:1},{label:"Выдох",sec:4,from:1,to:.5},{label:"Пауза",sec:4,from:.5,to:.5}]},belly:{title:"Дыхание животом",kind:"paced",belly:!0,blurb:"База певческого дыхания: вдох на 4 счёта — живот расширяется, выдох длиннее, на 6 счётов — ровно и плавно. Грудь и плечи неподвижны.",cycles:5,phases:[{label:"Вдох (живот)",sec:4,from:.5,to:1},{label:"Выдох ровно",sec:6,from:1,to:.5}]},hiss:{title:"Долгий выдох «с-с-с»",kind:"exhale",blurb:"Тренирует опору и ровный воздушный поток. Глубоко вдохни животом, затем выдыхай на звук «с-с-с» как можно дольше и РОВНО — без толчков. Я замерю время.",goals:[{sec:8,label:"хорошо"},{sec:15,label:"отлично"},{sec:20,label:"превосходно"}]}};function Ms(t,e,n,{onExit:a,onNext:s,nextLabel:o,onDone:i}){const c=xs[n];let l=null;function r(){return`
      ${s?`<button class="btn btn-primary" id="next" style="width:100%">${o||"Дальше"} →</button>`:""}
      <div class="row"><button class="btn btn-ghost" id="menu">Меню</button>
      <button class="btn ${s?"btn-ghost":"btn-primary"}" id="again">Ещё раз</button></div>`}function u(b){document.getElementById("menu").addEventListener("click",a),document.getElementById("again").addEventListener("click",b);const p=document.getElementById("next");p&&p.addEventListener("click",s)}function f(){t.innerHTML=`
      <div class="screen breathe-intro">
        <div class="game-top"><button class="icon-btn" id="back">‹ ${s?"Назад":"Меню"}</button></div>
        <div class="brand"><h1>${c.title}</h1></div>
        <div class="card"><p class="blurb">${c.blurb}</p>${c.belly?Ya():""}</div>
        <button class="btn btn-primary" id="go" style="width:100%">Начать упражнение</button>
      </div>
    `,document.getElementById("back").addEventListener("click",a),document.getElementById("go").addEventListener("click",c.kind==="paced"?h:d)}function h(){t.innerHTML=`
      <div class="screen breathe">
        <div class="game-top"><button class="icon-btn" id="quit">‹ Прервать</button></div>
        <div class="breathe-stage">
          <div class="breathe-ring"><div class="breathe-core" id="core"></div></div>
          <div class="breathe-phase" id="phase">Приготовься…</div>
          <div class="breathe-count" id="count"></div>
        </div>
        <div class="breathe-cycles" id="cycles"></div>
      </div>
    `,document.getElementById("quit").addEventListener("click",()=>{m(),a()});const b=document.getElementById("core"),p=document.getElementById("phase"),$=document.getElementById("count"),y=document.getElementById("cycles");c.cycles*c.phases.length;let C=0,H=0,g=performance.now();B();function B(){y.innerHTML=Array.from({length:c.cycles},(M,L)=>`<span class="dot ${L<C?"done":L===C?"now":""}"></span>`).join("")}function k(){const M=c.phases[H],L=(performance.now()-g)/1e3,T=Math.min(1,L/M.sec),R=M.from+(M.to-M.from)*Ka(T);if(b.style.transform=`scale(${R})`,p.textContent=M.label,$.textContent=Math.ceil(M.sec-L),L>=M.sec){if(H+=1,H>=c.phases.length&&(H=0,C+=1,B()),C>=c.cycles)return w();g=performance.now()}l=requestAnimationFrame(k)}l=requestAnimationFrame(k);function w(){m(),i&&i(),t.innerHTML=`
        <div class="screen summary">
          <div class="stars">🫁</div>
          <div class="verdict">Готово!</div>
          <p class="hint">${c.cycles} циклов дыхания пройдено. Голос готов к распевке.</p>
          ${r()}
        </div>`,u(h)}}function d(){t.innerHTML=`
      <div class="screen breathe">
        <div class="game-top"><button class="icon-btn" id="quit">‹ Прервать</button></div>
        <div class="breathe-stage">
          <div class="big-timer" id="timer">0.0</div>
          <div class="breathe-phase" id="phase">Вдохни глубоко и тяни «с-с-с»…</div>
        </div>
        <div class="bar"><i id="vol"></i></div>
        ${v()}
      </div>
    `,document.getElementById("quit").addEventListener("click",()=>{m(),a()});const b=document.getElementById("timer"),p=document.getElementById("phase"),$=document.getElementById("vol"),y=.012,C=.6;let H="ready",g=0,B=0;function k(){e.read();const M=e.rms();$.style.width=Math.min(100,M*400)+"%";const L=performance.now();if(H==="ready")M>y&&(H="running",g=L,B=L,p.textContent="Тяни ровно!");else if(H==="running"&&(M>y&&(B=L),b.textContent=((L-g)/1e3).toFixed(1),L-B>C*1e3))return w((B-g)/1e3);l=requestAnimationFrame(k)}l=requestAnimationFrame(k);function w(M){m(),i&&i(),M=Math.max(0,Math.round(M*10)/10);const L=ha(M),T=[...c.goals].reverse().find(E=>M>=E.sec),R=T?T.label[0].toUpperCase()+T.label.slice(1)+"!":"Попробуй ещё";t.innerHTML=`
        <div class="screen summary">
          <div class="big-pct">${M.toFixed(1)}<span>сек</span></div>
          <div class="verdict">${R}</div>
          <p class="hint">ровный выдох на «с-с-с» · твой рекорд: <b>${L.toFixed(1)} сек</b></p>
          ${r()}
        </div>`,u(d)}}function v(){const b=Wn();return b?`<p class="hint">Твой рекорд: <b>${b.toFixed(1)} сек</b></p>`:'<p class="hint">Замерим твой ровный выдох.</p>'}function m(){l&&cancelAnimationFrame(l),l=null}f()}function Ka(t){return t<.5?2*t*t:1-Math.pow(-2*t+2,2)/2}const It=[{t:"Опора дыхания",b:"Вдох — живот мягко наполняется (плечи не поднимаются). На выдохе живот плавно поджимается и «держит» звук ровным. Это фундамент: без опоры голос дрожит и быстро устаёт."},{t:"Звук «в маску»",b:"Направляй звук в область носа и скул — голос начинает звенеть, а не «застревать» в горле. Поймать ощущение помогает мычание «м-м-м»."},{t:"Зевок в горле",b:"Лёгкое ощущение начала зевка освобождает гортань и расширяет пространство во рту. Звук становится объёмнее и свободнее, уходит зажим."},{t:"Не дави на верх",b:"Высокие ноты берутся не силой, а лёгкостью и опорой. Давишь — связки зажимаются и можно сорвать голос. Расширение диапазона — это недели, не один день."},{t:"Мягкая атака",b:"Начинай ноту мягко, без толчка горлом. Представь, что звук «вытекает», а не «выстреливает». Это бережёт связки и звучит красивее."},{t:"Округляй гласные",b:"Пой гласные округло, будто внутри звучит «о». Это выравнивает тембр по всему диапазону и убирает резкость и «плоскость»."},{t:"Губной тренаж «бррр»",b:"Вибрация губами снимает зажим и выравнивает поток воздуха. Лучшая разминка перед пением — и проверка, что дыхание ровное."},{t:"Береги голос",b:"Связки любят воду и отдых. Не пой на больном горле, делай паузы, не больше 20–30 минут подряд. Боль — всегда сигнал «стоп»."}];function Ja(t,{onExit:e}){let n=0;function a(){const s=It[n],o=It.map((i,c)=>`<span class="dot ${c===n?"now":c<n?"done":""}"></span>`).join("");t.innerHTML=`
      <div class="screen">
        <div class="game-top"><button class="icon-btn" id="back">‹ Меню</button></div>
        <div class="brand"><h1>Теория голоса</h1><p>Короткие уроки — по одному в день достаточно.</p></div>
        <div class="card theory-card">
          <div class="th-num">${n+1} / ${It.length}</div>
          <h3 class="th-title">${s.t}</h3>
          <p class="th-body">${s.b}</p>
        </div>
        <div class="progress-dots">${o}</div>
        <div class="row">
          <button class="btn btn-ghost" id="prev" ${n===0?"disabled":""}>Назад</button>
          <button class="btn btn-primary" id="next">${n===It.length-1?"Готово":"Далее"}</button>
        </div>
      </div>`,document.getElementById("back").addEventListener("click",e),document.getElementById("prev").addEventListener("click",()=>{n>0&&(n--,a())}),document.getElementById("next").addEventListener("click",()=>{n<It.length-1?(n++,a()):e()})}a()}const Xa=[0,2,4,5,7,9,12],Qa=t=>t[Math.floor(Math.random()*t.length)];function Za(t){const e=rt(W(t));return e?e.name:""}function Ls(t,e,n,{onExit:a,root:s=60}){let i=0,c=0,l=null,r="idle",u=s,f=0,h=null;const d=gt?gt():"piano";t.innerHTML=`
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
    </div>`;const v=document.getElementById("status"),m=document.getElementById("bigq"),b=document.getElementById("cue"),p=document.getElementById("lvl"),$=document.getElementById("score");document.getElementById("back").addEventListener("click",()=>{M(),a()}),document.getElementById("replay").addEventListener("click",y),document.getElementById("skip").addEventListener("click",()=>{H("Пропущено"),B(1300)}),n.setRange&&n.setRange(55,1300),n.reset();function y(){e.ctx&&vt(e.ctx,W(u),1.3,0,.3,d),b.textContent="Слушай…",r="wait",clearTimeout(h),h=setTimeout(()=>{r="sing",b.textContent="Теперь спой эту ноту"},1350)}function C(){i++,u=s+Qa(Xa),f=0,m.textContent="?",m.classList.add("silent"),v.textContent=`Раунд ${i} / 8`,y()}function H(L){m.textContent=Za(u),m.classList.remove("silent"),L&&(b.textContent=L),r="done"}function g(){c++,$.textContent=`Верно: ${c} / 8`,H("Верно! Бра-во."),m.classList.add("hit"),B(1300)}function B(L){clearTimeout(h),h=setTimeout(()=>{m.classList.remove("hit"),i>=8?k():C()},L)}function k(){M(),t.innerHTML=`
      <div class="screen summary">
        <div class="brand"><h1>Слух</h1></div>
        <div class="big-pct">${c}<span>/8</span></div>
        <p class="verdict">${c>=7?"Отличный слух!":c>=4?"Хорошо, продолжай!":"Слух тренируется — ещё раз!"}</p>
        <div class="row" style="max-width:360px">
          <button class="btn btn-ghost" id="again">Ещё раз</button>
          <button class="btn btn-primary" id="menu">В меню</button>
        </div>
      </div>`,document.getElementById("again").addEventListener("click",()=>Ls(t,e,n,{onExit:a,root:s})),document.getElementById("menu").addEventListener("click",a)}function w(){const L=e.read();let T=!1,R=null;if(L){const E=n.process(L);T=E.voiced&&e.rms()>.0025,R=E.smoothedHz}if(p.style.width=(T?Math.min(100,e.rms()*350):0)+"%",r==="sing"&&T&&R){const E=Math.abs(qt(R,W(u)));E<45?f++:f=Math.max(0,f-2),b.textContent=E<45?"Держи…":R<W(u)?"↑ выше":"↓ ниже",f>=22&&g()}l=requestAnimationFrame(w)}function M(){l&&cancelAnimationFrame(l),l=null,clearTimeout(h)}C(),w()}function $t(t,e,n,a){return{id:t,name:e,tempo:n,syllable:"Ля",make(s){return{id:t,name:e,syllable:"Ля",tempo:n,kind:"song",root:s,desc:"Простая мелодия — веди голос по нотам и попадай в каждую.",how:"Пой на «ля», спокойно следуя за нотами. Это не упражнение, а маленькая песня.",notes:a.map(([o,i])=>({midi:s+o,beats:i}))}}}}const Ts=[$t("s1","Лесенка",96,[[0,1],[2,1],[4,1],[5,1],[7,2],[5,1],[4,1],[2,1],[0,2]]),$t("s2","Колыбельная",76,[[7,1],[5,1],[4,2],[5,1],[4,1],[2,2],[0,1],[2,1],[4,1],[2,1],[0,3]]),$t("s3","Прогулка",104,[[0,1],[0,1],[4,1],[4,1],[7,1],[5,1],[4,2],[2,1],[2,1],[5,1],[4,1],[2,1],[0,2]]),$t("s4","Ручеёк",112,[[0,.5],[2,.5],[4,.5],[5,.5],[7,1],[9,1],[7,1],[5,1],[4,.5],[2,.5],[0,2]]),$t("s5","Колокол",88,[[4,1],[7,1],[9,2],[7,1],[4,1],[5,2],[2,1],[4,1],[0,3]]),$t("s6","Закат",80,[[12,2],[9,1],[7,1],[5,2],[4,1],[2,1],[0,3]])],ti=t=>t.make(60).notes.map(e=>e.midi);function ei(){return'<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2"><rect x="5" y="11" width="14" height="9" rx="2"/><path d="M8 11V8a4 4 0 0 1 8 0v3"/></svg>'}const wn={free:"Free",standard:"Standard",pro:"Pro"};function ni(t,{onExit:e}){function n(){const a=xt(),s=Y(),o=["free","standard","pro"].map(c=>`<button data-tier="${c}" class="${a===c?"on":""}">${wn[c]}</button>`).join(""),i=te.map(c=>{const l=Jn(c.key,a),r=c.key===s;return`
        <button class="mode-item ${l?"":"locked"} ${r?"sel":""}" data-mode="${c.key}" ${l?"":"disabled"}>
          <span class="mode-name">${c.name}${r?" · выбран":""}</span>
          ${l?"":`<span class="mode-lock">${ei()} ${wn[c.tier]}</span>`}
        </button>`}).join("");t.innerHTML=`
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
      </div>`,document.getElementById("back").addEventListener("click",e),document.querySelectorAll("[data-tier]").forEach(c=>c.addEventListener("click",()=>{_t(c.dataset.tier),n()})),document.querySelectorAll("[data-mode]:not([disabled])").forEach(c=>c.addEventListener("click",()=>{Pn(c.dataset.mode),n()}))}n()}const Me={hum3:ze,trill:Ve,sustain:cs,scale5:ws,agility:Es,jump:$s,vowels:as,jump5:is,lad:os,vibrato:ls,vhold:Zn,vscale:ts,vagil:es,vclimb:ns,jcharles:ss,vwobble:rs,timbre:ds,timbre2:us,regarp:ms,regoct:hs,belt:vs,beltoct:fs,artic:bs,artic2:ps,resist:gs,resist2:ys},V=(t,e)=>({t:"ex",id:t,name:e}),En=(t,e)=>({t:"breath",id:t,name:e}),at=[{id:"b1",title:"Базовый импульс",sub:"Дыхание, опора, мягкая активация",items:[En("belly","Дыхание животом"),En("hiss","Долгий выдох «с-с-с»"),V("hum3","Мычание по гамме"),V("trill","Губной тренаж «brrr»")],exam:{exId:"hum3",pass:.55}},{id:"b2",title:"Ясность гласных",sub:"Выравнивание гласных и точность",items:[V("vhold","Calm Down Vowels"),V("vscale","Disco Vowels"),V("jcharles","James Charles Warm Up"),V("vclimb","High Five"),V("vagil","No Bubble Gum")],exam:{exId:"vscale",pass:.6}},{id:"b3",title:"Интонация и гибкость",sub:"Гаммы, беглость, скачки",items:[V("scale5","Гамма «Ма-Мэ»"),V("agility","Беглость «Ма»"),V("jump","Октавный скачок")],exam:{exId:"agility",pass:.55}},{id:"b4",title:"Лад и музыкальное мышление",sub:"Лады, атака интервалов",items:[V("lad","Ладовая «ЯМ»"),V("jump5","Скачок к V ступени")],exam:{exId:"lad",pass:.55}},{id:"b5",title:"Вибрато",sub:"Ровный звук и мягкое колебание",items:[V("sustain","Удержание ноты"),V("vwobble","Раскачка вибрато"),V("vibrato","Вибрато")],exam:{exId:"vibrato",pass:.5}},{id:"b6",title:"Тембр и тон",sub:"Округлый, ровный звук",items:[V("timbre","Тёплый тон"),V("timbre2","Ровный тон на двух")],exam:{exId:"timbre",pass:.55}},{id:"b7",title:"Регистры и переходы",sub:"Грудной/головной, passaggio",items:[V("regarp","Через регистры"),V("regoct","Октавная связка")],exam:{exId:"regarp",pass:.5}},{id:"b8",title:"Белтинг",sub:"Яркая опёртая подача верха",items:[V("belt","Белтинг — гамма"),V("beltoct","Белт — октава")],exam:{exId:"belt",pass:.55}},{id:"b9",title:"Артикуляция",sub:"Чёткая дикция и атака",items:[V("artic","Чёткое стаккато"),V("artic2","Слоги по группам")],exam:{exId:"artic",pass:.6}},{id:"b10",title:"Сопротивление",sub:"Выносливость и опора",items:[V("resist","Стамина-фигура"),V("resist2","Выносливая гамма")],exam:{exId:"resist2",pass:.5}}];function si(t,e){return t<=0?!0:e.includes(at[t-1].id)}function Ss(){return`<div class="teacher-cta">
    <span>Педагог разберёт нюансы быстрее и покажет на твоём голосе.</span>
    <button class="btn btn-ghost" id="toSchool">Записаться на урок</button>
  </div>`}function ai(t,{blocks:e,examsPassed:n,onExit:a,onOpenBlock:s,onSchool:o}){const i=e.filter(r=>n.includes(r.id)).length,c=e.map((r,u)=>{const f=n.includes(r.id),h=si(u,n),d=f?"done":h?"open":"locked",v=f?"✓":h?`${u+1}`:"🔒";return`<button class="block-card ${d}" data-block="${u}" ${h?"":"disabled"}>
        <span class="bc-badge">${v}</span>
        <span class="bc-main"><b>${r.title}</b><span class="bc-sub">${r.sub}</span></span>
        <span class="bc-arrow">${h?"›":""}</span>
      </button>`}).join("");t.innerHTML=`
    <div class="screen catalog">
      <div class="game-top"><button class="icon-btn" id="back">‹ Меню</button></div>
      <div class="brand"><h1>Программа обучения</h1><p>Блоки открываются по мере прохождения. Каждый блок завершается экзаменом.</p></div>
      <div class="prog-wrap"><div class="prog-bar"><i style="width:${Math.round(i/e.length*100)}%"></i></div><span class="prog-txt">${i} / ${e.length} блоков пройдено</span></div>
      <div class="block-list">${c}</div>
      ${Ss()}
      <p class="hint">Это самостоятельная практика. Полноценный разбор и постановку голоса даёт педагог.</p>
    </div>
  `,document.getElementById("back").addEventListener("click",a),t.querySelectorAll("[data-block]").forEach(r=>r.addEventListener("click",()=>s(Number(r.dataset.block))));const l=document.getElementById("toSchool");l&&o&&l.addEventListener("click",o)}function ii(t,{block:e,index:n,examsPassed:a,doneItems:s,onExit:o,onRunItem:i,onExam:c,onSchool:l}){const r=a.includes(e.id),u=e.items.map((d,v)=>{const m=s.includes(d.id),b=d.t==="breath"?'<span class="bi-tag">дыхание</span>':"";return`<button class="block-item" data-item="${v}">
        <span class="bi-check ${m?"on":""}">${m?"✓":v+1}</span>
        <span class="bi-name">${d.name}${b}</span>
        <span class="bc-arrow">›</span>
      </button>`}).join(""),f=e.items.every(d=>s.includes(d.id));t.innerHTML=`
    <div class="screen catalog">
      <div class="game-top"><button class="icon-btn" id="back">‹ Программа</button></div>
      <div class="brand"><h1>${e.title}</h1><p>${e.sub}</p></div>
      <div class="block-list">${u}</div>
      <button class="btn ${f?"btn-primary":"btn-ghost"}" id="exam" style="width:100%;margin-top:6px">
        ${r?"✓ Экзамен сдан · пересдать":"Экзамен блока"}
      </button>
      <p class="hint">${f?"Все упражнения пройдены — можно сдавать экзамен.":"Пройди упражнения, потом сдай экзамен. Можно и сразу — как удобнее."}</p>
      ${Ss()}
    </div>
  `,document.getElementById("back").addEventListener("click",o),t.querySelectorAll("[data-item]").forEach(d=>d.addEventListener("click",()=>i(e,Number(d.dataset.item)))),document.getElementById("exam").addEventListener("click",()=>c(e));const h=document.getElementById("toSchool");h&&l&&h.addEventListener("click",l)}function oi(){const t=["audio/webm;codecs=opus","audio/webm","audio/mp4","audio/ogg"];for(const e of t)try{if(window.MediaRecorder&&MediaRecorder.isTypeSupported(e))return e}catch{}return""}function ci(t,e,{onExit:n}){let a=null,s=[],o=null,i=null,c=0,l=!1;function r(v){const m=Math.floor(v/1e3);return`${Math.floor(m/60)}:${String(m%60).padStart(2,"0")}`}function u(){t.innerHTML=`
      <div class="screen recorder">
        <div class="game-top"><button class="icon-btn" id="back">‹ Меню</button></div>
        <div class="brand"><h1>Запись голоса</h1><p>Запиши себя и послушай со стороны — так слышно прогресс и ошибки, которые в моменте не замечаешь.</p></div>
        <div class="rec-timer ${l?"live":""}" id="timer">${r(0)}</div>
        <button class="btn ${l?"btn-danger":"btn-primary"} rec-btn" id="rec">${l?"■ Остановить":"● Записать"}</button>
        <audio id="player" controls ${o?"":"hidden"} style="width:100%;margin-top:16px"></audio>
        <p class="hint" style="margin-top:14px">Запись хранится только в этой сессии и никуда не отправляется. ${window.MediaRecorder?"":"<br>⚠️ Браузер не поддерживает запись."}</p>
      </div>
    `,document.getElementById("back").addEventListener("click",()=>{d(),n()});const v=document.getElementById("rec");if(!window.MediaRecorder){v.disabled=!0;return}v.addEventListener("click",l?h:f);const m=document.getElementById("player");o&&m&&(m.src=o)}function f(){if(!e.stream)return;if(s=[],o){try{URL.revokeObjectURL(o)}catch{}o=null}try{const m=oi();a=m?new MediaRecorder(e.stream,{mimeType:m}):new MediaRecorder(e.stream)}catch{return}a.ondataavailable=m=>{m.data&&m.data.size&&s.push(m.data)},a.onstop=()=>{const m=new Blob(s,{type:a.mimeType||"audio/webm"});o=URL.createObjectURL(m),l=!1,u()},a.start(),l=!0,c=typeof performance<"u"?performance.now():Date.now(),u();const v=()=>document.getElementById("timer");i=setInterval(()=>{const m=v();m&&(m.textContent=r((typeof performance<"u"?performance.now():Date.now())-c))},250)}function h(){clearInterval(i),i=null;try{a&&a.state!=="inactive"&&a.stop()}catch{l=!1,u()}}function d(){clearInterval(i),i=null;try{a&&a.state!=="inactive"&&a.stop()}catch{}if(o)try{URL.revokeObjectURL(o)}catch{}}u()}const li="./backing/raspevka-rise.mp3",ri=[0,2,4,5,7,9,11],$n=t=>ri.includes((t%12+12)%12);function di(t){const e=rt(W(t));return e?e.name:""}function kn(t){return t=Math.max(0,Math.floor(t||0)),`${Math.floor(t/60)}:${String(t%60).padStart(2,"0")}`}function ui(t,e,n,{onExit:a,lowMidi:s=40,highMidi:o=76}){let i=null;const c=s-2,l=o+2,r=W(c),u=W(l),f=new Audio(li);f.preload="auto",t.innerHTML=`
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
  `;const h=document.getElementById("back"),d=document.getElementById("play"),v=document.getElementById("cur"),m=document.getElementById("dur"),b=document.getElementById("seek"),p=document.getElementById("note"),$=document.getElementById("fs"),y=$.getContext("2d");function C(){const w=Math.min(window.devicePixelRatio||1,2);$.width=$.clientWidth*w,$.height=$.clientHeight*w,y.setTransform(w,0,0,w,0,0)}C(),window.addEventListener("resize",C),f.addEventListener("loadedmetadata",()=>{m.textContent=kn(f.duration)}),f.addEventListener("ended",()=>{d.textContent="▶ Слушать"}),d.addEventListener("click",()=>{f.paused?(f.play().catch(()=>{}),d.textContent="⏸ Пауза"):(f.pause(),d.textContent="▶ Слушать")}),h.addEventListener("click",()=>{k(),a()});function H(w,M){const L=Math.max(r,Math.min(u,w)),T=Math.log2(L/r)/Math.log2(u/r);return M-T*M}const g=[];n.setRange&&n.setRange(55,1300),n.reset();function B(){const w=$.clientWidth,M=$.clientHeight;y.clearRect(0,0,w,M),y.font="10px Inter, sans-serif";for(let A=Math.ceil(c);A<=l;A++){const q=H(W(A),M),_=(A%12+12)%12===0;y.strokeStyle=_?"rgba(27,36,48,.20)":$n(A)?"rgba(27,36,48,.08)":"rgba(27,36,48,.03)",y.lineWidth=1,y.beginPath(),y.moveTo(34,q),y.lineTo(w,q),y.stroke(),$n(A)&&(y.fillStyle=_?"rgba(27,36,48,.55)":"rgba(27,36,48,.32)",y.fillText(di(A),4,q+3))}f.duration&&(b.style.width=Math.min(100,f.currentTime/f.duration*100)+"%",v.textContent=kn(f.currentTime));const L=e.read();let T=!1,R=null;if(L){const A=n.process(L);T=A.voiced&&e.rms()>.0025,R=A.smoothedHz}if(T&&R){const A=rt(R),q=(A.name||"").match(/^([A-G]#?)(-?\d+)$/);p.innerHTML=q?`${q[1]}<span class="oct">${q[2]}</span>`:A.name,p.classList.remove("silent"),g.push(H(R,M))}else p.textContent="—",p.classList.add("silent"),g.push(null);for(;g.length>90;)g.shift();const E=w-28;for(let A=0;A<g.length;A++){if(g[A]==null)continue;const q=E-(g.length-1-A)*2.4,_=A===g.length-1;y.fillStyle=_?"#2fab84":"rgba(47,171,132,.35)",_&&(y.shadowColor="#2fab84",y.shadowBlur=16),y.beginPath(),y.arc(q,g[A],_?8:2.5,0,Math.PI*2),y.fill(),y.shadowBlur=0}i=requestAnimationFrame(B)}B();function k(){i&&cancelAnimationFrame(i),i=null,window.removeEventListener("resize",C);try{f.pause(),f.src=""}catch{}}}async function mi(t){return!1}function hi(t,{onExit:e}){const n=st(),a=n&&dt(n.key),s=Us(),o={voiceType:a?a.name:null,range:s&&Number.isFinite(s.low)?`${ot(s.low)}–${ot(s.high)}`:null,streak:le(),blocks:Ft().length},i=[o.voiceType,o.range?`диапазон ${o.range}`:null,o.streak?`стрик ${o.streak}`:null,o.blocks?`блоков ${o.blocks}`:null].filter(Boolean).join(" · ")||"пока без данных";let c="any";function l(){t.innerHTML=`
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
    `,document.getElementById("back").addEventListener("click",e),t.querySelectorAll("#lf-pref [data-pref]").forEach(u=>u.addEventListener("click",()=>{c=u.dataset.pref,t.querySelectorAll("#lf-pref [data-pref]").forEach(f=>f.classList.toggle("on",f.dataset.pref===c))})),document.getElementById("lf-send").addEventListener("click",async()=>{const u=document.getElementById("lf-name").value.trim(),f=document.getElementById("lf-contact").value.trim(),h=document.getElementById("lf-goal").value.trim();if(!u||!f){document.getElementById("lf-err").textContent="Заполни имя и контакт — иначе педагог не сможет ответить.";return}const d=document.getElementById("lf-send");d.disabled=!0,d.textContent="Отправляю…",Zs({name:u,contact:f,pref:c,goal:h,stats:o}),await mi(),r(u)})}function r(u){zt(1),t.innerHTML=`
      <div class="screen summary leadform-done">
        <div class="lf-check"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M5 13l4 4L19 7"/></svg></div>
        <div class="verdict">Заявка принята!</div>
        <p class="hint">Спасибо, ${u}! Педагог свяжется по твоему контакту и подберёт время бесплатного урока. Пока — продолжай практиковаться.</p>
        <button class="btn btn-primary" id="lf-ok" style="width:100%;max-width:360px">Вернуться</button>
      </div>
    `,document.getElementById("lf-ok").addEventListener("click",e)}l()}function vi(t,e,{onExit:n,onVoice:a,onCalibrate:s}){let o=!1;function i(r,u,f){return`<div class="seg">${r.map(([h,d])=>`<button data-${f}="${h}" class="${u===h?"on":""}">${d}</button>`).join("")}</div>`}function c(){const r=Ma();if(!r.sessions)return"";const u=r.perEx.slice(0,6).map(f=>`<div class="an-row"><span>${f.id}</span><span>${f.runs}× · ${f.avgPct}%</span></div>`).join("");return`
      <div class="card">
        <div class="seg-label">Аналитика (локально) <span class="set-hint">${r.sessions} прохождений</span></div>
        <div class="an-list">${u}</div>
      </div>`}function l(){const r=st(),u=r&&dt(r.key);t.innerHTML=`
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
          ${s?`<div class="set-row" style="margin-top:8px"><div class="seg-label" style="margin:0">Точная калибровка</div><button class="toggle" id="calib">${Math.round(He()*1e3)} мс · настроить ›</button></div>`:""}

          <div class="seg-label">Чувствительность микрофона</div>
          ${i([["low","Низкая"],["med","Средняя"],["high","Высокая"]],Re(),"sens")}

          <div class="seg-label">Темп распевок</div>
          ${i([["easy","Медл."],["medium","Средне"],["fast","Быстро"]],Ie(),"diff")}

          <div class="seg-label">Звук подсказки</div>
          ${i([["piano","Пиано"],["guitar","Гитара"],["soft","Мягкий"]],gt(),"timbre")}

          <div class="seg-label">Грув (ритм-подложка) <span class="set-hint">Авто — своя под каждую распевку</span></div>
          ${i([["off","Выкл"],["auto","Авто"],["pop","Поп"],["funk","Фанк"],["soft","Мягкий"]],Be(),"groove")}

          <div class="toggle-row" style="margin-top:10px">
            <button class="toggle ${Lt()?"on":""}" id="guide">Подсказка тоном: ${Lt()?"вкл":"выкл"}</button>
            <button class="toggle ${pt()?"on":""}" id="hp">Наушники: ${pt()?"да":"нет"}</button>
          </div>
          <button class="toggle ${At()?"on":""}" id="darkstage" style="width:100%;margin-top:8px">Тёмный экран пения: ${At()?"вкл":"выкл"} <span class="set-hint">светящийся след голоса</span></button>
          <button class="toggle ${Ct()?"on":""}" id="agc" style="width:100%;margin-top:8px">Авто-громкость микро (AGC): ${Ct()?"вкл":"выкл"} <span class="set-hint">${Ct()?"громче на телефоне":"ровнее долгие ноты"}</span></button>
        </div>

        ${c()}

        <div class="card">
          <div class="seg-label">Сброс данных</div>
          <p class="hint" style="margin:4px 0 10px">Удалит прогресс, стрик, диапазон и настройки на этом устройстве. Отменить нельзя.</p>
          <button class="btn ${o?"btn-danger":"btn-ghost"}" id="reset" style="width:100%">${o?"Точно сбросить? Нажми ещё раз":"Сбросить всё"}</button>
        </div>
      </div>
    `,document.getElementById("back").addEventListener("click",n),document.getElementById("voice").addEventListener("click",a),t.querySelectorAll("[data-vol]").forEach(h=>h.addEventListener("click",()=>{if(jn(h.dataset.vol),ce(de()),e&&e.ctx)try{vt(e.ctx,523.25,.5,0,.22,gt())}catch{}l()})),t.querySelectorAll("[data-route]").forEach(h=>h.addEventListener("click",()=>{ra(h.dataset.route),l()})),t.querySelectorAll("[data-sens]").forEach(h=>h.addEventListener("click",()=>{Gn(h.dataset.sens),e&&e.setSensitivity&&e.setSensitivity(qe()),l()})),t.querySelectorAll("[data-diff]").forEach(h=>h.addEventListener("click",()=>{Fn(h.dataset.diff),l()})),t.querySelectorAll("[data-timbre]").forEach(h=>h.addEventListener("click",()=>{Nn(h.dataset.timbre),l()})),t.querySelectorAll("[data-groove]").forEach(h=>h.addEventListener("click",()=>{Dn(h.dataset.groove),l()})),document.getElementById("guide").addEventListener("click",()=>{zn(!Lt()),l()}),document.getElementById("hp").addEventListener("click",()=>{Vn(!pt()),l()}),document.getElementById("darkstage").addEventListener("click",()=>{da(!At()),l()}),document.getElementById("agc").addEventListener("click",()=>{const h=!Ct();ua(h),e&&e.setAGC&&e.setAGC(h),l()});const f=document.getElementById("calib");f&&s&&f.addEventListener("click",s),document.getElementById("reset").addEventListener("click",()=>{if(!o){o=!0,l();return}Rn(),xa(),n()})}l()}function fi(t,e,{k:n=4,minRms:a=.012,window:s=.5}={}){if(!Array.isArray(t)||t.length<3)return null;const o=t.filter(l=>l.t<e).map(l=>l.rms).sort((l,r)=>l-r);if(!o.length)return null;const i=o[Math.floor(o.length/2)]||0,c=Math.max(a,i*n);for(const l of t)if(!(l.t<=e)){if(l.t-e>s)break;if(l.rms>=c)return l.t-e}return null}function bi(t,e=.03,n=.4){const a=t.filter(s=>Number.isFinite(s)&&s>=e&&s<=n).sort((s,o)=>s-o);return a.length<2?null:a[Math.floor(a.length/2)]}const pi=t=>new Promise(e=>setTimeout(e,t));function gi(t,e,{onExit:n}){let a=!1,s="";function o(){const l=Math.round(He()*1e3);t.innerHTML=`
      <div class="screen calibrate">
        <div class="game-top"><button class="icon-btn" id="back">‹ Назад</button></div>
        <div class="brand"><h1>Калибровка задержки</h1>
          <p>Звук с динамика доходит до микрофона не мгновенно — особенно по Bluetooth. Измерим задержку, чтобы счёт был честным.</p></div>

        <div class="card">
          <div class="cal-big"><b id="curms">${l}</b> мс <span class="set-hint">текущая компенсация</span></div>
          <p class="hint" style="margin:6px 0 14px">Положи телефон перед собой, без наушников, в тишине. Нажми «Измерить» — прозвучат 3 щелчка, приложение поймает их эхо.</p>
          <button class="btn btn-primary" id="measure" style="width:100%" ${a?"disabled":""}>${a?"Измеряю…":"Измерить задержку"}</button>
          ${s?`<p class="hint" id="note" style="margin-top:12px">${s}</p>`:""}
        </div>

        <div class="card">
          <div class="seg-label">Тонкая подстройка вручную</div>
          <input type="range" id="slider" min="30" max="400" step="5" value="${l}" class="cal-slider" />
          <div class="cal-slider-row"><span>30 мс</span><span id="slval">${l} мс</span><span>400 мс</span></div>
          <p class="hint" style="margin-top:8px">Если в упражнении кажется, что счёт «опаздывает» — увеличь; если «спешит» — уменьши.</p>
        </div>
      </div>
    `,document.getElementById("back").addEventListener("click",n),document.getElementById("measure").addEventListener("click",c);const r=document.getElementById("slider");r.addEventListener("input",()=>{const u=Number(r.value);document.getElementById("slval").textContent=u+" мс",document.getElementById("curms").textContent=u,cn(u/1e3)})}function i(){return new Promise(l=>{const r=e.ctx;if(!r){l(null);return}const u=[],f=r.currentTime,h=typeof performance<"u"?performance.now():Date.now(),d=f+.15;Kt(r,.15,!0);const v=()=>{e.read(),u.push({t:r.currentTime,rms:e.rms()});const m=r.currentTime-f,b=((typeof performance<"u"?performance.now():Date.now())-h)/1e3;m<.7&&b<1.3?setTimeout(v,16):l(fi(u,d))};v()})}async function c(){if(a)return;a=!0,s="",o();const l=[];for(let u=0;u<3;u++)s=`Замер ${u+1} из 3…`,o(),l.push(await i()),await pi(300);const r=bi(l);a=!1,r==null?s="Не удалось расслышать эхо (тихо, наушники или сильный шум). Подстрой вручную ползунком ниже или выбери тип вывода в настройках.":(cn(r),s=`Готово: задержка ≈ ${Math.round(r*1e3)} мс — сохранено.`),o()}o()}function Bs(t,{onExit:e}){const n=()=>Bs(t,{onExit:e}),a=Hn(),s=lt(),o=De(),i=(l,r)=>`
    <div class="seg-label">${l}</div>
    <div class="seg">${r.map(([u,f,h])=>`<button data-act="${u}" class="${h?"on":""}">${f}</button>`).join("")}</div>`;t.innerHTML=`
    <div class="screen catalog">
      <div class="game-top"><button class="icon-btn" id="back">‹ Меню</button></div>
      <div class="brand"><h1>Тест-режим</h1>
        <p>Перемотка времени и состояние — чтобы проверять стрик, энергию, триал и пейволл без ожидания. На пользователей не влияет.</p></div>

      <div class="card" style="text-align:left">
        <div class="seg-label">Время · сейчас «${s}» ${a!==0?`(смещение ${a>0?"+":""}${a} дн.)`:"(реальное)"}</div>
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

        <div class="seg-label" style="margin-top:12px">Энергия: ${bt()}/${Pt()}</div>
        <div class="seg">
          <button data-act="e0">0</button>
          <button data-act="e1">1</button>
          <button data-act="emax">Полная</button>
        </div>

        ${i(`Пейволл (soft, ${Pe}/день): сегодня использовано ${Yn()}`,[["pw-on","Вкл",Xt()],["pw-off","Выкл",!Xt()],["pw-use","+1 распевка",!1]])}

        <div class="seg-label" style="margin-top:12px">Триал: ${o==null?"не начат":o>0?`активен, осталось ${o} дн.`:"истёк"}</div>
        <div class="seg">
          <button data-act="tr-start">Старт</button>
          <button data-act="tr-reset">Сброс</button>
        </div>

        ${i("Тариф",[["tier-free","Free",xt()==="free"],["tier-std","Standard",xt()==="standard"],["tier-pro","Pro",xt()==="pro"]])}

        <div class="seg-label" style="margin-top:12px">Программа: сдано ${Ft().length}/${at.length}</div>
        <div class="seg">
          <button data-act="bl-all">Открыть все блоки</button>
          <button data-act="bl-none">Закрыть все</button>
        </div>
      </div>

      <button class="btn btn-ghost" id="simNew" style="width:100%">🧪 Симуляция нового пользователя (сброс + пейволл вкл)</button>
      <button class="btn btn-ghost" id="exitDev" style="width:100%">Выключить тест-режим</button>
      <p class="hint">Смещение времени живёт отдельно от прогресса: «Реальное» возвращает время, не трогая данные.</p>
    </div>
  `,document.getElementById("back").addEventListener("click",e),document.getElementById("exitDev").addEventListener("click",()=>{Qt(!1),be(),e()}),document.getElementById("simNew").addEventListener("click",()=>{Rn(),be(),Qt(!0),ge(!0),n()});const c={"d-1":()=>fe(-1),"d+1":()=>fe(1),"d+7":()=>fe(7),d0:()=>be(),s0:()=>pe(0),s6:()=>pe(6),s13:()=>pe(13),fz:()=>Ys(Jt()+1),e0:()=>Gt(0),e1:()=>Gt(1),emax:()=>Gt(Pt()),"pw-on":()=>ge(!0),"pw-off":()=>ge(!1),"pw-use":()=>Kn(),"tr-start":()=>Un(),"tr-reset":()=>ba(),"tier-free":()=>_t("free"),"tier-std":()=>_t("standard"),"tier-pro":()=>_t("pro"),"bl-all":()=>wa(at.map(l=>l.id)),"bl-none":()=>Ea()};t.querySelectorAll("[data-act]").forEach(l=>{l.addEventListener("click",()=>{c[l.dataset.act](),n()})})}function yi(t,{onExit:e,onTrialStarted:n,onTeacher:a}){const s=De()!=null;t.innerHTML=`
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
        ${s?'<p class="hint" style="margin-top:12px">Пробный период уже использован. Подписка появится вместе с релизом в магазинах приложений.</p>':`<button class="btn btn-primary" id="trial" style="width:100%;margin-top:14px">Попробовать 7 дней бесплатно</button>
             <p class="hint" style="margin-top:8px">Без карты и автосписаний — просто открываем всё на неделю.</p>`}
      </div>
      <div class="teacher-cta">
        <span>Быстрее всего голос растёт с живым педагогом.</span>
        <button class="btn btn-ghost" id="teacher">Бесплатный пробный урок</button>
      </div>
      <button class="btn btn-ghost" id="tomorrow" style="width:100%">Вернусь завтра</button>
    </div>
  `,document.getElementById("back").addEventListener("click",e),document.getElementById("tomorrow").addEventListener("click",e),document.getElementById("teacher").addEventListener("click",a);const o=document.getElementById("trial");o&&o.addEventListener("click",()=>{Un(),zt(2),n()})}const wi=[{icon:"🎤",title:"Микрофон",body:"Круглая кнопка внизу экрана включает и выключает микрофон. Мы слушаем только высоту тона — ничего не записываем и не отправляем. Если браузер не дал доступ — нажми кнопку ещё раз и выбери «Разрешить»."},{icon:"🔊",title:"Плохо слышно подсказку?",body:"Настройки → «Громкость подсказки». На телефоне ставь «Громко» или «Макс». Звук подсказки (пиано/гитара/мягкий) — там же."},{icon:"🎧",title:"Звук опаздывает или «не туда» засчитывает?",body:"Это задержка вывода. Настройки → «Вывод звука»: выбери Динамик / Провод / Bluetooth (Bluetooth опаздывает сильнее всего). Для идеала — «Точная калибровка»: приложение само измерит задержку твоего устройства."},{icon:"🎵",title:"Подсказка тоном",body:"Без наушников подсказка звучит КОРОТКО перед нотой и молчит, пока поёшь — иначе микрофон ловит динамик. В наушниках включи тумблер «Наушники» — и подсказка будет вести тебя непрерывно."},{icon:"⚙️",title:"Темп и настройки прямо в упражнении",body:"На экране упражнения есть панель «Темп и подсказка тоном» (значок ⚙) — меняй темп на лету, проход мягко перезапустится. Продвинутое (тембр, грув, наушники) — под спойлером «Ещё настройки звука»."},{icon:"🎼",title:"Распевка идёт по твоему диапазону",body:"Каждая распевка начинается от низа твоего диапазона, поднимается по полутонам до верха и возвращается вниз — как на занятии с педагогом. Счётчик повторов виден сверху (например 3/17). Выйти можно в любой момент."},{icon:"🎹",title:"Лад распевок",body:"Для гаммовых распевок лад (мажор/минор и другие) выбирается прямо на экране перед стартом. Чем выше тариф — тем больше ладов открыто."},{icon:"⚡",title:"Энергия, стрик и заморозка",body:"Энергия тратится при провале (<40%) и копится за точные распевки; сама восстанавливается со временем. Стрик 🔥 — дни подряд. Заморозка ❄ спасает один пропущенный день (даётся за каждые 7 дней подряд)."},{icon:"🏆",title:"Программа обучения",body:"Главный путь: блоки открываются по очереди, каждый завершается экзаменом. Внутри блока после каждого упражнения — кнопка «Дальше» к следующему. Застрял — кнопка «Урок с педагогом» внизу."},{icon:"🌙",title:"Тёмный экран пения",body:"Настройки → «Тёмный экран пения»: светящийся след голоса на тёмной сцене. Дело вкуса — попробуй оба."}];function Ei(t,{onExit:e,onSettings:n}){const a=wi.map(o=>`
    <div class="card guide-card">
      <div class="guide-head"><span class="guide-ic">${o.icon}</span><b>${o.title}</b></div>
      <p class="how">${o.body}</p>
    </div>`).join("");t.innerHTML=`
    <div class="screen catalog">
      <div class="game-top"><button class="icon-btn" id="back">‹ Меню</button></div>
      <div class="brand"><h1>Как тут всё устроено</h1>
        <p>Короткий гид: что где находится и что подкрутить, если что-то не получается.</p></div>
      ${a}
      ${n?'<button class="btn btn-primary" id="toSettings" style="width:100%">Открыть настройки</button>':""}
      <p class="hint">Гид всегда под лампочкой 💡 в нижнем левом углу главного экрана.</p>
    </div>
  `,document.getElementById("back").addEventListener("click",e);const s=document.getElementById("toSettings");s&&n&&s.addEventListener("click",n)}const I=document.getElementById("app"),j=new Ds({fftSize:2048});let K=null,ye=null;const $i=60,Yt=[{label:"Мычание по гамме",sub:"«М» · I-II-III-II-I",ic:"lips",cat:"warm",make:t=>ze(t,Y())},{label:"Губной тренаж «brrr»",sub:"brrr / «Р» · 5 нот + квинта",ic:"wave",cat:"warm",make:t=>Ve(t,Y())},{label:"Удержание ноты",sub:"держать ровный звук",ic:"fork",cat:"warm",make:t=>cs(t,8)},{label:"Гамма «Ма-Мэ»",sub:"попадать в ноты гаммы",ic:"stairs",cat:"pitch",make:t=>ws(t,Y())},{label:"Беглость «Ма»",sub:"быстрые ноты — как в рекламе",ic:"bolt",cat:"pitch",make:t=>Es(t,Y())},{label:"Октавный скачок",sub:"прыжок на октаву и назад",ic:"arrows",cat:"pitch",make:t=>$s(t)},{label:"Цепочка гласных",sub:"Ми-Ме-Ма · выравнивание",ic:"lips",cat:"vowel",make:t=>as(t,Y())},{label:"Calm Down Vowels",sub:"И-Э-А-О-У · позиция",ic:"lips",cat:"vowel",make:t=>Zn(t)},{label:"Disco Vowels",sub:"И-Э-А-О-У · точность",ic:"stairs",cat:"vowel",make:t=>ts(t,Y())},{label:"James Charles Warm Up",sub:"гласные + Ми-Ме-Ма",ic:"wave",cat:"vowel",make:t=>ss(t,Y())},{label:"High Five",sub:"И-Э-А-О-У · подъём",ic:"arrows",cat:"vowel",make:t=>ns(t,Y())},{label:"No Bubble Gum",sub:"гибкость на гласных",ic:"bolt",cat:"vowel",make:t=>es(t,Y())},{label:"Скачок к V ступени",sub:"Ям · атака интервала",ic:"arrows",cat:"pitch",make:t=>is(t,Y())},{label:"Ладовая «ЯМ»",sub:"гамма лада вверх-вниз",ic:"stairs",cat:"pitch",make:t=>os(t,Y())},{label:"Вибрато",sub:"ровная волна голосом",ic:"wave",cat:"vib",make:t=>ls(t)},{label:"Раскачка вибрато",sub:"А · запуск вибрато",ic:"wave",cat:"vib",make:t=>rs(t)},{label:"Тёплый тон",sub:"Мо · качество тембра",ic:"fork",cat:"vib",make:t=>ds(t)},{label:"Ровный тон на двух",sub:"А · единый тембр",ic:"fork",cat:"vib",make:t=>us(t)},{label:"Через регистры",sub:"Но · passaggio",ic:"arrows",cat:"reg",make:t=>ms(t)},{label:"Октавная связка",sub:"А · соединить регистры",ic:"arrows",cat:"reg",make:t=>hs(t)},{label:"Белтинг — гамма",sub:"Эй · яркая подача",ic:"bolt",cat:"reg",make:t=>vs(t)},{label:"Белт — октава",sub:"Эй · опёртый верх",ic:"arrows",cat:"reg",make:t=>fs(t)},{label:"Чёткое стаккато",sub:"Та · артикуляция",ic:"bolt",cat:"artic",make:t=>bs(t)},{label:"Слоги по группам",sub:"Та-Ка · дикция",ic:"lips",cat:"artic",make:t=>ps(t)},{label:"Стамина-фигура",sub:"Ма · выносливость",ic:"stairs",cat:"artic",make:t=>gs(t)},{label:"Выносливая гамма",sub:"Ма · длинный пробег",ic:"stairs",cat:"artic",make:t=>ys(t)}],ki=[["warm","Разогрев"],["vowel","Гласные"],["pitch","Точность и гибкость"],["vib","Вибрато и тембр"],["reg","Регистры и сила"],["artic","Дикция и выносливость"]];function Dt(){const t=st(),e=t&&dt(t.key);return e?e.center:$i}function se(){const t=st(),e=t&&dt(t.key);return t&&t.low!=null&&t.high!=null?{low:t.low,high:t.high}:e?{low:e.low,high:e.high}:{low:48,high:72}}function it(){if(!K)return;const t=st(),e=t&&dt(t.key);e?K.setRange(W(e.low-5),W(e.high+5)):K.setRange(60,1200)}const xi=["Голос — это мышца. Сегодня сделаем её сильнее.","Дыши животом — и звук польётся сам.","Чисто — не значит громко. Решает точность.","Каждая распевка чуть-чуть расширяет диапазон.","Расслабь челюсть и плечи — голос любит свободу.","Лучшие певцы тоже начинали с простого «мычания».","Тёплый голос начинается с тёплого дыхания.","Не тянись за верхней нотой горлом — она придёт сама.","5 минут каждый день дают больше, чем час раз в неделю.","Улыбнись — и тембр станет светлее.","Зевни перед распевкой — гортань скажет спасибо.","Пой так, будто тебя уже любят слушать."];function Mi(t){const e=t.slice();for(let n=e.length-1;n>0;n--){const a=Math.floor(Math.random()*(n+1));[e[n],e[a]]=[e[a],e[n]]}return e}function Li(){Q();const t=Mi(xi);I.innerHTML=`
    <div class="screen splash">
      <div class="splash-core">
        <div class="eq" aria-hidden="true"><i></i><i></i><i></i><i></i><i></i></div>
        <h1 class="splash-title">Распевка</h1>
        <p class="splash-tip" id="tip">${t[0]}</p>
      </div>
      <div class="splash-bar"><i></i></div>
    </div>
  `;const e=window.matchMedia&&window.matchMedia("(prefers-reduced-motion: reduce)").matches;setTimeout(Ti,e?1600:2800)}function Ti(){Ci();try{new URLSearchParams(location.search).has("dev")&&Qt(!0)}catch{}if(!st()&&!x().welcomed){Si();return}F()}function Si(){Q(),I.innerHTML=`
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
  `;const t=()=>P({...x(),welcomed:!0});document.getElementById("wlc-skip").addEventListener("click",()=>{t(),F()}),document.getElementById("wlc-go").addEventListener("click",()=>{t(),X(()=>Oe(I,j,K,{onDone:()=>{it(),Bi()},onExit:F}))})}function Bi(){Q(),I.innerHTML=`
    <div class="screen welcome">
      <div class="brand"><h1>Отлично! 🎉</h1>
        <p>Упражнения уже подстроились под твой голос. Попробуем первую распевку — мягкое мычание, 1 минута.</p></div>
      <button class="btn btn-primary" id="fe-go" style="width:100%">Первая распевка →</button>
      <button class="btn btn-ghost" id="fe-guide" style="width:100%">💡 Как тут всё устроено · 1 минута</button>
      <button class="btn btn-ghost" id="fe-menu" style="width:100%">В меню</button>
    </div>
  `,document.getElementById("fe-go").addEventListener("click",()=>ie(0)),document.getElementById("fe-guide").addEventListener("click",Cs),document.getElementById("fe-menu").addEventListener("click",F)}let ht="off";async function Is(){try{if(!j.ready){j.setAGC(Ct());const{sampleRate:t}=await j.start();K||(K=new Fs(t,{fftSize:2048,minClarity:.85})),j.setSensitivity(qe()),ce(de()),it()}return ht="listening",ae(),!0}catch{return ht="denied",ae(),!1}}async function Ii(){if(ht==="listening"){try{await j.suspend()}catch{}ht="off",ae()}else await Is()}function Ci(){const t=document.getElementById("mic-fab");t&&(t.hidden=!1,t.__wired||(t.addEventListener("click",Ii),t.__wired=!0),ae())}function ae(){const t=document.getElementById("mic-fab");if(!t)return;t.className="mic-fab "+ht;const e=t.querySelector(".mic-fab-txt");e&&(e.textContent=ht==="listening"?"Слушаю":ht==="denied"?"Нет доступа · нажми":"Включить микрофон"),t.setAttribute("aria-pressed",ht==="listening"?"true":"false")}async function X(t){if(!await Is()){Ai(t);return}t()}function Ai(t){Q(),I.innerHTML=`
    <div class="screen">
      <div class="game-top"><button class="icon-btn" id="back">‹ Меню</button></div>
      <div class="brand"><h1>Нужен микрофон</h1>
        <p>Чтобы слышать твой голос, разреши доступ к микрофону. На телефоне нужен HTTPS, в браузере — «Разрешить».</p></div>
      <div class="card">
        <p class="hint" style="margin-bottom:16px">Нажми кнопку и выбери «Разрешить». Микрофон можно выключить в любой момент кнопкой внизу экрана.</p>
        <button class="btn btn-primary" id="grant" style="width:100%">Разрешить микрофон</button>
      </div>
    </div>
  `,document.getElementById("back").addEventListener("click",F),document.getElementById("grant").addEventListener("click",()=>X(t))}function we(t){return`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">${{mic:'<path d="M12 3a3 3 0 0 0-3 3v6a3 3 0 0 0 6 0V6a3 3 0 0 0-3-3z"/><path d="M5 11a7 7 0 0 0 14 0M12 18v3"/>',chart:'<path d="M4 20V10M10 20V4M16 20v-7M22 20H2"/>',tuner:'<circle cx="12" cy="12" r="8"/><path d="M12 12l4-3"/><path d="M12 4v2M12 18v2M4 12h2M18 12h2"/>',wave:'<path d="M2 12h2l2-6 3 14 3-12 2 8 2-4h6"/>',note:'<circle cx="7" cy="18" r="3"/><circle cx="18" cy="16" r="3"/><path d="M10 18V5l11-2v13"/>',lips:'<path d="M3 12c4-5 14-5 18 0-4 5-14 5-18 0z"/><path d="M3 12h18"/>',fork:'<path d="M9 3v8a3 3 0 0 0 6 0V3"/><path d="M12 14v7"/>',stairs:'<path d="M3 19h4v-4h4v-4h4V7h4"/>',bolt:'<path d="M13 2 4 14h6l-1 8 9-12h-6z"/>',arrows:'<path d="M8 8l4-4 4 4M8 16l4 4 4-4M12 4v16"/>'}[t]||""}</svg>`}function Hi(){return'<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2c1 3-1 4-2 6-1 1.7-.5 3.5 1 4 .8.3 1-.7.5-1.5 2 .6 3.5 2.3 3.5 4.5A5 5 0 0 1 7 19c-1.7-1-2.7-3-2.5-5 .2-2.4 2-3.7 2.8-5.6C8.4 6 9 3.6 12 2z"/></svg>'}const Ee=t=>t%10===1&&t%100!==11?"день":"дн.";function F(){Q();const t=(E,A)=>{const q=E.make(60).notes;return`
    <button class="ex-tile" data-ex="${A}">
      ${ke(q)}
      <span class="ex-tile-main">${E.label}</span>
      <span class="ex-tile-sub">${E.sub}</span>
    </button>`},e=ki.map(([E,A])=>{const q=Yt.map((_,D)=>_.cat===E?t(_,D):"").join("");return`<div class="cat-title">${A}</div><div class="ex-row">${q}</div>`}).join(""),n=Ft(),a=at.findIndex(E=>!n.includes(E.id)),s=Math.round(n.length/at.length*100),o=Object.entries(xs).map(([E,A])=>`
    <button class="thin-item" data-breath="${E}"><span>${A.title}</span><span class="thin-sub">${A.kind==="exhale"?"выдох":"дыхание"}</span></button>
  `).join(""),i=Object.entries(Ht).map(([E,A])=>`
    <button class="thin-item" data-rhythm="${E}"><span>${A.name}</span><span class="thin-sub">метроном</span></button>
  `).join(""),c=Ts.map((E,A)=>`
    <button class="ex-tile" data-song="${A}">
      ${ke(ti(E))}
      <span class="ex-tile-main">${E.name}</span>
      <span class="ex-tile-sub">мелодия · на «ля»</span>
    </button>`).join(""),l=le(),r=st(),u=r&&dt(r.key),f=Ks(),h=An(),d=(h.getDate()+h.getMonth())%Yt.length,v=Yt[d],m=Fe(Y()).name,b=bt(),p=Pt();I.innerHTML=`
    <div class="screen home">
      <header class="home-head">
        <h1>Распевка</h1>
        <div class="home-chips">
          <div class="energy-chip" title="Энергия — копится за точные распевки"><svg viewBox="0 0 24 24" fill="currentColor"><path d="M13 2 4 14h6l-1 8 9-12h-6z"/></svg>${b}/${p}</div>
          ${l>0?`<div class="streak-chip" title="Стрик: ${l} ${Ee(l)} подряд">${Hi()} ${l}</div>`:""}
          ${Jt()>0?`<div class="energy-chip" title="Заморозка стрика — страхует 1 пропущенный день">❄ ${Jt()}</div>`:""}
          ${ya()?'<button class="gear-btn" data-dev aria-label="Тест-режим" title="Тест-режим">🧪</button>':""}
          <button class="gear-btn" data-settings aria-label="Настройки"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg></button>
        </div>
      </header>

      <button class="hero-card" id="session">
        <div class="hero-eyebrow">Сегодня</div>
        <div class="hero-title">Полная распевка</div>
        <div class="hero-sub">${f?`Сегодня выполнено ✓${l>0?` · стрик ${l} ${Ee(l)}`:""} — возвращайся завтра`:"Дыхание → распевка · ~10 минут"}</div>
        <span class="hero-arrow">→</span>
      </button>

      <button class="hero-card program-card" data-path>
        <div class="hero-eyebrow">Программа обучения</div>
        <div class="hero-title pc-title">${a===-1?"Все блоки пройдены! 🏆":`Блок ${a+1} · ${at[a].title}`}</div>
        <div class="prog-bar pc-bar"><i style="width:${s}%"></i></div>
        <div class="hero-sub">${n.length} / ${at.length} блоков · каждый завершается экзаменом</div>
        <span class="hero-arrow">→</span>
      </button>

      <div class="tiles">
        <button class="tile tile-hl" data-freesing="1">${we("wave")}<span class="tile-main">Распевайся</span><span class="tile-sub">видеть свой голос</span></button>
        <button class="tile" data-voice="1">${we("mic")}<span class="tile-main">Мой голос</span><span class="tile-sub">${u?u.name:"определить"}</span></button>
        <button class="tile" data-dash="1">${we("chart")}<span class="tile-main">Прогресс</span><span class="tile-sub">${l>0?l+" "+Ee(l)+" подряд":"статистика"}</span></button>
      </div>

      <button class="focus-chip" data-focus>
        <span class="fc-label">Фокус дня — <b>${v.label}</b></span>
        <span class="fc-go">→</span>
      </button>

      <section class="home-sec">
        <div class="sec-title">Свободная практика</div>
        ${e}
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
  `,document.getElementById("session").addEventListener("click",()=>{const E=()=>X(()=>{it(),Va(I,j,K,{onExit:F})});x().safetyAccepted?E():Di(E)});const $=I.querySelector("[data-focus]");$&&$.addEventListener("click",()=>ie(d)),I.querySelector("[data-voice]").addEventListener("click",()=>{X(()=>Oe(I,j,K,{onDone:()=>{it(),F()},onExit:F}))}),I.querySelector("[data-dash]").addEventListener("click",()=>_a(I,{onExit:F})),I.querySelector("[data-freesing]").addEventListener("click",()=>{X(()=>{const E=se();Wa(I,j,K,{onExit:()=>{it(),F()},lowMidi:E.low,highMidi:E.high})})}),I.querySelectorAll("[data-ex]").forEach(E=>{E.addEventListener("click",()=>ie(Number(E.dataset.ex)))}),I.querySelectorAll("[data-breath]").forEach(E=>{E.addEventListener("click",()=>X(()=>Ms(I,j,E.dataset.breath,{onExit:F})))}),I.querySelectorAll("[data-rhythm]").forEach(E=>{E.addEventListener("click",()=>ks(I,j,Dt(),Ht[E.dataset.rhythm],{onExit:F}))});const y=I.querySelector("[data-path]");y&&y.addEventListener("click",je);const C=I.querySelector("[data-ear]");C&&C.addEventListener("click",()=>X(()=>{it(),Ls(I,j,K,{onExit:F,root:Dt()})}));const H=I.querySelector("[data-theory]");H&&H.addEventListener("click",()=>Ja(I,{onExit:F}));const g=I.querySelector("[data-record]");g&&g.addEventListener("click",()=>X(()=>ci(I,j,{onExit:F})));const B=I.querySelector("[data-backing]");B&&B.addEventListener("click",()=>X(()=>{const E=se();ui(I,j,K,{onExit:()=>{it(),F()},lowMidi:E.low,highMidi:E.high})}));const k=I.querySelector("[data-modes]");k&&k.addEventListener("click",qi);const w=I.querySelector("[data-settings]");w&&w.addEventListener("click",Rt);const M=I.querySelector("[data-teacher]");M&&M.addEventListener("click",()=>Vt(F)),I.querySelectorAll("[data-song]").forEach(E=>{E.addEventListener("click",()=>Hs(Number(E.dataset.song)))});const L=I.querySelector("[data-guide]");L&&L.addEventListener("click",Cs);const T=I.querySelector("[data-dev]");T&&T.addEventListener("click",xn);const R=I.querySelector(".home-head h1");if(R){let E=0,A=0;R.addEventListener("click",()=>{const q=Date.now();E=q-A<600?E+1:1,A=q,E>=7&&(E=0,Qt(!0),xn())})}}function xn(){Q(),Bs(I,{onExit:F})}function Cs(){Q(),Ei(I,{onExit:F,onSettings:Rt})}function Ri(){Q(),yi(I,{onExit:F,onTrialStarted:F,onTeacher:()=>Vt(F)})}function As(t){if(ga()){Ri();return}Xt()&&Kn(),t()}function ie(t,e=!0){if(e){As(()=>Mn(t,e));return}Mn(t,e)}function oe(t){const e=se(),n=t(60),a=Math.min(...n.notes.map(c=>c.midi))-60,s=e.low-a,o=t(s),i=Ne(o,e.low,e.high,48);return{ex:o,reps:i}}function Mn(t,e){X(()=>{it();const n=o=>Yt[t].make(o),{ex:a,reps:s}=oe(n);ct(I,j,K,a,{explain:e,reps:s,rebuild:()=>oe(n).ex,onExit:F,onAgain:()=>ie(t,!1)})})}function Hs(t,e=!0){if(e){As(()=>Ln(t,e));return}Ln(t,e)}function Ln(t,e){X(()=>{const n=Ts[t].make(Dt());ct(I,j,K,n,{explain:e,reps:[0],onExit:F,onAgain:()=>Hs(t,!1)})})}function qi(){Q(),ni(I,{onExit:F})}function je(){Q(),ai(I,{blocks:at,examsPassed:Ft(),onExit:F,onOpenBlock:Tt,onSchool:Vt})}function Tt(t){Q();const e=at[t];ii(I,{block:e,index:t,examsPassed:Ft(),doneItems:ea(e.id),onExit:je,onRunItem:Le,onExam:me,onSchool:Vt})}function Le(t,e){const n=t.items[e],a=at.indexOf(t),s=t.items[e+1],o=()=>s?Le(t,e+1):me(t);X(()=>{if(it(),n.t==="breath"){Ms(I,j,n.id,{onExit:()=>Tt(a),onDone:()=>an(t.id,n.id),onNext:o,nextLabel:s?`Дальше: ${s.name}`:"К экзамену блока"});return}const i=r=>Me[n.id](r,Y()),{ex:c,reps:l}=oe(i);ct(I,j,K,c,{explain:!0,reps:l,rebuild:()=>oe(i).ex,onResult:r=>{r.pct>=.5&&an(t.id,n.id)},onExit:()=>Tt(a),onAgain:()=>Le(t,e),nextLabel:s?`Дальше: ${s.name}`:"К экзамену блока",onNext:o})})}function me(t){X(()=>{it();const e=Me[t.exam.exId](Dt(),Y()),n=se(),a=Ne(e,n.low,n.high,2);ct(I,j,K,e,{explain:!0,reps:a,rebuild:()=>Me[t.exam.exId](Dt(),Y()),onComplete:s=>Pi(t,s),onExit:()=>Tt(at.indexOf(t)),onAgain:()=>me(t)})})}function Pi(t,e){Q();const n=Math.round(e.pct*100),a=e.pct>=t.exam.pass;a?ta(t.id):bt()>0&&$e(-1);const s=at.indexOf(t),o=a&&s+1<at.length,i=a?"var(--green)":"var(--coral)";I.innerHTML=`
    <div class="screen summary">
      <div class="verdict" style="color:${i}">${a?"Экзамен сдан!":"Пока не сдан"}</div>
      <div class="big-pct" style="color:${i}">${n}<span>%</span></div>
      <p class="hint">${a?`Блок «${t.title}» пройден.${o?" Открыт следующий блок.":""}`:`Нужно ${Math.round(t.exam.pass*100)}%. Энергия −1 (восстановится со временем). Можно пересдать сразу.`}</p>
      <div class="teacher-cta"><span>Разобрать ошибки с педагогом — быстрее.</span><button class="btn btn-ghost" id="toSchool">На урок</button></div>
      <div class="row">
        <button class="btn btn-ghost" id="toBlock">К блоку</button>
        <button class="btn btn-primary" id="primary">${a?o?"Следующий блок":"К программе":"Пересдать"}</button>
      </div>
    </div>`,document.getElementById("toBlock").addEventListener("click",()=>Tt(s)),document.getElementById("toSchool").addEventListener("click",Vt),document.getElementById("primary").addEventListener("click",()=>{a?o?Tt(s+1):je():me(t)})}function Vt(t){Q(),hi(I,{onExit:typeof t=="function"?t:F})}function Rt(){Q(),vi(I,j,{onExit:F,onVoice:()=>X(()=>Oe(I,j,K,{onDone:()=>{it(),Rt()},onExit:Rt})),onCalibrate:()=>X(()=>gi(I,j,{onExit:Rt}))})}function Di(t){Q(),I.innerHTML=`
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
  `,document.getElementById("accept").addEventListener("click",()=>{P({...x(),safetyAccepted:!0}),t()}),document.getElementById("safety-back").addEventListener("click",F)}function Q(){ye&&cancelAnimationFrame(ye),ye=null}"serviceWorker"in navigator&&window.addEventListener("load",()=>{navigator.serviceWorker.register("./sw.js").catch(()=>{})});Li();
