// cypress/e2e/1-autenticacion.cy.js
// Prueba: Autenticación como Cliente

describe('RC-001: Autenticación como Cliente', () => {
  const testEmail = '7juansebas7@gmail.com';
  const testPassword = 'JuanS@200703';
  const validUserName = 'Juan Sebastian';

  beforeEach(() => {
    cy.visit('/login');
  });

  it('CP-001: Debe permitir inicio de sesión con credenciales válidas', () => {
    // 1. Verificar que la página de login se cargó
    cy.get('form').should('be.visible');
    cy.get('input[type="email"]').should('be.visible');
    cy.get('input[type="password"]').should('be.visible');

    // 2. Diligenciar los campos de entrada
    cy.get('input[type="email"]').type(testEmail, { delay: 50 });
    cy.get('input[type="password"]').type(testPassword, { delay: 50 });

    // 3. Presionar el botón "Ingresar"
    cy.get('button[type="submit"]').click({ force: true });

    // 4. Verificar que se redirige al catálogo
    cy.url().should('include', '/catalogo', { timeout: 8000 });

    // 5. Verificar que la sesión se activó correctamente
    cy.get('header').should('be.visible');
    cy.get('header').should('contain.text', 'Portal 2');

    // 6. Verificar que el nombre del usuario aparece en el encabezado
    cy.get('header').invoke('text').should('include', validUserName);

    // 7. Verificar que la barra de navegación esté habilitada
    cy.get('a').filter(':contains("Catalogo")').should('be.visible');
    cy.get('a').filter(':contains("Carrito")').should('be.visible');
  });

  it('CP-002: Debe rechazar credenciales inválidas (contraseña incorrecta)', () => {
    // 1. Diligenciar email correcto pero contraseña incorrecta
    cy.get('input[type="email"]').type(testEmail);
    cy.get('input[type="password"]').type('ContraseñaIncorrecta123');

    // 2. Presionar el botón "Ingresar"
    cy.get('button[type="submit"]').click({ force: true });

    // 3. Verificar que se muestra mensaje de error
    cy.get('.message').should('be.visible');
    cy.get('.message').should('contain.text', 'Contraseña incorrecta');

    // 4. Verificar que NO se redirige al catálogo
    cy.url().should('include', '/login');
  });

  it('CP-003: Debe rechazar email que no existe en el sistema', () => {
    // 1. Diligenciar email inexistente
    cy.get('input[type="email"]').type('emailnoexiste@gmail.com');
    cy.get('input[type="password"]').type(testPassword);

    // 2. Presionar el botón "Ingresar"
    cy.get('button[type="submit"]').click({ force: true });

    // 3. Verificar que se muestra mensaje de error
    cy.get('.message').should('be.visible');

    // 4. Verificar que NO se redirige al catálogo
    cy.url().should('include', '/login');
  });

  it('CP-004: Debe validar campos requeridos antes de enviar', () => {
    // 1. Intentar enviar sin diligenciar campos
    cy.get('button[type="submit"]').click({ force: true });

    // 2. Verificar que el navegador muestra validación HTML5
    // (Los campos input[required] deben mostrar validación nativa)
    cy.get('input[type="email"]').then(($input) => {
      expect($input[0].validity.valid).to.be.false;
    });
  });

  it('CP-005: Debe limpiar mensaje de error después de escribir', () => {
    // 1. Diligenciar credenciales incorrectas y enviar
    cy.get('input[type="email"]').type('test@gmail.com');
    cy.get('input[type="password"]').type('incorrecto');
    cy.get('button[type="submit"]').click({ force: true });

    // 2. Verificar que aparece el mensaje de error
    cy.get('.message').should('be.visible');

    // 3. Hacer clic en un campo de entrada (limpiar error)
    cy.get('input[type="email"]').clear();

    // 4. El mensaje debería desaparecer o cambiar de estado
    cy.wait(500);
    cy.get('input[type="email"]').type(testEmail);
  });
});
