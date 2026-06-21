import dicomParser from 'dicom-parser';
import cornerstoneDICOMImageLoader from '@cornerstonejs/dicom-image-loader';
import { metaData } from '@cornerstonejs/core';

export async function getImageIdsFromFile(file) {
  const baseImageId = cornerstoneDICOMImageLoader.wadouri.fileManager.add(file);

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


export async function exportImageIdsAsWadoUriFromFile(file) {
  const arrayBuffer = await file.arrayBuffer();
  const byteArray = new Uint8Array(arrayBuffer);
  const dataSet = dicomParser.parseDicom(byteArray);

  const numberOfFrames = parseInt(dataSet.string('x00280008') || '1', 10);

  const objectUrl = URL.createObjectURL(file);
  const imageIds = [];

  if (numberOfFrames > 1) {
    for (let i = 0; i < numberOfFrames; i++) {
      imageIds.push(`wadouri:${objectUrl}/frame=${i + 1}/`);
    }
  } else {
    imageIds.push(`wadouri:${objectUrl}`);
  }

  return imageIds;
}


async function prefetchMetadataInformation(imageIdsToPrefetch) {
  for (let i = 0; i < imageIdsToPrefetch.length; i++) {
    await cornerstoneDICOMImageLoader.wadouri.loadImage(imageIdsToPrefetch[i])
      .promise;
  }
}

function getFrameInformation(imageId) {
  if (imageId.includes('wadors:')) {
    const frameIndex = imageId.indexOf('/frames/');
    const imageIdFrameless =
      frameIndex > 0 ? imageId.slice(0, frameIndex + 8) : imageId;
    return {
      frameIndex,
      imageIdFrameless,
    };
  } else {
    const frameIndex = imageId.indexOf('&frame=');
    let imageIdFrameless =
      frameIndex > 0 ? imageId.slice(0, frameIndex + 7) : imageId;
    if (!imageIdFrameless.includes('&frame=')) {
      imageIdFrameless = imageIdFrameless + '&frame=';
    }
    return {
      frameIndex,
      imageIdFrameless,
    };
  }
}


function convertMultiframeImageIds(imageIds) {
  const newImageIds = [];
  imageIds.forEach((imageId) => {
    const { imageIdFrameless } = getFrameInformation(imageId);
    const instanceMetaData = metaData.get('multiframeModule', imageId);
    if (
      instanceMetaData &&
      instanceMetaData.NumberOfFrames &&
      instanceMetaData.NumberOfFrames > 1
    ) {
      const NumberOfFrames = instanceMetaData.NumberOfFrames;
      for (let i = 0; i < NumberOfFrames; i++) {
        const newImageId = imageIdFrameless + (i + 1);
        newImageIds.push(newImageId);
      }
    } else {
      newImageIds.push(imageId);
    }
  });
  return newImageIds;
}

export { convertMultiframeImageIds, prefetchMetadataInformation };