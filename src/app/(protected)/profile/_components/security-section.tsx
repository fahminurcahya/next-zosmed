// import React from 'react';
// import { useForm } from 'react-hook-form';
// import { zodResolver } from '@hookform/resolvers/zod';
// import { Lock, Eye, EyeOff, Save, Shield, AlertCircle, Trash2 } from 'lucide-react';

// interface SecuritySectionProps {
//     onChangePassword: (data: ChangePasswordInput) => Promise<void>;
//     onDeleteAccount: () => void;
//     isLoading: boolean;
//     showPasswords: {
//         current: boolean;
//         new: boolean;
//         confirm: boolean;
//     };
//     onTogglePasswordVisibility: (field: 'current' | 'new' | 'confirm') => void;
//     integrations: Array<{
//         type: string;
//         isActive: boolean;
//     }>;
// }

// export function SecuritySection({
//     onChangePassword,
//     onDeleteAccount,
//     isLoading,
//     showPasswords,
//     onTogglePasswordVisibility,
//     integrations
// }: SecuritySectionProps) {
//     const form = useForm<ChangePasswordInput>({
//         resolver: zodResolver(changePasswordSchema),
//         defaultValues: {
//             currentPassword: '',
//             newPassword: '',
//             confirmPassword: '',
//         },
//     });

//     const handleSubmit = async (data: ChangePasswordInput) => {
//         await onChangePassword(data);
//         form.reset();
//     };

//     return (
//         <div className="space-y-8">
//             {/* Change Password */}
//             <div className="bg-gray-50 rounded-lg p-6">
//                 <h3 className="text-lg font-medium text-gray-900 mb-4">Change Password</h3>
//                 <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
//                     <div>
//                         <label className="block text-sm font-medium text-gray-700 mb-2">
//                             Current Password
//                         </label>
//                         <div className="relative">
//                             <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
//                             <input
//                                 {...form.register('currentPassword')}
//                                 type={showPasswords.current ? 'text' : 'password'}
//                                 className="pl-10 pr-10 w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
//                                 placeholder="Enter current password"
//                             />
//                             <button
//                                 type="button"
//                                 onClick={() => onTogglePasswordVisibility('current')}
//                                 className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
//                             >
//                                 {showPasswords.current ? (
//                                     <EyeOff className="h-4 w-4" />
//                                 ) : (
//                                     <Eye className="h-4 w-4" />
//                                 )}
//                             </button>
//                         </div>
//                         {form.formState.errors.currentPassword && (
//                             <p className="mt-1 text-sm text-red-600 flex items-center">
//                                 <AlertCircle className="h-4 w-4 mr-1" />
//                                 {form.formState.errors.currentPassword.message}
//                             </p>
//                         )}
//                     </div>

//                     <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
//                         <div>
//                             <label className="block text-sm font-medium text-gray-700 mb-2">
//                                 New Password
//                             </label>
//                             <div className="relative">
//                                 <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
//                                 <input
//                                     {...form.register('newPassword')}
//                                     type={showPasswords.new ? 'text' : 'password'}
//                                     className="pl-10 pr-10 w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
//                                     placeholder="Enter new password"
//                                 />
//                                 <button
//                                     type="button"
//                                     onClick={() => onTogglePasswordVisibility('new')}
//                                     className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
//                                 >
//                                     {showPasswords.new ? (
//                                         <EyeOff className="h-4 w-4" />
//                                     ) : (
//                                         <Eye className="h-4 w-4" />
//                                     )}
//                                 </button>
//                             </div>
//                             {form.formState.errors.newPassword && (
//                                 <p className="mt-1 text-sm text-red-600 flex items-center">
//                                     <AlertCircle className="h-4 w-4 mr-1" />
//                                     {form.formState.errors.newPassword.message}
//                                 </p>
//                             )}
//                         </div>

