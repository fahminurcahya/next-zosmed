import { Redis } from "@upstash/redis";
import { Resend } from "resend";
import { db } from "../db";
import { generateLaunchHTML, generateWelcomeHTML } from "../helper/email-template";
import { redis } from "@/lib/redis";


const resend = new Resend(process.env.RESEND_API_KEY!);

// Queue names
const QUEUE_NAMES = {
    WELCOME: "email:welcome",
    LAUNCH: "email:launch",
    PROCESSING: "email:processing",
    FAILED: "email:failed",
    DEAD_LETTER: "email:dead-letter",
} as const;

// Email types
export type EmailJob =
    | {
        type: "WELCOME_WAITINGLIST";
        data: {
            email: string;
            name: string;
            plan: string;
        };
    }
    | {
        type: "LAUNCH_NOTIFICATION";
        data: {
            id: string;
            email: string;
            name: string;
            interestedPlan: string;
            discountCode: string;
        };
    };

// Queue functions
export async function queueWelcomeEmail(data: {
    email: string;
    name: string;
    plan: string;
}) {
    const job: EmailJob = {
        type: "WELCOME_WAITINGLIST",
        data,
    };

    await redis.lpush(QUEUE_NAMES.WELCOME, JSON.stringify({
        ...job,
        timestamp: Date.now(),
        attempts: 0,
    }));
}

export async function queueLaunchNotification(users: any[]) {
    const pipeline = redis.pipeline();

    for (const user of users) {
        const job: EmailJob = {
            type: "LAUNCH_NOTIFICATION",
            data: {
                id: user.id,
                email: user.email,
                name: user.name,
                interestedPlan: user.interestedPlan,
                discountCode: user.discountCode.code
            },
        };

        pipeline.lpush(QUEUE_NAMES.LAUNCH, JSON.stringify({
            ...job,
            timestamp: Date.now(),
            attempts: 0,
        }));
    }

    await pipeline.exec();
}




// Send email functions
async function sendWelcomeEmail(job: any) {
    const { email, name, plan } = job.data;

    const result = await resend.emails.send({
        from: "Zosmed <noreply@zosmed.com>",
        to: email,
        subject: "Welcome to Zosmed Waiting List! 🎉",
        html: generateWelcomeHTML({ name, plan }),
    });

    return result;
}

async function sendLaunchEmail(job: any) {
    const { id, email, name, interestedPlan } = job.data;

    const result = await resend.emails.send({
        from: "Zosmed <noreply@zosmed.com>",
        to: email,
        subject: "🎉 Zosmed Sudah Diluncurkan! Claim Diskon Early Bird Anda",
        html: generateLaunchHTML(job.data),
    });

    // Update database
    await db.waitinglist.update({
        where: { id },
        data: {
            isNotified: true,
            notifiedAt: new Date(),
        },
    });

    return result;
}

// Process single job
async function processEmailJob(job: any): Promise<boolean> {
    try {
        let result;

        switch (job.type) {
            case "WELCOME_WAITINGLIST":
                result = await sendWelcomeEmail(job);
                break;
            case "LAUNCH_NOTIFICATION":
                result = await sendLaunchEmail(job);
                break;
            default:
                console.error("Unknown email type:", job.type);
                return false;
        }

        console.log(`Email sent successfully: ${job.data.email}`);
        return true;
    } catch (error) {
        console.error(`Failed to send email to ${job.data.email}:`, error);
        throw error;
    }
}

// Worker function - process emails from queue
export async function processEmailQueue() {
    const BATCH_SIZE = 10;
    const MAX_RETRIES = 3;

    // Process welcome emails
    await processQueue(QUEUE_NAMES.WELCOME);

    // Process launch emails
    await processQueue(QUEUE_NAMES.LAUNCH);

    async function processQueue(queueName: string) {
        while (true) {
            // Get job from queue
            const jobStr = await redis.rpop(queueName);
            if (!jobStr) break;

            const job = JSON.parse(jobStr as string);

            try {
                // Move to processing queue
                await redis.lpush(QUEUE_NAMES.PROCESSING, jobStr);

                // Process job
                await processEmailJob(job);

                // Remove from processing queue
                await redis.lrem(QUEUE_NAMES.PROCESSING, 1, jobStr);
            } catch (error) {
                // Handle retry
                job.attempts = (job.attempts || 0) + 1;

                if (job.attempts < MAX_RETRIES) {
                    // Put back to queue with delay
                    console.log(`Retrying job (attempt ${job.attempts}/${MAX_RETRIES})`);
                    await redis.lpush(queueName, JSON.stringify(job));
                } else {
                    // Move to dead letter queue
                    console.error(`Job failed after ${MAX_RETRIES} attempts, moving to DLQ`);
                    await redis.lpush(QUEUE_NAMES.DEAD_LETTER, JSON.stringify({
                        ...job,
                        error: (error as Error).message,
                        failedAt: Date.now(),
                    }));
                }

                // Remove from processing queue
                await redis.lrem(QUEUE_NAMES.PROCESSING, 1, jobStr);
            }
        }
    }
}

// Queue statistics
export async function getQueueStats() {
    const [welcome, launch, processing, failed, deadLetter] = await Promise.all([
        redis.llen(QUEUE_NAMES.WELCOME),
        redis.llen(QUEUE_NAMES.LAUNCH),
        redis.llen(QUEUE_NAMES.PROCESSING),
        redis.llen(QUEUE_NAMES.FAILED),
        redis.llen(QUEUE_NAMES.DEAD_LETTER),
    ]);

    return {
        pending: {
            welcome: welcome || 0,
            launch: launch || 0,
        },
        processing: processing || 0,
        failed: failed || 0,
        deadLetter: deadLetter || 0,
        total: (welcome || 0) + (launch || 0) + (processing || 0),
    };
}

// Rate limiter for email sending
export class EmailRateLimiter {
    private key = "email:ratelimit";

    async canSend(email: string): Promise<boolean> {
        const userKey = `${this.key}:${email}`;
        const count = await redis.incr(userKey);

        if (count === 1) {
            // Set expiry 1 hour
            await redis.expire(userKey, 3600);
        }

        // Max 5 emails per hour per user
        return count <= 5;
    }

    async getRemainingLimit(email: string): Promise<number> {
        const userKey = `${this.key}:${email}`;
        const count = Number(await redis.get(userKey)) || 0;
        return Math.max(0, 5 - count);
    }
}