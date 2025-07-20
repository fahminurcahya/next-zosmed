import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { updateBusinessInfoSchema, type UpdateBusinessInfoInput } from '@/schema/user';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { BUSINESS_CATEGORY_OPTIONS, BUSINESS_SIZE_OPTIONS, GOALS_OPTIONS } from '@/types/onboarding.type';
import { MapPin, Target, Loader2, ArrowRight } from 'lucide-react';

interface BusinessInfoFormProps {
    defaultValues: UpdateBusinessInfoInput;
    onSubmit: (data: UpdateBusinessInfoInput) => Promise<void>;
    isLoading: boolean;
}

export function BusinessInfoForm({ defaultValues, onSubmit, isLoading }: BusinessInfoFormProps) {
    const form = useForm<UpdateBusinessInfoInput>({
        resolver: zodResolver(updateBusinessInfoSchema),
        defaultValues,
    });

    // Gabungkan persetujuan ke data form sebelum submit
    const handleSubmit = (data: UpdateBusinessInfoInput) => {
        return onSubmit(data);
    };

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
                {/* Nama Bisnis & Kategori */}
                <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label htmlFor="businessName">
                            Nama Bisnis/Brand
                        </Label>
                        <FormField
                            control={form.control}
                            name="businessName"
                            render={({ field }) => (
                                <FormItem>
                                    <FormControl>
                                        <Input
                                            id="businessName"
                                            placeholder="Contoh: Zosmed"
                                            {...field}
                                            disabled={isLoading}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="businessCategory">
                            Kategori Bisnis
                        </Label>
                        <FormField
                            control={form.control}
                            name="businessCategory"
                            render={({ field }) => (
                                <FormItem>
                                    <FormControl>
                                        <Select
                                            onValueChange={field.onChange}
                                            value={field.value}
                                            disabled={isLoading}
                                        >
                                            <SelectTrigger id="businessCategory" className="w-full">
                                                <SelectValue placeholder="Pilih kategori bisnis" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {BUSINESS_CATEGORY_OPTIONS.map(option => (
                                                    <SelectItem key={option.value} value={option.value}>
                                                        {option.icon} {option.label}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </div>
                </div>

                {/* Ukuran Bisnis & Lokasi */}
                <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label htmlFor="businessSize">
                            Ukuran Bisnis
                        </Label>
                        <FormField
                            control={form.control}
                            name="businessSize"
                            render={({ field }) => (
                                <FormItem>
                                    <FormControl>
                                        <Select
                                            onValueChange={field.onChange}
                                            value={field.value}
                                            disabled={isLoading}
                                        >
                                            <SelectTrigger id="businessSize" className="w-full">
                                                <SelectValue placeholder="Pilih ukuran bisnis" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {BUSINESS_SIZE_OPTIONS.map(option => (
                                                    <SelectItem key={option.value} value={option.value}>
                                                        {option.icon} {option.label} ({option.employeeRange})
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="location">
                            <MapPin className="w-4 h-4 inline mr-1" />
                            Lokasi
                        </Label>
                        <FormField
                            control={form.control}
                            name="location"
                            render={({ field }) => (
                                <FormItem>
                                    <FormControl>
                                        <Input
                                            id="location"
                                            type="text"
                                            placeholder="Contoh: Jakarta, DKI Jakarta"
                                            {...field}
                                            disabled={isLoading}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </div>
                </div>

                {/* Goals */}
                <div className="space-y-2">
                    <Label htmlFor="goals">
                        <Target className="w-4 h-4 inline mr-1" />
                        Tujuan Utama Menggunakan Zosmed
                    </Label>
                    <FormField
                        control={form.control}
                        name="goals"
                        render={({ field }) => (
                            <FormItem>
                                <FormControl>
                                    <Select
                                        onValueChange={field.onChange}
                                        value={field.value}
                                        disabled={isLoading}
                                    >
                                        <SelectTrigger id="goals" className="w-full">
                                            <SelectValue placeholder="Pilih tujuan utama" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {GOALS_OPTIONS.map(option => (
                                                <SelectItem key={option.value} value={option.value}>
                                                    {option.icon} {option.label}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <p className="text-sm text-gray-500">
                        Pilih tujuan utama untuk membantu kami menyesuaikan fitur yang sesuai
                    </p>
                </div>

                {/* Submit Button */}
                <Button
                    type="submit"
                    className="w-full"
                    size="lg"
                    disabled={isLoading}
                >
                    {isLoading ? (
                        <>
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            Menyimpan...
                        </>
                    ) : (
                        <>
                            Lanjutkan ke Pemilihan Paket
                            <ArrowRight className="w-4 h-4 ml-2" />
                        </>
                    )}
                </Button>
            </form>
        </Form>
    );
}
