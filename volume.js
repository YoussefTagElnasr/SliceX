import {
  init as coreInit,
  RenderingEngine,
  Enums,
  volumeLoader,
  setVolumesForViewports,
  metaData
} from '@cornerstonejs/core';
import { init as dicomImageLoaderInit } from '@cornerstonejs/dicom-image-loader';
import { sortFilesByZPosition } from './helper';
import cornerstoneDICOMImageLoader from '@cornerstonejs/dicom-image-loader';


async function run() {
  await coreInit();
  dicomImageLoaderInit({ maxWebWorkers: 1 ,
    useLegacyMetadataProvider : true,
  });

  const content = document.getElementById('content');
  const input = document.getElementById('dicom');

  const viewportId1 = 'CT_AXIAL';
  const viewportId2 = 'CT_SAGITTAL';
  const renderingEngineId = 'myRenderingEngine';

  // DOM setup
  const viewportGrid = document.createElement('div');
  viewportGrid.style.display = 'flex';
  viewportGrid.style.flexDirection = 'row';

  const element1 = document.createElement('div');
  element1.style.width = '500px';
  element1.style.height = '500px';

  const element2 = document.createElement('div');
  element2.style.width = '500px';
  element2.style.height = '500px';

  viewportGrid.appendChild(element1);
  viewportGrid.appendChild(element2);
  content.appendChild(viewportGrid);

  const renderingEngine = new RenderingEngine(renderingEngineId);

  renderingEngine.setViewports([
    {
      viewportId: viewportId1,
      element: element1,
      type: Enums.ViewportType.ORTHOGRAPHIC,
      defaultOptions: { orientation: Enums.OrientationAxis.AXIAL },
    },
    {
      viewportId: viewportId2,
      element: element2,
      type: Enums.ViewportType.ORTHOGRAPHIC,
      defaultOptions: { orientation: Enums.OrientationAxis.SAGITTAL },
    },
  ]);

    input.addEventListener('change', async (event) => {
    const files = Array.from(event.target.files);

    const sortedFiles = await sortFilesByZPosition(files);

    const imageIds = sortedFiles.map(file => {
        const url = URL.createObjectURL(file);
        return `wadouri:${url}`;
    });

    const volumeId = `myVolume_${Date.now()}`;
    const volume = await volumeLoader.createAndCacheVolume(volumeId, { imageIds });
    await volume.load();

    setVolumesForViewports(renderingEngine, [{ volumeId }], [viewportId1, viewportId2]);
    renderingEngine.renderViewports([viewportId1, viewportId2]);
    });
}

run();