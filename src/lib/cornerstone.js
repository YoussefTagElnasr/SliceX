import { init as coreInit } from '@cornerstonejs/core';
import { init as dicomImageLoaderInit } from '@cornerstonejs/dicom-image-loader';
import {
  init as toolsInit,
  addTool,
  StackScrollTool,
  TrackballRotateTool,
  ZoomTool,
  PanTool,
} from '@cornerstonejs/tools';

// cornerstone is global state: initialise it once for the whole app
export const cornerstoneReady = (async () => {
  await coreInit();
  await toolsInit();
  await dicomImageLoaderInit({
    maxWebWorkers: Math.min(4, navigator.hardwareConcurrency || 1),
    useLegacyMetadataProvider: true,
  });
  [StackScrollTool, TrackballRotateTool, ZoomTool, PanTool].forEach(addTool);
})();
