# Hallmere — бриф лендинга

Статус: бриф подтверждён, ассеты готовы (фото, видео, прототип кристалла). Следующий шаг — сборка сайта (см. раздел 8).

## 1. Задача и аудитория

- **Режим:** Persuade. Посетитель должен захотеть изделие и записаться на консультацию.
- **В фикции:** частный клиент, который выбирает украшение на заказ и хочет понять, кто и как гранит камень.
- **В реальности:** демо-проект студии. Нужен «вау» за первые секунды и запоминающийся путь по скроллу.
- **Единственное действие:** «Book a private consultation». Оно есть в навигации на каждом экране и как форма в финале.

## 2. Выбранное направление

**Fire on White + путь камня.**

- **Мир:** холодное белое пространство, как белая гипсовая галерея при дневном свете. Цвет появляется только как спектр, на который камень разлагает свет: радужные блики (каустика, дисперсия) ложатся на стены и интерфейс. Чернила — почти чёрные. Без золота, без чёрного бархата, без кремового.
- **Сюжет:** финальный камень показан сразу, а затем скролл «отматывает» его историю: из глубины 150 км, через руки огранщика, в оправу и к клиенту.
- **Навигация:** вертикальная шкала глав у левого края (взята из Survey Plate). У каждой главы свой адрес: `−150 km`, `Surface`, `Bench`, `57`, `Setting`, `Hand`. Шкала показывает прогресс и кликабельна.
- **Главный объект:** один живой бриллиант на Three.js, закреплённый поверх всей страницы. Он единственное «настоящее» 3D и ведёт посетителя через все главы.
- **Техника:** гибрид.
  - Видео из Flow, перематываемое скроллом, даёт атмосферу и большие пролёты камеры.
  - Three.js отвечает за камень.
  - GSAP ScrollTrigger связывает всё со скроллом.
  - Остановки работают как в Persepolis: на участках скролла кадр почти стоит, появляется текст главы, затем быстрый пролёт к следующей главе.
- **Обратимость:** всё проматывается назад кадр в кадр.

## 3. Сценарий по секциям

| # | Глава (адрес) | Что видит посетитель | Видео/фото (Flow) | Three.js |
|---|---|---|---|---|
| 0 | **Hero** · `0 m` | Белая комната, в центре висит огранённый бриллиант и медленно поворачивается за курсором; по стенам бегут спектральные блики. Заголовок крупно внизу слева, CTA справа. | A — белая комната (фото или тихий видеолуп) | Бриллиант, дисперсия, блики от курсора |
| 1 | **Descent** · `0 → −150 km` | По скроллу камера опускается: туманный пейзаж → огромный карьер-спираль → слои породы → бледная голубовато-серая глубина. Камень гаснет, «уменьшается» и падает вниз вместе с камерой. | B1 и B2 — пролёт в карьер и сквозь породу (два склеенных клипа) | Камень уходит в глубину |
| 2 | **Origin** · `−150 km` · *остановка* | Мутный необработанный кристалл-октаэдр в породе. Текст: камню миллиарды лет, давление, температура. | Фон: последний кадр B2 | Сырой кристалл (модель со Sketchfab) |
| 3 | **Surface** · `Surface` · *остановка* | Руки огранщика держат сырой камень под северным светом, лупа. Текст об отборе камней: из многих берут один. | C — руки, лупа, сырой камень | Кристалл «переходит» в кадр |
| 4 | **Bench** · `Bench` · *главный «вау»* | Кристалл дрожит, как собака, стряхивающая воду: корка трескается и разлетается осколками. Сквозь облако осколков линиями чертится схема граней (каркас), который «застывает» в стеклянный бриллиант. | Фон: белый верстак (D, фото) | Расколотая оболочка (осколки по скроллу), каркас → стекло |
| 5 | **57** · `57 facets` · *остановка* | Бриллиант поворачивается по скроллу, счётчик граней 01→57, дисперсия усиливается до максимума. Короткие подписи частей камня (корона, павильон, рундист). | — (чистый белый) | Вращение, счётчик, дисперсия |
| 6 | **Setting** · `Setting` | 3D-бриллиант опускается и «передаёт» себя в кадр видео, где его держит пинцет; камень садится в оправу. | E — закрепка в кольцо | Бриллиант уходит в кадр видео (модели кольца нет) |
| 7 | **Hand** · `Hand` · *финал* | Готовое кольцо в белом свете, блики на стенах. Форма консультации: имя, email, повод, удобная дата. | F — рука с кольцом в белом свете (фото) | Кольцо медленно вращается |
| — | Footer | Название, адрес ателье (вымышленный), пометка «Demo project, fictional company». | — | — |

