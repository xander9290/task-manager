"use client";

import React, { useEffect, useRef, useState } from "react";
import { User } from "@/libs/definitions";
import { formatDate } from "@/libs/helpers";
import { signOut, useSession } from "next-auth/react";
import {
  Button,
  Col,
  Dropdown,
  DropdownButton,
  Form,
  Row,
} from "react-bootstrap";

import { useForm, SubmitHandler } from "react-hook-form";
import Image from "next/image";
import { removeImage, updateUser, uploadImage } from "@/actions/user-action";
import toast from "react-hot-toast";

type FormUsersProps = {
  user: User | null;
};

type TInputs = {
  name: string;
  email: string;
  phone: string | null;
  address: string | null;
  city: string | null;
  state: string | null;
  zip: string | null;
  country: string | null;
  imageUrl: string | null;
};

function FormUsers({ user }: FormUsersProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(
    user?.imageUrl || null
  );
  const [disabled, setDisabled] = useState(true);

  const { data: session } = useSession();

  const {
    register,
    handleSubmit,
    formState: { errors, isDirty },
  } = useForm<TInputs>({
    defaultValues: {
      name: user?.Partner?.name,
      email: user?.email,
      phone: user?.Partner?.phone,
      address: user?.Partner?.address,
      city: user?.Partner?.city,
      state: user?.Partner?.state,
      zip: user?.Partner?.zip,
      country: user?.Partner?.country,
      imageUrl: user?.imageUrl,
    },
  });

  const onSubmit: SubmitHandler<TInputs> = async (data) => {
    setDisabled(true);
    const toastId = toast.loading("Cargando...", { position: "bottom-right" });
    const res = await updateUser(data);
    if (res.success) {
      toast.success(res.message, { id: toastId });
      if (res.data !== session?.user.email) {
        signOut();
      }
    } else {
      toast.error(res.message, { id: toastId });
      setDisabled(false);
    }
  };

  const handleImage = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (previewUrl !== null) {
      toast.error("Elimina la imagen actual para editar");
      return;
    }
    const file = e.target.files?.[0];
    if (file) {
      const toastId = toast.loading("Subiendo imagen", {
        position: "bottom-right",
      });
      const objectUrl = URL.createObjectURL(file);
      setPreviewUrl(objectUrl);
      const formData = new FormData();
      formData.append("image", file);
      const res = await uploadImage(formData);
      if (res.success) {
        toast.success(res.message, { id: toastId });
      } else {
        toast.error(res.message, { id: toastId });
      }
    }
  };

  const handleRemoveImage = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    await removeImage();
    setPreviewUrl(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  useEffect(() => {
    if (user) {
      if (user.id !== session?.user.id) setDisabled(true);
    }
  }, [user]);
  return (
    <Row className="justify-content-center">
      <Col xs={12} sm={10} md={8} lg={7}>
        <Form className="card mt-1" onSubmit={handleSubmit(onSubmit)}>
          <div className="card-header d-flex justify-content-between align-items-end">
            <h5 className="card-title text-capitalize">
              <span className="ms-2">{user?.Partner?.name}</span>
            </h5>
            <div className="d-flex gap-1">
              {user?.id === session?.user.id && (
                <Button type="submit" size="sm" disabled={!isDirty}>
                  Guardar
                </Button>
              )}
              <Button
                onClick={() => setDisabled(!disabled)}
                type="button"
                variant="dark"
                size="sm"
                title={disabled ? "Desbloquear" : "Bloquear"}
              >
                {disabled ? (
                  <i className="bi bi-lock-fill"></i>
                ) : (
                  <i className="bi bi-unlock-fill"></i>
                )}
              </Button>
              <DropdownButton
                title={<i className="bi bi-gear"></i>}
                size="sm"
                variant="info"
                className="text-capitalize"
              >
                {user?.id === session?.user.id && (
                  <Dropdown.Item href="#">cambiar contraseña</Dropdown.Item>
                )}
                {session?.user.id === user?.id ? null : (
                  <Dropdown.Item href="#">seguir</Dropdown.Item>
                )}
              </DropdownButton>
            </div>
          </div>
          <fieldset className="card-body" disabled={disabled}>
            <div className="row align-items-end">
              <div className="col-md-8">
                <legend>Información de usuario</legend>
              </div>
              <div className="col-md-4 text-end">
                <figure
                  role="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="position-relative d-inline-block figure"
                >
                  <Image
                    src={previewUrl ?? "/user_default.png"}
                    alt="user_image"
                    className="figure-img img-fluid img-thumbnail rounded"
                    width={125}
                    height={125}
                    unoptimized
                    style={{
                      cursor: "pointer",
                      objectFit: "cover", // Hace que la imagen se recorte para llenar el contenedor
                      width: "125px",
                      height: "125px",
                    }} // Cambia el cursor para indicar que es clickeable
                  />
                  {previewUrl && (
                    <button
                      type="button"
                      onClick={handleRemoveImage}
                      className="btn btn-danger btn-sm rounded-circle position-absolute"
                      style={{
                        top: "-8px",
                        right: "-8px",
                        width: "24px",
                        height: "24px",
                        padding: 0,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: "0.75rem",
                      }}
                    >
                      <i className="bi bi-trash-fill"></i>
                    </button>
                  )}
                </figure>
                <Form.Control
                  type="file"
                  accept="image/*"
                  ref={fileInputRef}
                  onChange={handleImage}
                  className="d-none" // Oculta el input
                />
              </div>
            </div>
            <div className="row">
              <Form.Group className="mb-3 col-md-6" controlId="formUserName">
                <Form.Label>Nombre</Form.Label>
                <Form.Control
                  {...register("name", { required: "Este campo es requerido" })}
                  type="text"
                  autoComplete="off"
                  isInvalid={!!errors.name}
                />
                <Form.Control.Feedback type="invalid">
                  {errors.name?.message}
                </Form.Control.Feedback>
              </Form.Group>
              <Form.Group className="mb-3 col-md-6" controlId="formUserEmail">
                <Form.Label>Correo electrónico</Form.Label>
                <Form.Control
                  {...register("email", {
                    required: "Este campo es requerido",
                  })}
                  type="email"
                  autoComplete="off"
                  isInvalid={!!errors.email}
                />
                <Form.Control.Feedback type="invalid">
                  {errors.email?.message}
                </Form.Control.Feedback>
              </Form.Group>
              <Form.Group className="mb-3 col-md-6" controlId="formUserPhone">
                <Form.Label>Teléfono</Form.Label>
                <Form.Control
                  {...register("phone")}
                  type="text"
                  autoComplete="off"
                />
              </Form.Group>
              <Form.Group className="mb-3 col-md-6" controlId="formUserAddress">
                <Form.Label>Dirección</Form.Label>
                <Form.Control
                  {...register("address")}
                  type="text"
                  autoComplete="off"
                />
              </Form.Group>
              <Form.Group className="mb-3 col-md-6" controlId="formUserCity">
                <Form.Label>Ciudad</Form.Label>
                <Form.Control
                  {...register("city")}
                  type="text"
                  autoComplete="off"
                />
              </Form.Group>
              <Form.Group className="mb-3 col-md-6" controlId="formUserState">
                <Form.Label>Estado</Form.Label>
                <Form.Control
                  {...register("state")}
                  type="text"
                  autoComplete="off"
                />
              </Form.Group>
              <Form.Group className="mb-3 col-md-6" controlId="formUserCountry">
                <Form.Label>País</Form.Label>
                <Form.Control
                  {...register("country")}
                  type="text"
                  autoComplete="off"
                />
              </Form.Group>
              <Form.Group className="mb-3 col-md-6" controlId="formUserZip">
                <Form.Label>C.P.</Form.Label>
                <Form.Control
                  {...register("zip")}
                  type="number"
                  autoComplete="off"
                />
              </Form.Group>
            </div>
          </fieldset>
          <div className="card-footer d-flex justify-content-between gap-1">
            <small>Creado: {formatDate(user?.createdAt || "")}</small>
            <small>Última edición: {formatDate(user?.updatedAt || "")}</small>
            <small>Última conexión: {formatDate(user?.lastLogin || "")}</small>
          </div>
        </Form>
      </Col>
    </Row>
  );
}

export default FormUsers;
