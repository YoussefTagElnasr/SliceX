import {
  RenderingEngine,
  Enums,
  init as coreInit,
} from '@cornerstonejs/core';

import {
  init as dicomImageLoaderInit,
} from '@cornerstonejs/dicom-image-loader';

import { getImageIdsFromFile } from './helper';

async function run() {
  await coreInit();

  dicomImageLoaderInit({
    maxWebWorkers: 1,
    useLegacyMetadataProvider: true,
  });

  const content = document.getElementById('content');

  const element = document.createElement('div');
  element.style.width = '700px';
  element.style.height = '700px';

  content.appendChild(element);

  const renderingEngine = new RenderingEngine('myRenderingEngine');
  const viewportId = 'CT_AXIAL_STACK';

  renderingEngine.enableElement({
    viewportId,
    type: Enums.ViewportType.STACK,
    element,
  });

  const viewport = renderingEngine.getViewport(viewportId);
  const input = document.getElementById('dicom');

  input.addEventListener('change', async (event) => {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    const imageIds = await getImageIdsFromFile(file);

    if (imageIds.length === 1) {
      await viewport.setStack(imageIds);
    } else {
      await viewport.setStack(imageIds, 10);
    }

    viewport.render();
  });
}

run().catch(console.error);