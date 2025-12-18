import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { supabase } from "@/lib/supabase";
import { User, Session } from "@supabase/supabase-js";
import { toast } from "@/hooks/use-toast";

interface AuthContextType {
  session: Session | null;
  user: User | null;
  signIn: (identifier: string, password: string) => Promise<{ error: any }>;
  signUp: (email: string, password: string, username: string, fullName: string) => Promise<{ error: any }>;
  signOut: () => Promise<void>;
  updateProfile: (data: { fullName?: string; username?: string; avatarUrl?: string; targetLevel?: string; password?: string }) => Promise<{ error: any }>;
  deleteAccount: () => Promise<{ error: any }>;
  resetPassword: (email: string) => Promise<{ error: any }>;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Helper Translate Error
  const translateError = (message: string) => {
    const msg = message.toLowerCase();
    if (msg.includes("invalid login credentials")) return "Email atau Password salah.";
    if (msg.includes("user not found")) return "Akun tidak ditemukan.";
    if (msg.includes("already registered")) return "Email sudah terdaftar.";
    if (msg.includes("unique constraint")) return "Username atau Email sudah dipakai.";
    if (msg.includes("password should be at least")) return "Password minimal 6 karakter.";
    return "Terjadi kesalahan sistem: " + msg;
  };

  useEffect(() => {
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    };

    checkSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  // --- 1. SIGN IN ---
  const signIn = async (identifier: string, password: string) => {
    setLoading(true);
    let emailToLogin = identifier;

    const isEmail = identifier.includes("@");

    if (!isEmail) {
      const { data, error } = await supabase
        .from("profiles")
        .select("email")
        .eq("username", identifier)
        .single();

      if (error || !data) {
        setLoading(false);
        toast({ title: "Gagal Login", description: "Username tidak ditemukan.", variant: "destructive" });
        return { error: { message: "User not found" } };
      }
      emailToLogin = data.email;
    }

    const { error } = await supabase.auth.signInWithPassword({
      email: emailToLogin,
      password,
    });

    if (error) toast({ title: "Gagal Masuk", description: translateError(error.message), variant: "destructive" });
    else toast({ title: "Berhasil!", description: "Selamat datang kembali." });
    
    setLoading(false);
    return { error };
  };

  // --- 2. SIGN UP (DIPERBAIKI: PAKE TRIGGER OTOMATIS) ---
  const signUp = async (email: string, password: string, username: string, fullName: string) => {
    setLoading(true);

    // A. Cek Username (Manual Check - Tetap Perlu)
    const { data: existingUser } = await supabase
      .from("profiles")
      .select("username")
      .eq("username", username)
      .maybeSingle();

    if (existingUser) {
      setLoading(false);
      toast({ title: "Gagal Daftar", description: "Username sudah dipakai.", variant: "destructive" });
      return { error: { message: "Username taken" } };
    }

    // B. Cek Email Manual
    const { data: existingEmail } = await supabase
        .from("profiles")
        .select("email")
        .eq("email", email)
        .maybeSingle();

    if (existingEmail) {
        setLoading(false);
        toast({ title: "Gagal Daftar", description: "Email sudah terdaftar.", variant: "destructive" });
        return { error: { message: "Email taken" } };
    }

    // C. Daftar Auth (Kirim Data via MetaData)
    // Trigger di database akan menangkap data ini dan memasukkannya ke tabel 'profiles' otomatis.
    // Jadi kita TIDAK PERLU insert manual lagi (yang bikin error RLS).
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
          username: username,
          avatar_url: `https://api.dicebear.com/7.x/notionists/svg?seed=${username}`,
          target_level: "A1"
        }
      }
    });

    if (error) {
      toast({ title: "Gagal Daftar", description: translateError(error.message), variant: "destructive" });
      setLoading(false);
      return { error };
    }

    // Cek jika email sudah terdaftar di sistem Auth tapi tidak di profile
    if (data.user && data.user.identities && data.user.identities.length === 0) {
        setLoading(false);
        toast({ title: "Gagal Daftar", description: "Email ini sudah terdaftar sebelumnya.", variant: "destructive" });
        return { error: { message: "Email exists" } };
    }

    toast({ title: "Pendaftaran Berhasil!", description: "Akun telah dibuat. Silakan login." });
    setLoading(false);
    return { error: null };
  };

  // --- 3. SIGN OUT ---
  const signOut = async () => {
    await supabase.auth.signOut();
    toast({ title: "Keluar", description: "Anda telah logout." });
  };

  // --- 4. UPDATE PROFILE ---
  const updateProfile = async (data: { fullName?: string; username?: string; avatarUrl?: string; targetLevel?: string; password?: string }) => {
    setLoading(true);
    
    const updates: any = { data: {} };
    if (data.fullName) updates.data.full_name = data.fullName;
    if (data.avatarUrl) updates.data.avatar_url = data.avatarUrl;
    if (data.targetLevel) updates.data.target_level = data.targetLevel;
    if (data.username) updates.data.username = data.username;
    if (data.password) updates.password = data.password;

    const { data: { user: updatedUser }, error } = await supabase.auth.updateUser(updates);

    if (error) {
        toast({ title: "Gagal Update", description: error.message, variant: "destructive" });
        setLoading(false);
        return { error };
    }

    if (updatedUser) {
        const profileUpdates: any = {};
        if (data.fullName) profileUpdates.full_name = data.fullName;
        if (data.username) profileUpdates.username = data.username;

        const { error: dbError } = await supabase
            .from("profiles")
            .update(profileUpdates)
            .eq("id", updatedUser.id);

        if (dbError) {
            toast({ title: "Gagal Update Data", description: "Username mungkin sudah dipakai.", variant: "destructive" });
            setLoading(false);
            return { error: dbError };
        }
    }

    setUser(updatedUser);
    toast({ title: "Profil Diperbarui!", description: "Data berhasil disimpan." });
    setLoading(false);
    return { error: null };
  };

  // --- 5. DELETE ACCOUNT ---
  const deleteAccount = async () => {
    setLoading(true);
    const { error } = await supabase.rpc('delete_own_account');

    if (error) {
      toast({ title: "Gagal Hapus Akun", description: error.message, variant: "destructive" });
    } else {
      setSession(null);
      setUser(null);
      toast({ title: "Akun Dihapus", description: "Data Anda telah dihapus permanen." });
    }
    
    setLoading(false);
    return { error };
  };

  // --- 6. RESET PASSWORD ---
  const resetPassword = async (email: string) => {
    const SITE_URL = "https://mein-weg.vercel.app";
    setLoading(true);
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: '${SITE_URL}/update-password',
    });

    if (error) {
        toast({ title: "Gagal Kirim Email", description: error.message, variant: "destructive" });
    } else {
        toast({ title: "Cek Email!", description: "Link reset password telah dikirim ke inbox kamu." });
    }
    setLoading(false);
    return { error };
  };

  return (
    <AuthContext.Provider value={{ 
        session, user, signIn, signUp, signOut, updateProfile, deleteAccount, resetPassword, loading 
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) throw new Error("useAuth must be used within an AuthProvider");
  return context;
};