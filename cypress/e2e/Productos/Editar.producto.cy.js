describe('Editar producto', () => {
  it('Debe editar un producto correctamente', () => {

    const email = 'test@mercapleno.com';
    const password = '123456';

    cy.visit('http://localhost:5173/login');

    cy.get('#email')
      .should('be.visible')
      .type(email);

    cy.get('#password')
      .should('be.visible')
      .type(password);

    cy.contains('button', 'Ingresar')
      .should('be.visible')
      .click();

    cy.get('#securityCode')
      .should('be.visible');

    cy.request({
      method: 'GET',
      url: `http://localhost:4000/api/test/ultimo-codigo?email=${encodeURIComponent(email)}`
    }).then((response) => {
      expect(response.status).to.equal(200);
      expect(response.body.success).to.equal(true);

      const codigo = response.body.codigo;

      cy.get('#securityCode')
        .type(codigo);

      cy.contains('button', 'Verificar codigo')
        .should('be.visible')
        .click();
    });

    cy.url()
      .should('not.include', '/login');

    cy.contains('Ir a Inventario')
      .should('be.visible')
      .click();

    cy.url()
      .should('include', '/products/admin');

    cy.contains('td', 'Choco Cono')
      .closest('tr')
      .within(() => {

        cy.contains('button', 'Editar')
          .click();
      });

    cy.intercept('PUT', '**/api/productos/*')
      .as('updateProduct');

    cy.get('input[name="nombre"]')
      .clear()
      .type('Choco Cono Editado');

    cy.contains('button', 'Guardar cambios')
      .should('be.visible')
      .click();

    cy.wait('@updateProduct', { timeout: 10000 })
      .then((interception) => {

        expect(
          interception.response?.statusCode,
          'El servidor debe responder con status 200'
        ).to.equal(200);
      });

    cy.contains('Choco Cono Editado')
      .should('be.visible');
  });
});