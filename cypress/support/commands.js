// Comandos compartidos por las pruebas de autenticacion, catalogo y ventas.

Cypress.Commands.add('login', (email = '7juansebas7@gmail.com', password = 'JuanS@200703') => {
	cy.visit('/login');
	cy.get('input[type="email"]').type(email);
	cy.get('input[type="password"]').type(password);
	cy.get('button[type="submit"]').click({ force: true });
	cy.url().should('include', '/catalogo', { timeout: 8000 });
});

Cypress.Commands.add('addProductToCart', (productIndex = 0) => {
	cy.get('[class*="product"]').eq(productIndex).within(() => {
		cy.get('button').filter(':contains("Agregar")').click({ force: true });
	});
	cy.wait(300);
});

Cypress.Commands.add('navigateToCart', () => {
	cy.get('a').filter(':contains("Carrito")').click({ force: true });
	cy.url().should('include', '/carrito', { timeout: 5000 });
});

Cypress.Commands.add('completeCheckout', (paymentMethod = 'M1') => {
	cy.get('select, [class*="payment"]').then(($elements) => {
		if ($elements.find('select').length > 0) {
			cy.get('select').first().select(paymentMethod);
		}
	});
	cy.wait(500);
	cy.get('button').filter(':contains("Pagar")').click({ force: true });
	cy.wait(3000);
	cy.url().should('include', '/ticket', { timeout: 8000 });
});

Cypress.Commands.add('searchProduct', (searchTerm) => {
	cy.get('input[placeholder*="search" i], input[placeholder*="buscar" i], input[type="text"]').first()
		.type(searchTerm, { delay: 50 });
	cy.wait(1500);
});

Cypress.Commands.add('filterByCategory', (category) => {
	cy.get('select, [class*="category"]').first().select(category);
	cy.wait(1500);
});

Cypress.Commands.add('filterByPrice', (minPrice, maxPrice) => {
	cy.get('input[placeholder*="minimo" i], input[placeholder*="min" i]').type(minPrice);
	cy.get('input[placeholder*="maximo" i], input[placeholder*="max" i]').type(maxPrice);
	cy.wait(1500);
});

Cypress.Commands.add('verifyInCatalog', () => {
	cy.url().should('include', '/catalogo');
	cy.get('[class*="product"]').should('have.length.greaterThan', 0);
});

Cypress.Commands.add('incrementCartQuantity', (itemIndex = 0) => {
	cy.get('[class*="cart-item"]').eq(itemIndex).within(() => {
		cy.get('button').filter(':contains("+")').click({ force: true });
	});
	cy.wait(300);
});

Cypress.Commands.add('decrementCartQuantity', (itemIndex = 0) => {
	cy.get('[class*="cart-item"]').eq(itemIndex).within(() => {
		cy.get('button').filter(':contains("-")').click({ force: true });
	});
	cy.wait(300);
});

Cypress.Commands.add('removeCartItem', (itemIndex = 0) => {
	cy.get('[class*="cart-item"]').eq(itemIndex).within(() => {
		cy.get('button').filter(':contains("Eliminar")').click({ force: true });
	});
	cy.wait(300);
});

Cypress.Commands.add('clearAllCart', () => {
	cy.get('button').filter(':contains("Vaciar")').click({ force: true });
	cy.wait(300);
});

Cypress.Commands.add('getCartTotal', () => cy.get('[class*="totals"]').invoke('text'));

Cypress.Commands.add('verifyEmptyCart', () => {
	cy.get('[class*="cart-item"]').should('have.length', 0);
	cy.get('[class*="cart"]').should('contain.text', 'vacio');
});

Cypress.Commands.add('returnToCatalogFromTicket', () => {
	cy.get('button').filter(':contains("Volver")').click({ force: true });
	cy.url().should('include', '/catalogo', { timeout: 5000 });
});

Cypress.Commands.add('printTicket', () => {
	cy.get('button').filter(':contains("Imprimir")').click({ force: true });
	cy.wait(1000);
});

Cypress.Commands.add('clearFilters', () => {
	cy.get('button').filter(':contains("Limpiar")').click({ force: true });
	cy.wait(1500);
});

Cypress.Commands.add('getCartCount', () => cy.get('a').filter(':contains("Carrito")').invoke('text'));