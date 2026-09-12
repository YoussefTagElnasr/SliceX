import { useEffect, useId, useRef } from 'react';
import { RenderingEngine, Enums } from '@cornerstonejs/core';
import {
  StackScrollTool,
  ToolGroupManager,
  Enums as csToolsEnums,
} from '@cornerstonejs/tools';
import { cornerstoneReady } from '../lib/cornerstone.js';

/** One stack viewport. Owns its rendering engine so it can be dropped anywhere. */
export default function Viewport({ imageIds, onSliceChange }) {
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
      viewport.element.addEventListener(Enums.Events.STACK_NEW_IMAGE, () => {
        onSliceChange?.(viewport.getCurrentImageId());
      });
      await viewport.setStack(imageIds, Math.floor(imageIds.length / 2));
      viewport.render();
    })();

    return () => {
      cancelled = true;
      ToolGroupManager.destroyToolGroup(toolGroupId);
      engine?.destroy();
    };
  }, [imageIds, uid, onSliceChange]);

  return (
    <div
      ref={elementRef}
      className="h-full w-full rounded-lg border border-edge bg-black"
      onContextMenu={(e) => e.preventDefault()}
    />
  );
}
