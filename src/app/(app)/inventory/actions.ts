"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

export async function createBottle(formData: FormData) {
    const session = await getServerSession(authOptions);

    // Ensure only admin can create bottles
    if (session?.user?.role !== "admin") {
        throw new Error("Unauthorized");
    }

    const name = formData.get("name") as string;
    const producer = formData.get("producer") as string;
    const vintage = formData.get("vintage") as string;
    const type = formData.get("type") as string;
    const stock = parseInt(formData.get("stock") as string) || 0;
    const purchase_price = formData.get("purchase_price") ? parseFloat(formData.get("purchase_price") as string) : null;
    const market_value = formData.get("market_value") ? parseFloat(formData.get("market_value") as string) : null;
    const image_url = formData.get("image_url") as string;

    if (!name) {
        throw new Error("Bottle name is required");
    }

    await prisma.bottle.create({
        data: {
            name,
            producer: producer || null,
            vintage: vintage || null,
            type: type || null,
            stock,
            purchase_price,
            market_value,
            image_url: image_url || null,
        }
    });

    revalidatePath("/inventory");
    revalidatePath("/");
    redirect("/inventory");
}
