import './commands'

Cypress.on('uncaught:exception', () => false);

Cypress.Commands.overwrite('visit', (originalFn, url, options) => {
	return originalFn(url, { ...options, timeout: 10000 });
});

Cypress.Commands.overwrite('click', (originalFn, subject, options) => {
	return originalFn(subject, { ...options, timeout: 8000 });
});

afterEach(() => {
	cy.screenshot();
});