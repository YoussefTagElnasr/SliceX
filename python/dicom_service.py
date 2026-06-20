import pydicom

file = pydicom.dcmread("./0004.dcm")

image_shape = file.pixel_array.shape
print(len(image_shape))
print(file.SOPInstanceUID)

num_frames = file.get("NumberOfFrames")
print(num_frames)
