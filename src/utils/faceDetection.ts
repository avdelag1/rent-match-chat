interface FaceCenter {
  x: number;
  y: number;
}

export const detectFaceCenter = async (image: HTMLImageElement): Promise<FaceCenter | null> => {
  if (!('FaceDetector' in window)) {
    return null;
  }

  try {
    const faceDetector = new (window as any).FaceDetector({
      maxDetectedFaces: 1,
      fastMode: true,
    });

    const faces = await faceDetector.detect(image);

    if (faces && faces.length > 0) {
      const face = faces[0];
      const box = face.boundingBox;

      return {
        x: box.x + box.width / 2,
        y: box.y + box.height / 2,
      };
    }
  } catch (error) {
    console.log('Face detection error:', error);
  }

  return null;
};
