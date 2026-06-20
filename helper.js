import { metaData, Enums } from '@cornerstonejs/core';
import dicomParser from 'dicom-parser';
import cornerstoneDICOMImageLoader from '@cornerstonejs/dicom-image-loader';

export async function getImageIdsFromFile(file) {
  const arrayBuffer = await file.arrayBuffer();
  const byteArray = new Uint8Array(arrayBuffer);
  const dataSet = dicomParser.parseDicom(byteArray);

  const numberOfFramesStr = dataSet.string('x00280008');
  const numberOfFrames = numberOfFramesStr ? parseInt(numberOfFramesStr, 10) : 1;

  if (isNaN(numberOfFrames) || numberOfFrames <= 0) {
    console.warn('Invalid numberOfFrames, defaulting to 1');
  }

  const frameCount = isNaN(numberOfFrames) || numberOfFrames <= 0 ? 1 : numberOfFrames;
  const fileUrl = URL.createObjectURL(file);

  if (frameCount === 1) {
    return [`wadouri:${fileUrl}`];
  }

  return Array.from(
    { length: frameCount },
    (_, i) => `wadouri:${fileUrl}?frame=${i + 1}`
  );
}

export async function sortFilesByZPosition(files) {
  const filesWithZ = await Promise.all(
    files.map(async (file) => {
      const arrayBuffer = await file.arrayBuffer();
      const byteArray = new Uint8Array(arrayBuffer);
      const dataSet = dicomParser.parseDicom(byteArray);

      const ippStr = dataSet.string('x00200032');
      const z = ippStr ? parseFloat(ippStr.split('\\')[2]) : 0;

      return { file, z };
    })
  );

  filesWithZ.sort((a, b) => a.z - b.z);

  return filesWithZ.map((item) => item.file);
}