"use client";

import { useState } from "react";
import Link from "next/link";
import { Button, Col, Container, Form, Row, Spinner } from "react-bootstrap";
import { useForm, SubmitHandler } from "react-hook-form";
import { userLogin } from "@/actions/user-action";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";

type TInputs = {
  email: string;
  password: string;
};

function FormLogin() {
  const router = useRouter();
  const [validating, setValidating] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<TInputs>();

  const onSubmit: SubmitHandler<TInputs> = async (data) => {
    setValidating(true);
    const res = await userLogin(data);

    console.log(res);

    if (!res.success) {
      toast.error(res.message, { position: "top-right" });
      setValidating(false);
      return;
    }
    toast.success(res.message, { position: "top-right" });
    router.replace("/app");
  };
  return (
    <Container>
      <Row className="justify-content-center">
        <Col xs={12} sm={10} md={6} lg={5} xl={4} className="mt-5">
          <Form className="card shadow" onSubmit={handleSubmit(onSubmit)}>
            <div className="card-header  d-flex justify-content-between align-items-center">
              <h4 className="card-title">Acceso</h4>
              <Link className="btn btn-info btn-sm" href="/auth/register">
                Registro
              </Link>
            </div>
            <fieldset className="card-body" disabled={validating}>
              <Form.Group className="mb-3" controlId="formBasicEmail">
                <Form.Label>Correo electrónico</Form.Label>
                <Form.Control
                  type="email"
                  autoComplete="off"
                  placeholder="Ingresa tu correo electrónico"
                  isInvalid={!!errors.email}
                  {...register("email", {
                    required: "El correo electrónico es obligatorio",
                    pattern: {
                      value: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
                      message: "El correo electrónico no es válido",
                    },
                  })}
                />
                <Form.Control.Feedback type="invalid">
                  {errors.email?.message}
                </Form.Control.Feedback>
              </Form.Group>

              <Form.Group className="mb-3" controlId="formBasicPassword">
                <Form.Label>Contraseña</Form.Label>
                <Form.Control
                  className="text-center"
                  type="password"
                  autoComplete="off"
                  placeholder="Contraseña"
                  isInvalid={!!errors.password}
                  {...register("password", {
                    required: "La contraseña es obligatoria",
                    minLength: {
                      value: 4,
                      message: "La contraseña debe tener al menos 4 caracteres",
                    },
                    maxLength: {
                      value: 8,
                      message:
                        "La contraseña no puede tener más de 8 caracteres",
                    },
                  })}
                />
                <Form.Control.Feedback type="invalid">
                  {errors.password?.message}
                </Form.Control.Feedback>
              </Form.Group>

              <Form.Group className="mb-3 d-grid">
                <Button type="submit">
                  {validating && (
                    <Spinner animation="border" size="sm" className="me-2" />
                  )}
                  Iniciar sesión
                </Button>
              </Form.Group>
            </fieldset>
          </Form>
        </Col>
      </Row>
    </Container>
  );
}

export default FormLogin;
