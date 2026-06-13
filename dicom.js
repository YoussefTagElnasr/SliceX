import { init as coreInit } from '@cornerstonejs/core';
import { init as dicomImageLoaderInit } from '@cornerstonejs/dicom-image-loader';
import { RenderingEngine, Enums } from '@cornerstonejs/core';
import * as cornerstoneDICOMImageLoader from '@cornerstonejs/dicom-image-loader';


await coreInit();
await dicomImageLoaderInit();


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
  const file = event.target.files[0];

  const imageId = cornerstoneDICOMImageLoader.wadouri.fileManager.add(file);

  console.log(imageId);

  await viewport.setStack([imageId] , 0);
  viewport.render();
});