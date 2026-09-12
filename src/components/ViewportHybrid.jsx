import { useState } from 'react';
import Viewport from './Viewport.jsx';
import Viewport3D from './Viewport3D.jsx';

/** 2D stack beside the 3D volume; the current slice is drawn as a plane in 3D. */
export default function ViewportHybrid({ imageIds }) {
  const [sliceImageId, setSliceImageId] = useState(null);

  return (
    <div className="grid h-full w-full grid-cols-2 gap-2">
      <Viewport imageIds={imageIds} onSliceChange={setSliceImageId} />
      <Viewport3D imageIds={imageIds} sliceImageId={sliceImageId} />
    </div>
  );
}
