import { useState } from 'react';
import Viewport from './Viewport.jsx';
import Viewport3D from './Viewport3D.jsx';
import { canBuildVolume } from '../lib/helper.js';

export default function Viewer({ imageIds, onReset }) {
  const [mode, setMode] = useState('2d');
  const volumeOk = canBuildVolume(imageIds);
  const showing3d = mode === '3d' && volumeOk;

  return (
    <div className="flex h-screen flex-col bg-ink text-neutral-300">
      <header className="flex items-center justify-between border-b border-edge px-4 py-2 text-sm">
        <span>
          <span className="font-semibold text-accent">SliceX</span>
          <span className="ml-3 text-neutral-500">
            {imageIds.length} image(s) —{' '}
            {showing3d ? 'drag to rotate, right-drag to zoom' : 'scroll to change slice'}
          </span>
        </span>

        <div className="flex items-center gap-2">
          <div className="rounded-md border border-edge p-0.5">
            {['2d', '3d'].map((m) => (
              <button
                key={m}
                onClick={() => setMode(m)}
                disabled={m === '3d' && !volumeOk}
                title={m === '3d' && !volumeOk ? 'Needs a multi-slice single-frame series' : ''}
                className={`rounded px-3 py-0.5 uppercase transition-colors disabled:cursor-not-allowed disabled:opacity-40 ${
                  mode === m ? 'bg-accent/20 text-accent' : 'hover:text-neutral-100'
                }`}
              >
                {m}
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
        {showing3d ? <Viewport3D imageIds={imageIds} /> : <Viewport imageIds={imageIds} />}
      </main>
    </div>
  );
}
