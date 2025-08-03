'use client';

import { useRouter } from 'nextjs-toploader/app';
import { motion } from 'framer-motion';
import { useProfile, useProfileForms } from '@/hooks/use-profile';
import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { ProfileHeader } from './_components/profile-header';
import { ProfileTabs } from './_components/profile-tab';
import { PersonalInfoForm } from './_components/personal-info-form';
import { BusinessInfoForm } from './_components/business-info.form';
import { SecuritySection } from './_components/security-section';

export default function ProfilePage() {
    const router = useRouter();
    const {
        profileData,
        isProfileLoading,
        isLoading,
        handleUpdateProfile,
        handleUpdateBusinessInfo,
        handleChangePassword
    } = useProfile();
    const {
        activeTab,
        setActiveTab,
        showCurrentPassword,
        showNewPassword,
        showConfirmPassword,
        showDeleteModal,
        setShowDeleteModal,
        togglePasswordVisibility
    } = useProfileForms();

    if (isProfileLoading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <Skeleton className="w-[300px] h-[300px] rounded-xl" />
            </div>
        );
    }

    if (!profileData) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <p className="text-gray-600 mb-4">Profile data not found</p>
                    <button
                        onClick={() => router.push('/dashboard')}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                    >
                        Back to Dashboard
                    </button>
                </div>
            </div>
        );
    }

    return (
        <>
            <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50/20">
                <div className="container max-w-6xl py-8">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mb-10"
                    >
                        <div className="flex items-center gap-3 mb-2">

                            <h1 className="text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                                Profile Settings
                            </h1>
                        </div>
                        <p className="text text-muted-foreground max-w-2xl">
                            Manage your account settings and preferences
                        </p>
                    </motion.div>


                    <ProfileHeader
                        profile={profileData.profile}
                        subscription={profileData.subscription}
                    />

                    <Card>
                        <ProfileTabs activeTab={activeTab} onTabChange={setActiveTab} />
                        <motion.div
                            key={activeTab}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.3 }}
                            className="p-6"
                        >
                            {activeTab === 'profile' && (
                                <PersonalInfoForm
                                    defaultValues={{
                                        name: profileData.profile.name,
                                        email: profileData.profile.email,
                                        phoneNumber: profileData.profile.phone
                                    }}
                                    accountInfo={{
                                        createdAt: profileData.profile.createdAt,
                                        updatedAt: profileData.profile.updatedAt,
                                    }}
                                    onSubmit={handleUpdateProfile}
                                    isLoading={isLoading}
                                />
                            )}
                            {activeTab === 'business' && (
                                <BusinessInfoForm
                                    defaultValues={{
                                        ...profileData.businessInfo,
                                        businessCategory: profileData.businessInfo.businessCategory as
                                            | 'other'
                                            | 'fb'
                                            | 'fashion'
                                            | 'education'
                                            | 'health'
                                            | 'technology'
                                            | 'retail',
                                        businessSize: profileData.businessInfo.businessSize as
                                            | 'small'
                                            | 'solo'
                                            | 'medium'
                                            | 'large',
                                    }}
                                    onSubmit={handleUpdateBusinessInfo}
                                    isLoading={isLoading}
                                />
                            )}

                            {activeTab === 'security' && (
                                <SecuritySection
                                    onChangePassword={handleChangePassword}
                                    isLoading={isLoading}
                                    showPasswords={{
                                        current: showCurrentPassword,
                                        new: showNewPassword,
                                        confirm: showConfirmPassword
                                    }}
                                    onTogglePasswordVisibility={togglePasswordVisibility}
                                />
                            )}
                        </motion.div>
                    </Card>
                </div>
            </div>
        </>
    );
}
