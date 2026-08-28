using vite and cornerstone3d

## Sample studies

`sample-data/` is gitignored (30 MB). Refetch it with:

```sh
BASE=https://raw.githubusercontent.com/neurolabusc/dcm_qa_ct/master/In
mkdir -p sample-data/ct-brain-philips sample-data/ct-tilted-ge
for i in $(seq 1 28); do
  curl -sfL -o sample-data/ct-brain-philips/I$((i*10)).dcm "$BASE/Philips/S21570/S2010/I$((i*10))"
done
for i in $(seq -w 1 28); do
  curl -sfL -O --output-dir sample-data/ct-tilted-ge "$BASE/GE/$i.dcm"
done
```

- **ct-brain-philips** — 28-slice brain CT, uniform 5 mm spacing. The one to test
  3D with: `CT-Bone` should give you a skull.
- **ct-tilted-ge** — same scan region, but gantry-tilted with spacing that jumps
  4 mm → 1 mm → 7 mm. Renders, but the volume is geometrically wrong: cornerstone
  averages the spacing for `wadouri` ids instead of honouring per-slice positions.
