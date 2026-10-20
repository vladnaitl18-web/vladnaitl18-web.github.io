#!/usr/bin/env python3
"""Builds index.html from the lists below. Run: python3 build.py"""
from html import escape
from pathlib import Path

ROOT = Path(__file__).parent

FILMS = [
    ('film-fish-storm', 'Песчаная буря у ангара'),
    ('film-atl-ship', 'Сухогруз в шторм'),
    ('film-wall-ride', 'Конница кочевников'),
    ('film-fish-bass', 'Стая сибасов'),
    ('film-atl-tsunami', 'Цунами у берега'),
    ('film-fish-devil', 'Пылевой вихрь'),
    ('film-atl-canyon', 'Батискаф в каньоне'),
    ('film-wall-gate', 'Караван у ворот крепости'),
    ('film-fish-cloud', 'Бактерии растворяются в воде'),
    ('film-atl-quake', 'Землетрясение'),
    ('film-fish-farm', 'Ангары-фермы в пустыне'),
    ('film-atl-dark', 'Ночной город у океана'),
    ('film-wall-siege', 'Конница врывается в ворота'),
    ('film-fish-feed', 'Кормление рыб'),
    ('film-atl-wave', 'Волна на мелководье'),
    ('film-atl-sub', 'Батискаф уходит на глубину'),
]
CREATIVES = [
    ('cr-ball-a', '3D-шары', None),
    ('cr-ball-b', '3D-шары', None),
    ('cr-cat-a', 'Cat Simulator', None),
    ('cr-cat-b', 'Cat Simulator', None),
]
SKETCH = ('cr-sketch', 'Плоская Земля')
PLAYABLES = [
    ('pl-owl', 'Find all the Owls'),
    ('pl-sherlock', 'Sherlock'),
    ('pl-water', 'Water Rescue'),
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


def tag(name):
    return f'<span class="tag">{escape(name)}</span>'


def work(key, name, cls='', full=None):
    inner = f'<div class="media">{loop(key)}</div>{tag(name)}'
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
    films = '\n        '.join(work(k, n) for k, n in FILMS)
    creatives = '\n        '.join(work(k, n, 'work--v', f) for k, n, f in CREATIVES)
    sketch = work(SKETCH[0], SKETCH[1], 'work--sketch')
    playables = '\n        '.join(work(k, n, 'work--v') for k, n in PLAYABLES)
    games = '\n        '.join(work(k, n, 'work--phone') for k, n in GAMES)
    shots = '\n        '.join(
        f'<article class="proj proj--small"><div class="proj__img"><img loading="lazy" src="assets/tools/{k}.jpg" alt="" /></div>'
        f'<div class="proj__body"><span class="proj__kind">пет-проект</span><h3>{escape(n)}</h3><p>{escape(d)}</p>'
        f'<ul class="proj__tech">{"".join(f"<li>{escape(t)}</li>" for t in tech)}</ul></div></article>'
        for k, n, d, tech in SHOTS)
    auto = '\n        '.join(f'<article class="auto"><h4>{escape(n)}</h4><p>{escape(d)}</p></article>' for n, d in AUTO)
    subs = '\n        '.join(
        f'<div class="subcard">{work(k, n, "work--phone work--pro")}<div class="subcard__box"><h4>{escape(t)}</h4><p>{escape(d)}</p>'
        f'<ul>{"".join(f"<li>{escape(x)}</li>" for x in pts)}</ul></div></div>'
        for k, n, t, d, pts in SUBS)

    tpl = (ROOT / 'page.template.html').read_text()
    out = (tpl.replace('{{FILMS}}', films).replace('{{CREATIVES}}', creatives).replace('{{SKETCH}}', sketch)
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
    print('index.html:', len(GAMES), 'games,', len(FILMS), 'films')


if __name__ == '__main__':
    build()
