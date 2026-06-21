import {
  init as coreInit,
  RenderingEngine,
  Enums,
  volumeLoader,
  setVolumesForViewports,
} from '@cornerstonejs/core';
import { init as dicomImageLoaderInit } from '@cornerstonejs/dicom-image-loader';
import { exportImageIdsAsWadoUriFromFile,sortFilesByZPosition } from './helper';
import { 
    init as csToolsInit,
    addTool, 
    StackScrollTool, 
    ToolGroupManager ,
    Enums as csToolsEnums,
} from '@cornerstonejs/tools';


async function run() {
  await coreInit();
  await csToolsInit();
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

    addTool(StackScrollTool);
    const toolGroupId = 'myVolumeToolGroup';
    const toolGroup = ToolGroupManager.createToolGroup(toolGroupId);

    toolGroup.addTool(StackScrollTool.toolName);

    toolGroup.addViewport(
        viewportId1,
        renderingEngineId
    );

    toolGroup.addViewport(
        viewportId2,
        renderingEngineId
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

    if (sortedFiles.length === 1){
      imageIds = await exportImageIdsAsWadoUriFromFile(sortedFiles[0]);
    } else {
        sortedFiles.forEach((file) => {
          const objectUrl = URL.createObjectURL(file);
          const imageId = `wadouri:${objectUrl}`;
          imageIds.push(imageId);
        });
    }

    const volumeId = `myVolume_${Date.now()}`;
    const volume = await volumeLoader.createAndCacheVolume(volumeId, { imageIds : imageIds });
    await volume.load();

    setVolumesForViewports(renderingEngine, [{ volumeId }], [viewportId1, viewportId2]);
  });
}

run();