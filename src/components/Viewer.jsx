import Viewport from './Viewport.jsx';

export default function Viewer({ imageIds, onReset }) {
  return (
    <div className="flex h-screen flex-col bg-ink text-neutral-300">
      <header className="flex items-center justify-between border-b border-edge px-4 py-2 text-sm">
        <span>
          <span className="font-semibold text-accent">SliceX</span>
          <span className="ml-3 text-neutral-500">
            {imageIds.length} image(s) — scroll to change slice
          </span>
        </span>
        <button
          onClick={onReset}
          className="rounded-md bg-accent/15 px-3 py-1 text-accent transition-colors hover:bg-accent/25"
        >
          Open another folder
        </button>
      </header>

      <main className="min-h-0 flex-1 p-2">
        <Viewport imageIds={imageIds} />
      </main>
    </div>
  );
}
