import dicomParser from 'dicom-parser';
import cornerstoneDICOMImageLoader from '@cornerstonejs/dicom-image-loader';

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


export async function prefetchMetadataInformation(imageIdsToPrefetch) {
  for (let i = 0; i < imageIdsToPrefetch.length; i++) {
    await cornerstoneDICOMImageLoader.wadouri.loadImage(imageIdsToPrefetch[i])
      .promise;
  }
}

export async function getDcmModality(file){
  const arrayBuffer = await file.arrayBuffer();
  const byteArray = new Uint8Array(arrayBuffer);
  const dataSet = dicomParser.parseDicom(byteArray);

  const modality = dataSet.string('x00080060');
  return modality
}