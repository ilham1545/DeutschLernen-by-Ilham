import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Loader2, KeyRound, Eye, EyeOff } from "lucide-react";
import { toast } from "@/hooks/use-toast";

const UpdatePasswordPage = () => {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  
  const { updateProfile } = useAuth(); // Kita pakai fungsi ini karena dia memanggil supabase.auth.updateUser
  const navigate = useNavigate();

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();

    if (password.length < 6) {
        toast({ title: "Error", description: "Password minimal 6 karakter.", variant: "destructive" });
        return;
    }

    if (password !== confirmPassword) {
        toast({ title: "Error", description: "Konfirmasi password tidak cocok.", variant: "destructive" });
        return;
    }

    setLoading(true);
    
    // Panggil fungsi updateProfile dari AuthContext yang sudah ada
    const { error } = await updateProfile({ password: password });
    
    if (!error) {
        toast({ title: "Sukses!", description: "Password berhasil diubah. Silakan login." });
        // Redirect ke login setelah sukses
        setTimeout(() => navigate("/login"), 2000); 
    }
    
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4">
      <Card className="w-full max-w-md border-4 border-foreground shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
        <CardHeader className="text-center pb-2">
          <CardTitle className="text-2xl font-black uppercase">Password Baru</CardTitle>
          <p className="text-slate-500 text-sm">Silakan masukkan password baru Anda.</p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleUpdate} className="space-y-4">
            
            <div className="space-y-2">
              <Label htmlFor="pass" className="font-bold">Password Baru</Label>
              <div className="relative">
                <Input 
                  id="pass" 
                  type={showPassword ? "text" : "password"} 
                  placeholder="******" 
                  required 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="font-bold border-2 border-slate-300 pr-10"
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400">
                    {showPassword ? <EyeOff size={18}/> : <Eye size={18}/>}
                </button>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirm" className="font-bold">Konfirmasi Password</Label>
              <Input 
                id="confirm" 
                type="password" 
                placeholder="******" 
                required 
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="font-bold border-2 border-slate-300"
              />
            </div>

            <Button type="submit" className="w-full font-bold h-12 bg-green-600 hover:bg-green-700 text-white border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] active:translate-y-[4px] active:shadow-none transition-all" disabled={loading}>
              {loading ? <Loader2 className="animate-spin mr-2"/> : <KeyRound className="mr-2 h-5 w-5"/>}
              Simpan Password
            </Button>

          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default UpdatePasswordPage;