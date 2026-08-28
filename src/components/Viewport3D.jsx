import { useEffect, useId, useRef, useState } from 'react';
import {
  RenderingEngine,
  Enums,
  CONSTANTS,
  cache,
  imageLoader,
  volumeLoader,
  setVolumesForViewports,
} from '@cornerstonejs/core';
import {
  ToolGroupManager,
  TrackballRotateTool,
  ZoomTool,
  PanTool,
  Enums as csToolsEnums,
} from '@cornerstonejs/tools';
import { cornerstoneReady } from '../lib/cornerstone.js';

const PRESETS = CONSTANTS.VIEWPORT_PRESETS.map((p) => p.name);
const DEFAULT_PRESET = 'CT-AAA';

/** Volume-rendered 3D model of the stack. Drag to rotate, right-drag to zoom. */
export default function Viewport3D({ imageIds }) {
  const elementRef = useRef(null);
  const viewportRef = useRef(null);
  // the preset is the tuning knob: what reads as bone on one scanner is soft
  // tissue on another, so it lives on the viewport and never in React state
  const presetRef = useRef(DEFAULT_PRESET);
  const uid = useId().replace(/\W/g, '');
  const [status, setStatus] = useState('loading');
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!imageIds?.length) return;

    const engineId = `engine3d${uid}`;
    const viewportId = `viewport3d${uid}`;
    const toolGroupId = `tools3d${uid}`;
    const volumeId = `volume3d${uid}`;
    let engine;
    let cancelled = false;

    (async () => {
      await cornerstoneReady;
      if (cancelled) return;

      try {
        engine = new RenderingEngine(engineId);
        engine.enableElement({
          viewportId,
          type: Enums.ViewportType.VOLUME_3D,
          element: elementRef.current,
          defaultOptions: { background: [0, 0, 0] },
        });

        const toolGroup = ToolGroupManager.createToolGroup(toolGroupId);
        [TrackballRotateTool, ZoomTool, PanTool].forEach((t) => toolGroup.addTool(t.toolName));
        toolGroup.addViewport(viewportId, engineId);
        toolGroup.setToolActive(TrackballRotateTool.toolName, {
          bindings: [{ mouseButton: csToolsEnums.MouseBindings.Primary }],
        });
        toolGroup.setToolActive(PanTool.toolName, {
          bindings: [{ mouseButton: csToolsEnums.MouseBindings.Auxiliary }],
        });
        toolGroup.setToolActive(ZoomTool.toolName, {
          bindings: [{ mouseButton: csToolsEnums.MouseBindings.Secondary }],
        });

        // a wadouri file only has metadata once it has been through the image
        // loader, and the volume needs that metadata up front
        let decoded = 0;
        await Promise.all(
          imageIds.map(async (id) => {
            await imageLoader.loadAndCacheImage(id);
            if (!cancelled) setProgress(++decoded / imageIds.length);
          })
        );
        if (cancelled) return;

        const volume = await volumeLoader.createAndCacheVolume(volumeId, { imageIds });
        volume.load(); // streams in the background, the viewport re-renders as it fills
        await setVolumesForViewports(engine, [{ volumeId }], [viewportId]);
        if (cancelled) return;

        const viewport = engine.getViewport(viewportId);
        viewportRef.current = viewport;
        viewport.setProperties({ preset: presetRef.current });
        viewport.render();
        setStatus('ready');
      } catch (err) {
        if (cancelled) return;
        setError(err?.message ?? String(err));
        setStatus('failed');
      }
    })();

    return () => {
      cancelled = true;
      viewportRef.current = null;
      ToolGroupManager.destroyToolGroup(toolGroupId);
      engine?.destroy();
      // a volume is hundreds of MB, the cache will not evict it on its own
      if (cache.getVolumeLoadObject(volumeId)) cache.removeVolumeLoadObject(volumeId);
    };
  }, [imageIds, uid]);

  function applyPreset(name) {
    presetRef.current = name;
    viewportRef.current?.setProperties({ preset: name });
    viewportRef.current?.render();
  }

  return (
    <div className="relative h-full w-full">
      <div
        ref={elementRef}
        className="h-full w-full rounded-lg border border-edge bg-black"
        onContextMenu={(e) => e.preventDefault()}
      />

      <select
        defaultValue={DEFAULT_PRESET}
        onChange={(e) => applyPreset(e.target.value)}
        disabled={status !== 'ready'}
        className="absolute left-3 top-3 rounded-md border border-edge bg-panel/90 px-2 py-1 text-xs text-neutral-300 disabled:opacity-40"
      >
        {PRESETS.map((name) => (
          <option key={name} value={name}>
            {name}
          </option>
        ))}
      </select>

      {status !== 'ready' && (
        <p className="pointer-events-none absolute inset-x-0 top-1/2 text-center text-sm text-neutral-400">
          {status === 'loading'
            ? `Building volume… ${Math.round(progress * 100)}%`
            : `Could not build a volume: ${error}`}
        </p>
      )}
    </div>
  );
}
