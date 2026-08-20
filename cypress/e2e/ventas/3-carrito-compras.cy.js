// cypress/e2e/3-carrito-compras.cy.js
// Prueba: Gestión del Carrito de Compras

describe('RC-003: Gestión del Carrito de Compras', () => {
  const testEmail = '7juansebas7@gmail.com';
  const testPassword = 'JuanS@200703';

  beforeEach(() => {
    // 1. Iniciar sesión
    cy.visit('/login');
    cy.get('input[type="email"]').type(testEmail);
    cy.get('input[type="password"]').type(testPassword);
    cy.get('button[type="submit"]').click({ force: true });

    // 2. Esperar a que cargue el catálogo
    cy.url().should('include', '/catalogo', { timeout: 8000 });
    cy.get('main').should('be.visible');
  });

  it('CP-013: Debe agregar un producto al carrito', () => {
    // 1. Verificar que el carrito está vacío inicialmente
    cy.get('a').filter(':contains("Carrito")').invoke('text').then((text) => {
      // El contador inicial debería ser 0 o no estar visible
      expect(text).to.not.include('1');
    });

    // 2. Hacer clic en el botón "Agregar al carrito" del primer producto
    cy.get('[class*="product"]').first().within(() => {
      cy.get('button').filter(':contains("Agregar")').click({ force: true });
    });

    // 3. Esperar confirmación
    cy.wait(500);

    // 4. Verificar que el contador del carrito se actualiza
    cy.get('a').filter(':contains("Carrito")').invoke('text').should('include', '1');
  });

  it('CP-014: Debe agregar múltiples productos al carrito', () => {
    // 1. Agregar primer producto
    cy.get('[class*="product"]').eq(0).within(() => {
      cy.get('button').filter(':contains("Agregar")').click({ force: true });
    });
    cy.wait(300);

    // 2. Agregar segundo producto
    cy.get('[class*="product"]').eq(1).within(() => {
      cy.get('button').filter(':contains("Agregar")').click({ force: true });
    });
    cy.wait(300);

    // 3. Agregar tercer producto
    cy.get('[class*="product"]').eq(2).within(() => {
      cy.get('button').filter(':contains("Agregar")').click({ force: true });
    });
    cy.wait(300);

    // 4. Verificar que el contador muestra 3
    cy.get('a').filter(':contains("Carrito")').invoke('text').should('include', '3');
  });

  it('CP-015: Debe mostrar el resumen detallado del carrito', () => {
    // 1. Agregar un producto
    cy.get('[class*="product"]').first().within(() => {
      cy.get('button').filter(':contains("Agregar")').click({ force: true });
    });
    cy.wait(300);

    // 2. Acceder al carrito
    cy.get('a').filter(':contains("Carrito")').click({ force: true });
    cy.url().should('include', '/carrito', { timeout: 5000 });

    // 3. Verificar que se muestra el producto agregado
    cy.get('[class*="cart"]').should('be.visible');
    cy.get('main').should('contain.text', 'Carrito');

    // 4. Verificar que se muestran: nombre, cantidad, precio unitario, subtotal
    cy.get('[class*="cart-item"]').first().within(() => {
      cy.get('img').should('be.visible'); // Imagen del producto
      cy.contains(/\$/i).should('be.visible'); // Precio
    });
  });

  it('CP-016: Debe incrementar la cantidad de un producto en el carrito', () => {
    // 1. Agregar un producto
    cy.get('[class*="product"]').first().within(() => {
      cy.get('button').filter(':contains("Agregar")').click({ force: true });
    });
    cy.wait(300);

    // 2. Acceder al carrito
    cy.get('a').filter(':contains("Carrito")').click({ force: true });
    cy.url().should('include', '/carrito');

    // 3. Hacer clic en el botón de incremento (+)
    cy.get('[class*="cart-item"]').first().within(() => {
      cy.get('button').filter(':contains("+")').click({ force: true });
    });

    cy.wait(300);

    // 4. Verificar que la cantidad cambió de 1 a 2
    cy.get('[class*="cart-item"]').first().within(() => {
      cy.get('span').should('contain', '2');
    });
  });

  it('CP-017: Debe decrementar la cantidad de un producto en el carrito', () => {
    // 1. Agregar un producto y luego incrementarlo
    cy.get('[class*="product"]').first().within(() => {
      cy.get('button').filter(':contains("Agregar")').click({ force: true });
    });
    cy.wait(300);

    cy.get('a').filter(':contains("Carrito")').click({ force: true });

    cy.get('[class*="cart-item"]').first().within(() => {
      cy.get('button').filter(':contains("+")').click({ force: true });
    });
    cy.wait(300);

    // 2. Ahora decrementar
    cy.get('[class*="cart-item"]').first().within(() => {
      cy.get('button').filter(':contains("-")').click({ force: true });
    });

    cy.wait(300);

    // 3. Verificar que volvió a 1
    cy.get('[class*="cart-item"]').first().within(() => {
      cy.get('span').should('contain', '1');
    });
  });

  it('CP-018: Debe eliminar un producto cuando la cantidad llega a 0', () => {
    // 1. Agregar un producto
    cy.get('[class*="product"]').first().within(() => {
      cy.get('button').filter(':contains("Agregar")').click({ force: true });
    });
    cy.wait(300);

    cy.get('a').filter(':contains("Carrito")').click({ force: true });

    // 2. Decrementar la cantidad a 0
    cy.get('[class*="cart-item"]').first().within(() => {
      cy.get('button').filter(':contains("-")').click({ force: true });
    });

    cy.wait(300);

    // 3. Verificar que el producto se eliminó del carrito
    cy.get('[class*="cart-item"]').should('have.length', 0);

    // 4. Verificar que el carrito está vacío
    cy.get('[class*="cart"]').should('contain.text', 'vacio');
  });

  it('CP-019: Debe recalcular automáticamente subtotal, IVA y total', () => {
    // 1. Agregar un producto y acceder al carrito
    cy.get('[class*="product"]').first().within(() => {
      cy.get('button').filter(':contains("Agregar")').click({ force: true });
    });
    cy.wait(300);

    cy.get('a').filter(':contains("Carrito")').click({ force: true });

    // 2. Incrementar cantidad 2 veces
    cy.get('[class*="cart-item"]').first().within(() => {
      cy.get('button').filter(':contains("+")').click({ force: true });
    });
    cy.wait(300);

    // 3. Verificar que el subtotal se recalcula
    cy.get('[class*="cart"]').should('contain.text', 'Subtotal');
    cy.get('[class*="cart"]').should('contain.text', 'IVA');
    cy.get('[class*="cart"]').should('contain.text', 'TOTAL');

    // 4. Verificar que los valores son números válidos
    cy.get('[class*="totals"]').invoke('text').then((text) => {
      const hasPrice = /\$[\d,.]+/gi.test(text);
      expect(hasPrice).to.be.true;
    });
  });

  it('CP-020: Debe vaciar el carrito completamente', () => {
    // 1. Agregar dos productos
    cy.get('[class*="product"]').eq(0).within(() => {
      cy.get('button').filter(':contains("Agregar")').click({ force: true });
    });
    cy.wait(300);

    cy.get('[class*="product"]').eq(1).within(() => {
      cy.get('button').filter(':contains("Agregar")').click({ force: true });
    });
    cy.wait(300);

    cy.get('a').filter(':contains("Carrito")').click({ force: true });

    // 2. Verificar que hay 2 productos
    cy.get('[class*="cart-item"]').should('have.length', 2);

    // 3. Hacer clic en "Vaciar carrito"
    cy.get('button').filter(':contains("Vaciar")').click({ force: true });

    // 4. Confirmar que está vacío
    cy.wait(300);
    cy.get('[class*="cart-item"]').should('have.length', 0);
    cy.get('[class*="cart"]').should('contain.text', 'vacio');
  });

  it('CP-021: Debe eliminar un producto individual con el botón eliminar', () => {
    // 1. Agregar dos productos
    cy.get('[class*="product"]').eq(0).within(() => {
      cy.get('button').filter(':contains("Agregar")').click({ force: true });
    });
    cy.wait(300);

    cy.get('[class*="product"]').eq(1).within(() => {
      cy.get('button').filter(':contains("Agregar")').click({ force: true });
    });
    cy.wait(300);

    cy.get('a').filter(':contains("Carrito")').click({ force: true });

    // 2. Hacer clic en el botón "Eliminar" del primer producto
    cy.get('[class*="cart-item"]').first().within(() => {
      cy.get('button').filter(':contains("Eliminar")').click({ force: true });
    });

    cy.wait(300);

    // 3. Verificar que solo queda 1 producto
    cy.get('[class*="cart-item"]').should('have.length', 1);
  });

  it('CP-022: Debe persistir el carrito en la sesión del usuario', () => {
    // 1. Agregar un producto
    cy.get('[class*="product"]').eq(0).within(() => {
      cy.get('button').filter(':contains("Agregar")').click({ force: true });
    });
    cy.wait(300);

    // 2. Navegar a otra sección
    cy.get('a').filter(':contains("Inicio")').click({ force: true });
    cy.wait(500);

    // 3. Regresar al catálogo
    cy.get('a').filter(':contains("Catalogo")').click({ force: true });
    cy.wait(500);

    // 4. El contador del carrito debería seguir mostrando 1
    cy.get('a').filter(':contains("Carrito")').invoke('text').should('include', '1');
  });
});