**Мобилка (базово):** вместо видео по скроллу — статичные кадры глав, камень Three.js упрощённый (меньше разрешение, без каустики). **Reduced motion:** статичные кадры, без пролётов и разлёта осколков.

## 4. Промпты для Google Flow

Общие правила для всех ассетов:
- 16:9, 1080p и выше.
- Без текста, логотипов и людей с узнаваемыми лицами.
- Холодный белый дневной свет, низкая насыщенность.
- Склейка клипов: последний кадр одного ролика используем как первый кадр следующего, если Flow это позволяет (проверь в интерфейсе).

**A — Hero, белая комната (фото, плюс по желанию 8-секундный луп)**
> Minimal empty gallery room with seamless white plaster walls and a soft curved corner, cool northern daylight entering from an unseen high window, very subtle soft shadows, faint tiny rainbow light refractions scattered on the walls, calm, architectural, ultra clean, photorealistic, high-end editorial photography, no objects, no people, no text. Static camera.

**Видео (ключевые кадры уже сгенерированы; названия кадров — как во Flow)**

| Клип | Начальный кадр | Конечный кадр | Файл |
|---|---|---|---|
| B1 | Aerial descent into diamond mine | Camera descending into open-pit… | `B1-descent-aerial.mp4` |
| B2 | Camera descending into open-pit… | Pale blue-grey fog underground | `B2-descent-fog.mp4` |
| C | Examining uncut diamond crystal | — | `C-loupe.mp4` |
| E | Tweezers placing diamond in ring | — | `E-setting.mp4` |

Для перемотки скроллом: одно непрерывное движение с постоянной скоростью, без склеек, тряски, вспышек и резких действий. Звук не нужен.

**B1**
> One continuous slow drone shot: the camera glides forward and steadily descends from high above a vast frost-covered open-pit diamond mine with spiral terraced walls, dropping over the rim into the pit and ending low inside it, facing frosted stratified walls with mist pooling below. Constant speed, perfectly smooth, no cuts, no camera shake. Mist drifts gently. Cool grey-white palette, soft overcast light. No people, no vehicles, no text.

**B2**
> One continuous slow vertical descent deeper into the frosted open-pit mine: frosted stratified rock walls pass by on both sides as the camera sinks, the fog gradually thickens and brightens until the centre of the frame is soft luminous pale blue-grey fog framed by frosted walls at the edges. Constant speed, perfectly smooth, no cuts, no camera shake. Cool calm palette. No people, no text.

**C**
> Very slow, steady push-in towards a rough uncut diamond crystal held in steel tweezers in front of a jeweller's loupe. The hand turns the crystal very slightly, soft light glints travel slowly across its frosted surface. Clean well-groomed hands, white background, cool northern daylight, shallow depth of field. No cuts, no sudden movement, no face, no text.

**E**
> Very slow, steady macro shot: fine steel tweezers gently lower a brilliant-cut diamond into the four prongs of a platinum solitaire ring held in a white bench clamp, release it, and the stone settles into the setting with a few small spectral glints. Slight slow push-in. Clean white bench, cool daylight, white and silver tones, shallow depth of field. No cuts, no sudden movement, no face, no text.

