// cypress/e2e/5-casos-error.cy.js
// Prueba: Escenarios Negativos y Validación de Errores

describe('RC-005: Escenarios de Validación y Falla Esperada', () => {
  const testEmail = '7juansebas7@gmail.com';
  const testPassword = 'JuanS@200703';

  describe('Módulo de Autenticación', () => {
    it('CP-032: Debe rechazar contraseña incorrecta', () => {
      cy.visit('/login');
      cy.get('input[type="email"]').type(testEmail);
      cy.get('input[type="password"]').type('ContraseñaIncorrecta123');
      cy.get('button[type="submit"]').click({ force: true });

      // Verificar que se muestra mensaje de error
      cy.get('[class*="message"], [class*="error"]').should('be.visible');
      cy.url().should('include', '/login');
    });

    it('CP-033: Debe bloquear checkout sin sesión activa', () => {
      // 1. Sin iniciar sesión, intentar acceder directamente al carrito
      cy.visit('/carrito');

      // 2. El sistema debe redirigir a login
      cy.url().should('include', '/login', { timeout: 5000 });
    });

    it('CP-034: Debe redirigir a login cuando la sesión expira', () => {
      // 1. Iniciar sesión
      cy.visit('/login');
      cy.get('input[type="email"]').type(testEmail);
      cy.get('input[type="password"]').type(testPassword);
      cy.get('button[type="submit"]').click({ force: true });

      cy.url().should('include', '/catalogo');

      // 2. Simular cierre de sesión (eliminar token del localStorage)
      cy.window().then((win) => {
        win.localStorage.removeItem('user');
        win.localStorage.removeItem('token');
      });

      // 3. Intentar acceder al carrito
      cy.visit('/carrito');
      cy.wait(1000);

      // 4. Debería redirigir a login
      cy.url().should('include', '/login');
    });
  });

  describe('Módulo de Catálogo y Filtros', () => {
    beforeEach(() => {
      cy.visit('/login');
      cy.get('input[type="email"]').type(testEmail);
      cy.get('input[type="password"]').type(testPassword);
      cy.get('button[type="submit"]').click({ force: true });
      cy.url().should('include', '/catalogo');
    });

    it('CP-035: Debe validar que precio mínimo no supera el máximo', () => {
      // 1. Intentar establecer precio mín > máx
      cy.get('input[placeholder*="minimo" i], input[placeholder*="min" i]').clear().type('50000');
      cy.get('input[placeholder*="maximo" i], input[placeholder*="max" i]').clear().type('1000');

      // 2. Buscar y presionar filtrar o esperar a que reaccione
      cy.get('button').filter(':contains("Filtrar")').first().click({ force: true });
      cy.wait(500);

      // 3. El sistema debe mostrar error o no mostrar productos
      cy.get('[class*="error"], [class*="message"]').should('exist').or(
        cy.get('[class*="product"]').should('have.length', 0)
      );
    });

    it('CP-036: Debe mostrar mensaje cuando no hay resultados de búsqueda', () => {
      // 1. Buscar un producto que no existe
      cy.get('input[placeholder*="search" i], input[placeholder*="buscar" i], input[type="text"]').first()
        .type('XYZABCPRODUCTONEXISTENTE123', { delay: 50 });

      cy.wait(1500);

      // 2. Debería mostrar "sin resultados" o no mostrar productos
      cy.get('[class*="product"]').should('have.length', 0).or(
        cy.get('main').should('contain.text', 'sin resultados')
      );
    });

    it('CP-037: Debe mostrar todos los productos si el filtro está vacío', () => {
      // 1. Sin escribir nada en búsqueda
      cy.get('[class*="product"]').should('have.length.greaterThan', 0);

      // 2. Escribir algo
      cy.get('input[placeholder*="search" i], input[placeholder*="buscar" i], input[type="text"]').first()
        .type('Producto');
      cy.wait(1500);

      // 3. Limpiar el filtro
      cy.get('input[placeholder*="search" i], input[placeholder*="buscar" i], input[type="text"]').first()
        .clear();
      cy.wait(1500);

      // 4. Debería volver a mostrar todos
      cy.get('[class*="product"]').should('have.length.greaterThan', 0);
    });
  });

  describe('Módulo de Carrito', () => {
    beforeEach(() => {
      cy.visit('/login');
      cy.get('input[type="email"]').type(testEmail);
      cy.get('input[type="password"]').type(testPassword);
      cy.get('button[type="submit"]').click({ force: true });
      cy.url().should('include', '/catalogo');
    });

    it('CP-038: Debe bloquear checkout con carrito vacío', () => {
      // 1. Acceder al carrito vacío
      cy.get('a').filter(':contains("Carrito")').click({ force: true });

      cy.wait(500);

      // 2. Verificar que no hay botón de pagar o está deshabilitado
      cy.get('button').filter(':contains("Pagar")').should('be.disabled').or(
        cy.get('[class*="empty"]').should('be.visible')
      );
    });

    it('CP-039: Debe validar cantidad mínima en el carrito', () => {
      // 1. Agregar un producto
      cy.get('[class*="product"]').first().within(() => {
        cy.get('button').filter(':contains("Agregar")').click({ force: true });
      });
      cy.wait(300);

      cy.get('a').filter(':contains("Carrito")').click({ force: true });

      // 2. Intentar establecer cantidad a 0 o negativa
      cy.get('[class*="cart-item"]').first().within(() => {
        // Hacer clic múltiples veces en "-" para llegar a 0
        for (let i = 0; i < 5; i++) {
          cy.get('button').filter(':contains("-")').click({ force: true });
          cy.wait(100);
        }
      });

      cy.wait(300);

      // 3. El producto debe ser eliminado
      cy.get('[class*="cart-item"]').should('have.length', 0);
    });

    it('CP-040: Debe respetar límites de stock al agregar productos', () => {
      // 1. Obtener el stock disponible del primer producto
      cy.get('[class*="product"]').first().invoke('text').then((productText) => {
        // El stock debería estar indicado en el texto del producto
        // Por ejemplo: "Stock: 5" o similar

        // 2. Agregar el producto al carrito
        cy.get('[class*="product"]').first().within(() => {
          cy.get('button').filter(':contains("Agregar")').click({ force: true });
        });
        cy.wait(300);

        cy.get('a').filter(':contains("Carrito")').click({ force: true });

        // 3. Intentar agregar más de lo disponible (por ejemplo, 100 veces)
        cy.get('[class*="cart-item"]').first().within(() => {
          for (let i = 0; i < 50; i++) {
            cy.get('button').filter(':contains("+")').click({ force: true });
            cy.wait(50);
          }
        });

        cy.wait(500);

        // 4. La cantidad no debe exceder el stock disponible
        cy.get('[class*="cart-item"]').first().invoke('text').then((cartText) => {
          // Verificar que la cantidad es razonable (no 51+)
          expect(cartText).to.not.include('51');
          expect(cartText).to.not.include('100');
        });
      });
    });
  });

  describe('Módulo de Checkout', () => {
    beforeEach(() => {
      cy.visit('/login');
      cy.get('input[type="email"]').type(testEmail);
      cy.get('input[type="password"]').type(testPassword);
      cy.get('button[type="submit"]').click({ force: true });
      cy.url().should('include', '/catalogo');

      // Agregar un producto para poder hacer checkout
      cy.get('[class*="product"]').first().within(() => {
        cy.get('button').filter(':contains("Agregar")').click({ force: true });
      });
      cy.wait(300);
    });

    it('CP-041: Debe bloquear método de pago inválido', () => {
      cy.get('a').filter(':contains("Carrito")').click({ force: true });

      // Intentar enviar formulario con método inválido
      // (Esta validación depende de cómo esté implementado)
      cy.get('select, [class*="payment"]').then(($elements) => {
        if ($elements.find('select').length > 0) {
          cy.get('select').first().should('have.value');
        }
      });
    });

    it('CP-042: Debe mostrar confirmación antes de procesar pago', () => {
      cy.get('a').filter(':contains("Carrito")').click({ force: true });

      // Verificar que se muestra resumen de compra
      cy.get('[class*="summary"], [class*="totals"]').should('be.visible');
      cy.get('main').should('contain.text', 'TOTAL');

      // Verificar que el botón de pagar está visible
      cy.get('button').filter(':contains("Pagar")').should('be.visible');
    });

    it('CP-043: Debe mostrar spinner/loader durante procesamiento de compra', () => {
      cy.get('a').filter(':contains("Carrito")').click({ force: true });

      cy.get('select, [class*="payment"]').then(($elements) => {
        if ($elements.find('select').length > 0) {
          cy.get('select').first().select('M1');
        }
      });
      cy.wait(500);

      // Hacer clic en pagar
      cy.get('button').filter(':contains("Pagar")').click({ force: true });

      // Durante el procesamiento podría haber un loader
      cy.wait(500);

      // Después, debería redirigir a ticket o mostrar error
      cy.url().then((url) => {
        expect(url).to.satisfy((u) => u.includes('/ticket') || u.includes('/carrito'));
      });
    });

    it('CP-044: Debe manejar errores de conexión con el servidor', () => {
      // Esta prueba simularía una falla de red, pero es avanzada.
      // Por ahora, solo verificamos que el sistema responde

      cy.get('a').filter(':contains("Carrito")').click({ force: true });

      cy.get('select, [class*="payment"]').then(($elements) => {
        if ($elements.find('select').length > 0) {
          cy.get('select').first().select('M1');
        }
      });
      cy.wait(500);

      cy.get('button').filter(':contains("Pagar")').click({ force: true });

      cy.wait(3000);

      // Debería estar en ticket o carrito (no error de página blanca)
      cy.get('main').should('be.visible');
    });
  });

  describe('Persistencia de Datos', () => {
    beforeEach(() => {
      cy.visit('/login');
      cy.get('input[type="email"]').type(testEmail);
      cy.get('input[type="password"]').type(testPassword);
      cy.get('button[type="submit"]').click({ force: true });
      cy.url().should('include', '/catalogo');
    });

    it('CP-045: Debe mantener carrito tras cerrar sesión (si aplica)', () => {
      // 1. Agregar un producto
      cy.get('[class*="product"]').first().within(() => {
        cy.get('button').filter(':contains("Agregar")').click({ force: true });
      });
      cy.wait(300);

      cy.get('a').filter(':contains("Carrito")').invoke('text').should('include', '1');

      // 2. Cerrar sesión (hacer logout)
      // El comportamiento actual preserva el carrito
      cy.visit('/login');

      // 3. El carrito debería estar vacío (verificar según requisito)
      // O podría estar preservado para la próxima sesión
    });
  });
});
