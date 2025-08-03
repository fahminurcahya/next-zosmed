import { auth } from '@/server/auth';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const seedDefaultPlans = [
    {
        name: "FREE",
        displayName: "Free",
        description: "Paket gratis untuk mencoba fitur dasar Zosmed.",
        price: 0,
        period: "LIFETIME",
        color: "from-gray-500 to-gray-600",
        bgColor: "bg-gray-50",
        borderColor: "border-gray-200",
        maxAccounts: 1,
        maxDMPerMonth: 100,
        maxAIReplyPerMonth: 20,
        features: {
            included: [
                "1 akun Instagram",
                "100 auto-reply",
                "20 AI-powered reply",
                "Template Workflow",
            ],
            notIncluded: [
                "Advanced Analytics Dashboard",
                "Priority support",
                "Lead scoring",
            ],
        },
        sortOrder: 0,
    },
    {
        name: "STARTER",
        displayName: "Starter",
        description: "Cocok untuk UMKM atau individu yang ingin mengotomatisasi DM dan respon.",
        price: 149000,
        period: "MONTHLY",
        color: "from-blue-500 to-cyan-500",
        bgColor: "bg-blue-50",
        borderColor: "border-blue-200",
        popular: true,
        badge: "MOST POPULAR",
        maxAccounts: 3,
        maxDMPerMonth: 2000,
        maxAIReplyPerMonth: 500,
        features: {
            included: [
                "3 akun Business Instagram",
                "2000 auto-reply per bulan",
                "500 AI-powered reply",
                "Template Workflow",
                "AI intent detection",
                "Advanced Analytics Dashboard",
            ],
            notIncluded: ["Lead scoring", "Priority support"],
        },
        sortOrder: 1,
    },
    {
        name: "PRO",
        displayName: "Pro",
        description: "Untuk agensi atau bisnis besar yang butuh performa tinggi dan fitur lengkap.",
        price: 399000,
        period: "MONTHLY",
        color: "from-purple-500 to-pink-500",
        bgColor: "bg-purple-50",
        borderColor: "border-purple-200",
        maxAccounts: 5,
        maxDMPerMonth: 10000,
        maxAIReplyPerMonth: 2000,
        features: {
            included: [
                "5 akun Business Instagram",
                "10.000 auto-reply per bulan",
                "2000 AI-powered reply",
                "Template Workflow",
                "AI intent detection",
                "Advanced Analytics Dashboard",
                "Lead scoring",
                "Priority support",
            ],
            notIncluded: [],
        },
        sortOrder: 2,
    },
];

async function main() {
    for (const plan of seedDefaultPlans) {
        await prisma.pricingPlan.upsert({
            where: { name: plan.name },
            update: {},
            create: {
                name: plan.name,
                displayName: plan.displayName,
                description: plan.description,
                price: plan.price,
                currency: "IDR",
                period: plan.period as any || "MONTHLY",
                color: plan.color,
                bgColor: plan.bgColor,
                borderColor: plan.borderColor,
                popular: plan.popular || false,
                badge: plan.badge,
                maxAccounts: plan.maxAccounts,
                maxDMPerMonth: plan.maxDMPerMonth,
                maxAIReplyPerMonth: plan.maxAIReplyPerMonth,
                features: plan.features,
                isActive: true,
                sortOrder: plan.sortOrder || 0,
            },
        });
    }


    console.log('✅ Seeding plans completed.');

    const email = 'fahmi.nurcahya@zosmed.com';
    const password = 'P@ssw0rd';

    // Check if user already exists in database
    const existingUser = await prisma.user.findUnique({
        where: { email: email }
    });

    if (existingUser) {
        console.log(`User with email ${email} already exists. Skipping user creation.`);
        await prisma.user.update({
            where: { id: existingUser.id },
            data: { role: 'admin', emailVerified: true, hasOnboarding: true, onboardingStep: "COMPLETED", onboardingCompletedAt: new Date() }
        });
        console.log('✅ Admin user role set successfully.');
    } else {
        // First, check if the user already exists to prevent duplicates
        const newUser = await auth.api.signUpEmail({
            body: {
                email: email,
                password: password,
                name: 'Admin User',
            }
        });

        if (newUser) {
            console.log(`Created new user with email: ${newUser.user.email}`);

            // Get user and set role to admin
            await prisma.user.update({
                where: { id: newUser.user.id },
                data: { role: 'admin', emailVerified: true, hasOnboarding: true, onboardingStep: "COMPLETED", onboardingCompletedAt: new Date() }
            });
            console.log('✅ Admin user role set successfully.');
        }
    }

}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