//                         <div>
//                             <label className="block text-sm font-medium text-gray-700 mb-2">
//                                 Confirm New Password
//                             </label>
//                             <div className="relative">
//                                 <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
//                                 <input
//                                     {...form.register('confirmPassword')}
//                                     type={showPasswords.confirm ? 'text' : 'password'}
//                                     className="pl-10 pr-10 w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
//                                     placeholder="Confirm new password"
//                                 />
//                                 <button
//                                     type="button"
//                                     onClick={() => onTogglePasswordVisibility('confirm')}
//                                     className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
//                                 >
//                                     {showPasswords.confirm ? (
//                                         <EyeOff className="h-4 w-4" />
//                                     ) : (
//                                         <Eye className="h-4 w-4" />
//                                     )}
//                                 </button>
//                             </div>
//                             {form.formState.errors.confirmPassword && (
//                                 <p className="mt-1 text-sm text-red-600 flex items-center">
//                                     <AlertCircle className="h-4 w-4 mr-1" />
//                                     {form.formState.errors.confirmPassword.message}
//                                 </p>
//                             )}
//                         </div>
//                     </div>

//                     <div className="bg-blue-50 rounded-lg p-4">
//                         <div className="flex">
//                             <Shield className="h-5 w-5 text-blue-400 mt-0.5" />
//                             <div className="ml-3">
//                                 <h4 className="text-sm font-medium text-blue-800">Password Requirements</h4>
//                                 <ul className="mt-1 text-sm text-blue-700 list-disc list-inside space-y-1">
//                                     <li>At least 8 characters long</li>
//                                     <li>Contains uppercase and lowercase letters</li>
//                                     <li>Contains at least one number</li>
//                                     <li>Include special characters for better security</li>
//                                 </ul>
//                             </div>
//                         </div>
//                     </div>

//                     <div className="flex justify-end">
//                         <button
//                             type="submit"
//                             disabled={isLoading}
//                             className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
//                         >
//                             <Save className="h-4 w-4 mr-2" />
//                             {isLoading ? 'Changing...' : 'Change Password'}
//                         </button>
//                     </div>
//                 </form>
//             </div>

//             {/* Account Integrations */}
//             <div className="bg-gray-50 rounded-lg p-6">
//                 <h3 className="text-lg font-medium text-gray-900 mb-4">Connected Accounts</h3>
//                 <div className="space-y-4">
//                     {integrations.map((integration, index) => (
//                         <div key={index} className="flex items-center justify-between p-4 bg-white rounded-lg border">
//                             <div className="flex items-center space-x-3">
//                                 <div className="h-8 w-8 bg-pink-100 rounded-lg flex items-center justify-center">
//                                     <span className="text-pink-600 font-medium text-sm">IG</span>
//                                 </div>
//                                 <div>
//                                     <p className="font-medium text-gray-900">Instagram</p>
//                                     <p className="text-sm text-gray-500">
//                                         {integration.isActive ? 'Connected and active' : 'Connected but inactive'}
//                                     </p>
//                                 </div>
//                             </div>
//                             <div className="flex items-center space-x-2">
//                                 <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${integration.isActive
//                                     ? 'bg-green-100 text-green-800'
//                                     : 'bg-yellow-100 text-yellow-800'
//                                     }`}>
//                                     {integration.isActive ? 'Active' : 'Inactive'}
//                                 </span>
//                                 <button className="text-blue-600 hover:text-blue-700 text-sm font-medium">
//                                     Manage
//                                 </button>
//                             </div>
//                         </div>
//                     ))}
//                 </div>
//             </div>

//             {/* Danger Zone */}
//             <div className="bg-red-50 rounded-lg p-6 border border-red-200">
//                 <h3 className="text-lg font-medium text-red-900 mb-4">Danger Zone</h3>
//                 <div className="flex items-start justify-between">
//                     <div>
//                         <h4 className="font-medium text-red-900">Delete Account</h4>
//                         <p className="text-sm text-red-700 mt-1">
//                             Permanently delete your account and all associated data. This action cannot be undone.
//                         </p>
//                     </div>
//                     <button
//                         onClick={onDeleteAccount}
//                         className="flex items-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
//                     >
//                         <Trash2 className="h-4 w-4 mr-2" />
//                         Delete Account
//                     </button>
//                 </div>
//             </div>
//         </div>
//     );
// }