import { useEffect, useRef } from 'react';

export default function UploadDialog({ onFiles, busy, error }) {
  const dialogRef = useRef(null);

  // native <dialog> gives us the backdrop, centering and focus trap for free
  useEffect(() => {
    dialogRef.current.showModal();
  }, []);

  return (
    <dialog
      ref={dialogRef}
      className="m-auto w-96 rounded-xl border border-edge bg-panel p-6 text-neutral-200 shadow-2xl shadow-accent/10 backdrop:bg-black/80"
      onCancel={(e) => e.preventDefault()}
    >
      <h1 className="text-lg font-semibold text-accent">Open a DICOM study</h1>
      <p className="mt-1 text-sm text-neutral-400">
        Pick the folder that holds the .dcm files.
      </p>

      <label
        className={`mt-5 flex cursor-pointer justify-center rounded-lg border border-dashed border-edge px-6 py-8 text-sm transition-colors hover:border-accent hover:text-accent ${
          busy ? 'pointer-events-none opacity-50' : ''
        }`}
      >
        {busy ? 'Reading files…' : 'Choose folder'}
        <input
          type="file"
          className="hidden"
          disabled={busy}
          webkitdirectory=""
          directory=""
          multiple
          onChange={(e) => onFiles(Array.from(e.target.files))}
        />
      </label>

      {error && <p className="mt-3 text-sm text-red-400">{error}</p>}
    </dialog>
  );
}
