import pydicom

file = pydicom.dcmread("./t2_tse_tra_4mm_512_1800000004191559.dcm")

image_shape = file.pixel_array.shape
print(len(image_shape))
print(file.SOPInstanceUID)

num_frames = file.get("NumberOfFrames")
print(num_frames)
