import {
  RenderingEngine,
  Enums,
  init as coreInit,
} from '@cornerstonejs/core';

import {
  init as dicomImageLoaderInit,
  wadouri,
} from '@cornerstonejs/dicom-image-loader';

async function run() {
  await coreInit();

  dicomImageLoaderInit({
    maxWebWorkers: 1,
    useLegacyMetadataProvider : true,
  });

  const content = document.getElementById('content');
  const element = document.createElement('div');

  element.style.width = '700px';
  element.style.height = '700px';

  content.appendChild(element);

  const renderingEngine = new RenderingEngine('myRenderingEngine');

  renderingEngine.enableElement({
    viewportId: 'CT_AXIAL_STACK',
    type: Enums.ViewportType.STACK,
    element,
  });

  const viewport = renderingEngine.getViewport('CT_AXIAL_STACK');
  const input = document.getElementById('dicom');

  input.addEventListener('change', async (event) => {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    const imageId = wadouri.fileManager.add(file);

    try {
      await viewport.setStack([imageId]);
      viewport.render();
    } catch (error) {
      console.error('Failed to load DICOM image:', error);
    }
  });
}

run().catch(console.error);