import{m as G,c as Rt,a as Ze,f as Tn,h as rt,M as Fs,P as zs}from"./note-map-ClIaVDR2.js";class Vs{constructor(e){this.notes=Array.from({length:e},()=>({greenMs:0,scoredMs:0,activeMs:0,sumCents:0,centsMs:0})),this.g={ms:0,sumC:0,sumC2:0,reversals:0,lastC:null,lastDir:0}}record(e,n,a,s,i=null){const o=this.notes[e];if(o&&(o.activeMs+=a,!!s&&(o.scoredMs+=a,n==="green"?o.greenMs+=a:n==="yellow"&&(o.greenMs+=a*.5),i!=null&&Number.isFinite(i)))){o.sumCents+=i*a,o.centsMs+=a;const c=this.g;if(c.ms+=a,c.sumC+=i*a,c.sumC2+=i*i*a,c.lastC!=null){const l=i-c.lastC;if(Math.abs(l)>2){const r=l>0?1:-1;c.lastDir&&r!==c.lastDir&&(c.reversals+=1),c.lastDir=r}}c.lastC=i}}result(){let e=0,n=0,a=0,s=0,i=0;for(const d of this.notes)e+=d.greenMs,n+=d.activeMs,a+=d.sumCents,s+=d.centsMs,d.activeMs>0&&d.greenMs/d.activeMs>=.5&&(i+=1);const o=n>0?e/n:0,c=o>=.85?3:o>=.6?2:o>=.35?1:0,l=this.g;let r=0;if(l.ms>0){const d=l.sumC/l.ms,v=Math.max(0,l.sumC2/l.ms-d*d);r=Math.sqrt(v)}const u=l.ms/1e3,h=u>0?l.reversals/2/u:0,f=h>=3.5&&h<=8.5&&r>=15&&r<=130;return{pct:o,stars:c,notesHit:i,notesTotal:this.notes.length,avgCents:s>0?a/s:0,perNote:this.notes.map(d=>d.activeMs>0?d.greenMs/d.activeMs:0),stability:r,vibrato:{present:f,rateHz:h}}}}const tn={light:{grid:"rgba(27,36,48,.07)",gridC:"rgba(27,36,48,.18)",label:"rgba(27,36,48,.42)",hitLine:"rgba(14,141,127,.6)",note:"rgba(14,141,127,.26)",noteActive:"rgba(14,141,127,.95)",noteGlow:"rgba(14,141,127,.5)",green:"#2fab84",yellow:"#e0a64a",red:"#e0544b",free:"#0e8d7f",glow:0},dark:{grid:"rgba(255,255,255,.055)",gridC:"rgba(255,255,255,.14)",label:"rgba(255,255,255,.45)",hitLine:"rgba(61,229,201,.7)",note:"rgba(61,229,201,.2)",noteActive:"rgba(61,229,201,.95)",noteGlow:"rgba(61,229,201,.85)",green:"#3ee6a8",yellow:"#ffc24d",red:"#ff6b61",free:"#3de5c9",glow:10}};class Ns{constructor(e,n,a={}){this.theme=tn[a.theme]||tn.light,this.canvas=e,this.ctx=e.getContext("2d"),this.ex=n,this.secPerBeat=60/(n.tempo||90),this.greenCents=n.greenCents||20,this.yellowCents=n.yellowCents||40,this.pxPerSec=a.pxPerSec||150,this.hitFrac=a.hitFrac??.26,this.leadIn=a.leadIn??2.2;let s=this.leadIn;this.timed=n.notes.map(o=>{const c=o.beats*this.secPerBeat,l={midi:o.midi,hz:G(o.midi),start:s,end:s+c,dur:c};return s+=c,l}),this.totalTime=s+.6;const i=n.notes.map(o=>o.midi);this.minMidi=Math.min(...i)-3,this.maxMidi=Math.max(...i)+3,this.trail=[]}yFor(e,n){const a=G(this.minMidi),s=G(this.maxMidi),i=Math.max(a,Math.min(s,e)),o=Math.log2(i/a)/Math.log2(s/a);return n-o*n}activeAt(e){for(let n=0;n<this.timed.length;n++)if(e>=this.timed[n].start&&e<this.timed[n].end)return{index:n,seg:this.timed[n]};return null}evaluate(e,n,a){const s=this.activeAt(e);if(!s)return{index:-1,zone:null,voiced:!1};if(!a||!n)return{index:s.index,zone:"red",voiced:!1};const i=Math.abs(Rt(n,s.seg.hz));return{index:s.index,zone:Ze(i,this.greenCents,this.yellowCents),voiced:!0}}draw(e,n,a){const s=this.ctx,i=this.canvas.clientWidth,o=this.canvas.clientHeight,c=i*this.hitFrac;s.clearRect(0,0,i,o);const l=this.theme;for(let g=Math.ceil(this.minMidi);g<=this.maxMidi;g++){const y=this.yFor(G(g),o),w=Tn(g),A=w&&w.startsWith("C");s.strokeStyle=A?l.gridC:l.grid,s.lineWidth=1,s.beginPath(),s.moveTo(0,y),s.lineTo(i,y),s.stroke(),A&&(s.fillStyle=l.label,s.font="10px Inter, sans-serif",s.fillText(w,4,y-3))}s.strokeStyle=l.hitLine,s.lineWidth=2,s.setLineDash([5,6]),s.beginPath(),s.moveTo(c,0),s.lineTo(c,o),s.stroke(),s.setLineDash([]);const r=this.activeAt(e),u=r?r.index:-1,h=16;for(let g=0;g<this.timed.length;g++){const y=this.timed[g],w=c+(y.start-e)*this.pxPerSec,A=y.dur*this.pxPerSec;if(w+A<-20||w>i+20)continue;const L=this.yFor(y.hz,o),p=g===u,S=8;s.fillStyle=p?l.noteActive:l.note,Os(s,w,L-h/2,Math.max(A,10),h,S),s.fill(),p&&(s.shadowColor=l.noteGlow,s.shadowBlur=18+l.glow,s.fill(),s.shadowBlur=0)}let f=null,d="#5e6b7a";if(a&&n)if(f=this.yFor(n,o),r){const g=Ze(Math.abs(Rt(n,r.seg.hz)),this.greenCents,this.yellowCents);d=g==="green"?l.green:g==="yellow"?l.yellow:l.red}else d=l.free;for(this.trail.push(f);this.trail.length>70;)this.trail.shift();const v=this.trail.length,m=2.2;s.strokeStyle=d,s.lineWidth=3,s.lineJoin="round",s.globalAlpha=.45,l.glow&&(s.shadowColor=d,s.shadowBlur=l.glow),s.beginPath();let b=!1;for(let g=0;g<v;g++){const y=this.trail[g];if(y==null){b=!1;continue}const w=c-(v-1-g)*m;b?s.lineTo(w,y):(s.moveTo(w,y),b=!0)}s.stroke(),s.shadowBlur=0;for(let g=0;g<v;g++){const y=this.trail[g];if(y==null)continue;const w=c-(v-1-g)*m;s.globalAlpha=.12+g/v*.5,s.fillStyle=d,s.beginPath(),s.arc(w,y,2,0,Math.PI*2),s.fill()}s.globalAlpha=1,f!=null&&(s.fillStyle=d,s.shadowColor=d,s.shadowBlur=16,s.beginPath(),s.arc(c,f,7,0,Math.PI*2),s.fill(),s.shadowBlur=0)}}function Os(t,e,n,a,s,i){const o=Math.min(i,s/2,a/2);t.beginPath(),t.moveTo(e+o,n),t.arcTo(e+a,n,e+a,n+s,o),t.arcTo(e+a,n+s,e,n+s,o),t.arcTo(e,n+s,e,n,o),t.arcTo(e,n,e+a,n,o),t.closePath()}const js=(()=>{try{return/Mobi|Android|iPhone|iPad|iPod/i.test(navigator.userAgent)||(navigator.maxTouchPoints||0)>1}catch{return!1}})(),_s=js?2.8:1.8;let Sn=_s,kt=null;function ce(t){if(!(!Number.isFinite(t)||t<=0)&&(Sn=t,kt&&kt.__rtGain))try{kt.__rtGain.gain.setTargetAtTime(t,kt.currentTime,.02)}catch{}}function In(t){if(t.__rtMaster)return kt=t,t.__rtMaster;const e=t.createDynamicsCompressor();e.threshold.value=-10,e.knee.value=24,e.ratio.value=4,e.attack.value=.003,e.release.value=.25;const n=t.createGain();return n.gain.value=Sn,e.connect(n).connect(t.destination),t.__rtMaster=e,t.__rtGain=n,kt=t,e}function ft(t,e,n=.6,a=0,s=.22,i="piano"){const o=t.currentTime+a,c=t.createGain();c.connect(In(t));const l=[];let r=n;const u=(h,f,d,v)=>{const m=t.createOscillator(),b=t.createGain();m.type=h,m.frequency.value=f,b.gain.value=d,m.connect(b).connect(v),m.start(o),m.stop(o+r+.08),l.push(m)};if(i==="piano")r=Math.max(1.6,n),c.gain.setValueAtTime(1e-4,o),c.gain.linearRampToValueAtTime(s,o+.008),c.gain.exponentialRampToValueAtTime(1e-4,o+r),[[1,1],[2,.5],[3,.25],[4,.12]].forEach(([h,f])=>u("sine",e*h,f,c));else if(i==="guitar"){r=Math.max(1.3,n);const h=t.createBiquadFilter();h.type="lowpass",h.frequency.setValueAtTime(3800,o),h.frequency.exponentialRampToValueAtTime(700,o+r),h.connect(c),c.gain.setValueAtTime(1e-4,o),c.gain.linearRampToValueAtTime(s,o+.006),c.gain.exponentialRampToValueAtTime(1e-4,o+r),[[1,1],[2,.32]].forEach(([f,d])=>u("sawtooth",e*f,d,h))}else r=Math.max(.2,n),c.gain.setValueAtTime(0,o),c.gain.linearRampToValueAtTime(s,o+.025),c.gain.setValueAtTime(s,o+Math.max(.05,r-.1)),c.gain.linearRampToValueAtTime(0,o+r),u("triangle",e,1,c),u("triangle",e*2,.18,c);return{dur:n,stop(){try{l.forEach(h=>{h.stop(),h.disconnect()}),c.disconnect()}catch{}}}}function en(t,e,n=0,a=1.4,s=.14,i="piano"){return[0,4,7].forEach(o=>{const c=440*Math.pow(2,(e+o-69)/12);ft(t,c,a,n,s,i)}),a}function Gs(t,e,n=.42,a="piano"){return e.forEach((s,i)=>ft(t,s,n*.9,i*n,.22,a)),e.length*n}function Kt(t,e=0,n=!1){const a=t.currentTime+e,s=t.createOscillator(),i=t.createGain();s.frequency.value=n?1600:1050;const o=n?.4:.26;i.gain.setValueAtTime(1e-4,a),i.gain.exponentialRampToValueAtTime(o,a+.005),i.gain.exponentialRampToValueAtTime(1e-4,a+.08),s.connect(i).connect(In(t)),s.start(a),s.stop(a+.1)}function Bn(t,e,n,a=.05){const s=[0,7,12].map(i=>{const o=440*Math.pow(2,(e+i-69)/12);return ft(t,o,n,0,a,"soft")});return{stop(){try{s.forEach(i=>i.stop())}catch{}}}}const Jt=[{key:"ionian",name:"Ионийский (мажор)",intervals:[0,2,4,5,7,9,11],tier:"free"},{key:"aeolian",name:"Эолийский (минор)",intervals:[0,2,3,5,7,8,10],tier:"standard"},{key:"dorian",name:"Дорийский",intervals:[0,2,3,5,7,9,10],tier:"pro"},{key:"phrygian",name:"Фригийский",intervals:[0,1,3,5,7,8,10],tier:"pro"},{key:"lydian",name:"Лидийский",intervals:[0,2,4,6,7,9,11],tier:"pro"},{key:"mixolydian",name:"Миксолидийский",intervals:[0,2,4,5,7,9,10],tier:"pro"},{key:"locrian",name:"Локрийский",intervals:[0,1,3,5,6,8,10],tier:"pro"},{key:"harm_major",name:"Гармонический мажор",intervals:[0,2,4,5,7,8,11],tier:"pro"},{key:"harm_minor",name:"Гармонический минор",intervals:[0,2,3,5,7,8,11],tier:"pro"}],nn={free:0,standard:1,pro:2};function Te(t){return Jt.find(e=>e.key===t)||Jt[0]}function Cn(t,e="free"){const n=Te(t);return nn[n.tier]<=nn[e||"free"]}function Ws(t,e){const n=e.intervals,a=Math.round(t)-1,s=Math.floor(a/7),i=(a%7+7)%7;return n[i]+12*s}function yt(t,e){const n=Te(e);return t.map(a=>Ws(a,n))}const z=(t,e=1)=>({midi:t,beats:e});function An(t){return{id:"vhold",name:"Calm Down Vowels",syllable:"И-Э-А-О-У",tempo:78,kind:"vowel",root:t,grooveStyle:"soft",greenCents:25,desc:"Унификация гласных: держим позицию, меняем только гласную «И-Э-А-О-У».",how:"Пой «И-Э-А-О-У» ровно, без «прыжков» голосом при смене гласной. Сначала ниже, потом строка повторяется выше — позиция единая.",notes:[0,0,0,0,0,0,0,0,0,0,3,3,3,3,3,3,3,3,3,3].map((n,a)=>z(t+n,a<10?.5:.25))}}function Hn(t){return{id:"vscale",name:"Disco Vowels",syllable:"И-Э-А-О-У",tempo:124,kind:"scale",root:t,grooveStyle:"pop",desc:"Точность высоты при смене гласной — каждая гласная ведёт по двум нотам.",how:"Пой «И-Э-А-О-У» легко и точно, попадая в каждую ноту слига. Не зажимайся.",notes:[0,1,5,7,8,7,5,1,7,5].map(n=>z(t+n,.75))}}function Rn(t){return{id:"vagil",name:"No Bubble Gum",syllable:"И-Э-И-А-И-О-И-У",tempo:100,kind:"agility",root:t,grooveStyle:"funk",desc:"Беглость и точность: зигзаг по ступеням вверх и обратно.",how:"Лёгко и быстро веди голос по нотам зигзагом вверх, не зажимаясь. Гласные чёткие.",notes:[0,3,1,5,3,7,5,8,7,3,5,1,0].map(n=>z(t+n,.5))}}function qn(t){return{id:"vclimb",name:"High Five",syllable:"И-Э-А-О-У",tempo:82,kind:"jump",root:t,grooveStyle:"soft",desc:"Гибкость и точность интервала: чистые скачки на квинту, затем ровная гамма.",how:"Чисто бери скачок на квинту вверх и обратно (без зажима), в конце — ровная гамма вверх. Опора дыханием.",notes:[0,7,0,7,0,7,0,7,0,7,0,1,3,5,7].map(n=>z(t+n,.5))}}function Dn(t){return{id:"jcharles",name:"James Charles Warm Up",syllable:"И-Э-А-О-У",tempo:130,kind:"agility",root:t,grooveStyle:"swing",desc:"Гибкость и позиция гласных: повторяющийся мотив, затем плавный спуск.",how:"Лёгко веди гласные по мотиву, в конце мягко спустись. Без зажима, позиция единая.",notes:[0,1,5,0,1,5,0,1,5,8,8,7,5,1].map(n=>z(t+n,.5))}}function Pn(t,e="ionian"){const n=yt([1,2,3,2,1],e);return{id:"vowels",name:"Цепочка гласных",syllable:"Ми-Ме-Ма",tempo:90,kind:"scale",root:t,modeKey:e,grooveStyle:"swing",desc:"Выравнивание гласных и сохранение позиции при смене звука.",how:"Пой по кругу гласные «Ми-Ме-Ма-Мо», широко раскрывая рот, держи единую позицию.",notes:n.map(a=>z(t+a,1))}}function Fn(t,e="ionian"){const n=yt([1,1,3,2,1,1,-2,1,1,3,2,1],e);return{id:"jump5",name:"Скачок к V ступени",syllable:"Ям",tempo:100,kind:"jump",root:t,modeKey:e,grooveStyle:"latin",desc:"Точная атака интервалов и контроль регистра при скачках.",how:"Пой на «Ям». Перед скачком на квинту не зажимайся — целься точно в ноту.",notes:n.map(a=>z(t+a,1))}}function zn(t,e="ionian"){const a=yt([1,2,3,4,5,6,7,8,7,6,5,4,3,2,1],e);return{id:"lad",name:"Ладовая «ЯМ»",syllable:"Ям",tempo:100,kind:"scale",root:t,modeKey:e,drone:!0,grooveStyle:"march",desc:"Слух и ощущение ладовой окраски — гамма лада вверх и вниз.",how:"Пой на «Ям» по ступеням лада вверх до октавы и обратно. Слушай окраску лада.",notes:a.map(s=>z(t+s,1))}}function Vn(t,e=8){return{id:"sustain",name:"Удержание ноты",syllable:"А",tempo:70,kind:"sustain",root:t,grooveStyle:"ballad",desc:"Учит держать ровный стабильный звук и дыхательную опору — основа пения.",how:"Слушай образец, потом тяни ноту на «А» как можно ровнее. Держи шарик в зелёной зоне без дрожи.",notes:[z(t,e)]}}function Nn(t){return{id:"vibrato",name:"Вибрато",syllable:"А",tempo:60,kind:"vibrato",root:t,grooveStyle:"ballad",greenCents:55,yellowCents:95,desc:"Ровное вибрато — мягкое «качание» высоты примерно 5–6 раз в секунду.",how:"Сначала тяни ровную «А». Когда звук устойчив — добавь лёгкую «волну» голосом, 5–6 колебаний в секунду. Колебание идёт от дыхания и опоры, не дави горлом. На итоге увидишь частоту своего вибрато.",notes:[z(t,10)]}}function On(t){return{id:"vwobble",name:"Раскачка вибрато",syllable:"А",tempo:120,kind:"vibrato",root:t,grooveStyle:"soft",greenCents:55,desc:"Запуск вибрато: ровный звук с лёгким «качанием» высоты — основа естественного вибрато.",how:"Пой «А» и добавь мягкое колебание голосом — вверх-вниз небольшими шагами. Колебание идёт от опоры дыхания, не дави горлом.",notes:[0,1,0,1,0,1,0,5,6,5,6,5,6,5].map(n=>z(t+n,.5))}}function jn(t){return{id:"timbre",name:"Тёплый тон",syllable:"Мо",tempo:96,kind:"scale",root:t,grooveStyle:"ballad",desc:"Качество тембра: ровный, округлый звук при движении голоса по нотам.",how:"Пой «Мо» округло и тепло, держи одинаковый тембр на каждой ноте. Не зажимай, звук в маску.",notes:[0,1,3,0,1,3,1,0,0,1,3,5,7,5].map(n=>z(t+n,.5))}}function _n(t){return{id:"timbre2",name:"Ровный тон на двух",syllable:"А",tempo:80,kind:"sustain",root:t,grooveStyle:"ballad",desc:"Единый тембр при переходе между двумя высотами (вниз на кварту и обратно).",how:"Держи одинаковый округлый звук на обеих нотах — не «бели» нижнюю и не зажимай верхнюю.",notes:[0,0,0,-5,-5,0,0,-5,-5].map(n=>z(t+n,1))}}function Gn(t){return{id:"regarp",name:"Через регистры",syllable:"Но",tempo:92,kind:"jump",root:t,grooveStyle:"soft",desc:"Плавный переход (passaggio): соединяем нижний и верхний регистр через опорные тоны аккорда.",how:"Пой «Но», возвращаясь к тонике и беря всё выше (терция → квинта → октава). Без «слома» на переходе — мягко.",notes:[0,3,0,7,0,12,0,7,0,3].map(n=>z(t+n,.6))}}function Wn(t){return{id:"regoct",name:"Октавная связка",syllable:"А",tempo:76,kind:"jump",root:t,grooveStyle:"soft",desc:"Связка регистров на октаве — без резкого «переключения» голоса.",how:"Спокойно прыгай на октаву вверх и обратно, целься в центр ноты. Верх не криком, а на опоре и резонансе.",notes:[0,12,0,12].map(n=>z(t+n,1.5))}}function Un(t){return{id:"belt",name:"Белтинг — гамма",syllable:"Эй",tempo:112,kind:"scale",root:t,grooveStyle:"drive",desc:"Яркая опёртая подача (белтинг) на пятинотной гамме — мощно, но без зажима.",how:"Пой «Эй» ярко и звонко, опираясь дыханием. Звук вперёд (в маску), горло свободно. Не дави на верхних нотах.",notes:[0,1,3,5,7,5,3,1,0].map(n=>z(t+n,.6))}}function Yn(t){return{id:"beltoct",name:"Белт — октава",syllable:"Эй",tempo:100,kind:"jump",root:t,grooveStyle:"drive",desc:"Опёртая атака верхней ноты через октаву — энергично и безопасно.",how:"Бери октаву вверх ярко и точно, на опоре. Не тянись горлом — звук на дыхании и в резонаторах.",notes:[0,12,0,12,0,12,0].map(n=>z(t+n,.8))}}function Kn(t){return{id:"artic",name:"Чёткое стаккато",syllable:"Та",tempo:132,kind:"agility",root:t,grooveStyle:"funk",desc:"Чёткая артикуляция и точная атака: одна нота, быстрые ясные слоги.",how:"Пой «Та-Та-Та» коротко и чётко на одной высоте. Согласная ясная, гласная ровная, звук не «расползается».",notes:[0,0,0,0,0,0,0,0].map(n=>z(t+n,.5))}}function Jn(t){return{id:"artic2",name:"Слоги по группам",syllable:"Та-Ка",tempo:120,kind:"agility",root:t,grooveStyle:"funk",desc:"Дикция при смене высоты: чёткие слоги группами на двух нотах.",how:"Пой «Та-Ка-Та» группами, чисто меняя высоту вниз и обратно. Каждый слог ясный, ритм ровный.",notes:[0,0,0,-5,-5,-5,0,0,0,-5,-5,-5].map(n=>z(t+n,.5))}}function Xn(t){return{id:"resist",name:"Стамина-фигура",syllable:"Ма",tempo:116,kind:"agility",root:t,grooveStyle:"march",desc:"Выносливость и ровность: устойчивый мотив-«волчок» много раз без потери опоры.",how:"Пой «Ма» по фигуре вверх-вниз ровно и не уставая. Дыхание ровное, опора держится до конца.",notes:[0,1,3,1,0,1,3,1,0,1,3,1,0].map(n=>z(t+n,.5))}}function Qn(t){return{id:"resist2",name:"Выносливая гамма",syllable:"Ма",tempo:126,kind:"agility",root:t,grooveStyle:"march",desc:"Дыхательная выносливость: длинный ровный пробег по гамме без добора воздуха.",how:"Пой «Ма» по гамме вверх-вниз дважды на одном дыхании, ровно и точно. Распредели воздух до конца.",notes:[0,1,3,5,7,5,3,1,0,1,3,5,7,5,3,1,0].map(n=>z(t+n,.5))}}function Zn(t,e="ionian"){const n=yt([1,2,3,4,5,4,3,2,1],e);return{id:"scale5",name:"Гамма «Ма-Мэ»",syllable:"Ма",tempo:104,kind:"scale",root:t,modeKey:e,grooveStyle:"pop",desc:"Тренирует точность интонации — чистое попадание в каждую ступень гаммы.",how:"Пой «Ма» и попадай в каждую ноту, которая подъезжает к линии. Старайся держать зелёный.",notes:n.map(a=>z(t+a,1))}}function ts(t,e="ionian"){const n=yt([1,2,3,4,5,6,5,4,3,2,1],e);return{id:"agility",name:"Беглость «Ма»",syllable:"Ма",tempo:138,kind:"agility",root:t,modeKey:e,grooveStyle:"funk",desc:"Развивает беглость: быстрые и точные переходы между нотами (как в Vocalista).",how:"Пой «Ма» легко и быстро, попадая в каждую ноту пробегающего пассажа. Не зажимайся.",notes:n.map(a=>z(t+a,.5))}}function es(t){return{id:"jump",name:"Октавный скачок",syllable:"А",tempo:84,kind:"jump",root:t,grooveStyle:"drive",desc:"Учит координации между нижним и верхним регистром голоса.",how:"Пой «А», точно прыгая на октаву вверх и обратно вниз. Целься в центр ноты.",notes:[z(t+12,2),z(t,2),z(t+12,2),z(t,2)]}}function Se(t,e="ionian"){const n=yt([1,2,3,2,1],e);return{id:"hum3",name:"Мычание по гамме",syllable:"М",tempo:92,kind:"hum",root:t,modeKey:e,grooveStyle:"soft",desc:"Мягкая активация голоса и резонаторов на «м-м-м» — три ступеньки вверх и обратно.",how:"Сомкни губы и мычи «м», идя по нотам: вверх три ступени и вниз. Звук в маску/нос.",notes:n.map(a=>z(t+a,1))}}function Ie(t,e="ionian"){const n=yt([1,2,3,4,5,4,3,2,1,5,1],e);return{id:"trill",name:"Губной тренаж «brrr»",syllable:"brrr",tempo:120,kind:"trill",root:t,modeKey:e,grooveStyle:"drive",desc:"Ровный воздушный поток и гибкость: пять ступеней вверх-вниз и скачок на квинту.",how:"Губами «brrr» (если не выходит — на «Р»). Веди по нотам ровно, в конце — скачок на квинту и тонику.",notes:n.map(a=>z(t+a,.75))}}function Us(t){return t.notes.map(e=>G(e.midi))}function Be(t,e,n,a=4){const s=t.notes.map(u=>u.midi),i=Math.min(...s),o=Math.max(...s);if(!Number.isFinite(e)||!Number.isFinite(n))return[0];const c=Math.max(0,Math.min(a,n-o)),l=Math.max(0,Math.min(a,i-e)),r=[];for(let u=0;u<=c;u++)r.push(u);for(let u=c-1;u>=-l;u--)r.push(u);return r.length?r:[0]}function sn(t){if(t.__noise)return t.__noise;const e=t.createBuffer(1,Math.floor(t.sampleRate*.5),t.sampleRate),n=e.getChannelData(0);for(let a=0;a<n.length;a++)n[a]=Math.random()*2-1;return t.__noise=e,e}const an={pop:{kick:[0,4],snare:[2,6],hatOpen:[7],bass:[[0,0],[3,0],[4,7]],stab:[3,7],swing:0},funk:{kick:[0,3,6],snare:[2,6],hatOpen:[3,7],bass:[[0,0],[1,7],[4,0],[6,7]],stab:[1,3,5,7],swing:.18},soft:{kick:[0,4],snare:[6],hatOpen:[],bass:[[0,0],[4,7]],stab:[3],swing:0},drive:{kick:[0,2,4,6],snare:[2,6],hatOpen:[],bass:[[0,0],[2,0],[4,7],[6,7]],stab:[4],swing:0},march:{kick:[0,2,4,6],snare:[4],hatOpen:[0,4],bass:[[0,0],[2,7],[4,0],[6,7]],stab:[],swing:0},swing:{kick:[0,4],snare:[2,6],hatOpen:[3,7],bass:[[0,0],[3,5],[4,7],[6,12]],stab:[3,7],swing:.34},ballad:{kick:[0],snare:[4],hatOpen:[],bass:[[0,0],[4,7]],stab:[2,6],swing:0},latin:{kick:[0,3,6],snare:[2,7],hatOpen:[5],bass:[[0,0],[3,7],[6,5]],stab:[2,5],swing:0}};function Ys(t,{rootMidi:e=60,tempo:n=100,dur:a=16,style:s="pop",gain:i=.5,when:o=0}={}){const c=an[s]||an.pop,l=t.currentTime+o,r=60/n,u=r/2,h=r*4,f=Math.ceil(a/h)+1,d=t.createGain();d.gain.value=i;const v=t.createDynamicsCompressor();v.threshold.value=-12,v.ratio.value=4,d.connect(v).connect(t.destination);const m=[],b=p=>{const S=t.createOscillator(),k=t.createGain();S.frequency.setValueAtTime(150,p),S.frequency.exponentialRampToValueAtTime(48,p+.12),k.gain.setValueAtTime(.9,p),k.gain.exponentialRampToValueAtTime(.001,p+.18),S.connect(k).connect(d),S.start(p),S.stop(p+.2),m.push(S)},g=p=>{const S=t.createBufferSource();S.buffer=sn(t);const k=t.createBiquadFilter();k.type="bandpass",k.frequency.value=1800,k.Q.value=.7;const E=t.createGain();E.gain.setValueAtTime(.5,p),E.gain.exponentialRampToValueAtTime(.001,p+.14),S.connect(k).connect(E).connect(d),S.start(p),S.stop(p+.16),m.push(S)},y=(p,S)=>{const k=t.createBufferSource();k.buffer=sn(t);const E=t.createBiquadFilter();E.type="highpass",E.frequency.value=7e3;const H=t.createGain(),C=S?.12:.035;H.gain.setValueAtTime(.22,p),H.gain.exponentialRampToValueAtTime(.001,p+C),k.connect(E).connect(H).connect(d),k.start(p),k.stop(p+C+.02),m.push(k)},w=(p,S,k)=>{const E=t.createOscillator(),H=t.createGain();E.type="triangle",E.frequency.value=G(S),H.gain.setValueAtTime(1e-4,p),H.gain.linearRampToValueAtTime(.4,p+.01),H.gain.setValueAtTime(.4,p+k*.5),H.gain.exponentialRampToValueAtTime(.001,p+k),E.connect(H).connect(d),E.start(p),E.stop(p+k+.02),m.push(E)},A=p=>{[e,e+7,e+12].forEach(S=>{const k=t.createOscillator(),E=t.createGain();k.type="triangle",k.frequency.value=G(S),E.gain.setValueAtTime(1e-4,p),E.gain.linearRampToValueAtTime(.09,p+.008),E.gain.exponentialRampToValueAtTime(.001,p+.17),k.connect(E).connect(d),k.start(p),k.stop(p+.2),m.push(k)})},L=e-12;for(let p=0;p<f;p++){const S=l+p*h,k=E=>S+E*u+(E%2?c.swing*u:0);c.kick.forEach(E=>b(k(E))),c.snare.forEach(E=>g(k(E)));for(let E=0;E<8;E++)y(k(E),c.hatOpen.includes(E));c.bass.forEach(([E,H])=>w(k(E),L+H,u*1.6)),c.stab.forEach(E=>A(k(E)))}return{duck(p){const S=p?i*.25:i;try{d.gain.setTargetAtTime(S,t.currentTime,.04)}catch{}},stop(){try{m.forEach(p=>{try{p.stop()}catch{}p.disconnect&&p.disconnect()}),d.disconnect(),v.disconnect()}catch{}}}}const Ce="raspevka.clock.v1";function ns(){try{return Number(localStorage.getItem(Ce))||0}catch{return 0}}function vt(){return Date.now()+ns()}function ss(){return new Date(vt())}function lt(t=ss()){return t.toISOString().slice(0,10)}function as(){return Math.round(ns()/864e5)}function Ks(t){try{localStorage.setItem(Ce,String(Math.round(t)*864e5))}catch{}}function ve(t){Ks(as()+t)}function be(){try{localStorage.removeItem(Ce)}catch{}}const Ae="raspevka.progress.v1";function x(){try{return JSON.parse(localStorage.getItem(Ae))||{}}catch{return{}}}function D(t){try{localStorage.setItem(Ae,JSON.stringify(t))}catch{}}function is(){try{localStorage.removeItem(Ae)}catch{}}function Js(){const t=x();return t.range&&Number.isFinite(t.range.low)?t.range:null}function os(t){const e=x(),n=lt(),a=lt(new Date(vt()-864e5)),s=lt(new Date(vt()-2*864e5));let i=!1;return e.lastDate!==n?(e.lastDate===a?e.streak=(e.streak||0)+1:e.lastDate===s&&(e.freezes||0)>0?(e.freezes-=1,i=!0,e.streak=(e.streak||0)+1):e.streak=1,e.lastDate=n,e.streak>0&&e.streak%7===0&&(e.freezes=Math.min(2,(e.freezes||0)+1))):e.streak||(e.streak=1),e.history=e.history||[],e.history.push({date:n,pct:t.pct,stars:t.stars}),e.history.length>200&&(e.history=e.history.slice(-200)),e.total=(e.total||0)+1,D(e),{streak:e.streak,total:e.total,freezeSpent:i}}function le(){return x().streak||0}function Xt(){return x().freezes||0}function Xs(t){const e=x();return e.freezes=Math.max(0,Math.min(2,Math.round(t))),D(e),e.freezes}function Qs(){const t=lt();return(x().history||[]).some(e=>e.date===t)}function pe(t){const e=x();return e.streak=Math.max(0,Math.round(t)),e.lastDate=lt(),D(e),e.streak}function Zs(){return x().history||[]}function ta(){return x().rangeHistory||[]}function ea(){return x().total||0}function na(t){const e=x();return e.leads=e.leads||[],e.leads.push({ts:vt(),...t}),e.leads.length>50&&(e.leads=e.leads.slice(-50)),D(e),e.leads}function Ft(){return x().examsPassed||[]}function sa(t){const e=x();return e.examsPassed=e.examsPassed||[],e.examsPassed.includes(t)||(e.examsPassed.push(t),D(e)),e.examsPassed}function aa(t){return(x().blockItems||{})[t]||[]}function on(t,e){const n=x();n.blockItems=n.blockItems||{};const a=n.blockItems[t]||[];return a.includes(e)||(a.push(e),n.blockItems[t]=a,D(n)),a}function U(){return x().modeKey||"ionian"}function cs(t){const e=x();return e.modeKey=t,D(e),t}function xt(){return x().tier||"free"}function _t(t){const e=x();return e.tier=t,D(e),t}const Mt=5,ia=25;function qt(){return Mt}function bt(){const t=x();let e=t.energy==null?Mt:t.energy;if(e<Mt&&t.energyTs){const n=Math.floor((vt()-t.energyTs)/(ia*6e4));n>0&&(e=Math.min(Mt,e+n))}return e}function Gt(t){const e=x(),n=Math.max(0,Math.min(Mt,Math.round(t)));return e.energy=n,e.energyTs=n<Mt?vt():null,D(e),n}function $e(t){return Gt(bt()+t)}function He(){return x().groove||"off"}function ls(t){const e=x();return e.groove=t,D(e),t}function oa(t){const e=x();if(!e.range||!Number.isFinite(e.range.low))return{extended:null};let n=null;return t>e.range.high?(e.range.high=t,n="high"):t<e.range.low&&(e.range.low=t,n="low"),n&&(e.rangeHistory=e.rangeHistory||[],e.rangeHistory.push({date:lt(),low:e.range.low,high:e.range.high}),e.rangeHistory.length>100&&(e.rangeHistory=e.rangeHistory.slice(-100)),D(e)),{extended:n,midi:t}}function st(){const t=x();return t.voice&&t.voice.key?t.voice:null}function cn(t,e=null,n=null){const a=x(),s=a.voice||{};return a.voice={key:t,low:e??s.low??null,high:n??s.high??null},e!=null&&n!=null&&(a.range={low:Math.round(e),high:Math.round(n)},a.rangeHistory=a.rangeHistory||[],a.rangeHistory.push({date:lt(),low:Math.round(e),high:Math.round(n)}),a.rangeHistory.length>100&&(a.rangeHistory=a.rangeHistory.slice(-100))),D(a),a.voice}const ca={easy:.6,medium:.8,fast:1};function Re(){return x().difficulty||"easy"}function rs(t){const e=x();return e.difficulty=t,D(e),t}function la(){return ca[Re()]||.6}function Lt(){return x().guide!==!1}function ds(t){const e=x();return e.guide=!!t,D(e),e.guide}function pt(){return x().headphones===!0}function us(t){const e=x();return e.headphones=!!t,D(e),e.headphones}function ra(){return Lt()?pt()?"continuous":"prehear":"off"}function gt(){const t=x().timbre;return t==="guitar"||t==="soft"?t:"piano"}function ms(t){const e=x();return e.timbre=t,D(e),e.timbre}function hs(){try{const t=navigator.userAgent||"";return/Mobi|Android|iPhone|iPad|iPod/i.test(t)||(navigator.maxTouchPoints||0)>1}catch{return!1}}const qe={quiet:1,normal:1.8,loud:2.8,max:4.2};function da(){return hs()?"loud":"normal"}function re(){const t=x().volume;return qe[t]?t:da()}function de(){return qe[re()]}function fs(t){const e=x();return qe[t]&&(e.volume=t,D(e)),re()}const De={speaker:.09,wired:.12,bt:.24};function ua(){return"speaker"}function ue(){const t=x().route;return De[t]?t:ua()}function ma(t){const e=x();return De[t]&&(e.route=t,delete e.latencyManual,D(e)),ue()}function Pe(){const t=x().latencyManual;return Number.isFinite(t)?t:De[ue()]}function ln(t){const e=x();return e.latencyManual=Math.max(0,Math.min(.5,t)),D(e),e.latencyManual}function Ct(){return x().darkStage===!0}function ha(t){const e=x();return e.darkStage=!!t,D(e),e.darkStage}function Bt(){return x().micAGC===!0}function fa(t){const e=x();return e.micAGC=!!t,D(e),e.micAGC}const vs={low:1.5,med:3,high:5.5};function va(){return hs()?"high":"med"}function Fe(){const t=x().sensitivity;return vs[t]?t:va()}function ze(){return vs[Fe()]}function bs(t){const e=x();return e.sensitivity=t,D(e),t}function ps(){return x().breathBest||0}function ba(t){const e=x();return e.breathBest=Math.max(e.breathBest||0,t),D(e),e.breathBest}const Ve=5,pa=7;function Qt(){return x().paywallEnabled===!0}function ge(t){const e=x();return e.paywallEnabled=!!t,D(e),e.paywallEnabled}function gs(){const t=x();return t.trialStart||(t.trialStart=vt(),D(t)),t.trialStart}function Ne(){const t=x().trialStart;if(!t)return null;const e=pa-Math.floor((vt()-t)/864e5);return Math.max(0,e)}function ga(){const t=Ne();return t!=null&&t>0}function ya(){const t=x();delete t.trialStart,D(t)}function wa(){return xt()!=="free"||ga()}function ys(){const t=x();return t.uses&&t.uses.date===lt()?t.uses.count:0}function ws(){const t=x(),e=lt();return t.uses=t.uses&&t.uses.date===e?{date:e,count:t.uses.count+1}:{date:e,count:1},D(t),t.uses.count}function Ea(){return!Qt()||wa()?!1:ys()>=Ve}function $a(){return x().devMode===!0}function Zt(t){const e=x();return e.devMode=!!t,D(e),e.devMode}function ka(t){const e=x();return e.examsPassed=t.slice(),D(e),e.examsPassed}function xa(){const t=x();delete t.examsPassed,delete t.blockItems,D(t)}const te="raspevka.analytics.v1",rn=500;function Ma(t,e={}){try{const n=JSON.parse(localStorage.getItem(te)||"[]");n.push({t:Date.now(),type:t,...e}),n.length>rn&&n.splice(0,n.length-rn),localStorage.setItem(te,JSON.stringify(n))}catch{}}function La(){try{return JSON.parse(localStorage.getItem(te)||"[]")}catch{return[]}}function Ta(){try{localStorage.removeItem(te)}catch{}}function Sa(){const t=La(),e=t.filter(s=>s.type==="exercise_done"),n={};for(const s of e)(n[s.id||"—"]=n[s.id||"—"]||[]).push(s.pct||0);const a=Object.entries(n).map(([s,i])=>({id:s,runs:i.length,avgPct:Math.round(i.reduce((o,c)=>o+c,0)/i.length)})).sort((s,i)=>i.runs-s.runs);return{total:t.length,sessions:e.length,perEx:a}}const Ia="#0e8d7f",Ba="#0a766a",Ca="#687485",Aa="#ffffff",dn="#2a3340",Ha="#cfd6e0",Ra=[0,2,4,5,7,9,11],un=t=>Ra.includes((t%12+12)%12),qa=t=>`C${Math.floor(t/12)-1}`;function Es(t,e){if(t==null||e==null)return"";let n=Math.round(t)-2,a=Math.round(e)+2;for(;(n%12+12)%12!==0;)n--;for(;(a%12+12)%12!==11;)a++;const s=13,i=54,o=9,c=33,l=d=>d>=t&&d<=e,r=[];for(let d=n;d<=a;d++)un(d)&&r.push(d);const u=r.length*s,h={};r.forEach((d,v)=>{h[d]=v*s});let f="";r.forEach((d,v)=>{const m=v*s;f+=`<rect x="${m}" y="0" width="${s-1}" height="${i}" rx="2.5" fill="${l(d)?Ia:Aa}" stroke="${Ha}" stroke-width="1"/>`,(d%12+12)%12===0&&(f+=`<text x="${m+(s-1)/2}" y="${i+11}" text-anchor="middle" fill="${Ca}" font-size="8">${qa(d)}</text>`)});for(let d=n;d<=a;d++){if(un(d))continue;const v=h[d-1];if(v==null)continue;const m=v+s-o/2;f+=`<rect x="${m}" y="0" width="${o}" height="${c}" rx="2" fill="${l(d)?Ba:dn}" stroke="${dn}" stroke-width="1"/>`}return`
    <div class="mini-kb">
      <svg viewBox="0 0 ${u} ${i+14}" preserveAspectRatio="xMidYMid meet" role="img" aria-label="Диапазон голоса на клавиатуре">
        ${f}
      </svg>
    </div>`}function ke(t){if(!Array.isArray(t)||!t.length)return'<span class="ex-glyph"></span>';const e=t.map(m=>typeof m=="number"?{midi:m,beats:1}:{midi:m.midi,beats:m.beats||1}),n=e.map(m=>m.midi),a=Math.min(...n),s=Math.max(...n),i=Math.max(1,s-a)+1,o=e.reduce((m,b)=>m+b.beats,0),c=Math.max(5,Math.min(16,150/o)),l=10,r=1.6,u=l-4;let h=0,f="";for(const m of e){const b=Math.max(3,m.beats*c-r),g=(s-m.midi)*l+2,y=m.midi===s?' class="gh-hi"':"";f+=`<rect${y} x="${h.toFixed(1)}" y="${g}" width="${b.toFixed(1)}" height="${u}" rx="2"/>`,h+=m.beats*c}const d=h,v=i*l;return`<span class="ex-glyph"><svg viewBox="0 0 ${d.toFixed(0)} ${v}" preserveAspectRatio="xMidYMid meet" role="img" aria-label="Рисунок мелодии упражнения">${f}</svg></span>`}const mn=["#0e8d7f","#12a36b","#e0a64a","#5b8def","#e0544b","#9b6dd6"];function zt(t=1){if(window.matchMedia&&window.matchMedia("(prefers-reduced-motion: reduce)").matches)return;const e=t>=2?36:18,n=document.createElement("div");n.setAttribute("aria-hidden","true"),n.style.cssText="position:fixed;inset:0;pointer-events:none;z-index:999;overflow:hidden",document.body.appendChild(n);const a=window.innerWidth;for(let s=0;s<e;s++){const i=document.createElement("i"),o=5+Math.random()*6,c=Math.random()<.4;i.style.cssText=`position:absolute;top:-12px;left:${Math.random()*a}px;width:${o}px;height:${c?o:o*.45}px;background:${mn[s%mn.length]};border-radius:${c?"50%":"2px"};will-change:transform,opacity`,n.appendChild(i);const l=320+Math.random()*380,r=(Math.random()-.5)*160,u=1100+Math.random()*900;i.animate([{transform:"translate(0,0) rotate(0deg)",opacity:1},{transform:`translate(${r}px,${l}px) rotate(${(Math.random()-.5)*540}deg)`,opacity:0}],{duration:u,delay:Math.random()*250,easing:"cubic-bezier(.2,.6,.35,1)",fill:"forwards"})}setTimeout(()=>n.remove(),2600)}function ee(t=12){try{navigator.vibrate&&navigator.vibrate(t)}catch{}}let $s=!1;function ct(t,e,n,a,s={}){const{onExit:i,onAgain:o,onComplete:c,onResult:l,onNext:r,nextLabel:u,explain:h}=s;if(ce(de()),h){xe(t,a,{onExit:i,onStart:()=>ct(t,e,n,a,{...s,explain:!1}),onModeChange:s.rebuild?()=>ct(t,e,n,s.rebuild(),{...s,explain:!0}):null});return}const f=s.reps,d=s.repIndex||0,v=f&&f.length&&f[d]||0,m=a.root!=null?a.root:a.notes[0].midi,b=v?{...a,root:m+v,notes:a.notes.map(M=>({...M,midi:M.midi+v}))}:a,g=f&&f.length>1?` · ${d+1}/${f.length}`:"";t.innerHTML=`
    <div class="screen game ${Ct()?"stage-dark":""}">
      <div class="game-top">
        <button class="icon-btn" id="exit">‹ Меню</button>
        <div class="ex-name">${b.name} · <span class="syl">«${b.syllable}»</span>${g}</div>
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
  `;const y=document.getElementById("hw"),w=y.getContext("2d"),A=document.getElementById("msg"),L=document.getElementById("livebar"),p=document.getElementById("target"),S=document.getElementById("yours"),k=document.getElementById("cue");function E(){const M=Math.min(window.devicePixelRatio||1,2);y.width=y.clientWidth*M,y.height=y.clientHeight*M,w.setTransform(M,0,0,M,0,0)}E(),window.addEventListener("resize",E);const H=la(),C={...b,tempo:Math.max(40,Math.round(b.tempo*H))},T=new Ns(y,C,{theme:Ct()?"dark":"light"}),R=new Vs(b.notes.length),$=Pe(),B=pt()||ue()!=="speaker";let q=null,_=null,P=0,Z=0,tt=!1,ut=!1,Nt=0,_e=-1;const wt=[],he=[],Tt=(M,N)=>{const O=setTimeout(M,N);return he.push(O),O};function Ge(){wt.forEach(M=>M&&M.stop&&M.stop()),wt.length=0}function fe(){_&&(cancelAnimationFrame(_),_=null),he.forEach(clearTimeout),he.length=0,window.removeEventListener("resize",E),document.removeEventListener("visibilitychange",We),Ge()}function We(){document.hidden?(_&&(cancelAnimationFrame(_),_=null),Ge(),P&&!tt&&(tt=!0,ut=!0)):ut&&(ut=!1,Ue())}document.addEventListener("visibilitychange",We),document.getElementById("exit").addEventListener("click",()=>{fe(),i()});function Ue(){fe(),ct(t,e,n,a,{...s,explain:!1})}Ut(document.getElementById("gsettings"),Ue,e);const Ot=b.root!=null?b.root:b.notes[0].midi,Rs=Us(b),St=gt();T.draw(0,null,!1),d===0?(A.textContent="Слушай тонику…",en(e.ctx,Ot,0,1.4,.14,St),Tt(()=>{A.textContent="Образец…";const M=Gs(e.ctx,Rs,.34,St);Tt(qs,M*1e3+250)},1650)):(A.textContent=(v>0?"↑ выше":"↓ ниже")+` · повтор ${d+1}/${f.length}`,en(e.ctx,Ot,0,.8,.14,St),Tt(()=>{Kt(e.ctx,0,!0),Tt(Ye,480)},950));function qs(){let M=3;const N=()=>{M>0?(Kt(e.ctx),A.textContent="Приготовься… "+M,M-=1,Tt(N,600)):Ye()};N()}function Ye(){const M=ra();A.textContent=M==="continuous"?"Пой за подсказкой!":M==="prehear"?"Слушай тон и повторяй!":"Пой!",n.reset(),P=performance.now(),Z=P,Nt=P,M==="continuous"?T.timed.forEach(W=>{wt.push(ft(e.ctx,W.hz,Math.max(.2,W.dur*.92),W.start,.1,St))}):M==="prehear"&&T.timed.forEach(W=>{const Q=Math.min(.4,W.dur);wt.push(ft(e.ctx,W.hz,Q,Math.max(0,W.start-Q),.18,St))}),b.drone&&wt.push(Bn(e.ctx,Ot,T.totalTime+.5,.05));const N=He(),O=N==="auto"?b.grooveStyle||"pop":N;O!=="off"&&(q=Ys(e.ctx,{rootMidi:Ot,tempo:C.tempo,dur:T.totalTime,style:O,gain:.45}),wt.push(q)),Ke()}function Ke(){const M=performance.now(),N=(M-P)/1e3,O=M-Z;Z=M;const W=e.read();let Q=!1,et=null;if(W){const mt=n.process(W);Q=mt.voiced&&e.rms()>.0025,et=mt.smoothedHz}q&&!B&&q.duck(Q);const nt=T.evaluate(N-$,Q?et:null,Q);if(nt.index>=0){let mt=null;nt.voiced&&et&&T.timed[nt.index]&&(mt=Rt(et,T.timed[nt.index].hz)),R.record(nt.index,nt.zone,O,nt.voiced,mt),nt.zone==="green"&&nt.voiced&&nt.index!==_e&&(ee(12),_e=nt.index)}T.draw(N,Q?et:null,Q);const Et=T.activeAt(N);if(p.textContent=Et?Da(Et.seg.midi):"—",Q&&et){Nt=M;const mt=rt(et);S.textContent=mt?mt.name:"—";const Ps=nt.zone==="green"?"var(--green)":nt.zone==="yellow"?"var(--yellow)":"var(--coral)";if(S.style.color=Et?Ps:"var(--text)",L.style.width=Math.min(100,e.rms()*350)+"%",Et){const Qe=Rt(et,Et.seg.hz);Math.abs(Qe)<=20?(k.textContent="в точку",k.style.color="var(--green)"):Qe<0?(k.textContent="↑ выше",k.style.color="var(--amber)"):(k.textContent="↓ ниже",k.style.color="var(--amber)")}else k.textContent=""}else S.textContent="—",S.style.color="var(--text-dim)",L.style.width="0%",Et&&M-Nt>5e3?(k.textContent="не слышу голос — спой громче",k.style.color="var(--coral)"):k.textContent="";N<T.totalTime?_=requestAnimationFrame(Ke):tt||(tt=!0,Ds())}function Ds(){const M=R.result();fe();const N=s._acc||[];if(N.push(M),f&&f.length>1&&d<f.length-1){ct(t,e,n,a,{...s,repIndex:d+1,_acc:N});return}const O=N.reduce((Q,et)=>Q+(et.pct||0),0)/N.length,W={pct:O,stars:O>=.85?3:O>=.6?2:O>=.35?1:0,notesHit:M.notesHit,notesTotal:M.notesTotal,avgCents:M.avgCents,perNote:M.perNote,stability:M.stability,vibrato:M.vibrato,repsDone:N.length};if(Ma("exercise_done",{id:a.id,pct:Math.round(O*100),stability:Math.round(M.stability||0),reps:N.length}),l&&l(W),c){c(W);return}if(O>=.5&&os({pct:O,stars:W.stars}),O<.4){if(bt()>0){$e(-1),Xe(W);return}}else O>=.5&&$e(O>=.8?2:1);Je(W)}function Je(M){M.stars>=2&&(zt(M.stars>=3?2:1),ee(M.stars>=3?30:15));const N="★".repeat(M.stars)+"☆".repeat(3-M.stars),O=Math.round(M.pct*100),W=M.stars>=3?"Отлично!":M.stars===2?"Хорошо!":M.stars===1?"Неплохо":"Ещё разок",Q=fn(M,a);t.innerHTML=`
      <div class="screen summary">
        <div class="stars">${N}</div>
        <div class="verdict">${W}</div>
        <div class="big-pct">${O}<span>%</span></div>
        <p class="hint">средняя точность${M.repsDone>1?` за ${M.repsDone} повтор${M.repsDone<5?"а":"ов"}`:""}</p>
        ${hn(bt(),qt())}
        ${Fa(M)}
        <div class="card tip-card"><p class="how"><b>Разбор.</b> ${Q}</p></div>
        ${Wt()}
        ${r?`<button class="btn btn-primary" id="next" style="width:100%">${u||"Дальше"} →</button>`:""}
        <div class="row">
          <button class="btn btn-ghost" id="menu">Меню</button>
          <button class="btn ${r?"btn-ghost":"btn-primary"}" id="again">Ещё раз</button>
        </div>
      </div>
    `,Ut(t,()=>Je(M),e),document.getElementById("again").addEventListener("click",o),document.getElementById("menu").addEventListener("click",i);const et=document.getElementById("next");et&&et.addEventListener("click",r)}function Xe(M){const N=Math.round(M.pct*100),O=fn(M,a);t.innerHTML=`
      <div class="screen summary">
        <div class="verdict" style="color:var(--coral)">Сложновато — попробуем ещё</div>
        <div class="big-pct" style="color:var(--coral)">${N}<span>%</span></div>
        ${hn(bt(),qt())}
        <div class="card tip-card"><p class="how"><b>Подсказка.</b> ${O}</p></div>
        <p class="hint">Энергия −1 (восстанавливается со временем). Сбавь темп или включи «подсказку тоном» — станет легче.</p>
        ${Wt()}
        <div class="row">
          <button class="btn btn-ghost" id="menu">Меню</button>
          <button class="btn btn-primary" id="again">Пройти заново</button>
        </div>
      </div>`;const W=()=>ct(t,e,n,a,{...s,explain:!1,repIndex:0,_acc:void 0});Ut(t,()=>Xe(M),e),document.getElementById("menu").addEventListener("click",i),document.getElementById("again").addEventListener("click",W)}}function Da(t){const e=rt(440*Math.pow(2,(t-69)/12));return e?e.name:""}function Pa(){return'<svg viewBox="0 0 24 24" width="15" height="15" fill="currentColor"><path d="M13 2 4 14h6l-1 8 9-12h-6z"/></svg>'}function hn(t,e){const n=Array.from({length:e},(a,s)=>`<span class="en-pip ${s<t?"on":""}"></span>`).join("");return`<div class="energy-row"><span class="en-ic">${Pa()}</span><div class="energy-pips">${n}</div></div>`}function Fa(t){if(t.stability==null)return"";const e=t.stability,n=e<15?"ровно":e<30?"почти ровно":"дрожит",a=e<15?"var(--green)":e<30?"var(--amber)":"var(--coral)",i=t.vibrato&&t.vibrato.present?`есть · ${t.vibrato.rateHz.toFixed(1)} Гц`:"нет";return`<div class="stat-chips">
    <span class="stat-chip">ровность: <b style="color:${a}">${n}</b></span>
    <span class="stat-chip">вибрато: <b>${i}</b></span>
  </div>`}function za(t){if(t.modeKey===void 0)return"";const e=U(),n=xt();return`<div class="settings" style="margin-bottom:8px">
      <div class="seg-label">Лад распевки</div>
      <select id="modeSel" class="lad-select">${Jt.map(s=>{const i=!Cn(s.key,n);return`<option value="${s.key}" ${s.key===e?"selected":""} ${i?"disabled":""}>${s.name}${i?" 🔒":""}</option>`}).join("")}</select>
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
      ${za(e)}
      ${Wt()}
      <button class="btn btn-primary" id="go" style="width:100%">Начать</button>
    </div>
  `,document.getElementById("back").addEventListener("click",n),document.getElementById("go").addEventListener("click",a),Ut(t,()=>xe(t,e,{onExit:n,onStart:a,onModeChange:s}));const i=document.getElementById("modeSel");i&&i.addEventListener("change",()=>{cs(i.value),s?s():xe(t,e,{onExit:n,onStart:a,onModeChange:s})})}function Wt(){const t=Re(),e=Lt(),n=pt(),a=gt(),s=(u,h)=>`<button data-diff="${u}" class="${t===u?"on":""}">${h}</button>`,i=(u,h)=>`<button data-timbre="${u}" class="${a===u?"on":""}">${h}</button>`,o=He(),c=(u,h)=>`<button data-groove="${u}" class="${o===u?"on":""}">${h}</button>`,l=re(),r=(u,h)=>`<button data-vol="${u}" class="${l===u?"on":""}">${h}</button>`;return`
    <div class="settings inline-settings">
      <div class="seg-label">Громкость подсказки</div>
      <div class="seg">${r("quiet","Тихо")}${r("normal","Норм")}${r("loud","Громко")}${r("max","Макс")}</div>
      <div class="seg-label">Темп</div>
      <div class="seg">${s("easy","Медл.")}${s("medium","Средне")}${s("fast","Быстро")}</div>
      <div class="toggle-row">
        <button class="toggle ${e?"on":""}" data-guidetoggle="1">Подсказка тоном: ${e?"вкл":"выкл"}</button>
      </div>
      <details class="more-settings" ${$s?"open":""}>
        <summary>Ещё настройки звука: тембр, грув, наушники</summary>
        <div class="seg-label">Звук подсказки</div>
        <div class="seg">${i("piano","Пиано")}${i("guitar","Гитара")}${i("soft","Мягкий")}</div>
        <div class="seg-label">Грув (ритм-подложка · лучше в наушниках)</div>
        <div class="seg">${c("off","Выкл")}${c("auto","Авто")}${c("pop","Поп")}${c("funk","Фанк")}${c("soft","Мягкий")}</div>
        <div class="toggle-row">
          <button class="toggle ${n?"on":""}" data-hptoggle="1">Наушники: ${n?"да":"нет"}</button>
        </div>
      </details>
    </div>
  `}function Ut(t,e,n){t.querySelectorAll("[data-diff]").forEach(o=>{o.addEventListener("click",()=>{rs(o.dataset.diff),e()})}),t.querySelectorAll("[data-timbre]").forEach(o=>{o.addEventListener("click",()=>{ms(o.dataset.timbre),e()})}),t.querySelectorAll("[data-groove]").forEach(o=>{o.addEventListener("click",()=>{ls(o.dataset.groove),e()})}),t.querySelectorAll("[data-vol]").forEach(o=>{o.addEventListener("click",()=>{if(fs(o.dataset.vol),ce(de()),n&&n.ctx)try{ft(n.ctx,523.25,.5,0,.22,gt())}catch{}e()})});const a=t.querySelector("[data-guidetoggle]");a&&a.addEventListener("click",()=>{ds(!Lt()),e()});const s=t.querySelector("[data-hptoggle]");s&&s.addEventListener("click",()=>{us(!pt()),e()});const i=t.querySelector(".more-settings");i&&i.addEventListener("toggle",()=>{$s=i.open})}function fn(t,e){if(t.stars>=3)return"Чисто и точно! Можно прибавить темп или взять упражнение посложнее.";const n=[],a=t.avgCents;a<=-18?n.push("Ты чаще занижал — тяни ноту чуть выше, поддержи дыханием (опора живота)."):a>=18&&n.push("Ты чаще завышал — не дави, расслабь гортань, целься чуть ниже.");const s=t.perNote.length;if(s>=3){const o=e.notes.map((l,r)=>({i:r,midi:l.midi})).sort((l,r)=>r.midi-l.midi).slice(0,Math.max(1,Math.round(s/3)));o.reduce((l,r)=>l+(t.perNote[r.i]||0),0)/o.length<t.pct-.15&&n.push("Верхние ноты даются хуже — не тянись вверх горлом, добавь головной резонанс и воздух.")}return n.length||n.push("Целься в центр ноты и держи ровно. Включи «подсказку тоном» — попадать заметно легче."),n.join(" ")}const K=(t,e)=>({s:t,b:e});function jt(t,e){const n=[];for(let a=0;a<e;a++)n.push(...t.map(s=>({...s})));return n}const At={air1:{id:"air1",name:"Дыхание: длинные с / ш",kind:"rhythm",tempo:70,desc:"Ровный длинный выдох на «с» и «ш» под метроном — опора и расход воздуха.",how:"«с-с-с» тянем на 4 клика → вдох носом → «ш-ш-ш» на 4 клика → вдох носом. Выдох ровный, без толчков.",steps:jt([K("с",4),K("вдох",2),K("ш",4),K("вдох",2)],4)},air2:{id:"air2",name:"Дыхание: короткий с + 5 ш",kind:"rhythm",tempo:80,desc:"Короткий толчок «с» и серия «ш» — активный выдох и чувство ритма.",how:"Короткий «с», пауза, затем 5 коротких «ш». Между «с» и «ш» НЕ дышим; вдох носом — после серии.",steps:jt([K("с",.5),K("rest",.5),K("ш",.5),K("ш",.5),K("ш",.5),K("ш",.5),K("ш",.5),K("вдох",2)],6)},air3:{id:"air3",name:"Артикуляция: 15 с + 15 ш",kind:"rhythm",tempo:80,desc:"Чёткие короткие «с» и «ш» в ровном пульсе — артикуляция и дыхание.",how:"15 коротких «с» → вдох носом → 15 коротких «ш». Держи ровный пульс с метрономом.",steps:[...jt([K("с",.5)],15),K("вдох",2),...jt([K("ш",.5)],15)]}},Va={с:"С-с-с",ш:"Ш-ш-ш",вдох:"Вдох носом",rest:"·"};function ks(t,e,n,a,{onExit:s,onComplete:i}={}){let o=null,c=null,l=!1;const r=[];function u(){o&&(cancelAnimationFrame(o),o=null),r.forEach(clearTimeout),r.length=0,c&&(c.stop(),c=null),document.removeEventListener("visibilitychange",h)}function h(){document.hidden?(o&&(cancelAnimationFrame(o),o=null),c&&(c.stop(),c=null),l=!0):l&&(l=!1,f())}function f(){u(),t.innerHTML=`
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
    `,document.getElementById("back").addEventListener("click",()=>{u(),s()}),document.getElementById("go").addEventListener("click",d)}function d(){document.addEventListener("visibilitychange",h);const m=60/a.tempo;let b=0;const g=a.steps.map(C=>{const T={...C,start:b,end:b+C.b};return b+=C.b,T}),y=b,w=y*m;t.innerHTML=`
      <div class="screen breathe">
        <div class="game-top"><button class="icon-btn" id="quit">‹ Прервать</button></div>
        <div class="rhythm-stage">
          <div class="rhythm-beat" id="beat"></div>
          <div class="rhythm-label" id="lbl">Приготовься…</div>
        </div>
        <div class="bar"><i id="prog"></i></div>
      </div>
    `,document.getElementById("quit").addEventListener("click",()=>{u(),s()});const A=document.getElementById("lbl"),L=document.getElementById("beat"),p=document.getElementById("prog");c=Bn(e.ctx,n,w+.4);const S=performance.now();let k=-1,E=!1;function H(){const C=(performance.now()-S)/1e3,T=C/m,R=Math.floor(T);R>k&&R<Math.ceil(y)&&(k=R,Kt(e.ctx,0,R%4===0),L.classList.remove("pulse"),L.offsetWidth,L.classList.add("pulse"));const $=g.find(B=>T>=B.start&&T<B.end);$&&(A.textContent=Va[$.s]||"",A.style.color=$.s==="вдох"?"var(--gold)":$.s==="rest"?"var(--text-dim)":"var(--accent-2)"),p.style.width=Math.min(100,C/w*100)+"%",C<w?o=requestAnimationFrame(H):E||(E=!0,v())}o=requestAnimationFrame(H)}function v(){if(u(),i){i({pct:null,rhythm:!0});return}t.innerHTML=`
      <div class="screen summary">
        <div class="stars">🫁</div>
        <div class="verdict">Готово!</div>
        <p class="hint">Дыхание и артикуляция размяты. Голос готов к распевке.</p>
        <div class="row">
          <button class="btn btn-ghost" id="menu">Меню</button>
          <button class="btn btn-primary" id="again">Ещё раз</button>
        </div>
      </div>
    `,document.getElementById("menu").addEventListener("click",s),document.getElementById("again").addEventListener("click",f)}f()}const ne=[{key:"bass",name:"Бас",group:"муж",low:40,high:64,center:48,blurb:"Самый низкий мужской голос, глубокий и плотный."},{key:"baritone",name:"Баритон",group:"муж",low:43,high:67,center:52,blurb:"Средний мужской голос — самый распространённый."},{key:"tenor",name:"Тенор",group:"муж",low:48,high:72,center:57,blurb:"Высокий мужской голос, яркий и звонкий."},{key:"contralto",name:"Контральто",group:"жен",low:53,high:77,center:60,blurb:"Низкий женский голос, тёплый и насыщенный."},{key:"mezzo",name:"Меццо-сопрано",group:"жен",low:57,high:81,center:64,blurb:"Средний женский голос — самый частый у женщин."},{key:"soprano",name:"Сопрано",group:"жен",low:60,high:84,center:67,blurb:"Высокий женский голос, светлый и парящий."}];function dt(t){return ne.find(e=>e.key===t)||null}function ot(t){return Tn(Math.round(t))||""}function vn(t){return`${ot(t.low)}–${ot(t.high)}`}function Na(t,e){const n=(t+e)/2;let a=ne[0],s=1/0;for(const i of ne){const o=(i.low+i.high)/2,c=.6*Math.abs(t-i.low)+.4*Math.abs(n-o);c<s&&(s=c,a=i)}return a}function Oa(t,e,n,{onExit:a}){const s=st(),i=s&&dt(s.key),o=i?i.center:60,c=s&&s.low!=null&&s.high!=null?{low:s.low,high:s.high}:i?{low:i.low,high:i.high}:{low:48,high:72},l=[{title:"Дыхание: длинные с / ш",tip:"Ровный длинный выдох в такт.",rhythm:At.air1},{title:"Дыхание: короткий с + 5 ш",tip:"Активный выдох, вдох носом после серии.",rhythm:At.air2},{title:"Артикуляция: 15 с + 15 ш",tip:"Чётко и ровно с метрономом.",rhythm:At.air3},{title:"Мычание по гамме «М»",tip:"Мягко, в маску. Сначала прозвучит тоника.",ex:Se(o)},{title:"Губной тренаж «brrr»",tip:"Губами «brrr» или на «Р», ровно.",ex:Ie(o)}];let r=0;const u=[];function h(){if(r>=l.length)return d();const v=l[r];f(v,r,()=>{const m=b=>{u.push(b),r+=1,h()};if(v.rhythm)ks(t,e,o,v.rhythm,{onExit:a,onComplete:m});else{const b=Be(v.ex,c.low,c.high,2);ct(t,e,n,v.ex,{onExit:a,onComplete:m,reps:b})}})}function f(v,m,b){t.innerHTML=`
      <div class="screen interstitial">
        <div class="game-top"><button class="icon-btn" id="quit">‹ Прервать</button></div>
        <div class="step-count">Упражнение ${m+1} из ${l.length}</div>
        <div class="brand"><h1>${v.title}</h1><p>${v.tip}</p></div>
        <div class="progress-dots">
          ${l.map((g,y)=>`<span class="dot ${y<m?"done":y===m?"now":""}"></span>`).join("")}
        </div>
        <button class="btn btn-primary" id="go" style="width:100%">Начать</button>
      </div>
    `,document.getElementById("go").addEventListener("click",b),document.getElementById("quit").addEventListener("click",a)}function d(){const v=u.filter(L=>L&&typeof L.pct=="number"),m=v.length?v.reduce((L,p)=>L+p.pct,0)/v.length:1,b=m>=.85?3:m>=.6?2:m>=.35?1:0,{streak:g,freezeSpent:y}=os({pct:m,stars:b});zt(2),ee(30);const w="★".repeat(b)+"☆".repeat(3-b),A=Math.round(m*100);t.innerHTML=`
      <div class="screen summary">
        <div class="stars">${w}</div>
        <div class="verdict">Распевка завершена!</div>
        <div class="big-pct">${A}<span>%</span></div>
        <p class="hint">средняя точность по ${v.length} ${v.length===1?"распевке":"распевкам"} с нотами</p>
        <div class="streak-badge">🔥 Стрик: ${g} ${g===1?"день":"дн."}${y?" · ❄ заморозка спасла стрик":""}</div>
        <button class="btn btn-primary" id="menu" style="width:100%">В меню</button>
      </div>
    `,document.getElementById("menu").addEventListener("click",a)}h()}function Oe(t,e,n,{onDone:a,onExit:s,canSkip:i=!1}){let o=null;const c=()=>{o&&cancelAnimationFrame(o),o=null};function l(){c(),n.reset();const f=st(),d=f&&dt(f.key);let v=d?d.group:"муж";t.innerHTML=`
      <div class="screen">
        <div class="game-top">
          <button class="icon-btn" id="back">${i?"Пропустить":"‹ Меню"}</button>
        </div>
        <div class="brand"><h1>Твой голос</h1>
          <p>Знаешь свой тип — выбери. Не знаешь — определим за минуту.</p></div>
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
    `,document.getElementById("back").addEventListener("click",s),document.getElementById("detect").addEventListener("click",r);function m(){const b=st();document.getElementById("voiceCards").innerHTML=ne.filter(g=>g.group===v).map(g=>`
          <button class="list-item voice-card" data-pick="${g.key}">
            <span class="li-main">${g.name}${b&&b.key===g.key?" ·  выбран":""}</span>
            <span class="li-sub">${g.group==="муж"?"мужской":"женский"} · ${vn(g)}</span>
          </button>`).join(""),document.querySelectorAll("[data-pick]").forEach(g=>g.addEventListener("click",()=>{cn(g.dataset.pick),a(st())}))}document.querySelectorAll("[data-gender]").forEach(b=>b.addEventListener("click",()=>{v=b.dataset.gender,document.querySelectorAll("[data-gender]").forEach(g=>g.classList.toggle("on",g.dataset.gender===v)),m()})),m()}function r(){c(),t.innerHTML=`
      <div class="screen breathe-intro">
        <div class="game-top"><button class="icon-btn" id="back">‹ Назад</button></div>
        <div class="brand"><h1>Определим голос</h1></div>
        <div class="card">
          <p class="blurb">Сначала споёшь свою самую низкую удобную ноту, потом — самую высокую (без напряжения!). По диапазону подскажу твой тип.</p>
          <p class="how mech"><b>Как.</b> Пой ровно и держи ноту — когда звук станет стабильным, пойдёт отсчёт и я её запишу. Верх <b>не форсируй</b>: бери только то, что берётся легко.</p>
        </div>
        <button class="btn btn-primary" id="go" style="width:100%">Поехали</button>
      </div>
    `,document.getElementById("back").addEventListener("click",l),document.getElementById("go").addEventListener("click",()=>u("low"))}function u(f,d=null){c();const v=f==="low";t.innerHTML=`
      <div class="screen onboard">
        <div class="game-top"><button class="icon-btn" id="back">‹ Назад</button></div>
        <div class="brand"><h1>${v?"Нижняя нота":"Верхняя нота"}</h1>
          <p>${v?"Спой свою <b>самую низкую удобную</b> ноту и тяни ровно.":"Теперь <b>самую высокую</b> — мягко, <b>без напряжения</b>."}</p></div>
        <div class="note-display silent" id="note">—</div>
        <div class="stability"><div class="stability-fill" id="stab"></div></div>
        <p class="hint" id="status">Пой и держи ровно…</p>
        ${d!=null?`<p class="hint">Низ записан: <b>${ot(d)}</b></p>`:""}
      </div>
    `,document.getElementById("back").addEventListener("click",()=>v?r():u("low"));const m=document.getElementById("note"),b=document.getElementById("status"),g=document.getElementById("stab"),y=[],w=24,A=1200;let L=0;function p(H){const C=Math.min(...H),T=Math.max(...H);return 1200*Math.log2(T/C)}function S(H){const C=[...H].sort((T,R)=>T-R);return C[Math.floor(C.length/2)]}n.reset(),n.setRange&&n.setRange(55,1300);function k(){const H=e.read();if(H){const{smoothedHz:C,voiced:T}=n.process(H);if(T&&C){const R=rt(C),$=R.name.match(/^([A-G]#?)(-?\d+)$/);if(m.className="note-display green",m.innerHTML=$?`${$[1]}<span class="oct">${$[2]}</span>`:R.name,y.push(C),y.length>w&&y.shift(),y.length>=w&&p(y)<110){L||(L=performance.now());const q=performance.now()-L;g.style.width=Math.min(100,q/A*100)+"%";const _=Math.ceil((A-q)/1e3);if(b.textContent=q<A?`Держи… ${Math.max(1,_)}`:"Готово!",q>=A)return E(Math.round(rt(S(y)).midi))}else L=0,g.style.width="0%",b.textContent="Держи ровнее…"}else m.className="note-display silent",m.textContent="—",L=0,g.style.width="0%",y.length&&(y.length=0),b.textContent="Пой и держи ровно…"}o=requestAnimationFrame(k)}k();function E(H){if(c(),v)u("high",H);else{let C=d,T=H;T<=C&&(T=C+7),h(C,T)}}}function h(f,d){c();const v=Na(f,d);cn(v.key,f,d),zt(2),ee(25),t.innerHTML=`
      <div class="screen summary">
        <div class="verdict" style="font-size:18px;color:var(--text-dim)">Похоже, твой голос —</div>
        <div class="voice-result">${v.name}</div>
        <p class="hint">${v.blurb}</p>
        <div class="card" style="text-align:left;width:100%">
          <p class="how"><b>Твой диапазон:</b> ${ot(f)} – ${ot(d)}</p>
          ${Es(f,d)}
          <p class="how"><b>Типичный для ${v.name.toLowerCase()}:</b> ${vn(v)}</p>
          <p class="how mech">Это ориентир по диапазону, а не окончательный вердикт — точный тембр определит педагог. Упражнения подстроятся под тебя.</p>
        </div>
        <div class="row">
          <button class="btn btn-ghost" id="redo">Переопределить</button>
          <button class="btn btn-primary" id="ok">Готово</button>
        </div>
      </div>
    `,document.getElementById("redo").addEventListener("click",r),document.getElementById("ok").addEventListener("click",()=>a(st()))}l()}function bn(t,e,n,a,s,i){t.beginPath(),t.moveTo(e+i,n),t.arcTo(e+a,n,e+a,n+s,i),t.arcTo(e+a,n+s,e,n+s,i),t.arcTo(e,n+s,e,n,i),t.arcTo(e,n,e+a,n,i),t.closePath()}function ja({headline:t="Мой прогресс",big:e="",sub:n=""}){const i=document.createElement("canvas");i.width=1080,i.height=1080;const o=i.getContext("2d");return o.fillStyle="#eef2f4",o.fillRect(0,0,1080,1080),o.fillStyle="#ffffff",o.shadowColor="rgba(20,33,55,.18)",o.shadowBlur=60,o.shadowOffsetY=24,bn(o,90,120,900,780,48),o.fill(),o.shadowColor="transparent",o.shadowBlur=0,o.shadowOffsetY=0,o.fillStyle="#0e8d7f",bn(o,90,120,900,150,48),o.fill(),o.fillStyle="#0e8d7f",o.fillRect(90,230,900,40),o.fillStyle="#ffffff",o.font="700 46px system-ui, sans-serif",o.textBaseline="middle",o.fillText("Распевка",130,195),o.font="500 30px system-ui, sans-serif",o.fillStyle="rgba(255,255,255,.9)",o.textAlign="right",o.fillText("вокальный тренажёр",950,195),o.textAlign="left",o.fillStyle="#5c6775",o.font="600 40px system-ui, sans-serif",o.fillText(t,150,380),o.fillStyle="#1b2430",o.font="800 150px system-ui, sans-serif",o.fillText(e,146,520),o.fillStyle="#0a766a",o.font="600 44px system-ui, sans-serif",o.fillText(n,150,660),o.fillStyle="#9aa6b2",o.font="500 32px system-ui, sans-serif",o.fillText("a1exxx.github.io/raspevka",150,840),i}async function pn(t){const e=ja(t),n=await new Promise(o=>e.toBlob(o,"image/png"));if(!n)return;const a=new File([n],"raspevka.png",{type:"image/png"});try{if(navigator.canShare&&navigator.canShare({files:[a]})){await navigator.share({files:[a],title:"Распевка",text:t.sub||"Мой прогресс в Распевке"});return}}catch{}const s=URL.createObjectURL(n),i=document.createElement("a");i.href=s,i.download="raspevka.png",document.body.appendChild(i),i.click(),i.remove(),setTimeout(()=>URL.revokeObjectURL(s),4e3)}function _a(t){return t.toISOString().slice(0,10)}function Ga(t){if(!t||t.length<2)return"";const e=t.length,n=t.map(d=>d.low),a=t.map(d=>d.high),s=Math.min(...n)-1,i=Math.max(...a)+1,o=Math.max(1,i-s),c=300,l=70,r=5,u=d=>(r+d*(c-2*r)/(e-1)).toFixed(1),h=d=>(r+(1-(d-s)/o)*(l-2*r)).toFixed(1),f=d=>d.map((v,m)=>`${m?"L":"M"}${u(m)} ${h(v)}`).join(" ");return`
    <div class="seg-label" style="margin-top:14px">Рост диапазона</div>
    <svg class="range-tl" viewBox="0 0 ${c} ${l}" preserveAspectRatio="none" role="img" aria-label="График роста диапазона">
      <path d="${f(a)}" class="tl-high"/>
      <path d="${f(n)}" class="tl-low"/>
      <circle cx="${u(e-1)}" cy="${h(a[e-1])}" r="3.5" class="tl-dot-h"/>
      <circle cx="${u(e-1)}" cy="${h(n[e-1])}" r="3.5" class="tl-dot-l"/>
    </svg>`}function Wa(t,{onExit:e}){const n=Zs(),a=ta(),s=le(),i=ea(),o=ps(),c=st(),l=c&&dt(c.key),r=new Set(n.map(b=>b.date)),u=[];for(let b=13;b>=0;b--){const g=new Date(Date.now()-b*864e5);u.push(`<span class="cal-dot ${r.has(_a(g))?"done":""}"></span>`)}const h=n.slice(-12),f=h.length?h.map(b=>{const g=Math.round((b.pct||0)*100);return`<div class="acc-bar ${b.stars>=3?"g":b.stars===2?"a":"c"}" style="height:${Math.max(6,g)}%" title="${g}%"></div>`}).join(""):'<p class="hint">Пройди распевку — здесь появится история точности.</p>';let d="";const v=a.length?a[a.length-1]:c&&c.low!=null?c:null;if(v&&v.low!=null){const b=v.high-v.low;let g="";if(a.length>=2){const y=a[0],w=v.high-v.low-(y.high-y.low);w>0&&(g=` · <span style="color:var(--green)">+${w} пт с начала</span>`)}d=`
      <div class="card" style="text-align:left;width:100%">
        <div class="seg-label">Диапазон голоса</div>
        <p class="how" style="margin-top:6px"><b>${ot(v.low)} – ${ot(v.high)}</b> · ${b} полутонов${g}</p>
        ${Es(v.low,v.high)}
        ${Ga(a)}
        ${l?`<p class="how">Тип: ${l.name}</p>`:""}
      </div>`}t.innerHTML=`
    <div class="screen">
      <div class="game-top"><button class="icon-btn" id="back">‹ Меню</button></div>
      <div class="brand"><h1>Прогресс</h1></div>

      <div class="stat-row">
        <div class="stat-tile"><div class="stat-num">${s}</div><div class="stat-lbl">стрик, дн.</div></div>
        <div class="stat-tile"><div class="stat-num">${i}</div><div class="stat-lbl">сессий</div></div>
        <div class="stat-tile"><div class="stat-num">${o?o.toFixed(0):"—"}</div><div class="stat-lbl">выдох, сек</div></div>
      </div>

      <div class="card" style="width:100%">
        <div class="seg-label">Последние 14 дней</div>
        <div class="cal-row">${u.join("")}</div>
      </div>

      <div class="card" style="width:100%">
        <div class="seg-label">Точность последних занятий</div>
        <div class="acc-chart">${f}</div>
      </div>

      ${d}

      <button class="btn btn-primary" id="share" style="width:100%">Поделиться прогрессом</button>
      <button class="btn btn-ghost" id="back2" style="width:100%">В меню</button>
    </div>
  `,document.getElementById("back").addEventListener("click",e),document.getElementById("back2").addEventListener("click",e);const m=document.getElementById("share");m&&m.addEventListener("click",()=>{if(v&&v.low!=null){const b=v.high-v.low;pn({headline:"Мой диапазон",big:`${ot(v.low)}–${ot(v.high)}`,sub:`${b} полутонов${s>0?` · стрик ${s}`:""}`})}else pn({headline:"Мой прогресс",big:`${s}`,sub:"дней подряд в Распевке"})})}const Ua=[0,2,4,5,7,9,11],gn=t=>Ua.includes((t%12+12)%12);function yn(t){const e=rt(G(t));return e?e.name:""}function Ya(t,e,n,{onExit:a,lowMidi:s=41,highMidi:i=81}){let o=null;const c=s-2,l=i+2,r=G(c),u=G(l);t.innerHTML=`
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
  `,document.getElementById("back").addEventListener("click",()=>{C(),a()});function h(){const T=Fe();document.getElementById("sens").innerHTML=[["low","Низкая"],["med","Средняя"],["high","Высокая"]].map(([R,$])=>`<button data-sens="${R}" class="${T===R?"on":""}">${$}</button>`).join(""),document.querySelectorAll("[data-sens]").forEach(R=>R.addEventListener("click",()=>{bs(R.dataset.sens),e.setSensitivity&&e.setSensitivity(ze()),h()}))}h();const f=document.getElementById("note"),d=document.getElementById("cents"),v=document.getElementById("lvl"),m=document.getElementById("fs"),b=m.getContext("2d");function g(){const T=Math.min(window.devicePixelRatio||1,2);m.width=m.clientWidth*T,m.height=m.clientHeight*T,b.setTransform(T,0,0,T,0,0)}g(),window.addEventListener("resize",g);function y(T,R){const $=Math.max(r,Math.min(u,T)),B=Math.log2($/r)/Math.log2(u/r);return R-B*R}const w=[];n.setRange&&n.setRange(55,1300),n.reset();const A=document.getElementById("cele");let L=null,p=0,S=0,k=null;function E(T){A&&(A.innerHTML=`<svg viewBox="0 0 24 24" fill="currentColor" width="18" height="18"><path d="M12 2l2.4 6.3L21 9l-5 4.1L17.8 20 12 16.3 6.2 20 8 13.1 3 9l6.6-.7z"/></svg> ${T}`,A.hidden=!1,clearTimeout(k),k=setTimeout(()=>{A&&(A.hidden=!0)},3400))}function H(){const T=m.clientWidth,R=m.clientHeight;b.clearRect(0,0,T,R),b.font="10px Inter, sans-serif";for(let P=Math.ceil(c);P<=l;P++){const Z=y(G(P),R),tt=(P%12+12)%12===0;b.strokeStyle=tt?"rgba(27,36,48,.20)":gn(P)?"rgba(27,36,48,.08)":"rgba(27,36,48,.03)",b.lineWidth=1,b.beginPath(),b.moveTo(34,Z),b.lineTo(T,Z),b.stroke(),gn(P)&&(b.fillStyle=tt?"rgba(27,36,48,.55)":"rgba(27,36,48,.32)",b.fillText(yn(P),4,Z+3))}const $=e.read();let B=!1,q=null;if($){const P=n.process($);B=P.voiced&&e.rms()>.0025,q=P.smoothedHz}if(B&&q){const P=rt(q),Z=(P.name||"").match(/^([A-G]#?)(-?\d+)$/);f.innerHTML=Z?`${Z[1]}<span class="oct">${Z[2]}</span>`:P.name,f.classList.remove("silent"),d.textContent=`центы: ${P.cents>0?"+":""}${P.cents}`,v.style.width=Math.min(100,e.rms()*350)+"%";const tt=y(q,R);w.push(tt);const ut=Math.round(69+12*Math.log2(q/440));Math.abs(P.cents)<42?(ut===L?p++:(L=ut,p=1),p===26&&Date.now()-S>4e3&&oa(ut).extended&&(S=Date.now(),E(`Новая нота — ${yn(ut)}! Диапазон растёт.`))):(L=null,p=0)}else f.textContent="—",f.classList.add("silent"),d.textContent="центы: —",v.style.width="0%",w.push(null),L=null,p=0;for(;w.length>90;)w.shift();const _=T-28;for(let P=0;P<w.length;P++){if(w[P]==null)continue;const Z=_-(w.length-1-P)*2.4,tt=P===w.length-1;b.fillStyle=tt?"#2fab84":"rgba(47,171,132,.35)",tt&&(b.shadowColor="#2fab84",b.shadowBlur=16),b.beginPath(),b.arc(Z,w[P],tt?8:2.5,0,Math.PI*2),b.fill(),b.shadowBlur=0}o=requestAnimationFrame(H)}H();function C(){o&&cancelAnimationFrame(o),o=null,window.removeEventListener("resize",g),clearTimeout(k)}}const Ka=""+new URL("belly-breathing-B0wu-xNS.webp",import.meta.url).href;function Ja(){return`
    <div class="breathe-diagram">
      <img class="belly-img" src="${Ka}" alt="Дыхание животом: слева спокойный живот (выдох), справа надутый живот (вдох)" />
      <div class="belly-caps"><span>Выдох · живот мягкий</span><span>Вдох · живот надут</span></div>
      <p class="diagram-note">Не стесняйся: на вдохе <b>живот округляется вперёд</b> (как справа на картинке), воздух идёт вниз. Плечи и грудь почти неподвижны — не тянись вверх.</p>
    </div>`}const xs={box:{title:"Дыхание по квадрату",kind:"paced",belly:!0,blurb:"Успокаивает и выравнивает дыхание перед пением. Вдох, задержка, выдох и пауза — все по 4 секунды. Дыши животом, плечи расслаблены.",cycles:4,phases:[{label:"Вдох",sec:4,from:.5,to:1},{label:"Задержка",sec:4,from:1,to:1},{label:"Выдох",sec:4,from:1,to:.5},{label:"Пауза",sec:4,from:.5,to:.5}]},belly:{title:"Дыхание животом",kind:"paced",belly:!0,blurb:"База певческого дыхания: вдох на 4 счёта — живот расширяется, выдох длиннее, на 6 счётов — ровно и плавно. Грудь и плечи неподвижны.",cycles:5,phases:[{label:"Вдох (живот)",sec:4,from:.5,to:1},{label:"Выдох ровно",sec:6,from:1,to:.5}]},hiss:{title:"Долгий выдох «с-с-с»",kind:"exhale",blurb:"Тренирует опору и ровный воздушный поток. Глубоко вдохни животом, затем выдыхай на звук «с-с-с» как можно дольше и РОВНО — без толчков. Я замерю время.",goals:[{sec:8,label:"хорошо"},{sec:15,label:"отлично"},{sec:20,label:"превосходно"}]}};function Ms(t,e,n,{onExit:a}){const s=xs[n];let i=null;function o(){t.innerHTML=`
      <div class="screen breathe-intro">
        <div class="game-top"><button class="icon-btn" id="back">‹ Меню</button></div>
        <div class="brand"><h1>${s.title}</h1></div>
        <div class="card"><p class="blurb">${s.blurb}</p>${s.belly?Ja():""}</div>
        <button class="btn btn-primary" id="go" style="width:100%">Начать упражнение</button>
      </div>
    `,document.getElementById("back").addEventListener("click",a),document.getElementById("go").addEventListener("click",s.kind==="paced"?c:l)}function c(){t.innerHTML=`
      <div class="screen breathe">
        <div class="game-top"><button class="icon-btn" id="quit">‹ Прервать</button></div>
        <div class="breathe-stage">
          <div class="breathe-ring"><div class="breathe-core" id="core"></div></div>
          <div class="breathe-phase" id="phase">Приготовься…</div>
          <div class="breathe-count" id="count"></div>
        </div>
        <div class="breathe-cycles" id="cycles"></div>
      </div>
    `,document.getElementById("quit").addEventListener("click",()=>{u(),a()});const h=document.getElementById("core"),f=document.getElementById("phase"),d=document.getElementById("count"),v=document.getElementById("cycles");s.cycles*s.phases.length;let m=0,b=0,g=performance.now();y();function y(){v.innerHTML=Array.from({length:s.cycles},(L,p)=>`<span class="dot ${p<m?"done":p===m?"now":""}"></span>`).join("")}function w(){const L=s.phases[b],p=(performance.now()-g)/1e3,S=Math.min(1,p/L.sec),k=L.from+(L.to-L.from)*Xa(S);if(h.style.transform=`scale(${k})`,f.textContent=L.label,d.textContent=Math.ceil(L.sec-p),p>=L.sec){if(b+=1,b>=s.phases.length&&(b=0,m+=1,y()),m>=s.cycles)return A();g=performance.now()}i=requestAnimationFrame(w)}i=requestAnimationFrame(w);function A(){u(),t.innerHTML=`
        <div class="screen summary">
          <div class="stars">🫁</div>
          <div class="verdict">Готово!</div>
          <p class="hint">${s.cycles} циклов дыхания пройдено. Голос готов к распевке.</p>
          <div class="row"><button class="btn btn-ghost" id="menu">Меню</button>
          <button class="btn btn-primary" id="again">Ещё раз</button></div>
        </div>`,document.getElementById("menu").addEventListener("click",a),document.getElementById("again").addEventListener("click",c)}}function l(){t.innerHTML=`
      <div class="screen breathe">
        <div class="game-top"><button class="icon-btn" id="quit">‹ Прервать</button></div>
        <div class="breathe-stage">
          <div class="big-timer" id="timer">0.0</div>
          <div class="breathe-phase" id="phase">Вдохни глубоко и тяни «с-с-с»…</div>
        </div>
        <div class="bar"><i id="vol"></i></div>
        ${r()}
      </div>
    `,document.getElementById("quit").addEventListener("click",()=>{u(),a()});const h=document.getElementById("timer"),f=document.getElementById("phase"),d=document.getElementById("vol"),v=.012,m=.6;let b="ready",g=0,y=0;function w(){e.read();const L=e.rms();d.style.width=Math.min(100,L*400)+"%";const p=performance.now();if(b==="ready")L>v&&(b="running",g=p,y=p,f.textContent="Тяни ровно!");else if(b==="running"&&(L>v&&(y=p),h.textContent=((p-g)/1e3).toFixed(1),p-y>m*1e3))return A((y-g)/1e3);i=requestAnimationFrame(w)}i=requestAnimationFrame(w);function A(L){u(),L=Math.max(0,Math.round(L*10)/10);const p=ba(L),S=[...s.goals].reverse().find(E=>L>=E.sec),k=S?S.label[0].toUpperCase()+S.label.slice(1)+"!":"Попробуй ещё";t.innerHTML=`
        <div class="screen summary">
          <div class="big-pct">${L.toFixed(1)}<span>сек</span></div>
          <div class="verdict">${k}</div>
          <p class="hint">ровный выдох на «с-с-с» · твой рекорд: <b>${p.toFixed(1)} сек</b></p>
          <div class="row"><button class="btn btn-ghost" id="menu">Меню</button>
          <button class="btn btn-primary" id="again">Ещё раз</button></div>
        </div>`,document.getElementById("menu").addEventListener("click",a),document.getElementById("again").addEventListener("click",l)}}function r(){const h=ps();return h?`<p class="hint">Твой рекорд: <b>${h.toFixed(1)} сек</b></p>`:'<p class="hint">Замерим твой ровный выдох.</p>'}function u(){i&&cancelAnimationFrame(i),i=null}o()}function Xa(t){return t<.5?2*t*t:1-Math.pow(-2*t+2,2)/2}const It=[{t:"Опора дыхания",b:"Вдох — живот мягко наполняется (плечи не поднимаются). На выдохе живот плавно поджимается и «держит» звук ровным. Это фундамент: без опоры голос дрожит и быстро устаёт."},{t:"Звук «в маску»",b:"Направляй звук в область носа и скул — голос начинает звенеть, а не «застревать» в горле. Поймать ощущение помогает мычание «м-м-м»."},{t:"Зевок в горле",b:"Лёгкое ощущение начала зевка освобождает гортань и расширяет пространство во рту. Звук становится объёмнее и свободнее, уходит зажим."},{t:"Не дави на верх",b:"Высокие ноты берутся не силой, а лёгкостью и опорой. Давишь — связки зажимаются и можно сорвать голос. Расширение диапазона — это недели, не один день."},{t:"Мягкая атака",b:"Начинай ноту мягко, без толчка горлом. Представь, что звук «вытекает», а не «выстреливает». Это бережёт связки и звучит красивее."},{t:"Округляй гласные",b:"Пой гласные округло, будто внутри звучит «о». Это выравнивает тембр по всему диапазону и убирает резкость и «плоскость»."},{t:"Губной тренаж «бррр»",b:"Вибрация губами снимает зажим и выравнивает поток воздуха. Лучшая разминка перед пением — и проверка, что дыхание ровное."},{t:"Береги голос",b:"Связки любят воду и отдых. Не пой на больном горле, делай паузы, не больше 20–30 минут подряд. Боль — всегда сигнал «стоп»."}];function Qa(t,{onExit:e}){let n=0;function a(){const s=It[n],i=It.map((o,c)=>`<span class="dot ${c===n?"now":c<n?"done":""}"></span>`).join("");t.innerHTML=`
      <div class="screen">
        <div class="game-top"><button class="icon-btn" id="back">‹ Меню</button></div>
        <div class="brand"><h1>Теория голоса</h1><p>Короткие уроки — по одному в день достаточно.</p></div>
        <div class="card theory-card">
          <div class="th-num">${n+1} / ${It.length}</div>
          <h3 class="th-title">${s.t}</h3>
          <p class="th-body">${s.b}</p>
        </div>
        <div class="progress-dots">${i}</div>
        <div class="row">
          <button class="btn btn-ghost" id="prev" ${n===0?"disabled":""}>Назад</button>
          <button class="btn btn-primary" id="next">${n===It.length-1?"Готово":"Далее"}</button>
        </div>
      </div>`,document.getElementById("back").addEventListener("click",e),document.getElementById("prev").addEventListener("click",()=>{n>0&&(n--,a())}),document.getElementById("next").addEventListener("click",()=>{n<It.length-1?(n++,a()):e()})}a()}const Za=[0,2,4,5,7,9,12],ti=t=>t[Math.floor(Math.random()*t.length)];function ei(t){const e=rt(G(t));return e?e.name:""}function Ls(t,e,n,{onExit:a,root:s=60}){let o=0,c=0,l=null,r="idle",u=s,h=0,f=null;const d=gt?gt():"piano";t.innerHTML=`
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
    </div>`;const v=document.getElementById("status"),m=document.getElementById("bigq"),b=document.getElementById("cue"),g=document.getElementById("lvl"),y=document.getElementById("score");document.getElementById("back").addEventListener("click",()=>{H(),a()}),document.getElementById("replay").addEventListener("click",w),document.getElementById("skip").addEventListener("click",()=>{L("Пропущено"),S(1300)}),n.setRange&&n.setRange(55,1300),n.reset();function w(){e.ctx&&ft(e.ctx,G(u),1.3,0,.3,d),b.textContent="Слушай…",r="wait",clearTimeout(f),f=setTimeout(()=>{r="sing",b.textContent="Теперь спой эту ноту"},1350)}function A(){o++,u=s+ti(Za),h=0,m.textContent="?",m.classList.add("silent"),v.textContent=`Раунд ${o} / 8`,w()}function L(C){m.textContent=ei(u),m.classList.remove("silent"),C&&(b.textContent=C),r="done"}function p(){c++,y.textContent=`Верно: ${c} / 8`,L("Верно! Бра-во."),m.classList.add("hit"),S(1300)}function S(C){clearTimeout(f),f=setTimeout(()=>{m.classList.remove("hit"),o>=8?k():A()},C)}function k(){H(),t.innerHTML=`
      <div class="screen summary">
        <div class="brand"><h1>Слух</h1></div>
        <div class="big-pct">${c}<span>/8</span></div>
        <p class="verdict">${c>=7?"Отличный слух!":c>=4?"Хорошо, продолжай!":"Слух тренируется — ещё раз!"}</p>
        <div class="row" style="max-width:360px">
          <button class="btn btn-ghost" id="again">Ещё раз</button>
          <button class="btn btn-primary" id="menu">В меню</button>
        </div>
      </div>`,document.getElementById("again").addEventListener("click",()=>Ls(t,e,n,{onExit:a,root:s})),document.getElementById("menu").addEventListener("click",a)}function E(){const C=e.read();let T=!1,R=null;if(C){const $=n.process(C);T=$.voiced&&e.rms()>.0025,R=$.smoothedHz}if(g.style.width=(T?Math.min(100,e.rms()*350):0)+"%",r==="sing"&&T&&R){const $=Math.abs(Rt(R,G(u)));$<45?h++:h=Math.max(0,h-2),b.textContent=$<45?"Держи…":R<G(u)?"↑ выше":"↓ ниже",h>=22&&p()}l=requestAnimationFrame(E)}function H(){l&&cancelAnimationFrame(l),l=null,clearTimeout(f)}A(),E()}function $t(t,e,n,a){return{id:t,name:e,tempo:n,syllable:"Ля",make(s){return{id:t,name:e,syllable:"Ля",tempo:n,kind:"song",root:s,desc:"Простая мелодия — веди голос по нотам и попадай в каждую.",how:"Пой на «ля», спокойно следуя за нотами. Это не упражнение, а маленькая песня.",notes:a.map(([i,o])=>({midi:s+i,beats:o}))}}}}const Ts=[$t("s1","Лесенка",96,[[0,1],[2,1],[4,1],[5,1],[7,2],[5,1],[4,1],[2,1],[0,2]]),$t("s2","Колыбельная",76,[[7,1],[5,1],[4,2],[5,1],[4,1],[2,2],[0,1],[2,1],[4,1],[2,1],[0,3]]),$t("s3","Прогулка",104,[[0,1],[0,1],[4,1],[4,1],[7,1],[5,1],[4,2],[2,1],[2,1],[5,1],[4,1],[2,1],[0,2]]),$t("s4","Ручеёк",112,[[0,.5],[2,.5],[4,.5],[5,.5],[7,1],[9,1],[7,1],[5,1],[4,.5],[2,.5],[0,2]]),$t("s5","Колокол",88,[[4,1],[7,1],[9,2],[7,1],[4,1],[5,2],[2,1],[4,1],[0,3]]),$t("s6","Закат",80,[[12,2],[9,1],[7,1],[5,2],[4,1],[2,1],[0,3]])],ni=t=>t.make(60).notes.map(e=>e.midi);function si(){return'<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2"><rect x="5" y="11" width="14" height="9" rx="2"/><path d="M8 11V8a4 4 0 0 1 8 0v3"/></svg>'}const wn={free:"Free",standard:"Standard",pro:"Pro"};function ai(t,{onExit:e}){function n(){const a=xt(),s=U(),i=["free","standard","pro"].map(c=>`<button data-tier="${c}" class="${a===c?"on":""}">${wn[c]}</button>`).join(""),o=Jt.map(c=>{const l=Cn(c.key,a),r=c.key===s;return`
        <button class="mode-item ${l?"":"locked"} ${r?"sel":""}" data-mode="${c.key}" ${l?"":"disabled"}>
          <span class="mode-name">${c.name}${r?" · выбран":""}</span>
          ${l?"":`<span class="mode-lock">${si()} ${wn[c.tier]}</span>`}
        </button>`}).join("");t.innerHTML=`
      <div class="screen">
        <div class="game-top"><button class="icon-btn" id="back">‹ Меню</button></div>
        <div class="brand"><h1>Лад распевок</h1>
          <p>Лад меняет окраску ладовых упражнений («Ладовая ЯМ»). На младших тарифах часть ладов закрыта.</p></div>
        <div class="settings">
          <div class="seg-label">Тариф (демо)</div>
          <div class="seg" id="tierSeg">${i}</div>
        </div>
        <div class="card list">
          <div class="list-sep">Лады</div>
          ${o}
        </div>
      </div>`,document.getElementById("back").addEventListener("click",e),document.querySelectorAll("[data-tier]").forEach(c=>c.addEventListener("click",()=>{_t(c.dataset.tier),n()})),document.querySelectorAll("[data-mode]:not([disabled])").forEach(c=>c.addEventListener("click",()=>{cs(c.dataset.mode),n()}))}n()}const Me={hum3:Se,trill:Ie,sustain:Vn,scale5:Zn,agility:ts,jump:es,vowels:Pn,jump5:Fn,lad:zn,vibrato:Nn,vhold:An,vscale:Hn,vagil:Rn,vclimb:qn,jcharles:Dn,vwobble:On,timbre:jn,timbre2:_n,regarp:Gn,regoct:Wn,belt:Un,beltoct:Yn,artic:Kn,artic2:Jn,resist:Xn,resist2:Qn},V=(t,e)=>({t:"ex",id:t,name:e}),En=(t,e)=>({t:"breath",id:t,name:e}),at=[{id:"b1",title:"Базовый импульс",sub:"Дыхание, опора, мягкая активация",items:[En("belly","Дыхание животом"),En("hiss","Долгий выдох «с-с-с»"),V("hum3","Мычание по гамме"),V("trill","Губной тренаж «brrr»")],exam:{exId:"hum3",pass:.55}},{id:"b2",title:"Ясность гласных",sub:"Выравнивание гласных и точность",items:[V("vhold","Calm Down Vowels"),V("vscale","Disco Vowels"),V("jcharles","James Charles Warm Up"),V("vclimb","High Five"),V("vagil","No Bubble Gum")],exam:{exId:"vscale",pass:.6}},{id:"b3",title:"Интонация и гибкость",sub:"Гаммы, беглость, скачки",items:[V("scale5","Гамма «Ма-Мэ»"),V("agility","Беглость «Ма»"),V("jump","Октавный скачок")],exam:{exId:"agility",pass:.55}},{id:"b4",title:"Лад и музыкальное мышление",sub:"Лады, атака интервалов",items:[V("lad","Ладовая «ЯМ»"),V("jump5","Скачок к V ступени")],exam:{exId:"lad",pass:.55}},{id:"b5",title:"Вибрато",sub:"Ровный звук и мягкое колебание",items:[V("sustain","Удержание ноты"),V("vwobble","Раскачка вибрато"),V("vibrato","Вибрато")],exam:{exId:"vibrato",pass:.5}},{id:"b6",title:"Тембр и тон",sub:"Округлый, ровный звук",items:[V("timbre","Тёплый тон"),V("timbre2","Ровный тон на двух")],exam:{exId:"timbre",pass:.55}},{id:"b7",title:"Регистры и переходы",sub:"Грудной/головной, passaggio",items:[V("regarp","Через регистры"),V("regoct","Октавная связка")],exam:{exId:"regarp",pass:.5}},{id:"b8",title:"Белтинг",sub:"Яркая опёртая подача верха",items:[V("belt","Белтинг — гамма"),V("beltoct","Белт — октава")],exam:{exId:"belt",pass:.55}},{id:"b9",title:"Артикуляция",sub:"Чёткая дикция и атака",items:[V("artic","Чёткое стаккато"),V("artic2","Слоги по группам")],exam:{exId:"artic",pass:.6}},{id:"b10",title:"Сопротивление",sub:"Выносливость и опора",items:[V("resist","Стамина-фигура"),V("resist2","Выносливая гамма")],exam:{exId:"resist2",pass:.5}}];function ii(t,e){return t<=0?!0:e.includes(at[t-1].id)}function Ss(){return`<div class="teacher-cta">
    <span>Педагог разберёт нюансы быстрее и покажет на твоём голосе.</span>
    <button class="btn btn-ghost" id="toSchool">Записаться на урок</button>
  </div>`}function oi(t,{blocks:e,examsPassed:n,onExit:a,onOpenBlock:s,onSchool:i}){const o=e.filter(r=>n.includes(r.id)).length,c=e.map((r,u)=>{const h=n.includes(r.id),f=ii(u,n),d=h?"done":f?"open":"locked",v=h?"✓":f?`${u+1}`:"🔒";return`<button class="block-card ${d}" data-block="${u}" ${f?"":"disabled"}>
        <span class="bc-badge">${v}</span>
        <span class="bc-main"><b>${r.title}</b><span class="bc-sub">${r.sub}</span></span>
        <span class="bc-arrow">${f?"›":""}</span>
      </button>`}).join("");t.innerHTML=`
    <div class="screen catalog">
      <div class="game-top"><button class="icon-btn" id="back">‹ Меню</button></div>
      <div class="brand"><h1>Программа обучения</h1><p>Блоки открываются по мере прохождения. Каждый блок завершается экзаменом.</p></div>
      <div class="prog-wrap"><div class="prog-bar"><i style="width:${Math.round(o/e.length*100)}%"></i></div><span class="prog-txt">${o} / ${e.length} блоков пройдено</span></div>
      <div class="block-list">${c}</div>
      ${Ss()}
      <p class="hint">Это самостоятельная практика. Полноценный разбор и постановку голоса даёт педагог.</p>
    </div>
  `,document.getElementById("back").addEventListener("click",a),t.querySelectorAll("[data-block]").forEach(r=>r.addEventListener("click",()=>s(Number(r.dataset.block))));const l=document.getElementById("toSchool");l&&i&&l.addEventListener("click",i)}function ci(t,{block:e,index:n,examsPassed:a,doneItems:s,onExit:i,onRunItem:o,onExam:c,onSchool:l}){const r=a.includes(e.id),u=e.items.map((d,v)=>{const m=s.includes(d.id),b=d.t==="breath"?'<span class="bi-tag">дыхание</span>':"";return`<button class="block-item" data-item="${v}">
        <span class="bi-check ${m?"on":""}">${m?"✓":v+1}</span>
        <span class="bi-name">${d.name}${b}</span>
        <span class="bc-arrow">›</span>
      </button>`}).join(""),h=e.items.every(d=>s.includes(d.id));t.innerHTML=`
    <div class="screen catalog">
      <div class="game-top"><button class="icon-btn" id="back">‹ Программа</button></div>
      <div class="brand"><h1>${e.title}</h1><p>${e.sub}</p></div>
      <div class="block-list">${u}</div>
      <button class="btn ${h?"btn-primary":"btn-ghost"}" id="exam" style="width:100%;margin-top:6px">
        ${r?"✓ Экзамен сдан · пересдать":"Экзамен блока"}
      </button>
      <p class="hint">${h?"Все упражнения пройдены — можно сдавать экзамен.":"Пройди упражнения, потом сдай экзамен. Можно и сразу — как удобнее."}</p>
      ${Ss()}
    </div>
  `,document.getElementById("back").addEventListener("click",i),t.querySelectorAll("[data-item]").forEach(d=>d.addEventListener("click",()=>o(e,Number(d.dataset.item)))),document.getElementById("exam").addEventListener("click",()=>c(e));const f=document.getElementById("toSchool");f&&l&&f.addEventListener("click",l)}function li(){const t=["audio/webm;codecs=opus","audio/webm","audio/mp4","audio/ogg"];for(const e of t)try{if(window.MediaRecorder&&MediaRecorder.isTypeSupported(e))return e}catch{}return""}function ri(t,e,{onExit:n}){let a=null,s=[],i=null,o=null,c=0,l=!1;function r(v){const m=Math.floor(v/1e3);return`${Math.floor(m/60)}:${String(m%60).padStart(2,"0")}`}function u(){t.innerHTML=`
      <div class="screen recorder">
        <div class="game-top"><button class="icon-btn" id="back">‹ Меню</button></div>
        <div class="brand"><h1>Запись голоса</h1><p>Запиши себя и послушай со стороны — так слышно прогресс и ошибки, которые в моменте не замечаешь.</p></div>
        <div class="rec-timer ${l?"live":""}" id="timer">${r(0)}</div>
        <button class="btn ${l?"btn-danger":"btn-primary"} rec-btn" id="rec">${l?"■ Остановить":"● Записать"}</button>
        <audio id="player" controls ${i?"":"hidden"} style="width:100%;margin-top:16px"></audio>
        <p class="hint" style="margin-top:14px">Запись хранится только в этой сессии и никуда не отправляется. ${window.MediaRecorder?"":"<br>⚠️ Браузер не поддерживает запись."}</p>
      </div>
    `,document.getElementById("back").addEventListener("click",()=>{d(),n()});const v=document.getElementById("rec");if(!window.MediaRecorder){v.disabled=!0;return}v.addEventListener("click",l?f:h);const m=document.getElementById("player");i&&m&&(m.src=i)}function h(){if(!e.stream)return;if(s=[],i){try{URL.revokeObjectURL(i)}catch{}i=null}try{const m=li();a=m?new MediaRecorder(e.stream,{mimeType:m}):new MediaRecorder(e.stream)}catch{return}a.ondataavailable=m=>{m.data&&m.data.size&&s.push(m.data)},a.onstop=()=>{const m=new Blob(s,{type:a.mimeType||"audio/webm"});i=URL.createObjectURL(m),l=!1,u()},a.start(),l=!0,c=typeof performance<"u"?performance.now():Date.now(),u();const v=()=>document.getElementById("timer");o=setInterval(()=>{const m=v();m&&(m.textContent=r((typeof performance<"u"?performance.now():Date.now())-c))},250)}function f(){clearInterval(o),o=null;try{a&&a.state!=="inactive"&&a.stop()}catch{l=!1,u()}}function d(){clearInterval(o),o=null;try{a&&a.state!=="inactive"&&a.stop()}catch{}if(i)try{URL.revokeObjectURL(i)}catch{}}u()}const di="./backing/raspevka-rise.mp3",ui=[0,2,4,5,7,9,11],$n=t=>ui.includes((t%12+12)%12);function mi(t){const e=rt(G(t));return e?e.name:""}function kn(t){return t=Math.max(0,Math.floor(t||0)),`${Math.floor(t/60)}:${String(t%60).padStart(2,"0")}`}function hi(t,e,n,{onExit:a,lowMidi:s=40,highMidi:i=76}){let o=null;const c=s-2,l=i+2,r=G(c),u=G(l),h=new Audio(di);h.preload="auto",t.innerHTML=`
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
  `;const f=document.getElementById("back"),d=document.getElementById("play"),v=document.getElementById("cur"),m=document.getElementById("dur"),b=document.getElementById("seek"),g=document.getElementById("note"),y=document.getElementById("fs"),w=y.getContext("2d");function A(){const E=Math.min(window.devicePixelRatio||1,2);y.width=y.clientWidth*E,y.height=y.clientHeight*E,w.setTransform(E,0,0,E,0,0)}A(),window.addEventListener("resize",A),h.addEventListener("loadedmetadata",()=>{m.textContent=kn(h.duration)}),h.addEventListener("ended",()=>{d.textContent="▶ Слушать"}),d.addEventListener("click",()=>{h.paused?(h.play().catch(()=>{}),d.textContent="⏸ Пауза"):(h.pause(),d.textContent="▶ Слушать")}),f.addEventListener("click",()=>{k(),a()});function L(E,H){const C=Math.max(r,Math.min(u,E)),T=Math.log2(C/r)/Math.log2(u/r);return H-T*H}const p=[];n.setRange&&n.setRange(55,1300),n.reset();function S(){const E=y.clientWidth,H=y.clientHeight;w.clearRect(0,0,E,H),w.font="10px Inter, sans-serif";for(let B=Math.ceil(c);B<=l;B++){const q=L(G(B),H),_=(B%12+12)%12===0;w.strokeStyle=_?"rgba(27,36,48,.20)":$n(B)?"rgba(27,36,48,.08)":"rgba(27,36,48,.03)",w.lineWidth=1,w.beginPath(),w.moveTo(34,q),w.lineTo(E,q),w.stroke(),$n(B)&&(w.fillStyle=_?"rgba(27,36,48,.55)":"rgba(27,36,48,.32)",w.fillText(mi(B),4,q+3))}h.duration&&(b.style.width=Math.min(100,h.currentTime/h.duration*100)+"%",v.textContent=kn(h.currentTime));const C=e.read();let T=!1,R=null;if(C){const B=n.process(C);T=B.voiced&&e.rms()>.0025,R=B.smoothedHz}if(T&&R){const B=rt(R),q=(B.name||"").match(/^([A-G]#?)(-?\d+)$/);g.innerHTML=q?`${q[1]}<span class="oct">${q[2]}</span>`:B.name,g.classList.remove("silent"),p.push(L(R,H))}else g.textContent="—",g.classList.add("silent"),p.push(null);for(;p.length>90;)p.shift();const $=E-28;for(let B=0;B<p.length;B++){if(p[B]==null)continue;const q=$-(p.length-1-B)*2.4,_=B===p.length-1;w.fillStyle=_?"#2fab84":"rgba(47,171,132,.35)",_&&(w.shadowColor="#2fab84",w.shadowBlur=16),w.beginPath(),w.arc(q,p[B],_?8:2.5,0,Math.PI*2),w.fill(),w.shadowBlur=0}o=requestAnimationFrame(S)}S();function k(){o&&cancelAnimationFrame(o),o=null,window.removeEventListener("resize",A);try{h.pause(),h.src=""}catch{}}}async function fi(t){return!1}function vi(t,{onExit:e}){const n=st(),a=n&&dt(n.key),s=Js(),i={voiceType:a?a.name:null,range:s&&Number.isFinite(s.low)?`${ot(s.low)}–${ot(s.high)}`:null,streak:le(),blocks:Ft().length},o=[i.voiceType,i.range?`диапазон ${i.range}`:null,i.streak?`стрик ${i.streak}`:null,i.blocks?`блоков ${i.blocks}`:null].filter(Boolean).join(" · ")||"пока без данных";let c="any";function l(){t.innerHTML=`
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
          <p class="hint" style="margin:2px 0 12px">К заявке приложим твой прогресс: <b>${o}</b> — педагогу сразу видно, с чего начать.</p>
          <button class="btn btn-primary" id="lf-send" style="width:100%">Записаться на бесплатный пробный</button>
          <p class="hint" id="lf-err" style="color:var(--coral);margin-top:8px"></p>
        </div>
      </div>
    `,document.getElementById("back").addEventListener("click",e),t.querySelectorAll("#lf-pref [data-pref]").forEach(u=>u.addEventListener("click",()=>{c=u.dataset.pref,t.querySelectorAll("#lf-pref [data-pref]").forEach(h=>h.classList.toggle("on",h.dataset.pref===c))})),document.getElementById("lf-send").addEventListener("click",async()=>{const u=document.getElementById("lf-name").value.trim(),h=document.getElementById("lf-contact").value.trim(),f=document.getElementById("lf-goal").value.trim();if(!u||!h){document.getElementById("lf-err").textContent="Заполни имя и контакт — иначе педагог не сможет ответить.";return}const d=document.getElementById("lf-send");d.disabled=!0,d.textContent="Отправляю…",na({name:u,contact:h,pref:c,goal:f,stats:i}),await fi(),r(u)})}function r(u){zt(1),t.innerHTML=`
      <div class="screen summary leadform-done">
        <div class="lf-check"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M5 13l4 4L19 7"/></svg></div>
        <div class="verdict">Заявка принята!</div>
        <p class="hint">Спасибо, ${u}! Педагог свяжется по твоему контакту и подберёт время бесплатного урока. Пока — продолжай практиковаться.</p>
        <button class="btn btn-primary" id="lf-ok" style="width:100%;max-width:360px">Вернуться</button>
      </div>
    `,document.getElementById("lf-ok").addEventListener("click",e)}l()}function bi(t,e,{onExit:n,onVoice:a,onCalibrate:s}){let i=!1;function o(r,u,h){return`<div class="seg">${r.map(([f,d])=>`<button data-${h}="${f}" class="${u===f?"on":""}">${d}</button>`).join("")}</div>`}function c(){const r=Sa();if(!r.sessions)return"";const u=r.perEx.slice(0,6).map(h=>`<div class="an-row"><span>${h.id}</span><span>${h.runs}× · ${h.avgPct}%</span></div>`).join("");return`
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
          ${o([["quiet","Тихо"],["normal","Норм"],["loud","Громко"],["max","Макс"]],re(),"vol")}

          <div class="seg-label">Вывод звука <span class="set-hint">влияет на компенсацию задержки</span></div>
          ${o([["speaker","Динамик"],["wired","Провод"],["bt","Bluetooth"]],ue(),"route")}
          ${s?`<div class="set-row" style="margin-top:8px"><div class="seg-label" style="margin:0">Точная калибровка</div><button class="toggle" id="calib">${Math.round(Pe()*1e3)} мс · настроить ›</button></div>`:""}

          <div class="seg-label">Чувствительность микрофона</div>
          ${o([["low","Низкая"],["med","Средняя"],["high","Высокая"]],Fe(),"sens")}

          <div class="seg-label">Темп распевок</div>
          ${o([["easy","Медл."],["medium","Средне"],["fast","Быстро"]],Re(),"diff")}

          <div class="seg-label">Звук подсказки</div>
          ${o([["piano","Пиано"],["guitar","Гитара"],["soft","Мягкий"]],gt(),"timbre")}

          <div class="seg-label">Грув (ритм-подложка) <span class="set-hint">Авто — своя под каждую распевку</span></div>
          ${o([["off","Выкл"],["auto","Авто"],["pop","Поп"],["funk","Фанк"],["soft","Мягкий"]],He(),"groove")}

          <div class="toggle-row" style="margin-top:10px">
            <button class="toggle ${Lt()?"on":""}" id="guide">Подсказка тоном: ${Lt()?"вкл":"выкл"}</button>
            <button class="toggle ${pt()?"on":""}" id="hp">Наушники: ${pt()?"да":"нет"}</button>
          </div>
          <button class="toggle ${Ct()?"on":""}" id="darkstage" style="width:100%;margin-top:8px">Тёмный экран пения: ${Ct()?"вкл":"выкл"} <span class="set-hint">светящийся след голоса</span></button>
          <button class="toggle ${Bt()?"on":""}" id="agc" style="width:100%;margin-top:8px">Авто-громкость микро (AGC): ${Bt()?"вкл":"выкл"} <span class="set-hint">${Bt()?"громче на телефоне":"ровнее долгие ноты"}</span></button>
        </div>

        ${c()}

        <div class="card">
          <div class="seg-label">Сброс данных</div>
          <p class="hint" style="margin:4px 0 10px">Удалит прогресс, стрик, диапазон и настройки на этом устройстве. Отменить нельзя.</p>
          <button class="btn ${i?"btn-danger":"btn-ghost"}" id="reset" style="width:100%">${i?"Точно сбросить? Нажми ещё раз":"Сбросить всё"}</button>
        </div>
      </div>
    `,document.getElementById("back").addEventListener("click",n),document.getElementById("voice").addEventListener("click",a),t.querySelectorAll("[data-vol]").forEach(f=>f.addEventListener("click",()=>{if(fs(f.dataset.vol),ce(de()),e&&e.ctx)try{ft(e.ctx,523.25,.5,0,.22,gt())}catch{}l()})),t.querySelectorAll("[data-route]").forEach(f=>f.addEventListener("click",()=>{ma(f.dataset.route),l()})),t.querySelectorAll("[data-sens]").forEach(f=>f.addEventListener("click",()=>{bs(f.dataset.sens),e&&e.setSensitivity&&e.setSensitivity(ze()),l()})),t.querySelectorAll("[data-diff]").forEach(f=>f.addEventListener("click",()=>{rs(f.dataset.diff),l()})),t.querySelectorAll("[data-timbre]").forEach(f=>f.addEventListener("click",()=>{ms(f.dataset.timbre),l()})),t.querySelectorAll("[data-groove]").forEach(f=>f.addEventListener("click",()=>{ls(f.dataset.groove),l()})),document.getElementById("guide").addEventListener("click",()=>{ds(!Lt()),l()}),document.getElementById("hp").addEventListener("click",()=>{us(!pt()),l()}),document.getElementById("darkstage").addEventListener("click",()=>{ha(!Ct()),l()}),document.getElementById("agc").addEventListener("click",()=>{const f=!Bt();fa(f),e&&e.setAGC&&e.setAGC(f),l()});const h=document.getElementById("calib");h&&s&&h.addEventListener("click",s),document.getElementById("reset").addEventListener("click",()=>{if(!i){i=!0,l();return}is(),Ta(),n()})}l()}function pi(t,e,{k:n=4,minRms:a=.012,window:s=.5}={}){if(!Array.isArray(t)||t.length<3)return null;const i=t.filter(l=>l.t<e).map(l=>l.rms).sort((l,r)=>l-r);if(!i.length)return null;const o=i[Math.floor(i.length/2)]||0,c=Math.max(a,o*n);for(const l of t)if(!(l.t<=e)){if(l.t-e>s)break;if(l.rms>=c)return l.t-e}return null}function gi(t,e=.03,n=.4){const a=t.filter(s=>Number.isFinite(s)&&s>=e&&s<=n).sort((s,i)=>s-i);return a.length<2?null:a[Math.floor(a.length/2)]}const yi=t=>new Promise(e=>setTimeout(e,t));function wi(t,e,{onExit:n}){let a=!1,s="";function i(){const l=Math.round(Pe()*1e3);t.innerHTML=`
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
    `,document.getElementById("back").addEventListener("click",n),document.getElementById("measure").addEventListener("click",c);const r=document.getElementById("slider");r.addEventListener("input",()=>{const u=Number(r.value);document.getElementById("slval").textContent=u+" мс",document.getElementById("curms").textContent=u,ln(u/1e3)})}function o(){return new Promise(l=>{const r=e.ctx;if(!r){l(null);return}const u=[],h=r.currentTime,f=typeof performance<"u"?performance.now():Date.now(),d=h+.15;Kt(r,.15,!0);const v=()=>{e.read(),u.push({t:r.currentTime,rms:e.rms()});const m=r.currentTime-h,b=((typeof performance<"u"?performance.now():Date.now())-f)/1e3;m<.7&&b<1.3?setTimeout(v,16):l(pi(u,d))};v()})}async function c(){if(a)return;a=!0,s="",i();const l=[];for(let u=0;u<3;u++)s=`Замер ${u+1} из 3…`,i(),l.push(await o()),await yi(300);const r=gi(l);a=!1,r==null?s="Не удалось расслышать эхо (тихо, наушники или сильный шум). Подстрой вручную ползунком ниже или выбери тип вывода в настройках.":(ln(r),s=`Готово: задержка ≈ ${Math.round(r*1e3)} мс — сохранено.`),i()}i()}function Is(t,{onExit:e}){const n=()=>Is(t,{onExit:e}),a=as(),s=lt(),i=Ne(),o=(l,r)=>`
    <div class="seg-label">${l}</div>
    <div class="seg">${r.map(([u,h,f])=>`<button data-act="${u}" class="${f?"on":""}">${h}</button>`).join("")}</div>`;t.innerHTML=`
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

        <div class="seg-label" style="margin-top:12px">Стрик: ${le()} · заморозки: ${Xt()}</div>
        <div class="seg">
          <button data-act="s0">Стрик 0</button>
          <button data-act="s6">Стрик 6</button>
          <button data-act="s13">Стрик 13</button>
          <button data-act="fz">Заморозка +1</button>
        </div>

        <div class="seg-label" style="margin-top:12px">Энергия: ${bt()}/${qt()}</div>
        <div class="seg">
          <button data-act="e0">0</button>
          <button data-act="e1">1</button>
          <button data-act="emax">Полная</button>
        </div>

        ${o(`Пейволл (soft, ${Ve}/день): сегодня использовано ${ys()}`,[["pw-on","Вкл",Qt()],["pw-off","Выкл",!Qt()],["pw-use","+1 распевка",!1]])}

        <div class="seg-label" style="margin-top:12px">Триал: ${i==null?"не начат":i>0?`активен, осталось ${i} дн.`:"истёк"}</div>
        <div class="seg">
          <button data-act="tr-start">Старт</button>
          <button data-act="tr-reset">Сброс</button>
        </div>

        ${o("Тариф",[["tier-free","Free",xt()==="free"],["tier-std","Standard",xt()==="standard"],["tier-pro","Pro",xt()==="pro"]])}

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
  `,document.getElementById("back").addEventListener("click",e),document.getElementById("exitDev").addEventListener("click",()=>{Zt(!1),be(),e()}),document.getElementById("simNew").addEventListener("click",()=>{is(),be(),Zt(!0),ge(!0),n()});const c={"d-1":()=>ve(-1),"d+1":()=>ve(1),"d+7":()=>ve(7),d0:()=>be(),s0:()=>pe(0),s6:()=>pe(6),s13:()=>pe(13),fz:()=>Xs(Xt()+1),e0:()=>Gt(0),e1:()=>Gt(1),emax:()=>Gt(qt()),"pw-on":()=>ge(!0),"pw-off":()=>ge(!1),"pw-use":()=>ws(),"tr-start":()=>gs(),"tr-reset":()=>ya(),"tier-free":()=>_t("free"),"tier-std":()=>_t("standard"),"tier-pro":()=>_t("pro"),"bl-all":()=>ka(at.map(l=>l.id)),"bl-none":()=>xa()};t.querySelectorAll("[data-act]").forEach(l=>{l.addEventListener("click",()=>{c[l.dataset.act](),n()})})}function Ei(t,{onExit:e,onTrialStarted:n,onTeacher:a}){const s=Ne()!=null;t.innerHTML=`
    <div class="screen summary">
      <div class="game-top"><button class="icon-btn" id="back">‹ Меню</button></div>
      <div class="brand">
        <h1>На сегодня — всё 🎉</h1>
        <p>Ты прошёл ${Ve} бесплатных распевок за день. Голосу полезен отдых — а завтра лимит обновится.</p>
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
  `,document.getElementById("back").addEventListener("click",e),document.getElementById("tomorrow").addEventListener("click",e),document.getElementById("teacher").addEventListener("click",a);const i=document.getElementById("trial");i&&i.addEventListener("click",()=>{gs(),zt(2),n()})}const $i=[{icon:"🎤",title:"Микрофон",body:"Круглая кнопка внизу экрана включает и выключает микрофон. Мы слушаем только высоту тона — ничего не записываем и не отправляем. Если браузер не дал доступ — нажми кнопку ещё раз и выбери «Разрешить»."},{icon:"🔊",title:"Плохо слышно подсказку?",body:"Настройки → «Громкость подсказки». На телефоне ставь «Громко» или «Макс». Звук подсказки (пиано/гитара/мягкий) — там же."},{icon:"🎧",title:"Звук опаздывает или «не туда» засчитывает?",body:"Это задержка вывода. Настройки → «Вывод звука»: выбери Динамик / Провод / Bluetooth (Bluetooth опаздывает сильнее всего). Для идеала — «Точная калибровка»: приложение само измерит задержку твоего устройства."},{icon:"🎵",title:"Подсказка тоном",body:"Без наушников подсказка звучит КОРОТКО перед нотой и молчит, пока поёшь — иначе микрофон ловит динамик. В наушниках включи тумблер «Наушники» — и подсказка будет вести тебя непрерывно."},{icon:"⚙️",title:"Темп и настройки прямо в упражнении",body:"На экране упражнения есть панель «Темп и подсказка тоном» (значок ⚙) — меняй темп на лету, проход мягко перезапустится. Продвинутое (тембр, грув, наушники) — под спойлером «Ещё настройки звука»."},{icon:"🎼",title:"Распевка идёт по твоему диапазону",body:"Каждая распевка начинается от низа твоего диапазона, поднимается по полутонам до верха и возвращается вниз — как на занятии с педагогом. Счётчик повторов виден сверху (например 3/17). Выйти можно в любой момент."},{icon:"🎹",title:"Лад распевок",body:"Для гаммовых распевок лад (мажор/минор и другие) выбирается прямо на экране перед стартом. Чем выше тариф — тем больше ладов открыто."},{icon:"⚡",title:"Энергия, стрик и заморозка",body:"Энергия тратится при провале (<40%) и копится за точные распевки; сама восстанавливается со временем. Стрик 🔥 — дни подряд. Заморозка ❄ спасает один пропущенный день (даётся за каждые 7 дней подряд)."},{icon:"🏆",title:"Программа обучения",body:"Главный путь: блоки открываются по очереди, каждый завершается экзаменом. Внутри блока после каждого упражнения — кнопка «Дальше» к следующему. Застрял — кнопка «Урок с педагогом» внизу."},{icon:"🌙",title:"Тёмный экран пения",body:"Настройки → «Тёмный экран пения»: светящийся след голоса на тёмной сцене. Дело вкуса — попробуй оба."}];function ki(t,{onExit:e,onSettings:n}){const a=$i.map(i=>`
    <div class="card guide-card">
      <div class="guide-head"><span class="guide-ic">${i.icon}</span><b>${i.title}</b></div>
      <p class="how">${i.body}</p>
    </div>`).join("");t.innerHTML=`
    <div class="screen catalog">
      <div class="game-top"><button class="icon-btn" id="back">‹ Меню</button></div>
      <div class="brand"><h1>Как тут всё устроено</h1>
        <p>Короткий гид: что где находится и что подкрутить, если что-то не получается.</p></div>
      ${a}
      ${n?'<button class="btn btn-primary" id="toSettings" style="width:100%">Открыть настройки</button>':""}
      <p class="hint">Гид всегда под лампочкой 💡 на главном экране.</p>
    </div>
  `,document.getElementById("back").addEventListener("click",e);const s=document.getElementById("toSettings");s&&n&&s.addEventListener("click",n)}const I=document.getElementById("app"),j=new Fs({fftSize:2048});let Y=null,ye=null;const xi=60,Yt=[{label:"Мычание по гамме",sub:"«М» · I-II-III-II-I",ic:"lips",cat:"warm",make:t=>Se(t,U())},{label:"Губной тренаж «brrr»",sub:"brrr / «Р» · 5 нот + квинта",ic:"wave",cat:"warm",make:t=>Ie(t,U())},{label:"Удержание ноты",sub:"держать ровный звук",ic:"fork",cat:"warm",make:t=>Vn(t,8)},{label:"Гамма «Ма-Мэ»",sub:"попадать в ноты гаммы",ic:"stairs",cat:"pitch",make:t=>Zn(t,U())},{label:"Беглость «Ма»",sub:"быстрые ноты — как в рекламе",ic:"bolt",cat:"pitch",make:t=>ts(t,U())},{label:"Октавный скачок",sub:"прыжок на октаву и назад",ic:"arrows",cat:"pitch",make:t=>es(t)},{label:"Цепочка гласных",sub:"Ми-Ме-Ма · выравнивание",ic:"lips",cat:"vowel",make:t=>Pn(t,U())},{label:"Calm Down Vowels",sub:"И-Э-А-О-У · позиция",ic:"lips",cat:"vowel",make:t=>An(t)},{label:"Disco Vowels",sub:"И-Э-А-О-У · точность",ic:"stairs",cat:"vowel",make:t=>Hn(t,U())},{label:"James Charles Warm Up",sub:"гласные + Ми-Ме-Ма",ic:"wave",cat:"vowel",make:t=>Dn(t,U())},{label:"High Five",sub:"И-Э-А-О-У · подъём",ic:"arrows",cat:"vowel",make:t=>qn(t,U())},{label:"No Bubble Gum",sub:"гибкость на гласных",ic:"bolt",cat:"vowel",make:t=>Rn(t,U())},{label:"Скачок к V ступени",sub:"Ям · атака интервала",ic:"arrows",cat:"pitch",make:t=>Fn(t,U())},{label:"Ладовая «ЯМ»",sub:"гамма лада вверх-вниз",ic:"stairs",cat:"pitch",make:t=>zn(t,U())},{label:"Вибрато",sub:"ровная волна голосом",ic:"wave",cat:"vib",make:t=>Nn(t)},{label:"Раскачка вибрато",sub:"А · запуск вибрато",ic:"wave",cat:"vib",make:t=>On(t)},{label:"Тёплый тон",sub:"Мо · качество тембра",ic:"fork",cat:"vib",make:t=>jn(t)},{label:"Ровный тон на двух",sub:"А · единый тембр",ic:"fork",cat:"vib",make:t=>_n(t)},{label:"Через регистры",sub:"Но · passaggio",ic:"arrows",cat:"reg",make:t=>Gn(t)},{label:"Октавная связка",sub:"А · соединить регистры",ic:"arrows",cat:"reg",make:t=>Wn(t)},{label:"Белтинг — гамма",sub:"Эй · яркая подача",ic:"bolt",cat:"reg",make:t=>Un(t)},{label:"Белт — октава",sub:"Эй · опёртый верх",ic:"arrows",cat:"reg",make:t=>Yn(t)},{label:"Чёткое стаккато",sub:"Та · артикуляция",ic:"bolt",cat:"artic",make:t=>Kn(t)},{label:"Слоги по группам",sub:"Та-Ка · дикция",ic:"lips",cat:"artic",make:t=>Jn(t)},{label:"Стамина-фигура",sub:"Ма · выносливость",ic:"stairs",cat:"artic",make:t=>Xn(t)},{label:"Выносливая гамма",sub:"Ма · длинный пробег",ic:"stairs",cat:"artic",make:t=>Qn(t)}],Mi=[["warm","Разогрев"],["vowel","Гласные"],["pitch","Точность и гибкость"],["vib","Вибрато и тембр"],["reg","Регистры и сила"],["artic","Дикция и выносливость"]];function Dt(){const t=st(),e=t&&dt(t.key);return e?e.center:xi}function se(){const t=st(),e=t&&dt(t.key);return t&&t.low!=null&&t.high!=null?{low:t.low,high:t.high}:e?{low:e.low,high:e.high}:{low:48,high:72}}function it(){if(!Y)return;const t=st(),e=t&&dt(t.key);e?Y.setRange(G(e.low-5),G(e.high+5)):Y.setRange(60,1200)}const Li=["Голос — это мышца. Сегодня сделаем её сильнее.","Дыши животом — и звук польётся сам.","Чисто — не значит громко. Решает точность.","Каждая распевка чуть-чуть расширяет диапазон.","Расслабь челюсть и плечи — голос любит свободу.","Лучшие певцы тоже начинали с простого «мычания».","Тёплый голос начинается с тёплого дыхания.","Не тянись за верхней нотой горлом — она придёт сама.","5 минут каждый день дают больше, чем час раз в неделю.","Улыбнись — и тембр станет светлее.","Зевни перед распевкой — гортань скажет спасибо.","Пой так, будто тебя уже любят слушать."];function Ti(t){const e=t.slice();for(let n=e.length-1;n>0;n--){const a=Math.floor(Math.random()*(n+1));[e[n],e[a]]=[e[a],e[n]]}return e}function Si(){X();const t=Ti(Li);I.innerHTML=`
    <div class="screen splash">
      <div class="splash-core">
        <div class="eq" aria-hidden="true"><i></i><i></i><i></i><i></i><i></i></div>
        <h1 class="splash-title">Распевка</h1>
        <p class="splash-tip" id="tip">${t[0]}</p>
      </div>
      <div class="splash-bar"><i></i></div>
    </div>
  `;const e=window.matchMedia&&window.matchMedia("(prefers-reduced-motion: reduce)").matches;setTimeout(Ii,e?1600:2800)}function Ii(){Hi();try{new URLSearchParams(location.search).has("dev")&&Zt(!0)}catch{}if(!st()&&!x().welcomed){Bi();return}F()}function Bi(){X(),I.innerHTML=`
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
  `;const t=()=>D({...x(),welcomed:!0});document.getElementById("wlc-skip").addEventListener("click",()=>{t(),F()}),document.getElementById("wlc-go").addEventListener("click",()=>{t(),J(()=>Oe(I,j,Y,{onDone:()=>{it(),Ci()},onExit:F}))})}function Ci(){X(),I.innerHTML=`
    <div class="screen welcome">
      <div class="brand"><h1>Отлично! 🎉</h1>
        <p>Упражнения уже подстроились под твой голос. Попробуем первую распевку — мягкое мычание, 1 минута.</p></div>
      <button class="btn btn-primary" id="fe-go" style="width:100%">Первая распевка →</button>
      <button class="btn btn-ghost" id="fe-guide" style="width:100%">💡 Как тут всё устроено · 1 минута</button>
      <button class="btn btn-ghost" id="fe-menu" style="width:100%">В меню</button>
    </div>
  `,document.getElementById("fe-go").addEventListener("click",()=>ie(0)),document.getElementById("fe-guide").addEventListener("click",Cs),document.getElementById("fe-menu").addEventListener("click",F)}let ht="off";async function Bs(){try{if(!j.ready){j.setAGC(Bt());const{sampleRate:t}=await j.start();Y||(Y=new zs(t,{fftSize:2048,minClarity:.85})),j.setSensitivity(ze()),ce(de()),it()}return ht="listening",ae(),!0}catch{return ht="denied",ae(),!1}}async function Ai(){if(ht==="listening"){try{await j.suspend()}catch{}ht="off",ae()}else await Bs()}function Hi(){const t=document.getElementById("mic-fab");t&&(t.hidden=!1,t.__wired||(t.addEventListener("click",Ai),t.__wired=!0),ae())}function ae(){const t=document.getElementById("mic-fab");if(!t)return;t.className="mic-fab "+ht;const e=t.querySelector(".mic-fab-txt");e&&(e.textContent=ht==="listening"?"Слушаю":ht==="denied"?"Нет доступа · нажми":"Включить микрофон"),t.setAttribute("aria-pressed",ht==="listening"?"true":"false")}async function J(t){if(!await Bs()){Ri(t);return}t()}function Ri(t){X(),I.innerHTML=`
    <div class="screen">
      <div class="game-top"><button class="icon-btn" id="back">‹ Меню</button></div>
      <div class="brand"><h1>Нужен микрофон</h1>
        <p>Чтобы слышать твой голос, разреши доступ к микрофону. На телефоне нужен HTTPS, в браузере — «Разрешить».</p></div>
      <div class="card">
        <p class="hint" style="margin-bottom:16px">Нажми кнопку и выбери «Разрешить». Микрофон можно выключить в любой момент кнопкой внизу экрана.</p>
        <button class="btn btn-primary" id="grant" style="width:100%">Разрешить микрофон</button>
      </div>
    </div>
  `,document.getElementById("back").addEventListener("click",F),document.getElementById("grant").addEventListener("click",()=>J(t))}function we(t){return`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">${{mic:'<path d="M12 3a3 3 0 0 0-3 3v6a3 3 0 0 0 6 0V6a3 3 0 0 0-3-3z"/><path d="M5 11a7 7 0 0 0 14 0M12 18v3"/>',chart:'<path d="M4 20V10M10 20V4M16 20v-7M22 20H2"/>',tuner:'<circle cx="12" cy="12" r="8"/><path d="M12 12l4-3"/><path d="M12 4v2M12 18v2M4 12h2M18 12h2"/>',wave:'<path d="M2 12h2l2-6 3 14 3-12 2 8 2-4h6"/>',note:'<circle cx="7" cy="18" r="3"/><circle cx="18" cy="16" r="3"/><path d="M10 18V5l11-2v13"/>',lips:'<path d="M3 12c4-5 14-5 18 0-4 5-14 5-18 0z"/><path d="M3 12h18"/>',fork:'<path d="M9 3v8a3 3 0 0 0 6 0V3"/><path d="M12 14v7"/>',stairs:'<path d="M3 19h4v-4h4v-4h4V7h4"/>',bolt:'<path d="M13 2 4 14h6l-1 8 9-12h-6z"/>',arrows:'<path d="M8 8l4-4 4 4M8 16l4 4 4-4M12 4v16"/>'}[t]||""}</svg>`}function qi(){return'<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2c1 3-1 4-2 6-1 1.7-.5 3.5 1 4 .8.3 1-.7.5-1.5 2 .6 3.5 2.3 3.5 4.5A5 5 0 0 1 7 19c-1.7-1-2.7-3-2.5-5 .2-2.4 2-3.7 2.8-5.6C8.4 6 9 3.6 12 2z"/></svg>'}const Ee=t=>t%10===1&&t%100!==11?"день":"дн.";function F(){X();const t=($,B)=>{const q=$.make(60).notes;return`
    <button class="ex-tile" data-ex="${B}">
      ${ke(q)}
      <span class="ex-tile-main">${$.label}</span>
      <span class="ex-tile-sub">${$.sub}</span>
    </button>`},e=Mi.map(([$,B])=>{const q=Yt.map((_,P)=>_.cat===$?t(_,P):"").join("");return`<div class="cat-title">${B}</div><div class="ex-row">${q}</div>`}).join(""),n=Ft(),a=at.findIndex($=>!n.includes($.id)),s=Math.round(n.length/at.length*100),i=Object.entries(xs).map(([$,B])=>`
    <button class="thin-item" data-breath="${$}"><span>${B.title}</span><span class="thin-sub">${B.kind==="exhale"?"выдох":"дыхание"}</span></button>
  `).join(""),o=Object.entries(At).map(([$,B])=>`
    <button class="thin-item" data-rhythm="${$}"><span>${B.name}</span><span class="thin-sub">метроном</span></button>
  `).join(""),c=Ts.map(($,B)=>`
    <button class="ex-tile" data-song="${B}">
      ${ke(ni($))}
      <span class="ex-tile-main">${$.name}</span>
      <span class="ex-tile-sub">мелодия · на «ля»</span>
    </button>`).join(""),l=le(),r=st(),u=r&&dt(r.key),h=Qs(),f=ss(),d=(f.getDate()+f.getMonth())%Yt.length,v=Yt[d],m=Te(U()).name,b=bt(),g=qt();I.innerHTML=`
    <div class="screen home">
      <header class="home-head">
        <h1>Распевка</h1>
        <div class="home-chips">
          <div class="energy-chip" title="Энергия — копится за точные распевки"><svg viewBox="0 0 24 24" fill="currentColor"><path d="M13 2 4 14h6l-1 8 9-12h-6z"/></svg>${b}/${g}</div>
          ${l>0?`<div class="streak-chip">${qi()} ${l} ${Ee(l)}</div>`:""}
          ${Xt()>0?`<div class="energy-chip" title="Заморозка стрика — страхует 1 пропущенный день">❄ ${Xt()}</div>`:""}
          ${$a()?'<button class="gear-btn" data-dev aria-label="Тест-режим" title="Тест-режим">🧪</button>':""}
          <button class="gear-btn" data-guide aria-label="Подсказки" title="Как тут всё устроено">💡</button>
          <button class="gear-btn" data-settings aria-label="Настройки"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg></button>
        </div>
      </header>

      <button class="hero-card" id="session">
        <div class="hero-eyebrow">Сегодня</div>
        <div class="hero-title">Полная распевка</div>
        <div class="hero-sub">${h?`Сегодня выполнено ✓${l>0?` · стрик ${l} ${Ee(l)}`:""} — возвращайся завтра`:"Дыхание → распевка · ~10 минут"}</div>
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
        <div class="thin-list">${o}${i}</div>
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
  `,document.getElementById("session").addEventListener("click",()=>{const $=()=>J(()=>{it(),Oa(I,j,Y,{onExit:F})});x().safetyAccepted?$():zi($)});const y=I.querySelector("[data-focus]");y&&y.addEventListener("click",()=>ie(d)),I.querySelector("[data-voice]").addEventListener("click",()=>{J(()=>Oe(I,j,Y,{onDone:()=>{it(),F()},onExit:F}))}),I.querySelector("[data-dash]").addEventListener("click",()=>Wa(I,{onExit:F})),I.querySelector("[data-freesing]").addEventListener("click",()=>{J(()=>{const $=se();Ya(I,j,Y,{onExit:()=>{it(),F()},lowMidi:$.low,highMidi:$.high})})}),I.querySelectorAll("[data-ex]").forEach($=>{$.addEventListener("click",()=>ie(Number($.dataset.ex)))}),I.querySelectorAll("[data-breath]").forEach($=>{$.addEventListener("click",()=>J(()=>Ms(I,j,$.dataset.breath,{onExit:F})))}),I.querySelectorAll("[data-rhythm]").forEach($=>{$.addEventListener("click",()=>ks(I,j,Dt(),At[$.dataset.rhythm],{onExit:F}))});const w=I.querySelector("[data-path]");w&&w.addEventListener("click",je);const A=I.querySelector("[data-ear]");A&&A.addEventListener("click",()=>J(()=>{it(),Ls(I,j,Y,{onExit:F,root:Dt()})}));const L=I.querySelector("[data-theory]");L&&L.addEventListener("click",()=>Qa(I,{onExit:F}));const p=I.querySelector("[data-record]");p&&p.addEventListener("click",()=>J(()=>ri(I,j,{onExit:F})));const S=I.querySelector("[data-backing]");S&&S.addEventListener("click",()=>J(()=>{const $=se();hi(I,j,Y,{onExit:()=>{it(),F()},lowMidi:$.low,highMidi:$.high})}));const k=I.querySelector("[data-modes]");k&&k.addEventListener("click",Pi);const E=I.querySelector("[data-settings]");E&&E.addEventListener("click",Ht);const H=I.querySelector("[data-teacher]");H&&H.addEventListener("click",()=>Vt(F)),I.querySelectorAll("[data-song]").forEach($=>{$.addEventListener("click",()=>Hs(Number($.dataset.song)))});const C=I.querySelector("[data-guide]");C&&C.addEventListener("click",Cs);const T=I.querySelector("[data-dev]");T&&T.addEventListener("click",xn);const R=I.querySelector(".home-head h1");if(R){let $=0,B=0;R.addEventListener("click",()=>{const q=Date.now();$=q-B<600?$+1:1,B=q,$>=7&&($=0,Zt(!0),xn())})}}function xn(){X(),Is(I,{onExit:F})}function Cs(){X(),ki(I,{onExit:F,onSettings:Ht})}function Di(){X(),Ei(I,{onExit:F,onTrialStarted:F,onTeacher:()=>Vt(F)})}function As(t){if(Ea()){Di();return}Qt()&&ws(),t()}function ie(t,e=!0){if(e){As(()=>Mn(t,e));return}Mn(t,e)}function oe(t){const e=se(),n=t(60),a=Math.min(...n.notes.map(c=>c.midi))-60,s=e.low-a,i=t(s),o=Be(i,e.low,e.high,48);return{ex:i,reps:o}}function Mn(t,e){J(()=>{it();const n=i=>Yt[t].make(i),{ex:a,reps:s}=oe(n);ct(I,j,Y,a,{explain:e,reps:s,rebuild:()=>oe(n).ex,onExit:F,onAgain:()=>ie(t,!1)})})}function Hs(t,e=!0){if(e){As(()=>Ln(t,e));return}Ln(t,e)}function Ln(t,e){J(()=>{const n=Ts[t].make(Dt());ct(I,j,Y,n,{explain:e,reps:[0],onExit:F,onAgain:()=>Hs(t,!1)})})}function Pi(){X(),ai(I,{onExit:F})}function je(){X(),oi(I,{blocks:at,examsPassed:Ft(),onExit:F,onOpenBlock:Pt,onSchool:Vt})}function Pt(t){X();const e=at[t];ci(I,{block:e,index:t,examsPassed:Ft(),doneItems:aa(e.id),onExit:je,onRunItem:Le,onExam:me,onSchool:Vt})}function Le(t,e){const n=t.items[e],a=at.indexOf(t),s=t.items[e+1],i=()=>s?Le(t,e+1):me(t);J(()=>{if(it(),n.t==="breath"){Ms(I,j,n.id,{onExit:()=>{on(t.id,n.id),i()}});return}const o=r=>Me[n.id](r,U()),{ex:c,reps:l}=oe(o);ct(I,j,Y,c,{explain:!0,reps:l,rebuild:()=>oe(o).ex,onResult:r=>{r.pct>=.5&&on(t.id,n.id)},onExit:()=>Pt(a),onAgain:()=>Le(t,e),nextLabel:s?`Дальше: ${s.name}`:"К экзамену блока",onNext:i})})}function me(t){J(()=>{it();const e=Me[t.exam.exId](Dt(),U()),n=se(),a=Be(e,n.low,n.high,2);ct(I,j,Y,e,{explain:!0,reps:a,rebuild:()=>Me[t.exam.exId](Dt(),U()),onComplete:s=>Fi(t,s),onExit:()=>Pt(at.indexOf(t)),onAgain:()=>me(t)})})}function Fi(t,e){X();const n=Math.round(e.pct*100),a=e.pct>=t.exam.pass;a?sa(t.id):bt()>0&&$e(-1);const s=at.indexOf(t),i=a&&s+1<at.length,o=a?"var(--green)":"var(--coral)";I.innerHTML=`
    <div class="screen summary">
      <div class="verdict" style="color:${o}">${a?"Экзамен сдан!":"Пока не сдан"}</div>
      <div class="big-pct" style="color:${o}">${n}<span>%</span></div>
      <p class="hint">${a?`Блок «${t.title}» пройден.${i?" Открыт следующий блок.":""}`:`Нужно ${Math.round(t.exam.pass*100)}%. Энергия −1 (восстановится со временем). Можно пересдать сразу.`}</p>
      <div class="teacher-cta"><span>Разобрать ошибки с педагогом — быстрее.</span><button class="btn btn-ghost" id="toSchool">На урок</button></div>
      <div class="row">
        <button class="btn btn-ghost" id="toBlock">К блоку</button>
        <button class="btn btn-primary" id="primary">${a?i?"Следующий блок":"К программе":"Пересдать"}</button>
      </div>
    </div>`,document.getElementById("toBlock").addEventListener("click",()=>Pt(s)),document.getElementById("toSchool").addEventListener("click",Vt),document.getElementById("primary").addEventListener("click",()=>{a?i?Pt(s+1):je():me(t)})}function Vt(t){X(),vi(I,{onExit:typeof t=="function"?t:F})}function Ht(){X(),bi(I,j,{onExit:F,onVoice:()=>J(()=>Oe(I,j,Y,{onDone:()=>{it(),Ht()},onExit:Ht})),onCalibrate:()=>J(()=>wi(I,j,{onExit:Ht}))})}function zi(t){X(),I.innerHTML=`
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
  `,document.getElementById("accept").addEventListener("click",()=>{D({...x(),safetyAccepted:!0}),t()}),document.getElementById("safety-back").addEventListener("click",F)}function X(){ye&&cancelAnimationFrame(ye),ye=null}"serviceWorker"in navigator&&window.addEventListener("load",()=>{navigator.serviceWorker.register("./sw.js").catch(()=>{})});Si();
