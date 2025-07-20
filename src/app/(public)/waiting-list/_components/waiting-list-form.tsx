"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, CheckCircle2, Bot } from "lucide-react";
import { api } from "@/trpc/react";
import { toast } from "sonner";

export default function WaitinglistForm() {
    const [formData, setFormData] = useState({
        email: "",
        name: "",
        phone: "",
        referralSource: "",
        interestedPlan: "FREE" as "FREE" | "STARTER" | "PRO",
    });
    const [showSuccess, setShowSuccess] = useState(false);

    const registerMutation = api.waitingList.register.useMutation({
        onSuccess: () => {
            setShowSuccess(true);
            setFormData({
                email: "",
                name: "",
                phone: "",
                referralSource: "",
                interestedPlan: "FREE",
            });
            toast.success("Berhasil terdaftar di waiting list!");
        },
        onError: (error) => {
            toast.error(error.message);
        },
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        // Validate
        if (!formData.name || !formData.email) {
            toast.error("Nama dan email wajib diisi");
            return;
        }

        registerMutation.mutate(formData);
    };

    if (showSuccess) {
        return (
            <div className="w-full max-w-md mx-auto p-6 bg-white rounded-lg shadow-lg">
                <div className="text-center space-y-4">
                    <CheckCircle2 className="w-16 h-16 text-green-500 mx-auto" />
                    <h3 className="text-2xl font-bold">Terima Kasih!</h3>
                    <p className="text-gray-600">
                        Anda telah terdaftar di waiting list. Kami akan menghubungi Anda
                        segera saat Zosmed diluncurkan!
                    </p>
                    <Button
                        onClick={() => setShowSuccess(false)}
                        variant="outline"
                        className="mt-4"
                    >
                        Daftar Email Lain
                    </Button>
                </div>
            </div>
        );
    }

    return (
        <div className="w-full max-w-md mx-auto p-6 bg-white rounded-lg shadow-lg">
            <div className="text-center mb-6">
                <Bot className="w-12 h-12 text-blue-500 mx-auto mb-4" />
                <h2 className="text-2xl font-bold">Join Waiting List</h2>
                <p className="text-gray-600 mt-2">
                    Jadilah yang pertama menggunakan Zosmed - Automation tool untuk
                    Instagram
                </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <Label className="mb-2" htmlFor="name">Nama Lengkap *</Label>
                    <Input
                        id="name"
                        type="text"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        required
                        placeholder="John Doe"
                    />
                </div>

                <div>
                    <Label className="mb-2" htmlFor="email">Email *</Label>
                    <Input
                        id="email"
                        type="email"
                        value={formData.email}
                        onChange={(e) =>
                            setFormData({ ...formData, email: e.target.value })
                        }
                        required
                        placeholder="john@example.com"
                    />
                </div>

                <div>
                    <Label className="mb-2" htmlFor="phone">No. WhatsApp (opsional)</Label>
                    <Input
                        id="phone"
                        type="tel"
                        value={formData.phone}
                        onChange={(e) =>
                            setFormData({ ...formData, phone: e.target.value })
                        }
                        placeholder="+62812345678"
                    />
                </div>

                <div>
                    <Label className="mb-2" htmlFor="referral">Dari mana Anda mengetahui Zosmed?</Label>
                    <Select
                        value={formData.referralSource}
                        onValueChange={(value) =>
                            setFormData({ ...formData, referralSource: value })
                        }
                    >
                        <SelectTrigger className="w-full">
                            <SelectValue placeholder="Pilih salah satu" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="instagram">Instagram</SelectItem>
                            <SelectItem value="tiktok">TikTok</SelectItem>
                            <SelectItem value="google">Google Search</SelectItem>
                            <SelectItem value="friend">Teman/Rekan</SelectItem>
                            <SelectItem value="other">Lainnya</SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                <div>
                    <Label className="mb-2" htmlFor="plan">Plan yang Anda minati</Label>
                    <Select
                        value={formData.interestedPlan}
                        onValueChange={(value: "FREE" | "STARTER" | "PRO") =>
                            setFormData({ ...formData, interestedPlan: value })
                        }
                    >
                        <SelectTrigger className="w-full">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="FREE">
                                Free - Rp 0 (1 akun, 100 DM)
                            </SelectItem>
                            <SelectItem value="STARTER">
                                Starter - Rp 149k (3 akun, 2000 DM)
                            </SelectItem>
                            <SelectItem value="PRO">
                                Pro - Rp 399k (10 akun, 10k DM)
                            </SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                <Button
                    type="submit"
                    className="w-full"
                    disabled={registerMutation.isPending}
                >
                    {registerMutation.isPending ? (
                        <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Processing...
                        </>
                    ) : (
                        "Join Waiting List"
                    )}
                </Button>

                <div className="text-center text-sm text-gray-500 mt-4">
                    <p>✨ Early bird benefit: Diskon 50% untuk 3 bulan pertama!</p>
                </div>
            </form>
        </div>
    );
}