import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Lock, Eye, EyeOff, Save, Shield, AlertCircle, Trash2 } from 'lucide-react';
import { changePasswordSchema, type ChangePasswordInput } from '@/schema/user';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface SecuritySectionProps {
    onChangePassword: (data: ChangePasswordInput) => Promise<void>;
    isLoading: boolean;
    showPasswords: {
        current: boolean;
        new: boolean;
        confirm: boolean;
    };
    onTogglePasswordVisibility: (field: 'current' | 'new' | 'confirm') => void;
}

export function SecuritySection({
    onChangePassword,
    isLoading,
    showPasswords,
    onTogglePasswordVisibility,
}: SecuritySectionProps) {
    const form = useForm<ChangePasswordInput>({
        resolver: zodResolver(changePasswordSchema),
        defaultValues: {
            currentPassword: '',
            newPassword: '',
            confirmPassword: '',
        },
    });

    const handleSubmit = async (data: ChangePasswordInput) => {
        await onChangePassword(data);
        form.reset();
    };

    return (
        <div className="space-y-8">
            {/* Change Password */}
            <Card>
                <CardHeader>
                    <CardTitle>Change Password</CardTitle>
                </CardHeader>
                <CardContent>
                    <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
                        <div className="space-y-2">
                            <Label htmlFor="currentPassword">Current Password</Label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                <Input
                                    {...form.register('currentPassword')}
                                    id="currentPassword"
                                    type={showPasswords.current ? 'text' : 'password'}
                                    className="pl-10 pr-10"
                                    placeholder="Enter current password"
                                />
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => onTogglePasswordVisibility('current')}
                                    className="absolute right-1 top-1 h-8 w-8 p-0"
                                >
                                    {showPasswords.current ? (
                                        <EyeOff className="h-4 w-4" />
                                    ) : (
                                        <Eye className="h-4 w-4" />
                                    )}
                                </Button>
                            </div>
                            {form.formState.errors.currentPassword && (
                                <Alert variant="destructive" className="py-2">
                                    <AlertCircle className="h-4 w-4" />
                                    <AlertDescription>
                                        {form.formState.errors.currentPassword.message}
                                    </AlertDescription>
                                </Alert>
                            )}
                        </div>

                        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                            <div className="space-y-2">
                                <Label htmlFor="newPassword">New Password</Label>
                                <div className="relative">
                                    <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                    <Input
                                        {...form.register('newPassword')}
                                        id="newPassword"
                                        type={showPasswords.new ? 'text' : 'password'}
                                        className="pl-10 pr-10"
                                        placeholder="Enter new password"
                                    />
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => onTogglePasswordVisibility('new')}
                                        className="absolute right-1 top-1 h-8 w-8 p-0"
                                    >
                                        {showPasswords.new ? (
                                            <EyeOff className="h-4 w-4" />
                                        ) : (
                                            <Eye className="h-4 w-4" />
                                        )}
                                    </Button>
                                </div>
                                {form.formState.errors.newPassword && (
                                    <Alert variant="destructive" className="py-2">
                                        <AlertCircle className="h-4 w-4" />
                                        <AlertDescription>
                                            {form.formState.errors.newPassword.message}
                                        </AlertDescription>
                                    </Alert>
                                )}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="confirmPassword">Confirm New Password</Label>
                                <div className="relative">
                                    <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                    <Input
                                        {...form.register('confirmPassword')}
                                        id="confirmPassword"
                                        type={showPasswords.confirm ? 'text' : 'password'}
                                        className="pl-10 pr-10"
                                        placeholder="Confirm new password"
                                    />
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => onTogglePasswordVisibility('confirm')}
                                        className="absolute right-1 top-1 h-8 w-8 p-0"
                                    >
                                        {showPasswords.confirm ? (
                                            <EyeOff className="h-4 w-4" />
                                        ) : (
                                            <Eye className="h-4 w-4" />
                                        )}
                                    </Button>
                                </div>
                                {form.formState.errors.confirmPassword && (
                                    <Alert variant="destructive" className="py-2">
                                        <AlertCircle className="h-4 w-4" />
                                        <AlertDescription>
                                            {form.formState.errors.confirmPassword.message}
                                        </AlertDescription>
                                    </Alert>
                                )}
                            </div>
                        </div>

                        <Alert>
                            <Shield className="h-4 w-4" />
                            <AlertDescription>
                                <div className="font-medium mb-1">Password Requirements</div>
                                <ul className="list-disc list-inside space-y-1 text-sm">
                                    <li>At least 8 characters long</li>
                                    <li>Contains uppercase and lowercase letters</li>
                                    <li>Contains at least one number</li>
                                    <li>Include special characters for better security</li>
                                </ul>
                            </AlertDescription>
                        </Alert>

                        <div className="flex justify-end">
                            <Button
                                type="submit"
                                disabled={isLoading}
                                className="flex items-center"
                            >
                                <Save className="h-4 w-4 mr-2" />
                                {isLoading ? 'Changing...' : 'Change Password'}
                            </Button>
                        </div>
                    </form>
                </CardContent>
            </Card>

            {/* Danger Zone */}
            {/* <Card className="border-destructive">
                <CardHeader>
                    <CardTitle className="text-destructive">Danger Zone</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="flex items-start justify-between">
                        <div>
                            <h4 className="font-medium text-destructive">Delete Account</h4>
                            <p className="text-sm text-muted-foreground mt-1">
                                Permanently delete your account and all associated data. This action cannot be undone.
                            </p>
                        </div>
                        <Button
                            onClick={onDeleteAccount}
                            variant="destructive"
                            className="flex items-center"
                        >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Delete Account
                        </Button>
                    </div>
                </CardContent>
            </Card> */}
        </div>
    );
}