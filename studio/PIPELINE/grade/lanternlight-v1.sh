#!/bin/bash
# THE LANTERNLIGHT GRADE v1 — the single source of the film stock (founder
# instrument, 2026-07-16; SPEC-SH3 §11.9). Applied identically to every clip
# BEFORE intake; seam checks run on graded output. Grade version is manifest
# metadata; changing this file is an ADR and re-renders the whole library by
# design — determinism is the point.
IN="$1"; OUT="$2"
[ -z "$IN" ] || [ -z "$OUT" ] && { echo "usage: lanternlight-v1.sh <in> <out>"; exit 1; }
ffmpeg -i "$IN" -filter_complex "\
[0:v]split[base][hl];\
[hl]lutyuv=y='if(gt(val,170),val,0)',gblur=sigma=16[bloom];\
[base][bloom]blend=all_mode=screen:all_opacity=0.28,\
curves=master='0/0.05 0.25/0.26 0.5/0.51 1/0.95':red='0/0.015 0.5/0.525 1/1':blue='0/0.0 0.5/0.475 1/0.91',\
hue=s=0.84,noise=alls=11:allf=t+u,vignette=PI/4.8:mode=backward[out]" \
-map "[out]" -c:v libx264 -crf 17 -preset slow -pix_fmt yuv420p "$OUT"
