'use server';
import { currentUser as user, clerkClient, auth } from "@clerk/nextjs/server";
import { client } from "@propure/convex/client";
import { api } from "@propure/convex/genereated";

export type CurrentUser = {
    id?: string;
    name?: string | null;
    email?: string | null;
    image?: string | null;
    isTwoFactorEnabled?: boolean;
    clerkUserId?: string; 
    publicMetadata: UserPublicMetadata | null;
};
export const currentUser = async () => {
    if (!process.env.CLERK_SECRET_KEY) {
        // eslint-disable-next-line no-console
        console.warn("[propure/web] CLERK_SECRET_KEY is missing; currentUser() will return an empty user.");
        return { publicMetadata: null } as CurrentUser;
    }

    const session = await user();

    const User: CurrentUser = {
        id: session?.privateMetadata.application_id,
        name: session?.fullName,
        email: session?.emailAddresses?.[0]?.emailAddress ?? null,
        image: session?.imageUrl,
        isTwoFactorEnabled: session?.twoFactorEnabled,
        clerkUserId: session?.id,
        publicMetadata: session?.publicMetadata ?? null,
    };

    return User;
}

export async function suspendUser(userId: string) {
    const { userId: adminId } = await auth();
    if (!adminId) throw new Error("Unauthorized");

    const client = await clerkClient();

    await client.users.banUser(userId);

    return { success: true };
}

export async function unsuspendUser(userId: string) {
    const client = await clerkClient();
    await client.users.unbanUser(userId);
    return { success: true };
}

// export async function impersonateUser(userId: string) {
//     const client = await clerkClient();

//     const token = await client.signInTokens.createSignInToken({
//         userId,
//         expiresInSeconds: 600
//     });
//     console.log("Impersonation token created:", token);
//     return token.url;
// }

export async function generateActorToken(actorId: string, userId: string) {

    const params = JSON.stringify({
        user_id: userId,
        actor: {
            sub: actorId,
        },
    })

    // Create an actor token using Clerk's Backend API
    const res = await fetch('https://api.clerk.com/v1/actor_tokens', {
        method: 'POST',
        headers: {
            Authorization: `Bearer ${process.env.CLERK_SECRET_KEY}`,
            'Content-type': 'application/json',
        },
        body: params,
    })

    if (!res.ok) {
        return { ok: false, message: 'Failed to generate actor token' }
    }
    const data = await res.json()


    return { ok: true, token: data.token }
}

export async function getAllUsers() {
    const client = await clerkClient();
    let users: any[] = [];
    let offset = 0;
    const limit = 100;

    while (true) {
        const { data } = await client.users.getUserList({
            limit,
            offset,
        });

        const enrichedUsers = await Promise.all(
            data.map(async (u) => ({
                id: u.id,
                // device: await getUserLastSession(u.id),
                email: u.emailAddresses[0]?.emailAddress ?? null,
                name: `${u.firstName ?? ""} ${u.lastName ?? ""}`.trim(),
                imageUrl: u.imageUrl,
                status: u.banned ? "suspended" : "active",
                createdAt: u.createdAt,
                lastLogin: u.lastSignInAt,
                subscription: await getUserSubscriptionPlan(u.id),
                chatSessionsCount: await getUserChatSessions(u.id),
                publicMetadata: u.publicMetadata,
            }))
        );

        users.push(...enrichedUsers);

        if (data.length < limit) break;
        offset += limit;
    }


    return users;
}

// async function getUserLastSession(userId: string) {
//     const client = await clerkClient();

//     const { data } = await client.sessions.getSessionList({
//         userId,
//         limit: 1,
//     });

//     const session = data[0];

//     if (!session) return null;

//     console.log("Last session fetched:", session);
//     return {
//         userAgent: session.userAgent,
//         ipAddress: session.ipAddress,
//         loginAt: session.createdAt,
//         lastActiveAt: session.lastActiveAt,
//     };
// }

async function getUserSubscriptionPlan(id: string) {
    const client = await clerkClient();
    const user = await client.users.getUser(id);

    return {
        subscriptionPlan: user.publicMetadata.subscriptionPlan || null,
        subscriptionEndDate: user.publicMetadata.subscriptionEndDate || null,
        billingHistory: {}
    };
}

async function getUserChatSessions(id: string) {

    const finduserId = await client.query(api.functions.user.GetUserByClerkId, { clerkUserId: id });

    if (!finduserId) {
        return { TotalChat: 0, LastChat: null };
    }
    // Get the most recent chat for the user
    const userChatSessions = await client.query(api.functions.chat.getUserChatSessionsByUserId, { userId: finduserId._id });

    const totalChats = userChatSessions.length;
    const lastChat = userChatSessions[0];

    return { TotalChat: totalChats, LastChat: lastChat?.updatedAt || null };
}
