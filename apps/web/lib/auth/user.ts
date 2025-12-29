import { UserJSON } from "@clerk/nextjs/server";
import { prisma } from "@propure/db";
import updateUserMetadata from "../clerk/updateMetadata";

export async function verifyAndCreateUser(user: UserJSON) {
  try {
    const newUser = await prisma.user.upsert({
      where: { clerkUserId: user.id },
      update: {
        name: `${user.first_name ?? "John"} ${user.last_name ?? "Doe"}`,
        updatedAt: new Date(),
      },
      create: {
        clerkUserId: user.id,
        email: user.email_addresses[0].email_address,
        name: `${user.first_name ?? "John"} ${user.last_name ?? "Doe"}`,
      },
    });
    await updateUserMetadata(
      user.id,
      {},
      {
        application_id: newUser.id,
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
