import { getStorage, ref, uploadBytes, getDownloadURL, deleteObject } from "firebase/storage";
import { auth } from "./client";

// Get Firebase storage instance
const storage = getStorage();

// Fonction pour uploader une image de profil
export const uploadProfileImage = async (file: File, userId: string, folder: string = "profile-images"): Promise<string> => {
  try {
    const fileExt = file.name.split('.').pop();
    const fileName = `${userId}-${Math.random().toString(36).substring(2)}.${fileExt}`;
    const storageRef = ref(storage, `${folder}/${fileName}`);

    // Upload file
    const snapshot = await uploadBytes(storageRef, file);
    
    // Get download URL
    const downloadURL = await getDownloadURL(snapshot.ref);
    return downloadURL;
  } catch (error) {
    console.error('Error uploading image:', error);
    throw error;
  }
};

// Fonction pour supprimer une image de profil
export const deleteProfileImage = async (imageUrl: string): Promise<void> => {
  try {
    // Extract file path from URL
    const urlParts = new URL(imageUrl).pathname.split('/');
    const fileName = urlParts[urlParts.length - 1];
    const fileRef = ref(storage, `profile-images/${fileName}`);

    // Delete file
    await deleteObject(fileRef);
  } catch (error) {
    console.error('Error deleting image:', error);
    throw error;
  }
};