**D — Белый верстак (фото, готово)**
> Top-down view of a clean white marble diamond-cutting workbench in cool daylight. Placed neatly at the edges: fine brass tweezers, a jeweller's loupe, a slim steel millimetre gauge, two wooden dop sticks, a small folded white diamond parcel paper with blue lining. Generous empty white space in the centre. Minimal, precise, high-end editorial photography, cool neutral tones, no hammers, no chisels, no people, no text.

**F — Рука с кольцом (фото)**
> Elegant close-up of a hand wearing a platinum solitaire ring with a brilliant-cut diamond, resting on white plaster, cool soft daylight, small rainbow refractions cast on the white surface, minimal, high-end jewellery editorial photography, no face, no text.

**Слои для параллакса (опционально, вместо B1 в статичном варианте и для мобилки):** небо, дальние холмы, край карьера, террасы, передний план — 5 отдельных изображений с одинаковой камерой; отделение слоёв сделаем потом.

### G — Ателье, параллакс (фото, слои)

Секция между Setting и консультацией. Закреплена примерно на 200vh, слои разъезжаются на месте, слово «Under one roof.» стоит между шкафом и ювелиром. Пылинки и лучи света рисуются кодом.

**Порядок:**
1. Сгенерировать эталон **G0**: из него берутся все слои, чтобы перспектива и свет совпали.
2. Слои G1–G6 лучше делать **редактированием G0** (загрузить G0 как референс, дать инструкцию ниже). Если Flow так не умеет, вставить общий блок описания G0 и дописать в конец инструкцию слоя.
3. Слои G2–G6 нужны на ровном хромакее; фон вырезаю я (ffmpeg). Всё в резком фокусе, размытие и дымку добавляет код.
4. Максимальное разрешение, какое даёт Flow (16:9, лучше 2K+). Имена файлов: `G0-atelier.jpg`, `G1-room.jpg` … `G6-lamp.jpg` в `assets/photos/`.

**G0 — эталон всей сцены**
> Interior of a quiet diamond-cutting atelier. Wide eye-level view, 35mm lens, one-point perspective looking straight toward a back wall of tall steel-framed north-facing windows with soft overcast white daylight. Middle distance: a long low white cabinet of shallow flat drawers, with a few small white porcelain dishes holding rough uncut crystals on top. Left of centre, mid-ground: a jeweller seen from behind at a white workbench under a slim desk lamp, light grey work apron, hair tied back. Right, closer to the camera: a diamond cutter seen from behind, face turned away, seated at a horizontal cast-iron polishing wheel (scaife) with a steel dop arm. Foreground across the whole bottom edge: the end of a white marble bench with a jeweller's loupe, fine steel tweezers, folded white diamond parcel papers and a wooden dop stick. Top right corner, close to the camera: the arm and head of a white anglepoise lamp. White plaster walls, white and pale grey tones, silver steel, very low saturation, cool northern daylight, calm, high-end editorial photography, deep focus, no faces visible, no text, no logos.

