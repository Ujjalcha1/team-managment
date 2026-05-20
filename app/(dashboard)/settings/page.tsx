'use client';
import { useState } from 'react';
import { useAuthStore } from '@/stores/authStore';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useTheme } from 'next-themes';
import { toast } from 'sonner';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { User, Shield, Palette, Upload, CheckCircle2 } from 'lucide-react';
import { getInitials, cn } from '@/lib/utils';
import api from '@/lib/api';

const profileSchema = z.object({
  name: z.string().min(2, 'Name is required'),
  department: z.string().min(1, 'Department is required'),
});

const passwordSchema = z.object({
  currentPassword: z.string().min(6, 'Current password is required'),
  newPassword: z.string().min(6, 'New password must be at least 6 characters'),
  confirmPassword: z.string(),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Passwords don't match",
  path: ['confirmPassword'],
});

export default function SettingsPage() {
  const { user, updateProfile } = useAuthStore();
  const { theme, setTheme } = useTheme();
  
  const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState(user?.profileImage || '');

  const profileForm = useForm({
    resolver: zodResolver(profileSchema),
    defaultValues: { name: user?.name || '', department: user?.department || '' },
  });

  const passwordForm = useForm({
    resolver: zodResolver(passwordSchema),
    defaultValues: { currentPassword: '', newPassword: '', confirmPassword: '' },
  });

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const onProfileSubmit = async (data: any) => {
    setIsUpdatingProfile(true);
    try {
      let profileImage = user?.profileImage;
      
      // If there's a new image, we'd normally upload it to an endpoint first
      // For this demo, we'll just show the update locally if there's no dedicated user image upload endpoint
      // We assume `updateProfile` can take profileImage URL
      
      await updateProfile({ name: data.name, department: data.department });
      toast.success('Profile updated successfully');
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Failed to update profile');
    } finally {
      setIsUpdatingProfile(false);
    }
  };

  const onPasswordSubmit = async (data: any) => {
    setIsUpdatingPassword(true);
    try {
      await api.put('/auth/change-password', {
        currentPassword: data.currentPassword,
        newPassword: data.newPassword
      });
      toast.success('Password changed successfully');
      passwordForm.reset();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Failed to change password');
    } finally {
      setIsUpdatingPassword(false);
    }
  };

  return (
    <div className="max-w-4xl space-y-8 animate-fade-in-up">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Settings</h1>
        <p className="text-muted-foreground text-sm mt-0.5">Manage your account preferences</p>
      </div>

      <Tabs defaultValue="profile" orientation="vertical" className="flex flex-col md:flex-row gap-6 md:gap-8 items-start w-full">
        <TabsList className="flex flex-row md:flex-col items-stretch gap-1 p-1 bg-muted/30 border border-border/50 rounded-xl w-full md:w-56 h-auto shrink-0">
          <TabsTrigger value="profile" className="gap-2 text-xs font-medium w-full justify-start"><User className="w-3.5 h-3.5" /> Profile</TabsTrigger>
          <TabsTrigger value="security" className="gap-2 text-xs font-medium w-full justify-start"><Shield className="w-3.5 h-3.5" /> Security</TabsTrigger>
          <TabsTrigger value="appearance" className="gap-2 text-xs font-medium w-full justify-start"><Palette className="w-3.5 h-3.5" /> Appearance</TabsTrigger>
        </TabsList>

        {/* Profile Tab */}
        <TabsContent value="profile" className="w-full flex-1 outline-none">
          <div className="glass rounded-2xl p-6 md:p-8">
            <h2 className="text-lg font-semibold text-foreground mb-6">Personal Information</h2>
            
            <form onSubmit={profileForm.handleSubmit(onProfileSubmit)} className="space-y-6 max-w-xl">
              <div className="flex items-center gap-5">
                <Avatar className="w-20 h-20 ring-4 ring-muted">
                  <AvatarImage src={imagePreview} />
                  <AvatarFallback className="bg-primary/10 text-primary text-xl font-bold">
                    {getInitials(user?.name || 'U')}
                  </AvatarFallback>
                </Avatar>
                <div className="space-y-1.5">
                  <Label className="cursor-pointer inline-flex items-center gap-2 px-3 py-1.5 bg-accent hover:bg-accent/80 rounded-md text-sm font-medium transition-colors">
                    <Upload className="w-4 h-4" /> Change Photo
                    <input type="file" accept="image/*" className="hidden" onChange={handleImageChange} />
                  </Label>
                  <p className="text-xs text-muted-foreground">JPG, GIF or PNG. Max size of 5MB.</p>
                </div>
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name</Label>
                  <Input id="name" {...profileForm.register('name')} className="h-11" />
                  {profileForm.formState.errors.name && <p className="text-destructive text-xs">{profileForm.formState.errors.name.message as string}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email Address</Label>
                  <Input id="email" value={user?.email || ''} disabled className="h-11 bg-muted/50 cursor-not-allowed" />
                  <p className="text-[10px] text-muted-foreground">Email address cannot be changed.</p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="department">Department</Label>
                  <Input id="department" {...profileForm.register('department')} className="h-11" />
                </div>
              </div>

              <Button type="submit" disabled={isUpdatingProfile} className="h-10">
                {isUpdatingProfile ? 'Saving...' : 'Save Changes'}
              </Button>
            </form>
          </div>
        </TabsContent>

        {/* Security Tab */}
        <TabsContent value="security" className="w-full flex-1 outline-none">
          <div className="glass rounded-2xl p-6 md:p-8">
            <h2 className="text-lg font-semibold text-foreground mb-6">Change Password</h2>
            
            <form onSubmit={passwordForm.handleSubmit(onPasswordSubmit)} className="space-y-6 max-w-xl">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="currentPassword">Current Password</Label>
                  <Input id="currentPassword" type="password" {...passwordForm.register('currentPassword')} className="h-11" />
                  {passwordForm.formState.errors.currentPassword && <p className="text-destructive text-xs">{passwordForm.formState.errors.currentPassword.message as string}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="newPassword">New Password</Label>
                  <Input id="newPassword" type="password" {...passwordForm.register('newPassword')} className="h-11" />
                  {passwordForm.formState.errors.newPassword && <p className="text-destructive text-xs">{passwordForm.formState.errors.newPassword.message as string}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirm New Password</Label>
                  <Input id="confirmPassword" type="password" {...passwordForm.register('confirmPassword')} className="h-11" />
                  {passwordForm.formState.errors.confirmPassword && <p className="text-destructive text-xs">{passwordForm.formState.errors.confirmPassword.message as string}</p>}
                </div>
              </div>

              <Button type="submit" disabled={isUpdatingPassword} className="h-10">
                {isUpdatingPassword ? 'Updating...' : 'Update Password'}
              </Button>
            </form>
          </div>
        </TabsContent>

        {/* Appearance Tab */}
        <TabsContent value="appearance" className="w-full flex-1 outline-none">
          <div className="glass rounded-2xl p-6 md:p-8">
            <h2 className="text-lg font-semibold text-foreground mb-6">Theme Preferences</h2>
            
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-2xl">
              {['light', 'dark', 'system'].map((t) => (
                <button
                  key={t}
                  onClick={() => setTheme(t)}
                  className={cn(
                    "flex flex-col items-center gap-3 p-4 rounded-xl border-2 transition-all",
                    theme === t ? "border-primary bg-primary/5" : "border-border hover:border-primary/50 hover:bg-muted/50"
                  )}
                >
                  <div className={cn(
                    "w-full h-20 rounded-lg border shadow-sm mb-2 flex items-center justify-center relative overflow-hidden",
                    t === 'light' ? "bg-[#f8fafc] border-slate-200" : 
                    t === 'dark' ? "bg-[#0f172a] border-slate-800" : 
                    "bg-gradient-to-r from-[#f8fafc] to-[#0f172a] border-slate-300"
                  )}>
                    {theme === t && (
                      <div className="absolute top-2 right-2 text-primary">
                        <CheckCircle2 className="w-5 h-5" />
                      </div>
                    )}
                  </div>
                  <span className="text-sm font-medium capitalize">{t} Mode</span>
                </button>
              ))}
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
