import dicomParser from 'dicom-parser';

// browser-only module, imported on demand so the metadata helpers below stay
// usable outside the browser (see helper.test.mjs)
const loader = () =>
  import('@cornerstonejs/dicom-image-loader').then((m) => m.default);

async function getImageIdsFromFile(file) {
  const baseImageId = (await loader()).wadouri.fileManager.add(file);

  const arrayBuffer = await file.arrayBuffer();
  const byteArray = new Uint8Array(arrayBuffer);
  const dataSet = dicomParser.parseDicom(byteArray);

  const numberOfFrames = parseInt(dataSet.string('x00280008') || '1', 10);

  if (numberOfFrames <= 1) {
    return [baseImageId]; 
  }

  return Array.from(
    { length: numberOfFrames },
    (_, i) => `${baseImageId}?frame=${i}`
  );
}


export async function sortFilesByZPosition(files) {
  const filesWithZ = await Promise.all(
    files.map(async (file) => {
      try {
        const arrayBuffer = await file.arrayBuffer();
        const byteArray = new Uint8Array(arrayBuffer);
        const dataSet = dicomParser.parseDicom(byteArray);

        const ippStr = dataSet.string('x00200032');
        const z = ippStr ? parseFloat(ippStr.split('\\')[2]) : 0;

        return { file, z };
      } catch {
        return null; // not a DICOM file (DICOMDIR, .DS_Store, ...)
      }
    })
  );

  return filesWithZ
    .filter(Boolean)
    .sort((a, b) => a.z - b.z)
    .map((item) => item.file);
}


/** Folder of files -> imageIds ready for a stack viewport. */
export async function filesToImageIds(files) {
  const sorted = await sortFilesByZPosition(files);

  if (sorted.length === 1) {
    return getImageIdsFromFile(sorted[0]);
  }

  const { wadouri } = await loader();
  return sorted.map((file) => wadouri.fileManager.add(file));
}


/**
 * A volume needs a real geometric stack: several single-frame slices.
 * ponytail: frame-based ids are rejected because wadouri multiframe gives no
 * per-frame position; drop the check once the metadata provider fills IPP in.
 */
export function canBuildVolume(imageIds) {
  return imageIds.length >= 3 && !imageIds.some((id) => id.includes('?frame='));
}
