#!/usr/bin/env bash
# LANTERNLIGHT v3 — v2's RGB-safe finishing + the fidelity floor (Bible v2):
# supersampled delivery (any source -> 1920-wide lanczos = crispness), then CAS
# contrast-adaptive sharpening (restores optical detail, no halos), grain last.
IN="$1"; OUT="$2"
[ -z "$IN" ] || [ -z "$OUT" ] && { echo "usage: lanternlight-v3.sh in out"; exit 1; }
ffmpeg -v error -y -i "$IN" -filter_complex "\
[0:v]scale=1920:-2:flags=lanczos,format=gbrp,split[base][hl];\
[hl]lutrgb=r='if(gt(val,190),val,0)':g='if(gt(val,190),val,0)':b='if(gt(val,190),val,0)',gblur=sigma=12[bloom];\
[base][bloom]blend=all_mode=screen:all_opacity=0.12,\
cas=0.45,noise=alls=6:allf=t+u,vignette=PI/5.6:mode=backward,format=yuv420p[v]" \
-map "[v]" -an -c:v libx264 -preset slow -crf 18 -pix_fmt yuv420p \
-g 8 -keyint_min 8 -sc_threshold 0 -movflags +faststart "$OUT"
