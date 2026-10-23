#!/usr/bin/env python3
"""Builds index.html from the lists below. Run: python3 build.py"""
import re
from html import escape
from pathlib import Path

ROOT = Path(__file__).parent

SHOW_KISA = True
CREATIVES = [
    ('cr-kisa-a', 'Вечеринка', None),
    ('cr-kisa-b', 'Газуем!', None),
    ('cr-ball-a', '3D-шары', None),
    ('cr-ball-b', '3D-шары', None),
    ('cr-cat-a', 'Cat Simulator', None),
    ('cr-cat-b', 'Cat Simulator', None),
]
FILM_BLOCKS = [
    {
        'id': 'desert', 'title': 'Пустынные рыбы', 'c': 'var(--c-films)',
        'chips': ['документальный фильм', '20 мин'],
        'items': [
            ('film-fish-storm', 'Песчаная буря у ангара', False),
            ('film-fish-bass', 'Стая сибасов', False),
            ('film-fish-devil', 'Пылевой вихрь', False),
            ('i3-hangar', 'Ангар-ферма изнутри', True),
            ('film-fish-farm', 'Ангары-фермы в пустыне', False),
            ('film-fish-bubbles', 'Пузыри над резервуарами', False),
            ('i3-filter', 'Очистка воды по шагам', True),
            ('film-fish-feed', 'Кормление рыб', False),
            ('i3-aquarium', 'Резервуар в разрезе', True),
            ('film-fish-cloud', 'Бактерии растворяются в воде', False),
            ('i3-roof', 'Крыша над прудом', True),
            ('i3-tank', 'Цистерна с мальками', True),
        ],
    },
    {
        'id': 'ocean', 'title': 'Секреты океанов', 'c': 'var(--c-pl)',
        'chips': ['документальный фильм', '20 мин'],
        'items': [
            ('film-atl-ship', 'Сухогруз в шторм', False),
            ('i3-plates', 'Плита уходит под плиту', True),
            ('film-atl-tsunami', 'Цунами у берега', False),
            ('film-atl-sub', 'Батискаф уходит на глубину', False),
            ('i3-quake', 'Извержение на дне', True),
            ('film-atl-sphere', 'Сфера батискафа', False),
            ('film-atl-canyon', 'Батискаф в каньоне', False),
            ('i3-sonar', 'Сонар сканирует дно', True),
            ('film-atl-wave', 'Волна на мелководье', False),
            ('film-atl-sat', 'Спутник над Землёй', False),
            ('i3-slide', 'Подводный оползень', True),
            ('film-atl-dark', 'Ночной город у океана', False),
        ],
    },
    {
        'id': 'space', 'title': 'Вулканы других миров', 'c': 'var(--c-tl)',
        'chips': ['документальный фильм', 'в работе'],
        'items': [
            ('om-astro', 'Космонавт на склоне', False),
            ('om-helmet', 'Отражение в шлеме', False),
            ('i3-volcano', 'Вулкан в разрезе', True),
            ('om-erupt', 'Извержение у океана', False),
            ('om-core', 'Планета в разрезе', True),
            ('om-train', 'Поезд в лавовой трубе', False),
            ('om-planets', 'Две планеты', False),
            ('i3-magma', 'Магма поднимается', True),
            ('om-climb', 'Восхождение на рассвете', False),
            ('om-tube', 'Лавовая труба', False),
            ('om-blast', 'Взрыв лавы', True),
            ('om-earth', 'Земля из космоса', False),
        ],
    },
]
SKETCH = ('cr-sketch', 'Плоская Земля')
PLAYABLES = [
    ('pl-owl', 'Find all the Owls', 'owl'),
    ('pl-sherlock', 'Sherlock', 'sherlock'),
]
GAMES = [
    ('gm-living-sea', 'Подводная аркада'),
    ('gm-nightline', 'Гонки'),
    ('gm-trufflet', 'Ферма'),
    ('gm-frog-jump', 'Платформер'),
    ('gm-sky-hop', 'Раннер'),
    ('gm-ink-zoo', 'Аркада-шутер'),
    ('gm-shapes', 'Головоломка с тенями'),
    ('gm-meadow', 'Сбор на время'),
    ('gm-slice', 'Три в ряд'),
    ('gm-dig', 'Аркада-забег'),
    ('gm-balloon', 'Бесконечный полёт'),
    ('gm-orbit', 'Tube-раннер'),
    ('gm-hidden-sum', 'Математическая головоломка'),
    ('gm-frog', 'Аркада на реакцию'),
    ('gm-shade', 'Головоломка на цвет'),
    ('gm-slice-strike', 'Слэшер'),
    ('gm-penguin', 'Рикошет'),
    ('gm-dodge', 'Уклонение'),
    ('gm-gems', 'Match-3'),
    ('gm-stack', 'Башня на тайминг'),
    ('gm-ink-line', 'Рисуй линию'),
    ('gm-aces', 'Вертикальный шутер'),
    ('gm-glyph', 'Руны жестами'),
    ('gm-termite', 'Ловкость'),
    ('gm-ignite', 'Змейка'),
    ('gm-sort', 'Сортировка'),
    ('gm-grid', 'Захват территории'),
    ('gm-deep', 'Соединялка'),
]
SHOTS = [
    ('sparring', 'Тренажёр Flutter и Compose', 'Одна задача решается и на Flutter, и на Jetpack Compose. Ответ проверяет настоящий компилятор, а не модель.', ['Tauri · Rust', 'React', 'CodeMirror']),
    ('reader', 'Читалка с ИИ-помощником', 'Выделяешь фрагмент книги, и помощник объясняет его в выбранном режиме: проще, с примерами или подробно.', ['Electron', 'Claude', 'EPUB · FB2']),
]
AUTO = [
    ('Telegram-бот задач', 'Пересылаешь сообщение с ТЗ, бот достаёт ссылки, убирает дубли и ставит в очередь на сборку.'),
    ('Агрегатор вакансий', 'Вакансии с 6 сайтов в одной ленте: дубли склеены, зарплаты в рублях, свежие приходят сами.'),
    ('Подбор книг', 'По теме находит книги профильных издательств с обложками и ранжирует их ИИ-агентом.'),
]
SUBS = [
    ('sub-faceswap', 'Face Swap · ИИ', 'Face Swap', 'Меняет лицо на фото по шаблону: ИИ генерирует результат за секунды.', ['Шаблоны по категориям', 'Генерация на сервере', 'Галерея и история', 'Пейволл: неделя, месяц, год']),
    ('sub-meditation', 'ИИ-медитации', 'ИИ-медитации', 'Медитация под твою цель: ИИ пишет текст сессии и озвучивает его.', ['Цель, длительность и фон', 'Генерация сессии ИИ', 'Плеер с таймером', 'Поддержка подпиской']),
]


