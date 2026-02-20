"use server";
import clerkClient from "../clerk";

type NotifState = {
    all: boolean;
    inApp: boolean;
    email: boolean;
};


export const updateNotificationSetting = async (
    userId: string,
    settings: NotifState,
): Promise<void> => {
    try {
        const prevUserMetadata = (await clerkClient.users.getUser(userId)).publicMetadata;
        await clerkClient.users.updateUser(userId, {
            publicMetadata: {
                ...prevUserMetadata,
                notifSettings: settings,
            }
        });
    } catch (error) {
        console.error("Error updating notification settings:", error);
        throw error;
    }
}