"use client";

import { useSession, signOut } from "next-auth/react";
import Link from "next/link";
import { Container, Nav, Navbar, NavDropdown } from "react-bootstrap";

function TopNav() {
  const { data: session } = useSession();
  return (
    <Navbar expand="lg" bg="dark" data-bs-theme="dark" className="sticky-top">
      <Container>
        <Navbar.Brand
          as={Link}
          href="/app"
          className="border border-light rounded px-2 bg-light text-dark"
        >
          Task Manager
        </Navbar.Brand>
        <Navbar.Toggle aria-controls="basic-navbar-nav" />
        <Navbar.Collapse id="basic-navbar-nav">
          <Nav className="me-auto">
            <NavDropdown
              title="Tareas"
              id="basic-nav-dropdown"
              className="text-capitalize"
            >
              <NavDropdown.Item as={Link} href="/app/tasks">
                mis tareas
              </NavDropdown.Item>
            </NavDropdown>
          </Nav>
          <Nav>
            <NavDropdown
              title={
                <>
                  <i className="bi bi-person-circle me-2"></i>
                  <span className="text-capitalize">{session?.user?.name}</span>
                </>
              }
              className="text-capitalize"
            >
              <NavDropdown.Item
                as={Link}
                href={`/app/users/${session?.user?.slug}`}
              >
                mi perfil
              </NavDropdown.Item>
              <NavDropdown.Item onClick={() => signOut()} href="#">
                cerrar sesión
              </NavDropdown.Item>
            </NavDropdown>
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
}

export default TopNav;
