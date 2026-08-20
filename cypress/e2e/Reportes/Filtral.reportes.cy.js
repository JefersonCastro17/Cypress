describe('Filtrar reportes', () => {

  const email = 'test@mercapleno.com';
  const password = '123456';
  const iniciarSesion = () => {

    cy.session('usuario-admin', () => {

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
    });
  };

  it('Debe filtrar reportes por rango de meses', () => {

    iniciarSesion();

    cy.visit('http://localhost:5173/');

    cy.contains('Ir a Reportes')
      .should('be.visible')
      .click();

    cy.get('#mesInicio')
      .should('be.visible')
      .type('2025-12');

    cy.get('#mesFin')
      .should('be.visible')
      .type('2026-01');

    cy.contains('button', 'Actualizar')
      .should('be.visible')
      .click();
  });
});