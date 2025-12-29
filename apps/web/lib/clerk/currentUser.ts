'use server';
import { currentUser as user } from "@clerk/nextjs/server";


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
    const session = await user();

    const User: CurrentUser = {
        id: session?.privateMetadata.application_id,
        name: session?.fullName,
        email: session?.emailAddresses[0].emailAddress,
        image: session?.imageUrl,
        isTwoFactorEnabled: session?.twoFactorEnabled,
        clerkUserId: session?.id,
        publicMetadata: session?.publicMetadata ?? null,
    };

    return User;
}