def loop(key):
    return (f'<video class="loop" data-src="assets/g/{key}.mp4" data-poster="assets/g/{key}.jpg" '
            f'muted loop playsinline preload="none"></video>')


def plural(n, one, few, many):
    if n % 10 == 1 and n % 100 != 11:
        return one
    if 2 <= n % 10 <= 4 and not 12 <= n % 100 <= 14:
        return few
    return many


def tag(name):
    return f'<span class="tag">{escape(name)}</span>'


LD = [0]


def loader():
    LD[0] += 1
    v = LD[0] % 5 + 1
    return f'<span class="ld ld--{v}" aria-hidden="true"><i></i><i></i><i></i><i></i><i></i></span>'


def work(key, name, cls='', full=None):
    inner = f'<div class="media">{loader()}{loop(key)}</div>{tag(name)}'
    if full:
        return f'<button class="work {cls} work--play" data-full="{full}">{inner}</button>'
    return f'<figure class="work {cls}">{inner}</figure>'


def page_head(no, title, sub, c):
    return ''


def page_foot(prev_id, prev_name, next_id, next_name):
    left = f'<button class="turn turn--prev" data-go="{prev_id}"><span>←</span> {prev_name}</button>' if prev_id else '<span></span>'
    right = f'<button class="turn turn--next" data-go="{next_id}">{next_name} <span>→</span></button>' if next_id else '<span></span>'
    return f'<div class="pfoot">{left}{right}</div>'


