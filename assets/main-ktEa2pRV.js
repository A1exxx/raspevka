import{m as j,b as Dt,c as Ke,f as $n,h as rt,M as Rs,P as qs}from"./note-map-BdCsI2TM.js";class Ds{constructor(e){this.notes=Array.from({length:e},()=>({greenMs:0,scoredMs:0,activeMs:0,sumCents:0,centsMs:0})),this.g={ms:0,sumC:0,sumC2:0,reversals:0,lastC:null,lastDir:0}}record(e,n,a,s,o=null){const i=this.notes[e];if(i&&(i.activeMs+=a,!!s&&(i.scoredMs+=a,n==="green"?i.greenMs+=a:n==="yellow"&&(i.greenMs+=a*.5),o!=null&&Number.isFinite(o)))){i.sumCents+=o*a,i.centsMs+=a;const c=this.g;if(c.ms+=a,c.sumC+=o*a,c.sumC2+=o*o*a,c.lastC!=null){const l=o-c.lastC;if(Math.abs(l)>2){const r=l>0?1:-1;c.lastDir&&r!==c.lastDir&&(c.reversals+=1),c.lastDir=r}}c.lastC=o}}result(){let e=0,n=0,a=0,s=0,o=0;for(const u of this.notes)e+=u.greenMs,n+=u.activeMs,a+=u.sumCents,s+=u.centsMs,u.activeMs>0&&u.greenMs/u.activeMs>=.5&&(o+=1);const i=n>0?e/n:0,c=i>=.85?3:i>=.6?2:i>=.35?1:0,l=this.g;let r=0;if(l.ms>0){const u=l.sumC/l.ms,m=Math.max(0,l.sumC2/l.ms-u*u);r=Math.sqrt(m)}const d=l.ms/1e3,h=d>0?l.reversals/2/d:0,f=h>=3.5&&h<=8.5&&r>=15&&r<=130;return{pct:i,stars:c,notesHit:o,notesTotal:this.notes.length,avgCents:s>0?a/s:0,perNote:this.notes.map(u=>u.activeMs>0?u.greenMs/u.activeMs:0),stability:r,vibrato:{present:f,rateHz:h}}}}const Je={light:{grid:"rgba(27,36,48,.07)",gridC:"rgba(27,36,48,.18)",label:"rgba(27,36,48,.42)",hitLine:"rgba(14,141,127,.6)",note:"rgba(14,141,127,.26)",noteActive:"rgba(14,141,127,.95)",noteGlow:"rgba(14,141,127,.5)",green:"#2fab84",yellow:"#e0a64a",red:"#e0544b",free:"#0e8d7f",glow:0},dark:{grid:"rgba(255,255,255,.055)",gridC:"rgba(255,255,255,.14)",label:"rgba(255,255,255,.45)",hitLine:"rgba(61,229,201,.7)",note:"rgba(61,229,201,.2)",noteActive:"rgba(61,229,201,.95)",noteGlow:"rgba(61,229,201,.85)",green:"#3ee6a8",yellow:"#ffc24d",red:"#ff6b61",free:"#3de5c9",glow:10}};class Ps{constructor(e,n,a={}){this.theme=Je[a.theme]||Je.light,this.canvas=e,this.ctx=e.getContext("2d"),this.ex=n,this.secPerBeat=60/(n.tempo||90),this.greenCents=n.greenCents||20,this.yellowCents=n.yellowCents||40,this.pxPerSec=a.pxPerSec||150,this.hitFrac=a.hitFrac??.26,this.leadIn=a.leadIn??2.2;let s=this.leadIn;this.timed=n.notes.map(i=>{const c=i.beats*this.secPerBeat,l={midi:i.midi,hz:j(i.midi),start:s,end:s+c,dur:c};return s+=c,l}),this.totalTime=s+.6;const o=n.notes.map(i=>i.midi);this.minMidi=Math.min(...o)-3,this.maxMidi=Math.max(...o)+3,this.trail=[]}yFor(e,n){const a=j(this.minMidi),s=j(this.maxMidi),o=Math.max(a,Math.min(s,e)),i=Math.log2(o/a)/Math.log2(s/a);return n-i*n}activeAt(e){for(let n=0;n<this.timed.length;n++)if(e>=this.timed[n].start&&e<this.timed[n].end)return{index:n,seg:this.timed[n]};return null}evaluate(e,n,a){const s=this.activeAt(e);if(!s)return{index:-1,zone:null,voiced:!1};if(!a||!n)return{index:s.index,zone:"red",voiced:!1};const o=Math.abs(Dt(n,s.seg.hz));return{index:s.index,zone:Ke(o,this.greenCents,this.yellowCents),voiced:!0}}draw(e,n,a){const s=this.ctx,o=this.canvas.clientWidth,i=this.canvas.clientHeight,c=o*this.hitFrac;s.clearRect(0,0,o,i);const l=this.theme;for(let g=Math.ceil(this.minMidi);g<=this.maxMidi;g++){const E=this.yFor(j(g),i),w=$n(g),R=w&&w.startsWith("C");s.strokeStyle=R?l.gridC:l.grid,s.lineWidth=1,s.beginPath(),s.moveTo(0,E),s.lineTo(o,E),s.stroke(),R&&(s.fillStyle=l.label,s.font="10px Inter, sans-serif",s.fillText(w,4,E-3))}s.strokeStyle=l.hitLine,s.lineWidth=2,s.setLineDash([5,6]),s.beginPath(),s.moveTo(c,0),s.lineTo(c,i),s.stroke(),s.setLineDash([]);const r=this.activeAt(e),d=r?r.index:-1,h=16;for(let g=0;g<this.timed.length;g++){const E=this.timed[g],w=c+(E.start-e)*this.pxPerSec,R=E.dur*this.pxPerSec;if(w+R<-20||w>o+20)continue;const M=this.yFor(E.hz,i),p=g===d,S=8;s.fillStyle=p?l.noteActive:l.note,Fs(s,w,M-h/2,Math.max(R,10),h,S),s.fill(),p&&(s.shadowColor=l.noteGlow,s.shadowBlur=18+l.glow,s.fill(),s.shadowBlur=0)}let f=null,u="#5e6b7a";if(a&&n)if(f=this.yFor(n,i),r){const g=Ke(Math.abs(Dt(n,r.seg.hz)),this.greenCents,this.yellowCents);u=g==="green"?l.green:g==="yellow"?l.yellow:l.red}else u=l.free;for(this.trail.push(f);this.trail.length>70;)this.trail.shift();const m=this.trail.length,v=2.2;s.strokeStyle=u,s.lineWidth=3,s.lineJoin="round",s.globalAlpha=.45,l.glow&&(s.shadowColor=u,s.shadowBlur=l.glow),s.beginPath();let b=!1;for(let g=0;g<m;g++){const E=this.trail[g];if(E==null){b=!1;continue}const w=c-(m-1-g)*v;b?s.lineTo(w,E):(s.moveTo(w,E),b=!0)}s.stroke(),s.shadowBlur=0;for(let g=0;g<m;g++){const E=this.trail[g];if(E==null)continue;const w=c-(m-1-g)*v;s.globalAlpha=.12+g/m*.5,s.fillStyle=u,s.beginPath(),s.arc(w,E,2,0,Math.PI*2),s.fill()}s.globalAlpha=1,f!=null&&(s.fillStyle=u,s.shadowColor=u,s.shadowBlur=16,s.beginPath(),s.arc(c,f,7,0,Math.PI*2),s.fill(),s.shadowBlur=0)}}function Fs(t,e,n,a,s,o){const i=Math.min(o,s/2,a/2);t.beginPath(),t.moveTo(e+i,n),t.arcTo(e+a,n,e+a,n+s,i),t.arcTo(e+a,n+s,e,n+s,i),t.arcTo(e,n+s,e,n,i),t.arcTo(e,n,e+a,n,i),t.closePath()}const zs=(()=>{try{return/Mobi|Android|iPhone|iPad|iPod/i.test(navigator.userAgent)||(navigator.maxTouchPoints||0)>1}catch{return!1}})(),Vs=zs?2.8:1.8;let xn=Vs,xt=null;function ie(t){if(!(!Number.isFinite(t)||t<=0)&&(xn=t,xt&&xt.__rtGain))try{xt.__rtGain.gain.setTargetAtTime(t,xt.currentTime,.02)}catch{}}function Mn(t){if(t.__rtMaster)return xt=t,t.__rtMaster;const e=t.createDynamicsCompressor();e.threshold.value=-10,e.knee.value=24,e.ratio.value=4,e.attack.value=.003,e.release.value=.25;const n=t.createGain();return n.gain.value=xn,e.connect(n).connect(t.destination),t.__rtMaster=e,t.__rtGain=n,xt=t,e}function ht(t,e,n=.6,a=0,s=.22,o="piano"){const i=t.currentTime+a,c=t.createGain();c.connect(Mn(t));const l=[];let r=n;const d=(h,f,u,m)=>{const v=t.createOscillator(),b=t.createGain();v.type=h,v.frequency.value=f,b.gain.value=u,v.connect(b).connect(m),v.start(i),v.stop(i+r+.08),l.push(v)};if(o==="piano")r=Math.max(1.6,n),c.gain.setValueAtTime(1e-4,i),c.gain.linearRampToValueAtTime(s,i+.008),c.gain.exponentialRampToValueAtTime(1e-4,i+r),[[1,1],[2,.5],[3,.25],[4,.12]].forEach(([h,f])=>d("sine",e*h,f,c));else if(o==="guitar"){r=Math.max(1.3,n);const h=t.createBiquadFilter();h.type="lowpass",h.frequency.setValueAtTime(3800,i),h.frequency.exponentialRampToValueAtTime(700,i+r),h.connect(c),c.gain.setValueAtTime(1e-4,i),c.gain.linearRampToValueAtTime(s,i+.006),c.gain.exponentialRampToValueAtTime(1e-4,i+r),[[1,1],[2,.32]].forEach(([f,u])=>d("sawtooth",e*f,u,h))}else r=Math.max(.2,n),c.gain.setValueAtTime(0,i),c.gain.linearRampToValueAtTime(s,i+.025),c.gain.setValueAtTime(s,i+Math.max(.05,r-.1)),c.gain.linearRampToValueAtTime(0,i+r),d("triangle",e,1,c),d("triangle",e*2,.18,c);return{dur:n,stop(){try{l.forEach(h=>{h.stop(),h.disconnect()}),c.disconnect()}catch{}}}}function Xe(t,e,n=0,a=1.4,s=.14,o="piano"){return[0,4,7].forEach(i=>{const c=440*Math.pow(2,(e+i-69)/12);ht(t,c,a,n,s,o)}),a}function Os(t,e,n=.42,a="piano"){return e.forEach((s,o)=>ht(t,s,n*.9,o*n,.22,a)),e.length*n}function Kt(t,e=0,n=!1){const a=t.currentTime+e,s=t.createOscillator(),o=t.createGain();s.frequency.value=n?1600:1050;const i=n?.4:.26;o.gain.setValueAtTime(1e-4,a),o.gain.exponentialRampToValueAtTime(i,a+.005),o.gain.exponentialRampToValueAtTime(1e-4,a+.08),s.connect(o).connect(Mn(t)),s.start(a),s.stop(a+.1)}function Ln(t,e,n,a=.05){const s=[0,7,12].map(o=>{const i=440*Math.pow(2,(e+o-69)/12);return ht(t,i,n,0,a,"soft")});return{stop(){try{s.forEach(o=>o.stop())}catch{}}}}const Jt=[{key:"ionian",name:"Ионийский (мажор)",intervals:[0,2,4,5,7,9,11],tier:"free"},{key:"aeolian",name:"Эолийский (минор)",intervals:[0,2,3,5,7,8,10],tier:"standard"},{key:"dorian",name:"Дорийский",intervals:[0,2,3,5,7,9,10],tier:"pro"},{key:"phrygian",name:"Фригийский",intervals:[0,1,3,5,7,8,10],tier:"pro"},{key:"lydian",name:"Лидийский",intervals:[0,2,4,6,7,9,11],tier:"pro"},{key:"mixolydian",name:"Миксолидийский",intervals:[0,2,4,5,7,9,10],tier:"pro"},{key:"locrian",name:"Локрийский",intervals:[0,1,3,5,6,8,10],tier:"pro"},{key:"harm_major",name:"Гармонический мажор",intervals:[0,2,4,5,7,8,11],tier:"pro"},{key:"harm_minor",name:"Гармонический минор",intervals:[0,2,3,5,7,8,11],tier:"pro"}],Qe={free:0,standard:1,pro:2};function Me(t){return Jt.find(e=>e.key===t)||Jt[0]}function Tn(t,e="free"){const n=Me(t);return Qe[n.tier]<=Qe[e||"free"]}function Ns(t,e){const n=e.intervals,a=Math.round(t)-1,s=Math.floor(a/7),o=(a%7+7)%7;return n[o]+12*s}function Et(t,e){const n=Me(e);return t.map(a=>Ns(a,n))}const P=(t,e=1)=>({midi:t,beats:e});function Sn(t){return{id:"vhold",name:"Calm Down Vowels",syllable:"И-Э-А-О-У",tempo:78,kind:"vowel",root:t,grooveStyle:"soft",greenCents:25,desc:"Унификация гласных: держим позицию, меняем только гласную «И-Э-А-О-У».",how:"Пой «И-Э-А-О-У» ровно, без «прыжков» голосом при смене гласной. Сначала ниже, потом строка повторяется выше — позиция единая.",notes:[0,0,0,0,0,0,0,0,0,0,3,3,3,3,3,3,3,3,3,3].map((n,a)=>P(t+n,a<10?.5:.25))}}function In(t){return{id:"vscale",name:"Disco Vowels",syllable:"И-Э-А-О-У",tempo:124,kind:"scale",root:t,grooveStyle:"pop",desc:"Точность высоты при смене гласной — каждая гласная ведёт по двум нотам.",how:"Пой «И-Э-А-О-У» легко и точно, попадая в каждую ноту слига. Не зажимайся.",notes:[0,1,5,7,8,7,5,1,7,5].map(n=>P(t+n,.75))}}function Bn(t){return{id:"vagil",name:"No Bubble Gum",syllable:"И-Э-И-А-И-О-И-У",tempo:100,kind:"agility",root:t,grooveStyle:"funk",desc:"Беглость и точность: зигзаг по ступеням вверх и обратно.",how:"Лёгко и быстро веди голос по нотам зигзагом вверх, не зажимаясь. Гласные чёткие.",notes:[0,3,1,5,3,7,5,8,7,3,5,1,0].map(n=>P(t+n,.5))}}function Cn(t){return{id:"vclimb",name:"High Five",syllable:"И-Э-А-О-У",tempo:82,kind:"jump",root:t,grooveStyle:"soft",desc:"Гибкость и точность интервала: чистые скачки на квинту, затем ровная гамма.",how:"Чисто бери скачок на квинту вверх и обратно (без зажима), в конце — ровная гамма вверх. Опора дыханием.",notes:[0,7,0,7,0,7,0,7,0,7,0,1,3,5,7].map(n=>P(t+n,.5))}}function An(t){return{id:"jcharles",name:"James Charles Warm Up",syllable:"И-Э-А-О-У",tempo:130,kind:"agility",root:t,grooveStyle:"swing",desc:"Гибкость и позиция гласных: повторяющийся мотив, затем плавный спуск.",how:"Лёгко веди гласные по мотиву, в конце мягко спустись. Без зажима, позиция единая.",notes:[0,1,5,0,1,5,0,1,5,8,8,7,5,1].map(n=>P(t+n,.5))}}function Hn(t,e="ionian"){const n=Et([1,2,3,2,1],e);return{id:"vowels",name:"Цепочка гласных",syllable:"Ми-Ме-Ма",tempo:90,kind:"scale",root:t,modeKey:e,grooveStyle:"swing",desc:"Выравнивание гласных и сохранение позиции при смене звука.",how:"Пой по кругу гласные «Ми-Ме-Ма-Мо», широко раскрывая рот, держи единую позицию.",notes:n.map(a=>P(t+a,1))}}function Rn(t,e="ionian"){const n=Et([1,1,3,2,1,1,-2,1,1,3,2,1],e);return{id:"jump5",name:"Скачок к V ступени",syllable:"Ям",tempo:100,kind:"jump",root:t,modeKey:e,grooveStyle:"latin",desc:"Точная атака интервалов и контроль регистра при скачках.",how:"Пой на «Ям». Перед скачком на квинту не зажимайся — целься точно в ноту.",notes:n.map(a=>P(t+a,1))}}function qn(t,e="ionian"){const a=Et([1,2,3,4,5,6,7,8,7,6,5,4,3,2,1],e);return{id:"lad",name:"Ладовая «ЯМ»",syllable:"Ям",tempo:100,kind:"scale",root:t,modeKey:e,drone:!0,grooveStyle:"march",desc:"Слух и ощущение ладовой окраски — гамма лада вверх и вниз.",how:"Пой на «Ям» по ступеням лада вверх до октавы и обратно. Слушай окраску лада.",notes:a.map(s=>P(t+s,1))}}function Dn(t,e=8){return{id:"sustain",name:"Удержание ноты",syllable:"А",tempo:70,kind:"sustain",root:t,grooveStyle:"ballad",desc:"Учит держать ровный стабильный звук и дыхательную опору — основа пения.",how:"Слушай образец, потом тяни ноту на «А» как можно ровнее. Держи шарик в зелёной зоне без дрожи.",notes:[P(t,e)]}}function Pn(t){return{id:"vibrato",name:"Вибрато",syllable:"А",tempo:60,kind:"vibrato",root:t,grooveStyle:"ballad",greenCents:55,yellowCents:95,desc:"Ровное вибрато — мягкое «качание» высоты примерно 5–6 раз в секунду.",how:"Сначала тяни ровную «А». Когда звук устойчив — добавь лёгкую «волну» голосом, 5–6 колебаний в секунду. Колебание идёт от дыхания и опоры, не дави горлом. На итоге увидишь частоту своего вибрато.",notes:[P(t,10)]}}function Fn(t){return{id:"vwobble",name:"Раскачка вибрато",syllable:"А",tempo:120,kind:"vibrato",root:t,grooveStyle:"soft",greenCents:55,desc:"Запуск вибрато: ровный звук с лёгким «качанием» высоты — основа естественного вибрато.",how:"Пой «А» и добавь мягкое колебание голосом — вверх-вниз небольшими шагами. Колебание идёт от опоры дыхания, не дави горлом.",notes:[0,1,0,1,0,1,0,5,6,5,6,5,6,5].map(n=>P(t+n,.5))}}function zn(t){return{id:"timbre",name:"Тёплый тон",syllable:"Мо",tempo:96,kind:"scale",root:t,grooveStyle:"ballad",desc:"Качество тембра: ровный, округлый звук при движении голоса по нотам.",how:"Пой «Мо» округло и тепло, держи одинаковый тембр на каждой ноте. Не зажимай, звук в маску.",notes:[0,1,3,0,1,3,1,0,0,1,3,5,7,5].map(n=>P(t+n,.5))}}function Vn(t){return{id:"timbre2",name:"Ровный тон на двух",syllable:"А",tempo:80,kind:"sustain",root:t,grooveStyle:"ballad",desc:"Единый тембр при переходе между двумя высотами (вниз на кварту и обратно).",how:"Держи одинаковый округлый звук на обеих нотах — не «бели» нижнюю и не зажимай верхнюю.",notes:[0,0,0,-5,-5,0,0,-5,-5].map(n=>P(t+n,1))}}function On(t){return{id:"regarp",name:"Через регистры",syllable:"Но",tempo:92,kind:"jump",root:t,grooveStyle:"soft",desc:"Плавный переход (passaggio): соединяем нижний и верхний регистр через опорные тоны аккорда.",how:"Пой «Но», возвращаясь к тонике и беря всё выше (терция → квинта → октава). Без «слома» на переходе — мягко.",notes:[0,3,0,7,0,12,0,7,0,3].map(n=>P(t+n,.6))}}function Nn(t){return{id:"regoct",name:"Октавная связка",syllable:"А",tempo:76,kind:"jump",root:t,grooveStyle:"soft",desc:"Связка регистров на октаве — без резкого «переключения» голоса.",how:"Спокойно прыгай на октаву вверх и обратно, целься в центр ноты. Верх не криком, а на опоре и резонансе.",notes:[0,12,0,12].map(n=>P(t+n,1.5))}}function _n(t){return{id:"belt",name:"Белтинг — гамма",syllable:"Эй",tempo:112,kind:"scale",root:t,grooveStyle:"drive",desc:"Яркая опёртая подача (белтинг) на пятинотной гамме — мощно, но без зажима.",how:"Пой «Эй» ярко и звонко, опираясь дыханием. Звук вперёд (в маску), горло свободно. Не дави на верхних нотах.",notes:[0,1,3,5,7,5,3,1,0].map(n=>P(t+n,.6))}}function jn(t){return{id:"beltoct",name:"Белт — октава",syllable:"Эй",tempo:100,kind:"jump",root:t,grooveStyle:"drive",desc:"Опёртая атака верхней ноты через октаву — энергично и безопасно.",how:"Бери октаву вверх ярко и точно, на опоре. Не тянись горлом — звук на дыхании и в резонаторах.",notes:[0,12,0,12,0,12,0].map(n=>P(t+n,.8))}}function Gn(t){return{id:"artic",name:"Чёткое стаккато",syllable:"Та",tempo:132,kind:"agility",root:t,grooveStyle:"funk",desc:"Чёткая артикуляция и точная атака: одна нота, быстрые ясные слоги.",how:"Пой «Та-Та-Та» коротко и чётко на одной высоте. Согласная ясная, гласная ровная, звук не «расползается».",notes:[0,0,0,0,0,0,0,0].map(n=>P(t+n,.5))}}function Wn(t){return{id:"artic2",name:"Слоги по группам",syllable:"Та-Ка",tempo:120,kind:"agility",root:t,grooveStyle:"funk",desc:"Дикция при смене высоты: чёткие слоги группами на двух нотах.",how:"Пой «Та-Ка-Та» группами, чисто меняя высоту вниз и обратно. Каждый слог ясный, ритм ровный.",notes:[0,0,0,-5,-5,-5,0,0,0,-5,-5,-5].map(n=>P(t+n,.5))}}function Un(t){return{id:"resist",name:"Стамина-фигура",syllable:"Ма",tempo:116,kind:"agility",root:t,grooveStyle:"march",desc:"Выносливость и ровность: устойчивый мотив-«волчок» много раз без потери опоры.",how:"Пой «Ма» по фигуре вверх-вниз ровно и не уставая. Дыхание ровное, опора держится до конца.",notes:[0,1,3,1,0,1,3,1,0,1,3,1,0].map(n=>P(t+n,.5))}}function Yn(t){return{id:"resist2",name:"Выносливая гамма",syllable:"Ма",tempo:126,kind:"agility",root:t,grooveStyle:"march",desc:"Дыхательная выносливость: длинный ровный пробег по гамме без добора воздуха.",how:"Пой «Ма» по гамме вверх-вниз дважды на одном дыхании, ровно и точно. Распредели воздух до конца.",notes:[0,1,3,5,7,5,3,1,0,1,3,5,7,5,3,1,0].map(n=>P(t+n,.5))}}function Kn(t,e="ionian"){const n=Et([1,2,3,4,5,4,3,2,1],e);return{id:"scale5",name:"Гамма «Ма-Мэ»",syllable:"Ма",tempo:104,kind:"scale",root:t,modeKey:e,grooveStyle:"pop",desc:"Тренирует точность интонации — чистое попадание в каждую ступень гаммы.",how:"Пой «Ма» и попадай в каждую ноту, которая подъезжает к линии. Старайся держать зелёный.",notes:n.map(a=>P(t+a,1))}}function Jn(t,e="ionian"){const n=Et([1,2,3,4,5,6,5,4,3,2,1],e);return{id:"agility",name:"Беглость «Ма»",syllable:"Ма",tempo:138,kind:"agility",root:t,modeKey:e,grooveStyle:"funk",desc:"Развивает беглость: быстрые и точные переходы между нотами (как в Vocalista).",how:"Пой «Ма» легко и быстро, попадая в каждую ноту пробегающего пассажа. Не зажимайся.",notes:n.map(a=>P(t+a,.5))}}function Xn(t){return{id:"jump",name:"Октавный скачок",syllable:"А",tempo:84,kind:"jump",root:t,grooveStyle:"drive",desc:"Учит координации между нижним и верхним регистром голоса.",how:"Пой «А», точно прыгая на октаву вверх и обратно вниз. Целься в центр ноты.",notes:[P(t+12,2),P(t,2),P(t+12,2),P(t,2)]}}function Le(t,e="ionian"){const n=Et([1,2,3,2,1],e);return{id:"hum3",name:"Мычание по гамме",syllable:"М",tempo:92,kind:"hum",root:t,modeKey:e,grooveStyle:"soft",desc:"Мягкая активация голоса и резонаторов на «м-м-м» — три ступеньки вверх и обратно.",how:"Сомкни губы и мычи «м», идя по нотам: вверх три ступени и вниз. Звук в маску/нос.",notes:n.map(a=>P(t+a,1))}}function Te(t,e="ionian"){const n=Et([1,2,3,4,5,4,3,2,1,5,1],e);return{id:"trill",name:"Губной тренаж «brrr»",syllable:"brrr",tempo:120,kind:"trill",root:t,modeKey:e,grooveStyle:"drive",desc:"Ровный воздушный поток и гибкость: пять ступеней вверх-вниз и скачок на квинту.",how:"Губами «brrr» (если не выходит — на «Р»). Веди по нотам ровно, в конце — скачок на квинту и тонику.",notes:n.map(a=>P(t+a,.75))}}function _s(t){return t.notes.map(e=>j(e.midi))}function oe(t,e,n,a=4){const s=t.notes.map(d=>d.midi),o=Math.min(...s),i=Math.max(...s);if(!Number.isFinite(e)||!Number.isFinite(n))return[0];const c=Math.max(0,Math.min(a,n-i)),l=Math.max(0,Math.min(a,o-e)),r=[];for(let d=0;d<=c;d++)r.push(d);for(let d=c-1;d>=-l;d--)r.push(d);return r.length?r:[0]}function Ze(t){if(t.__noise)return t.__noise;const e=t.createBuffer(1,Math.floor(t.sampleRate*.5),t.sampleRate),n=e.getChannelData(0);for(let a=0;a<n.length;a++)n[a]=Math.random()*2-1;return t.__noise=e,e}const tn={pop:{kick:[0,4],snare:[2,6],hatOpen:[7],bass:[[0,0],[3,0],[4,7]],stab:[3,7],swing:0},funk:{kick:[0,3,6],snare:[2,6],hatOpen:[3,7],bass:[[0,0],[1,7],[4,0],[6,7]],stab:[1,3,5,7],swing:.18},soft:{kick:[0,4],snare:[6],hatOpen:[],bass:[[0,0],[4,7]],stab:[3],swing:0},drive:{kick:[0,2,4,6],snare:[2,6],hatOpen:[],bass:[[0,0],[2,0],[4,7],[6,7]],stab:[4],swing:0},march:{kick:[0,2,4,6],snare:[4],hatOpen:[0,4],bass:[[0,0],[2,7],[4,0],[6,7]],stab:[],swing:0},swing:{kick:[0,4],snare:[2,6],hatOpen:[3,7],bass:[[0,0],[3,5],[4,7],[6,12]],stab:[3,7],swing:.34},ballad:{kick:[0],snare:[4],hatOpen:[],bass:[[0,0],[4,7]],stab:[2,6],swing:0},latin:{kick:[0,3,6],snare:[2,7],hatOpen:[5],bass:[[0,0],[3,7],[6,5]],stab:[2,5],swing:0}};function js(t,{rootMidi:e=60,tempo:n=100,dur:a=16,style:s="pop",gain:o=.5,when:i=0}={}){const c=tn[s]||tn.pop,l=t.currentTime+i,r=60/n,d=r/2,h=r*4,f=Math.ceil(a/h)+1,u=t.createGain();u.gain.value=o;const m=t.createDynamicsCompressor();m.threshold.value=-12,m.ratio.value=4,u.connect(m).connect(t.destination);const v=[],b=p=>{const S=t.createOscillator(),L=t.createGain();S.frequency.setValueAtTime(150,p),S.frequency.exponentialRampToValueAtTime(48,p+.12),L.gain.setValueAtTime(.9,p),L.gain.exponentialRampToValueAtTime(.001,p+.18),S.connect(L).connect(u),S.start(p),S.stop(p+.2),v.push(S)},g=p=>{const S=t.createBufferSource();S.buffer=Ze(t);const L=t.createBiquadFilter();L.type="bandpass",L.frequency.value=1800,L.Q.value=.7;const k=t.createGain();k.gain.setValueAtTime(.5,p),k.gain.exponentialRampToValueAtTime(.001,p+.14),S.connect(L).connect(k).connect(u),S.start(p),S.stop(p+.16),v.push(S)},E=(p,S)=>{const L=t.createBufferSource();L.buffer=Ze(t);const k=t.createBiquadFilter();k.type="highpass",k.frequency.value=7e3;const T=t.createGain(),B=S?.12:.035;T.gain.setValueAtTime(.22,p),T.gain.exponentialRampToValueAtTime(.001,p+B),L.connect(k).connect(T).connect(u),L.start(p),L.stop(p+B+.02),v.push(L)},w=(p,S,L)=>{const k=t.createOscillator(),T=t.createGain();k.type="triangle",k.frequency.value=j(S),T.gain.setValueAtTime(1e-4,p),T.gain.linearRampToValueAtTime(.4,p+.01),T.gain.setValueAtTime(.4,p+L*.5),T.gain.exponentialRampToValueAtTime(.001,p+L),k.connect(T).connect(u),k.start(p),k.stop(p+L+.02),v.push(k)},R=p=>{[e,e+7,e+12].forEach(S=>{const L=t.createOscillator(),k=t.createGain();L.type="triangle",L.frequency.value=j(S),k.gain.setValueAtTime(1e-4,p),k.gain.linearRampToValueAtTime(.09,p+.008),k.gain.exponentialRampToValueAtTime(.001,p+.17),L.connect(k).connect(u),L.start(p),L.stop(p+.2),v.push(L)})},M=e-12;for(let p=0;p<f;p++){const S=l+p*h,L=k=>S+k*d+(k%2?c.swing*d:0);c.kick.forEach(k=>b(L(k))),c.snare.forEach(k=>g(L(k)));for(let k=0;k<8;k++)E(L(k),c.hatOpen.includes(k));c.bass.forEach(([k,T])=>w(L(k),M+T,d*1.6)),c.stab.forEach(k=>R(L(k)))}return{duck(p){const S=p?o*.25:o;try{u.gain.setTargetAtTime(S,t.currentTime,.04)}catch{}},stop(){try{v.forEach(p=>{try{p.stop()}catch{}p.disconnect&&p.disconnect()}),u.disconnect(),m.disconnect()}catch{}}}}const Se="raspevka.clock.v1";function Qn(){try{return Number(localStorage.getItem(Se))||0}catch{return 0}}function ft(){return Date.now()+Qn()}function Zn(){return new Date(ft())}function lt(t=Zn()){return t.toISOString().slice(0,10)}function ts(){return Math.round(Qn()/864e5)}function Gs(t){try{localStorage.setItem(Se,String(Math.round(t)*864e5))}catch{}}function fe(t){Gs(ts()+t)}function ve(){try{localStorage.removeItem(Se)}catch{}}const Ie="raspevka.progress.v1";function $(){try{return JSON.parse(localStorage.getItem(Ie))||{}}catch{return{}}}function q(t){try{localStorage.setItem(Ie,JSON.stringify(t))}catch{}}function es(){try{localStorage.removeItem(Ie)}catch{}}function Ws(){const t=$();return t.range&&Number.isFinite(t.range.low)?t.range:null}function ns(t){const e=$(),n=lt(),a=lt(new Date(ft()-864e5)),s=lt(new Date(ft()-2*864e5));let o=!1;return e.lastDate!==n?(e.lastDate===a?e.streak=(e.streak||0)+1:e.lastDate===s&&(e.freezes||0)>0?(e.freezes-=1,o=!0,e.streak=(e.streak||0)+1):e.streak=1,e.lastDate=n,e.streak>0&&e.streak%7===0&&(e.freezes=Math.min(2,(e.freezes||0)+1))):e.streak||(e.streak=1),e.history=e.history||[],e.history.push({date:n,pct:t.pct,stars:t.stars}),e.history.length>200&&(e.history=e.history.slice(-200)),e.total=(e.total||0)+1,q(e),{streak:e.streak,total:e.total,freezeSpent:o}}function ce(){return $().streak||0}function Xt(){return $().freezes||0}function Us(t){const e=$();return e.freezes=Math.max(0,Math.min(2,Math.round(t))),q(e),e.freezes}function Ys(){const t=lt();return($().history||[]).some(e=>e.date===t)}function be(t){const e=$();return e.streak=Math.max(0,Math.round(t)),e.lastDate=lt(),q(e),e.streak}function Ks(){return $().history||[]}function Js(){return $().rangeHistory||[]}function Xs(){return $().total||0}function Qs(t){const e=$();return e.leads=e.leads||[],e.leads.push({ts:ft(),...t}),e.leads.length>50&&(e.leads=e.leads.slice(-50)),q(e),e.leads}function zt(){return $().examsPassed||[]}function Zs(t){const e=$();return e.examsPassed=e.examsPassed||[],e.examsPassed.includes(t)||(e.examsPassed.push(t),q(e)),e.examsPassed}function ta(t){return($().blockItems||{})[t]||[]}function en(t,e){const n=$();n.blockItems=n.blockItems||{};const a=n.blockItems[t]||[];return a.includes(e)||(a.push(e),n.blockItems[t]=a,q(n)),a}function W(){return $().modeKey||"ionian"}function ss(t){const e=$();return e.modeKey=t,q(e),t}function Mt(){return $().tier||"free"}function jt(t){const e=$();return e.tier=t,q(e),t}const Lt=5,ea=25;function Pt(){return Lt}function gt(){const t=$();let e=t.energy==null?Lt:t.energy;if(e<Lt&&t.energyTs){const n=Math.floor((ft()-t.energyTs)/(ea*6e4));n>0&&(e=Math.min(Lt,e+n))}return e}function Gt(t){const e=$(),n=Math.max(0,Math.min(Lt,Math.round(t)));return e.energy=n,e.energyTs=n<Lt?ft():null,q(e),n}function Ee(t){return Gt(gt()+t)}function Be(){return $().groove||"off"}function as(t){const e=$();return e.groove=t,q(e),t}function na(t){const e=$();if(!e.range||!Number.isFinite(e.range.low))return{extended:null};let n=null;return t>e.range.high?(e.range.high=t,n="high"):t<e.range.low&&(e.range.low=t,n="low"),n&&(e.rangeHistory=e.rangeHistory||[],e.rangeHistory.push({date:lt(),low:e.range.low,high:e.range.high}),e.rangeHistory.length>100&&(e.rangeHistory=e.rangeHistory.slice(-100)),q(e)),{extended:n,midi:t}}function et(){const t=$();return t.voice&&t.voice.key?t.voice:null}function nn(t,e=null,n=null){const a=$(),s=a.voice||{};return a.voice={key:t,low:e??s.low??null,high:n??s.high??null},e!=null&&n!=null&&(a.range={low:Math.round(e),high:Math.round(n)},a.rangeHistory=a.rangeHistory||[],a.rangeHistory.push({date:lt(),low:Math.round(e),high:Math.round(n)}),a.rangeHistory.length>100&&(a.rangeHistory=a.rangeHistory.slice(-100))),q(a),a.voice}const sa={easy:.6,medium:.8,fast:1};function Ce(){return $().difficulty||"easy"}function is(t){const e=$();return e.difficulty=t,q(e),t}function aa(){return sa[Ce()]||.6}function Tt(){return $().guide!==!1}function os(t){const e=$();return e.guide=!!t,q(e),e.guide}function yt(){return $().headphones===!0}function cs(t){const e=$();return e.headphones=!!t,q(e),e.headphones}function ia(){return Tt()?yt()?"continuous":"prehear":"off"}function wt(){const t=$().timbre;return t==="guitar"||t==="soft"?t:"piano"}function ls(t){const e=$();return e.timbre=t,q(e),e.timbre}function rs(){try{const t=navigator.userAgent||"";return/Mobi|Android|iPhone|iPad|iPod/i.test(t)||(navigator.maxTouchPoints||0)>1}catch{return!1}}const Ae={quiet:1,normal:1.8,loud:2.8,max:4.2};function oa(){return rs()?"loud":"normal"}function le(){const t=$().volume;return Ae[t]?t:oa()}function re(){return Ae[le()]}function ds(t){const e=$();return Ae[t]&&(e.volume=t,q(e)),le()}const He={speaker:.09,wired:.12,bt:.24};function ca(){return"speaker"}function de(){const t=$().route;return He[t]?t:ca()}function la(t){const e=$();return He[t]&&(e.route=t,delete e.latencyManual,q(e)),de()}function Re(){const t=$().latencyManual;return Number.isFinite(t)?t:He[de()]}function sn(t){const e=$();return e.latencyManual=Math.max(0,Math.min(.5,t)),q(e),e.latencyManual}function Ht(){return $().darkStage===!0}function ra(t){const e=$();return e.darkStage=!!t,q(e),e.darkStage}function At(){return $().micAGC===!0}function da(t){const e=$();return e.micAGC=!!t,q(e),e.micAGC}const us={low:1.5,med:3,high:5.5};function ua(){return rs()?"high":"med"}function qe(){const t=$().sensitivity;return us[t]?t:ua()}function De(){return us[qe()]}function ms(t){const e=$();return e.sensitivity=t,q(e),t}function hs(){return $().breathBest||0}function ma(t){const e=$();return e.breathBest=Math.max(e.breathBest||0,t),q(e),e.breathBest}const Pe=5,ha=7;function Qt(){return $().paywallEnabled===!0}function pe(t){const e=$();return e.paywallEnabled=!!t,q(e),e.paywallEnabled}function fs(){const t=$();return t.trialStart||(t.trialStart=ft(),q(t)),t.trialStart}function Fe(){const t=$().trialStart;if(!t)return null;const e=ha-Math.floor((ft()-t)/864e5);return Math.max(0,e)}function fa(){const t=Fe();return t!=null&&t>0}function va(){const t=$();delete t.trialStart,q(t)}function ba(){return Mt()!=="free"||fa()}function vs(){const t=$();return t.uses&&t.uses.date===lt()?t.uses.count:0}function bs(){const t=$(),e=lt();return t.uses=t.uses&&t.uses.date===e?{date:e,count:t.uses.count+1}:{date:e,count:1},q(t),t.uses.count}function pa(){return!Qt()||ba()?!1:vs()>=Pe}function ga(){return $().devMode===!0}function Zt(t){const e=$();return e.devMode=!!t,q(e),e.devMode}function ya(t){const e=$();return e.examsPassed=t.slice(),q(e),e.examsPassed}function wa(){const t=$();delete t.examsPassed,delete t.blockItems,q(t)}const te="raspevka.analytics.v1",an=500;function Ea(t,e={}){try{const n=JSON.parse(localStorage.getItem(te)||"[]");n.push({t:Date.now(),type:t,...e}),n.length>an&&n.splice(0,n.length-an),localStorage.setItem(te,JSON.stringify(n))}catch{}}function ka(){try{return JSON.parse(localStorage.getItem(te)||"[]")}catch{return[]}}function $a(){try{localStorage.removeItem(te)}catch{}}function xa(){const t=ka(),e=t.filter(s=>s.type==="exercise_done"),n={};for(const s of e)(n[s.id||"—"]=n[s.id||"—"]||[]).push(s.pct||0);const a=Object.entries(n).map(([s,o])=>({id:s,runs:o.length,avgPct:Math.round(o.reduce((i,c)=>i+c,0)/o.length)})).sort((s,o)=>o.runs-s.runs);return{total:t.length,sessions:e.length,perEx:a}}const Ma="#0e8d7f",La="#0a766a",Ta="#687485",Sa="#ffffff",on="#2a3340",Ia="#cfd6e0",Ba=[0,2,4,5,7,9,11],cn=t=>Ba.includes((t%12+12)%12),Ca=t=>`C${Math.floor(t/12)-1}`;function ps(t,e){if(t==null||e==null)return"";let n=Math.round(t)-2,a=Math.round(e)+2;for(;(n%12+12)%12!==0;)n--;for(;(a%12+12)%12!==11;)a++;const s=13,o=54,i=9,c=33,l=u=>u>=t&&u<=e,r=[];for(let u=n;u<=a;u++)cn(u)&&r.push(u);const d=r.length*s,h={};r.forEach((u,m)=>{h[u]=m*s});let f="";r.forEach((u,m)=>{const v=m*s;f+=`<rect x="${v}" y="0" width="${s-1}" height="${o}" rx="2.5" fill="${l(u)?Ma:Sa}" stroke="${Ia}" stroke-width="1"/>`,(u%12+12)%12===0&&(f+=`<text x="${v+(s-1)/2}" y="${o+11}" text-anchor="middle" fill="${Ta}" font-size="8">${Ca(u)}</text>`)});for(let u=n;u<=a;u++){if(cn(u))continue;const m=h[u-1];if(m==null)continue;const v=m+s-i/2;f+=`<rect x="${v}" y="0" width="${i}" height="${c}" rx="2" fill="${l(u)?La:on}" stroke="${on}" stroke-width="1"/>`}return`
    <div class="mini-kb">
      <svg viewBox="0 0 ${d} ${o+14}" preserveAspectRatio="xMidYMid meet" role="img" aria-label="Диапазон голоса на клавиатуре">
        ${f}
      </svg>
    </div>`}function ke(t){if(!Array.isArray(t)||!t.length)return'<span class="ex-glyph"></span>';const e=t.length,n=Math.min(...t),a=Math.max(...t),o=Math.max(1,a-n)+1,i=10,c=2,l=i-2*c,r=e*i,d=o*i;let h="";for(let f=0;f<e;f++){const u=t[f],m=f*i+c,v=(a-u)*i+c;h+=`<rect${u===a?' class="gh-hi"':""} x="${m}" y="${v}" width="${l}" height="${l}" rx="1.4"/>`}return`<span class="ex-glyph"><svg viewBox="0 0 ${r} ${d}" preserveAspectRatio="xMidYMid meet" role="img" aria-label="Рисунок мелодии упражнения">${h}</svg></span>`}const ln=["#0e8d7f","#12a36b","#e0a64a","#5b8def","#e0544b","#9b6dd6"];function Vt(t=1){if(window.matchMedia&&window.matchMedia("(prefers-reduced-motion: reduce)").matches)return;const e=t>=2?36:18,n=document.createElement("div");n.setAttribute("aria-hidden","true"),n.style.cssText="position:fixed;inset:0;pointer-events:none;z-index:999;overflow:hidden",document.body.appendChild(n);const a=window.innerWidth;for(let s=0;s<e;s++){const o=document.createElement("i"),i=5+Math.random()*6,c=Math.random()<.4;o.style.cssText=`position:absolute;top:-12px;left:${Math.random()*a}px;width:${i}px;height:${c?i:i*.45}px;background:${ln[s%ln.length]};border-radius:${c?"50%":"2px"};will-change:transform,opacity`,n.appendChild(o);const l=320+Math.random()*380,r=(Math.random()-.5)*160,d=1100+Math.random()*900;o.animate([{transform:"translate(0,0) rotate(0deg)",opacity:1},{transform:`translate(${r}px,${l}px) rotate(${(Math.random()-.5)*540}deg)`,opacity:0}],{duration:d,delay:Math.random()*250,easing:"cubic-bezier(.2,.6,.35,1)",fill:"forwards"})}setTimeout(()=>n.remove(),2600)}function ee(t=12){try{navigator.vibrate&&navigator.vibrate(t)}catch{}}let gs=!1;function ct(t,e,n,a,s={}){const{onExit:o,onAgain:i,onComplete:c,onResult:l,explain:r}=s;if(ie(re()),r){$e(t,a,{onExit:o,onStart:()=>ct(t,e,n,a,{...s,explain:!1}),onModeChange:s.rebuild?()=>ct(t,e,n,s.rebuild(),{...s,explain:!0}):null});return}const d=s.reps,h=s.repIndex||0,f=d&&d.length&&d[h]||0,u=a.root!=null?a.root:a.notes[0].midi,m=f?{...a,root:u+f,notes:a.notes.map(x=>({...x,midi:x.midi+f}))}:a,v=d&&d.length>1?` · ${h+1}/${d.length}`:"";t.innerHTML=`
    <div class="screen game ${Ht()?"stage-dark":""}">
      <div class="game-top">
        <button class="icon-btn" id="exit">‹ Меню</button>
        <div class="ex-name">${m.name} · <span class="syl">«${m.syllable}»</span>${v}</div>
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
  `;const b=document.getElementById("hw"),g=b.getContext("2d"),E=document.getElementById("msg"),w=document.getElementById("livebar"),R=document.getElementById("target"),M=document.getElementById("yours"),p=document.getElementById("cue");function S(){const x=Math.min(window.devicePixelRatio||1,2);b.width=b.clientWidth*x,b.height=b.clientHeight*x,g.setTransform(x,0,0,x,0,0)}S(),window.addEventListener("resize",S);const L=aa(),k={...m,tempo:Math.max(40,Math.round(m.tempo*L))},T=new Ps(b,k,{theme:Ht()?"dark":"light"}),B=new Ds(m.notes.length),C=Re(),y=yt()||de()!=="speaker";let H=null,A=null,D=0,U=0,F=!1,Z=!1,st=0,bt=-1;const pt=[],me=[],It=(x,O)=>{const N=setTimeout(x,O);return me.push(N),N};function Oe(){pt.forEach(x=>x&&x.stop&&x.stop()),pt.length=0}function he(){A&&(cancelAnimationFrame(A),A=null),me.forEach(clearTimeout),me.length=0,window.removeEventListener("resize",S),document.removeEventListener("visibilitychange",Ne),Oe()}function Ne(){document.hidden?(A&&(cancelAnimationFrame(A),A=null),Oe(),D&&!F&&(F=!0,Z=!0)):Z&&(Z=!1,_e())}document.addEventListener("visibilitychange",Ne),document.getElementById("exit").addEventListener("click",()=>{he(),o()});function _e(){he(),ct(t,e,n,a,{...s,explain:!1})}Ut(document.getElementById("gsettings"),_e,e);const Nt=m.root!=null?m.root:m.notes[0].midi,Bs=_s(m),Bt=wt();T.draw(0,null,!1),h===0?(E.textContent="Слушай тонику…",Xe(e.ctx,Nt,0,1.4,.14,Bt),It(()=>{E.textContent="Образец…";const x=Os(e.ctx,Bs,.34,Bt);It(Cs,x*1e3+250)},1650)):(E.textContent=(f>0?"↑ выше":"↓ ниже")+` · повтор ${h+1}/${d.length}`,Xe(e.ctx,Nt,0,.8,.14,Bt),It(()=>{Kt(e.ctx,0,!0),It(je,480)},950));function Cs(){let x=3;const O=()=>{x>0?(Kt(e.ctx),E.textContent="Приготовься… "+x,x-=1,It(O,600)):je()};O()}function je(){const x=ia();E.textContent=x==="continuous"?"Пой за подсказкой!":x==="prehear"?"Слушай тон и повторяй!":"Пой!",n.reset(),D=performance.now(),U=D,st=D,x==="continuous"?T.timed.forEach(G=>{pt.push(ht(e.ctx,G.hz,Math.max(.2,G.dur*.92),G.start,.1,Bt))}):x==="prehear"&&T.timed.forEach(G=>{const X=Math.min(.4,G.dur);pt.push(ht(e.ctx,G.hz,X,Math.max(0,G.start-X),.18,Bt))}),m.drone&&pt.push(Ln(e.ctx,Nt,T.totalTime+.5,.05));const O=Be(),N=O==="auto"?m.grooveStyle||"pop":O;N!=="off"&&(H=js(e.ctx,{rootMidi:Nt,tempo:k.tempo,dur:T.totalTime,style:N,gain:.45}),pt.push(H)),Ge()}function Ge(){const x=performance.now(),O=(x-D)/1e3,N=x-U;U=x;const G=e.read();let X=!1,ot=null;if(G){const ut=n.process(G);X=ut.voiced&&e.rms()>.0025,ot=ut.smoothedHz}H&&!y&&H.duck(X);const tt=T.evaluate(O-C,X?ot:null,X);if(tt.index>=0){let ut=null;tt.voiced&&ot&&T.timed[tt.index]&&(ut=Dt(ot,T.timed[tt.index].hz)),B.record(tt.index,tt.zone,N,tt.voiced,ut),tt.zone==="green"&&tt.voiced&&tt.index!==bt&&(ee(12),bt=tt.index)}T.draw(O,X?ot:null,X);const kt=T.activeAt(O);if(R.textContent=kt?Aa(kt.seg.midi):"—",X&&ot){st=x;const ut=rt(ot);M.textContent=ut?ut.name:"—";const Hs=tt.zone==="green"?"var(--green)":tt.zone==="yellow"?"var(--yellow)":"var(--coral)";if(M.style.color=kt?Hs:"var(--text)",w.style.width=Math.min(100,e.rms()*350)+"%",kt){const Ye=Dt(ot,kt.seg.hz);Math.abs(Ye)<=20?(p.textContent="в точку",p.style.color="var(--green)"):Ye<0?(p.textContent="↑ выше",p.style.color="var(--amber)"):(p.textContent="↓ ниже",p.style.color="var(--amber)")}else p.textContent=""}else M.textContent="—",M.style.color="var(--text-dim)",w.style.width="0%",kt&&x-st>5e3?(p.textContent="не слышу голос — спой громче",p.style.color="var(--coral)"):p.textContent="";O<T.totalTime?A=requestAnimationFrame(Ge):F||(F=!0,As())}function As(){const x=B.result();he();const O=s._acc||[];if(O.push(x),d&&d.length>1&&h<d.length-1){ct(t,e,n,a,{...s,repIndex:h+1,_acc:O});return}const N=O.reduce((X,ot)=>X+(ot.pct||0),0)/O.length,G={pct:N,stars:N>=.85?3:N>=.6?2:N>=.35?1:0,notesHit:x.notesHit,notesTotal:x.notesTotal,avgCents:x.avgCents,perNote:x.perNote,stability:x.stability,vibrato:x.vibrato,repsDone:O.length};if(Ea("exercise_done",{id:a.id,pct:Math.round(N*100),stability:Math.round(x.stability||0),reps:O.length}),l&&l(G),c){c(G);return}if(N>=.5&&ns({pct:N,stars:G.stars}),N<.4){if(gt()>0){Ee(-1),Ue(G);return}}else N>=.5&&Ee(N>=.8?2:1);We(G)}function We(x){x.stars>=2&&(Vt(x.stars>=3?2:1),ee(x.stars>=3?30:15));const O="★".repeat(x.stars)+"☆".repeat(3-x.stars),N=Math.round(x.pct*100),G=x.stars>=3?"Отлично!":x.stars===2?"Хорошо!":x.stars===1?"Неплохо":"Ещё разок",X=dn(x,a);t.innerHTML=`
      <div class="screen summary">
        <div class="stars">${O}</div>
        <div class="verdict">${G}</div>
        <div class="big-pct">${N}<span>%</span></div>
        <p class="hint">средняя точность${x.repsDone>1?` за ${x.repsDone} повтор${x.repsDone<5?"а":"ов"}`:""}</p>
        ${rn(gt(),Pt())}
        ${Ra(x)}
        <div class="card tip-card"><p class="how"><b>Разбор.</b> ${X}</p></div>
        ${Wt()}
        <div class="row">
          <button class="btn btn-ghost" id="menu">Меню</button>
          <button class="btn btn-primary" id="again">Ещё раз</button>
        </div>
      </div>
    `,Ut(t,()=>We(x),e),document.getElementById("again").addEventListener("click",i),document.getElementById("menu").addEventListener("click",o)}function Ue(x){const O=Math.round(x.pct*100),N=dn(x,a);t.innerHTML=`
      <div class="screen summary">
        <div class="verdict" style="color:var(--coral)">Сложновато — попробуем ещё</div>
        <div class="big-pct" style="color:var(--coral)">${O}<span>%</span></div>
        ${rn(gt(),Pt())}
        <div class="card tip-card"><p class="how"><b>Подсказка.</b> ${N}</p></div>
        <p class="hint">Энергия −1 (восстанавливается со временем). Сбавь темп или включи «подсказку тоном» — станет легче.</p>
        ${Wt()}
        <div class="row">
          <button class="btn btn-ghost" id="menu">Меню</button>
          <button class="btn btn-primary" id="again">Пройти заново</button>
        </div>
      </div>`;const G=()=>ct(t,e,n,a,{...s,explain:!1,repIndex:0,_acc:void 0});Ut(t,()=>Ue(x),e),document.getElementById("menu").addEventListener("click",o),document.getElementById("again").addEventListener("click",G)}}function Aa(t){const e=rt(440*Math.pow(2,(t-69)/12));return e?e.name:""}function Ha(){return'<svg viewBox="0 0 24 24" width="15" height="15" fill="currentColor"><path d="M13 2 4 14h6l-1 8 9-12h-6z"/></svg>'}function rn(t,e){const n=Array.from({length:e},(a,s)=>`<span class="en-pip ${s<t?"on":""}"></span>`).join("");return`<div class="energy-row"><span class="en-ic">${Ha()}</span><div class="energy-pips">${n}</div></div>`}function Ra(t){if(t.stability==null)return"";const e=t.stability,n=e<15?"ровно":e<30?"почти ровно":"дрожит",a=e<15?"var(--green)":e<30?"var(--amber)":"var(--coral)",o=t.vibrato&&t.vibrato.present?`есть · ${t.vibrato.rateHz.toFixed(1)} Гц`:"нет";return`<div class="stat-chips">
    <span class="stat-chip">ровность: <b style="color:${a}">${n}</b></span>
    <span class="stat-chip">вибрато: <b>${o}</b></span>
  </div>`}function qa(t){if(t.modeKey===void 0)return"";const e=W(),n=Mt();return`<div class="settings" style="margin-bottom:8px">
      <div class="seg-label">Лад распевки</div>
      <select id="modeSel" class="lad-select">${Jt.map(s=>{const o=!Tn(s.key,n);return`<option value="${s.key}" ${s.key===e?"selected":""} ${o?"disabled":""}>${s.name}${o?" 🔒":""}</option>`}).join("")}</select>
    </div>`}function $e(t,e,{onExit:n,onStart:a,onModeChange:s}){t.innerHTML=`
    <div class="screen breathe-intro">
      <div class="game-top"><button class="icon-btn" id="back">‹ Меню</button></div>
      <div class="brand"><h1>${e.name}</h1>
        <p>Слог: <b>«${e.syllable}»</b></p></div>
      <div class="card">
        ${e.desc?`<p class="blurb">${e.desc}</p>`:""}
        ${e.how?`<p class="how"><b>Как делать.</b> ${e.how}</p>`:""}
        <div class="ex-glyph preview-contour" title="Форма распевки: выше квадрат — выше нота">${ke(e.notes.map(i=>i.midi))}</div>
        <p class="how mech"><b>Как устроена игра.</b> Ноты едут к вертикальной линии слева. Пой так, чтобы твой светящийся шарик совпал с нотой по высоте: <b style="color:var(--green)">зелёный</b> — точно, <b style="color:var(--amber)">жёлтый</b> — почти, <b style="color:var(--coral)">красный</b> — мимо. Сначала прозвучит <b>аккорд тоники</b> и образец мелодии — это твоя опора, чтобы попасть. «Подсказка тоном» подыгрывает нужную ноту (без наушников — коротко перед тем, как её петь).</p>
      </div>
      ${qa(e)}
      ${Wt()}
      <button class="btn btn-primary" id="go" style="width:100%">Начать</button>
    </div>
  `,document.getElementById("back").addEventListener("click",n),document.getElementById("go").addEventListener("click",a),Ut(t,()=>$e(t,e,{onExit:n,onStart:a,onModeChange:s}));const o=document.getElementById("modeSel");o&&o.addEventListener("change",()=>{ss(o.value),s?s():$e(t,e,{onExit:n,onStart:a,onModeChange:s})})}function Wt(){const t=Ce(),e=Tt(),n=yt(),a=wt(),s=(d,h)=>`<button data-diff="${d}" class="${t===d?"on":""}">${h}</button>`,o=(d,h)=>`<button data-timbre="${d}" class="${a===d?"on":""}">${h}</button>`,i=Be(),c=(d,h)=>`<button data-groove="${d}" class="${i===d?"on":""}">${h}</button>`,l=le(),r=(d,h)=>`<button data-vol="${d}" class="${l===d?"on":""}">${h}</button>`;return`
    <div class="settings inline-settings">
      <div class="seg-label">Громкость подсказки</div>
      <div class="seg">${r("quiet","Тихо")}${r("normal","Норм")}${r("loud","Громко")}${r("max","Макс")}</div>
      <div class="seg-label">Темп</div>
      <div class="seg">${s("easy","Медл.")}${s("medium","Средне")}${s("fast","Быстро")}</div>
      <div class="toggle-row">
        <button class="toggle ${e?"on":""}" data-guidetoggle="1">Подсказка тоном: ${e?"вкл":"выкл"}</button>
      </div>
      <details class="more-settings" ${gs?"open":""}>
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
  `}function Ut(t,e,n){t.querySelectorAll("[data-diff]").forEach(i=>{i.addEventListener("click",()=>{is(i.dataset.diff),e()})}),t.querySelectorAll("[data-timbre]").forEach(i=>{i.addEventListener("click",()=>{ls(i.dataset.timbre),e()})}),t.querySelectorAll("[data-groove]").forEach(i=>{i.addEventListener("click",()=>{as(i.dataset.groove),e()})}),t.querySelectorAll("[data-vol]").forEach(i=>{i.addEventListener("click",()=>{if(ds(i.dataset.vol),ie(re()),n&&n.ctx)try{ht(n.ctx,523.25,.5,0,.22,wt())}catch{}e()})});const a=t.querySelector("[data-guidetoggle]");a&&a.addEventListener("click",()=>{os(!Tt()),e()});const s=t.querySelector("[data-hptoggle]");s&&s.addEventListener("click",()=>{cs(!yt()),e()});const o=t.querySelector(".more-settings");o&&o.addEventListener("toggle",()=>{gs=o.open})}function dn(t,e){if(t.stars>=3)return"Чисто и точно! Можно прибавить темп или взять упражнение посложнее.";const n=[],a=t.avgCents;a<=-18?n.push("Ты чаще занижал — тяни ноту чуть выше, поддержи дыханием (опора живота)."):a>=18&&n.push("Ты чаще завышал — не дави, расслабь гортань, целься чуть ниже.");const s=t.perNote.length;if(s>=3){const i=e.notes.map((l,r)=>({i:r,midi:l.midi})).sort((l,r)=>r.midi-l.midi).slice(0,Math.max(1,Math.round(s/3)));i.reduce((l,r)=>l+(t.perNote[r.i]||0),0)/i.length<t.pct-.15&&n.push("Верхние ноты даются хуже — не тянись вверх горлом, добавь головной резонанс и воздух.")}return n.length||n.push("Целься в центр ноты и держи ровно. Включи «подсказку тоном» — попадать заметно легче."),n.join(" ")}const K=(t,e)=>({s:t,b:e});function _t(t,e){const n=[];for(let a=0;a<e;a++)n.push(...t.map(s=>({...s})));return n}const Rt={air1:{id:"air1",name:"Дыхание: длинные с / ш",kind:"rhythm",tempo:70,desc:"Ровный длинный выдох на «с» и «ш» под метроном — опора и расход воздуха.",how:"«с-с-с» тянем на 4 клика → вдох носом → «ш-ш-ш» на 4 клика → вдох носом. Выдох ровный, без толчков.",steps:_t([K("с",4),K("вдох",2),K("ш",4),K("вдох",2)],4)},air2:{id:"air2",name:"Дыхание: короткий с + 5 ш",kind:"rhythm",tempo:80,desc:"Короткий толчок «с» и серия «ш» — активный выдох и чувство ритма.",how:"Короткий «с», пауза, затем 5 коротких «ш». Между «с» и «ш» НЕ дышим; вдох носом — после серии.",steps:_t([K("с",.5),K("rest",.5),K("ш",.5),K("ш",.5),K("ш",.5),K("ш",.5),K("ш",.5),K("вдох",2)],6)},air3:{id:"air3",name:"Артикуляция: 15 с + 15 ш",kind:"rhythm",tempo:80,desc:"Чёткие короткие «с» и «ш» в ровном пульсе — артикуляция и дыхание.",how:"15 коротких «с» → вдох носом → 15 коротких «ш». Держи ровный пульс с метрономом.",steps:[..._t([K("с",.5)],15),K("вдох",2),..._t([K("ш",.5)],15)]}},Da={с:"С-с-с",ш:"Ш-ш-ш",вдох:"Вдох носом",rest:"·"};function ys(t,e,n,a,{onExit:s,onComplete:o}={}){let i=null,c=null,l=!1;const r=[];function d(){i&&(cancelAnimationFrame(i),i=null),r.forEach(clearTimeout),r.length=0,c&&(c.stop(),c=null),document.removeEventListener("visibilitychange",h)}function h(){document.hidden?(i&&(cancelAnimationFrame(i),i=null),c&&(c.stop(),c=null),l=!0):l&&(l=!1,f())}function f(){d(),t.innerHTML=`
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
    `,document.getElementById("back").addEventListener("click",()=>{d(),s()}),document.getElementById("go").addEventListener("click",u)}function u(){document.addEventListener("visibilitychange",h);const v=60/a.tempo;let b=0;const g=a.steps.map(B=>{const C={...B,start:b,end:b+B.b};return b+=B.b,C}),E=b,w=E*v;t.innerHTML=`
      <div class="screen breathe">
        <div class="game-top"><button class="icon-btn" id="quit">‹ Прервать</button></div>
        <div class="rhythm-stage">
          <div class="rhythm-beat" id="beat"></div>
          <div class="rhythm-label" id="lbl">Приготовься…</div>
        </div>
        <div class="bar"><i id="prog"></i></div>
      </div>
    `,document.getElementById("quit").addEventListener("click",()=>{d(),s()});const R=document.getElementById("lbl"),M=document.getElementById("beat"),p=document.getElementById("prog");c=Ln(e.ctx,n,w+.4);const S=performance.now();let L=-1,k=!1;function T(){const B=(performance.now()-S)/1e3,C=B/v,y=Math.floor(C);y>L&&y<Math.ceil(E)&&(L=y,Kt(e.ctx,0,y%4===0),M.classList.remove("pulse"),M.offsetWidth,M.classList.add("pulse"));const H=g.find(A=>C>=A.start&&C<A.end);H&&(R.textContent=Da[H.s]||"",R.style.color=H.s==="вдох"?"var(--gold)":H.s==="rest"?"var(--text-dim)":"var(--accent-2)"),p.style.width=Math.min(100,B/w*100)+"%",B<w?i=requestAnimationFrame(T):k||(k=!0,m())}i=requestAnimationFrame(T)}function m(){if(d(),o){o({pct:null,rhythm:!0});return}t.innerHTML=`
      <div class="screen summary">
        <div class="stars">🫁</div>
        <div class="verdict">Готово!</div>
        <p class="hint">Дыхание и артикуляция размяты. Голос готов к распевке.</p>
        <div class="row">
          <button class="btn btn-ghost" id="menu">Меню</button>
          <button class="btn btn-primary" id="again">Ещё раз</button>
        </div>
      </div>
    `,document.getElementById("menu").addEventListener("click",s),document.getElementById("again").addEventListener("click",f)}f()}const ne=[{key:"bass",name:"Бас",group:"муж",low:40,high:64,center:48,blurb:"Самый низкий мужской голос, глубокий и плотный."},{key:"baritone",name:"Баритон",group:"муж",low:43,high:67,center:52,blurb:"Средний мужской голос — самый распространённый."},{key:"tenor",name:"Тенор",group:"муж",low:48,high:72,center:57,blurb:"Высокий мужской голос, яркий и звонкий."},{key:"contralto",name:"Контральто",group:"жен",low:53,high:77,center:60,blurb:"Низкий женский голос, тёплый и насыщенный."},{key:"mezzo",name:"Меццо-сопрано",group:"жен",low:57,high:81,center:64,blurb:"Средний женский голос — самый частый у женщин."},{key:"soprano",name:"Сопрано",group:"жен",low:60,high:84,center:67,blurb:"Высокий женский голос, светлый и парящий."}];function dt(t){return ne.find(e=>e.key===t)||null}function it(t){return $n(Math.round(t))||""}function un(t){return`${it(t.low)}–${it(t.high)}`}function Pa(t,e){const n=(t+e)/2;let a=ne[0],s=1/0;for(const o of ne){const i=(o.low+o.high)/2,c=.6*Math.abs(t-o.low)+.4*Math.abs(n-i);c<s&&(s=c,a=o)}return a}function Fa(t,e,n,{onExit:a}){const s=et(),o=s&&dt(s.key),i=o?o.center:60,c=s&&s.low!=null&&s.high!=null?{low:s.low,high:s.high}:o?{low:o.low,high:o.high}:{low:48,high:72},l=[{title:"Дыхание: длинные с / ш",tip:"Ровный длинный выдох в такт.",rhythm:Rt.air1},{title:"Дыхание: короткий с + 5 ш",tip:"Активный выдох, вдох носом после серии.",rhythm:Rt.air2},{title:"Артикуляция: 15 с + 15 ш",tip:"Чётко и ровно с метрономом.",rhythm:Rt.air3},{title:"Мычание по гамме «М»",tip:"Мягко, в маску. Сначала прозвучит тоника.",ex:Le(i)},{title:"Губной тренаж «brrr»",tip:"Губами «brrr» или на «Р», ровно.",ex:Te(i)}];let r=0;const d=[];function h(){if(r>=l.length)return u();const m=l[r];f(m,r,()=>{const v=b=>{d.push(b),r+=1,h()};if(m.rhythm)ys(t,e,i,m.rhythm,{onExit:a,onComplete:v});else{const b=oe(m.ex,c.low,c.high,2);ct(t,e,n,m.ex,{onExit:a,onComplete:v,reps:b})}})}function f(m,v,b){t.innerHTML=`
      <div class="screen interstitial">
        <div class="game-top"><button class="icon-btn" id="quit">‹ Прервать</button></div>
        <div class="step-count">Упражнение ${v+1} из ${l.length}</div>
        <div class="brand"><h1>${m.title}</h1><p>${m.tip}</p></div>
        <div class="progress-dots">
          ${l.map((g,E)=>`<span class="dot ${E<v?"done":E===v?"now":""}"></span>`).join("")}
        </div>
        <button class="btn btn-primary" id="go" style="width:100%">Начать</button>
      </div>
    `,document.getElementById("go").addEventListener("click",b),document.getElementById("quit").addEventListener("click",a)}function u(){const m=d.filter(M=>M&&typeof M.pct=="number"),v=m.length?m.reduce((M,p)=>M+p.pct,0)/m.length:1,b=v>=.85?3:v>=.6?2:v>=.35?1:0,{streak:g,freezeSpent:E}=ns({pct:v,stars:b});Vt(2),ee(30);const w="★".repeat(b)+"☆".repeat(3-b),R=Math.round(v*100);t.innerHTML=`
      <div class="screen summary">
        <div class="stars">${w}</div>
        <div class="verdict">Распевка завершена!</div>
        <div class="big-pct">${R}<span>%</span></div>
        <p class="hint">средняя точность по ${m.length} ${m.length===1?"распевке":"распевкам"} с нотами</p>
        <div class="streak-badge">🔥 Стрик: ${g} ${g===1?"день":"дн."}${E?" · ❄ заморозка спасла стрик":""}</div>
        <button class="btn btn-primary" id="menu" style="width:100%">В меню</button>
      </div>
    `,document.getElementById("menu").addEventListener("click",a)}h()}function ze(t,e,n,{onDone:a,onExit:s,canSkip:o=!1}){let i=null;const c=()=>{i&&cancelAnimationFrame(i),i=null};function l(){c(),n.reset();const f=et(),u=f&&dt(f.key);let m=u?u.group:"муж";t.innerHTML=`
      <div class="screen">
        <div class="game-top">
          <button class="icon-btn" id="back">${o?"Пропустить":"‹ Меню"}</button>
        </div>
        <div class="brand"><h1>Твой голос</h1>
          <p>Знаешь свой тип — выбери. Не знаешь — определим за минуту.</p></div>
        <button class="btn btn-primary" id="detect" style="width:100%">Определить мой голос</button>
        <div class="settings">
          <div class="seg-label">Тип голоса</div>
          <div class="seg" id="genderSeg">
            <button data-gender="муж" class="${m==="муж"?"on":""}">Мужские</button>
            <button data-gender="жен" class="${m==="жен"?"on":""}">Женские</button>
          </div>
        </div>
        <div class="card list">
          <div class="list-sep">Или выбери сам</div>
          <div id="voiceCards"></div>
        </div>
      </div>
    `,document.getElementById("back").addEventListener("click",s),document.getElementById("detect").addEventListener("click",r);function v(){const b=et();document.getElementById("voiceCards").innerHTML=ne.filter(g=>g.group===m).map(g=>`
          <button class="list-item voice-card" data-pick="${g.key}">
            <span class="li-main">${g.name}${b&&b.key===g.key?" ·  выбран":""}</span>
            <span class="li-sub">${g.group==="муж"?"мужской":"женский"} · ${un(g)}</span>
          </button>`).join(""),document.querySelectorAll("[data-pick]").forEach(g=>g.addEventListener("click",()=>{nn(g.dataset.pick),a(et())}))}document.querySelectorAll("[data-gender]").forEach(b=>b.addEventListener("click",()=>{m=b.dataset.gender,document.querySelectorAll("[data-gender]").forEach(g=>g.classList.toggle("on",g.dataset.gender===m)),v()})),v()}function r(){c(),t.innerHTML=`
      <div class="screen breathe-intro">
        <div class="game-top"><button class="icon-btn" id="back">‹ Назад</button></div>
        <div class="brand"><h1>Определим голос</h1></div>
        <div class="card">
          <p class="blurb">Сначала споёшь свою самую низкую удобную ноту, потом — самую высокую (без напряжения!). По диапазону подскажу твой тип.</p>
          <p class="how mech"><b>Как.</b> Пой ровно и держи ноту — когда звук станет стабильным, пойдёт отсчёт и я её запишу. Верх <b>не форсируй</b>: бери только то, что берётся легко.</p>
        </div>
        <button class="btn btn-primary" id="go" style="width:100%">Поехали</button>
      </div>
    `,document.getElementById("back").addEventListener("click",l),document.getElementById("go").addEventListener("click",()=>d("low"))}function d(f,u=null){c();const m=f==="low";t.innerHTML=`
      <div class="screen onboard">
        <div class="game-top"><button class="icon-btn" id="back">‹ Назад</button></div>
        <div class="brand"><h1>${m?"Нижняя нота":"Верхняя нота"}</h1>
          <p>${m?"Спой свою <b>самую низкую удобную</b> ноту и тяни ровно.":"Теперь <b>самую высокую</b> — мягко, <b>без напряжения</b>."}</p></div>
        <div class="note-display silent" id="note">—</div>
        <div class="stability"><div class="stability-fill" id="stab"></div></div>
        <p class="hint" id="status">Пой и держи ровно…</p>
        ${u!=null?`<p class="hint">Низ записан: <b>${it(u)}</b></p>`:""}
      </div>
    `,document.getElementById("back").addEventListener("click",()=>m?r():d("low"));const v=document.getElementById("note"),b=document.getElementById("status"),g=document.getElementById("stab"),E=[],w=24,R=1200;let M=0;function p(T){const B=Math.min(...T),C=Math.max(...T);return 1200*Math.log2(C/B)}function S(T){const B=[...T].sort((C,y)=>C-y);return B[Math.floor(B.length/2)]}n.reset(),n.setRange&&n.setRange(55,1300);function L(){const T=e.read();if(T){const{smoothedHz:B,voiced:C}=n.process(T);if(C&&B){const y=rt(B),H=y.name.match(/^([A-G]#?)(-?\d+)$/);if(v.className="note-display green",v.innerHTML=H?`${H[1]}<span class="oct">${H[2]}</span>`:y.name,E.push(B),E.length>w&&E.shift(),E.length>=w&&p(E)<110){M||(M=performance.now());const D=performance.now()-M;g.style.width=Math.min(100,D/R*100)+"%";const U=Math.ceil((R-D)/1e3);if(b.textContent=D<R?`Держи… ${Math.max(1,U)}`:"Готово!",D>=R)return k(Math.round(rt(S(E)).midi))}else M=0,g.style.width="0%",b.textContent="Держи ровнее…"}else v.className="note-display silent",v.textContent="—",M=0,g.style.width="0%",E.length&&(E.length=0),b.textContent="Пой и держи ровно…"}i=requestAnimationFrame(L)}L();function k(T){if(c(),m)d("high",T);else{let B=u,C=T;C<=B&&(C=B+7),h(B,C)}}}function h(f,u){c();const m=Pa(f,u);nn(m.key,f,u),Vt(2),ee(25),t.innerHTML=`
      <div class="screen summary">
        <div class="verdict" style="font-size:18px;color:var(--text-dim)">Похоже, твой голос —</div>
        <div class="voice-result">${m.name}</div>
        <p class="hint">${m.blurb}</p>
        <div class="card" style="text-align:left;width:100%">
          <p class="how"><b>Твой диапазон:</b> ${it(f)} – ${it(u)}</p>
          ${ps(f,u)}
          <p class="how"><b>Типичный для ${m.name.toLowerCase()}:</b> ${un(m)}</p>
          <p class="how mech">Это ориентир по диапазону, а не окончательный вердикт — точный тип и тембр определит педагог. Упражнения подстроятся под тебя.</p>
        </div>
        <div class="row">
          <button class="btn btn-ghost" id="redo">Переопределить</button>
          <button class="btn btn-primary" id="ok">Готово</button>
        </div>
      </div>
    `,document.getElementById("redo").addEventListener("click",r),document.getElementById("ok").addEventListener("click",()=>a(et()))}l()}function mn(t,e,n,a,s,o){t.beginPath(),t.moveTo(e+o,n),t.arcTo(e+a,n,e+a,n+s,o),t.arcTo(e+a,n+s,e,n+s,o),t.arcTo(e,n+s,e,n,o),t.arcTo(e,n,e+a,n,o),t.closePath()}function za({headline:t="Мой прогресс",big:e="",sub:n=""}){const o=document.createElement("canvas");o.width=1080,o.height=1080;const i=o.getContext("2d");return i.fillStyle="#eef2f4",i.fillRect(0,0,1080,1080),i.fillStyle="#ffffff",i.shadowColor="rgba(20,33,55,.18)",i.shadowBlur=60,i.shadowOffsetY=24,mn(i,90,120,900,780,48),i.fill(),i.shadowColor="transparent",i.shadowBlur=0,i.shadowOffsetY=0,i.fillStyle="#0e8d7f",mn(i,90,120,900,150,48),i.fill(),i.fillStyle="#0e8d7f",i.fillRect(90,230,900,40),i.fillStyle="#ffffff",i.font="700 46px system-ui, sans-serif",i.textBaseline="middle",i.fillText("Распевка",130,195),i.font="500 30px system-ui, sans-serif",i.fillStyle="rgba(255,255,255,.9)",i.textAlign="right",i.fillText("вокальный тренажёр",950,195),i.textAlign="left",i.fillStyle="#5c6775",i.font="600 40px system-ui, sans-serif",i.fillText(t,150,380),i.fillStyle="#1b2430",i.font="800 150px system-ui, sans-serif",i.fillText(e,146,520),i.fillStyle="#0a766a",i.font="600 44px system-ui, sans-serif",i.fillText(n,150,660),i.fillStyle="#9aa6b2",i.font="500 32px system-ui, sans-serif",i.fillText("a1exxx.github.io/raspevka",150,840),o}async function hn(t){const e=za(t),n=await new Promise(i=>e.toBlob(i,"image/png"));if(!n)return;const a=new File([n],"raspevka.png",{type:"image/png"});try{if(navigator.canShare&&navigator.canShare({files:[a]})){await navigator.share({files:[a],title:"Распевка",text:t.sub||"Мой прогресс в Распевке"});return}}catch{}const s=URL.createObjectURL(n),o=document.createElement("a");o.href=s,o.download="raspevka.png",document.body.appendChild(o),o.click(),o.remove(),setTimeout(()=>URL.revokeObjectURL(s),4e3)}function Va(t){return t.toISOString().slice(0,10)}function Oa(t){if(!t||t.length<2)return"";const e=t.length,n=t.map(u=>u.low),a=t.map(u=>u.high),s=Math.min(...n)-1,o=Math.max(...a)+1,i=Math.max(1,o-s),c=300,l=70,r=5,d=u=>(r+u*(c-2*r)/(e-1)).toFixed(1),h=u=>(r+(1-(u-s)/i)*(l-2*r)).toFixed(1),f=u=>u.map((m,v)=>`${v?"L":"M"}${d(v)} ${h(m)}`).join(" ");return`
    <div class="seg-label" style="margin-top:14px">Рост диапазона</div>
    <svg class="range-tl" viewBox="0 0 ${c} ${l}" preserveAspectRatio="none" role="img" aria-label="График роста диапазона">
      <path d="${f(a)}" class="tl-high"/>
      <path d="${f(n)}" class="tl-low"/>
      <circle cx="${d(e-1)}" cy="${h(a[e-1])}" r="3.5" class="tl-dot-h"/>
      <circle cx="${d(e-1)}" cy="${h(n[e-1])}" r="3.5" class="tl-dot-l"/>
    </svg>`}function Na(t,{onExit:e}){const n=Ks(),a=Js(),s=ce(),o=Xs(),i=hs(),c=et(),l=c&&dt(c.key),r=new Set(n.map(b=>b.date)),d=[];for(let b=13;b>=0;b--){const g=new Date(Date.now()-b*864e5);d.push(`<span class="cal-dot ${r.has(Va(g))?"done":""}"></span>`)}const h=n.slice(-12),f=h.length?h.map(b=>{const g=Math.round((b.pct||0)*100);return`<div class="acc-bar ${b.stars>=3?"g":b.stars===2?"a":"c"}" style="height:${Math.max(6,g)}%" title="${g}%"></div>`}).join(""):'<p class="hint">Пройди распевку — здесь появится история точности.</p>';let u="";const m=a.length?a[a.length-1]:c&&c.low!=null?c:null;if(m&&m.low!=null){const b=m.high-m.low;let g="";if(a.length>=2){const E=a[0],w=m.high-m.low-(E.high-E.low);w>0&&(g=` · <span style="color:var(--green)">+${w} пт с начала</span>`)}u=`
      <div class="card" style="text-align:left;width:100%">
        <div class="seg-label">Диапазон голоса</div>
        <p class="how" style="margin-top:6px"><b>${it(m.low)} – ${it(m.high)}</b> · ${b} полутонов${g}</p>
        ${ps(m.low,m.high)}
        ${Oa(a)}
        ${l?`<p class="how">Тип: ${l.name}</p>`:""}
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
        <div class="cal-row">${d.join("")}</div>
      </div>

      <div class="card" style="width:100%">
        <div class="seg-label">Точность последних занятий</div>
        <div class="acc-chart">${f}</div>
      </div>

      ${u}

      <button class="btn btn-primary" id="share" style="width:100%">Поделиться прогрессом</button>
      <button class="btn btn-ghost" id="back2" style="width:100%">В меню</button>
    </div>
  `,document.getElementById("back").addEventListener("click",e),document.getElementById("back2").addEventListener("click",e);const v=document.getElementById("share");v&&v.addEventListener("click",()=>{if(m&&m.low!=null){const b=m.high-m.low;hn({headline:"Мой диапазон",big:`${it(m.low)}–${it(m.high)}`,sub:`${b} полутонов${s>0?` · стрик ${s}`:""}`})}else hn({headline:"Мой прогресс",big:`${s}`,sub:"дней подряд в Распевке"})})}const _a=[0,2,4,5,7,9,11],fn=t=>_a.includes((t%12+12)%12);function vn(t){const e=rt(j(t));return e?e.name:""}function ja(t,e,n,{onExit:a,lowMidi:s=41,highMidi:o=81}){let i=null;const c=s-2,l=o+2,r=j(c),d=j(l);t.innerHTML=`
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
  `,document.getElementById("back").addEventListener("click",()=>{B(),a()});function h(){const C=qe();document.getElementById("sens").innerHTML=[["low","Низкая"],["med","Средняя"],["high","Высокая"]].map(([y,H])=>`<button data-sens="${y}" class="${C===y?"on":""}">${H}</button>`).join(""),document.querySelectorAll("[data-sens]").forEach(y=>y.addEventListener("click",()=>{ms(y.dataset.sens),e.setSensitivity&&e.setSensitivity(De()),h()}))}h();const f=document.getElementById("note"),u=document.getElementById("cents"),m=document.getElementById("lvl"),v=document.getElementById("fs"),b=v.getContext("2d");function g(){const C=Math.min(window.devicePixelRatio||1,2);v.width=v.clientWidth*C,v.height=v.clientHeight*C,b.setTransform(C,0,0,C,0,0)}g(),window.addEventListener("resize",g);function E(C,y){const H=Math.max(r,Math.min(d,C)),A=Math.log2(H/r)/Math.log2(d/r);return y-A*y}const w=[];n.setRange&&n.setRange(55,1300),n.reset();const R=document.getElementById("cele");let M=null,p=0,S=0,L=null;function k(C){R&&(R.innerHTML=`<svg viewBox="0 0 24 24" fill="currentColor" width="18" height="18"><path d="M12 2l2.4 6.3L21 9l-5 4.1L17.8 20 12 16.3 6.2 20 8 13.1 3 9l6.6-.7z"/></svg> ${C}`,R.hidden=!1,clearTimeout(L),L=setTimeout(()=>{R&&(R.hidden=!0)},3400))}function T(){const C=v.clientWidth,y=v.clientHeight;b.clearRect(0,0,C,y),b.font="10px Inter, sans-serif";for(let F=Math.ceil(c);F<=l;F++){const Z=E(j(F),y),st=(F%12+12)%12===0;b.strokeStyle=st?"rgba(27,36,48,.20)":fn(F)?"rgba(27,36,48,.08)":"rgba(27,36,48,.03)",b.lineWidth=1,b.beginPath(),b.moveTo(34,Z),b.lineTo(C,Z),b.stroke(),fn(F)&&(b.fillStyle=st?"rgba(27,36,48,.55)":"rgba(27,36,48,.32)",b.fillText(vn(F),4,Z+3))}const H=e.read();let A=!1,D=null;if(H){const F=n.process(H);A=F.voiced&&e.rms()>.0025,D=F.smoothedHz}if(A&&D){const F=rt(D),Z=(F.name||"").match(/^([A-G]#?)(-?\d+)$/);f.innerHTML=Z?`${Z[1]}<span class="oct">${Z[2]}</span>`:F.name,f.classList.remove("silent"),u.textContent=`центы: ${F.cents>0?"+":""}${F.cents}`,m.style.width=Math.min(100,e.rms()*350)+"%";const st=E(D,y);w.push(st);const bt=Math.round(69+12*Math.log2(D/440));Math.abs(F.cents)<42?(bt===M?p++:(M=bt,p=1),p===26&&Date.now()-S>4e3&&na(bt).extended&&(S=Date.now(),k(`Новая нота — ${vn(bt)}! Диапазон растёт.`))):(M=null,p=0)}else f.textContent="—",f.classList.add("silent"),u.textContent="центы: —",m.style.width="0%",w.push(null),M=null,p=0;for(;w.length>90;)w.shift();const U=C-28;for(let F=0;F<w.length;F++){if(w[F]==null)continue;const Z=U-(w.length-1-F)*2.4,st=F===w.length-1;b.fillStyle=st?"#2fab84":"rgba(47,171,132,.35)",st&&(b.shadowColor="#2fab84",b.shadowBlur=16),b.beginPath(),b.arc(Z,w[F],st?8:2.5,0,Math.PI*2),b.fill(),b.shadowBlur=0}i=requestAnimationFrame(T)}T();function B(){i&&cancelAnimationFrame(i),i=null,window.removeEventListener("resize",g),clearTimeout(L)}}const Ga=""+new URL("belly-breathing-B0wu-xNS.webp",import.meta.url).href;function Wa(){return`
    <div class="breathe-diagram">
      <img class="belly-img" src="${Ga}" alt="Дыхание животом: слева спокойный живот (выдох), справа надутый живот (вдох)" />
      <div class="belly-caps"><span>Выдох · живот мягкий</span><span>Вдох · живот надут</span></div>
      <p class="diagram-note">Не стесняйся: на вдохе <b>живот округляется вперёд</b> (как справа на картинке), воздух идёт вниз. Плечи и грудь почти неподвижны — не тянись вверх.</p>
    </div>`}const ws={box:{title:"Дыхание по квадрату",kind:"paced",belly:!0,blurb:"Успокаивает и выравнивает дыхание перед пением. Вдох, задержка, выдох и пауза — все по 4 секунды. Дыши животом, плечи расслаблены.",cycles:4,phases:[{label:"Вдох",sec:4,from:.5,to:1},{label:"Задержка",sec:4,from:1,to:1},{label:"Выдох",sec:4,from:1,to:.5},{label:"Пауза",sec:4,from:.5,to:.5}]},belly:{title:"Дыхание животом",kind:"paced",belly:!0,blurb:"База певческого дыхания: вдох на 4 счёта — живот расширяется, выдох длиннее, на 6 счётов — ровно и плавно. Грудь и плечи неподвижны.",cycles:5,phases:[{label:"Вдох (живот)",sec:4,from:.5,to:1},{label:"Выдох ровно",sec:6,from:1,to:.5}]},hiss:{title:"Долгий выдох «с-с-с»",kind:"exhale",blurb:"Тренирует опору и ровный воздушный поток. Глубоко вдохни животом, затем выдыхай на звук «с-с-с» как можно дольше и РОВНО — без толчков. Я замерю время.",goals:[{sec:8,label:"хорошо"},{sec:15,label:"отлично"},{sec:20,label:"превосходно"}]}};function Es(t,e,n,{onExit:a}){const s=ws[n];let o=null;function i(){t.innerHTML=`
      <div class="screen breathe-intro">
        <div class="game-top"><button class="icon-btn" id="back">‹ Меню</button></div>
        <div class="brand"><h1>${s.title}</h1></div>
        <div class="card"><p class="blurb">${s.blurb}</p>${s.belly?Wa():""}</div>
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
    `,document.getElementById("quit").addEventListener("click",()=>{d(),a()});const h=document.getElementById("core"),f=document.getElementById("phase"),u=document.getElementById("count"),m=document.getElementById("cycles");s.cycles*s.phases.length;let v=0,b=0,g=performance.now();E();function E(){m.innerHTML=Array.from({length:s.cycles},(M,p)=>`<span class="dot ${p<v?"done":p===v?"now":""}"></span>`).join("")}function w(){const M=s.phases[b],p=(performance.now()-g)/1e3,S=Math.min(1,p/M.sec),L=M.from+(M.to-M.from)*Ua(S);if(h.style.transform=`scale(${L})`,f.textContent=M.label,u.textContent=Math.ceil(M.sec-p),p>=M.sec){if(b+=1,b>=s.phases.length&&(b=0,v+=1,E()),v>=s.cycles)return R();g=performance.now()}o=requestAnimationFrame(w)}o=requestAnimationFrame(w);function R(){d(),t.innerHTML=`
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
    `,document.getElementById("quit").addEventListener("click",()=>{d(),a()});const h=document.getElementById("timer"),f=document.getElementById("phase"),u=document.getElementById("vol"),m=.012,v=.6;let b="ready",g=0,E=0;function w(){e.read();const M=e.rms();u.style.width=Math.min(100,M*400)+"%";const p=performance.now();if(b==="ready")M>m&&(b="running",g=p,E=p,f.textContent="Тяни ровно!");else if(b==="running"&&(M>m&&(E=p),h.textContent=((p-g)/1e3).toFixed(1),p-E>v*1e3))return R((E-g)/1e3);o=requestAnimationFrame(w)}o=requestAnimationFrame(w);function R(M){d(),M=Math.max(0,Math.round(M*10)/10);const p=ma(M),S=[...s.goals].reverse().find(k=>M>=k.sec),L=S?S.label[0].toUpperCase()+S.label.slice(1)+"!":"Попробуй ещё";t.innerHTML=`
        <div class="screen summary">
          <div class="big-pct">${M.toFixed(1)}<span>сек</span></div>
          <div class="verdict">${L}</div>
          <p class="hint">ровный выдох на «с-с-с» · твой рекорд: <b>${p.toFixed(1)} сек</b></p>
          <div class="row"><button class="btn btn-ghost" id="menu">Меню</button>
          <button class="btn btn-primary" id="again">Ещё раз</button></div>
        </div>`,document.getElementById("menu").addEventListener("click",a),document.getElementById("again").addEventListener("click",l)}}function r(){const h=hs();return h?`<p class="hint">Твой рекорд: <b>${h.toFixed(1)} сек</b></p>`:'<p class="hint">Замерим твой ровный выдох.</p>'}function d(){o&&cancelAnimationFrame(o),o=null}i()}function Ua(t){return t<.5?2*t*t:1-Math.pow(-2*t+2,2)/2}const Ct=[{t:"Опора дыхания",b:"Вдох — живот мягко наполняется (плечи не поднимаются). На выдохе живот плавно поджимается и «держит» звук ровным. Это фундамент: без опоры голос дрожит и быстро устаёт."},{t:"Звук «в маску»",b:"Направляй звук в область носа и скул — голос начинает звенеть, а не «застревать» в горле. Поймать ощущение помогает мычание «м-м-м»."},{t:"Зевок в горле",b:"Лёгкое ощущение начала зевка освобождает гортань и расширяет пространство во рту. Звук становится объёмнее и свободнее, уходит зажим."},{t:"Не дави на верх",b:"Высокие ноты берутся не силой, а лёгкостью и опорой. Давишь — связки зажимаются и можно сорвать голос. Расширение диапазона — это недели, не один день."},{t:"Мягкая атака",b:"Начинай ноту мягко, без толчка горлом. Представь, что звук «вытекает», а не «выстреливает». Это бережёт связки и звучит красивее."},{t:"Округляй гласные",b:"Пой гласные округло, будто внутри звучит «о». Это выравнивает тембр по всему диапазону и убирает резкость и «плоскость»."},{t:"Губной тренаж «бррр»",b:"Вибрация губами снимает зажим и выравнивает поток воздуха. Лучшая разминка перед пением — и проверка, что дыхание ровное."},{t:"Береги голос",b:"Связки любят воду и отдых. Не пой на больном горле, делай паузы, не больше 20–30 минут подряд. Боль — всегда сигнал «стоп»."}];function Ya(t,{onExit:e}){let n=0;function a(){const s=Ct[n],o=Ct.map((i,c)=>`<span class="dot ${c===n?"now":c<n?"done":""}"></span>`).join("");t.innerHTML=`
      <div class="screen">
        <div class="game-top"><button class="icon-btn" id="back">‹ Меню</button></div>
        <div class="brand"><h1>Теория голоса</h1><p>Короткие уроки — по одному в день достаточно.</p></div>
        <div class="card theory-card">
          <div class="th-num">${n+1} / ${Ct.length}</div>
          <h3 class="th-title">${s.t}</h3>
          <p class="th-body">${s.b}</p>
        </div>
        <div class="progress-dots">${o}</div>
        <div class="row">
          <button class="btn btn-ghost" id="prev" ${n===0?"disabled":""}>Назад</button>
          <button class="btn btn-primary" id="next">${n===Ct.length-1?"Готово":"Далее"}</button>
        </div>
      </div>`,document.getElementById("back").addEventListener("click",e),document.getElementById("prev").addEventListener("click",()=>{n>0&&(n--,a())}),document.getElementById("next").addEventListener("click",()=>{n<Ct.length-1?(n++,a()):e()})}a()}const Ka=[0,2,4,5,7,9,12],Ja=t=>t[Math.floor(Math.random()*t.length)];function Xa(t){const e=rt(j(t));return e?e.name:""}function ks(t,e,n,{onExit:a,root:s=60}){let i=0,c=0,l=null,r="idle",d=s,h=0,f=null;const u=wt?wt():"piano";t.innerHTML=`
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
    </div>`;const m=document.getElementById("status"),v=document.getElementById("bigq"),b=document.getElementById("cue"),g=document.getElementById("lvl"),E=document.getElementById("score");document.getElementById("back").addEventListener("click",()=>{T(),a()}),document.getElementById("replay").addEventListener("click",w),document.getElementById("skip").addEventListener("click",()=>{M("Пропущено"),S(1300)}),n.setRange&&n.setRange(55,1300),n.reset();function w(){e.ctx&&ht(e.ctx,j(d),1.3,0,.3,u),b.textContent="Слушай…",r="wait",clearTimeout(f),f=setTimeout(()=>{r="sing",b.textContent="Теперь спой эту ноту"},1350)}function R(){i++,d=s+Ja(Ka),h=0,v.textContent="?",v.classList.add("silent"),m.textContent=`Раунд ${i} / 8`,w()}function M(B){v.textContent=Xa(d),v.classList.remove("silent"),B&&(b.textContent=B),r="done"}function p(){c++,E.textContent=`Верно: ${c} / 8`,M("Верно! Бра-во."),v.classList.add("hit"),S(1300)}function S(B){clearTimeout(f),f=setTimeout(()=>{v.classList.remove("hit"),i>=8?L():R()},B)}function L(){T(),t.innerHTML=`
      <div class="screen summary">
        <div class="brand"><h1>Слух</h1></div>
        <div class="big-pct">${c}<span>/8</span></div>
        <p class="verdict">${c>=7?"Отличный слух!":c>=4?"Хорошо, продолжай!":"Слух тренируется — ещё раз!"}</p>
        <div class="row" style="max-width:360px">
          <button class="btn btn-ghost" id="again">Ещё раз</button>
          <button class="btn btn-primary" id="menu">В меню</button>
        </div>
      </div>`,document.getElementById("again").addEventListener("click",()=>ks(t,e,n,{onExit:a,root:s})),document.getElementById("menu").addEventListener("click",a)}function k(){const B=e.read();let C=!1,y=null;if(B){const H=n.process(B);C=H.voiced&&e.rms()>.0025,y=H.smoothedHz}if(g.style.width=(C?Math.min(100,e.rms()*350):0)+"%",r==="sing"&&C&&y){const H=Math.abs(Dt(y,j(d)));H<45?h++:h=Math.max(0,h-2),b.textContent=H<45?"Держи…":y<j(d)?"↑ выше":"↓ ниже",h>=22&&p()}l=requestAnimationFrame(k)}function T(){l&&cancelAnimationFrame(l),l=null,clearTimeout(f)}R(),k()}function $t(t,e,n,a){return{id:t,name:e,tempo:n,syllable:"Ля",make(s){return{id:t,name:e,syllable:"Ля",tempo:n,kind:"song",root:s,desc:"Простая мелодия — веди голос по нотам и попадай в каждую.",how:"Пой на «ля», спокойно следуя за нотами. Это не упражнение, а маленькая песня.",notes:a.map(([o,i])=>({midi:s+o,beats:i}))}}}}const $s=[$t("s1","Лесенка",96,[[0,1],[2,1],[4,1],[5,1],[7,2],[5,1],[4,1],[2,1],[0,2]]),$t("s2","Колыбельная",76,[[7,1],[5,1],[4,2],[5,1],[4,1],[2,2],[0,1],[2,1],[4,1],[2,1],[0,3]]),$t("s3","Прогулка",104,[[0,1],[0,1],[4,1],[4,1],[7,1],[5,1],[4,2],[2,1],[2,1],[5,1],[4,1],[2,1],[0,2]]),$t("s4","Ручеёк",112,[[0,.5],[2,.5],[4,.5],[5,.5],[7,1],[9,1],[7,1],[5,1],[4,.5],[2,.5],[0,2]]),$t("s5","Колокол",88,[[4,1],[7,1],[9,2],[7,1],[4,1],[5,2],[2,1],[4,1],[0,3]]),$t("s6","Закат",80,[[12,2],[9,1],[7,1],[5,2],[4,1],[2,1],[0,3]])],Qa=t=>t.make(60).notes.map(e=>e.midi);function Za(){return'<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2"><rect x="5" y="11" width="14" height="9" rx="2"/><path d="M8 11V8a4 4 0 0 1 8 0v3"/></svg>'}const bn={free:"Free",standard:"Standard",pro:"Pro"};function ti(t,{onExit:e}){function n(){const a=Mt(),s=W(),o=["free","standard","pro"].map(c=>`<button data-tier="${c}" class="${a===c?"on":""}">${bn[c]}</button>`).join(""),i=Jt.map(c=>{const l=Tn(c.key,a),r=c.key===s;return`
        <button class="mode-item ${l?"":"locked"} ${r?"sel":""}" data-mode="${c.key}" ${l?"":"disabled"}>
          <span class="mode-name">${c.name}${r?" · выбран":""}</span>
          ${l?"":`<span class="mode-lock">${Za()} ${bn[c.tier]}</span>`}
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
      </div>`,document.getElementById("back").addEventListener("click",e),document.querySelectorAll("[data-tier]").forEach(c=>c.addEventListener("click",()=>{jt(c.dataset.tier),n()})),document.querySelectorAll("[data-mode]:not([disabled])").forEach(c=>c.addEventListener("click",()=>{ss(c.dataset.mode),n()}))}n()}const xe={hum3:Le,trill:Te,sustain:Dn,scale5:Kn,agility:Jn,jump:Xn,vowels:Hn,jump5:Rn,lad:qn,vibrato:Pn,vhold:Sn,vscale:In,vagil:Bn,vclimb:Cn,jcharles:An,vwobble:Fn,timbre:zn,timbre2:Vn,regarp:On,regoct:Nn,belt:_n,beltoct:jn,artic:Gn,artic2:Wn,resist:Un,resist2:Yn},V=(t,e)=>({t:"ex",id:t,name:e}),pn=(t,e)=>({t:"breath",id:t,name:e}),nt=[{id:"b1",title:"Базовый импульс",sub:"Дыхание, опора, мягкая активация",items:[pn("belly","Дыхание животом"),pn("hiss","Долгий выдох «с-с-с»"),V("hum3","Мычание по гамме"),V("trill","Губной тренаж «brrr»")],exam:{exId:"hum3",pass:.55}},{id:"b2",title:"Ясность гласных",sub:"Выравнивание гласных и точность",items:[V("vhold","Calm Down Vowels"),V("vscale","Disco Vowels"),V("jcharles","James Charles Warm Up"),V("vclimb","High Five"),V("vagil","No Bubble Gum")],exam:{exId:"vscale",pass:.6}},{id:"b3",title:"Интонация и гибкость",sub:"Гаммы, беглость, скачки",items:[V("scale5","Гамма «Ма-Мэ»"),V("agility","Беглость «Ма»"),V("jump","Октавный скачок")],exam:{exId:"agility",pass:.55}},{id:"b4",title:"Лад и музыкальное мышление",sub:"Лады, атака интервалов",items:[V("lad","Ладовая «ЯМ»"),V("jump5","Скачок к V ступени")],exam:{exId:"lad",pass:.55}},{id:"b5",title:"Вибрато",sub:"Ровный звук и мягкое колебание",items:[V("sustain","Удержание ноты"),V("vwobble","Раскачка вибрато"),V("vibrato","Вибрато")],exam:{exId:"vibrato",pass:.5}},{id:"b6",title:"Тембр и тон",sub:"Округлый, ровный звук",items:[V("timbre","Тёплый тон"),V("timbre2","Ровный тон на двух")],exam:{exId:"timbre",pass:.55}},{id:"b7",title:"Регистры и переходы",sub:"Грудной/головной, passaggio",items:[V("regarp","Через регистры"),V("regoct","Октавная связка")],exam:{exId:"regarp",pass:.5}},{id:"b8",title:"Белтинг",sub:"Яркая опёртая подача верха",items:[V("belt","Белтинг — гамма"),V("beltoct","Белт — октава")],exam:{exId:"belt",pass:.55}},{id:"b9",title:"Артикуляция",sub:"Чёткая дикция и атака",items:[V("artic","Чёткое стаккато"),V("artic2","Слоги по группам")],exam:{exId:"artic",pass:.6}},{id:"b10",title:"Сопротивление",sub:"Выносливость и опора",items:[V("resist","Стамина-фигура"),V("resist2","Выносливая гамма")],exam:{exId:"resist2",pass:.5}}];function ei(t,e){return t<=0?!0:e.includes(nt[t-1].id)}function xs(){return`<div class="teacher-cta">
    <span>Педагог разберёт нюансы быстрее и покажет на твоём голосе.</span>
    <button class="btn btn-ghost" id="toSchool">Записаться на урок</button>
  </div>`}function ni(t,{blocks:e,examsPassed:n,onExit:a,onOpenBlock:s,onSchool:o}){const i=e.filter(r=>n.includes(r.id)).length,c=e.map((r,d)=>{const h=n.includes(r.id),f=ei(d,n),u=h?"done":f?"open":"locked",m=h?"✓":f?`${d+1}`:"🔒";return`<button class="block-card ${u}" data-block="${d}" ${f?"":"disabled"}>
        <span class="bc-badge">${m}</span>
        <span class="bc-main"><b>${r.title}</b><span class="bc-sub">${r.sub}</span></span>
        <span class="bc-arrow">${f?"›":""}</span>
      </button>`}).join("");t.innerHTML=`
    <div class="screen catalog">
      <div class="game-top"><button class="icon-btn" id="back">‹ Меню</button></div>
      <div class="brand"><h1>Программа обучения</h1><p>Блоки открываются по мере прохождения. Каждый блок завершается экзаменом.</p></div>
      <div class="prog-wrap"><div class="prog-bar"><i style="width:${Math.round(i/e.length*100)}%"></i></div><span class="prog-txt">${i} / ${e.length} блоков пройдено</span></div>
      <div class="block-list">${c}</div>
      ${xs()}
      <p class="hint">Это самостоятельная практика. Полноценный разбор и постановку голоса даёт педагог.</p>
    </div>
  `,document.getElementById("back").addEventListener("click",a),t.querySelectorAll("[data-block]").forEach(r=>r.addEventListener("click",()=>s(Number(r.dataset.block))));const l=document.getElementById("toSchool");l&&o&&l.addEventListener("click",o)}function si(t,{block:e,index:n,examsPassed:a,doneItems:s,onExit:o,onRunItem:i,onExam:c,onSchool:l}){const r=a.includes(e.id),d=e.items.map((u,m)=>{const v=s.includes(u.id),b=u.t==="breath"?'<span class="bi-tag">дыхание</span>':"";return`<button class="block-item" data-item="${m}">
        <span class="bi-check ${v?"on":""}">${v?"✓":m+1}</span>
        <span class="bi-name">${u.name}${b}</span>
        <span class="bc-arrow">›</span>
      </button>`}).join(""),h=e.items.every(u=>s.includes(u.id));t.innerHTML=`
    <div class="screen catalog">
      <div class="game-top"><button class="icon-btn" id="back">‹ Программа</button></div>
      <div class="brand"><h1>${e.title}</h1><p>${e.sub}</p></div>
      <div class="block-list">${d}</div>
      <button class="btn ${h?"btn-primary":"btn-ghost"}" id="exam" style="width:100%;margin-top:6px">
        ${r?"✓ Экзамен сдан · пересдать":"Экзамен блока"}
      </button>
      <p class="hint">${h?"Все упражнения пройдены — можно сдавать экзамен.":"Пройди упражнения, потом сдай экзамен. Можно и сразу — как удобнее."}</p>
      ${xs()}
    </div>
  `,document.getElementById("back").addEventListener("click",o),t.querySelectorAll("[data-item]").forEach(u=>u.addEventListener("click",()=>i(e,Number(u.dataset.item)))),document.getElementById("exam").addEventListener("click",()=>c(e));const f=document.getElementById("toSchool");f&&l&&f.addEventListener("click",l)}function ai(){const t=["audio/webm;codecs=opus","audio/webm","audio/mp4","audio/ogg"];for(const e of t)try{if(window.MediaRecorder&&MediaRecorder.isTypeSupported(e))return e}catch{}return""}function ii(t,e,{onExit:n}){let a=null,s=[],o=null,i=null,c=0,l=!1;function r(m){const v=Math.floor(m/1e3);return`${Math.floor(v/60)}:${String(v%60).padStart(2,"0")}`}function d(){t.innerHTML=`
      <div class="screen recorder">
        <div class="game-top"><button class="icon-btn" id="back">‹ Меню</button></div>
        <div class="brand"><h1>Запись голоса</h1><p>Запиши себя и послушай со стороны — так слышно прогресс и ошибки, которые в моменте не замечаешь.</p></div>
        <div class="rec-timer ${l?"live":""}" id="timer">${r(0)}</div>
        <button class="btn ${l?"btn-danger":"btn-primary"} rec-btn" id="rec">${l?"■ Остановить":"● Записать"}</button>
        <audio id="player" controls ${o?"":"hidden"} style="width:100%;margin-top:16px"></audio>
        <p class="hint" style="margin-top:14px">Запись хранится только в этой сессии и никуда не отправляется. ${window.MediaRecorder?"":"<br>⚠️ Браузер не поддерживает запись."}</p>
      </div>
    `,document.getElementById("back").addEventListener("click",()=>{u(),n()});const m=document.getElementById("rec");if(!window.MediaRecorder){m.disabled=!0;return}m.addEventListener("click",l?f:h);const v=document.getElementById("player");o&&v&&(v.src=o)}function h(){if(!e.stream)return;if(s=[],o){try{URL.revokeObjectURL(o)}catch{}o=null}try{const v=ai();a=v?new MediaRecorder(e.stream,{mimeType:v}):new MediaRecorder(e.stream)}catch{return}a.ondataavailable=v=>{v.data&&v.data.size&&s.push(v.data)},a.onstop=()=>{const v=new Blob(s,{type:a.mimeType||"audio/webm"});o=URL.createObjectURL(v),l=!1,d()},a.start(),l=!0,c=typeof performance<"u"?performance.now():Date.now(),d();const m=()=>document.getElementById("timer");i=setInterval(()=>{const v=m();v&&(v.textContent=r((typeof performance<"u"?performance.now():Date.now())-c))},250)}function f(){clearInterval(i),i=null;try{a&&a.state!=="inactive"&&a.stop()}catch{l=!1,d()}}function u(){clearInterval(i),i=null;try{a&&a.state!=="inactive"&&a.stop()}catch{}if(o)try{URL.revokeObjectURL(o)}catch{}}d()}const oi="./backing/raspevka-rise.mp3",ci=[0,2,4,5,7,9,11],gn=t=>ci.includes((t%12+12)%12);function li(t){const e=rt(j(t));return e?e.name:""}function yn(t){return t=Math.max(0,Math.floor(t||0)),`${Math.floor(t/60)}:${String(t%60).padStart(2,"0")}`}function ri(t,e,n,{onExit:a,lowMidi:s=40,highMidi:o=76}){let i=null;const c=s-2,l=o+2,r=j(c),d=j(l),h=new Audio(oi);h.preload="auto",t.innerHTML=`
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
  `;const f=document.getElementById("back"),u=document.getElementById("play"),m=document.getElementById("cur"),v=document.getElementById("dur"),b=document.getElementById("seek"),g=document.getElementById("note"),E=document.getElementById("fs"),w=E.getContext("2d");function R(){const k=Math.min(window.devicePixelRatio||1,2);E.width=E.clientWidth*k,E.height=E.clientHeight*k,w.setTransform(k,0,0,k,0,0)}R(),window.addEventListener("resize",R),h.addEventListener("loadedmetadata",()=>{v.textContent=yn(h.duration)}),h.addEventListener("ended",()=>{u.textContent="▶ Слушать"}),u.addEventListener("click",()=>{h.paused?(h.play().catch(()=>{}),u.textContent="⏸ Пауза"):(h.pause(),u.textContent="▶ Слушать")}),f.addEventListener("click",()=>{L(),a()});function M(k,T){const B=Math.max(r,Math.min(d,k)),C=Math.log2(B/r)/Math.log2(d/r);return T-C*T}const p=[];n.setRange&&n.setRange(55,1300),n.reset();function S(){const k=E.clientWidth,T=E.clientHeight;w.clearRect(0,0,k,T),w.font="10px Inter, sans-serif";for(let A=Math.ceil(c);A<=l;A++){const D=M(j(A),T),U=(A%12+12)%12===0;w.strokeStyle=U?"rgba(27,36,48,.20)":gn(A)?"rgba(27,36,48,.08)":"rgba(27,36,48,.03)",w.lineWidth=1,w.beginPath(),w.moveTo(34,D),w.lineTo(k,D),w.stroke(),gn(A)&&(w.fillStyle=U?"rgba(27,36,48,.55)":"rgba(27,36,48,.32)",w.fillText(li(A),4,D+3))}h.duration&&(b.style.width=Math.min(100,h.currentTime/h.duration*100)+"%",m.textContent=yn(h.currentTime));const B=e.read();let C=!1,y=null;if(B){const A=n.process(B);C=A.voiced&&e.rms()>.0025,y=A.smoothedHz}if(C&&y){const A=rt(y),D=(A.name||"").match(/^([A-G]#?)(-?\d+)$/);g.innerHTML=D?`${D[1]}<span class="oct">${D[2]}</span>`:A.name,g.classList.remove("silent"),p.push(M(y,T))}else g.textContent="—",g.classList.add("silent"),p.push(null);for(;p.length>90;)p.shift();const H=k-28;for(let A=0;A<p.length;A++){if(p[A]==null)continue;const D=H-(p.length-1-A)*2.4,U=A===p.length-1;w.fillStyle=U?"#2fab84":"rgba(47,171,132,.35)",U&&(w.shadowColor="#2fab84",w.shadowBlur=16),w.beginPath(),w.arc(D,p[A],U?8:2.5,0,Math.PI*2),w.fill(),w.shadowBlur=0}i=requestAnimationFrame(S)}S();function L(){i&&cancelAnimationFrame(i),i=null,window.removeEventListener("resize",R);try{h.pause(),h.src=""}catch{}}}async function di(t){return!1}function ui(t,{onExit:e}){const n=et(),a=n&&dt(n.key),s=Ws(),o={voiceType:a?a.name:null,range:s&&Number.isFinite(s.low)?`${it(s.low)}–${it(s.high)}`:null,streak:ce(),blocks:zt().length},i=[o.voiceType,o.range?`диапазон ${o.range}`:null,o.streak?`стрик ${o.streak}`:null,o.blocks?`блоков ${o.blocks}`:null].filter(Boolean).join(" · ")||"пока без данных";let c="any";function l(){t.innerHTML=`
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
    `,document.getElementById("back").addEventListener("click",e),t.querySelectorAll("#lf-pref [data-pref]").forEach(d=>d.addEventListener("click",()=>{c=d.dataset.pref,t.querySelectorAll("#lf-pref [data-pref]").forEach(h=>h.classList.toggle("on",h.dataset.pref===c))})),document.getElementById("lf-send").addEventListener("click",async()=>{const d=document.getElementById("lf-name").value.trim(),h=document.getElementById("lf-contact").value.trim(),f=document.getElementById("lf-goal").value.trim();if(!d||!h){document.getElementById("lf-err").textContent="Заполни имя и контакт — иначе педагог не сможет ответить.";return}const u=document.getElementById("lf-send");u.disabled=!0,u.textContent="Отправляю…",Qs({name:d,contact:h,pref:c,goal:f,stats:o}),await di(),r(d)})}function r(d){Vt(1),t.innerHTML=`
      <div class="screen summary leadform-done">
        <div class="lf-check"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M5 13l4 4L19 7"/></svg></div>
        <div class="verdict">Заявка принята!</div>
        <p class="hint">Спасибо, ${d}! Педагог свяжется по твоему контакту и подберёт время бесплатного урока. Пока — продолжай практиковаться.</p>
        <button class="btn btn-primary" id="lf-ok" style="width:100%;max-width:360px">Вернуться</button>
      </div>
    `,document.getElementById("lf-ok").addEventListener("click",e)}l()}function mi(t,e,{onExit:n,onVoice:a,onCalibrate:s}){let o=!1;function i(r,d,h){return`<div class="seg">${r.map(([f,u])=>`<button data-${h}="${f}" class="${d===f?"on":""}">${u}</button>`).join("")}</div>`}function c(){const r=xa();if(!r.sessions)return"";const d=r.perEx.slice(0,6).map(h=>`<div class="an-row"><span>${h.id}</span><span>${h.runs}× · ${h.avgPct}%</span></div>`).join("");return`
      <div class="card">
        <div class="seg-label">Аналитика (локально) <span class="set-hint">${r.sessions} прохождений</span></div>
        <div class="an-list">${d}</div>
      </div>`}function l(){const r=et(),d=r&&dt(r.key);t.innerHTML=`
      <div class="screen settings-screen">
        <div class="game-top"><button class="icon-btn" id="back">‹ Меню</button></div>
        <div class="brand"><h1>Настройки</h1><p>Звук, голос и поведение распевок — в одном месте.</p></div>

        <div class="card settings">
          <div class="set-row"><div class="seg-label">Мой голос</div>
            <button class="toggle" id="voice">${d?d.name:"Определить тип голоса"} ›</button></div>

          <div class="seg-label">Громкость подсказки <span class="set-hint">на телефоне ставь «Громко/Макс»</span></div>
          ${i([["quiet","Тихо"],["normal","Норм"],["loud","Громко"],["max","Макс"]],le(),"vol")}

          <div class="seg-label">Вывод звука <span class="set-hint">влияет на компенсацию задержки</span></div>
          ${i([["speaker","Динамик"],["wired","Провод"],["bt","Bluetooth"]],de(),"route")}
          ${s?`<div class="set-row" style="margin-top:8px"><div class="seg-label" style="margin:0">Точная калибровка</div><button class="toggle" id="calib">${Math.round(Re()*1e3)} мс · настроить ›</button></div>`:""}

          <div class="seg-label">Чувствительность микрофона</div>
          ${i([["low","Низкая"],["med","Средняя"],["high","Высокая"]],qe(),"sens")}

          <div class="seg-label">Темп распевок</div>
          ${i([["easy","Медл."],["medium","Средне"],["fast","Быстро"]],Ce(),"diff")}

          <div class="seg-label">Звук подсказки</div>
          ${i([["piano","Пиано"],["guitar","Гитара"],["soft","Мягкий"]],wt(),"timbre")}

          <div class="seg-label">Грув (ритм-подложка) <span class="set-hint">Авто — своя под каждую распевку</span></div>
          ${i([["off","Выкл"],["auto","Авто"],["pop","Поп"],["funk","Фанк"],["soft","Мягкий"]],Be(),"groove")}

          <div class="toggle-row" style="margin-top:10px">
            <button class="toggle ${Tt()?"on":""}" id="guide">Подсказка тоном: ${Tt()?"вкл":"выкл"}</button>
            <button class="toggle ${yt()?"on":""}" id="hp">Наушники: ${yt()?"да":"нет"}</button>
          </div>
          <button class="toggle ${Ht()?"on":""}" id="darkstage" style="width:100%;margin-top:8px">Тёмный экран пения: ${Ht()?"вкл":"выкл"} <span class="set-hint">светящийся след голоса</span></button>
          <button class="toggle ${At()?"on":""}" id="agc" style="width:100%;margin-top:8px">Авто-громкость микро (AGC): ${At()?"вкл":"выкл"} <span class="set-hint">${At()?"громче на телефоне":"ровнее долгие ноты"}</span></button>
        </div>

        ${c()}

        <div class="card">
          <div class="seg-label">Сброс данных</div>
          <p class="hint" style="margin:4px 0 10px">Удалит прогресс, стрик, диапазон и настройки на этом устройстве. Отменить нельзя.</p>
          <button class="btn ${o?"btn-danger":"btn-ghost"}" id="reset" style="width:100%">${o?"Точно сбросить? Нажми ещё раз":"Сбросить всё"}</button>
        </div>
      </div>
    `,document.getElementById("back").addEventListener("click",n),document.getElementById("voice").addEventListener("click",a),t.querySelectorAll("[data-vol]").forEach(f=>f.addEventListener("click",()=>{if(ds(f.dataset.vol),ie(re()),e&&e.ctx)try{ht(e.ctx,523.25,.5,0,.22,wt())}catch{}l()})),t.querySelectorAll("[data-route]").forEach(f=>f.addEventListener("click",()=>{la(f.dataset.route),l()})),t.querySelectorAll("[data-sens]").forEach(f=>f.addEventListener("click",()=>{ms(f.dataset.sens),e&&e.setSensitivity&&e.setSensitivity(De()),l()})),t.querySelectorAll("[data-diff]").forEach(f=>f.addEventListener("click",()=>{is(f.dataset.diff),l()})),t.querySelectorAll("[data-timbre]").forEach(f=>f.addEventListener("click",()=>{ls(f.dataset.timbre),l()})),t.querySelectorAll("[data-groove]").forEach(f=>f.addEventListener("click",()=>{as(f.dataset.groove),l()})),document.getElementById("guide").addEventListener("click",()=>{os(!Tt()),l()}),document.getElementById("hp").addEventListener("click",()=>{cs(!yt()),l()}),document.getElementById("darkstage").addEventListener("click",()=>{ra(!Ht()),l()}),document.getElementById("agc").addEventListener("click",()=>{const f=!At();da(f),e&&e.setAGC&&e.setAGC(f),l()});const h=document.getElementById("calib");h&&s&&h.addEventListener("click",s),document.getElementById("reset").addEventListener("click",()=>{if(!o){o=!0,l();return}es(),$a(),n()})}l()}function hi(t,e,{k:n=4,minRms:a=.012,window:s=.5}={}){if(!Array.isArray(t)||t.length<3)return null;const o=t.filter(l=>l.t<e).map(l=>l.rms).sort((l,r)=>l-r);if(!o.length)return null;const i=o[Math.floor(o.length/2)]||0,c=Math.max(a,i*n);for(const l of t)if(!(l.t<=e)){if(l.t-e>s)break;if(l.rms>=c)return l.t-e}return null}function fi(t,e=.03,n=.4){const a=t.filter(s=>Number.isFinite(s)&&s>=e&&s<=n).sort((s,o)=>s-o);return a.length<2?null:a[Math.floor(a.length/2)]}const vi=t=>new Promise(e=>setTimeout(e,t));function bi(t,e,{onExit:n}){let a=!1,s="";function o(){const l=Math.round(Re()*1e3);t.innerHTML=`
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
    `,document.getElementById("back").addEventListener("click",n),document.getElementById("measure").addEventListener("click",c);const r=document.getElementById("slider");r.addEventListener("input",()=>{const d=Number(r.value);document.getElementById("slval").textContent=d+" мс",document.getElementById("curms").textContent=d,sn(d/1e3)})}function i(){return new Promise(l=>{const r=e.ctx;if(!r){l(null);return}const d=[],h=r.currentTime,f=typeof performance<"u"?performance.now():Date.now(),u=h+.15;Kt(r,.15,!0);const m=()=>{e.read(),d.push({t:r.currentTime,rms:e.rms()});const v=r.currentTime-h,b=((typeof performance<"u"?performance.now():Date.now())-f)/1e3;v<.7&&b<1.3?setTimeout(m,16):l(hi(d,u))};m()})}async function c(){if(a)return;a=!0,s="",o();const l=[];for(let d=0;d<3;d++)s=`Замер ${d+1} из 3…`,o(),l.push(await i()),await vi(300);const r=fi(l);a=!1,r==null?s="Не удалось расслышать эхо (тихо, наушники или сильный шум). Подстрой вручную ползунком ниже или выбери тип вывода в настройках.":(sn(r),s=`Готово: задержка ≈ ${Math.round(r*1e3)} мс — сохранено.`),o()}o()}function Ms(t,{onExit:e}){const n=()=>Ms(t,{onExit:e}),a=ts(),s=lt(),o=Fe(),i=(l,r)=>`
    <div class="seg-label">${l}</div>
    <div class="seg">${r.map(([d,h,f])=>`<button data-act="${d}" class="${f?"on":""}">${h}</button>`).join("")}</div>`;t.innerHTML=`
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

        <div class="seg-label" style="margin-top:12px">Стрик: ${ce()} · заморозки: ${Xt()}</div>
        <div class="seg">
          <button data-act="s0">Стрик 0</button>
          <button data-act="s6">Стрик 6</button>
          <button data-act="s13">Стрик 13</button>
          <button data-act="fz">Заморозка +1</button>
        </div>

        <div class="seg-label" style="margin-top:12px">Энергия: ${gt()}/${Pt()}</div>
        <div class="seg">
          <button data-act="e0">0</button>
          <button data-act="e1">1</button>
          <button data-act="emax">Полная</button>
        </div>

        ${i(`Пейволл (soft, ${Pe}/день): сегодня использовано ${vs()}`,[["pw-on","Вкл",Qt()],["pw-off","Выкл",!Qt()],["pw-use","+1 распевка",!1]])}

        <div class="seg-label" style="margin-top:12px">Триал: ${o==null?"не начат":o>0?`активен, осталось ${o} дн.`:"истёк"}</div>
        <div class="seg">
          <button data-act="tr-start">Старт</button>
          <button data-act="tr-reset">Сброс</button>
        </div>

        ${i("Тариф",[["tier-free","Free",Mt()==="free"],["tier-std","Standard",Mt()==="standard"],["tier-pro","Pro",Mt()==="pro"]])}

        <div class="seg-label" style="margin-top:12px">Программа: сдано ${zt().length}/${nt.length}</div>
        <div class="seg">
          <button data-act="bl-all">Открыть все блоки</button>
          <button data-act="bl-none">Закрыть все</button>
        </div>
      </div>

      <button class="btn btn-ghost" id="simNew" style="width:100%">🧪 Симуляция нового пользователя (сброс + пейволл вкл)</button>
      <button class="btn btn-ghost" id="exitDev" style="width:100%">Выключить тест-режим</button>
      <p class="hint">Смещение времени живёт отдельно от прогресса: «Реальное» возвращает время, не трогая данные.</p>
    </div>
  `,document.getElementById("back").addEventListener("click",e),document.getElementById("exitDev").addEventListener("click",()=>{Zt(!1),ve(),e()}),document.getElementById("simNew").addEventListener("click",()=>{es(),ve(),Zt(!0),pe(!0),n()});const c={"d-1":()=>fe(-1),"d+1":()=>fe(1),"d+7":()=>fe(7),d0:()=>ve(),s0:()=>be(0),s6:()=>be(6),s13:()=>be(13),fz:()=>Us(Xt()+1),e0:()=>Gt(0),e1:()=>Gt(1),emax:()=>Gt(Pt()),"pw-on":()=>pe(!0),"pw-off":()=>pe(!1),"pw-use":()=>bs(),"tr-start":()=>fs(),"tr-reset":()=>va(),"tier-free":()=>jt("free"),"tier-std":()=>jt("standard"),"tier-pro":()=>jt("pro"),"bl-all":()=>ya(nt.map(l=>l.id)),"bl-none":()=>wa()};t.querySelectorAll("[data-act]").forEach(l=>{l.addEventListener("click",()=>{c[l.dataset.act](),n()})})}function pi(t,{onExit:e,onTrialStarted:n,onTeacher:a}){const s=Fe()!=null;t.innerHTML=`
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
  `,document.getElementById("back").addEventListener("click",e),document.getElementById("tomorrow").addEventListener("click",e),document.getElementById("teacher").addEventListener("click",a);const o=document.getElementById("trial");o&&o.addEventListener("click",()=>{fs(),Vt(2),n()})}const I=document.getElementById("app"),_=new Rs({fftSize:2048});let Y=null,ge=null;const gi=60,qt=[{label:"Мычание по гамме",sub:"«М» · I-II-III-II-I",ic:"lips",cat:"warm",make:t=>Le(t,W())},{label:"Губной тренаж «brrr»",sub:"brrr / «Р» · 5 нот + квинта",ic:"wave",cat:"warm",make:t=>Te(t,W())},{label:"Удержание ноты",sub:"держать ровный звук",ic:"fork",cat:"warm",make:t=>Dn(t,8)},{label:"Гамма «Ма-Мэ»",sub:"попадать в ноты гаммы",ic:"stairs",cat:"pitch",make:t=>Kn(t,W())},{label:"Беглость «Ма»",sub:"быстрые ноты — как в рекламе",ic:"bolt",cat:"pitch",make:t=>Jn(t,W())},{label:"Октавный скачок",sub:"прыжок на октаву и назад",ic:"arrows",cat:"pitch",make:t=>Xn(t)},{label:"Цепочка гласных",sub:"Ми-Ме-Ма · выравнивание",ic:"lips",cat:"vowel",make:t=>Hn(t,W())},{label:"Calm Down Vowels",sub:"И-Э-А-О-У · позиция",ic:"lips",cat:"vowel",make:t=>Sn(t)},{label:"Disco Vowels",sub:"И-Э-А-О-У · точность",ic:"stairs",cat:"vowel",make:t=>In(t,W())},{label:"James Charles Warm Up",sub:"гласные + Ми-Ме-Ма",ic:"wave",cat:"vowel",make:t=>An(t,W())},{label:"High Five",sub:"И-Э-А-О-У · подъём",ic:"arrows",cat:"vowel",make:t=>Cn(t,W())},{label:"No Bubble Gum",sub:"гибкость на гласных",ic:"bolt",cat:"vowel",make:t=>Bn(t,W())},{label:"Скачок к V ступени",sub:"Ям · атака интервала",ic:"arrows",cat:"pitch",make:t=>Rn(t,W())},{label:"Ладовая «ЯМ»",sub:"гамма лада вверх-вниз",ic:"stairs",cat:"pitch",make:t=>qn(t,W())},{label:"Вибрато",sub:"ровная волна голосом",ic:"wave",cat:"vib",make:t=>Pn(t)},{label:"Раскачка вибрато",sub:"А · запуск вибрато",ic:"wave",cat:"vib",make:t=>Fn(t)},{label:"Тёплый тон",sub:"Мо · качество тембра",ic:"fork",cat:"vib",make:t=>zn(t)},{label:"Ровный тон на двух",sub:"А · единый тембр",ic:"fork",cat:"vib",make:t=>Vn(t)},{label:"Через регистры",sub:"Но · passaggio",ic:"arrows",cat:"reg",make:t=>On(t)},{label:"Октавная связка",sub:"А · соединить регистры",ic:"arrows",cat:"reg",make:t=>Nn(t)},{label:"Белтинг — гамма",sub:"Эй · яркая подача",ic:"bolt",cat:"reg",make:t=>_n(t)},{label:"Белт — октава",sub:"Эй · опёртый верх",ic:"arrows",cat:"reg",make:t=>jn(t)},{label:"Чёткое стаккато",sub:"Та · артикуляция",ic:"bolt",cat:"artic",make:t=>Gn(t)},{label:"Слоги по группам",sub:"Та-Ка · дикция",ic:"lips",cat:"artic",make:t=>Wn(t)},{label:"Стамина-фигура",sub:"Ма · выносливость",ic:"stairs",cat:"artic",make:t=>Un(t)},{label:"Выносливая гамма",sub:"Ма · длинный пробег",ic:"stairs",cat:"artic",make:t=>Yn(t)}],yi=[["warm","Разогрев"],["vowel","Гласные"],["pitch","Точность и гибкость"],["vib","Вибрато и тембр"],["reg","Регистры и сила"],["artic","Дикция и выносливость"]];function vt(){const t=et(),e=t&&dt(t.key);return e?e.center:gi}function Ft(){const t=et(),e=t&&dt(t.key);return t&&t.low!=null&&t.high!=null?{low:t.low,high:t.high}:e?{low:e.low,high:e.high}:{low:48,high:72}}function at(){if(!Y)return;const t=et(),e=t&&dt(t.key);e?Y.setRange(j(e.low-5),j(e.high+5)):Y.setRange(60,1200)}const wi=["Голос — это мышца. Сегодня сделаем её сильнее.","Дыши животом — и звук польётся сам.","Чисто — не значит громко. Решает точность.","Каждая распевка чуть-чуть расширяет диапазон.","Расслабь челюсть и плечи — голос любит свободу.","Лучшие певцы тоже начинали с простого «мычания».","Тёплый голос начинается с тёплого дыхания.","Не тянись за верхней нотой горлом — она придёт сама.","5 минут каждый день дают больше, чем час раз в неделю.","Улыбнись — и тембр станет светлее.","Зевни перед распевкой — гортань скажет спасибо.","Пой так, будто тебя уже любят слушать."];function Ei(t){const e=t.slice();for(let n=e.length-1;n>0;n--){const a=Math.floor(Math.random()*(n+1));[e[n],e[a]]=[e[a],e[n]]}return e}function ki(){Q();const t=Ei(wi);I.innerHTML=`
    <div class="screen splash">
      <div class="splash-core">
        <div class="eq" aria-hidden="true"><i></i><i></i><i></i><i></i><i></i></div>
        <h1 class="splash-title">Распевка</h1>
        <p class="splash-tip" id="tip">${t[0]}</p>
      </div>
      <div class="splash-bar"><i></i></div>
    </div>
  `;const e=window.matchMedia&&window.matchMedia("(prefers-reduced-motion: reduce)").matches;setTimeout($i,e?1600:2800)}function $i(){Ti();try{new URLSearchParams(location.search).has("dev")&&Zt(!0)}catch{}if(!et()&&!$().welcomed){xi();return}z()}function xi(){Q(),I.innerHTML=`
    <div class="screen welcome">
      <div class="brand">
        <div class="eq eq-static" aria-hidden="true"><i></i><i></i><i></i><i></i><i></i></div>
        <h1>Привет! Это «Распевка»</h1>
        <p>Игровой тренажёр голоса: пой — и смотри, как твой голос попадает в ноты. Начнём с волшебного: за минуту узнаем твой тип голоса и диапазон.</p>
      </div>
      <button class="btn btn-primary" id="wlc-go" style="width:100%">🎤 Определить мой голос · 1 минута</button>
      <button class="btn btn-ghost" id="wlc-skip" style="width:100%">Сначала осмотрюсь</button>
      <p class="hint">Понадобится доступ к микрофону — мы слушаем только высоту тона, ничего не записываем и не отправляем.</p>
    </div>
  `;const t=()=>q({...$(),welcomed:!0});document.getElementById("wlc-skip").addEventListener("click",()=>{t(),z()}),document.getElementById("wlc-go").addEventListener("click",()=>{t(),J(()=>ze(I,_,Y,{onDone:()=>{at(),Mi()},onExit:z}))})}function Mi(){Q(),I.innerHTML=`
    <div class="screen welcome">
      <div class="brand"><h1>Отлично! 🎉</h1>
        <p>Упражнения уже подстроились под твой голос. Попробуем первую распевку — мягкое мычание, 1 минута.</p></div>
      <button class="btn btn-primary" id="fe-go" style="width:100%">Первая распевка →</button>
      <button class="btn btn-ghost" id="fe-menu" style="width:100%">В меню</button>
    </div>
  `,document.getElementById("fe-go").addEventListener("click",()=>ae(0)),document.getElementById("fe-menu").addEventListener("click",z)}let mt="off";async function Ls(){try{if(!_.ready){_.setAGC(At());const{sampleRate:t}=await _.start();Y||(Y=new qs(t,{fftSize:2048,minClarity:.85})),_.setSensitivity(De()),ie(re()),at()}return mt="listening",se(),!0}catch{return mt="denied",se(),!1}}async function Li(){if(mt==="listening"){try{await _.suspend()}catch{}mt="off",se()}else await Ls()}function Ti(){const t=document.getElementById("mic-fab");t&&(t.hidden=!1,t.__wired||(t.addEventListener("click",Li),t.__wired=!0),se())}function se(){const t=document.getElementById("mic-fab");if(!t)return;t.className="mic-fab "+mt;const e=t.querySelector(".mic-fab-txt");e&&(e.textContent=mt==="listening"?"Слушаю":mt==="denied"?"Нет доступа · нажми":"Включить микрофон"),t.setAttribute("aria-pressed",mt==="listening"?"true":"false")}async function J(t){if(!await Ls()){Si(t);return}t()}function Si(t){Q(),I.innerHTML=`
    <div class="screen">
      <div class="game-top"><button class="icon-btn" id="back">‹ Меню</button></div>
      <div class="brand"><h1>Нужен микрофон</h1>
        <p>Чтобы слышать твой голос, разреши доступ к микрофону. На телефоне нужен HTTPS, в браузере — «Разрешить».</p></div>
      <div class="card">
        <p class="hint" style="margin-bottom:16px">Нажми кнопку и выбери «Разрешить». Микрофон можно выключить в любой момент кнопкой внизу экрана.</p>
        <button class="btn btn-primary" id="grant" style="width:100%">Разрешить микрофон</button>
      </div>
    </div>
  `,document.getElementById("back").addEventListener("click",z),document.getElementById("grant").addEventListener("click",()=>J(t))}function ye(t){return`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">${{mic:'<path d="M12 3a3 3 0 0 0-3 3v6a3 3 0 0 0 6 0V6a3 3 0 0 0-3-3z"/><path d="M5 11a7 7 0 0 0 14 0M12 18v3"/>',chart:'<path d="M4 20V10M10 20V4M16 20v-7M22 20H2"/>',tuner:'<circle cx="12" cy="12" r="8"/><path d="M12 12l4-3"/><path d="M12 4v2M12 18v2M4 12h2M18 12h2"/>',wave:'<path d="M2 12h2l2-6 3 14 3-12 2 8 2-4h6"/>',note:'<circle cx="7" cy="18" r="3"/><circle cx="18" cy="16" r="3"/><path d="M10 18V5l11-2v13"/>',lips:'<path d="M3 12c4-5 14-5 18 0-4 5-14 5-18 0z"/><path d="M3 12h18"/>',fork:'<path d="M9 3v8a3 3 0 0 0 6 0V3"/><path d="M12 14v7"/>',stairs:'<path d="M3 19h4v-4h4v-4h4V7h4"/>',bolt:'<path d="M13 2 4 14h6l-1 8 9-12h-6z"/>',arrows:'<path d="M8 8l4-4 4 4M8 16l4 4 4-4M12 4v16"/>'}[t]||""}</svg>`}function Ii(){return'<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2c1 3-1 4-2 6-1 1.7-.5 3.5 1 4 .8.3 1-.7.5-1.5 2 .6 3.5 2.3 3.5 4.5A5 5 0 0 1 7 19c-1.7-1-2.7-3-2.5-5 .2-2.4 2-3.7 2.8-5.6C8.4 6 9 3.6 12 2z"/></svg>'}const we=t=>t%10===1&&t%100!==11?"день":"дн.";function z(){Q();const t=(y,H)=>{const A=y.make(60).notes.map(D=>D.midi);return`
    <button class="ex-tile" data-ex="${H}">
      ${ke(A)}
      <span class="ex-tile-main">${y.label}</span>
      <span class="ex-tile-sub">${y.sub}</span>
    </button>`},e=yi.map(([y,H])=>{const A=qt.map((D,U)=>D.cat===y?t(D,U):"").join("");return`<div class="cat-title">${H}</div><div class="ex-row">${A}</div>`}).join(""),n=zt(),a=nt.findIndex(y=>!n.includes(y.id)),s=Math.round(n.length/nt.length*100),o=Object.entries(ws).map(([y,H])=>`
    <button class="thin-item" data-breath="${y}"><span>${H.title}</span><span class="thin-sub">${H.kind==="exhale"?"выдох":"дыхание"}</span></button>
  `).join(""),i=Object.entries(Rt).map(([y,H])=>`
    <button class="thin-item" data-rhythm="${y}"><span>${H.name}</span><span class="thin-sub">метроном</span></button>
  `).join(""),c=$s.map((y,H)=>`
    <button class="ex-tile" data-song="${H}">
      ${ke(Qa(y))}
      <span class="ex-tile-main">${y.name}</span>
      <span class="ex-tile-sub">мелодия · на «ля»</span>
    </button>`).join(""),l=ce(),r=et(),d=r&&dt(r.key),h=Ys(),f=Zn(),u=(f.getDate()+f.getMonth())%qt.length,m=qt[u],v=Me(W()).name,b=gt(),g=Pt();I.innerHTML=`
    <div class="screen home">
      <header class="home-head">
        <h1>Распевка</h1>
        <div class="home-chips">
          <div class="energy-chip" title="Энергия — копится за точные распевки"><svg viewBox="0 0 24 24" fill="currentColor"><path d="M13 2 4 14h6l-1 8 9-12h-6z"/></svg>${b}/${g}</div>
          ${l>0?`<div class="streak-chip">${Ii()} ${l} ${we(l)}</div>`:""}
          ${Xt()>0?`<div class="energy-chip" title="Заморозка стрика — страхует 1 пропущенный день">❄ ${Xt()}</div>`:""}
          ${ga()?'<button class="gear-btn" data-dev aria-label="Тест-режим" title="Тест-режим">🧪</button>':""}
          <button class="gear-btn" data-settings aria-label="Настройки"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg></button>
        </div>
      </header>

      <button class="hero-card" id="session">
        <div class="hero-eyebrow">Сегодня</div>
        <div class="hero-title">Полная распевка</div>
        <div class="hero-sub">${h?`Сегодня выполнено ✓${l>0?` · стрик ${l} ${we(l)}`:""} — возвращайся завтра`:"Дыхание → распевка · ~10 минут"}</div>
        <span class="hero-arrow">→</span>
      </button>

      <button class="hero-card program-card" data-path>
        <div class="hero-eyebrow">Программа обучения</div>
        <div class="hero-title pc-title">${a===-1?"Все блоки пройдены! 🏆":`Блок ${a+1} · ${nt[a].title}`}</div>
        <div class="prog-bar pc-bar"><i style="width:${s}%"></i></div>
        <div class="hero-sub">${n.length} / ${nt.length} блоков · каждый завершается экзаменом</div>
        <span class="hero-arrow">→</span>
      </button>

      <div class="tiles">
        <button class="tile tile-hl" data-freesing="1">${ye("wave")}<span class="tile-main">Распевайся</span><span class="tile-sub">видеть свой голос</span></button>
        <button class="tile" data-voice="1">${ye("mic")}<span class="tile-main">Мой голос</span><span class="tile-sub">${d?d.name:"определить"}</span></button>
        <button class="tile" data-dash="1">${ye("chart")}<span class="tile-main">Прогресс</span><span class="tile-sub">${l>0?l+" "+we(l)+" подряд":"статистика"}</span></button>
      </div>

      <button class="focus-chip" data-focus>
        <span class="fc-label">Фокус дня — <b>${m.label}</b></span>
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
          <button class="thin-item" data-modes><span>Лад распевок</span><span class="thin-sub">${v}</span></button>
        </div>
      </section>
      <button class="thin-item thin-cta" data-teacher style="width:100%"><span>Урок с живым педагогом</span><span class="thin-sub">бесплатный пробный →</span></button>
      <p class="hint">Темп и «подсказку тоном» настраивай прямо в упражнении — значок ⚙.</p>
    </div>
  `,document.getElementById("session").addEventListener("click",()=>{const y=()=>J(()=>{at(),Fa(I,_,Y,{onExit:z})});$().safetyAccepted?y():Hi(y)});const E=I.querySelector("[data-focus]");E&&E.addEventListener("click",()=>ae(u)),I.querySelector("[data-voice]").addEventListener("click",()=>{J(()=>ze(I,_,Y,{onDone:()=>{at(),z()},onExit:z}))}),I.querySelector("[data-dash]").addEventListener("click",()=>Na(I,{onExit:z})),I.querySelector("[data-freesing]").addEventListener("click",()=>{J(()=>{const y=Ft();ja(I,_,Y,{onExit:()=>{at(),z()},lowMidi:y.low,highMidi:y.high})})}),I.querySelectorAll("[data-ex]").forEach(y=>{y.addEventListener("click",()=>ae(Number(y.dataset.ex)))}),I.querySelectorAll("[data-breath]").forEach(y=>{y.addEventListener("click",()=>J(()=>Es(I,_,y.dataset.breath,{onExit:z})))}),I.querySelectorAll("[data-rhythm]").forEach(y=>{y.addEventListener("click",()=>ys(I,_,vt(),Rt[y.dataset.rhythm],{onExit:z}))});const w=I.querySelector("[data-path]");w&&w.addEventListener("click",ue);const R=I.querySelector("[data-ear]");R&&R.addEventListener("click",()=>J(()=>{at(),ks(I,_,Y,{onExit:z,root:vt()})}));const M=I.querySelector("[data-theory]");M&&M.addEventListener("click",()=>Ya(I,{onExit:z}));const p=I.querySelector("[data-record]");p&&p.addEventListener("click",()=>J(()=>ii(I,_,{onExit:z})));const S=I.querySelector("[data-backing]");S&&S.addEventListener("click",()=>J(()=>{const y=Ft();ri(I,_,Y,{onExit:()=>{at(),z()},lowMidi:y.low,highMidi:y.high})}));const L=I.querySelector("[data-modes]");L&&L.addEventListener("click",Ci);const k=I.querySelector("[data-settings]");k&&k.addEventListener("click",Yt);const T=I.querySelector("[data-teacher]");T&&T.addEventListener("click",()=>Ot(z)),I.querySelectorAll("[data-song]").forEach(y=>{y.addEventListener("click",()=>Ss(Number(y.dataset.song)))});const B=I.querySelector("[data-dev]");B&&B.addEventListener("click",wn);const C=I.querySelector(".home-head h1");if(C){let y=0,H=0;C.addEventListener("click",()=>{const A=Date.now();y=A-H<600?y+1:1,H=A,y>=7&&(y=0,Zt(!0),wn())})}}function wn(){Q(),Ms(I,{onExit:z})}function Bi(){Q(),pi(I,{onExit:z,onTrialStarted:z,onTeacher:()=>Ot(z)})}function Ts(t){if(pa()){Bi();return}Qt()&&bs(),t()}function ae(t,e=!0){if(e){Ts(()=>En(t,e));return}En(t,e)}function En(t,e){J(()=>{at();const n=qt[t].make(vt()),a=Ft(),s=oe(n,a.low,a.high,4);ct(I,_,Y,n,{explain:e,reps:s,rebuild:()=>qt[t].make(vt()),onExit:z,onAgain:()=>ae(t,!1)})})}function Ss(t,e=!0){if(e){Ts(()=>kn(t,e));return}kn(t,e)}function kn(t,e){J(()=>{const n=$s[t].make(vt());ct(I,_,Y,n,{explain:e,reps:[0],onExit:z,onAgain:()=>Ss(t,!1)})})}function Ci(){Q(),ti(I,{onExit:z})}function ue(){Q(),ni(I,{blocks:nt,examsPassed:zt(),onExit:z,onOpenBlock:St,onSchool:Ot})}function St(t){Q();const e=nt[t];si(I,{block:e,index:t,examsPassed:zt(),doneItems:ta(e.id),onExit:ue,onRunItem:Is,onExam:Ve,onSchool:Ot})}function Is(t,e){const n=t.items[e],a=nt.indexOf(t);J(()=>{if(at(),n.t==="breath"){Es(I,_,n.id,{onExit:()=>{en(t.id,n.id),St(a)}});return}const s=()=>xe[n.id](vt(),W()),o=s(),i=Ft(),c=oe(o,i.low,i.high,3);ct(I,_,Y,o,{explain:!0,reps:c,rebuild:s,onResult:l=>{l.pct>=.5&&en(t.id,n.id)},onExit:()=>St(a),onAgain:()=>Is(t,e)})})}function Ve(t){J(()=>{at();const e=xe[t.exam.exId](vt(),W()),n=Ft(),a=oe(e,n.low,n.high,2);ct(I,_,Y,e,{explain:!0,reps:a,rebuild:()=>xe[t.exam.exId](vt(),W()),onComplete:s=>Ai(t,s),onExit:()=>St(nt.indexOf(t)),onAgain:()=>Ve(t)})})}function Ai(t,e){Q();const n=Math.round(e.pct*100),a=e.pct>=t.exam.pass;a?Zs(t.id):gt()>0&&Ee(-1);const s=nt.indexOf(t),o=a&&s+1<nt.length,i=a?"var(--green)":"var(--coral)";I.innerHTML=`
    <div class="screen summary">
      <div class="verdict" style="color:${i}">${a?"Экзамен сдан!":"Пока не сдан"}</div>
      <div class="big-pct" style="color:${i}">${n}<span>%</span></div>
      <p class="hint">${a?`Блок «${t.title}» пройден.${o?" Открыт следующий блок.":""}`:`Нужно ${Math.round(t.exam.pass*100)}%. Энергия −1 (восстановится со временем). Можно пересдать сразу.`}</p>
      <div class="teacher-cta"><span>Разобрать ошибки с педагогом — быстрее.</span><button class="btn btn-ghost" id="toSchool">На урок</button></div>
      <div class="row">
        <button class="btn btn-ghost" id="toBlock">К блоку</button>
        <button class="btn btn-primary" id="primary">${a?o?"Следующий блок":"К программе":"Пересдать"}</button>
      </div>
    </div>`,document.getElementById("toBlock").addEventListener("click",()=>St(s)),document.getElementById("toSchool").addEventListener("click",Ot),document.getElementById("primary").addEventListener("click",()=>{a?o?St(s+1):ue():Ve(t)})}function Ot(t){Q(),ui(I,{onExit:t||ue})}function Yt(){Q(),mi(I,_,{onExit:z,onVoice:()=>J(()=>ze(I,_,Y,{onDone:()=>{at(),Yt()},onExit:Yt})),onCalibrate:()=>J(()=>bi(I,_,{onExit:Yt}))})}function Hi(t){Q(),I.innerHTML=`
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
  `,document.getElementById("accept").addEventListener("click",()=>{q({...$(),safetyAccepted:!0}),t()}),document.getElementById("safety-back").addEventListener("click",z)}function Q(){ge&&cancelAnimationFrame(ge),ge=null}"serviceWorker"in navigator&&window.addEventListener("load",()=>{navigator.serviceWorker.register("./sw.js").catch(()=>{})});ki();