**Общая инструкция для слоёв G2–G6** (дописать после инструкции слоя):
> Keep it exactly as in the reference: same position, size, perspective and lighting. Complete any parts of it that are hidden behind other objects in the reference, drawing them in full as if nothing stood in front. Replace everything else with a flat, evenly lit, solid chroma green background (#00FF00). No shadows on the background, no green reflections on the subject, sharp focus, no text.

Что прячется в G0 и должно быть дорисовано: у ювелира (G3) ничего; у шкафа (G2) левый край за столом ювелира и правый за верстаком огранщика; у огранщика (G4) нижняя часть фигуры, стул и ножки верстака за мраморным столом.

**G1 — пустая комната (без хромакея)**
> Remove all people, furniture, the cabinet, the benches, the lamps and every object. Keep only the empty room: the back wall of tall steel-framed windows, the white plaster side walls, floor and ceiling, with the same perspective and daylight. Fill the removed areas naturally.

**G2 — шкаф с камнями**
> Keep only the long low white cabinet of flat drawers with the porcelain dishes of rough crystals on top.

**G3 — ювелир**
> Keep only the jeweller seen from behind together with her white workbench, stool and slim desk lamp.

**G4 — огранщик**
> Keep only the diamond cutter seen from behind together with the cast-iron polishing wheel, its stand and the steel dop arm. Draw his whole body, chair and the full workbench down to the floor, as if the marble bench in front of him were not there.

**G5 — передний план, край верстака**
> Keep only the end of the white marble bench across the bottom edge with the loupe, tweezers, folded parcel papers and the wooden dop stick.

**G6 — лампа в углу**
> Keep only the white anglepoise lamp arm and head in the top right corner.

### Обработанные видео (готово)

- `assets/videos/scrub/` — версии для перемотки скроллом: 1920×1080, 24 fps, каждый кадр ключевой, без звука, faststart. B1 и B2 приведены к холодной палитре (убран бежевый). Всего ~35 МБ.
- `assets/videos/stills/` — первый и последний кадр каждого клипа (webp) для мобилки и reduced motion.
- Исходники из Flow лежат в `assets/videos/` без изменений.
- B1 и B2 склеены в один клип `scrub/B-descent.mp4` (20 с, 480 кадров); C и E — отдельные файлы, грузятся ближе к своим главам.
- Места, которые закрываем туманной волной в коде (время по `B-descent.mp4`): ~6.5–7.5 с (наплыв вместо пролёта), ~12–14 с (горизонтальная «шторка»).
- Готовые остановки: `B-descent` 15–20 с (−150 km), E 8–10 с (камень в оправе), C — весь клип почти статичен.

## 5. 3D-ассеты

- **Бриллиант** — строится кодом (геометрия круглой огранки, 57 граней, порядок граней под контролем для счётчика и прорисовки), шейдер с преломлением и дисперсией. Ещё не сделан.
- **Необработанный кристалл** — кодом, прототип принят: [crystal.html](crystal.html) + [src/proto/crystal.js](src/proto/crystal.js) (выпуклая оболочка точек на скруглённом октаэдре, MeshPhysicalMaterial с transmission, неравномерная матовость, рельеф, дымка). Параметры по умолчанию в прототипе — принятый вариант. Подходящих моделей на Sketchfab не нашлось.
- **Кольцо** — модели нет: закрепку показывает видео E.
- **Осколки корки** — генерируются кодом из кристалла. Ещё не сделаны.
- Прототип в сайт не входит; код кристалла переносится в модуль сайта при сборке.

## 6. Границы и анти-цели

- Не делаем: чёрный бархат и золото, кремовый «люкс», крутящееся кольцо на градиенте, ряд одинаковых карточек.
- Не выдумываем как реальное: сертификаты GIA, прессу, отзывы, реальные шахты.
- Демо-статус указан в футере.

## 8. Где остановились и что дальше

Готово: PRODUCT.md, бриф, контракт направления (`.impeccable/surfaces/index-html.md`), фото A/D/F (`assets/photos/`), видео для скролла и стоп-кадры (`assets/videos/scrub/`, `assets/videos/stills/`), прототип кристалла, Vite + three + gsap в package.json.

Следующие шаги сборки (по скиллу impeccable, code-led):
1. Шрифты и палитра (токены), каркас страницы на Vite.
2. Hero: фото A + живой бриллиант на Three.js + блики за курсором, навигация, шкала глав, CTA.
3. Спуск: `B-descent.mp4` по скроллу (GSAP ScrollTrigger) с остановками и туманными переходами.
4. Главы −150 km, Surface (видео C), Bench (раскол кристалла → каркас → бриллиант), 57, Setting (видео E), Hand (фото F + фейковая форма).
5. Мобилка и reduced motion, проверка, finish review, DESIGN.md.

## 7. Открытые решения

1. ~~Форма~~ — решено: фейковая, никуда не отправляет; показывает состояние «отправлено».
2. Шрифты и точная палитра — решаются на этапе сборки.
3. Конкретные модели со Sketchfab — подберём после подтверждения брифа.
