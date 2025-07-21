
"use client";

import { useState, useRef } from 'react';
import { useAuth } from '@/context/auth-context';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Camera, ChevronRight } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { db, updateDoc } from '@/lib/firebase';
import { doc } from 'firebase/firestore';
import { LoadingOverlay } from '@/components/ui/loading-overlay';
import imageCompression from 'browser-image-compression';
import { type SettingsPage } from '@/components/settings-container';


const ProfileInfoItem = ({ label, value, isEditable = false, onClick }: { label: string, value: string, isEditable?: boolean, onClick?: () => void }) => {
    const content = (
        <div 
            className="flex items-center justify-between py-4 hover:bg-muted/50 transition-colors -mx-4 px-4 rounded-lg"
            onClick={onClick}
            style={{ cursor: isEditable ? 'pointer' : 'default' }}
        >
            <div>
                <p className="text-muted-foreground">{label}</p>
                <p className="text-lg">{value}</p>
            </div>
            {isEditable && <ChevronRight className="w-5 h-5 text-muted-foreground" />}
        </div>
    );

    return content;
};


export default function ProfilePage({ setPage }: { setPage?: (page: SettingsPage) => void }) {
    const { user, userData, refreshUserData } = useAuth();
    const { toast } = useToast();
    
    const [isLoading, setIsLoading] = useState(false);
    const avatarInputRef = useRef<HTMLInputElement>(null);

    const handleNavigation = (page: SettingsPage) => {
        if (setPage) {
            setPage(page);
        }
    };

    const getInitials = (email: string | null | undefined) => {
        if (!email) return 'U';
        return email.charAt(0).toUpperCase();
    }
    
    const getDisplayUsername = () => {
        if (!userData) return '';
        const { username, firstName } = userData;
        if (username) {
            return username.startsWith('@') ? username : `@${username}`;
        }
        return `@${firstName?.toLowerCase() || 'user'}`;
    }

    const handleProfileStatusChange = async (checked: boolean) => {
        if (!user) return;
        setIsLoading(true);
        try {
            const userDocRef = doc(db, 'users', user.uid);
            await updateDoc(userDocRef, { profileStatus: checked });
            await refreshUserData();
            toast({ title: "Profile Status Updated" });
        } catch (error: any) {
            toast({ variant: 'destructive', title: "Update Failed", description: error.message });
        } finally {
            setIsLoading(false);
        }
    };

    const handleAvatarChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file || !user) return;

        setIsLoading(true);

        try {
            const options = {
              maxSizeMB: 0.2, 
              maxWidthOrHeight: 256,
              useWebWorker: true,
            };

            const compressedFile = await imageCompression(file, options);
            
            const reader = new FileReader();
            reader.readAsDataURL(compressedFile);
            reader.onload = async () => {
                const dataUrl = reader.result as string;
                
                try {
                    const userDocRef = doc(db, 'users', user.uid);
                    await updateDoc(userDocRef, { photoURL: dataUrl });
                    await refreshUserData();
                    toast({ title: "Avatar Updated!", description: "Your new avatar has been saved." });
                } catch (dbError: any) {
                    toast({ variant: 'destructive', title: "Database Error", description: `Could not save avatar: ${dbError.message}` });
                    console.error("Firestore Update Error:", dbError);
                } finally {
                    setIsLoading(false);
                }
            };
            reader.onerror = (error) => {
                toast({ variant: 'destructive', title: "File Read Failed", description: "Could not read the selected file." });
                console.error("FileReader Error:", error);
                setIsLoading(false);
            };

        } catch (error: any) {
             toast({ variant: 'destructive', title: "Image Processing Failed", description: `Could not process image: ${error.message}` });
             console.error("Avatar Compression Error:", error);
             setIsLoading(false);
        } finally {
            if(avatarInputRef.current) {
                avatarInputRef.current.value = "";
            }
        }
    };

    return (
        <div className="bg-background">
            <LoadingOverlay isLoading={isLoading} />
            
             <div className="p-4 md:p-0">
                <div className="flex flex-col md:flex-row items-center md:items-start gap-6 md:gap-8">
                     <div className="relative group">
                        <Avatar className="h-28 w-28 md:h-32 md:w-32 border-4 border-background shadow-md">
                            <AvatarImage src={userData?.photoURL || ""} alt={userData?.firstName || "User Avatar"} />
                            <AvatarFallback className="text-4xl">{getInitials(user?.email)}</AvatarFallback>
                        </Avatar>
                        <input type="file" ref={avatarInputRef} onChange={handleAvatarChange} className="hidden" accept="image/*"/>
                        <button 
                            className="absolute bottom-1 right-1 bg-muted text-muted-foreground p-2 rounded-full border-2 border-background transition-all group-hover:bg-primary group-hover:text-primary-foreground" 
                            onClick={() => avatarInputRef.current?.click()}
                            aria-label="Change profile picture"
                        >
                            <Camera className="w-4 h-4"/>
                        </button>
                    </div>

                    <div className="text-center md:text-left flex-1">
                        <h2 className="text-2xl font-bold">{userData?.firstName} {userData?.lastName}</h2>
                        <p className="text-muted-foreground">{user?.email}</p>
                    </div>
                </div>

                <Separator className="my-8" />
                
                <div className="space-y-6">
                    <div>
                        <h3 className="text-lg font-semibold mb-2">個人檔案資料</h3>
                        <div className="divide-y">
                            <ProfileInfoItem 
                                label="你的用戶名稱" 
                                value={getDisplayUsername()} 
                                isEditable 
                                onClick={() => handleNavigation('edit-username')}
                            />
                        </div>
                    </div>
                    
                    <div>
                         <div className="flex items-center justify-between">
                            <div>
                                <h3 className="text-lg font-semibold">個人檔案狀態 - {userData?.profileStatus ? '開啟' : '關閉'}</h3>
                                <p className="text-sm text-muted-foreground max-w-md">允許任何人透過搜尋你的個人檔案找到你，並付款給你。</p>
                            </div>
                            <Switch 
                                id="profile-status" 
                                checked={userData?.profileStatus ?? true}
                                onCheckedChange={handleProfileStatusChange}
                            />
                         </div>
                    </div>
                </div>
             </div>
             <div className="h-8" />
        </div>
    );
}
