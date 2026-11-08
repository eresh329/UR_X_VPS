# UR X VPS — private hosting panel

Redesigned interface (v4: faster, lighter animations, opening splash, touch feedback): every action has its own full page (no modals, drawers or popups).

Pages: `/` landing · `/login` · `/dashboard` · `/project/new` · `/project/<name>` (overview) ·
`/console` · `/files` · `/packages` · `/settings` · `/delete` · maintenance · error pages.

## Deploy
1. Upload everything (including `static/`) to your Python/Flask host.
2. `pip install -r requirements.txt`
3. Start with the Procfile command.

## Security
Default shared access password is `🖕🏻`🖕🏻 — change `settings.normal_password` in `data.json`
(or set `NORMAL_PASSWORD`) and set a strong `SECRET_KEY` before going public.

## Customising
- Look & animation: `static/css/ux.css` (accent colour comes from `settings.theme_color` in `data.json`)
- SVG icons: `templates/_icons.html`
- Logo: `static/urxvps-logo.jpg`
