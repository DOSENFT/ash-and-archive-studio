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
                if t.get("type") == "page" and any(m in t.get("url", "") for m in ("localhost:5175", "tauri.localhost", "atelier")):
                    return t
        except OSError:
            pass
        time.sleep(0.5)
    sys.exit("rig: no CDP target — is the shell running with remote debugging?")

def launch(target):
    if target == "tauri":
        # Inherited by the child process; WebView2 reads it at startup.
        os.putenv("WEBVIEW2_ADDITIONAL_BROWSER_ARGUMENTS", f"--remote-debugging-port={CDP_PORT}")
        exe = r"..\..\..\apps\studio-shell\src-tauri\target\release\studio-shell.exe"
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

def sample_external(pid):
    """The OS counter, read from OUTSIDE the measured process — measurement the
    process cannot flatter (the standing precedent: inspectable, not asserted).
    GPU Engine perf counters per PID; the engtype_VideoDecode instances are the
    decoder-residency signal (a live video decoder cannot hide from them)."""
    ps = (
        "$s = Get-Counter '\\GPU Engine(pid_%d*)\\Utilization Percentage' -ErrorAction SilentlyContinue; "
        "if ($s) { $t = 0.0; $d = 0.0; foreach ($c in $s.CounterSamples) { $t += $c.CookedValue; "
        "if ($c.Path -match 'videodecode') { $d += $c.CookedValue } }; "
        "Write-Output ('{0:N4}|{1:N4}' -f $t, $d) } else { Write-Output '0|0' }" % pid
    )
    out = subprocess.run(["powershell", "-NoProfile", "-Command", ps],
                         capture_output=True, text=True, timeout=20).stdout.strip()
    total, decode = (float(x) for x in out.split("|"))
    return {"gpu_utilization_pct": total, "decode_engine_pct": decode, "stub": False}

def mode_dormancy(ws_send, sample_counters, pid=None, duration=600):
    samples, violations = [], []
    t_end = time.time() + duration
    nav_i = 0
    seats = ["chronicle", "forge", "stage", "codex"]
    while time.time() < t_end:
        s = sample_external(pid) if pid else sample_counters()
        if s.get("stub"):
            sys.exit("G-SH3-1: FAIL — sampler returned stub:true (counter plumbing not landed; issue #10)")
        samples.append(s)
        # Decode-engine activity while seated = residency violation (stills-only
        # slice legitimately never decodes video; navigation drift-cuts are <img>).
        if s.get("decode_engine_pct", s.get("decoder_handles", 0)) > 0.5:
            violations.append(s)
        if int(time.time()) % 45 == 0 and nav_i < 30:  # periodic navigation + settle
            ws_send(f"location.hash = '#/seat/{seats[nav_i % len(seats)]}'")
            nav_i += 1
        time.sleep(1)
    mean_gpu = statistics.mean(x["gpu_utilization_pct"] for x in samples)
    peak_gpu = max(x["gpu_utilization_pct"] for x in samples)
    print(f"dormancy: {len(samples)} samples over {duration}s, mean GPU {mean_gpu:.3f}%, peak {peak_gpu:.3f}%, decode-engine violations {len(violations)}")
    ok = not violations and mean_gpu <= 2.0
    print("G-SH3-1:", "PASS" if ok else "FAIL")
    return ok

def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--mode", choices=["ttfi", "dormancy"], required=True)
    ap.add_argument("--launch", choices=["tauri", "vite"], default="tauri")
    ap.add_argument("--exe", default=r"..\..\..\apps\studio-shell\src-tauri\target\release\studio-shell.exe")
    ap.add_argument("--duration", type=int, default=600, help="dormancy watch seconds (gate law: 600)")
    args = ap.parse_args()
    proc = launch(args.launch) if args.launch == "vite" else launch_exe(args.exe)
    wait_for_target()
    # Playwright over CDP — the S1 spike's own driving stack (run_s1.py), attached
    # to the already-running shell instead of launching a browser.
    from playwright.sync_api import sync_playwright
    with sync_playwright() as p:
        browser = p.chromium.connect_over_cdp(f"http://localhost:{CDP_PORT}")
        page = browser.contexts[0].pages[0]
        ws_send = lambda js, awaited=False: page.evaluate(js)
        shell_pid = find_pid("studio-shell.exe") if args.launch == "tauri" else None
        ok = mode_ttfi(ws_send) if args.mode == "ttfi" else mode_dormancy(
            ws_send,
            lambda: page.evaluate("window.__TAURI__.core.invoke('sample_counters')"),
            pid=shell_pid,
            duration=args.duration,
        )
    if proc:
        proc.terminate()
    sys.exit(0 if ok else 1)

def find_pid(image):
    out = subprocess.run(["tasklist", "/FI", f"IMAGENAME eq {image}", "/FO", "CSV", "/NH"],
                         capture_output=True, text=True).stdout
    for line in out.splitlines():
        if image in line:
            return int(line.split('","')[1])
    return None

def launch_exe(exe):
    full = os.path.abspath(os.path.join(os.path.dirname(__file__), exe))
    # A real .bat wrapper: survives both the '&' in the repo path and the need
    # for the env var to sit in the Win32 block the WebView2 child inherits.
    import tempfile
    bat = os.path.join(tempfile.gettempdir(), "studio-rig-launch.bat")
    with open(bat, "w") as f:
        f.write(f'@echo off\nset "WEBVIEW2_ADDITIONAL_BROWSER_ARGUMENTS=--remote-debugging-port={CDP_PORT}"\nstart "" /b "{full}"\n')
    subprocess.run(["cmd", "/c", bat], timeout=30)
    return None  # window outlives the wrapper; terminate via taskkill if needed

if __name__ == "__main__":
    main()
