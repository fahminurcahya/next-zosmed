'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { updateProfileSchema, type UpdateProfileInput } from '@/schema/user';

interface PersonalInfoFormProps {
    defaultValues: {
        name: string;
        email: string;
    };
    accountInfo: {
        createdAt: Date;
        updatedAt: Date;
    };
    onSubmit: (data: UpdateProfileInput) => Promise<void>;
    isLoading: boolean;
}


export function PersonalInfoForm({ defaultValues, accountInfo, onSubmit, isLoading }: PersonalInfoFormProps) {
    const form = useForm({
        resolver: zodResolver(updateProfileSchema),
        defaultValues,
    });

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <FormField
                            control={form.control}
                            name="name"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Name</FormLabel>
                                    <FormControl>
                                        <Input placeholder="Your name" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </div>
                    <div className="space-y-2">

                        <FormField
                            control={form.control}
                            name="email"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Email</FormLabel>
                                    <FormControl>
                                        <Input placeholder="email@example.com" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                            disabled
                        />
                    </div>
                </div>


                <div className="text-sm text-muted-foreground">
                    Joined: {new Date(accountInfo.createdAt).toLocaleDateString()} • Last updated: {new Date(accountInfo.updatedAt).toLocaleDateString()}
                </div>

                <Button type="submit" disabled={isLoading}>
                    {isLoading ? 'Saving...' : 'Save Changes'}
                </Button>
            </form>
        </Form>
    );
}
