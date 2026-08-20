describe('Eliminar producto', () => {
  it('Debe eliminar un producto correctamente', () => {

    const email = 'test@mercapleno.com';
    const password = '123456';

    cy.visit('http://localhost:5173/login');

    cy.get('#email')
      .type(email);

    cy.get('#password')
      .type(password);

    cy.contains('button', 'Ingresar')
      .click();

    cy.get('#securityCode')
      .should('be.visible');

    cy.request({
      method: 'GET',
      url: `http://localhost:4000/api/test/ultimo-codigo?email=${encodeURIComponent(email)}`
    }).then((response) => {
      expect(response.status).to.equal(200);
      expect(response.body.success).to.equal(true);

      cy.get('#securityCode')
        .type(response.body.codigo);

      cy.contains('button', 'Verificar codigo')
        .click();
    });

    cy.url()
      .should('not.include', '/login');

    cy.contains('Ir a Inventario')
      .click();

    cy.url()
      .should('include', '/products/admin');

    cy.get('#product-status')
      .select('todos');

    cy.contains('td', 'Choco Cono Editado')
      .closest('tr')
      .within(() => {

        cy.contains('button', 'Eliminar')
          .should('be.visible')
          .click();
      });

    cy.contains('Choco Cono Editado')
      .should('not.exist');
  });
});