import { useState, useEffect, createContext, useContext, ReactNode } from 'react';
import { User } from 'firebase/auth';
import { auth, db } from '@/integrations/firebase/client';
import { doc, getDoc, setDoc, onSnapshot } from 'firebase/firestore';

interface Profile {
  id: string;
  user_id: string;
  username: string | null;
  avatar_url: string | null;
  full_name: string | null;
  country: string | null;
  phone: string | null;
  interests: string[] | null;
  role: string;
  created_at: Date | null;
}

interface AuthContextType {
  user: User | null;
  profile: Profile | null;
  loading: boolean;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchProfile = async (userId: string) => {
    try {
      const profileRef = doc(db, 'profiles', userId);
      const profileSnap = await getDoc(profileRef);

      if (profileSnap.exists()) {
        setProfile({ id: profileSnap.id, ...profileSnap.data() } as Profile);
        return profileSnap.data() as Profile;
      } else {
        console.log('No such profile!');
        setProfile(null);
        return null;
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
      return null;
    }
  };

  // Créer ou mettre à jour le profil admin si nécessaire
  useEffect(() => {
    const checkAdminProfile = async () => {
      if (user?.email === 'admin@azebot.com') {
        const profile = await fetchProfile(user.uid);
        if (!profile || profile.role !== 'admin') {
          const adminProfileData = {
            id: user.uid,
            user_id: user.uid,
            username: 'admin',
            full_name: 'Administrateur',
            avatar_url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=32&h=32&fit=crop&crop=face',
            country: '',
            phone: '',
            interests: [],
            role: 'admin',
            email: user.email,
            created_at: profile?.created_at || new Date()
          };
          
          await setDoc(doc(db, 'profiles', user.uid), adminProfileData, { merge: true });
          setProfile(adminProfileData);
        }
      }
    };

    if (user) {
      checkAdminProfile();
    }
  }, [user]);

  const refreshProfile = async () => {
    if (user) {
      await fetchProfile(user.uid);
    }
  };

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((firebaseUser) => {
      setUser(firebaseUser);
      if (firebaseUser) {
        fetchProfile(firebaseUser.uid);
      } else {
        setProfile(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const signOut = async () => {
    try {
      await auth.signOut();
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const value = {
    user,
    profile,
    loading,
    signOut,
    refreshProfile,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
      throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
