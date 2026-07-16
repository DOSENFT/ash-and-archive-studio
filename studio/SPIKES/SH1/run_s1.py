"""SPIKE-SH1-S1 runner — drives the harness in Microsoft Edge (Chromium; the same
engine WebView2 embeds, i.e. the closest available proxy for the Tauri Windows shell).
Real keyboard input via CDP for a subset of trials to validate the synthetic pipeline."""
import json, sys
from pathlib import Path
from playwright.sync_api import sync_playwright

harness = Path(__file__).parent / "spike_s1_driftcut.html"
with sync_playwright() as p:
    b = p.chromium.launch(channel="msedge", headless=False,
                          args=["--force-device-scale-factor=1"])
    page = b.new_page(viewport={"width": 1100, "height": 760})
    page.goto(harness.as_uri())
    report = page.evaluate("runSpike(120)")
    # validation leg: REAL key events (OS-level via CDP) — 20 trials per mode,
    # measuring trigger->keydown-processed on the destination input.
    real = page.evaluate("""async () => {
      const dest=document.getElementById('dest'),overlay=document.getElementById('overlay'),
            roomA=document.getElementById('roomA'),roomB=document.getElementById('roomB');
      window.__real={hard:[],drift:[]};
      window.__arm=(mode)=>{overlay.className='';overlay.style.opacity='0';
        roomB.style.visibility='hidden';roomA.style.visibility='visible';dest.value='';
        return new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(()=>{
          window.__t0=performance.now();
          if(mode==='hard'){roomA.style.visibility='hidden';roomB.style.visibility='visible';}
          else{roomB.style.visibility='visible';roomA.style.visibility='hidden';
               overlay.style.opacity='1';void overlay.offsetWidth;overlay.classList.add('run');}
          dest.focus();
          dest.addEventListener('keydown',()=>{window.__real[mode].push(performance.now()-window.__t0);},{once:true});
          r();})));
      }; return true; }""")
    for mode in ("hard", "drift"):
        for _ in range(20):
            page.evaluate(f"window.__arm('{mode}')")
            page.keyboard.press("k")      # real CDP key event through the input pipeline
            page.wait_for_timeout(30)
    real_stats = page.evaluate("""(()=>{const s=a=>{const x=[...a].sort((p,q)=>p-q);
      return {p50:x[Math.floor(x.length*.5)],p95:x[Math.floor(x.length*.95)]||x[x.length-1]};};
      return {hard:s(window.__real.hard),drift:s(window.__real.drift)};})()""")
    report["realKey"] = real_stats
    b.close()
print(json.dumps(report, indent=1))
d = report["deltas"]
ok = (d["tti_p50"] <= 1.0 and report["structural"]["animationsAfter300ms"] == 0
      and (real_stats["drift"]["p50"] - real_stats["hard"]["p50"]) <= 2.0)
print("SPIKE-SH1-S1", "PASS" if ok else "FAIL")
sys.exit(0 if ok else 1)
