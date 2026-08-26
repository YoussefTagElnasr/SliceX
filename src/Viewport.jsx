import { useEffect, useId, useRef } from 'react';
import { RenderingEngine, Enums, init as coreInit } from '@cornerstonejs/core';
import { init as dicomImageLoaderInit } from '@cornerstonejs/dicom-image-loader';
import {
  init as toolsInit,
  addTool,
  StackScrollTool,
  ToolGroupManager,
  Enums as csToolsEnums,
} from '@cornerstonejs/tools';

// cornerstone is global state: initialise it once for the whole app
const cornerstoneReady = (async () => {
  await coreInit();
  await toolsInit();
  await dicomImageLoaderInit({ maxWebWorkers: 1, useLegacyMetadataProvider: true });
  addTool(StackScrollTool);
})();

/** One stack viewport. Owns its rendering engine so it can be dropped anywhere. */
export default function Viewport({ imageIds }) {
  const elementRef = useRef(null);
  const uid = useId();

  useEffect(() => {
    if (!imageIds?.length) return;

    const engineId = `engine${uid}`;
    const viewportId = `viewport${uid}`;
    const toolGroupId = `tools${uid}`;
    let engine;
    let cancelled = false;

    (async () => {
      await cornerstoneReady;
      if (cancelled) return;

      engine = new RenderingEngine(engineId);
      engine.enableElement({
        viewportId,
        type: Enums.ViewportType.STACK,
        element: elementRef.current,
      });

      const toolGroup = ToolGroupManager.createToolGroup(toolGroupId);
      toolGroup.addTool(StackScrollTool.toolName);
      toolGroup.addViewport(viewportId, engineId);
      toolGroup.setToolActive(StackScrollTool.toolName, {
        bindings: [{ mouseButton: csToolsEnums.MouseBindings.Wheel }],
      });

      const viewport = engine.getViewport(viewportId);
      await viewport.setStack(imageIds, Math.floor(imageIds.length / 2));
      viewport.render();
    })();

    return () => {
      cancelled = true;
      ToolGroupManager.destroyToolGroup(toolGroupId);
      engine?.destroy();
    };
  }, [imageIds, uid]);

  return (
    <div
      ref={elementRef}
      className="h-full w-full rounded-lg border border-edge bg-black"
      onContextMenu={(e) => e.preventDefault()}
    />
  );
}
