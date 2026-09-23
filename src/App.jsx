import { useEffect, useRef } from 'react'
import legacyCode from './legacy.js?raw'
const BODY_HTML = "\n<div id=\"authGate\" style=\"position:fixed;inset:0;background:#050505;color:#f4f2ed;display:flex;align-items:center;justify-content:center;padding:20px;z-index:100\">\n<div style=\"width:100%;max-width:390px;background:#141414;border:1px solid #292929;border-radius:24px;padding:24px\">\n<div class=\"logo\" style=\"font-size:22px\">FORGE<span>●</span></div>\n<div class=\"eyebrow\" style=\"margin-top:30px\">WELCOME TO FORGE</div>\n<h1 style=\"font-size:40px;margin-bottom:14px\">Train.<br>Track.<br>Forge.</h1>\n<p id=\"authMessage\" style=\"color:#898780;font-size:12px;line-height:1.5\">Start instantly. No email or password required.</p>\n<button id=\"authSubmit\" onclick=\"startForge()\" style=\"width:100%;border:0;background:#d9ff4a;color:#080808;padding:15px;border-radius:14px;font-weight:950;margin-top:16px\">START FORGE</button>\n<p style=\"color:#666;font-size:10px;line-height:1.5;margin:12px 0 0\">Forge creates a private anonymous account on this device so your data can sync with the cloud.</p>\n</div></div>\n<div class=\"app\" id=\"forgeApp\" style=\"display:none\">\n<header class=\"topbar\"><div class=\"logo\">FORGE<span>●</span></div><div class=\"iconbtn\" title=\"Anonymous account\">●</div></header>\n<main id=\"main\"></main>\n<div class=\"bottom\"><nav class=\"nav\"><button class=\"active\" onclick=\"nav(this,'home')\"><i>⌂</i>Today</button><button onclick=\"nav(this,'profile')\"><i>◉</i>Profile</button><button onclick=\"nav(this,'diet')\"><i>⌁</i>Diet</button><button onclick=\"nav(this,'todo')\"><i>✓</i>Todo</button></nav></div>\n</div>\n<div class=\"sheet-bg\" id=\"sheetBg\"><div class=\"sheet\">\n<div class=\"grab\"></div><div class=\"sheet-head\"><div><div class=\"eyebrow\" id=\"sheetMuscle\"></div><h3 id=\"sheetName\"></h3></div><button class=\"close\" onclick=\"closeSheet()\">×</button></div>\n<div class=\"eyebrow\" style=\"margin-top:22px\">SET WEIGHTS · KG</div>\n<div class=\"inputs\"><label>Set 1<input id=\"i1\" type=\"number\" step=\".5\"></label><label>Set 2<input id=\"i2\" type=\"number\" step=\".5\"></label><label>Set 3<input id=\"i3\" type=\"number\" step=\".5\"></label></div>\n<button class=\"save\" onclick=\"saveExercise()\">SAVE SESSION</button>\n</div></div>\n<div id=\"toast\" style=\"position:fixed;left:50%;bottom:105px;transform:translateX(-50%);background:#fff;color:#111;padding:11px 15px;border-radius:12px;font-size:12px;font-weight:800;display:none;z-index:50\"></div>\n"
export default function App() {
  const initialized = useRef(false)
  useEffect(() => {
    if (initialized.current) return
    initialized.current = true
    const script = document.createElement('script')
    script.textContent = legacyCode
    document.body.appendChild(script)
    if ('serviceWorker' in navigator) window.addEventListener('load', () => navigator.serviceWorker.register(import.meta.env.BASE_URL + 'sw.js').catch(console.error), { once: true })
    return () => script.remove()
  }, [])
  return <div dangerouslySetInnerHTML={{ __html: BODY_HTML }} />
}
