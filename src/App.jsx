import { useState } from 'react';
import UploadDialog from './UploadDialog.jsx';
import Viewer from './Viewer.jsx';
import { filesToImageIds } from '../helper.js';

export default function App() {
  const [imageIds, setImageIds] = useState(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);

  async function handleFiles(files) {
    setBusy(true);
    setError(null);
    try {
      const ids = await filesToImageIds(files);
      if (ids.length) setImageIds(ids);
      else setError('No readable DICOM files in that folder.');
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  if (imageIds) {
    return <Viewer imageIds={imageIds} onReset={() => setImageIds(null)} />;
  }

  return (
    <div className="h-screen bg-ink">
      <UploadDialog onFiles={handleFiles} busy={busy} error={error} />
    </div>
  );
}
