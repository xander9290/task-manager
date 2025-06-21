import { auth } from "@/libs/auth";
import Link from "next/link";
import { redirect } from "next/navigation";

export default async function Home() {
  const session = await auth();
  if (session) return redirect("/app");
  return (
    <div className="container text-center mt-5">
      <h1 className="display-3 mb-4">Bienvenido a Task Manager</h1>
      <p className="lead mb-4">
        Organiza y gestiona tus tareas personales de manera eficiente.
        <br />
        Crea, administra y haz seguimiento a tus pendientes para estar siempre
        al día.
      </p>
      <div className="d-flex justify-content-center gap-3">
        <Link href="/auth/login" className="btn btn-primary btn-lg">
          Iniciar sesión
        </Link>
        <Link href="/auth/register" className="btn btn-primary btn-lg">
          Registrarse
        </Link>
      </div>
    </div>
  );
}
