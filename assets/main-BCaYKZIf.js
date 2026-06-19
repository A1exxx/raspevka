import{m as Y,c as Gt,a as Tn,f as as,h as ht,M as ha,P as fa}from"./note-map-ClIaVDR2.js";class ba{constructor(t){this.notes=Array.from({length:t},()=>({greenMs:0,scoredMs:0,activeMs:0,sumCents:0,centsMs:0})),this.g={ms:0,sumC:0,sumC2:0,reversals:0,lastC:null,lastDir:0}}record(t,n,s,a,o=null){const i=this.notes[t];if(i&&(i.activeMs+=s,!!a&&(i.scoredMs+=s,n==="green"?i.greenMs+=s:n==="yellow"&&(i.greenMs+=s*.5),o!=null&&Number.isFinite(o)))){i.sumCents+=o*s,i.centsMs+=s;const c=this.g;if(c.ms+=s,c.sumC+=o*s,c.sumC2+=o*o*s,c.lastC!=null){const l=o-c.lastC;if(Math.abs(l)>2){const r=l>0?1:-1;c.lastDir&&r!==c.lastDir&&(c.reversals+=1),c.lastDir=r}}c.lastC=o}}result(){let t=0,n=0,s=0,a=0,o=0;for(const d of this.notes)t+=d.greenMs,n+=d.activeMs,s+=d.sumCents,a+=d.centsMs,d.activeMs>0&&d.greenMs/d.activeMs>=.5&&(o+=1);const i=n>0?t/n:0,c=i>=.85?3:i>=.6?2:i>=.35?1:0,l=this.g;let r=0;if(l.ms>0){const d=l.sumC/l.ms,v=Math.max(0,l.sumC2/l.ms-d*d);r=Math.sqrt(v)}const h=l.ms/1e3,m=h>0?l.reversals/2/h:0,u=m>=3.5&&m<=8.5&&r>=15&&r<=130;return{pct:i,stars:c,notesHit:o,notesTotal:this.notes.length,avgCents:a>0?s/a:0,perNote:this.notes.map(d=>d.activeMs>0?d.greenMs/d.activeMs:0),stability:r,vibrato:{present:u,rateHz:m}}}}const In={light:{grid:"rgba(27,36,48,.07)",gridC:"rgba(27,36,48,.18)",label:"rgba(27,36,48,.42)",hitLine:"rgba(14,141,127,.6)",note:"rgba(14,141,127,.26)",noteActive:"rgba(14,141,127,.95)",noteGlow:"rgba(14,141,127,.5)",green:"#2fab84",yellow:"#e0a64a",red:"#e0544b",free:"#0e8d7f",glow:0},dark:{grid:"rgba(255,255,255,.055)",gridC:"rgba(255,255,255,.14)",label:"rgba(255,255,255,.45)",hitLine:"rgba(61,229,201,.7)",note:"rgba(61,229,201,.2)",noteActive:"rgba(61,229,201,.95)",noteGlow:"rgba(61,229,201,.85)",green:"#3ee6a8",yellow:"#ffc24d",red:"#ff6b61",free:"#3de5c9",glow:10}};class ga{constructor(t,n,s={}){this.theme=In[s.theme]||In.light,this.canvas=t,this.ctx=t.getContext("2d"),this.ex=n,this.secPerBeat=60/(n.tempo||90),this.greenCents=n.greenCents||20,this.yellowCents=n.yellowCents||40,this.pxPerSec=s.pxPerSec||150,this.hitFrac=s.hitFrac??.26,this.leadIn=s.leadIn??2.2;let a=this.leadIn;this.timed=n.notes.map(i=>{const c=i.beats*this.secPerBeat,l={midi:i.midi,hz:Y(i.midi),start:a,end:a+c,dur:c};return a+=c+(i.gap||0)*this.secPerBeat,l}),this.totalTime=a+.6;const o=n.notes.map(i=>i.midi);this.minMidi=Math.min(...o)-3,this.maxMidi=Math.max(...o)+3,this.trail=[]}yFor(t,n){const s=Y(this.minMidi),a=Y(this.maxMidi),o=Math.max(s,Math.min(a,t)),i=Math.log2(o/s)/Math.log2(a/s);return n-i*n}activeAt(t){for(let n=0;n<this.timed.length;n++)if(t>=this.timed[n].start&&t<this.timed[n].end)return{index:n,seg:this.timed[n]};return null}evaluate(t,n,s){const a=this.activeAt(t);if(!a)return{index:-1,zone:null,voiced:!1};if(!s||!n)return{index:a.index,zone:"red",voiced:!1};const o=Math.abs(Gt(n,a.seg.hz));return{index:a.index,zone:Tn(o,this.greenCents,this.yellowCents),voiced:!0}}draw(t,n,s){const a=this.ctx,o=this.canvas.clientWidth,i=this.canvas.clientHeight,c=o*this.hitFrac;a.clearRect(0,0,o,i);const l=this.theme;for(let g=Math.ceil(this.minMidi);g<=this.maxMidi;g++){const E=this.yFor(Y(g),i),x=as(g),A=x&&x.startsWith("C");a.strokeStyle=A?l.gridC:l.grid,a.lineWidth=1,a.beginPath(),a.moveTo(0,E),a.lineTo(o,E),a.stroke(),A&&(a.fillStyle=l.label,a.font="10px Inter, sans-serif",a.fillText(x,4,E-3))}a.strokeStyle=l.hitLine,a.lineWidth=2,a.setLineDash([5,6]),a.beginPath(),a.moveTo(c,0),a.lineTo(c,i),a.stroke(),a.setLineDash([]);const r=this.activeAt(t),h=r?r.index:-1,m=16;for(let g=0;g<this.timed.length;g++){const E=this.timed[g],x=c+(E.start-t)*this.pxPerSec,A=E.dur*this.pxPerSec;if(x+A<-20||x>o+20)continue;const P=this.yFor(E.hz,i),b=g===h,L=8;a.fillStyle=b?l.noteActive:l.note,ya(a,x,P-m/2,Math.max(A,10),m,L),a.fill(),b&&(a.shadowColor=l.noteGlow,a.shadowBlur=18+l.glow,a.fill(),a.shadowBlur=0)}let u=null,d="#5e6b7a";if(s&&n)if(u=this.yFor(n,i),r){const g=Tn(Math.abs(Gt(n,r.seg.hz)),this.greenCents,this.yellowCents);d=g==="green"?l.green:g==="yellow"?l.yellow:l.red}else d=l.free;for(this.trail.push(u);this.trail.length>70;)this.trail.shift();const v=this.trail.length,p=2.2;a.strokeStyle=d,a.lineWidth=3,a.lineJoin="round",a.globalAlpha=.45,l.glow&&(a.shadowColor=d,a.shadowBlur=l.glow),a.beginPath();let f=!1;for(let g=0;g<v;g++){const E=this.trail[g];if(E==null){f=!1;continue}const x=c-(v-1-g)*p;f?a.lineTo(x,E):(a.moveTo(x,E),f=!0)}a.stroke(),a.shadowBlur=0;for(let g=0;g<v;g++){const E=this.trail[g];if(E==null)continue;const x=c-(v-1-g)*p;a.globalAlpha=.12+g/v*.5,a.fillStyle=d,a.beginPath(),a.arc(x,E,2,0,Math.PI*2),a.fill()}a.globalAlpha=1,u!=null&&(a.fillStyle=d,a.shadowColor=d,a.shadowBlur=16,a.beginPath(),a.arc(c,u,7,0,Math.PI*2),a.fill(),a.shadowBlur=0)}}function ya(e,t,n,s,a,o){const i=Math.min(o,a/2,s/2);e.beginPath(),e.moveTo(t+i,n),e.arcTo(t+s,n,t+s,n+a,i),e.arcTo(t+s,n+a,t,n+a,i),e.arcTo(t,n+a,t,n,i),e.arcTo(t,n,t+s,n,i),e.closePath()}const wa=(()=>{try{return/Mobi|Android|iPhone|iPad|iPod/i.test(navigator.userAgent)||(navigator.maxTouchPoints||0)>1}catch{return!1}})(),$a=wa?2.8:1.8;let is=$a,St=null;function we(e){if(!(!Number.isFinite(e)||e<=0)&&(is=e,St&&St.__rtGain))try{St.__rtGain.gain.setTargetAtTime(e,St.currentTime,.02)}catch{}}function os(e){if(e.__rtMaster)return St=e,e.__rtMaster;const t=e.createDynamicsCompressor();t.threshold.value=-10,t.knee.value=24,t.ratio.value=4,t.attack.value=.003,t.release.value=.25;const n=e.createGain();return n.gain.value=is,t.connect(n).connect(e.destination),e.__rtMaster=t,e.__rtGain=n,St=e,t}function vt(e,t,n=.6,s=0,a=.22,o="piano"){const i=e.currentTime+s,c=e.createGain();c.connect(os(e));const l=[];let r=n;const h=(m,u,d,v)=>{const p=e.createOscillator(),f=e.createGain();p.type=m,p.frequency.value=u,f.gain.value=d,p.connect(f).connect(v),p.start(i),p.stop(i+r+.08),l.push(p)};if(o==="piano")r=Math.max(1.6,n),c.gain.setValueAtTime(1e-4,i),c.gain.linearRampToValueAtTime(a,i+.008),c.gain.exponentialRampToValueAtTime(1e-4,i+r),[[1,1],[2,.5],[3,.25],[4,.12]].forEach(([m,u])=>h("sine",t*m,u,c));else if(o==="guitar"){r=Math.max(1.3,n);const m=e.createBiquadFilter();m.type="lowpass",m.frequency.setValueAtTime(3800,i),m.frequency.exponentialRampToValueAtTime(700,i+r),m.connect(c),c.gain.setValueAtTime(1e-4,i),c.gain.linearRampToValueAtTime(a,i+.006),c.gain.exponentialRampToValueAtTime(1e-4,i+r),[[1,1],[2,.32]].forEach(([u,d])=>h("sawtooth",t*u,d,m))}else r=Math.max(.2,n),c.gain.setValueAtTime(0,i),c.gain.linearRampToValueAtTime(a,i+.025),c.gain.setValueAtTime(a,i+Math.max(.05,r-.1)),c.gain.linearRampToValueAtTime(0,i+r),h("triangle",t,1,c),h("triangle",t*2,.18,c);return{dur:n,stop(){try{l.forEach(m=>{m.stop(),m.disconnect()}),c.disconnect()}catch{}}}}function Bn(e,t,n=0,s=1.4,a=.14,o="piano"){return[0,4,7].forEach(i=>{const c=440*Math.pow(2,(t+i-69)/12);vt(e,c,s,n,a,o)}),s}function Ea(e,t,n,s="piano",a=.22){const o=60/(n||90);let i=0;const c=[];for(const l of t){const r=440*Math.pow(2,(l.midi-69)/12);c.push(vt(e,r,Math.max(.18,l.beats*o*.92),i,a,s)),i+=(l.beats+(l.gap||0))*o}return{dur:i,stop(){c.forEach(l=>l&&l.stop&&l.stop())}}}function re(e,t=0,n=!1){const s=e.currentTime+t,a=e.createOscillator(),o=e.createGain();a.frequency.value=n?1600:1050;const i=n?.4:.26;o.gain.setValueAtTime(1e-4,s),o.gain.exponentialRampToValueAtTime(i,s+.005),o.gain.exponentialRampToValueAtTime(1e-4,s+.08),a.connect(o).connect(os(e)),a.start(s),a.stop(s+.1)}function ka(e,t=72){[0,4,7,12].forEach((s,a)=>{const o=440*Math.pow(2,(t+s-69)/12);vt(e,o,.5,a*.085,.16,"piano")})}function xa(e,t,n,s=.05){const a=[0,7,12].map(o=>{const i=440*Math.pow(2,(t+o-69)/12);return vt(e,i,n,0,s,"soft")});return{stop(){try{a.forEach(o=>o.stop())}catch{}}}}const Ae="https://a1exxx.github.io/raspevka/?utm_source=share&utm_medium=result";function Ma(e,t,n){const o=document.createElement("canvas");o.width=1080,o.height=1080;const i=o.getContext("2d"),c=i.createLinearGradient(0,0,1080,1080);return c.addColorStop(0,"#114b44"),c.addColorStop(1,"#081f1d"),i.fillStyle=c,i.fillRect(0,0,1080,1080),i.textAlign="center",i.fillStyle="#3de5c9",i.font="700 40px system-ui,sans-serif",i.fillText("● РАСПЕВКА",1080/2,180),i.fillStyle="#fff",i.font="800 64px system-ui,sans-serif",i.fillText(e,1080/2,380),i.font="700 200px system-ui,sans-serif",i.fillText(t+"%",1080/2,620),i.fillStyle="#ffc24d",i.font="90px serif",i.fillText("★".repeat(n)+"☆".repeat(3-n),1080/2,760),i.fillStyle="rgba(255,255,255,.6)",i.font="600 38px system-ui,sans-serif",i.fillText("a1exxx.github.io/raspevka",1080/2,980),o}async function La({name:e,pct:t,stars:n}){const s=`Спел распевку «${e}» на ${t}% (${"★".repeat(n)}) в Распевке! Попробуй и ты:`,a=Ma(e,t,n);try{const o=await new Promise(c=>a.toBlob(c,"image/png")),i=o?new File([o],"raspevka.png",{type:"image/png"}):null;if(i&&navigator.canShare&&navigator.canShare({files:[i]})){await navigator.share({files:[i],text:s,url:Ae});return}if(navigator.share){await navigator.share({text:s,url:Ae});return}}catch(o){if(o&&o.name==="AbortError")return}try{await navigator.clipboard.writeText(`${s} ${Ae}`)}catch{}}function An(e){if(e.__noise)return e.__noise;const t=e.createBuffer(1,Math.floor(e.sampleRate*.5),e.sampleRate),n=t.getChannelData(0);for(let s=0;s<n.length;s++)n[s]=Math.random()*2-1;return e.__noise=t,t}const Cn={pop:{kick:[0,4],snare:[2,6],hatOpen:[7],bass:[[0,0],[3,0],[4,7]],stab:[3,7],swing:0},funk:{kick:[0,3,6],snare:[2,6],hatOpen:[3,7],bass:[[0,0],[1,7],[4,0],[6,7]],stab:[1,3,5,7],swing:.18},soft:{kick:[0,4],snare:[6],hatOpen:[],bass:[[0,0],[4,7]],stab:[3],swing:0},drive:{kick:[0,2,4,6],snare:[2,6],hatOpen:[],bass:[[0,0],[2,0],[4,7],[6,7]],stab:[4],swing:0},march:{kick:[0,2,4,6],snare:[4],hatOpen:[0,4],bass:[[0,0],[2,7],[4,0],[6,7]],stab:[],swing:0},swing:{kick:[0,4],snare:[2,6],hatOpen:[3,7],bass:[[0,0],[3,5],[4,7],[6,12]],stab:[3,7],swing:.34},ballad:{kick:[0],snare:[4],hatOpen:[],bass:[[0,0],[4,7]],stab:[2,6],swing:0},latin:{kick:[0,3,6],snare:[2,7],hatOpen:[5],bass:[[0,0],[3,7],[6,5]],stab:[2,5],swing:0}};function Sa(e,{rootMidi:t=60,tempo:n=100,dur:s=16,style:a="pop",gain:o=.5,when:i=0}={}){const c=Cn[a]||Cn.pop,l=e.currentTime+i,r=60/n,h=r/2,m=r*4,u=Math.ceil(s/m)+1,d=e.createGain();d.gain.value=o;const v=e.createDynamicsCompressor();v.threshold.value=-12,v.ratio.value=4,d.connect(v).connect(e.destination);const p=[],f=b=>{const L=e.createOscillator(),w=e.createGain();L.frequency.setValueAtTime(150,b),L.frequency.exponentialRampToValueAtTime(48,b+.12),w.gain.setValueAtTime(.9,b),w.gain.exponentialRampToValueAtTime(.001,b+.18),L.connect(w).connect(d),L.start(b),L.stop(b+.2),p.push(L)},g=b=>{const L=e.createBufferSource();L.buffer=An(e);const w=e.createBiquadFilter();w.type="bandpass",w.frequency.value=1800,w.Q.value=.7;const y=e.createGain();y.gain.setValueAtTime(.5,b),y.gain.exponentialRampToValueAtTime(.001,b+.14),L.connect(w).connect(y).connect(d),L.start(b),L.stop(b+.16),p.push(L)},E=(b,L)=>{const w=e.createBufferSource();w.buffer=An(e);const y=e.createBiquadFilter();y.type="highpass",y.frequency.value=7e3;const k=e.createGain(),T=L?.12:.035;k.gain.setValueAtTime(.22,b),k.gain.exponentialRampToValueAtTime(.001,b+T),w.connect(y).connect(k).connect(d),w.start(b),w.stop(b+T+.02),p.push(w)},x=(b,L,w)=>{const y=e.createOscillator(),k=e.createGain();y.type="triangle",y.frequency.value=Y(L),k.gain.setValueAtTime(1e-4,b),k.gain.linearRampToValueAtTime(.4,b+.01),k.gain.setValueAtTime(.4,b+w*.5),k.gain.exponentialRampToValueAtTime(.001,b+w),y.connect(k).connect(d),y.start(b),y.stop(b+w+.02),p.push(y)},A=b=>{[t,t+7,t+12].forEach(L=>{const w=e.createOscillator(),y=e.createGain();w.type="triangle",w.frequency.value=Y(L),y.gain.setValueAtTime(1e-4,b),y.gain.linearRampToValueAtTime(.09,b+.008),y.gain.exponentialRampToValueAtTime(.001,b+.17),w.connect(y).connect(d),w.start(b),w.stop(b+.2),p.push(w)})},P=t-12;for(let b=0;b<u;b++){const L=l+b*m,w=y=>L+y*h+(y%2?c.swing*h:0);c.kick.forEach(y=>f(w(y))),c.snare.forEach(y=>g(w(y)));for(let y=0;y<8;y++)E(w(y),c.hatOpen.includes(y));c.bass.forEach(([y,k])=>x(w(y),P+k,h*1.6)),c.stab.forEach(y=>A(w(y)))}return{duck(b){const L=b?o*.25:o;try{d.gain.setTargetAtTime(L,e.currentTime,.04)}catch{}},stop(){try{p.forEach(b=>{try{b.stop()}catch{}b.disconnect&&b.disconnect()}),d.disconnect(),v.disconnect()}catch{}}}}const Xe="raspevka.clock.v1";function cs(){try{return Number(localStorage.getItem(Xe))||0}catch{return 0}}function gt(){return Date.now()+cs()}function ls(){return new Date(gt())}function pt(e=ls()){return e.toISOString().slice(0,10)}function rs(){return Math.round(cs()/864e5)}function Ta(e){try{localStorage.setItem(Xe,String(Math.round(e)*864e5))}catch{}}function Ce(e){Ta(rs()+e)}function He(){try{localStorage.removeItem(Xe)}catch{}}const Ke="raspevka.progress.v1";function $(){try{return JSON.parse(localStorage.getItem(Ke))||{}}catch{return{}}}function q(e){try{localStorage.setItem(Ke,JSON.stringify(e))}catch{}}function ds(){try{localStorage.removeItem(Ke)}catch{}}function us(){const e=$();return e.range&&Number.isFinite(e.range.low)?e.range:null}function ms(e){const t=$(),n=pt(),s=pt(new Date(gt()-864e5)),a=pt(new Date(gt()-2*864e5));let o=!1;return t.lastDate!==n?(t.lastDate===s?t.streak=(t.streak||0)+1:t.lastDate===a&&(t.freezes||0)>0?(t.freezes-=1,o=!0,t.streak=(t.streak||0)+1):t.streak=1,t.lastDate=n,t.streak>0&&t.streak%7===0&&(t.freezes=Math.min(2,(t.freezes||0)+1))):t.streak||(t.streak=1),t.history=t.history||[],t.history.push({date:n,pct:e.pct,stars:e.stars}),t.history.length>200&&(t.history=t.history.slice(-200)),t.total=(t.total||0)+1,q(t),{streak:t.streak,total:t.total,freezeSpent:o}}function Qt(){return $().streak||0}function de(){return $().freezes||0}function Ia(e){const t=$();return t.freezes=Math.max(0,Math.min(2,Math.round(e))),q(t),t.freezes}function Ba(){const e=pt();return($().history||[]).some(t=>t.date===e)}function Re(e){const t=$();return t.streak=Math.max(0,Math.round(e)),t.lastDate=pt(),q(t),t.streak}function Aa(){return $().history||[]}function Ca(){return $().rangeHistory||[]}function ps(){return $().total||0}function Ha(e){const t=$();return t.leads=t.leads||[],t.leads.push({ts:gt(),...e}),t.leads.length>50&&(t.leads=t.leads.slice(-50)),q(t),t.leads}function Rt(){return $().examsPassed||[]}function Ra(e){const t=$();return t.examsPassed=t.examsPassed||[],t.examsPassed.includes(e)||(t.examsPassed.push(e),q(t)),t.examsPassed}function Pa(e){return($().blockItems||{})[e]||[]}function Hn(e,t){const n=$();n.blockItems=n.blockItems||{};const s=n.blockItems[e]||[];return s.includes(t)||(s.push(t),n.blockItems[e]=s,q(n)),s}function Z(){return $().modeKey||"ionian"}function vs(e){const t=$();return t.modeKey=e,q(t),e}function Tt(){return $().tier||"free"}function ae(e){const t=$();return t.tier=e,q(t),e}const It=5,_a=25;function Wt(){return It}function yt(){const e=$();let t=e.energy==null?It:e.energy;if(t<It&&e.energyTs){const n=Math.floor((gt()-e.energyTs)/(_a*6e4));n>0&&(t=Math.min(It,t+n))}return t}function ie(e){const t=$(),n=Math.max(0,Math.min(It,Math.round(e)));return t.energy=n,t.energyTs=n<It?gt():null,q(t),n}function Ve(e){return ie(yt()+e)}function Je(){return $().groove||"off"}function hs(e){const t=$();return t.groove=e,q(t),e}function Qe(){return $().haptic!==!1}function qa(e){const t=$();return t.haptic=!!e,q(t),t.haptic}function Da(e){const t=$();if(!t.range||!Number.isFinite(t.range.low))return{extended:null};let n=null;return e>t.range.high?(t.range.high=e,n="high"):e<t.range.low&&(t.range.low=e,n="low"),n&&(t.rangeHistory=t.rangeHistory||[],t.rangeHistory.push({date:pt(),low:t.range.low,high:t.range.high}),t.rangeHistory.length>100&&(t.rangeHistory=t.rangeHistory.slice(-100)),q(t)),{extended:n,midi:e}}function it(){const e=$();return e.voice&&e.voice.key?e.voice:null}function Rn(e,t=null,n=null){const s=$(),a=s.voice||{};return s.voice={key:e,low:t??a.low??null,high:n??a.high??null},t!=null&&n!=null&&(s.range={low:Math.round(t),high:Math.round(n)},s.rangeHistory=s.rangeHistory||[],s.rangeHistory.push({date:pt(),low:Math.round(t),high:Math.round(n)}),s.rangeHistory.length>100&&(s.rangeHistory=s.rangeHistory.slice(-100))),q(s),s.voice}const Fa={easy:.6,medium:.8,fast:1};function Ze(){return $().difficulty||"easy"}function fs(e){const t=$();return t.difficulty=e,q(t),e}function Na(){return Fa[Ze()]||.6}function Bt(){return $().guide!==!1}function bs(e){const t=$();return t.guide=!!e,q(t),t.guide}function wt(){return $().headphones===!0}function gs(e){const t=$();return t.headphones=!!e,q(t),t.headphones}function za(){return Bt()?wt()?"continuous":"prehear":"off"}function $t(){const e=$().timbre;return e==="guitar"||e==="soft"?e:"piano"}function ys(e){const t=$();return t.timbre=e,q(t),t.timbre}function ws(){try{const e=navigator.userAgent||"";return/Mobi|Android|iPhone|iPad|iPod/i.test(e)||(navigator.maxTouchPoints||0)>1}catch{return!1}}const tn={quiet:1,normal:1.8,loud:2.8,max:4.2};function Oa(){return ws()?"loud":"normal"}function $e(){const e=$().volume;return tn[e]?e:Oa()}function Ee(){return tn[$e()]}function $s(e){const t=$();return tn[e]&&(t.volume=e,q(t)),$e()}const en={speaker:.09,wired:.12,bt:.24};function Va(){return"speaker"}function ke(){const e=$().route;return en[e]?e:Va()}function ja(e){const t=$();return en[e]&&(t.route=e,delete t.latencyManual,q(t)),ke()}function nn(){const e=$().latencyManual;return Number.isFinite(e)?e:en[ke()]}function Pn(e){const t=$();return t.latencyManual=Math.max(0,Math.min(.5,e)),q(t),t.latencyManual}function Ot(){return $().darkStage===!0}function Ga(e){const t=$();return t.darkStage=!!e,q(t),t.darkStage}function Pe(){return $().rhythmPad!==!1}function Wa(e){const t=$();return t.rhythmPad=!!e,q(t),t.rhythmPad}function Nt(){return $().micAGC===!0}function Ua(e){const t=$();return t.micAGC=!!e,q(t),t.micAGC}const Es={low:1.5,med:3,high:5.5};function Ya(){return ws()?"high":"med"}function sn(){const e=$().sensitivity;return Es[e]?e:Ya()}function an(){return Es[sn()]}function ks(e){const t=$();return t.sensitivity=e,q(t),e}function on(){return $().breathBest||0}function Xa(e){const t=$();return t.breathBest=Math.max(t.breathBest||0,e),q(t),t.breathBest}const cn=5,Ka=7;function ue(){return $().paywallEnabled===!0}function _e(e){const t=$();return t.paywallEnabled=!!e,q(t),t.paywallEnabled}function xs(){const e=$();return e.trialStart||(e.trialStart=gt(),q(e)),e.trialStart}function ln(){const e=$().trialStart;if(!e)return null;const t=Ka-Math.floor((gt()-e)/864e5);return Math.max(0,t)}function Ja(){const e=ln();return e!=null&&e>0}function Qa(){const e=$();delete e.trialStart,q(e)}function Za(){return Tt()!=="free"||Ja()}function Ms(){const e=$();return e.uses&&e.uses.date===pt()?e.uses.count:0}function Ls(){const e=$(),t=pt();return e.uses=e.uses&&e.uses.date===t?{date:t,count:e.uses.count+1}:{date:t,count:1},q(e),e.uses.count}function ti(){return!ue()||Za()?!1:Ms()>=cn}function ei(){return $().devMode===!0}function me(e){const t=$();return t.devMode=!!e,q(t),t.devMode}const zt=[{min:0,title:"Новичок"},{min:100,title:"Ученик"},{min:250,title:"Любитель"},{min:500,title:"Распевающийся"},{min:850,title:"Уверенный"},{min:1300,title:"Вокалист"},{min:1900,title:"Артист"},{min:2700,title:"Солист"},{min:3700,title:"Виртуоз"},{min:5e3,title:"Мастер"},{min:7e3,title:"Маэстро"},{min:1e4,title:"Легенда"}];function rn(){return $().xp||0}function ni(e){const t=$();return t.xp=(t.xp||0)+Math.max(0,Math.round(e)),q(t),t.xp}function U(e=rn()){let t=0;for(let i=zt.length-1;i>=0;i--)if(e>=zt[i].min){t=i;break}const n=zt[t],s=zt[t+1]||null,a=e-n.min,o=s?s.min-n.min:1;return{level:t+1,title:n.title,curMin:n.min,nextMin:s?s.min:null,into:a,span:o,pct:s?Math.round(a/o*100):100}}function dn(){const e=$();return{name:e.profileName||"",avatar:e.profileAvatar||""}}function _n({name:e,avatar:t}){const n=$();return e!==void 0&&(n.profileName=String(e).slice(0,32)),t!==void 0&&(n.profileAvatar=String(t).slice(0,4)),q(n),dn()}function si(){const e=$();return e.perfect3Count=(e.perfect3Count||0)+1,q(e),e.perfect3Count}function ai(){const e=$();e.fullSessionDone=!0,q(e)}function Ut({stars:e=0,kind:t="exercise"}={}){let n=0;t==="exercise"?(n=10+e*15,e===3&&si()):t==="session"?n=60:t==="breathing"?n=20:t==="exam"&&(n=100);const s=rn(),a=ni(n);return{added:n,total:a,prevTotal:s}}const je=[{id:"first_step",title:"Первый шаг",desc:"Завершить первую распевку или упражнение",icon:"🎵",check:e=>(e.totalSessions||0)>=1},{id:"clean_voice",title:"Чистый голос",desc:"Получить первые 3 звезды",icon:"⭐",check:e=>(e.perfect3Count||0)>=1},{id:"perfectionist",title:"Перфекционист",desc:"Получить 3 звезды 10 раз",icon:"💎",check:e=>(e.perfect3Count||0)>=10},{id:"week_power",title:"Неделя силы",desc:"Стрик 7 дней подряд",icon:"🔥",check:e=>(e.streak||0)>=7},{id:"month_discipline",title:"Месяц дисциплины",desc:"Стрик 30 дней подряд",icon:"📅",check:e=>(e.streak||0)>=30},{id:"unbreakable",title:"Несгибаемый",desc:"Стрик 100 дней подряд",icon:"🏆",check:e=>(e.streak||0)>=100},{id:"breath_master",title:"Дыхание мастера",desc:"Ровный выдох ≥ 20 секунд",icon:"🫁",check:e=>(e.breathBest||0)>=20},{id:"wide_range",title:"Шире на октаву",desc:"Диапазон голоса 24+ полутона",icon:"🎼",check:e=>(e.rangeSemitones||0)>=24},{id:"student",title:"Ученик",desc:"Сдать первый экзамен блока",icon:"🎓",check:e=>(e.examsPassed||0)>=1},{id:"graduate",title:"Выпускник",desc:"Пройти все 10 блоков программы",icon:"👑",check:e=>(e.examsPassed||0)>=10},{id:"marathon",title:"Марафонец",desc:"Завершить 50 сессий/упражнений",icon:"🏅",check:e=>(e.totalSessions||0)>=50},{id:"timbre_found",title:"Тембр найден",desc:"Определить тип голоса",icon:"🎤",check:e=>!!e.voiceSet},{id:"full_session",title:"Полная распевка",desc:"Пройти полную распевку (все упражнения)",icon:"✅",check:e=>!!e.fullSessionDone}];function ii(){return $().unlockedAchievements||[]}function Yt(e){const t=$(),n=new Set(t.unlockedAchievements||[]),s=[];for(const a of je)!n.has(a.id)&&a.check(e)&&(n.add(a.id),s.push(a));return s.length>0&&(t.unlockedAchievements=[...n],q(t)),s}function Xt(){const e=$(),t=e.range,n=t&&Number.isFinite(t.low)&&Number.isFinite(t.high)?t.high-t.low:0;return{streak:e.streak||0,totalSessions:e.total||0,examsPassed:(e.examsPassed||[]).length,rangeSemitones:n,breathBest:e.breathBest||0,perfect3Count:e.perfect3Count||0,voiceSet:!!(e.voice&&e.voice.key),fullSessionDone:!!e.fullSessionDone}}function oi(e){const t=$();return t.examsPassed=e.slice(),q(t),t.examsPassed}function ci(){const e=$();delete e.examsPassed,delete e.blockItems,q(e)}const pe="raspevka.analytics.v1",qn=500,li=new Set(["demo_start","exercise_done","lead_open","lead_sent","session_done","app_install"]);function Kt(e,t={}){try{const n=JSON.parse(localStorage.getItem(pe)||"[]");n.push({t:Date.now(),type:e,...t}),n.length>qn&&n.splice(0,n.length-qn),localStorage.setItem(pe,JSON.stringify(n))}catch{}li.has(e)}function ri(){try{return JSON.parse(localStorage.getItem(pe)||"[]")}catch{return[]}}function di(){try{localStorage.removeItem(pe)}catch{}}function ui(){const e=ri(),t=e.filter(a=>a.type==="exercise_done"),n={};for(const a of t)(n[a.id||"—"]=n[a.id||"—"]||[]).push(a.pct||0);const s=Object.entries(n).map(([a,o])=>({id:a,runs:o.length,avgPct:Math.round(o.reduce((i,c)=>i+c,0)/o.length)})).sort((a,o)=>o.runs-a.runs);return{total:e.length,sessions:t.length,perEx:s}}const ve=[{key:"ionian",name:"Ионийский (мажор)",intervals:[0,2,4,5,7,9,11],tier:"free"},{key:"aeolian",name:"Эолийский (минор)",intervals:[0,2,3,5,7,8,10],tier:"standard"},{key:"dorian",name:"Дорийский",intervals:[0,2,3,5,7,9,10],tier:"pro"},{key:"phrygian",name:"Фригийский",intervals:[0,1,3,5,7,8,10],tier:"pro"},{key:"lydian",name:"Лидийский",intervals:[0,2,4,6,7,9,11],tier:"pro"},{key:"mixolydian",name:"Миксолидийский",intervals:[0,2,4,5,7,9,10],tier:"pro"},{key:"locrian",name:"Локрийский",intervals:[0,1,3,5,6,8,10],tier:"pro"},{key:"harm_major",name:"Гармонический мажор",intervals:[0,2,4,5,7,8,11],tier:"pro"},{key:"harm_minor",name:"Гармонический минор",intervals:[0,2,3,5,7,8,11],tier:"pro"}],Dn={free:0,standard:1,pro:2};function un(e){return ve.find(t=>t.key===e)||ve[0]}function Ss(e,t="free"){const n=un(e);return Dn[n.tier]<=Dn[t||"free"]}function mi(e,t){const n=t.intervals,s=Math.round(e)-1,a=Math.floor(s/7),o=(s%7+7)%7;return n[o]+12*a}function Et(e,t){const n=un(t);return e.map(s=>mi(s,n))}const pi={BASE_URL:"./",DEV:!1,MODE:"production",PROD:!0,SSR:!1},vi="#0e8d7f",hi="#0a766a",fi="#687485",bi="#ffffff",Fn="#2a3340",gi="#cfd6e0",yi=[0,2,4,5,7,9,11],Nn=e=>yi.includes((e%12+12)%12),wi=e=>`C${Math.floor(e/12)-1}`;function Ts(e,t){if(e==null||t==null)return"";let n=Math.round(e)-2,s=Math.round(t)+2;for(;(n%12+12)%12!==0;)n--;for(;(s%12+12)%12!==11;)s++;const a=13,o=54,i=9,c=33,l=d=>d>=e&&d<=t,r=[];for(let d=n;d<=s;d++)Nn(d)&&r.push(d);const h=r.length*a,m={};r.forEach((d,v)=>{m[d]=v*a});let u="";r.forEach((d,v)=>{const p=v*a;u+=`<rect x="${p}" y="0" width="${a-1}" height="${o}" rx="2.5" fill="${l(d)?vi:bi}" stroke="${gi}" stroke-width="1"/>`,(d%12+12)%12===0&&(u+=`<text x="${p+(a-1)/2}" y="${o+11}" text-anchor="middle" fill="${fi}" font-size="8">${wi(d)}</text>`)});for(let d=n;d<=s;d++){if(Nn(d))continue;const v=m[d-1];if(v==null)continue;const p=v+a-i/2;u+=`<rect x="${p}" y="0" width="${i}" height="${c}" rx="2" fill="${l(d)?hi:Fn}" stroke="${Fn}" stroke-width="1"/>`}return`
    <div class="mini-kb">
      <svg viewBox="0 0 ${h} ${o+14}" preserveAspectRatio="xMidYMid meet" role="img" aria-label="Диапазон голоса на клавиатуре">
        ${u}
      </svg>
    </div>`}function Ge(e){if(!Array.isArray(e)||!e.length)return'<span class="ex-glyph"></span>';const t=e.map(p=>typeof p=="number"?{midi:p,beats:1,gap:0}:{midi:p.midi,beats:p.beats||1,gap:p.gap||0}),n=t.map(p=>p.midi),s=Math.min(...n),a=Math.max(...n),o=Math.max(1,a-s)+1,i=t.reduce((p,f)=>p+f.beats+f.gap,0),c=Math.max(5,Math.min(16,150/i)),l=10,r=1.6,h=l-4;let m=0,u="";for(const p of t){const f=Math.max(3,p.beats*c-r),g=(a-p.midi)*l+2,E=p.midi===a?' class="gh-hi"':"";u+=`<rect${E} x="${m.toFixed(1)}" y="${g}" width="${f.toFixed(1)}" height="${h}" rx="2"/>`,m+=(p.beats+p.gap)*c}const d=m,v=o*l;return`<span class="ex-glyph"><svg viewBox="0 0 ${d.toFixed(0)} ${v}" preserveAspectRatio="xMidYMid meet" role="img" aria-label="Рисунок мелодии упражнения">${u}</svg></span>`}function Is(e){return`<div class="exa-hero"><img src="${import.meta&&pi&&"./"||"/"}exa/${e}.png" alt="" loading="lazy" decoding="async"/></div>`}function $i(e){const t=e&&e.id||"",n=e&&e.kind||"";return n==="vibrato"||/vib|vwobble/.test(t)?"vib":/artic/.test(t)?"artic":/timbre|reg|belt|jump5|jump$/.test(t)?"reg":n==="vowel"||/vowel|vhold|vscale|vagil|vclimb|jcharles/.test(t)?"vowel":n==="sustain"||n==="hum"||/hum|trill|sustain/.test(t)?"warm":n==="scale"||n==="agility"||n==="jump"||n==="glide"||/scale|agility|lad|five|run|resist/.test(t)?"pitch":"vowel"}const zn=["#0e8d7f","#12a36b","#e0a64a","#5b8def","#e0544b","#9b6dd6"];function Ct(e=1){if(window.matchMedia&&window.matchMedia("(prefers-reduced-motion: reduce)").matches)return;const t=e>=2?36:18,n=document.createElement("div");n.setAttribute("aria-hidden","true"),n.style.cssText="position:fixed;inset:0;pointer-events:none;z-index:999;overflow:hidden",document.body.appendChild(n);const s=window.innerWidth;for(let a=0;a<t;a++){const o=document.createElement("i"),i=5+Math.random()*6,c=Math.random()<.4;o.style.cssText=`position:absolute;top:-12px;left:${Math.random()*s}px;width:${i}px;height:${c?i:i*.45}px;background:${zn[a%zn.length]};border-radius:${c?"50%":"2px"};will-change:transform,opacity`,n.appendChild(o);const l=320+Math.random()*380,r=(Math.random()-.5)*160,h=1100+Math.random()*900;o.animate([{transform:"translate(0,0) rotate(0deg)",opacity:1},{transform:`translate(${r}px,${l}px) rotate(${(Math.random()-.5)*540}deg)`,opacity:0}],{duration:h,delay:Math.random()*250,easing:"cubic-bezier(.2,.6,.35,1)",fill:"forwards"})}setTimeout(()=>n.remove(),2600)}function At(e=12){try{Qe()&&navigator.vibrate&&navigator.vibrate(e)}catch{}}function mt(e,{icon:t="🎉",type:n="xp"}={}){const s=document.createElement("div");s.className=`xp-toast xp-toast--${n}`,s.setAttribute("aria-live","polite"),s.innerHTML=`<span class="xp-toast-icon">${t}</span><span class="xp-toast-text">${e}</span>`,document.body.appendChild(s),requestAnimationFrame(()=>{requestAnimationFrame(()=>{s.classList.add("xp-toast--visible")})}),setTimeout(()=>{s.classList.remove("xp-toast--visible"),setTimeout(()=>{try{s.remove()}catch{}},500)},3200)}let Bs=!1;function ut(e,t,n,s,a={}){const{onExit:o,onAgain:i,onComplete:c,onResult:l,onNext:r,nextLabel:h,explain:m}=a;if(we(Ee()),m){We(e,s,{onExit:o,onStart:()=>ut(e,t,n,s,{...a,explain:!1}),onModeChange:a.rebuild?()=>ut(e,t,n,a.rebuild(),{...a,explain:!0}):null});return}const u=a.reps,d=a.repIndex||0,v=u&&u.length&&u[d]||0,p=s.root!=null?s.root:s.notes[0].midi,f=v?{...s,root:p+v,notes:s.notes.map(M=>({...M,midi:M.midi+v}))}:s,g=u&&u.length>1?` · ${d+1}/${u.length}`:"";e.innerHTML=`
    <div class="screen game ${Ot()?"stage-dark":""}">
      <div class="game-top">
        <button class="icon-btn" id="exit">‹ Меню</button>
        <div class="ex-name">${f.name} · <span class="syl">«${f.syllable}»</span>${g}</div>
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
        ${oe()}
      </details>
      ${u&&u.length>1?'<button class="btn btn-ghost btn-skip" id="endearly">Закончить на этом повторе → итог</button>':""}
    </div>
  `;const E=document.getElementById("hw"),x=E.getContext("2d"),A=document.getElementById("msg"),P=document.getElementById("livebar"),b=document.getElementById("target"),L=document.getElementById("yours"),w=document.getElementById("cue");function y(){const M=Math.min(window.devicePixelRatio||1,2);E.width=E.clientWidth*M,E.height=E.clientHeight*M,x.setTransform(M,0,0,M,0,0)}y(),window.addEventListener("resize",y);const k=Na(),T={...f,tempo:Math.max(40,Math.round(f.tempo*k))},C=60/T.tempo,R=C*4,I=new ga(E,T,{theme:Ot()?"dark":"light",leadIn:R}),_=new ba(f.notes.length),D=nn(),S=wt()||ke()!=="speaker";let H=null,j=null,K=0,dt=0,Pt=!1,Me=!1,Le=0,bn=-1,kt=0,gn=0,yn=0,wn=!1;const te=document.getElementById("endearly");te&&te.addEventListener("click",()=>{wn=!0,te.textContent="Хорошо — после этого повтора итог ✓",te.disabled=!0});const xt=[],Se=[],_t=(M,z)=>{const G=setTimeout(M,z);return Se.push(G),G};function $n(){xt.forEach(M=>M&&M.stop&&M.stop()),xt.length=0}function Te(){j&&(cancelAnimationFrame(j),j=null),Se.forEach(clearTimeout),Se.length=0,window.removeEventListener("resize",y),document.removeEventListener("visibilitychange",En),$n()}function En(){document.hidden?(j&&(cancelAnimationFrame(j),j=null),$n(),K&&!Pt&&(Pt=!0,Me=!0)):Me&&(Me=!1,kn())}document.addEventListener("visibilitychange",En),document.getElementById("exit").addEventListener("click",()=>{Te(),o()});function kn(){Te(),ut(e,t,n,s,{...a,explain:!1})}ce(document.getElementById("gsettings"),kn,t);const ee=f.root!=null?f.root:f.notes[0].midi,qt=$t();I.draw(0,null,!1);function ma(M){w.innerHTML='<button class="btn btn-ghost btn-skip" id="skipref">Пропустить образец →</button>',document.getElementById("skipref").addEventListener("click",M)}function xn(){w.innerHTML=""}function pa(M){A.textContent="Приготовься…";for(let z=0;z<4;z++)re(t.ctx,z*C,z===0);_t(M,R*1e3+50)}d===0?(A.textContent="Слушай тонику…",Bn(t.ctx,ee,0,1.4,.14,qt),_t(()=>{pa(()=>{A.textContent="Образец…";const M=Ea(t.ctx,T.notes,T.tempo,qt),z=_t(()=>{xn(),Ie()},M.dur*1e3+200);ma(()=>{clearTimeout(z),M.stop(),xn(),Ie()})})},1400)):(A.textContent=(v>0?"↑ выше":"↓ ниже")+` · повтор ${d+1}/${u.length}`,Bn(t.ctx,ee,0,.8,.14,qt),_t(Ie,950));function Ie(){const M=za();A.textContent="Приготовься…",n.reset(),K=performance.now(),dt=K,Le=K,M==="continuous"?I.timed.forEach(O=>{xt.push(vt(t.ctx,O.hz,Math.max(.2,O.dur*.92),O.start,.1,qt))}):M==="prehear"&&I.timed.forEach(O=>{const J=Math.min(.4,O.dur);xt.push(vt(t.ctx,O.hz,J,Math.max(0,O.start-J),.18,qt))}),f.drone&&xt.push(xa(t.ctx,ee,I.totalTime+.5,.05));const z=Je(),G=z==="auto"?f.grooveStyle||"pop":z;G!=="off"&&(H=Sa(t.ctx,{rootMidi:ee,tempo:T.tempo,dur:I.totalTime,style:G,gain:.45,when:0}),xt.push(H));for(let O=0;O<4;O++)re(t.ctx,O*C,O===0);_t(()=>{A.textContent=M==="continuous"?"Пой за подсказкой!":M==="prehear"?"Слушай тон и повторяй!":"Пой!"},R*1e3),Mn()}function Mn(){const M=performance.now(),z=(M-K)/1e3,G=M-dt;dt=M;const O=t.read();let J=!1,X=null;if(O){const tt=n.process(O);J=tt.voiced&&t.rms()>.0025,X=tt.smoothedHz}H&&!S&&H.duck(J);const Q=I.evaluate(z-D,J?X:null,J);if(Q.index>=0){let tt=null;Q.voiced&&X&&I.timed[Q.index]&&(tt=Gt(X,I.timed[Q.index].hz)),_.record(Q.index,Q.zone,G,Q.voiced,tt),Q.zone==="green"&&Q.voiced&&Q.index!==bn&&(At(12),bn=Q.index)}I.draw(z,J?X:null,J);const ct=I.activeAt(z);if(b.textContent=ct?Ei(ct.seg.midi):"—",J&&X){Le=M;const tt=ht(X);L.textContent=tt?tt.name:"—";const ne=Q.zone==="green"?"var(--green)":Q.zone==="yellow"?"var(--yellow)":"var(--coral)";if(L.style.color=ct?ne:"var(--text)",P.style.width=Math.min(100,t.rms()*350)+"%",ct){const Be=Gt(X,ct.seg.hz),Mt=Be<0?1:-1;Math.abs(Be)<=20?(w.textContent="в точку",w.style.color="var(--green)",w.classList.remove("cue-big"),kt=0):Math.abs(Be)<=45?(w.textContent=Mt>0?"↑ выше":"↓ ниже",w.style.color="var(--amber)",w.classList.remove("cue-big"),kt=0):(kt=gn===Mt?kt+G:0,gn=Mt,kt>450?(w.textContent=Mt>0?"ПОЙ ВЫШЕ ↑":"ПОЙ НИЖЕ ↓",w.style.color="var(--coral)",w.classList.add("cue-big"),M-yn>1100&&(At(Mt>0?[45,60,45]:[150]),yn=M)):(w.textContent=Mt>0?"↑ выше":"↓ ниже",w.style.color="var(--amber)",w.classList.remove("cue-big")))}else w.textContent="",w.classList.remove("cue-big"),kt=0}else L.textContent="—",L.style.color="var(--text-dim)",P.style.width="0%",ct&&M-Le>5e3?(w.textContent="не слышу голос — спой громче",w.style.color="var(--coral)"):w.textContent="";z<I.totalTime?j=requestAnimationFrame(Mn):Pt||(Pt=!0,va())}function va(){const M=_.result();Te();const z=a._acc||[];if(z.push(M),!wn&&u&&u.length>1&&d<u.length-1){ut(e,t,n,s,{...a,repIndex:d+1,_acc:z});return}const G=z.reduce((tt,ne)=>tt+(ne.pct||0),0)/z.length,O={pct:G,stars:G>=.85?3:G>=.6?2:G>=.35?1:0,notesHit:M.notesHit,notesTotal:M.notesTotal,avgCents:M.avgCents,perNote:M.perNote,stability:M.stability,vibrato:M.vibrato,repsDone:z.length};if(Kt("exercise_done",{id:s.id,pct:Math.round(G*100),stability:Math.round(M.stability||0),reps:z.length}),l&&l(O),c){c(O);return}G>=.5&&ms({pct:G,stars:O.stars});const J=U().level,X=Ut({stars:O.stars,kind:"exercise"});O._xpAdded=X.added;const Q=U().level,ct=Yt(Xt());if(Q>J&&(Ct(2),mt(`Новый уровень: ${U().title}`,{icon:"🏆",type:"level"})),ct.forEach(tt=>mt(`Награда: ${tt.title}`,{icon:tt.icon,type:"achievement"})),G<.4){if(yt()>0){Ve(-1),Sn(O);return}}else G>=.5&&Ve(G>=.8?2:1);Ln(O)}function Ln(M){if(M.stars>=2&&(Ct(M.stars>=3?2:1),At(M.stars>=3?30:15)),M.stars>=3)try{ka(t.ctx)}catch{}const z="★".repeat(M.stars)+"☆".repeat(3-M.stars),G=Math.round(M.pct*100),O=M.stars>=3?"Отлично!":M.stars===2?"Хорошо!":M.stars===1?"Неплохо":"Ещё разок",J=Vn(M,s),X=U(),Q=M._xpAdded!=null?`
      <div class="xp-summary-row">
        <span class="xp-gained">+${M._xpAdded} XP</span>
        <span class="xp-level-label">${X.title} · ур. ${X.level}</span>
        <div class="xp-bar-wrap"><div class="xp-bar-fill" style="width:${X.pct}%"></div></div>
        ${X.nextMin?`<span class="xp-bar-hint">до след. уровня ${X.nextMin-X.curMin-X.into} XP</span>`:'<span class="xp-bar-hint">Максимальный уровень!</span>'}
      </div>`:"";e.innerHTML=`
      <div class="screen summary">
        <div class="stars">${z}</div>
        <div class="verdict">${O}</div>
        <div class="big-pct">${G}<span>%</span></div>
        <p class="hint">средняя точность${M.repsDone>1?` за ${M.repsDone} повтор${M.repsDone<5?"а":"ов"}`:""}</p>
        ${Q}
        ${On(yt(),Wt())}
        ${xi(M)}
        <div class="card tip-card"><p class="how"><b>Разбор.</b> ${J}</p></div>
        ${oe()}
        ${r?`<button class="btn btn-primary" id="next" style="width:100%">${h||"Дальше"} →</button>`:""}
        <div class="row">
          <button class="btn btn-ghost" id="menu">Меню</button>
          <button class="btn ${r?"btn-ghost":"btn-primary"}" id="again">Ещё раз</button>
        </div>
        ${M.stars>=2?'<button class="btn btn-ghost btn-skip" id="share">Поделиться результатом</button>':""}
      </div>
    `,ce(e,()=>Ln(M),t),document.getElementById("again").addEventListener("click",i),document.getElementById("menu").addEventListener("click",o);const ct=document.getElementById("next");ct&&ct.addEventListener("click",r);const tt=document.getElementById("share");tt&&tt.addEventListener("click",()=>La({name:s.name,pct:G,stars:M.stars}))}function Sn(M){const z=Math.round(M.pct*100),G=Vn(M,s);e.innerHTML=`
      <div class="screen summary">
        <div class="verdict" style="color:var(--coral)">Сложновато — попробуем ещё</div>
        <div class="big-pct" style="color:var(--coral)">${z}<span>%</span></div>
        ${On(yt(),Wt())}
        <div class="card tip-card"><p class="how"><b>Подсказка.</b> ${G}</p></div>
        <p class="hint">Энергия −1 (восстанавливается со временем). Сбавь темп или включи «подсказку тоном» — станет легче.</p>
        ${oe()}
        <div class="row">
          <button class="btn btn-ghost" id="menu">Меню</button>
          <button class="btn btn-primary" id="again">Пройти заново</button>
        </div>
        ${r?`<button class="btn btn-ghost" id="next" style="width:100%">${h||"Дальше"} →</button>`:""}
      </div>`;const O=()=>ut(e,t,n,s,{...a,explain:!1,repIndex:0,_acc:void 0});ce(e,()=>Sn(M),t),document.getElementById("menu").addEventListener("click",o),document.getElementById("again").addEventListener("click",O);const J=document.getElementById("next");J&&J.addEventListener("click",r)}}function Ei(e){const t=ht(440*Math.pow(2,(e-69)/12));return t?t.name:""}function ki(){return'<svg viewBox="0 0 24 24" width="15" height="15" fill="currentColor"><path d="M13 2 4 14h6l-1 8 9-12h-6z"/></svg>'}function On(e,t){const n=Array.from({length:t},(s,a)=>`<span class="en-pip ${a<e?"on":""}"></span>`).join("");return`<div class="energy-row"><span class="en-ic">${ki()}</span><div class="energy-pips">${n}</div></div>`}function xi(e){if(e.stability==null)return"";const t=e.stability,n=t<15?"ровно":t<30?"почти ровно":"дрожит",s=t<15?"var(--green)":t<30?"var(--amber)":"var(--coral)",o=e.vibrato&&e.vibrato.present?`есть · ${e.vibrato.rateHz.toFixed(1)} Гц`:"нет";return`<div class="stat-chips">
    <span class="stat-chip">ровность: <b style="color:${s}">${n}</b></span>
    <span class="stat-chip">вибрато: <b>${o}</b></span>
  </div>`}function Mi(e){if(e.modeKey===void 0)return"";const t=Z(),n=Tt();return`<div class="settings" style="margin-bottom:8px">
      <div class="seg-label">Лад распевки</div>
      <select id="modeSel" class="lad-select">${ve.map(a=>{const o=!Ss(a.key,n);return`<option value="${a.key}" ${a.key===t?"selected":""} ${o?"disabled":""}>${a.name}${o?" 🔒":""}</option>`}).join("")}</select>
    </div>`}function We(e,t,{onExit:n,onStart:s,onModeChange:a}){e.innerHTML=`
    <div class="screen breathe-intro">
      <div class="game-top"><button class="icon-btn" id="back">‹ Меню</button></div>
      <div class="brand"><h1>${t.name}</h1>
        <p>Слог: <b>«${t.syllable}»</b></p></div>
      <div class="card exa-card">
        ${Is($i(t))}
        ${t.how?`<p class="exa-tip">${t.how}</p>`:t.desc?`<p class="exa-tip">${t.desc}</p>`:""}
        <div class="exa-foot">
          <div class="exa-contour" title="Форма распевки">${Ge(t.notes)}</div>
          <div class="exa-legend"><span class="lg lg-g">точно</span><span class="lg lg-y">почти</span><span class="lg lg-r">мимо</span> — пой так, чтобы шарик совпал с нотой</div>
        </div>
      </div>
      ${Mi(t)}
      <details class="more-settings exa-more"><summary>Темп, подсказка тоном, звук</summary>${oe()}</details>
      <button class="btn btn-primary" id="go" style="width:100%">Начать</button>
    </div>
  `,document.getElementById("back").addEventListener("click",n),document.getElementById("go").addEventListener("click",s),ce(e,()=>We(e,t,{onExit:n,onStart:s,onModeChange:a}));const o=document.getElementById("modeSel");o&&o.addEventListener("change",()=>{vs(o.value),a?a():We(e,t,{onExit:n,onStart:s,onModeChange:a})})}function oe(){const e=Ze(),t=Bt(),n=wt(),s=$t(),a=(m,u)=>`<button data-diff="${m}" class="${e===m?"on":""}">${u}</button>`,o=(m,u)=>`<button data-timbre="${m}" class="${s===m?"on":""}">${u}</button>`,i=Je(),c=(m,u)=>`<button data-groove="${m}" class="${i===m?"on":""}">${u}</button>`,l=$e(),r=(m,u)=>`<button data-vol="${m}" class="${l===m?"on":""}">${u}</button>`,h=Qe();return`
    <div class="settings inline-settings">
      <div class="seg-label">Громкость подсказки</div>
      <div class="seg">${r("quiet","Тихо")}${r("normal","Норм")}${r("loud","Громко")}${r("max","Макс")}</div>
      <div class="seg-label">Темп</div>
      <div class="seg">${a("easy","Медл.")}${a("medium","Средне")}${a("fast","Быстро")}</div>
      <div class="toggle-row">
        <button class="toggle ${t?"on":""}" data-guidetoggle="1">Подсказка тоном: ${t?"вкл":"выкл"}</button>
      </div>
      <details class="more-settings" ${Bs?"open":""}>
        <summary>Ещё настройки звука: тембр, грув, наушники</summary>
        <div class="seg-label">Звук подсказки</div>
        <div class="seg">${o("piano","Пиано")}${o("guitar","Гитара")}${o("soft","Мягкий")}</div>
        <div class="seg-label">Грув (ритм-подложка · лучше в наушниках)</div>
        <div class="seg">${c("off","Выкл")}${c("auto","Авто")}${c("pop","Поп")}${c("funk","Фанк")}${c("soft","Мягкий")}</div>
        <div class="toggle-row">
          <button class="toggle ${n?"on":""}" data-hptoggle="1">Наушники: ${n?"да":"нет"}</button>
          <button class="toggle ${h?"on":""}" data-vibrotoggle="1">Вибрация: ${h?"вкл":"выкл"}</button>
        </div>
      </details>
    </div>
  `}function ce(e,t,n){e.querySelectorAll("[data-diff]").forEach(c=>{c.addEventListener("click",()=>{fs(c.dataset.diff),t()})}),e.querySelectorAll("[data-timbre]").forEach(c=>{c.addEventListener("click",()=>{ys(c.dataset.timbre),t()})}),e.querySelectorAll("[data-groove]").forEach(c=>{c.addEventListener("click",()=>{hs(c.dataset.groove),t()})}),e.querySelectorAll("[data-vol]").forEach(c=>{c.addEventListener("click",()=>{if($s(c.dataset.vol),we(Ee()),n&&n.ctx)try{vt(n.ctx,523.25,.5,0,.22,$t())}catch{}t()})});const s=e.querySelector("[data-guidetoggle]");s&&s.addEventListener("click",()=>{bs(!Bt()),t()});const a=e.querySelector("[data-hptoggle]");a&&a.addEventListener("click",()=>{gs(!wt()),t()});const o=e.querySelector("[data-vibrotoggle]");o&&o.addEventListener("click",()=>{const c=!Qe();qa(c),c&&At(40),t()});const i=e.querySelector(".more-settings");i&&i.addEventListener("toggle",()=>{Bs=i.open})}function Vn(e,t){if(e.stars>=3)return"Чисто и точно! Можно прибавить темп или взять упражнение посложнее.";const n=[],s=e.avgCents;s<=-18?n.push("Ты чаще занижал — тяни ноту чуть выше, поддержи дыханием (опора живота)."):s>=18&&n.push("Ты чаще завышал — не дави, расслабь гортань, целься чуть ниже.");const a=e.perNote.length;if(a>=3){const i=t.notes.map((l,r)=>({i:r,midi:l.midi})).sort((l,r)=>r.midi-l.midi).slice(0,Math.max(1,Math.round(a/3)));i.reduce((l,r)=>l+(e.perNote[r.i]||0),0)/i.length<e.pct-.15&&n.push("Верхние ноты даются хуже — не тянись вверх горлом, добавь головной резонанс и воздух.")}return n.length||n.push("Целься в центр ноты и держи ровно. Включи «подсказку тоном» — попадать заметно легче."),n.join(" ")}const N=(e,t=1,n=0)=>n?{midi:e,beats:t,gap:n}:{midi:e,beats:t};function As(e){const t=(n,s,a=0)=>N(e+n,s,a);return{id:"vhold",name:"Пять гласных",syllable:"И-Э-А-О-У",tempo:78,kind:"vowel",root:e,grooveStyle:"soft",greenCents:25,desc:"Унификация гласных: держим позицию, меняем только гласную «И-Э-А-О-У».",how:"Пой «И-Э-А-О-У» ровно, без «прыжков» голосом при смене гласной. Сначала стаккато с паузами, потом строка повторяется выше — позиция единая.",notes:[t(0,.5,.5),t(0,.5,.5),t(0,.5,.5),t(0,.5,.5),t(0,.5,.5),t(0,.5),t(0,.5),t(0,.5),t(0,.5),t(0,1),t(4,.25),t(4,.25),t(4,.25),t(4,.25),t(4,1,2),t(4,.25),t(4,.25),t(4,.25),t(4,.25),t(4,1)]}}function Cs(e){const t=(n,s)=>N(e+n,s);return{id:"vscale",name:"Лесенка гласных",syllable:"И-Э-А-О-У",tempo:124,kind:"scale",root:e,grooveStyle:"pop",desc:"Точность высоты при смене гласной — каждая гласная ведёт по двум нотам.",how:"Пой «И-Э-А-О-У» легко и точно, попадая в каждую ноту слига. Не зажимайся.",notes:[t(0,.5),t(2,.5),t(5,.5),t(7,.5),t(9,.5),t(7,.5),t(5,.5),t(2,.5),t(7,1),t(5,3)]}}function Hs(e){return{id:"vagil",name:"Зигзаг",syllable:"И-Э-И-А-И-О-И-У",tempo:100,kind:"agility",root:e,grooveStyle:"funk",desc:"Беглость и точность: зигзаг по ступеням вверх и обратно.",how:"Лёгко и быстро веди голос по нотам зигзагом вверх, не зажимаясь. Гласные чёткие.",notes:[0,3,1,5,3,7,5,8,7,3,5,1,0].map(n=>N(e+n,.5))}}function Rs(e){const t=(n,s)=>N(e+n,s);return{id:"vclimb",name:"Качели на квинте",syllable:"И-Э-А-О-У",tempo:92,kind:"jump",root:e,grooveStyle:"soft",desc:"Гибкость и точность интервала: скачки на квинту вверх и зеркально вниз.",how:"Чисто бери скачок на квинту (без зажима), пробежку пой ровно. Вторая половина — то же зеркально вниз. Опора дыханием.",notes:[t(0,.5),t(7,.5),t(0,.5),t(7,.5),t(0,.5),t(7,.5),t(0,.5),t(7,.5),t(0,.5),t(7,.5),t(0,.25),t(2,.25),t(4,.25),t(5,.25),t(7,2),t(7,.5),t(0,.5),t(7,.5),t(0,.5),t(7,.5),t(0,.5),t(7,.5),t(0,.5),t(7,.5),t(0,.5),t(7,.25),t(5,.25),t(4,.25),t(2,.25),t(0,2)]}}function Ps(e){const t=(n,s,a=0)=>N(e+n,s,a);return{id:"jcharles",name:"Волна гласных",syllable:"И-Э-А-О-У",tempo:130,kind:"agility",root:e,grooveStyle:"swing",desc:"Гибкость и позиция гласных: повторяющийся мотив, затем плавный спуск.",how:"Лёгко веди гласные по мотиву, в конце мягко спустись. Без зажима, позиция единая.",notes:[t(0,.5),t(2,.5),t(5,.5,.5),t(0,.5),t(2,.5),t(5,.5,.5),t(0,.5),t(2,.5),t(5,.5),t(8,1),t(7,.5),t(5,.5),t(2,.5),t(0,.5),t(2,.5),t(5,.5,.5),t(0,.5),t(2,.5),t(5,.5),t(8,1),t(7,1.5)]}}function _s(e,t="ionian"){const n=Et([1,2,3,2,1],t);return{id:"vowels",name:"Цепочка гласных",syllable:"Ми-Ме-Ма",tempo:90,kind:"scale",root:e,modeKey:t,grooveStyle:"swing",desc:"Выравнивание гласных и сохранение позиции при смене звука.",how:"Пой по кругу гласные «Ми-Ме-Ма-Мо», широко раскрывая рот, держи единую позицию.",notes:n.map(s=>N(e+s,1))}}function qs(e,t="ionian"){const n=Et([1,1,3,2,1,1,-2,-2,1,1,3,2,1],t);return{id:"jump5",name:"Скачок к V ступени",syllable:"Ям",tempo:100,kind:"jump",root:e,modeKey:t,grooveStyle:"latin",desc:"Точная атака интервала: скачок на квинту вниз к нижней доминанте и обратно.",how:"Пой на «Ям». Перед скачком на квинту вниз не зажимайся — целься точно в нижнюю ноту.",notes:n.map(s=>N(e+s,1))}}function Ds(e,t="ionian"){const s=Et([1,2,3,4,5,6,7,8,8,7,6,5,4,3,2,1],t);return{id:"lad",name:"Ладовая «ЯМ»",syllable:"Ям",tempo:100,kind:"scale",root:e,modeKey:t,drone:!0,grooveStyle:"march",desc:"Слух и ощущение ладовой окраски — гамма лада вверх и вниз.",how:"Пой на «Ям» по ступеням лада вверх до октавы и обратно. Слушай окраску лада.",notes:s.map(a=>N(e+a,1))}}function Fs(e,t=8){return{id:"sustain",name:"Удержание ноты",syllable:"А",tempo:70,kind:"sustain",root:e,grooveStyle:"ballad",desc:"Учит держать ровный стабильный звук и дыхательную опору — основа пения.",how:"Слушай образец, потом тяни ноту на «А» как можно ровнее. Держи шарик в зелёной зоне без дрожи.",notes:[N(e,t)]}}function Ns(e){return{id:"vibrato",name:"Вибрато",syllable:"А",tempo:60,kind:"vibrato",root:e,grooveStyle:"ballad",greenCents:55,yellowCents:95,desc:"Ровное вибрато — мягкое «качание» высоты примерно 5–6 раз в секунду.",how:"Сначала тяни ровную «А». Когда звук устойчив — добавь лёгкую «волну» голосом, 5–6 колебаний в секунду. Колебание идёт от дыхания и опоры, не дави горлом. На итоге увидишь частоту своего вибрато.",notes:[N(e,10)]}}function zs(e){return{id:"vwobble",name:"Раскачка вибрато",syllable:"А",tempo:120,kind:"vibrato",root:e,grooveStyle:"soft",greenCents:55,desc:"Запуск вибрато: ровный звук с лёгким «качанием» высоты — основа естественного вибрато.",how:"Пой «А» и добавь мягкое колебание голосом — вверх-вниз небольшими шагами. Колебание идёт от опоры дыхания, не дави горлом.",notes:[0,1,0,1,0,1,0,5,6,5,6,5,6,5].map(n=>N(e+n,.5))}}function Os(e){const t=(n,s,a=0)=>N(e+n,s,a);return{id:"timbre",name:"Тёплый тон",syllable:"Мо",tempo:96,kind:"scale",root:e,grooveStyle:"ballad",desc:"Качество тембра: ровный, округлый звук при движении голоса по нотам.",how:"Пой «Мо» округло и тепло, держи одинаковый тембр на каждой ноте. Не зажимай, звук в маску.",notes:[t(0,.5),t(2,.5),t(4,1),t(0,.5),t(2,.5),t(4,.5),t(2,.5),t(0,.5,.5),t(0,.5),t(2,.5),t(4,.5),t(5,.5),t(7,.5),t(5,.5),t(4,.5),t(2,.5),t(7,.5),t(5,.5),t(4,.5),t(2,.5),t(7,.5),t(5,.5),t(4,.5),t(2,.5),t(0,1),t(7,1),t(0,1)]}}function Vs(e){const t=(n,s)=>N(e+n,s);return{id:"timbre2",name:"Ровный тон на двух",syllable:"А",tempo:72,kind:"sustain",root:e,grooveStyle:"ballad",desc:"Единый тембр при переходе между двумя высотами (вниз на кварту и обратно).",how:"Держи одинаковый округлый звук на обеих нотах — не «бели» нижнюю и не зажимай верхнюю.",notes:[t(0,2),t(-5,2),t(0,2),t(-5,2),t(0,4)]}}function js(e){const t=(n,s)=>N(e+n,s);return{id:"regarp",name:"Через регистры",syllable:"Но",tempo:92,kind:"jump",root:e,grooveStyle:"soft",desc:"Плавный переход (passaggio): с тоники всё выше — кварта, квинта, октава.",how:"Пой «Но», возвращаясь к тонике и беря всё выше (кварта → квинта → октава). Без «слома» на переходе — мягко.",notes:[t(0,1),t(5,3),t(0,1),t(7,3),t(0,1),t(12,3),t(0,4)]}}function Gs(e){const t=(n,s)=>N(e+n,s);return{id:"regoct",name:"Октавная связка",syllable:"А",tempo:84,kind:"jump",root:e,grooveStyle:"soft",desc:"Связка регистров на октаве — без резкого «переключения» голоса.",how:"Спокойно прыгай на октаву вверх и возвращайся на долгую тонику. Верх не криком, а на опоре и резонансе.",notes:Array.from({length:4}).flatMap(()=>[t(0,2),t(12,2),t(0,4)])}}function Ws(e){const t=(n,s)=>N(e+n,s);return{id:"belt",name:"Белтинг — гамма",syllable:"Эй",tempo:112,kind:"scale",root:e,grooveStyle:"drive",desc:"Яркая опёртая подача (белтинг) на пятинотной гамме — мощно, но без зажима.",how:"Пой «Эй» ярко и звонко, опираясь дыханием. Звук вперёд (в маску), горло свободно. Не дави на верхних нотах.",notes:[t(0,.5),t(2,.5),t(4,.5),t(5,.5),t(7,1),t(5,.5),t(4,.5),t(2,.5),t(0,2)]}}function Us(e){const t=(n,s)=>N(e+n,s);return{id:"beltoct",name:"Белт-арпеджио",syllable:"Эй",tempo:100,kind:"jump",root:e,grooveStyle:"drive",desc:"Опёртая атака верха через арпеджио до октавы — энергично и безопасно.",how:"Поднимайся по арпеджио ярко и точно, на опоре. Верхнюю ноту не тяни горлом — звук на дыхании и в резонаторах.",notes:[t(0,.5),t(4,.5),t(7,.5),t(12,2),t(7,.5),t(4,.5),t(0,2)]}}function Ys(e){return{id:"artic",name:"Стаккато-арпеджио",syllable:"Та",tempo:126,kind:"agility",root:e,grooveStyle:"funk",desc:"Чёткая артикуляция и точная атака: арпеджио отрывистыми ясными слогами.",how:"Пой «Та-Та-Та» коротко и чётко по арпеджио вверх-вниз, с паузой после каждого слога. Согласная ясная, звук не «расползается».",notes:[0,4,7,4,0,0,4,7,4,0].map(n=>N(e+n,.5,.5))}}function Xs(e){return{id:"artic2",name:"Слоги по группам",syllable:"Та-Ка",tempo:120,kind:"agility",root:e,grooveStyle:"funk",desc:"Дикция в движении: чёткие слоги группами по соседним ступеням.",how:"Пой «Та-Ка-Та-Ка-Та» по нотам вверх-вниз, между группами — короткая пауза на вдох. Каждый слог ясный, ритм ровный.",notes:[0,2,4,2,0,0,2,4,2,0].map((n,s)=>N(e+n,.5,s%5===4?.5:0))}}function Ks(e){return{id:"resist",name:"Фигура-волчок",syllable:"Ма",tempo:116,kind:"agility",root:e,grooveStyle:"march",desc:"Выносливость и ровность: устойчивый мотив-«волчок» много раз без потери опоры.",how:"Пой «Ма» по фигуре вверх-вниз ровно и не уставая. Дыхание ровное, опора держится до конца.",notes:[0,1,3,1,0,1,3,1,0,1,3,1,0].map(n=>N(e+n,.5))}}function Js(e){const t=(s,a,o=0)=>N(e+s,a,o),n=[0,2,4,5,7,5,4,2];return{id:"resist2",name:"Выносливая гамма",syllable:"Ма",tempo:92,kind:"agility",root:e,grooveStyle:"march",desc:"Дыхательная выносливость: длинный ровный пробег по гамме без добора воздуха.",how:"Пой «Ма» шестнадцатыми ровно и точно на одном дыхании; в конце — взлёт к октаве и долгая тоника. Распредели воздух до конца.",notes:[...n.map(s=>t(s,.25)),...n.map(s=>t(s,.25)),t(0,.25),t(2,.25),t(4,.25),t(5,.25),t(7,1.25),t(5,.25),t(4,.25),t(2,.25),t(0,1),t(0,.5),t(4,.5),t(0,.5),t(7,.5),t(0,.5),t(12,1.5),t(0,3,1)]}}function Qs(e,t="ionian"){const n=Et([1,2,3,4,5,4,3,2,1],t);return{id:"scale5",name:"Гамма «Ма-Мэ»",syllable:"Ма",tempo:104,kind:"scale",root:e,modeKey:t,grooveStyle:"pop",desc:"Тренирует точность интонации — чистое попадание в каждую ступень гаммы.",how:"Пой «Ма» и попадай в каждую ноту, которая подъезжает к линии. Старайся держать зелёный.",notes:n.map(s=>N(e+s,1))}}function Zs(e,t="ionian"){const n=Et([1,2,3,4,5,6,5,4,3,2,1],t);return{id:"agility",name:"Беглость «Ма»",syllable:"Ма",tempo:138,kind:"agility",root:e,modeKey:t,grooveStyle:"funk",desc:"Развивает беглость: быстрые и точные переходы между нотами (как в Vocalista).",how:"Пой «Ма» легко и быстро, попадая в каждую ноту пробегающего пассажа. Не зажимайся.",notes:n.map(s=>N(e+s,.5))}}function ta(e){return{id:"jump",name:"Октавный скачок",syllable:"А",tempo:84,kind:"jump",root:e,grooveStyle:"drive",desc:"Учит координации между нижним и верхним регистром голоса.",how:"Пой «А», точно прыгая на октаву вверх и обратно вниз. Целься в центр ноты.",notes:[N(e,2),N(e+12,2),N(e,2),N(e+12,2)]}}function mn(e,t="ionian"){const n=Et([1,2,3,2,1],t);return{id:"hum3",name:"Мычание по гамме",syllable:"М",tempo:92,kind:"hum",root:e,modeKey:t,grooveStyle:"soft",desc:"Мягкая активация голоса и резонаторов на «м-м-м» — три ступеньки вверх и обратно.",how:"Сомкни губы и мычи «м», идя по нотам: вверх три ступени и вниз. Звук в маску/нос.",notes:n.map(s=>N(e+s,1))}}function pn(e,t="ionian"){const n=Et([1,2,3,4,5,4,3,2,1,5,1],t);return{id:"trill",name:"Губной тренаж «brrr»",syllable:"brrr",tempo:120,kind:"trill",root:e,modeKey:t,grooveStyle:"drive",desc:"Ровный воздушный поток и гибкость: пять ступеней вверх-вниз и скачок на квинту.",how:"Губами «brrr» (если не выходит — на «Р»). Веди по нотам ровно, в конце — скачок на квинту и тонику.",notes:n.map(s=>N(e+s,.75))}}function vn(e,t,n,s=4){const a=e.notes.map(h=>h.midi),o=Math.min(...a),i=Math.max(...a);if(!Number.isFinite(t)||!Number.isFinite(n))return[0];const c=Math.max(0,Math.min(s,n-i)),l=Math.max(0,Math.min(s,o-t)),r=[];for(let h=0;h<=c;h++)r.push(h);for(let h=c-1;h>=-l;h--)r.push(h);return r.length?r:[0]}const st=(e,t)=>({s:e,b:t});function se(e,t){const n=[];for(let s=0;s<t;s++)n.push(...e.map(a=>({...a})));return n}const Vt={air1:{id:"air1",name:"Дыхание: длинные с / ш",kind:"rhythm",tempo:70,desc:"Ровный длинный выдох на «с» и «ш» под метроном — опора и расход воздуха.",how:"«с-с-с» тянем на 4 клика → вдох носом → «ш-ш-ш» на 4 клика → вдох носом. Выдох ровный, без толчков.",steps:se([st("с",4),st("вдох",2),st("ш",4),st("вдох",2)],4)},air2:{id:"air2",name:"Дыхание: короткий с + 5 ш",kind:"rhythm",tempo:80,desc:"Короткий толчок «с» и серия «ш» — активный выдох и чувство ритма.",how:"Короткий «с», пауза, затем 5 коротких «ш». Между «с» и «ш» НЕ дышим; вдох носом — после серии.",steps:se([st("с",.5),st("rest",.5),st("ш",.5),st("ш",.5),st("ш",.5),st("ш",.5),st("ш",.5),st("вдох",2)],6)},air3:{id:"air3",name:"Артикуляция: 15 с + 15 ш",kind:"rhythm",tempo:80,desc:"Чёткие короткие «с» и «ш» в ровном пульсе — артикуляция и дыхание.",how:"15 коротких «с» → вдох носом → 15 коротких «ш». Держи ровный пульс с метрономом.",steps:[...se([st("с",.5)],15),st("вдох",2),...se([st("ш",.5)],15)]}},Li={с:"С-с-с",ш:"Ш-ш-ш",вдох:"Вдох носом",rest:"·"},jn=[0,4,7,9,12,9,7,4];function ea(e,t,n,s,{onExit:a,onComplete:o,skipExplain:i}={}){let c=null,l=!1,r=[];const h=[];function m(){r.forEach(g=>g&&g.stop&&g.stop()),r=[]}function u(){c&&(cancelAnimationFrame(c),c=null),h.forEach(clearTimeout),h.length=0,m(),document.removeEventListener("visibilitychange",d)}function d(){document.hidden?(c&&(cancelAnimationFrame(c),c=null),m(),l=!0):l&&(l=!1,v())}function v(){u(),e.innerHTML=`
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
    `,document.getElementById("back").addEventListener("click",()=>{u(),a()}),document.getElementById("go").addEventListener("click",p)}function p(){document.addEventListener("visibilitychange",d);const g=60/s.tempo;let E=0;const x=s.steps.map(I=>{const _={...I,start:E,end:E+I.b};return E+=I.b,_}),A=E,P=A*g;e.innerHTML=`
      <div class="screen breathe">
        <div class="game-top">
          <button class="icon-btn" id="quit">‹ Прервать</button>
          <button class="icon-btn" id="padtgl">♪ подложка ${Pe()?"вкл":"выкл"}</button>
        </div>
        <div class="rhythm-stage">
          <div class="rhythm-beat" id="beat"></div>
          <div class="rhythm-label" id="lbl">Приготовься…</div>
        </div>
        <div class="bar"><i id="prog"></i></div>
      </div>
    `,document.getElementById("quit").addEventListener("click",()=>{u(),a()});const b=document.getElementById("lbl"),L=document.getElementById("beat"),w=document.getElementById("prog");if(Pe())for(let I=0;I<Math.ceil(A);I++){const _=n+jn[I%jn.length],D=440*Math.pow(2,(_-69)/12);r.push(vt(t.ctx,D,g*.9,I*g,.07,"soft"))}const y=document.getElementById("padtgl");y&&y.addEventListener("click",()=>{const I=!Pe();Wa(I),I||m(),y.textContent=I?"♪ подложка вкл":"♪ подложка выкл"});const k=performance.now();let T=-1,C=!1;function R(){const I=(performance.now()-k)/1e3,_=I/g,D=Math.floor(_);D>T&&D<Math.ceil(A)&&(T=D,re(t.ctx,0,D%4===0),L.classList.remove("pulse"),L.offsetWidth,L.classList.add("pulse"));const S=x.find(H=>_>=H.start&&_<H.end);S&&(b.textContent=Li[S.s]||"",b.style.color=S.s==="вдох"?"var(--gold)":S.s==="rest"?"var(--text-dim)":"var(--accent-2)"),w.style.width=Math.min(100,I/P*100)+"%",I<P?c=requestAnimationFrame(R):C||(C=!0,f())}c=requestAnimationFrame(R)}function f(){if(u(),o){o({pct:null,rhythm:!0});return}e.innerHTML=`
      <div class="screen summary">
        <div class="stars">🫁</div>
        <div class="verdict">Готово!</div>
        <p class="hint">Дыхание и артикуляция размяты. Голос готов к распевке.</p>
        <div class="row">
          <button class="btn btn-ghost" id="menu">Меню</button>
          <button class="btn btn-primary" id="again">Ещё раз</button>
        </div>
      </div>
    `,document.getElementById("menu").addEventListener("click",a),document.getElementById("again").addEventListener("click",v)}i?p():v()}const he=[{key:"bass",name:"Бас",group:"муж",low:40,high:64,center:48,blurb:"Самый низкий мужской голос, глубокий и плотный."},{key:"baritone",name:"Баритон",group:"муж",low:43,high:67,center:52,blurb:"Средний мужской голос — самый распространённый."},{key:"tenor",name:"Тенор",group:"муж",low:48,high:72,center:57,blurb:"Высокий мужской голос, яркий и звонкий."},{key:"contralto",name:"Контральто",group:"жен",low:53,high:77,center:60,blurb:"Низкий женский голос, тёплый и насыщенный."},{key:"mezzo",name:"Меццо-сопрано",group:"жен",low:57,high:81,center:64,blurb:"Средний женский голос — самый частый у женщин."},{key:"soprano",name:"Сопрано",group:"жен",low:60,high:84,center:67,blurb:"Высокий женский голос, светлый и парящий."}];function ft(e){return he.find(t=>t.key===e)||null}function rt(e){return as(Math.round(e))||""}function Gn(e){return`${rt(e.low)}–${rt(e.high)}`}function Si(e,t){const n=(e+t)/2;let s=he[0],a=1/0;for(const o of he){const i=(o.low+o.high)/2,c=.6*Math.abs(e-o.low)+.4*Math.abs(n-i);c<a&&(a=c,s=o)}return s}function Ti(e,t,n,{onExit:s}){const a=it(),o=a&&ft(a.key),i=o?o.center:60,c=a&&a.low!=null&&a.high!=null?{low:a.low,high:a.high}:o?{low:o.low,high:o.high}:{low:48,high:72},l=[{title:"Дыхание: длинные с / ш",tip:"Ровный длинный выдох в такт.",rhythm:Vt.air1},{title:"Дыхание: короткий с + 5 ш",tip:"Активный выдох, вдох носом после серии.",rhythm:Vt.air2},{title:"Артикуляция: 15 с + 15 ш",tip:"Чётко и ровно с метрономом.",rhythm:Vt.air3},{title:"Мычание по гамме «М»",tip:"Мягко, в маску. Сначала прозвучит тоника.",ex:mn(i)},{title:"Губной тренаж «brrr»",tip:"Губами «brrr» или на «Р», ровно.",ex:pn(i)}];let r=0;const h=[];function m(){if(r>=l.length)return d();const v=l[r];u(v,r,()=>{const p=f=>{h.push(f),r+=1,m()};if(v.rhythm)ea(e,t,i,v.rhythm,{onExit:s,onComplete:p,skipExplain:!0});else{const f=vn(v.ex,c.low,c.high,2);ut(e,t,n,v.ex,{onExit:s,onComplete:p,reps:f})}})}function u(v,p,f){e.innerHTML=`
      <div class="screen interstitial">
        <div class="game-top"><button class="icon-btn" id="quit">‹ Прервать</button></div>
        <div class="step-count">Упражнение ${p+1} из ${l.length}</div>
        <div class="brand"><h1>${v.title}</h1><p>${v.tip}</p></div>
        ${v.rhythm?`<div class="card"><p class="how"><b>Как.</b> ${v.rhythm.how}</p></div>`:""}
        <div class="progress-dots">
          ${l.map((g,E)=>`<span class="dot ${E<p?"done":E===p?"now":""}"></span>`).join("")}
        </div>
        <button class="btn btn-primary" id="go" style="width:100%">Начать</button>
      </div>
    `,document.getElementById("go").addEventListener("click",f),document.getElementById("quit").addEventListener("click",s)}function d(){const v=h.filter(k=>k&&typeof k.pct=="number"),p=v.length?v.reduce((k,T)=>k+T.pct,0)/v.length:1,f=p>=.85?3:p>=.6?2:p>=.35?1:0,{streak:g,freezeSpent:E}=ms({pct:p,stars:f});Kt("session_done",{pct:Math.round(p*100),stars:f}),ai();const x=U().level,A=Ut({kind:"session"}),P=U().level,b=Yt(Xt());Ct(2),At(30),P>x&&mt(`Новый уровень: ${U().title}`,{icon:"🏆",type:"level"}),b.forEach(k=>mt(`Награда: ${k.title}`,{icon:k.icon,type:"achievement"}));const L="★".repeat(f)+"☆".repeat(3-f),w=Math.round(p*100),y=U();e.innerHTML=`
      <div class="screen summary">
        <div class="stars">${L}</div>
        <div class="verdict">Распевка завершена!</div>
        <div class="big-pct">${w}<span>%</span></div>
        <p class="hint">средняя точность по ${v.length} ${v.length===1?"распевке":"распевкам"} с нотами</p>
        <div class="streak-badge">🔥 Стрик: ${g} ${g===1?"день":"дн."}${E?" · ❄ заморозка спасла стрик":""}</div>
        <div class="xp-summary-row">
          <span class="xp-gained">+${A.added} XP</span>
          <span class="xp-level-label">${y.title} · ур. ${y.level}</span>
          <div class="xp-bar-wrap"><div class="xp-bar-fill" style="width:${y.pct}%"></div></div>
          ${y.nextMin?`<span class="xp-bar-hint">до след. уровня ${y.nextMin-y.curMin-y.into} XP</span>`:'<span class="xp-bar-hint">Максимальный уровень!</span>'}
        </div>
        <button class="btn btn-primary" id="menu" style="width:100%">В меню</button>
      </div>
    `,document.getElementById("menu").addEventListener("click",s)}m()}function hn(e,t,n,{onDone:s,onExit:a,canSkip:o=!1}){let i=null;const c=()=>{i&&cancelAnimationFrame(i),i=null};function l(){c(),n.reset();const u=it(),d=u&&ft(u.key);let v=d?d.group:"муж";e.innerHTML=`
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
    `,document.getElementById("back").addEventListener("click",a),document.getElementById("detect").addEventListener("click",r);function p(){const f=it();document.getElementById("voiceCards").innerHTML=he.filter(g=>g.group===v).map(g=>`
          <button class="list-item voice-card" data-pick="${g.key}">
            <span class="li-main">${g.name}${f&&f.key===g.key?" ·  выбран":""}</span>
            <span class="li-sub">${g.group==="муж"?"мужской":"женский"} · ${Gn(g)}</span>
          </button>`).join(""),document.querySelectorAll("[data-pick]").forEach(g=>g.addEventListener("click",()=>{Rn(g.dataset.pick),s(it())}))}document.querySelectorAll("[data-gender]").forEach(f=>f.addEventListener("click",()=>{v=f.dataset.gender,document.querySelectorAll("[data-gender]").forEach(g=>g.classList.toggle("on",g.dataset.gender===v)),p()})),p()}function r(){c(),e.innerHTML=`
      <div class="screen breathe-intro">
        <div class="game-top"><button class="icon-btn" id="back">‹ Назад</button></div>
        <div class="brand"><h1>Определим голос</h1></div>
        <div class="card">
          <p class="blurb">Сначала споёшь свою самую низкую удобную ноту, потом — самую высокую (без напряжения!). По диапазону подскажу твой тембр.</p>
          <p class="how mech"><b>Как.</b> Пой ровно и держи ноту — когда звук станет стабильным, пойдёт отсчёт и я её запишу. Верх <b>не форсируй</b>: бери только то, что берётся легко.</p>
        </div>
        <button class="btn btn-primary" id="go" style="width:100%">Поехали</button>
      </div>
    `,document.getElementById("back").addEventListener("click",l),document.getElementById("go").addEventListener("click",()=>h("low"))}function h(u,d=null){c();const v=u==="low";e.innerHTML=`
      <div class="screen onboard">
        <div class="game-top"><button class="icon-btn" id="back">‹ Назад</button></div>
        <div class="brand"><h1>${v?"Нижняя нота":"Верхняя нота"}</h1>
          <p>${v?"Спой свою <b>самую низкую удобную</b> ноту и тяни ровно.":"Теперь <b>самую высокую</b> — мягко, <b>без напряжения</b>."}</p></div>
        <div class="note-display silent" id="note">—</div>
        <div class="stability"><div class="stability-fill" id="stab"></div></div>
        <p class="hint" id="status">Пой и держи ровно…</p>
        ${d!=null?`<p class="hint">Низ записан: <b>${rt(d)}</b></p>`:""}
      </div>
    `,document.getElementById("back").addEventListener("click",()=>v?r():h("low"));const p=document.getElementById("note"),f=document.getElementById("status"),g=document.getElementById("stab"),E=[],x=24,A=1200;let P=0;function b(k){const T=Math.min(...k),C=Math.max(...k);return 1200*Math.log2(C/T)}function L(k){const T=[...k].sort((C,R)=>C-R);return T[Math.floor(T.length/2)]}n.reset(),n.setRange&&n.setRange(55,1300);function w(){const k=t.read();if(k){const{smoothedHz:T,voiced:C}=n.process(k);if(C&&T){const R=ht(T),I=R.name.match(/^([A-G]#?)(-?\d+)$/);if(p.className="note-display green",p.innerHTML=I?`${I[1]}<span class="oct">${I[2]}</span>`:R.name,E.push(T),E.length>x&&E.shift(),E.length>=x&&b(E)<110){P||(P=performance.now());const D=performance.now()-P;g.style.width=Math.min(100,D/A*100)+"%";const S=Math.ceil((A-D)/1e3);if(f.textContent=D<A?`Держи… ${Math.max(1,S)}`:"Готово!",D>=A)return y(Math.round(ht(L(E)).midi))}else P=0,g.style.width="0%",f.textContent="Держи ровнее…"}else p.className="note-display silent",p.textContent="—",P=0,g.style.width="0%",E.length&&(E.length=0),f.textContent="Пой и держи ровно…"}i=requestAnimationFrame(w)}w();function y(k){if(c(),v)h("high",k);else{let T=d,C=k;C<=T&&(C=T+7),m(T,C)}}}function m(u,d){c();const v=Si(u,d);Rn(v.key,u,d),Ct(2),At(25),e.innerHTML=`
      <div class="screen summary">
        <div class="verdict" style="font-size:18px;color:var(--text-dim)">Похоже, твой голос —</div>
        <div class="voice-result">${v.name}</div>
        <p class="hint">${v.blurb}</p>
        <div class="card" style="text-align:left;width:100%">
          <p class="how"><b>Твой диапазон:</b> ${rt(u)} – ${rt(d)}</p>
          ${Ts(u,d)}
          <p class="how"><b>Обычный диапазон для ${v.name.toLowerCase()}:</b> ${Gn(v)}</p>
          <p class="how mech">Это ориентир по диапазону, а не окончательный вердикт — точный тембр определит педагог. Упражнения подстроятся под тебя.</p>
        </div>
        <div class="row">
          <button class="btn btn-ghost" id="redo">Переопределить</button>
          <button class="btn btn-primary" id="ok">Готово</button>
        </div>
      </div>
    `,document.getElementById("redo").addEventListener("click",r),document.getElementById("ok").addEventListener("click",()=>s(it()))}l()}function Wn(e,t,n,s,a,o){e.beginPath(),e.moveTo(t+o,n),e.arcTo(t+s,n,t+s,n+a,o),e.arcTo(t+s,n+a,t,n+a,o),e.arcTo(t,n+a,t,n,o),e.arcTo(t,n,t+s,n,o),e.closePath()}function Ii({headline:e="Мой прогресс",big:t="",sub:n=""}){const o=document.createElement("canvas");o.width=1080,o.height=1080;const i=o.getContext("2d");return i.fillStyle="#eef2f4",i.fillRect(0,0,1080,1080),i.fillStyle="#ffffff",i.shadowColor="rgba(20,33,55,.18)",i.shadowBlur=60,i.shadowOffsetY=24,Wn(i,90,120,900,780,48),i.fill(),i.shadowColor="transparent",i.shadowBlur=0,i.shadowOffsetY=0,i.fillStyle="#0e8d7f",Wn(i,90,120,900,150,48),i.fill(),i.fillStyle="#0e8d7f",i.fillRect(90,230,900,40),i.fillStyle="#ffffff",i.font="700 46px system-ui, sans-serif",i.textBaseline="middle",i.fillText("Распевка",130,195),i.font="500 30px system-ui, sans-serif",i.fillStyle="rgba(255,255,255,.9)",i.textAlign="right",i.fillText("вокальный тренажёр",950,195),i.textAlign="left",i.fillStyle="#5c6775",i.font="600 40px system-ui, sans-serif",i.fillText(e,150,380),i.fillStyle="#1b2430",i.font="800 150px system-ui, sans-serif",i.fillText(t,146,520),i.fillStyle="#0a766a",i.font="600 44px system-ui, sans-serif",i.fillText(n,150,660),i.fillStyle="#9aa6b2",i.font="500 32px system-ui, sans-serif",i.fillText("a1exxx.github.io/raspevka",150,840),o}async function Un(e){const t=Ii(e),n=await new Promise(i=>t.toBlob(i,"image/png"));if(!n)return;const s=new File([n],"raspevka.png",{type:"image/png"});try{if(navigator.canShare&&navigator.canShare({files:[s]})){await navigator.share({files:[s],title:"Распевка",text:e.sub||"Мой прогресс в Распевке"});return}}catch{}const a=URL.createObjectURL(n),o=document.createElement("a");o.href=a,o.download="raspevka.png",document.body.appendChild(o),o.click(),o.remove(),setTimeout(()=>URL.revokeObjectURL(a),4e3)}function Bi(e){return e.toISOString().slice(0,10)}function Ai(e){if(!e||e.length<2)return"";const t=e.length,n=e.map(d=>d.low),s=e.map(d=>d.high),a=Math.min(...n)-1,o=Math.max(...s)+1,i=Math.max(1,o-a),c=300,l=70,r=5,h=d=>(r+d*(c-2*r)/(t-1)).toFixed(1),m=d=>(r+(1-(d-a)/i)*(l-2*r)).toFixed(1),u=d=>d.map((v,p)=>`${p?"L":"M"}${h(p)} ${m(v)}`).join(" ");return`
    <div class="seg-label" style="margin-top:14px">Рост диапазона</div>
    <svg class="range-tl" viewBox="0 0 ${c} ${l}" preserveAspectRatio="none" role="img" aria-label="График роста диапазона">
      <path d="${u(s)}" class="tl-high"/>
      <path d="${u(n)}" class="tl-low"/>
      <circle cx="${h(t-1)}" cy="${m(s[t-1])}" r="3.5" class="tl-dot-h"/>
      <circle cx="${h(t-1)}" cy="${m(n[t-1])}" r="3.5" class="tl-dot-l"/>
    </svg>`}function Ci(e,{onExit:t}){const n=Aa(),s=Ca(),a=Qt(),o=ps(),i=on(),c=it(),l=c&&ft(c.key),r=new Set(n.map(f=>f.date)),h=[];for(let f=13;f>=0;f--){const g=new Date(Date.now()-f*864e5);h.push(`<span class="cal-dot ${r.has(Bi(g))?"done":""}"></span>`)}const m=n.slice(-12),u=m.length?m.map(f=>{const g=Math.round((f.pct||0)*100);return`<div class="acc-bar ${f.stars>=3?"g":f.stars===2?"a":"c"}" style="height:${Math.max(6,g)}%" title="${g}%"></div>`}).join(""):'<p class="hint">Пройди распевку — здесь появится история точности.</p>';let d="";const v=s.length?s[s.length-1]:c&&c.low!=null?c:null;if(v&&v.low!=null){const f=v.high-v.low;let g="";if(s.length>=2){const E=s[0],x=v.high-v.low-(E.high-E.low);x>0&&(g=` · <span style="color:var(--green)">+${x} пт с начала</span>`)}d=`
      <div class="card" style="text-align:left;width:100%">
        <div class="seg-label">Диапазон голоса</div>
        <p class="how" style="margin-top:6px"><b>${rt(v.low)} – ${rt(v.high)}</b> · ${f} полутонов${g}</p>
        ${Ts(v.low,v.high)}
        ${Ai(s)}
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
        <div class="cal-row">${h.join("")}</div>
      </div>

      <div class="card" style="width:100%">
        <div class="seg-label">Точность последних занятий</div>
        <div class="acc-chart">${u}</div>
      </div>

      ${d}

      <button class="btn btn-primary" id="share" style="width:100%">Поделиться прогрессом</button>
      <button class="btn btn-ghost" id="back2" style="width:100%">В меню</button>
    </div>
  `,document.getElementById("back").addEventListener("click",t),document.getElementById("back2").addEventListener("click",t);const p=document.getElementById("share");p&&p.addEventListener("click",()=>{if(v&&v.low!=null){const f=v.high-v.low;Un({headline:"Мой диапазон",big:`${rt(v.low)}–${rt(v.high)}`,sub:`${f} полутонов${a>0?` · стрик ${a}`:""}`})}else Un({headline:"Мой прогресс",big:`${a}`,sub:"дней подряд в Распевке"})})}const Hi=[0,2,4,5,7,9,11],Yn=e=>Hi.includes((e%12+12)%12);function Xn(e){const t=ht(Y(e));return t?t.name:""}function Ri(e,t,n,{onExit:s,lowMidi:a=41,highMidi:o=81}){let i=null;const c=a-2,l=o+2,r=Y(c),h=Y(l);e.innerHTML=`
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
  `,document.getElementById("back").addEventListener("click",()=>{T(),s()});function m(){const C=sn();document.getElementById("sens").innerHTML=[["low","Низкая"],["med","Средняя"],["high","Высокая"]].map(([R,I])=>`<button data-sens="${R}" class="${C===R?"on":""}">${I}</button>`).join(""),document.querySelectorAll("[data-sens]").forEach(R=>R.addEventListener("click",()=>{ks(R.dataset.sens),t.setSensitivity&&t.setSensitivity(an()),m()}))}m();const u=document.getElementById("note"),d=document.getElementById("cents"),v=document.getElementById("lvl"),p=document.getElementById("fs"),f=p.getContext("2d");function g(){const C=Math.min(window.devicePixelRatio||1,2);p.width=p.clientWidth*C,p.height=p.clientHeight*C,f.setTransform(C,0,0,C,0,0)}g(),window.addEventListener("resize",g);function E(C,R){const I=Math.max(r,Math.min(h,C)),_=Math.log2(I/r)/Math.log2(h/r);return R-_*R}const x=[];n.setRange&&n.setRange(55,1300),n.reset();const A=document.getElementById("cele");let P=null,b=0,L=0,w=null;function y(C){A&&(A.innerHTML=`<svg viewBox="0 0 24 24" fill="currentColor" width="18" height="18"><path d="M12 2l2.4 6.3L21 9l-5 4.1L17.8 20 12 16.3 6.2 20 8 13.1 3 9l6.6-.7z"/></svg> ${C}`,A.hidden=!1,clearTimeout(w),w=setTimeout(()=>{A&&(A.hidden=!0)},3400))}function k(){const C=p.clientWidth,R=p.clientHeight;f.clearRect(0,0,C,R),f.font="10px Inter, sans-serif";for(let H=Math.ceil(c);H<=l;H++){const j=E(Y(H),R),K=(H%12+12)%12===0;f.strokeStyle=K?"rgba(27,36,48,.20)":Yn(H)?"rgba(27,36,48,.08)":"rgba(27,36,48,.03)",f.lineWidth=1,f.beginPath(),f.moveTo(34,j),f.lineTo(C,j),f.stroke(),Yn(H)&&(f.fillStyle=K?"rgba(27,36,48,.55)":"rgba(27,36,48,.32)",f.fillText(Xn(H),4,j+3))}const I=t.read();let _=!1,D=null;if(I){const H=n.process(I);_=H.voiced&&t.rms()>.0025,D=H.smoothedHz}if(_&&D){const H=ht(D),j=(H.name||"").match(/^([A-G]#?)(-?\d+)$/);u.innerHTML=j?`${j[1]}<span class="oct">${j[2]}</span>`:H.name,u.classList.remove("silent"),d.textContent=`центы: ${H.cents>0?"+":""}${H.cents}`,v.style.width=Math.min(100,t.rms()*350)+"%";const K=E(D,R);x.push(K);const dt=Math.round(69+12*Math.log2(D/440));Math.abs(H.cents)<42?(dt===P?b++:(P=dt,b=1),b===26&&Date.now()-L>4e3&&Da(dt).extended&&(L=Date.now(),y(`Новая нота — ${Xn(dt)}! Диапазон растёт.`))):(P=null,b=0)}else u.textContent="—",u.classList.add("silent"),d.textContent="центы: —",v.style.width="0%",x.push(null),P=null,b=0;for(;x.length>90;)x.shift();const S=C-28;for(let H=0;H<x.length;H++){if(x[H]==null)continue;const j=S-(x.length-1-H)*2.4,K=H===x.length-1;f.fillStyle=K?"#2fab84":"rgba(47,171,132,.35)",K&&(f.shadowColor="#2fab84",f.shadowBlur=16),f.beginPath(),f.arc(j,x[H],K?8:2.5,0,Math.PI*2),f.fill(),f.shadowBlur=0}i=requestAnimationFrame(k)}k();function T(){i&&cancelAnimationFrame(i),i=null,window.removeEventListener("resize",g),clearTimeout(w)}}const Pi=""+new URL("belly-breathing-B0wu-xNS.webp",import.meta.url).href;function _i(){return`
    <div class="breathe-diagram">
      <img class="belly-img" src="${Pi}" alt="Дыхание животом: слева спокойный живот (выдох), справа надутый живот (вдох)" />
      <div class="belly-caps"><span>Выдох · живот мягкий</span><span>Вдох · живот надут</span></div>
      <p class="diagram-note">Не стесняйся: на вдохе <b>живот округляется вперёд</b> (как справа на картинке), воздух идёт вниз. Плечи и грудь почти неподвижны — не тянись вверх.</p>
    </div>`}const qi={box:"breath-box",belly:"breath-belly",hiss:"breath-hiss"},na={box:{title:"Дыхание по квадрату",kind:"paced",belly:!0,blurb:"Успокаивает и выравнивает дыхание перед пением. Вдох, задержка, выдох и пауза — все по 4 секунды. Дыши животом, плечи расслаблены.",cycles:4,phases:[{label:"Вдох",sec:4,from:.5,to:1},{label:"Задержка",sec:4,from:1,to:1},{label:"Выдох",sec:4,from:1,to:.5},{label:"Пауза",sec:4,from:.5,to:.5}]},belly:{title:"Дыхание животом",kind:"paced",belly:!0,blurb:"База певческого дыхания: вдох на 4 счёта — живот расширяется, выдох длиннее, на 6 счётов — ровно и плавно. Грудь и плечи неподвижны.",cycles:5,phases:[{label:"Вдох (живот)",sec:4,from:.5,to:1},{label:"Выдох ровно",sec:6,from:1,to:.5}]},hiss:{title:"Долгий выдох «с-с-с»",kind:"exhale",blurb:"Тренирует опору и ровный воздушный поток. Глубоко вдохни животом, затем выдыхай на звук «с-с-с» как можно дольше и РОВНО — без толчков. Я замерю время.",goals:[{sec:8,label:"хорошо"},{sec:15,label:"отлично"},{sec:20,label:"превосходно"}]}};function sa(e,t,n,{onExit:s,onNext:a,nextLabel:o,onDone:i}){const c=na[n];let l=null;function r(){return`
      ${a?`<button class="btn btn-primary" id="next" style="width:100%">${o||"Дальше"} →</button>`:""}
      <div class="row"><button class="btn btn-ghost" id="menu">Меню</button>
      <button class="btn ${a?"btn-ghost":"btn-primary"}" id="again">Ещё раз</button></div>`}function h(f){document.getElementById("menu").addEventListener("click",s),document.getElementById("again").addEventListener("click",f);const g=document.getElementById("next");g&&g.addEventListener("click",a)}function m(){e.innerHTML=`
      <div class="screen breathe-intro">
        <div class="game-top"><button class="icon-btn" id="back">‹ ${a?"Назад":"Меню"}</button></div>
        <div class="brand"><h1>${c.title}</h1></div>
        <div class="card exa-card">
          ${Is(qi[n]||"breath-belly")}
          <p class="exa-tip">${c.blurb}</p>
          ${c.belly?_i():""}
        </div>
        <button class="btn btn-primary" id="go" style="width:100%">Начать упражнение</button>
      </div>
    `,document.getElementById("back").addEventListener("click",s),document.getElementById("go").addEventListener("click",c.kind==="paced"?u:d)}function u(){e.innerHTML=`
      <div class="screen breathe">
        <div class="game-top"><button class="icon-btn" id="quit">‹ Прервать</button></div>
        <div class="breathe-stage">
          <div class="breathe-ring"><div class="breathe-core" id="core"></div></div>
          <div class="breathe-phase" id="phase">Приготовься…</div>
          <div class="breathe-count" id="count"></div>
        </div>
        <div class="breathe-cycles" id="cycles"></div>
      </div>
    `,document.getElementById("quit").addEventListener("click",()=>{p(),s()});const f=document.getElementById("core"),g=document.getElementById("phase"),E=document.getElementById("count"),x=document.getElementById("cycles");c.cycles*c.phases.length;let A=0,P=0,b=performance.now();L();function L(){x.innerHTML=Array.from({length:c.cycles},(k,T)=>`<span class="dot ${T<A?"done":T===A?"now":""}"></span>`).join("")}function w(){const k=c.phases[P],T=(performance.now()-b)/1e3,C=Math.min(1,T/k.sec),R=k.from+(k.to-k.from)*Di(C);if(f.style.transform=`scale(${R})`,g.textContent=k.label,E.textContent=Math.ceil(k.sec-T),T>=k.sec){if(P+=1,P>=c.phases.length&&(P=0,A+=1,L()),A>=c.cycles)return y();b=performance.now()}l=requestAnimationFrame(w)}l=requestAnimationFrame(w);function y(){p(),i&&i();const k=U().level,T=Ut({kind:"breathing"}),C=U().level;Yt(Xt()).forEach(I=>mt(`Награда: ${I.title}`,{icon:I.icon,type:"achievement"})),C>k&&mt(`Новый уровень: ${U().title}`,{icon:"🏆",type:"level"});const R=U();e.innerHTML=`
        <div class="screen summary">
          <div class="stars">🫁</div>
          <div class="verdict">Готово!</div>
          <p class="hint">${c.cycles} циклов дыхания пройдено. Голос готов к распевке.</p>
          <div class="xp-summary-row">
            <span class="xp-gained">+${T.added} XP</span>
            <span class="xp-level-label">${R.title} · ур. ${R.level}</span>
            <div class="xp-bar-wrap"><div class="xp-bar-fill" style="width:${R.pct}%"></div></div>
          </div>
          ${r()}
        </div>`,h(u)}}function d(){e.innerHTML=`
      <div class="screen breathe">
        <div class="game-top"><button class="icon-btn" id="quit">‹ Прервать</button></div>
        <div class="breathe-stage">
          <div class="big-timer" id="timer">0.0</div>
          <div class="breathe-phase" id="phase">Вдохни глубоко и тяни «с-с-с»…</div>
        </div>
        <div class="bar"><i id="vol"></i></div>
        ${v()}
      </div>
    `,document.getElementById("quit").addEventListener("click",()=>{p(),s()});const f=document.getElementById("timer"),g=document.getElementById("phase"),E=document.getElementById("vol"),x=.012,A=.6;let P="ready",b=0,L=0;function w(){t.read();const k=t.rms();E.style.width=Math.min(100,k*400)+"%";const T=performance.now();if(P==="ready")k>x&&(P="running",b=T,L=T,g.textContent="Тяни ровно!");else if(P==="running"&&(k>x&&(L=T),f.textContent=((T-b)/1e3).toFixed(1),T-L>A*1e3))return y((L-b)/1e3);l=requestAnimationFrame(w)}l=requestAnimationFrame(w);function y(k){p(),i&&i(),k=Math.max(0,Math.round(k*10)/10);const T=Xa(k),C=[...c.goals].reverse().find(H=>k>=H.sec),R=C?C.label[0].toUpperCase()+C.label.slice(1)+"!":"Попробуй ещё",I=U().level,_=Ut({kind:"breathing"}),D=U().level;Yt(Xt()).forEach(H=>mt(`Награда: ${H.title}`,{icon:H.icon,type:"achievement"})),D>I&&mt(`Новый уровень: ${U().title}`,{icon:"🏆",type:"level"});const S=U();e.innerHTML=`
        <div class="screen summary">
          <div class="big-pct">${k.toFixed(1)}<span>сек</span></div>
          <div class="verdict">${R}</div>
          <p class="hint">ровный выдох на «с-с-с» · твой рекорд: <b>${T.toFixed(1)} сек</b></p>
          <div class="xp-summary-row">
            <span class="xp-gained">+${_.added} XP</span>
            <span class="xp-level-label">${S.title} · ур. ${S.level}</span>
            <div class="xp-bar-wrap"><div class="xp-bar-fill" style="width:${S.pct}%"></div></div>
          </div>
          ${r()}
        </div>`,h(d)}}function v(){const f=on();return f?`<p class="hint">Твой рекорд: <b>${f.toFixed(1)} сек</b></p>`:'<p class="hint">Замерим твой ровный выдох.</p>'}function p(){l&&cancelAnimationFrame(l),l=null}m()}function Di(e){return e<.5?2*e*e:1-Math.pow(-2*e+2,2)/2}const Dt=[{t:"Опора дыхания",b:"Вдох — живот мягко наполняется (плечи не поднимаются). На выдохе живот плавно поджимается и «держит» звук ровным. Это фундамент: без опоры голос дрожит и быстро устаёт."},{t:"Звук «в маску»",b:"Направляй звук в область носа и скул — голос начинает звенеть, а не «застревать» в горле. Поймать ощущение помогает мычание «м-м-м»."},{t:"Зевок в горле",b:"Лёгкое ощущение начала зевка освобождает гортань и расширяет пространство во рту. Звук становится объёмнее и свободнее, уходит зажим."},{t:"Не дави на верх",b:"Высокие ноты берутся не силой, а лёгкостью и опорой. Давишь — связки зажимаются и можно сорвать голос. Расширение диапазона — это недели, не один день."},{t:"Мягкая атака",b:"Начинай ноту мягко, без толчка горлом. Представь, что звук «вытекает», а не «выстреливает». Это бережёт связки и звучит красивее."},{t:"Округляй гласные",b:"Пой гласные округло, будто внутри звучит «о». Это выравнивает тембр по всему диапазону и убирает резкость и «плоскость»."},{t:"Губной тренаж «бррр»",b:"Вибрация губами снимает зажим и выравнивает поток воздуха. Лучшая разминка перед пением — и проверка, что дыхание ровное."},{t:"Береги голос",b:"Связки любят воду и отдых. Не пой на больном горле, делай паузы, не больше 20–30 минут подряд. Боль — всегда сигнал «стоп»."}];function Fi(e,{onExit:t}){let n=0;function s(){const a=Dt[n],o=Dt.map((i,c)=>`<span class="dot ${c===n?"now":c<n?"done":""}"></span>`).join("");e.innerHTML=`
      <div class="screen">
        <div class="game-top"><button class="icon-btn" id="back">‹ Меню</button></div>
        <div class="brand"><h1>Теория голоса</h1><p>Короткие уроки — по одному в день достаточно.</p></div>
        <div class="card theory-card">
          <div class="th-num">${n+1} / ${Dt.length}</div>
          <h3 class="th-title">${a.t}</h3>
          <p class="th-body">${a.b}</p>
        </div>
        <div class="progress-dots">${o}</div>
        <div class="row">
          <button class="btn btn-ghost" id="prev" ${n===0?"disabled":""}>Назад</button>
          <button class="btn btn-primary" id="next">${n===Dt.length-1?"Готово":"Далее"}</button>
        </div>
      </div>`,document.getElementById("back").addEventListener("click",t),document.getElementById("prev").addEventListener("click",()=>{n>0&&(n--,s())}),document.getElementById("next").addEventListener("click",()=>{n<Dt.length-1?(n++,s()):t()})}s()}const Ni=[0,2,4,5,7,9,12],zi=e=>e[Math.floor(Math.random()*e.length)];function Oi(e){const t=ht(Y(e));return t?t.name:""}function aa(e,t,n,{onExit:s,root:a=60}){let i=0,c=0,l=null,r="idle",h=a,m=0,u=null;const d=$t?$t():"piano";e.innerHTML=`
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
    </div>`;const v=document.getElementById("status"),p=document.getElementById("bigq"),f=document.getElementById("cue"),g=document.getElementById("lvl"),E=document.getElementById("score");document.getElementById("back").addEventListener("click",()=>{k(),s()}),document.getElementById("replay").addEventListener("click",x),document.getElementById("skip").addEventListener("click",()=>{P("Пропущено"),L(1300)}),n.setRange&&n.setRange(55,1300),n.reset();function x(){t.ctx&&vt(t.ctx,Y(h),1.3,0,.3,d),f.textContent="Слушай…",r="wait",clearTimeout(u),u=setTimeout(()=>{r="sing",f.textContent="Теперь спой эту ноту"},1350)}function A(){i++,h=a+zi(Ni),m=0,p.textContent="?",p.classList.add("silent"),v.textContent=`Раунд ${i} / 8`,x()}function P(T){p.textContent=Oi(h),p.classList.remove("silent"),T&&(f.textContent=T),r="done"}function b(){c++,E.textContent=`Верно: ${c} / 8`,P("Верно! Бра-во."),p.classList.add("hit"),L(1300)}function L(T){clearTimeout(u),u=setTimeout(()=>{p.classList.remove("hit"),i>=8?w():A()},T)}function w(){k(),e.innerHTML=`
      <div class="screen summary">
        <div class="brand"><h1>Слух</h1></div>
        <div class="big-pct">${c}<span>/8</span></div>
        <p class="verdict">${c>=7?"Отличный слух!":c>=4?"Хорошо, продолжай!":"Слух тренируется — ещё раз!"}</p>
        <div class="row" style="max-width:360px">
          <button class="btn btn-ghost" id="again">Ещё раз</button>
          <button class="btn btn-primary" id="menu">В меню</button>
        </div>
      </div>`,document.getElementById("again").addEventListener("click",()=>aa(e,t,n,{onExit:s,root:a})),document.getElementById("menu").addEventListener("click",s)}function y(){const T=t.read();let C=!1,R=null;if(T){const I=n.process(T);C=I.voiced&&t.rms()>.0025,R=I.smoothedHz}if(g.style.width=(C?Math.min(100,t.rms()*350):0)+"%",r==="sing"&&C&&R){const I=Math.abs(Gt(R,Y(h)));I<45?m++:m=Math.max(0,m-2),f.textContent=I<45?"Держи…":R<Y(h)?"↑ выше":"↓ ниже",m>=22&&b()}l=requestAnimationFrame(y)}function k(){l&&cancelAnimationFrame(l),l=null,clearTimeout(u)}A(),y()}function Lt(e,t,n,s){return{id:e,name:t,tempo:n,syllable:"Ля",make(a){return{id:e,name:t,syllable:"Ля",tempo:n,kind:"song",root:a,desc:"Простая мелодия — веди голос по нотам и попадай в каждую.",how:"Пой на «ля», спокойно следуя за нотами. Это не упражнение, а маленькая песня.",notes:s.map(([o,i])=>({midi:a+o,beats:i}))}}}}const ia=[Lt("s1","Лесенка",96,[[0,1],[2,1],[4,1],[5,1],[7,2],[5,1],[4,1],[2,1],[0,2]]),Lt("s2","Колыбельная",76,[[7,1],[5,1],[4,2],[5,1],[4,1],[2,2],[0,1],[2,1],[4,1],[2,1],[0,3]]),Lt("s3","Прогулка",104,[[0,1],[0,1],[4,1],[4,1],[7,1],[5,1],[4,2],[2,1],[2,1],[5,1],[4,1],[2,1],[0,2]]),Lt("s4","Ручеёк",112,[[0,.5],[2,.5],[4,.5],[5,.5],[7,1],[9,1],[7,1],[5,1],[4,.5],[2,.5],[0,2]]),Lt("s5","Колокол",88,[[4,1],[7,1],[9,2],[7,1],[4,1],[5,2],[2,1],[4,1],[0,3]]),Lt("s6","Закат",80,[[12,2],[9,1],[7,1],[5,2],[4,1],[2,1],[0,3]])],Vi=e=>e.make(60).notes.map(t=>t.midi);function ji(){return'<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2"><rect x="5" y="11" width="14" height="9" rx="2"/><path d="M8 11V8a4 4 0 0 1 8 0v3"/></svg>'}const Kn={free:"Free",standard:"Standard",pro:"Pro"};function Gi(e,{onExit:t}){function n(){const s=Tt(),a=Z(),o=["free","standard","pro"].map(c=>`<button data-tier="${c}" class="${s===c?"on":""}">${Kn[c]}</button>`).join(""),i=ve.map(c=>{const l=Ss(c.key,s),r=c.key===a;return`
        <button class="mode-item ${l?"":"locked"} ${r?"sel":""}" data-mode="${c.key}" ${l?"":"disabled"}>
          <span class="mode-name">${c.name}${r?" · выбран":""}</span>
          ${l?"":`<span class="mode-lock">${ji()} ${Kn[c.tier]}</span>`}
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
      </div>`,document.getElementById("back").addEventListener("click",t),document.querySelectorAll("[data-tier]").forEach(c=>c.addEventListener("click",()=>{ae(c.dataset.tier),n()})),document.querySelectorAll("[data-mode]:not([disabled])").forEach(c=>c.addEventListener("click",()=>{vs(c.dataset.mode),n()}))}n()}const Ue={hum3:mn,trill:pn,sustain:Fs,scale5:Qs,agility:Zs,jump:ta,vowels:_s,jump5:qs,lad:Ds,vibrato:Ns,vhold:As,vscale:Cs,vagil:Hs,vclimb:Rs,jcharles:Ps,vwobble:zs,timbre:Os,timbre2:Vs,regarp:js,regoct:Gs,belt:Ws,beltoct:Us,artic:Ys,artic2:Xs,resist:Ks,resist2:Js},V=(e,t)=>({t:"ex",id:e,name:t}),Jn=(e,t)=>({t:"breath",id:e,name:t}),ot=[{id:"b1",title:"Базовый импульс",sub:"Дыхание, опора, мягкая активация",items:[Jn("belly","Дыхание животом"),Jn("hiss","Долгий выдох «с-с-с»"),V("hum3","Мычание по гамме"),V("trill","Губной тренаж «brrr»")],exam:{exId:"hum3",pass:.55}},{id:"b2",title:"Ясность гласных",sub:"Выравнивание гласных и точность",items:[V("vhold","Пять гласных"),V("vscale","Лесенка гласных"),V("jcharles","Волна гласных"),V("vclimb","Качели на квинте"),V("vagil","Зигзаг")],exam:{exId:"vscale",pass:.6}},{id:"b3",title:"Интонация и гибкость",sub:"Гаммы, беглость, скачки",items:[V("scale5","Гамма «Ма-Мэ»"),V("agility","Беглость «Ма»"),V("jump","Октавный скачок")],exam:{exId:"agility",pass:.55}},{id:"b4",title:"Лад и музыкальное мышление",sub:"Лады, атака интервалов",items:[V("lad","Ладовая «ЯМ»"),V("jump5","Скачок к V ступени")],exam:{exId:"lad",pass:.55}},{id:"b5",title:"Вибрато",sub:"Ровный звук и мягкое колебание",items:[V("sustain","Удержание ноты"),V("vwobble","Раскачка вибрато"),V("vibrato","Вибрато")],exam:{exId:"vibrato",pass:.5}},{id:"b6",title:"Тембр и тон",sub:"Округлый, ровный звук",items:[V("timbre","Тёплый тон"),V("timbre2","Ровный тон на двух")],exam:{exId:"timbre",pass:.55}},{id:"b7",title:"Регистры и переходы",sub:"Грудной/головной, passaggio",items:[V("regarp","Через регистры"),V("regoct","Октавная связка")],exam:{exId:"regarp",pass:.5}},{id:"b8",title:"Белтинг",sub:"Яркая опёртая подача верха",items:[V("belt","Белтинг — гамма"),V("beltoct","Белт-арпеджио")],exam:{exId:"belt",pass:.55}},{id:"b9",title:"Артикуляция",sub:"Чёткая дикция и атака",items:[V("artic","Стаккато-арпеджио"),V("artic2","Слоги по группам")],exam:{exId:"artic",pass:.6}},{id:"b10",title:"Сопротивление",sub:"Выносливость и опора",items:[V("resist","Фигура-волчок"),V("resist2","Выносливая гамма")],exam:{exId:"resist2",pass:.5}}];function Wi(e,t){return e<=0?!0:t.includes(ot[e-1].id)}function oa(){return`<div class="teacher-cta">
    <span>Педагог разберёт нюансы быстрее и покажет на твоём голосе.</span>
    <button class="btn btn-ghost" id="toSchool">Записаться на урок</button>
  </div>`}function Ui(e,{blocks:t,examsPassed:n,onExit:s,onOpenBlock:a,onSchool:o}){const i=t.filter(r=>n.includes(r.id)).length,c=t.map((r,h)=>{const m=n.includes(r.id),u=Wi(h,n),d=m?"done":u?"open":"locked",v=m?"✓":u?`${h+1}`:"🔒";return`<button class="block-card ${d}" data-block="${h}" ${u?"":"disabled"}>
        <span class="bc-badge">${v}</span>
        <span class="bc-main"><b>${r.title}</b><span class="bc-sub">${r.sub}</span></span>
        <span class="bc-arrow">${u?"›":""}</span>
      </button>`}).join("");e.innerHTML=`
    <div class="screen catalog">
      <div class="game-top"><button class="icon-btn" id="back">‹ Меню</button></div>
      <div class="brand"><h1>Программа обучения</h1><p>Блоки открываются по мере прохождения. Каждый блок завершается экзаменом.</p></div>
      <div class="prog-wrap"><div class="prog-bar"><i style="width:${Math.round(i/t.length*100)}%"></i></div><span class="prog-txt">${i} / ${t.length} блоков пройдено</span></div>
      <div class="block-list">${c}</div>
      ${oa()}
      <p class="hint">Это самостоятельная практика. Полноценный разбор и постановку голоса даёт педагог.</p>
    </div>
  `,document.getElementById("back").addEventListener("click",s),e.querySelectorAll("[data-block]").forEach(r=>r.addEventListener("click",()=>a(Number(r.dataset.block))));const l=document.getElementById("toSchool");l&&o&&l.addEventListener("click",o)}function Yi(e,{block:t,index:n,examsPassed:s,doneItems:a,onExit:o,onRunItem:i,onExam:c,onSchool:l}){const r=s.includes(t.id),h=t.items.map((d,v)=>{const p=a.includes(d.id),f=d.t==="breath"?'<span class="bi-tag">дыхание</span>':"";return`<button class="block-item" data-item="${v}">
        <span class="bi-check ${p?"on":""}">${p?"✓":v+1}</span>
        <span class="bi-name">${d.name}${f}</span>
        <span class="bc-arrow">›</span>
      </button>`}).join(""),m=t.items.every(d=>a.includes(d.id));e.innerHTML=`
    <div class="screen catalog">
      <div class="game-top"><button class="icon-btn" id="back">‹ Программа</button></div>
      <div class="brand"><h1>${t.title}</h1><p>${t.sub}</p></div>
      <div class="block-list">${h}</div>
      <button class="btn ${m?"btn-primary":"btn-ghost"}" id="exam" style="width:100%;margin-top:6px">
        ${r?"✓ Экзамен сдан · пересдать":"Экзамен блока"}
      </button>
      <p class="hint">${m?"Все упражнения пройдены — можно сдавать экзамен.":"Пройди упражнения, потом сдай экзамен. Можно и сразу — как удобнее."}</p>
      ${oa()}
    </div>
  `,document.getElementById("back").addEventListener("click",o),e.querySelectorAll("[data-item]").forEach(d=>d.addEventListener("click",()=>i(t,Number(d.dataset.item)))),document.getElementById("exam").addEventListener("click",()=>c(t));const u=document.getElementById("toSchool");u&&l&&u.addEventListener("click",l)}function Xi(){const e=["audio/webm;codecs=opus","audio/webm","audio/mp4","audio/ogg"];for(const t of e)try{if(window.MediaRecorder&&MediaRecorder.isTypeSupported(t))return t}catch{}return""}function Ki(e,t,{onExit:n}){let s=null,a=[],o=null,i=null,c=0,l=!1;function r(v){const p=Math.floor(v/1e3);return`${Math.floor(p/60)}:${String(p%60).padStart(2,"0")}`}function h(){e.innerHTML=`
      <div class="screen recorder">
        <div class="game-top"><button class="icon-btn" id="back">‹ Меню</button></div>
        <div class="brand"><h1>Запись голоса</h1><p>Запиши себя и послушай со стороны — так слышно прогресс и ошибки, которые в моменте не замечаешь.</p></div>
        <div class="rec-timer ${l?"live":""}" id="timer">${r(0)}</div>
        <button class="btn ${l?"btn-danger":"btn-primary"} rec-btn" id="rec">${l?"■ Остановить":"● Записать"}</button>
        <audio id="player" controls ${o?"":"hidden"} style="width:100%;margin-top:16px"></audio>
        <p class="hint" style="margin-top:14px">Запись хранится только в этой сессии и никуда не отправляется. ${window.MediaRecorder?"":"<br>⚠️ Браузер не поддерживает запись."}</p>
      </div>
    `,document.getElementById("back").addEventListener("click",()=>{d(),n()});const v=document.getElementById("rec");if(!window.MediaRecorder){v.disabled=!0;return}v.addEventListener("click",l?u:m);const p=document.getElementById("player");o&&p&&(p.src=o)}function m(){if(!t.stream)return;if(a=[],o){try{URL.revokeObjectURL(o)}catch{}o=null}try{const p=Xi();s=p?new MediaRecorder(t.stream,{mimeType:p}):new MediaRecorder(t.stream)}catch{return}s.ondataavailable=p=>{p.data&&p.data.size&&a.push(p.data)},s.onstop=()=>{const p=new Blob(a,{type:s.mimeType||"audio/webm"});o=URL.createObjectURL(p),l=!1,h()},s.start(),l=!0,c=typeof performance<"u"?performance.now():Date.now(),h();const v=()=>document.getElementById("timer");i=setInterval(()=>{const p=v();p&&(p.textContent=r((typeof performance<"u"?performance.now():Date.now())-c))},250)}function u(){clearInterval(i),i=null;try{s&&s.state!=="inactive"&&s.stop()}catch{l=!1,h()}}function d(){clearInterval(i),i=null;try{s&&s.state!=="inactive"&&s.stop()}catch{}if(o)try{URL.revokeObjectURL(o)}catch{}}h()}const Ji="./backing/raspevka-rise.mp3",Qi=[0,2,4,5,7,9,11],Qn=e=>Qi.includes((e%12+12)%12);function Zi(e){const t=ht(Y(e));return t?t.name:""}function Zn(e){return e=Math.max(0,Math.floor(e||0)),`${Math.floor(e/60)}:${String(e%60).padStart(2,"0")}`}function to(e,t,n,{onExit:s,lowMidi:a=40,highMidi:o=76}){let i=null;const c=a-2,l=o+2,r=Y(c),h=Y(l),m=new Audio(Ji);m.preload="auto",e.innerHTML=`
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
  `;const u=document.getElementById("back"),d=document.getElementById("play"),v=document.getElementById("cur"),p=document.getElementById("dur"),f=document.getElementById("seek"),g=document.getElementById("note"),E=document.getElementById("fs"),x=E.getContext("2d");function A(){const y=Math.min(window.devicePixelRatio||1,2);E.width=E.clientWidth*y,E.height=E.clientHeight*y,x.setTransform(y,0,0,y,0,0)}A(),window.addEventListener("resize",A),m.addEventListener("loadedmetadata",()=>{p.textContent=Zn(m.duration)}),m.addEventListener("ended",()=>{d.textContent="▶ Слушать"}),d.addEventListener("click",()=>{m.paused?(m.play().catch(()=>{}),d.textContent="⏸ Пауза"):(m.pause(),d.textContent="▶ Слушать")}),u.addEventListener("click",()=>{w(),s()});function P(y,k){const T=Math.max(r,Math.min(h,y)),C=Math.log2(T/r)/Math.log2(h/r);return k-C*k}const b=[];n.setRange&&n.setRange(55,1300),n.reset();function L(){const y=E.clientWidth,k=E.clientHeight;x.clearRect(0,0,y,k),x.font="10px Inter, sans-serif";for(let _=Math.ceil(c);_<=l;_++){const D=P(Y(_),k),S=(_%12+12)%12===0;x.strokeStyle=S?"rgba(27,36,48,.20)":Qn(_)?"rgba(27,36,48,.08)":"rgba(27,36,48,.03)",x.lineWidth=1,x.beginPath(),x.moveTo(34,D),x.lineTo(y,D),x.stroke(),Qn(_)&&(x.fillStyle=S?"rgba(27,36,48,.55)":"rgba(27,36,48,.32)",x.fillText(Zi(_),4,D+3))}m.duration&&(f.style.width=Math.min(100,m.currentTime/m.duration*100)+"%",v.textContent=Zn(m.currentTime));const T=t.read();let C=!1,R=null;if(T){const _=n.process(T);C=_.voiced&&t.rms()>.0025,R=_.smoothedHz}if(C&&R){const _=ht(R),D=(_.name||"").match(/^([A-G]#?)(-?\d+)$/);g.innerHTML=D?`${D[1]}<span class="oct">${D[2]}</span>`:_.name,g.classList.remove("silent"),b.push(P(R,k))}else g.textContent="—",g.classList.add("silent"),b.push(null);for(;b.length>90;)b.shift();const I=y-28;for(let _=0;_<b.length;_++){if(b[_]==null)continue;const D=I-(b.length-1-_)*2.4,S=_===b.length-1;x.fillStyle=S?"#2fab84":"rgba(47,171,132,.35)",S&&(x.shadowColor="#2fab84",x.shadowBlur=16),x.beginPath(),x.arc(D,b[_],S?8:2.5,0,Math.PI*2),x.fill(),x.shadowBlur=0}i=requestAnimationFrame(L)}L();function w(){i&&cancelAnimationFrame(i),i=null,window.removeEventListener("resize",A);try{m.pause(),m.src=""}catch{}}}async function eo(e){return!1}function no(e,{onExit:t}){Kt("lead_open");const n=it(),s=n&&ft(n.key),a=us(),o={voiceType:s?s.name:null,range:a&&Number.isFinite(a.low)?`${rt(a.low)}–${rt(a.high)}`:null,streak:Qt(),blocks:Rt().length},i=[o.voiceType,o.range?`диапазон ${o.range}`:null,o.streak?`стрик ${o.streak}`:null,o.blocks?`блоков ${o.blocks}`:null].filter(Boolean).join(" · ")||"пока без данных";let c="any";function l(){e.innerHTML=`
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
    `,document.getElementById("back").addEventListener("click",t),e.querySelectorAll("#lf-pref [data-pref]").forEach(h=>h.addEventListener("click",()=>{c=h.dataset.pref,e.querySelectorAll("#lf-pref [data-pref]").forEach(m=>m.classList.toggle("on",m.dataset.pref===c))})),document.getElementById("lf-send").addEventListener("click",async()=>{const h=document.getElementById("lf-name").value.trim(),m=document.getElementById("lf-contact").value.trim(),u=document.getElementById("lf-goal").value.trim();if(!h||!m){document.getElementById("lf-err").textContent="Заполни имя и контакт — иначе педагог не сможет ответить.";return}const d=document.getElementById("lf-send");d.disabled=!0,d.textContent="Отправляю…",Ha({name:h,contact:m,pref:c,goal:u,stats:o}),Kt("lead_sent",{pref:c}),await eo(),r(h)})}function r(h){Ct(1),e.innerHTML=`
      <div class="screen summary leadform-done">
        <div class="lf-check"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M5 13l4 4L19 7"/></svg></div>
        <div class="verdict">Заявка принята!</div>
        <p class="hint">Спасибо, ${h}! Педагог свяжется по твоему контакту и подберёт время бесплатного урока. Пока — продолжай практиковаться.</p>
        <button class="btn btn-primary" id="lf-ok" style="width:100%;max-width:360px">Вернуться</button>
      </div>
    `,document.getElementById("lf-ok").addEventListener("click",t)}l()}function so(e,t,{onExit:n,onVoice:s,onCalibrate:a}){let o=!1;function i(r,h,m){return`<div class="seg">${r.map(([u,d])=>`<button data-${m}="${u}" class="${h===u?"on":""}">${d}</button>`).join("")}</div>`}function c(){const r=ui();if(!r.sessions)return"";const h=r.perEx.slice(0,6).map(m=>`<div class="an-row"><span>${m.id}</span><span>${m.runs}× · ${m.avgPct}%</span></div>`).join("");return`
      <div class="card">
        <div class="seg-label">Аналитика (локально) <span class="set-hint">${r.sessions} прохождений</span></div>
        <div class="an-list">${h}</div>
      </div>`}function l(){const r=it(),h=r&&ft(r.key);e.innerHTML=`
      <div class="screen settings-screen">
        <div class="game-top"><button class="icon-btn" id="back">‹ Меню</button></div>
        <div class="brand"><h1>Настройки</h1><p>Звук, голос и поведение распевок — в одном месте.</p></div>

        <div class="card settings">
          <div class="set-row"><div class="seg-label">Мой голос</div>
            <button class="toggle" id="voice">${h?h.name:"Определить тембр голоса"} ›</button></div>

          <div class="seg-label">Громкость подсказки <span class="set-hint">на телефоне ставь «Громко/Макс»</span></div>
          ${i([["quiet","Тихо"],["normal","Норм"],["loud","Громко"],["max","Макс"]],$e(),"vol")}

          <div class="seg-label">Вывод звука <span class="set-hint">влияет на компенсацию задержки</span></div>
          ${i([["speaker","Динамик"],["wired","Провод"],["bt","Bluetooth"]],ke(),"route")}
          ${a?`<div class="set-row" style="margin-top:8px"><div class="seg-label" style="margin:0">Точная калибровка</div><button class="toggle" id="calib">${Math.round(nn()*1e3)} мс · настроить ›</button></div>`:""}

          <div class="seg-label">Чувствительность микрофона</div>
          ${i([["low","Низкая"],["med","Средняя"],["high","Высокая"]],sn(),"sens")}

          <div class="seg-label">Темп распевок</div>
          ${i([["easy","Медл."],["medium","Средне"],["fast","Быстро"]],Ze(),"diff")}

          <div class="seg-label">Звук подсказки</div>
          ${i([["piano","Пиано"],["guitar","Гитара"],["soft","Мягкий"]],$t(),"timbre")}

          <div class="seg-label">Грув (ритм-подложка) <span class="set-hint">Авто — своя под каждую распевку</span></div>
          ${i([["off","Выкл"],["auto","Авто"],["pop","Поп"],["funk","Фанк"],["soft","Мягкий"]],Je(),"groove")}

          <div class="toggle-row" style="margin-top:10px">
            <button class="toggle ${Bt()?"on":""}" id="guide">Подсказка тоном: ${Bt()?"вкл":"выкл"}</button>
            <button class="toggle ${wt()?"on":""}" id="hp">Наушники: ${wt()?"да":"нет"}</button>
          </div>
          <button class="toggle ${Ot()?"on":""}" id="darkstage" style="width:100%;margin-top:8px">Тёмный экран пения: ${Ot()?"вкл":"выкл"} <span class="set-hint">светящийся след голоса</span></button>
          <button class="toggle ${Nt()?"on":""}" id="agc" style="width:100%;margin-top:8px">Авто-громкость микро (AGC): ${Nt()?"вкл":"выкл"} <span class="set-hint">${Nt()?"громче на телефоне":"ровнее долгие ноты"}</span></button>
        </div>

        ${c()}

        <div class="card">
          <div class="seg-label">Сброс данных</div>
          <p class="hint" style="margin:4px 0 10px">Удалит прогресс, стрик, диапазон и настройки на этом устройстве. Отменить нельзя.</p>
          <button class="btn ${o?"btn-danger":"btn-ghost"}" id="reset" style="width:100%">${o?"Точно сбросить? Нажми ещё раз":"Сбросить всё"}</button>
        </div>
      </div>
    `,document.getElementById("back").addEventListener("click",n),document.getElementById("voice").addEventListener("click",s),e.querySelectorAll("[data-vol]").forEach(u=>u.addEventListener("click",()=>{if($s(u.dataset.vol),we(Ee()),t&&t.ctx)try{vt(t.ctx,523.25,.5,0,.22,$t())}catch{}l()})),e.querySelectorAll("[data-route]").forEach(u=>u.addEventListener("click",()=>{ja(u.dataset.route),l()})),e.querySelectorAll("[data-sens]").forEach(u=>u.addEventListener("click",()=>{ks(u.dataset.sens),t&&t.setSensitivity&&t.setSensitivity(an()),l()})),e.querySelectorAll("[data-diff]").forEach(u=>u.addEventListener("click",()=>{fs(u.dataset.diff),l()})),e.querySelectorAll("[data-timbre]").forEach(u=>u.addEventListener("click",()=>{ys(u.dataset.timbre),l()})),e.querySelectorAll("[data-groove]").forEach(u=>u.addEventListener("click",()=>{hs(u.dataset.groove),l()})),document.getElementById("guide").addEventListener("click",()=>{bs(!Bt()),l()}),document.getElementById("hp").addEventListener("click",()=>{gs(!wt()),l()}),document.getElementById("darkstage").addEventListener("click",()=>{Ga(!Ot()),l()}),document.getElementById("agc").addEventListener("click",()=>{const u=!Nt();Ua(u),t&&t.setAGC&&t.setAGC(u),l()});const m=document.getElementById("calib");m&&a&&m.addEventListener("click",a),document.getElementById("reset").addEventListener("click",()=>{if(!o){o=!0,l();return}ds(),di(),n()})}l()}const qe=["🎤","🦅","🐦","🦜","🎸","🌟","🔥","🎼","👑","🎧","🦊","🐺"];function ao(e,{onExit:t}){n();function n(){const s=dn(),a=s.avatar||"🎤",o=s.name||"",i=U(),c=rn(),l=Qt(),r=ps(),h=on(),m=us(),u=m?m.high-m.low:0,d=m?`${u} полутонов (${ts(m.low)}–${ts(m.high)})`:"не определён",v=new Set(ii()),p=Rt().length,f=je.map(b=>{const L=v.has(b.id);return`
        <div class="ach-item ${L?"ach-unlocked":"ach-locked"}" title="${b.desc}">
          <div class="ach-icon">${L?b.icon:"🔒"}</div>
          <div class="ach-name">${b.title}</div>
          ${L?"":`<div class="ach-desc">${b.desc}</div>`}
        </div>`}).join(""),g=i.nextMin?i.nextMin-i.curMin-i.into:0;e.innerHTML=`
      <div class="screen profile-screen">
        <div class="game-top">
          <button class="icon-btn" id="prof-back">‹ Назад</button>
        </div>

        <div class="prof-hero">
          <button class="prof-avatar-btn" id="prof-avatar" aria-label="Выбрать аватар">${a}</button>
          <div class="prof-avatar-hint">нажми чтобы изменить</div>
          <div class="prof-name-wrap">
            <input class="prof-name-input" id="prof-name" type="text"
              maxlength="32" placeholder="Как тебя зовут?" value="${io(o)}">
          </div>
        </div>

        <div class="card prof-level-card">
          <div class="prof-level-head">
            <span class="prof-level-num">Ур. ${i.level}</span>
            <span class="prof-level-title">${i.title}</span>
            <span class="prof-xp-total">${c} XP</span>
          </div>
          <div class="xp-bar-wrap xp-bar-wrap--lg">
            <div class="xp-bar-fill" style="width:${i.pct}%"></div>
          </div>
          <div class="prof-level-hint">
            ${i.nextMin?`до уровня «${zt[i.level].title}» ещё ${g} XP`:"Максимальный уровень — легенда!"}
          </div>
        </div>

        <div class="card prof-stats-card">
          <div class="prof-stats-title">Статистика</div>
          <div class="prof-stats-grid">
            <div class="prof-stat"><span class="prof-stat-val">${l}</span><span class="prof-stat-lbl">стрик (дн.)</span></div>
            <div class="prof-stat"><span class="prof-stat-val">${r}</span><span class="prof-stat-lbl">сессий</span></div>
            <div class="prof-stat"><span class="prof-stat-val">${d}</span><span class="prof-stat-lbl">диапазон</span></div>
            <div class="prof-stat"><span class="prof-stat-val">${h>0?h.toFixed(1)+" с":"—"}</span><span class="prof-stat-lbl">рекорд выдоха</span></div>
            <div class="prof-stat"><span class="prof-stat-val">${p}</span><span class="prof-stat-lbl">экзаменов</span></div>
            <div class="prof-stat"><span class="prof-stat-val">${v.size}/${je.length}</span><span class="prof-stat-lbl">наград</span></div>
          </div>
        </div>

        <div class="card prof-ach-card">
          <div class="prof-stats-title">Награды</div>
          <div class="ach-grid">${f}</div>
        </div>

        <button class="btn btn-ghost" id="prof-exit" style="width:100%">← В меню</button>
      </div>
    `,document.getElementById("prof-back").addEventListener("click",t),document.getElementById("prof-exit").addEventListener("click",t);let E=qe.indexOf(a);E<0&&(E=0);const x=document.getElementById("prof-avatar");x.addEventListener("click",()=>{E=(E+1)%qe.length;const b=qe[E];x.textContent=b,_n({avatar:b})});const A=document.getElementById("prof-name"),P=()=>_n({name:A.value.trim()});A.addEventListener("blur",P),A.addEventListener("keydown",b=>{b.key==="Enter"&&A.blur()})}}function ts(e){const t=["C","C#","D","D#","E","F","F#","G","G#","A","A#","B"],n=Math.floor(e/12)-1;return t[e%12]+n}function io(e){return String(e).replace(/&/g,"&amp;").replace(/"/g,"&quot;").replace(/</g,"&lt;").replace(/>/g,"&gt;")}function oo(e,t,{k:n=4,minRms:s=.012,window:a=.5}={}){if(!Array.isArray(e)||e.length<3)return null;const o=e.filter(l=>l.t<t).map(l=>l.rms).sort((l,r)=>l-r);if(!o.length)return null;const i=o[Math.floor(o.length/2)]||0,c=Math.max(s,i*n);for(const l of e)if(!(l.t<=t)){if(l.t-t>a)break;if(l.rms>=c)return l.t-t}return null}function co(e,t=.03,n=.4){const s=e.filter(a=>Number.isFinite(a)&&a>=t&&a<=n).sort((a,o)=>a-o);return s.length<2?null:s[Math.floor(s.length/2)]}const lo=e=>new Promise(t=>setTimeout(t,e));function ro(e,t,{onExit:n}){let s=!1,a="";function o(){const l=Math.round(nn()*1e3);e.innerHTML=`
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
    `,document.getElementById("back").addEventListener("click",n),document.getElementById("measure").addEventListener("click",c);const r=document.getElementById("slider");r.addEventListener("input",()=>{const h=Number(r.value);document.getElementById("slval").textContent=h+" мс",document.getElementById("curms").textContent=h,Pn(h/1e3)})}function i(){return new Promise(l=>{const r=t.ctx;if(!r){l(null);return}const h=[],m=r.currentTime,u=typeof performance<"u"?performance.now():Date.now(),d=m+.15;re(r,.15,!0);const v=()=>{t.read(),h.push({t:r.currentTime,rms:t.rms()});const p=r.currentTime-m,f=((typeof performance<"u"?performance.now():Date.now())-u)/1e3;p<.7&&f<1.3?setTimeout(v,16):l(oo(h,d))};v()})}async function c(){if(s)return;s=!0,a="",o();const l=[];for(let h=0;h<3;h++)a=`Замер ${h+1} из 3…`,o(),l.push(await i()),await lo(300);const r=co(l);s=!1,r==null?a="Не удалось расслышать эхо (тихо, наушники или сильный шум). Подстрой вручную ползунком ниже или выбери тип вывода в настройках.":(Pn(r),a=`Готово: задержка ≈ ${Math.round(r*1e3)} мс — сохранено.`),o()}o()}function ca(e,{onExit:t}){const n=()=>ca(e,{onExit:t}),s=rs(),a=pt(),o=ln(),i=(l,r)=>`
    <div class="seg-label">${l}</div>
    <div class="seg">${r.map(([h,m,u])=>`<button data-act="${h}" class="${u?"on":""}">${m}</button>`).join("")}</div>`;e.innerHTML=`
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

        <div class="seg-label" style="margin-top:12px">Стрик: ${Qt()} · заморозки: ${de()}</div>
        <div class="seg">
          <button data-act="s0">Стрик 0</button>
          <button data-act="s6">Стрик 6</button>
          <button data-act="s13">Стрик 13</button>
          <button data-act="fz">Заморозка +1</button>
        </div>

        <div class="seg-label" style="margin-top:12px">Энергия: ${yt()}/${Wt()}</div>
        <div class="seg">
          <button data-act="e0">0</button>
          <button data-act="e1">1</button>
          <button data-act="emax">Полная</button>
        </div>

        ${i(`Пейволл (soft, ${cn}/день): сегодня использовано ${Ms()}`,[["pw-on","Вкл",ue()],["pw-off","Выкл",!ue()],["pw-use","+1 распевка",!1]])}

        <div class="seg-label" style="margin-top:12px">Триал: ${o==null?"не начат":o>0?`активен, осталось ${o} дн.`:"истёк"}</div>
        <div class="seg">
          <button data-act="tr-start">Старт</button>
          <button data-act="tr-reset">Сброс</button>
        </div>

        ${i("Тариф",[["tier-free","Free",Tt()==="free"],["tier-std","Standard",Tt()==="standard"],["tier-pro","Pro",Tt()==="pro"]])}

        <div class="seg-label" style="margin-top:12px">Программа: сдано ${Rt().length}/${ot.length}</div>
        <div class="seg">
          <button data-act="bl-all">Открыть все блоки</button>
          <button data-act="bl-none">Закрыть все</button>
        </div>
      </div>

      <button class="btn btn-ghost" id="simNew" style="width:100%">🧪 Симуляция нового пользователя (сброс + пейволл вкл)</button>
      <button class="btn btn-ghost" id="exitDev" style="width:100%">Выключить тест-режим</button>
      <p class="hint">Смещение времени живёт отдельно от прогресса: «Реальное» возвращает время, не трогая данные.</p>
    </div>
  `,document.getElementById("back").addEventListener("click",t),document.getElementById("exitDev").addEventListener("click",()=>{me(!1),He(),t()}),document.getElementById("simNew").addEventListener("click",()=>{ds(),He(),me(!0),_e(!0),n()});const c={"d-1":()=>Ce(-1),"d+1":()=>Ce(1),"d+7":()=>Ce(7),d0:()=>He(),s0:()=>Re(0),s6:()=>Re(6),s13:()=>Re(13),fz:()=>Ia(de()+1),e0:()=>ie(0),e1:()=>ie(1),emax:()=>ie(Wt()),"pw-on":()=>_e(!0),"pw-off":()=>_e(!1),"pw-use":()=>Ls(),"tr-start":()=>xs(),"tr-reset":()=>Qa(),"tier-free":()=>ae("free"),"tier-std":()=>ae("standard"),"tier-pro":()=>ae("pro"),"bl-all":()=>oi(ot.map(l=>l.id)),"bl-none":()=>ci()};e.querySelectorAll("[data-act]").forEach(l=>{l.addEventListener("click",()=>{c[l.dataset.act](),n()})})}function uo(e,{onExit:t,onTrialStarted:n,onTeacher:s}){const a=ln()!=null;e.innerHTML=`
    <div class="screen summary">
      <div class="game-top"><button class="icon-btn" id="back">‹ Меню</button></div>
      <div class="brand">
        <h1>На сегодня — всё 🎉</h1>
        <p>Ты прошёл ${cn} бесплатных распевок за день. Голосу полезен отдых — а завтра лимит обновится.</p>
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
  `,document.getElementById("back").addEventListener("click",t),document.getElementById("tomorrow").addEventListener("click",t),document.getElementById("teacher").addEventListener("click",s);const o=document.getElementById("trial");o&&o.addEventListener("click",()=>{xs(),Ct(2),n()})}const mo=[{icon:"🎤",title:"Микрофон",body:"Круглая кнопка внизу экрана включает и выключает микрофон. Мы слушаем только высоту тона — ничего не записываем и не отправляем. Если браузер не дал доступ — нажми кнопку ещё раз и выбери «Разрешить»."},{icon:"🔊",title:"Плохо слышно подсказку?",body:"Настройки → «Громкость подсказки». На телефоне ставь «Громко» или «Макс». Звук подсказки (пиано/гитара/мягкий) — там же."},{icon:"🎧",title:"Звук опаздывает или «не туда» засчитывает?",body:"Это задержка вывода. Настройки → «Вывод звука»: выбери Динамик / Провод / Bluetooth (Bluetooth опаздывает сильнее всего). Для идеала — «Точная калибровка»: приложение само измерит задержку твоего устройства."},{icon:"🎵",title:"Подсказка тоном",body:"Без наушников подсказка звучит КОРОТКО перед нотой и молчит, пока поёшь — иначе микрофон ловит динамик. В наушниках включи тумблер «Наушники» — и подсказка будет вести тебя непрерывно."},{icon:"⚙️",title:"Темп и настройки прямо в упражнении",body:"На экране упражнения есть панель «Темп и подсказка тоном» (значок ⚙) — меняй темп на лету, проход мягко перезапустится. Продвинутое (тембр, грув, наушники) — под спойлером «Ещё настройки звука»."},{icon:"🎼",title:"Распевка идёт по твоему диапазону",body:"Каждая распевка начинается от низа твоего диапазона, поднимается по полутонам до верха и возвращается вниз — как на занятии с педагогом. Счётчик повторов виден сверху (например 3/17). Выйти можно в любой момент."},{icon:"🎹",title:"Лад распевок",body:"Для гаммовых распевок лад (мажор/минор и другие) выбирается прямо на экране перед стартом. Чем выше тариф — тем больше ладов открыто."},{icon:"⚡",title:"Энергия, стрик и заморозка",body:"Энергия тратится при провале (<40%) и копится за точные распевки; сама восстанавливается со временем. Стрик 🔥 — дни подряд. Заморозка ❄ спасает один пропущенный день (даётся за каждые 7 дней подряд)."},{icon:"🏆",title:"Программа обучения",body:"Главный путь: блоки открываются по очереди, каждый завершается экзаменом. Внутри блока после каждого упражнения — кнопка «Дальше» к следующему. Застрял — кнопка «Урок с педагогом» внизу."},{icon:"🌙",title:"Тёмный экран пения",body:"Настройки → «Тёмный экран пения»: светящийся след голоса на тёмной сцене. Дело вкуса — попробуй оба."}];function po(e,{onExit:t,onSettings:n}){const s=mo.map(o=>`
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
  `,document.getElementById("back").addEventListener("click",t);const a=document.getElementById("toSettings");a&&n&&a.addEventListener("click",n)}const B=document.getElementById("app"),W=new ha({fftSize:2048});let et=null,De=null;const vo=60,le=[{label:"Мычание по гамме",sub:"«М» · I-II-III-II-I",ic:"lips",cat:"warm",make:e=>mn(e,Z())},{label:"Губной тренаж «brrr»",sub:"brrr / «Р» · 5 нот + квинта",ic:"wave",cat:"warm",make:e=>pn(e,Z())},{label:"Удержание ноты",sub:"держать ровный звук",ic:"fork",cat:"warm",make:e=>Fs(e,8)},{label:"Гамма «Ма-Мэ»",sub:"попадать в ноты гаммы",ic:"stairs",cat:"pitch",make:e=>Qs(e,Z())},{label:"Беглость «Ма»",sub:"быстрые ноты — как в рекламе",ic:"bolt",cat:"pitch",make:e=>Zs(e,Z())},{label:"Октавный скачок",sub:"прыжок на октаву и назад",ic:"arrows",cat:"pitch",make:e=>ta(e)},{label:"Цепочка гласных",sub:"Ми-Ме-Ма · выравнивание",ic:"lips",cat:"vowel",make:e=>_s(e,Z())},{label:"Пять гласных",sub:"И-Э-А-О-У · позиция",ic:"lips",cat:"vowel",make:e=>As(e)},{label:"Лесенка гласных",sub:"И-Э-А-О-У · точность",ic:"stairs",cat:"vowel",make:e=>Cs(e,Z())},{label:"Волна гласных",sub:"мотив с паузами + спуск",ic:"wave",cat:"vowel",make:e=>Ps(e,Z())},{label:"Качели на квинте",sub:"И-Э-А-О-У · скачки",ic:"arrows",cat:"vowel",make:e=>Rs(e,Z())},{label:"Зигзаг",sub:"гибкость на гласных",ic:"bolt",cat:"vowel",make:e=>Hs(e,Z())},{label:"Скачок к V ступени",sub:"Ям · атака интервала",ic:"arrows",cat:"pitch",make:e=>qs(e,Z())},{label:"Ладовая «ЯМ»",sub:"гамма лада вверх-вниз",ic:"stairs",cat:"pitch",make:e=>Ds(e,Z())},{label:"Вибрато",sub:"ровная волна голосом",ic:"wave",cat:"vib",make:e=>Ns(e)},{label:"Раскачка вибрато",sub:"А · запуск вибрато",ic:"wave",cat:"vib",make:e=>zs(e)},{label:"Тёплый тон",sub:"Мо · качество тембра",ic:"fork",cat:"vib",make:e=>Os(e)},{label:"Ровный тон на двух",sub:"А · единый тембр",ic:"fork",cat:"vib",make:e=>Vs(e)},{label:"Через регистры",sub:"Но · passaggio",ic:"arrows",cat:"reg",make:e=>js(e)},{label:"Октавная связка",sub:"А · соединить регистры",ic:"arrows",cat:"reg",make:e=>Gs(e)},{label:"Белтинг — гамма",sub:"Эй · яркая подача",ic:"bolt",cat:"reg",make:e=>Ws(e)},{label:"Белт-арпеджио",sub:"Эй · опёртый верх",ic:"arrows",cat:"reg",make:e=>Us(e)},{label:"Стаккато-арпеджио",sub:"Та · артикуляция",ic:"bolt",cat:"artic",make:e=>Ys(e)},{label:"Слоги по группам",sub:"Та-Ка · дикция",ic:"lips",cat:"artic",make:e=>Xs(e)},{label:"Фигура-волчок",sub:"Ма · выносливость",ic:"stairs",cat:"artic",make:e=>Ks(e)},{label:"Выносливая гамма",sub:"Ма · длинный пробег",ic:"stairs",cat:"artic",make:e=>Js(e)}],ho=[["warm","Разогрев"],["vowel","Гласные"],["pitch","Точность и гибкость"],["vib","Вибрато и тембр"],["reg","Регистры и сила"],["artic","Дикция и выносливость"]];function Jt(){const e=it(),t=e&&ft(e.key);return t?t.center:vo}function fe(){const e=it(),t=e&&ft(e.key);return e&&e.low!=null&&e.high!=null?{low:e.low,high:e.high}:t?{low:t.low,high:t.high}:{low:48,high:72}}function lt(){if(!et)return;const e=it(),t=e&&ft(e.key);t?et.setRange(Y(t.low-5),Y(t.high+5)):et.setRange(60,1200)}const fo=["Голос — это мышца. Сегодня сделаем её сильнее.","Дыши животом — и звук польётся сам.","Чисто — не значит громко. Решает точность.","Каждая распевка чуть-чуть расширяет диапазон.","Расслабь челюсть и плечи — голос любит свободу.","Лучшие певцы тоже начинали с простого «мычания».","Тёплый голос начинается с тёплого дыхания.","Не тянись за верхней нотой горлом — она придёт сама.","5 минут каждый день дают больше, чем час раз в неделю.","Улыбнись — и тембр станет светлее.","Зевни перед распевкой — гортань скажет спасибо.","Пой так, будто тебя уже любят слушать."];function bo(e){const t=e.slice();for(let n=t.length-1;n>0;n--){const s=Math.floor(Math.random()*(n+1));[t[n],t[s]]=[t[s],t[n]]}return t}function go(){nt();const e=bo(fo);B.innerHTML=`
    <div class="screen splash">
      <div class="splash-core">
        <div class="eq" aria-hidden="true"><i></i><i></i><i></i><i></i><i></i></div>
        <h1 class="splash-title">Распевка</h1>
        <p class="splash-tip" id="tip">${e[0]}</p>
      </div>
      <div class="splash-bar"><i></i></div>
    </div>
  `;const t=window.matchMedia&&window.matchMedia("(prefers-reduced-motion: reduce)").matches;setTimeout(yo,t?1600:2800)}function yo(){ko();try{new URLSearchParams(location.search).has("dev")&&me(!0)}catch{}if(!it()&&!$().welcomed){wo();return}F()}function wo(){nt(),B.innerHTML=`
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
  `;const e=()=>q({...$(),welcomed:!0});document.getElementById("wlc-skip").addEventListener("click",()=>{e(),F()}),document.getElementById("wlc-go").addEventListener("click",()=>{e(),at(()=>hn(B,W,et,{onDone:()=>{lt(),$o()},onExit:F}))})}function $o(){nt(),B.innerHTML=`
    <div class="screen welcome">
      <div class="brand"><h1>Отлично! 🎉</h1>
        <p>Упражнения уже подстроились под твой голос. Попробуем первую распевку — мягкое мычание, 1 минута.</p></div>
      <button class="btn btn-primary" id="fe-go" style="width:100%">Первая распевка →</button>
      <button class="btn btn-ghost" id="fe-guide" style="width:100%">💡 Как тут всё устроено · 1 минута</button>
      <button class="btn btn-ghost" id="fe-menu" style="width:100%">В меню</button>
    </div>
  `,document.getElementById("fe-go").addEventListener("click",()=>ge(0)),document.getElementById("fe-guide").addEventListener("click",ra),document.getElementById("fe-menu").addEventListener("click",F)}let bt="off";async function la(){try{if(!W.ready){W.setAGC(Nt());const{sampleRate:e}=await W.start();et||(et=new fa(e,{fftSize:2048,minClarity:.85})),W.setSensitivity(an()),we(Ee()),lt()}return bt="listening",be(),!0}catch{return bt="denied",be(),!1}}async function Eo(){if(bt==="listening"){try{await W.suspend()}catch{}bt="off",be()}else await la()}function ko(){const e=document.getElementById("mic-fab");e&&(e.hidden=!1,e.__wired||(e.addEventListener("click",Eo),e.__wired=!0),be())}function be(){const e=document.getElementById("mic-fab");if(!e)return;e.className="mic-fab "+bt;const t=e.querySelector(".mic-fab-txt");t&&(t.textContent=bt==="listening"?"Слушаю":bt==="denied"?"Нет доступа · нажми":"Включить микрофон"),e.setAttribute("aria-pressed",bt==="listening"?"true":"false")}async function at(e){if(!await la()){xo(e);return}e()}function xo(e){nt(),B.innerHTML=`
    <div class="screen">
      <div class="game-top"><button class="icon-btn" id="back">‹ Меню</button></div>
      <div class="brand"><h1>Нужен микрофон</h1>
        <p>Чтобы слышать твой голос, разреши доступ к микрофону. На телефоне нужен HTTPS, в браузере — «Разрешить».</p></div>
      <div class="card">
        <p class="hint" style="margin-bottom:16px">Нажми кнопку и выбери «Разрешить». Микрофон можно выключить в любой момент кнопкой внизу экрана.</p>
        <button class="btn btn-primary" id="grant" style="width:100%">Разрешить микрофон</button>
        <p class="hint" style="margin-top:14px">🔒 Звук обрабатывается прямо на твоём устройстве и никуда не отправляется — мы ничего не записываем и не храним.</p>
      </div>
    </div>
  `,document.getElementById("back").addEventListener("click",F),document.getElementById("grant").addEventListener("click",()=>at(e))}function Fe(e){return`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">${{mic:'<path d="M12 3a3 3 0 0 0-3 3v6a3 3 0 0 0 6 0V6a3 3 0 0 0-3-3z"/><path d="M5 11a7 7 0 0 0 14 0M12 18v3"/>',chart:'<path d="M4 20V10M10 20V4M16 20v-7M22 20H2"/>',tuner:'<circle cx="12" cy="12" r="8"/><path d="M12 12l4-3"/><path d="M12 4v2M12 18v2M4 12h2M18 12h2"/>',wave:'<path d="M2 12h2l2-6 3 14 3-12 2 8 2-4h6"/>',note:'<circle cx="7" cy="18" r="3"/><circle cx="18" cy="16" r="3"/><path d="M10 18V5l11-2v13"/>',lips:'<path d="M3 12c4-5 14-5 18 0-4 5-14 5-18 0z"/><path d="M3 12h18"/>',fork:'<path d="M9 3v8a3 3 0 0 0 6 0V3"/><path d="M12 14v7"/>',stairs:'<path d="M3 19h4v-4h4v-4h4V7h4"/>',bolt:'<path d="M13 2 4 14h6l-1 8 9-12h-6z"/>',arrows:'<path d="M8 8l4-4 4 4M8 16l4 4 4-4M12 4v16"/>'}[e]||""}</svg>`}function Mo(){return'<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2c1 3-1 4-2 6-1 1.7-.5 3.5 1 4 .8.3 1-.7.5-1.5 2 .6 3.5 2.3 3.5 4.5A5 5 0 0 1 7 19c-1.7-1-2.7-3-2.5-5 .2-2.4 2-3.7 2.8-5.6C8.4 6 9 3.6 12 2z"/></svg>'}const Ne=e=>e%10===1&&e%100!==11?"день":"дн.";function F(){nt();const e=(S,H)=>{const j=S.make(60).notes;return`
    <button class="ex-tile" data-ex="${H}">
      ${Ge(j)}
      <span class="ex-tile-main">${S.label}</span>
      <span class="ex-tile-sub">${S.sub}</span>
    </button>`},t=ho.map(([S,H])=>{const j=le.map((K,dt)=>K.cat===S?e(K,dt):"").join("");return`<div class="cat-title">${H}</div><div class="ex-row">${j}</div>`}).join(""),n=Rt(),s=ot.findIndex(S=>!n.includes(S.id)),a=Math.round(n.length/ot.length*100),o=Object.entries(na).map(([S,H])=>`
    <button class="thin-item" data-breath="${S}"><span>${H.title}</span><span class="thin-sub">${H.kind==="exhale"?"выдох":"дыхание"}</span></button>
  `).join(""),i=Object.entries(Vt).map(([S,H])=>`
    <button class="thin-item" data-rhythm="${S}"><span>${H.name}</span><span class="thin-sub">метроном</span></button>
  `).join(""),c=ia.map((S,H)=>`
    <button class="ex-tile" data-song="${H}">
      ${Ge(Vi(S))}
      <span class="ex-tile-main">${S.name}</span>
      <span class="ex-tile-sub">мелодия · на «ля»</span>
    </button>`).join(""),l=Qt(),r=it(),h=r&&ft(r.key),m=Ba(),u=ls(),d=(u.getDate()+u.getMonth())%le.length,v=le[d],p=un(Z()).name,f=yt(),g=Wt(),E=U(),x=dn().avatar||"🎤";B.innerHTML=`
    <div class="screen home">
      <header class="home-head">
        <h1>Распевка</h1>
        <div class="home-chips">
          <button class="profile-chip" data-profile aria-label="Профиль игрока">
            <span class="profile-chip-avatar">${x}</span>
            <span class="profile-chip-level">Ур.${E.level}</span>
            <div class="profile-chip-bar"><div class="profile-chip-fill" style="width:${E.pct}%"></div></div>
          </button>
          <div class="energy-chip" title="Энергия — копится за точные распевки"><svg viewBox="0 0 24 24" fill="currentColor"><path d="M13 2 4 14h6l-1 8 9-12h-6z"/></svg>${f}/${g}</div>
          ${l>0?`<div class="streak-chip" title="Стрик: ${l} ${Ne(l)} подряд">${Mo()} ${l}</div>`:""}
          ${de()>0?`<div class="energy-chip" title="Заморозка стрика — страхует 1 пропущенный день">❄ ${de()}</div>`:""}
          ${ei()?'<button class="gear-btn" data-dev aria-label="Тест-режим" title="Тест-режим">🧪</button>':""}
          <button class="gear-btn" data-settings aria-label="Настройки"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg></button>
        </div>
      </header>

      <button class="hero-card" id="session">
        <div class="hero-eyebrow">Сегодня</div>
        <div class="hero-title">Полная распевка</div>
        <div class="hero-sub">${m?`Сегодня выполнено ✓${l>0?` · стрик ${l} ${Ne(l)}`:""} — возвращайся завтра`:"Дыхание → распевка · ~10 минут"}</div>
        <span class="hero-arrow">→</span>
      </button>

      <button class="hero-card program-card" data-path>
        <div class="hero-eyebrow">Программа обучения</div>
        <div class="hero-title pc-title">${s===-1?"Все блоки пройдены! 🏆":`Блок ${s+1} · ${ot[s].title}`}</div>
        <div class="prog-bar pc-bar"><i style="width:${a}%"></i></div>
        <div class="hero-sub">${n.length} / ${ot.length} блоков · каждый завершается экзаменом</div>
        <span class="hero-arrow">→</span>
      </button>

      <div class="tiles">
        <button class="tile tile-hl" data-freesing="1">${Fe("wave")}<span class="tile-main">Распевайся</span><span class="tile-sub">видеть свой голос</span></button>
        <button class="tile" data-voice="1">${Fe("mic")}<span class="tile-main">Мой голос</span><span class="tile-sub">${h?h.name:"определить"}</span></button>
        <button class="tile" data-dash="1">${Fe("chart")}<span class="tile-main">Прогресс</span><span class="tile-sub">${l>0?l+" "+Ne(l)+" подряд":"статистика"}</span></button>
      </div>

      <button class="focus-chip" data-focus>
        <span class="fc-label">Фокус дня — <b>${v.label}</b></span>
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
          <button class="thin-item" data-modes><span>Лад распевок</span><span class="thin-sub">${p}</span></button>
        </div>
      </section>
      <button class="thin-item thin-cta" data-teacher style="width:100%"><span>Урок с живым педагогом</span><span class="thin-sub">бесплатный пробный →</span></button>
      <p class="hint">Темп и «подсказку тоном» настраивай прямо в упражнении — значок ⚙.</p>
    </div>
    <!-- вне .screen: у неё transform от entrance-анимации, который ломает position:fixed -->
    <button class="guide-fab" data-guide aria-label="Подсказки" title="Как тут всё устроено">💡</button>
  `,document.getElementById("session").addEventListener("click",()=>{const S=()=>at(()=>{lt(),Ti(B,W,et,{onExit:F})});$().safetyAccepted?S():Bo(S)});const A=B.querySelector("[data-focus]");A&&A.addEventListener("click",()=>ge(d)),B.querySelector("[data-voice]").addEventListener("click",()=>{at(()=>hn(B,W,et,{onDone:()=>{lt(),F()},onExit:F}))}),B.querySelector("[data-dash]").addEventListener("click",()=>Ci(B,{onExit:F})),B.querySelector("[data-freesing]").addEventListener("click",()=>{at(()=>{const S=fe();Ri(B,W,et,{onExit:()=>{lt(),F()},lowMidi:S.low,highMidi:S.high})})}),B.querySelectorAll("[data-ex]").forEach(S=>{S.addEventListener("click",()=>ge(Number(S.dataset.ex)))}),B.querySelectorAll("[data-breath]").forEach(S=>{S.addEventListener("click",()=>at(()=>sa(B,W,S.dataset.breath,{onExit:F})))}),B.querySelectorAll("[data-rhythm]").forEach(S=>{S.addEventListener("click",()=>ea(B,W,Jt(),Vt[S.dataset.rhythm],{onExit:F}))});const P=B.querySelector("[data-path]");P&&P.addEventListener("click",fn);const b=B.querySelector("[data-ear]");b&&b.addEventListener("click",()=>at(()=>{lt(),aa(B,W,et,{onExit:F,root:Jt()})}));const L=B.querySelector("[data-theory]");L&&L.addEventListener("click",()=>Fi(B,{onExit:F}));const w=B.querySelector("[data-record]");w&&w.addEventListener("click",()=>at(()=>Ki(B,W,{onExit:F})));const y=B.querySelector("[data-backing]");y&&y.addEventListener("click",()=>at(()=>{const S=fe();to(B,W,et,{onExit:()=>{lt(),F()},lowMidi:S.low,highMidi:S.high})}));const k=B.querySelector("[data-modes]");k&&k.addEventListener("click",To);const T=B.querySelector("[data-settings]");T&&T.addEventListener("click",jt);const C=B.querySelector("[data-teacher]");C&&C.addEventListener("click",()=>Zt(F)),B.querySelectorAll("[data-song]").forEach(S=>{S.addEventListener("click",()=>ua(Number(S.dataset.song)))});const R=B.querySelector("[data-guide]");R&&R.addEventListener("click",ra);const I=B.querySelector("[data-profile]");I&&I.addEventListener("click",Lo);const _=B.querySelector("[data-dev]");_&&_.addEventListener("click",es);const D=B.querySelector(".home-head h1");if(D){let S=0,H=0;D.addEventListener("click",()=>{const j=Date.now();S=j-H<600?S+1:1,H=j,S>=7&&(S=0,me(!0),es())})}}function Lo(){nt(),ao(B,{onExit:F})}function es(){nt(),ca(B,{onExit:F})}function ra(){nt(),po(B,{onExit:F,onSettings:jt})}function So(){nt(),uo(B,{onExit:F,onTrialStarted:F,onTeacher:()=>Zt(F)})}function da(e){if(ti()){So();return}ue()&&Ls(),e()}function ge(e,t=!0){if(t){da(()=>ns(e,t));return}ns(e,t)}function ye(e){const t=fe(),n=e(60),s=Math.min(...n.notes.map(c=>c.midi))-60,a=t.low-s,o=e(a),i=vn(o,t.low,t.high,48);return{ex:o,reps:i}}function ns(e,t){at(()=>{lt();const n=o=>le[e].make(o),{ex:s,reps:a}=ye(n);ut(B,W,et,s,{explain:t,reps:a,rebuild:()=>ye(n).ex,onExit:F,onAgain:()=>ge(e,!1)})})}function ua(e,t=!0){if(t){da(()=>ss(e,t));return}ss(e,t)}function ss(e,t){at(()=>{const n=ia[e].make(Jt());ut(B,W,et,n,{explain:t,reps:[0],onExit:F,onAgain:()=>ua(e,!1)})})}function To(){nt(),Gi(B,{onExit:F})}function fn(){nt(),Ui(B,{blocks:ot,examsPassed:Rt(),onExit:F,onOpenBlock:Ht,onSchool:Zt})}function Ht(e){nt();const t=ot[e];Yi(B,{block:t,index:e,examsPassed:Rt(),doneItems:Pa(t.id),onExit:fn,onRunItem:Ye,onExam:xe,onSchool:Zt})}function Ye(e,t){const n=e.items[t],s=ot.indexOf(e),a=e.items[t+1],o=()=>a?Ye(e,t+1):xe(e);at(()=>{if(lt(),n.t==="breath"){sa(B,W,n.id,{onExit:()=>Ht(s),onDone:()=>Hn(e.id,n.id),onNext:o,nextLabel:a?`Дальше: ${a.name}`:"К экзамену блока"});return}const i=r=>Ue[n.id](r,Z()),{ex:c,reps:l}=ye(i);ut(B,W,et,c,{explain:!0,reps:l,rebuild:()=>ye(i).ex,onResult:r=>{r.pct>=.5&&Hn(e.id,n.id)},onExit:()=>Ht(s),onAgain:()=>Ye(e,t),nextLabel:a?`Дальше: ${a.name}`:"К экзамену блока",onNext:o})})}function xe(e){at(()=>{lt();const t=Ue[e.exam.exId](Jt(),Z()),n=fe(),s=vn(t,n.low,n.high,2);ut(B,W,et,t,{explain:!0,reps:s,rebuild:()=>Ue[e.exam.exId](Jt(),Z()),onComplete:a=>Io(e,a),onExit:()=>Ht(ot.indexOf(e)),onAgain:()=>xe(e)})})}function Io(e,t){nt();const n=Math.round(t.pct*100),s=t.pct>=e.exam.pass;if(s){Ra(e.id);const c=U().level;Ut({kind:"exam"});const l=U().level;Yt(Xt()).forEach(r=>mt(`Награда: ${r.title}`,{icon:r.icon,type:"achievement"})),l>c&&mt(`Новый уровень: ${U().title}`,{icon:"🏆",type:"level"})}else yt()>0&&Ve(-1);const a=ot.indexOf(e),o=s&&a+1<ot.length,i=s?"var(--green)":"var(--coral)";B.innerHTML=`
    <div class="screen summary">
      <div class="verdict" style="color:${i}">${s?"Экзамен сдан!":"Пока не сдан"}</div>
      <div class="big-pct" style="color:${i}">${n}<span>%</span></div>
      <p class="hint">${s?`Блок «${e.title}» пройден.${o?" Открыт следующий блок.":""}`:`Нужно ${Math.round(e.exam.pass*100)}%. Энергия −1 (восстановится со временем). Можно пересдать сразу.`}</p>
      <div class="teacher-cta"><span>Разобрать ошибки с педагогом — быстрее.</span><button class="btn btn-ghost" id="toSchool">На урок</button></div>
      <div class="row">
        <button class="btn btn-ghost" id="toBlock">К блоку</button>
        <button class="btn btn-primary" id="primary">${s?o?"Следующий блок":"К программе":"Пересдать"}</button>
      </div>
    </div>`,document.getElementById("toBlock").addEventListener("click",()=>Ht(a)),document.getElementById("toSchool").addEventListener("click",Zt),document.getElementById("primary").addEventListener("click",()=>{s?o?Ht(a+1):fn():xe(e)})}function Zt(e){nt(),no(B,{onExit:typeof e=="function"?e:F})}function jt(){nt(),so(B,W,{onExit:F,onVoice:()=>at(()=>hn(B,W,et,{onDone:()=>{lt(),jt()},onExit:jt})),onCalibrate:()=>at(()=>ro(B,W,{onExit:jt}))})}function Bo(e){nt(),B.innerHTML=`
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
  `,document.getElementById("accept").addEventListener("click",()=>{q({...$(),safetyAccepted:!0}),e()}),document.getElementById("safety-back").addEventListener("click",F)}function nt(){De&&cancelAnimationFrame(De),De=null}"serviceWorker"in navigator&&window.addEventListener("load",()=>{navigator.serviceWorker.register("./sw.js").catch(()=>{})});let ze=null;async function Oe(){try{const e=await fetch(`./version.json?_=${Date.now()}`,{cache:"no-store"});if(!e.ok)return;const t=String((await e.json()).v||"");if(!t||t==="0")return;if(ze==null){ze=t;return}if(t!==ze&&!document.getElementById("updbar")){const n=document.createElement("div");n.id="updbar",n.className="update-banner",n.innerHTML='<span>Доступна новая версия</span><button class="btn btn-primary" id="updgo">Обновить</button>',document.body.appendChild(n),document.getElementById("updgo").addEventListener("click",()=>location.reload())}}catch{}}Oe(),setInterval(Oe,300*1e3),window.addEventListener("focus",Oe);let Ft=null;window.addEventListener("beforeinstallprompt",e=>{if(e.preventDefault(),Ft=e,localStorage.getItem("raspevka.installDismissed")==="1"||document.getElementById("installchip"))return;const t=document.createElement("div");t.id="installchip",t.className="install-chip",t.innerHTML='<span>📲 Добавить «Распевку» на экран</span><button id="instyes">Добавить</button><button id="instno" aria-label="Скрыть">✕</button>',document.body.appendChild(t),document.getElementById("instyes").addEventListener("click",async()=>{if(t.remove(),!Ft)return;Ft.prompt();const{outcome:n}=await Ft.userChoice;n==="accepted"&&Kt("app_install"),Ft=null}),document.getElementById("instno").addEventListener("click",()=>{t.remove(),localStorage.setItem("raspevka.installDismissed","1")})});go();
