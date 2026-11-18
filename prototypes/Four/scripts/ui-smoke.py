"""UI smoke test: python3 scripts/ui-smoke.py <tag> [base_url]
Drives the built app in headless Chromium, records console errors, a DOM fingerprint per step
(visible control titles + normalised text) and screenshots to /tmp/ui-<tag>/."""
import json, re, sys, os, time
from playwright.sync_api import sync_playwright

tag = sys.argv[1]; base = sys.argv[2] if len(sys.argv) > 2 else 'http://127.0.0.1:4173'
out = f'/tmp/ui-{tag}'; os.makedirs(out, exist_ok=True)
errors, steps = [], {}

def fingerprint(pg):
    return pg.evaluate("""() => {
      const vis = e => { const r = e.getBoundingClientRect(); const s = getComputedStyle(e);
        return r.width > 0 && r.height > 0 && s.visibility !== 'hidden' && s.display !== 'none'; };
      const controls = [...document.querySelectorAll('button,input,select,a,[role=button]')].filter(vis)
        .map(e => (e.getAttribute('title') || e.getAttribute('aria-label') || e.placeholder || e.innerText || e.tagName).trim().replace(/\\d+/g,'#').slice(0,60));
      const text = document.body.innerText.replace(/\\d+/g,'#').replace(/\\s+/g,' ').slice(0,1500);
      const c = document.querySelector('canvas');
      return { controls: controls.sort(), text, canvas: c ? [c.width > 0, c.height > 0] : null };
    }""")

def canvas_painted(pg):
    # fraction of distinct colours sampled from the screenshot of the canvas element
    from PIL import Image; import io
    el = pg.query_selector('canvas')
    if not el: return 0
    img = Image.open(io.BytesIO(el.screenshot())).convert('RGB').resize((64, 36))
    return len(set(img.get_flattened_data() if hasattr(img, "get_flattened_data") else img.getdata()))

with sync_playwright() as p:
    b = p.chromium.launch(args=['--use-gl=swiftshader', '--enable-unsafe-swiftshader'])
    pg = b.new_page(viewport={'width': 1280, 'height': 720})
    pg.on('console', lambda m: errors.append(f'console.{m.type}: {m.text[:200]}') if m.type in ('error',) else None)
    pg.on('pageerror', lambda e: errors.append(f'pageerror: {str(e)[:200]}'))
    pg.goto(base + '/#seed=smoke-test'); pg.wait_for_selector('canvas', timeout=30000)
    pg.wait_for_timeout(2500)

    def step(name, action=None, wait=500):
        if action: action()
        pg.wait_for_timeout(wait)
        steps[name] = fingerprint(pg); steps[name]['colours'] = canvas_painted(pg)
        pg.screenshot(path=f'{out}/{name}.png')

    step('01_running')
    step('02_paused', lambda: pg.keyboard.press('Space'))
    step('03_resumed', lambda: pg.keyboard.press('Space'))
    step('04_map_open', lambda: pg.keyboard.press('m'))
    step('05_map_closed', lambda: pg.keyboard.press('m'))
    step('06_debug_open', lambda: pg.keyboard.press('d'))
    step('07_debug_closed', lambda: pg.keyboard.press('d'))
    step('08_camera_toggle', lambda: pg.click('button[title="Cambiar enfoque de cámara"]'))
    step('09_next_marble', lambda: pg.click('button[title^="Siguiente canica"]'))
    step('10_power_1', lambda: pg.keyboard.press('1'))
    # let the race finish on its own -> post-race results modal
    pg.wait_for_selector('text=Nueva Partida', timeout=90000)
    step('11_results_modal', None, wait=800)
    step('12_replay', lambda: pg.click('text=Ver Highlights'), wait=2500)
    try:
        step('13_replay_stopped', lambda: pg.click('text=Clic para saltar'), wait=800)
    except Exception as e:
        errors.append(f'step13: {str(e)[:120]}')
    step('14_keep_watching', lambda: pg.click('text=Seguir Viendo') if pg.query_selector('text=Seguir Viendo') else None)
    step('15_restart', lambda: pg.click('text=Iniciar Supervivencia'), wait=2500)
    step('16_two_zombies', lambda: pg.click('text=2 Zombis'), wait=2500)
    step('17_seed_random', lambda: pg.click('button[title="Semilla aleatoria"]'), wait=2000)
    step('18_daily_seed', lambda: pg.click('button[title^="Cargar el laberinto oficial"]'), wait=2000)
    b.close()

json.dump({'errors': errors, 'steps': steps}, open(f'{out}/summary.json', 'w'), indent=1)
print(f'[{tag}] console/page errors: {len(errors)}'); [print('  ', e) for e in errors[:8]]
for k, v in steps.items():
    print(f"  {k:18s} controls={len(v['controls']):3d} canvas_colours={v['colours']:4d}")
