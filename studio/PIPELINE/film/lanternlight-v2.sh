#!/usr/bin/env bash
# LANTERNLIGHT GRADE v2 — finishing, not painting.
# POSTMORTEM (the pink, root-caused): v1 blended the halation bloom in YUV —
# screen-blend pushes U/V above 128, which IS magenta, on every warm source.
# LAW: halation blends in RGB planes (gbrp); no curves, no hue; grain + breath
# of vignette only. Output must keep the source's warm order R >= G >= B.
IN="$1"; OUT="$2"
[ -z "$IN" ] || [ -z "$OUT" ] && { echo "usage: lanternlight-v2.sh in out"; exit 1; }
ffmpeg -v error -y -i "$IN" -filter_complex "\
[0:v]format=gbrp,split[base][hl];\
[hl]lutrgb=r='if(gt(val,190),val,0)':g='if(gt(val,190),val,0)':b='if(gt(val,190),val,0)',gblur=sigma=12[bloom];\
[base][bloom]blend=all_mode=screen:all_opacity=0.14,\
noise=alls=7:allf=t+u,vignette=PI/5.4:mode=backward,format=yuv420p[v]" \
-map "[v]" -an -c:v libx264 -preset slow -crf 20 -pix_fmt yuv420p \
-g 8 -keyint_min 8 -sc_threshold 0 -movflags +faststart "$OUT"