def build():
    def film_block(n, b):
        tiles = '\n          '.join(work(k, t, 'work--3d' if d else '') for k, t, d in b['items'])
        chips = ''.join(f'<li>{escape(c)}</li>' for c in b['chips'])
        n3d = sum(1 for *_, d in b['items'] if d)
        screen = ''
        if b.get('screen'):
            key, tg, cap, btn = b['screen']
            screen = (f'<div class="screens screens--wide"><figure class="screen screen--wide"><div class="screen__frame">{loader()}'
                      f'<video data-src="assets/video/{key}.mp4" data-poster="assets/video/{key}.jpg" preload="none" playsinline></video>'
                      f'<button class="screen__play"><span>▶</span>{btn}</button></div><span class="tag">{escape(tg)}</span>'
                      f'<figcaption>{escape(cap)}</figcaption></figure></div>')
        return (f'<article class="film" id="film-{b["id"]}" style="--c: {b["c"]}">'
                f'<header class="film__head"><span class="film__no">#{n}</span><h3 class="film__title">{escape(b["title"])}</h3>'
                f'<ul class="film__chips">{chips}<li class="film__3d">{n3d} {plural(n3d, "сцена", "сцены", "сцен")} в 3D</li></ul></header>'
                f'<div class="grid grid--om">\n          {tiles}\n        </div>{screen}</article>')
    film_blocks = '\n      '.join(film_block(i + 1, b) for i, b in enumerate(FILM_BLOCKS))
    featured = '\n        '.join(work(k, n, 'work--v work--reels work--feat', f) for k, n, f in CREATIVES if k.startswith('cr-kisa')) if SHOW_KISA else ''
    creatives = '\n        '.join(work(k, n, 'work--v', f) for k, n, f in CREATIVES if not k.startswith('cr-kisa'))
    sketch = work(SKETCH[0], SKETCH[1], 'work--sketch')
    playables = '\n        '.join(work(k, n, 'work--v work--pl').replace('</figure>', f'<button class="plbtn" data-play="{g}" data-name="{escape(n)}"><span>▶</span>Поиграть</button></figure>') for k, n, g in PLAYABLES)
    games = '\n        '.join(work(k, n, 'work--phone') for k, n in GAMES)
    shots = '\n        '.join(
        f'<article class="proj proj--small"><div class="proj__img">{loader()}<img loading="lazy" src="assets/tools/{k}.jpg" alt="" /></div>'
        f'<div class="proj__body"><span class="proj__kind">пет-проект</span><h3>{escape(n)}</h3><p>{escape(d)}</p>'
        f'<ul class="proj__tech">{"".join(f"<li>{escape(t)}</li>" for t in tech)}</ul></div></article>'
        for k, n, d, tech in SHOTS)
    auto = '\n        '.join(f'<article class="auto"><h4>{escape(n)}</h4><p>{escape(d)}</p></article>' for n, d in AUTO)
    subs = '\n        '.join(
        f'<div class="subcard">{work(k, n, "work--phone work--pro")}<div class="subcard__box"><h4>{escape(t)}</h4><p>{escape(d)}</p>'
        f'<ul>{"".join(f"<li>{escape(x)}</li>" for x in pts)}</ul></div></div>'
        for k, n, t, d, pts in SUBS)

    tpl = (ROOT / 'page.template.html').read_text()
    if not featured:
        tpl = re.sub(r'\s*<div class="feat-row".*?\{\{FEATURED\}\}\s*</div>\s*</div>', '', tpl, flags=re.S)
    out = (tpl.replace('{{FILM_BLOCKS}}', film_blocks).replace('{{FEATURED}}', featured).replace('{{CREATIVES}}', creatives).replace('{{SKETCH}}', sketch)
              .replace('{{PLAYABLES}}', playables).replace('{{GAMES}}', games)
              .replace('{{SHOTS}}', shots).replace('{{AUTO}}', auto).replace('{{SUBS}}', subs).replace('{{NGAMES}}', str(len(GAMES))).replace('{{NSUBS}}', str(len(SUBS)))
              .replace('{{HEAD_VIDEO}}', page_head('01', 'Видео', 'фильмы и креативы с ИИ', 'films'))
              .replace('{{HEAD_GAMES}}', page_head('02', 'Игры', 'Flutter · Flame', 'gm'))
              .replace('{{HEAD_PLAY}}', page_head('03', 'Playable ads', 'Cocos Creator', 'pl'))
              .replace('{{HEAD_TOOLS}}', page_head('04', 'Автоматизация и QA', '', 'tl'))
              .replace('{{FOOT_VIDEO}}', page_foot(None, None, 'games', 'Игры'))
              .replace('{{FOOT_GAMES}}', page_foot('video', 'Видео', 'playables', 'Playable ads'))
              .replace('{{FOOT_PLAY}}', page_foot('games', 'Игры', 'tools', 'Автоматизация и QA'))
              .replace('{{FOOT_TOOLS}}', page_foot('playables', 'Playable ads', None, None)))
    import time
    v = str(int(time.time()))
    for f in ('styles.css', 'scene.js', 'script.js'):
        out = out.replace(f'"{f}"', f'"{f}?v={v}"')
    (ROOT / 'index.html').write_text(out)
    print('index.html:', len(GAMES), 'games,', sum(len(b['items']) for b in FILM_BLOCKS), 'film shots')


if __name__ == '__main__':
    build()
