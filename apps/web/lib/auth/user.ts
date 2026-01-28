import { UserJSON } from "@clerk/nextjs/server";
// import { prisma } from "@propure/db";
import updateUserMetadata from "../clerk/updateMetadata";
import { client } from "@propure/convex/client";
import { api } from "@propure/convex/api";

export async function verifyAndCreateUser(user: UserJSON) {
  try {
    // const newUser = await prisma.user.upsert({
    //   where: { clerkUserId: user.id },
    //   update: {
    //     name: `${user.first_name ?? "John"} ${user.last_name ?? "Doe"}`,
    //     updatedAt: new Date(),
    //   },
    //   create: {
    //     clerkUserId: user.id,
    //     email: user.email_addresses[0].email_address,
    //     name: `${user.first_name ?? "John"} ${user.last_name ?? "Doe"}`,
    //   },
    // });
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

