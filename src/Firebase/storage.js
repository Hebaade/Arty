import { getStorage, ref, uploadBytesResumable, getDownloadURL, deleteObject } from "firebase/storage";
import app from "./firebaseConfig";

export const storage = getStorage(app);

export const uploadImage = (file, path, onProgress) => {
  return new Promise((resolve, reject) => {
    const storageRef = ref(storage, path);
    const uploadTask = uploadBytesResumable(storageRef, file);

    const timeout = setTimeout(() => {
      reject(new Error("Upload timed out after 60 seconds"));
    }, 60000);

    uploadTask.on(
      "state_changed",
      (snapshot) => {
        const percent = Math.round((snapshot.bytesTransferred / snapshot.totalBytes) * 100);
        console.log("Upload progress:", percent + "%");
        if (onProgress) onProgress(percent);
      },
      (error) => {
        clearTimeout(timeout);
        console.error("Upload error:", error);
        reject(error);
      },
      async () => {
        clearTimeout(timeout);
        try {
          const url = await getDownloadURL(uploadTask.snapshot.ref);
          console.log("Upload complete, URL:", url);
          resolve(url);
        } catch (err) {
          console.error("Get URL error:", err);
          reject(err);
        }
      }
    );
  });
};

export const deleteImage = async (url) => {
  const storageRef = ref(storage, url);
  await deleteObject(storageRef);
};