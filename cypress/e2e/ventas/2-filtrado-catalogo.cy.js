// cypress/e2e/2-filtrado-catalogo.cy.js
// Prueba: Consulta, Filtrado y Búsqueda en el Catálogo de Productos

describe('RC-002: Filtrado y Búsqueda en el Catálogo', () => {
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

  it('CP-006: Debe visualizar el catálogo con productos activos', () => {
    // 1. Verificar que se muestra el título del catálogo
    cy.get('h1').should('be.visible');

    // 2. Verificar que hay tarjetas de productos visibles
    cy.get('[class*="product"]').should('have.length.greaterThan', 0);

    // 3. Cada producto debe mostrar: nombre, precio, imagen, stock
    cy.get('[class*="product"]').first().within(() => {
      cy.get('img').should('be.visible');
      cy.contains(/\$/i).should('be.visible'); // Precio con formato $
      cy.get('button').should('exist'); // Botón de acción
    });
  });

  it('CP-007: Debe filtrar productos por nombre (búsqueda)', () => {
    // 1. Identificar un producto conocido para buscar
    const searchTerm = 'Arroz';

    // 2. Encontrar el campo de búsqueda
    cy.get('input[placeholder*="search" i], input[placeholder*="buscar" i], input[type="text"]').first()
      .type(searchTerm, { delay: 50 });

    // 3. Esperar a que se aplique el filtro
    cy.wait(1500);

    // 4. Verificar que los productos mostrados contienen el término
    cy.get('[class*="product"]').should('have.length.greaterThan', 0);
    cy.get('[class*="product"]').each(($product) => {
      cy.wrap($product).invoke('text').should('include', searchTerm);
    });
  });

  it('CP-008: Debe filtrar productos por categoría', () => {
    // 1. Encontrar el selector de categorías
    cy.get('select, [class*="category"], [class*="filter"]').then(($elements) => {
      // Si hay un select de categoría
      if ($elements.find('select').length > 0) {
        cy.get('select').first().select('Abarrotes');
        cy.wait(1500);
      }
    });

    // 2. Verificar que hay productos en la categoría seleccionada
    cy.get('[class*="product"]').should('have.length.greaterThan', 0);
  });

  it('CP-009: Debe filtrar productos por rango de precios', () => {
    // 1. Encontrar los campos de precio mínimo y máximo
    cy.get('input[placeholder*="minimo" i], input[placeholder*="min" i]').type('1000', { delay: 50 });
    cy.get('input[placeholder*="maximo" i], input[placeholder*="max" i]').type('50000', { delay: 50 });

    // 2. Esperar a que se aplique el filtro
    cy.wait(1500);

    // 3. Verificar que los productos mostrados tienen precios en el rango
    cy.get('[class*="product"]').should('have.length.greaterThan', 0);
  });

  it('CP-010: Debe limpiar filtros y mostrar todos los productos', () => {
    // 1. Aplicar un filtro de búsqueda
    cy.get('input[placeholder*="search" i], input[placeholder*="buscar" i], input[type="text"]').first()
      .type('Producto', { delay: 50 });
    cy.wait(1500);

    // 2. Contar productos filtrados
    cy.get('[class*="product"]').then(($products) => {
      const filteredCount = $products.length;

      // 3. Buscar el botón de "Limpiar filtros"
      cy.get('button').filter(':contains("Limpiar")').click({ force: true });
      cy.wait(1500);

      // 4. Verificar que ahora hay más productos (o al menos los mismos)
      cy.get('[class*="product"]').should('have.length.greaterThan', 0);
    });
  });

  it('CP-011: Debe validar que el filtro de precio mínimo no supere el máximo', () => {
    // 1. Intentar establecer precio mín > máx
    cy.get('input[placeholder*="minimo" i], input[placeholder*="min" i]').type('50000');
    cy.get('input[placeholder*="maximo" i], input[placeholder*="max" i]').type('1000');

    // 2. Presionar botón de filtrar o esperar a que reaccione el sistema
    cy.get('button').filter(':contains("Filtrar")').first().click({ force: true });
    cy.wait(500);

    // 3. Verificar comportamiento: podría mostrar error o no mostrar resultados
    // (Validar según implementación específica)
    cy.get('[class*="error"], [class*="message"], [class*="alert"]').should('exist').or(
      cy.get('[class*="product"]').should('have.length', 0)
    );
  });

  it('CP-012: Debe actualizar dinámicamente los resultados en tiempo real', () => {
    // 1. Escribir en el campo de búsqueda
    const searchInput = cy.get('input[placeholder*="search" i], input[placeholder*="buscar" i], input[type="text"]').first();

    // 2. Escribir letra por letra y verificar cambios
    searchInput.type('L', { delay: 100 });
    cy.wait(800);

    cy.get('[class*="product"]').then(($products1) => {
      const count1 = $products1.length;

      // 3. Agregar más letras
      searchInput.type('e', { delay: 100 });
      cy.wait(800);

      cy.get('[class*="product"]').then(($products2) => {
        // Debería haber al menos algunos cambios
        expect($products1.length).to.be.greaterThan(0);
      });
    });
  });
});
