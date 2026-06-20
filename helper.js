import dicomParser from 'dicom-parser';

export async function getImageIdsFromFile(file) {
  let numberOfFrames;
  const arrayBuffer = await file.arrayBuffer();
  const byteArray = new Uint8Array(arrayBuffer);

  const dataSet = dicomParser.parseDicom(byteArray);

  const numberOfFramesStr = dataSet.string('x00280008');

  if(numberOfFramesStr){
    numberOfFrames = parseInt(numberOfFramesStr , 10)
  } else {
    numberOfFrames = 1
  }

  console.log('numberOfFrames:', numberOfFrames);

  if (isNaN(numberOfFrames) || numberOfFrames <= 0) {
    console.warn('Invalid numberOfFrames, defaulting to 1');
  }

  const fileUrl = URL.createObjectURL(file);

  const imageIds = [];
  console.log(imageIds);

  if (numberOfFrames === 1) {
    imageIds.push(`wadouri:${fileUrl}`);
  } else {
    for (let i = 0; i < numberOfFrames; i++) {
      imageIds.push(`wadouri:${fileUrl}?frame=${i}`);
    }
  } 

  console.log(imageIds)

  return imageIds;
}