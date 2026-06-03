// belly-diagram.js — картинка-человек для дыхания животом (Vite-импорт ассета).
// Вынесено из illustrations.js, т.к. import .webp работает только в Vite (не в Node-тестах).
import bellyImg from './belly-breathing.webp';

/** Картинка-человек: слева спокойный живот (выдох), справа надутый (вдох). */
export function bellyDiagram() {
  return `
    <div class="breathe-diagram">
      <img class="belly-img" src="${bellyImg}" alt="Дыхание животом: слева спокойный живот (выдох), справа надутый живот (вдох)" />
      <div class="belly-caps"><span>Выдох · живот мягкий</span><span>Вдох · живот надут</span></div>
      <p class="diagram-note">Не стесняйся: на вдохе <b>живот округляется вперёд</b> (как справа на картинке), воздух идёт вниз. Плечи и грудь почти неподвижны — не тянись вверх.</p>
    </div>`;
}
