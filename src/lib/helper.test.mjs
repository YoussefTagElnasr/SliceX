// npm test — checks sortFilesByZPosition orders by slice position
// and drops files that are not DICOM (DICOMDIR, .DS_Store, ...).
import assert from 'node:assert';
import { sortFilesByZPosition, canBuildVolume } from './helper.js';

const bytes = (s) => [...s].map((c) => c.charCodeAt(0));

/** One explicit-VR little-endian element with a 2-byte length. */
function element(group, el, vr, value) {
  const padded = value.length % 2 ? value + (vr === 'UI' ? '\0' : ' ') : value;
  const out = new Uint8Array(8 + padded.length);
  const view = new DataView(out.buffer);
  view.setUint16(0, group, true);
  view.setUint16(2, el, true);
  out.set(bytes(vr), 4);
  view.setUint16(6, padded.length, true);
  out.set(bytes(padded), 8);
  return out;
}

/** Minimal part-10 DICOM carrying only ImagePositionPatient. */
function dicomWithZ(z) {
  const transferSyntax = element(0x0002, 0x0010, 'UI', '1.2.840.10008.1.2.1');
  const groupLength = element(0x0002, 0x0000, 'UL', '');
  new DataView(groupLength.buffer).setUint16(6, 4, true);
  const groupLengthValue = new Uint8Array(4);
  new DataView(groupLengthValue.buffer).setUint32(0, transferSyntax.length, true);

  const parts = [
    new Uint8Array(128),
    Uint8Array.from(bytes('DICM')),
    groupLength.slice(0, 8),
    groupLengthValue,
    transferSyntax,
    element(0x0020, 0x0032, 'DS', `0\\0\\${z}`),
  ];

  const file = new Uint8Array(parts.reduce((n, p) => n + p.length, 0));
  let at = 0;
  for (const part of parts) {
    file.set(part, at);
    at += part.length;
  }
  return { name: `z${z}.dcm`, arrayBuffer: async () => file.buffer };
}

const junk = { name: '.DS_Store', arrayBuffer: async () => new Uint8Array(64).buffer };

const sorted = await sortFilesByZPosition([dicomWithZ(20), junk, dicomWithZ(-5), dicomWithZ(3)]);
assert.deepEqual(sorted.map((f) => f.name), ['z-5.dcm', 'z3.dcm', 'z20.dcm']);
assert.deepEqual(await sortFilesByZPosition([junk]), []);

// canBuildVolume: only a multi-slice single-frame stack renders in 3D
assert.equal(canBuildVolume(['a', 'b', 'c']), true);
assert.equal(canBuildVolume(['a', 'b']), false);
assert.equal(canBuildVolume(['a?frame=0', 'a?frame=1', 'a?frame=2']), false);

console.log('ok');
