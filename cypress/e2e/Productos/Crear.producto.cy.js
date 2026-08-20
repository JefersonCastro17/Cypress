describe('Crear producto', () => {

  it('Debe crear un producto correctamente', () => {

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

      expect(codigo).to.match(/^\d{6}$/);

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

    cy.contains('button', 'Agregar producto')
      .should('be.visible')
      .click();

    cy.get('input[name="nombre"]')
      .type('Choco Cono');

    cy.get('input[name="precio"]')
      .type('3500');

    cy.get('select[name="id_categoria"]')
      .select('Congelados');

    cy.get('select[name="id_proveedor"]')
      .select('Pedro Martínez');

    cy.get('select[name="estado"]')
      .select('Disponible');

    cy.get('textarea[name="descripcion"]')
      .type('Delicioso helado de chocolate');

    cy.get('.products-modal')
      .contains('button', 'Agregar')
      .click();

    cy.contains('Choco Cono')
      .should('be.visible');
  });
});