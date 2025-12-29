'use server';
import clerkClient from "../clerk";

const updateUserMetadata = async (userId: string, metadata: any, privateMetadata?: any) => {
  try {
    await clerkClient.users.updateUserMetadata(userId, {
        publicMetadata: {
            ...metadata,
        },
        privateMetadata: {
            ...privateMetadata,
        },
    });
    console.log("User metadata updated successfully");
  } catch (error) {
    console.error("Error updating user metadata:", error);
  }
};

export default updateUserMetadata;
