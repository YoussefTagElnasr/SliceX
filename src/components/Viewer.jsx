import { useState } from 'react';
import Viewport from './Viewport.jsx';
import Viewport3D from './Viewport3D.jsx';
import ViewportHybrid from './ViewportHybrid.jsx';
import { canBuildVolume } from '../lib/helper.js';

const MODES = {
  '2d': { label: '2D', hint: 'scroll to change slice' },
  '3d': { label: '3D', hint: 'drag to rotate, use wheel to zoom' },
  'reference': { label: 'Reference Slice Viewer', hint: 'scroll the slice, the plane follows in 3D' },
};

export default function Viewer({ imageIds, onReset }) {
  const [mode, setMode] = useState('2d');
  const volumeOk = canBuildVolume(imageIds);
  const showing = volumeOk ? mode : '2d';

  return (
    <div className="flex h-screen flex-col bg-ink text-neutral-300">
      <header className="flex items-center justify-between border-b border-edge px-4 py-4 text-sm">
        <span>
          <span className="font-semibold text-accent">SliceX</span>
          <span className="ml-3 text-neutral-500">
            {imageIds.length} image(s) —{' '}
            {MODES[showing].hint}
          </span>
        </span>

        <div className="flex items-center gap-2">
          <div className="rounded-md border border-edge p-0.5">
            {Object.keys(MODES).map((m) => (
              <button
                key={m}
                onClick={() => setMode(m)}
                disabled={m !== '2d' && !volumeOk}
                title={m !== '2d' && !volumeOk ? 'Needs a multi-slice single-frame series' : ''}
                className={`rounded px-3 py-0.5 transition-colors disabled:cursor-not-allowed disabled:opacity-40 ${
                  mode === m ? 'bg-accent/20 text-accent' : 'hover:text-neutral-100'
                }`}
              >
                {MODES[m].label}
              </button>
            ))}
          </div>

          <button
            onClick={onReset}
            className="rounded-md bg-accent/15 px-3 py-1 text-accent transition-colors hover:bg-accent/25"
          >
            Open another folder
          </button>
        </div>
      </header>

      <main className="min-h-0 flex-1 p-2">
        {showing === '3d' && <Viewport3D imageIds={imageIds} />}
        {showing === 'reference' && <ViewportHybrid imageIds={imageIds} />}
        {showing === '2d' && <Viewport imageIds={imageIds} />}
      </main>
    </div>
  );
}
