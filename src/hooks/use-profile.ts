import { useState } from 'react';
import { api } from '@/trpc/react';
import { toast } from 'sonner';
import type { ChangePasswordInput, UpdateBusinessInfoInput, UpdateProfileInput } from '@/schema/user';


export function useProfile() {
    const [isLoading, setIsLoading] = useState(false);

    // Get profile data
    const {
        data: profileData,
        isLoading: isProfileLoading,
        refetch: refetchProfile
    } = api.user.getProfile.useQuery();

    // Update profile mutation
    const updateProfileMutation = api.user.updateProfile.useMutation({
        onSuccess: (data) => {
            toast.success(data.message || 'Profile berhasil diperbarui');
            refetchProfile();
        },
        onError: (error) => {
            toast.error(error.message || 'Gagal memperbarui profile');
        },
    });

    // Update business info mutation
    const updateBusinessInfoMutation = api.user.updateBusinessInfo.useMutation({
        onSuccess: (data) => {
            toast.success(data.message || 'Informasi bisnis berhasil diperbarui');
            refetchProfile();
        },
        onError: (error) => {
            toast.error(error.message || 'Gagal memperbarui informasi bisnis');
        },
    });

    // Change password mutation
    const changePasswordMutation = api.user.changePassword.useMutation({
        onSuccess: (data) => {
            toast.success(data.message || 'Password berhasil diubah');
        },
        onError: (error) => {
            toast.error(error.message || 'Gagal mengubah password');
        },
    });

    // Delete account mutation
    // const deleteAccountMutation = api.user.deleteAccount.useMutation({
    //     onSuccess: (data) => {
    //         toast.success(data.message || 'Akun berhasil dihapus');
    //         // Redirect to login or home page
    //         router.push('/auth/login');
    //     },
    //     onError: (error) => {
    //         toast.error(error.message || 'Gagal menghapus akun');
    //     },
    // });

    // Handler functions
    const handleUpdateProfile = async (data: UpdateProfileInput) => {
        setIsLoading(true);
        try {
            await updateProfileMutation.mutateAsync(data);
        } finally {
            setIsLoading(false);
        }
    };

    const handleUpdateBusinessInfo = async (data: UpdateBusinessInfoInput) => {
        setIsLoading(true);
        try {
            await updateBusinessInfoMutation.mutateAsync(data);
        } finally {
            setIsLoading(false);
        }
    };

    const handleChangePassword = async (data: ChangePasswordInput) => {
        setIsLoading(true);
        try {
            await changePasswordMutation.mutateAsync(data);
        } finally {
            setIsLoading(false);
        }
    };

    // const handleDeleteAccount = async (data: DeleteAccountInput) => {
    //     setIsLoading(true);
    //     try {
    //         await deleteAccountMutation.mutateAsync(data);
    //     } finally {
    //         setIsLoading(false);
    //     }
    // };

    return {
        // Data
        profileData: profileData?.data,
        isProfileLoading,

        // Loading states
        isLoading: isLoading ||
            updateProfileMutation.isPending ||
            updateBusinessInfoMutation.isPending,

        // Handlers
        handleUpdateProfile,
        handleUpdateBusinessInfo,
        handleChangePassword,

        // Refetch
        refetchProfile,
    };
}

// Hook for profile form management
export function useProfileForms() {
    const [activeTab, setActiveTab] = useState('profile');
    const [showCurrentPassword, setShowCurrentPassword] = useState(false);
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);

    const togglePasswordVisibility = (field: 'current' | 'new' | 'confirm') => {
        switch (field) {
            case 'current':
                setShowCurrentPassword(!showCurrentPassword);
                break;
            case 'new':
                setShowNewPassword(!showNewPassword);
                break;
            case 'confirm':
                setShowConfirmPassword(!showConfirmPassword);
                break;
        }
    };

    return {
        activeTab,
        setActiveTab,
        showCurrentPassword,
        showNewPassword,
        showConfirmPassword,
        showDeleteModal,
        setShowDeleteModal,
        togglePasswordVisibility,
    };
}