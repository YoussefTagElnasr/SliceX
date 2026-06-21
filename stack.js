import {
  RenderingEngine,
  Enums,
  init as coreInit,
} from '@cornerstonejs/core';

import cornerstoneDICOMImageLoader, {
  init as dicomImageLoaderInit,
} from '@cornerstonejs/dicom-image-loader';

import { getImageIdsFromFile, sortFilesByZPosition } from './helper';

import { 
  init as cornerstoneToolsInit,
  addTool, 
  StackScrollTool, 
  ToolGroupManager ,
  Enums as csToolsEnums,
} from '@cornerstonejs/tools';

async function run() {
  await coreInit();
  await cornerstoneToolsInit();

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

  
    addTool(StackScrollTool);
    const toolGroupId = 'myVolumeToolGroup';
    const toolGroup = ToolGroupManager.createToolGroup(toolGroupId);

    toolGroup.addTool(StackScrollTool.toolName);

    
    toolGroup.addViewport(
        viewportId,
        'myRenderingEngine'
    );

    toolGroup.setToolActive(StackScrollTool.toolName, {
    bindings: [
        {
        mouseButton: csToolsEnums.MouseBindings.Wheel,
        },
    ],
    });

  input.addEventListener('change', async (event) => {
    let imageIds = [];
    const files = Array.from(event.target.files);
    const sortedFiles = await sortFilesByZPosition(files);

    if(files.length === 1){
        imageIds = await getImageIdsFromFile(sortedFiles[0]);
    }

    sortedFiles.forEach((file) => {
      const imageId = cornerstoneDICOMImageLoader.wadouri.fileManager.add(file);
      imageIds.push(imageId);
    })

    if (imageIds.length === 1) {
      await viewport.setStack(imageIds);
    } else {
      await viewport.setStack(imageIds, 10);
    }

    viewport.render();
  });
}

run().catch(console.error);