import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = "https://wuejyqmrnasvzojhhxxh.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Ind1ZWp5cW1ybmFzdnpvamhoeHhoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQyNTc3ODcsImV4cCI6MjA2OTgzMzc4N30.NSeCZRg1Dxf9-v5BmTGJ1Sp3TCmxMpUmGiFW5CpJYHI";

export const supabaseStorage = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Fonction pour uploader une image de profil
export const uploadProfileImage = async (file: File, userId: string): Promise<string> => {
  try {
    const fileExt = file.name.split('.').pop();
    const fileName = `${userId}-${Math.random().toString(36).substring(2)}.${fileExt}`;
    const filePath = `profile-images/${fileName}`;

    const { error: uploadError } = await supabaseStorage.storage
      .from('azebot')
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false,
      });

    if (uploadError) {
      throw uploadError;
    }

    // Récupérer l'URL publique de l'image
    const { data } = supabaseStorage.storage
      .from('azebot')
      .getPublicUrl(filePath);

    return data.publicUrl;
  } catch (error) {
    console.error('Error uploading image:', error);
    throw error;
  }
};

// Fonction pour supprimer une image de profil
export const deleteProfileImage = async (imageUrl: string): Promise<void> => {
  try {
    // Extraire le chemin du fichier de l'URL
    const urlParts = imageUrl.split('/');
    const fileName = urlParts[urlParts.length - 1];
    const filePath = `profile-images/${fileName}`;

    const { error } = await supabaseStorage.storage
      .from('azebot')
      .remove([filePath]);

    if (error) {
      throw error;
    }
  } catch (error) {
    console.error('Error deleting image:', error);
    throw error;
  }
};
