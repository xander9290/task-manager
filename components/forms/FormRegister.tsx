"use client";

import { userRegister } from "@/actions/user-action";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button, Col, Container, Form, Row, Spinner } from "react-bootstrap";
import { useForm, SubmitHandler } from "react-hook-form";
import toast from "react-hot-toast";

type TInputs = {
  name: string;
  email: string;
  password: string;
};

function FormRegister() {
  const router = useRouter();
  const [validating, setValidating] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<TInputs>();

  const onSubmit: SubmitHandler<TInputs> = async (data) => {
    setValidating(true);
    const res = await userRegister(data);

    if (!res.success) {
      toast.error(res.message, { position: "top-right" });
      setValidating(false);
      return;
    }

    toast.success(res.message, { position: "top-right" });
    setValidating(false);
    reset();
    router.replace("/auth/login");
  };

  return (
    <Container>
      <Row className="justify-content-center">
        <Col xs={12} sm={10} md={6} lg={5} xl={4} className="mt-5">
          <Form className="card shadow" onSubmit={handleSubmit(onSubmit)}>
            <div className="card-header d-flex justify-content-between align-items-center">
              <h4 className="card-title">Registro</h4>
              <Link className="btn btn-info btn-sm" href="/auth/login">
                Acceder
              </Link>
            </div>
            <fieldset className="card-body" disabled={validating}>
              <Form.Group className="mb-3" controlId="formBasicName">
                <Form.Label>Nombre</Form.Label>
                <Form.Control
                  type="text"
                  autoComplete="off"
                  placeholder="Ingresa tu nombre"
                  isInvalid={!!errors.name}
                  {...register("name", {
                    required: "El nombre es obligatorio",
                    minLength: {
                      value: 2,
                      message: "El nombre debe tener al menos 2 caracteres",
                    },
                    maxLength: {
                      value: 50,
                      message: "El nombre no puede tener más de 50 caracteres",
                    },
                  })}
                />
                <Form.Control.Feedback type="invalid">
                  {errors.name?.message}
                </Form.Control.Feedback>
              </Form.Group>
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

              <Form.Group className="mb-3">
                <Button type="submit">
                  {validating && (
                    <Spinner animation="border" size="sm" className="me-2" />
                  )}
                  Registrarse
                </Button>
              </Form.Group>
            </fieldset>
          </Form>
        </Col>
      </Row>
    </Container>
  );
}

export default FormRegister;
