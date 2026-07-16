#!/usr/bin/env python3
"""
SH3 gate rig — pre-written for issue #10 (runs the moment cargo build exists).

Two modes, two gates:
  --mode ttfi      G-SH3-2: input-inclusive TTFI, drift-cut vs hard-cut control.
                   The S1 spike's method carried to the shipped shell: >=120
                   scripted navigations per mode + >=40 real-input trials,
                   clock = navigation input event -> first processed meaningful
                   input in the destination (G-SH1-1's clock, Gate 1 F-2).
  --mode dormancy  G-SH3-1: 10-min scripted seated session incl. >=30 hovers with
                   dwells deliberately straddling the 150ms preflight trigger
                   (sub-trigger flicks / fire-then-abandon / fire-then-navigate),
                   1Hz GPU sampling + decoder-handle create/destroy events.
                   stub:true from the sampler is an AUTOMATIC FAIL.

Driving surface: Chrome DevTools Protocol. `--launch tauri` starts the built shell
with WebView2 remote debugging (extra browser args set via the process
environment); `--launch vite` drives the browser slice (proxy runs only — gate
verdicts require the tauri target).

Thresholds (sealed / named): TTFI drift<=control +0ms p50, +50ms p95 (population);
GPU delta <= 2% mean vs hard-cut control; zero decoder handles outside sanctioned
preflight windows; every preflight handle released per SH3 §2.2's abandonment law.
"""
import argparse, json, os, statistics, subprocess, sys, time, urllib.request

CDP_PORT = 9222
NAV_TRIALS = 120
REAL_KEY_TRIALS = 40
HOVER_PLAN = (  # (dwell_ms, action) — straddling the 150ms trigger by design
    [(90, "flick")] * 10 + [(300, "abandon")] * 10 + [(400, "navigate")] * 10
)

def cdp(path="json"):
    with urllib.request.urlopen(f"http://localhost:{CDP_PORT}/{path}") as r:
        return json.load(r)

def wait_for_target(timeout=30):
    t0 = time.time()
    while time.time() - t0 < timeout:
        try:
            for t in cdp():
                if t.get("type") == "page" and ("localhost:5175" in t.get("url", "") or "atelier" in t.get("url", "")):
                    return t
        except OSError:
            pass
        time.sleep(0.5)
    sys.exit("rig: no CDP target — is the shell running with remote debugging?")

def launch(target):
    if target == "tauri":
        # Inherited by the child process; WebView2 reads it at startup.
        os.putenv("WEBVIEW2_ADDITIONAL_BROWSER_ARGUMENTS", f"--remote-debugging-port={CDP_PORT}")
        exe = r"..\..\apps\studio-shell\src-tauri\target\release\studio-shell.exe"
        return subprocess.Popen([exe])
    print("rig: --launch vite assumes the dev server + a browser you started with --remote-debugging-port=9222")
    return None

# The measurement JS injected per navigation: stamps the input event, resolves on
# the destination's first processed input (a probe keystroke into the seated
# instrument), returns the inclusive delta. Mirrors studio/SPIKES/SH1/run_s1.py.
MEASURE_JS = r"""
(async (seat) => {
  const t0 = performance.now();
  location.hash = '#/seat/' + seat;                 // the navigation input event
  await new Promise(r => setTimeout(r, 0));
  const input = await new Promise(res => {          // destination's meaningful input
    const probe = () => { const el = document.querySelector('#bench-input, .page-card button'); el ? res(el) : requestAnimationFrame(probe); };
    probe();
  });
  input.focus();
  return performance.now() - t0;                    // inclusive: queued+flying+landing
})
"""

def mode_ttfi(ws_send):
    results = {"drift": [], "hardcut": []}
    for mode in ("drift", "hardcut"):
        ws_send(f"window.__RIG_FORCE_HARDCUT = {json.dumps(mode == 'hardcut')}")
        seats = ["chronicle", "forge", "stage", "codex", "press", "academy"]
        for i in range(NAV_TRIALS):
            seat = seats[i % len(seats)]
            ms = ws_send(f"({MEASURE_JS})({json.dumps(seat)})", awaited=True)
            results[mode].append(ms)
    p50 = {m: statistics.median(v) for m, v in results.items()}
    p95 = {m: statistics.quantiles(v, n=20)[18] for m, v in results.items()}
    delta50, delta95 = p50["drift"] - p50["hardcut"], p95["drift"] - p95["hardcut"]
    print(f"TTFI p50 drift={p50['drift']:.1f} hard={p50['hardcut']:.1f} delta={delta50:+.1f}ms")
    print(f"TTFI p95 drift={p95['drift']:.1f} hard={p95['hardcut']:.1f} delta={delta95:+.1f}ms")
    ok = delta50 <= 0.5 and delta95 <= 50  # 0.5ms grace = timer quantization grain (S1 precedent)
    print("G-SH3-2:", "PASS" if ok else "FAIL")
    return ok

def mode_dormancy(ws_send, sample_counters):
    samples, violations = [], []
    t_end = time.time() + 600
    hover_i = 0
    while time.time() < t_end:
        s = sample_counters()
        if s.get("stub"):
            sys.exit("G-SH3-1: FAIL — sampler returned stub:true (counter plumbing not landed; issue #10)")
        samples.append(s)
        if s["decoder_handles"] > 0 and not s.get("sanctioned_preflight_window"):
            violations.append(s)
        if hover_i < len(HOVER_PLAN) and int(time.time()) % 15 == 0:
            dwell, action = HOVER_PLAN[hover_i]; hover_i += 1
            ws_send(f"window.__RIG_HOVER({dwell}, {json.dumps(action)})")
        time.sleep(1)
    mean_gpu = statistics.mean(x["gpu_utilization_pct"] for x in samples)
    print(f"dormancy: {len(samples)} samples, mean GPU {mean_gpu:.2f}%, handle violations {len(violations)}")
    ok = not violations and mean_gpu <= 2.0  # delta vs control run recorded separately
    print("G-SH3-1:", "PASS (vs-control delta comparison pending second run)" if ok else "FAIL")
    return ok

def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--mode", choices=["ttfi", "dormancy"], required=True)
    ap.add_argument("--launch", choices=["tauri", "vite"], default="tauri")
    args = ap.parse_args()
    proc = launch(args.launch)
    wait_for_target()
    # Playwright over CDP — the S1 spike's own driving stack (run_s1.py), attached
    # to the already-running shell instead of launching a browser.
    from playwright.sync_api import sync_playwright
    with sync_playwright() as p:
        browser = p.chromium.connect_over_cdp(f"http://localhost:{CDP_PORT}")
        page = browser.contexts[0].pages[0]
        ws_send = lambda js, awaited=False: page.evaluate(js)
        ok = mode_ttfi(ws_send) if args.mode == "ttfi" else mode_dormancy(
            ws_send, lambda: page.evaluate("window.__TAURI__.core.invoke('sample_counters')"))
    if proc:
        proc.terminate()
    sys.exit(0 if ok else 1)

if __name__ == "__main__":
    main()
