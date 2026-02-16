import { UserJSON } from "@clerk/nextjs/server";
import updateUserMetadata from "../clerk/updateMetadata";
import { client } from "@propure/convex/client";
import { api } from "@propure/convex/genereated";

export async function verifyAndCreateUser(user: UserJSON) {
  try {

    const newUser = await client.mutation(api.functions.user.CreateUser, {
      userJSON: user,
    })
    await updateUserMetadata(
      user.id,
      undefined,
      {
        application_id: newUser,
      },
    );
    return {
      success: true,
      message: "User verified and created",
    };
  } catch (error) {
    console.error("Error verifying and creating user:", error);
    return {
      success: false,
      message: "Failed to verify and create user",
    };
  }
}

