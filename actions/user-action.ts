"use server";

import { auth, signIn } from "@/libs/auth";
import { ActionResponse, Partner, User } from "@/libs/definitions";
import prisma from "@/libs/prisma";
import getNextValue from "@/libs/sequence";
import bcrypt from "bcryptjs";
import cloudinary from "@/libs/cloudinary";
import { writeFile } from "fs/promises";
import path from "path";
import { revalidatePath } from "next/cache";

export async function userRegister({
  name,
  email,
  password,
}: {
  name: string;
  email: string;
  password: string;
}): Promise<ActionResponse<unknown>> {
  try {
    const emailExists = await prisma.user.findUnique({
      where: { email },
    });

    if (emailExists) {
      return {
        success: false,
        message: "El correo electrónico ya está en uso",
      };
    }

    const newPartner = await prisma.partner.create({
      data: {
        name,
        email,
      },
    });

    const hasedPassword = await bcrypt.hash(password, 10);

    const slug = await getNextValue("USR", "user");

    const newUser = await prisma.user.create({
      data: {
        email,
        password: hasedPassword,
        slug,
        Partner: {
          connect: {
            id: newPartner.id,
          },
        },
      },
    });

    if (!newUser) {
      return {
        success: false,
        message: "Error al crear el usuario",
      };
    }

    console.log("Registro de usuario completado");

    return {
      success: true,
      message: "Usuario registrado correctamente",
    };
  } catch (error) {
    return {
      success: false,
      message: "Error al registrar el usuario",
    };
  }
}

export async function userLogin({
  email,
  password,
}: {
  email: string;
  password: string;
}): Promise<ActionResponse<unknown>> {
  try {
    const res = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });

    console.log("Inicio de sesión completada");

    return {
      success: true,
      message: "Inicio de sesión exitoso",
    };
  } catch (error) {
    return {
      success: false,
      message: "Credenciales inválidas",
    };
  }
}

export async function fetchUser({
  slug,
}: {
  slug: string;
}): Promise<ActionResponse<User>> {
  try {
    const user = await prisma.user.findUnique({
      where: { slug },
      include: {
        Partner: true,
      },
    });

    if (!user) {
      return {
        success: false,
        message: "Usuario no encontrado",
      };
    }

    console.log("Fetching de usuario completado");

    return {
      success: true,
      message: "Usuario obtenido correctamente",
      data: user,
    };
  } catch (error) {
    return {
      success: false,
      message: "Error al obtener el usuario",
    };
  }
}

export async function uploadImage(
  formData: FormData
): Promise<ActionResponse<unknown>> {
  try {
    const session = await auth();
    const image = formData.get("image") as File;

    if (!image) {
      return {
        success: false,
        message: "La imagen no ha sido subida",
      };
    }

    const bytes = await image.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const filePath = path.join(process.cwd(), "public/images", image.name);
    await writeFile(filePath, buffer);

    const res = await cloudinary.uploader.upload(filePath, {
      folder: "task-users",
    });
    const url = res.secure_url;
    const imageId = res.public_id;

    await prisma.user.update({
      where: {
        id: session?.user.id,
      },
      data: {
        imageUrl: url,
        imageId,
      },
    });

    console.log("Subida de imagen completada");

    return {
      success: true,
      message: "La imagen se ha subido",
    };
  } catch (error) {
    return {
      success: false,
      message: "Error al subir imagen",
    };
  }
}

export async function removeImage(): Promise<ActionResponse<unknown>> {
  try {
    const session = await auth();
    const getUser = await prisma.user.findUnique({
      where: {
        id: session?.user.id,
      },
    });

    if (!getUser) {
      return {
        success: false,
        message: "Usuario no encontrado",
      };
    }

    const publicId = getUser.imageId ?? "";
    const res = await cloudinary.uploader.destroy(publicId);

    if (res.result !== "ok") {
      return {
        success: false,
        message: "Error al remover imagen",
      };
    }

    await prisma.user.update({
      where: {
        id: session?.user.id,
      },
      data: {
        imageId: null,
        imageUrl: null,
      },
    });
    revalidatePath("/app/users/");
    console.log("Remoción de imagen completada");
    return {
      success: true,
      message: "La imagen ha sido removida",
    };
  } catch (error) {
    return {
      success: false,
      message: "Error al subir imagen",
    };
  }
}

type TUser = {
  name: string;
  email: string;
  phone: string | null;
  address: string | null;
  city: string | null;
  state: string | null;
  zip: string | null;
  country: string | null;
};

export async function updateUser(user: TUser): Promise<ActionResponse<string>> {
  try {
    const session = await auth();
    const changedUser = await prisma.user.update({
      where: {
        id: session?.user.id,
      },
      data: {
        email: user.email,
        Partner: {
          update: {
            name: user.name,
            email: user.email,
            phone: user.phone,
            address: user.address,
            city: user.city,
            state: user.state,
            zip: user.zip,
            country: user.country,
          },
        },
      },
    });

    if (!changedUser) {
      return {
        success: false,
        message: "No se pudo editar el usuario",
      };
    }

    revalidatePath("/app/users");

    return {
      success: true,
      message: "El partner se ha editado",
      data: changedUser.email,
    };
  } catch (error) {
    return {
      success: false,
      message: "Error al editar Partner",
    };
  }
}
