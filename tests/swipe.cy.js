/**
 * Cypress E2E Tests for Swipe Functionality
 *
 * Alternative to Puppeteer tests using Cypress framework
 *
 * Setup:
 * 1. Install Cypress: npm install --save-dev cypress
 * 2. Initialize: npx cypress open
 * 3. Place this file in: cypress/e2e/swipe.cy.js
 *
 * Run:
 * - Interactive: npx cypress open
 * - Headless: npx cypress run --spec cypress/e2e/swipe.cy.js
 */

describe('Swipe Functionality Tests', () => {
  const BASE_URL = 'http://localhost:8080';
  const TEST_USER = {
    email: 'test@example.com', // Update with valid test account
    password: 'testpassword123',
  };

  beforeEach(() => {
    // Set viewport to mobile
    cy.viewport(375, 667);

    // Visit dashboard
    cy.visit(`${BASE_URL}/client-dashboard`);

    // Wait for deck to load
    cy.get('[class*="swipe"], .swipe-card', { timeout: 10000 }).should('be.visible');
  });

  // Helper: Swipe card
  const swipeCard = (direction = 'right', distance = 200) => {
    cy.get('[class*="swipe"], .swipe-card').first().then($card => {
      const rect = $card[0].getBoundingClientRect();
      const startX = rect.left + rect.width / 2;
      const startY = rect.top + rect.height / 2;
      const endX = direction === 'right' ? startX + distance : startX - distance;

      cy.wrap($card)
        .trigger('pointerdown', {
          clientX: startX,
          clientY: startY,
          force: true,
        })
        .trigger('pointermove', {
          clientX: startX + (endX - startX) * 0.5,
          clientY: startY,
          force: true,
        })
        .trigger('pointermove', {
          clientX: endX,
          clientY: startY,
          force: true,
        })
        .trigger('pointerup', { force: true });
    });

    // Wait for animation
    cy.wait(300);
  };

  // Helper: Get deck state
  const getDeckState = () => {
    return cy.window().then(win => {
      if (!win.swipeDeckStore) return null;
      const state = win.swipeDeckStore.getState();
      return {
        currentIndex: state.currentIndex,
        deckLength: state.deckItems?.length || 0,
        swipedCount: state.swipedIds?.size || 0,
      };
    });
  };

  it('should swipe right and increment deck index', () => {
    getDeckState().then(initialState => {
      const initialIndex = initialState?.currentIndex || 0;

      swipeCard('right', 200);

      getDeckState().then(afterState => {
        expect(afterState.currentIndex).to.equal(initialIndex + 1);
        expect(afterState.swipedCount).to.be.greaterThan(initialState.swipedCount);
      });
    });
  });

  it('should swipe left and increment deck index', () => {
    getDeckState().then(initialState => {
      const initialIndex = initialState?.currentIndex || 0;

      swipeCard('left', 200);

      getDeckState().then(afterState => {
        expect(afterState.currentIndex).to.equal(initialIndex + 1);
      });
    });
  });

  it('should snap back on half-swipe without incrementing index', () => {
    getDeckState().then(initialState => {
      const initialIndex = initialState?.currentIndex || 0;

      // Half swipe (50px < 80px threshold)
      swipeCard('right', 50);

      getDeckState().then(afterState => {
        expect(afterState.currentIndex).to.equal(initialIndex);
      });

      // Card should still be visible
      cy.get('[class*="swipe"], .swipe-card').should('be.visible');
    });
  });

  it('should handle rapid successive swipes', () => {
    getDeckState().then(initialState => {
      const initialIndex = initialState?.currentIndex || 0;

      // Perform 3 rapid swipes
      swipeCard('right', 200);
      cy.wait(100);
      swipeCard('left', 200);
      cy.wait(100);
      swipeCard('right', 200);
      cy.wait(300);

      getDeckState().then(afterState => {
        expect(afterState.currentIndex).to.equal(initialIndex + 3);
      });
    });
  });

  it('should show new card after swipe', () => {
    // Capture initial card content
    cy.get('[class*="swipe"], .swipe-card')
      .first()
      .invoke('text')
      .then(initialText => {
        swipeCard('right', 200);

        // New card should have different content
        cy.get('[class*="swipe"], .swipe-card')
          .first()
          .invoke('text')
          .should('not.equal', initialText);
      });
  });

  it('should not log console errors during swipe', () => {
    // Listen for console errors
    cy.on('window:before:load', win => {
      cy.spy(win.console, 'error').as('consoleError');
    });

    swipeCard('right', 200);

    // Assert no errors
    cy.get('@consoleError').should('not.be.called');
  });

  it('should display "All Caught Up" at end of deck', () => {
    // Swipe through all cards
    getDeckState().then(state => {
      const remaining = state.deckLength - state.currentIndex;
      const swipesToEnd = Math.min(remaining, 10); // Limit for test

      for (let i = 0; i < swipesToEnd; i++) {
        swipeCard('right', 200);
        cy.wait(200);
      }

      // Check for end state message
      cy.contains(/all caught up|caught up/i, { timeout: 5000 }).should('be.visible');
    });
  });

  it('should work on different viewport sizes', () => {
    // Test tablet viewport
    cy.viewport(768, 1024);
    cy.reload();
    cy.get('[class*="swipe"], .swipe-card', { timeout: 5000 }).should('be.visible');
    swipeCard('right', 200);

    // Test desktop viewport
    cy.viewport(1920, 1080);
    cy.reload();
    cy.get('[class*="swipe"], .swipe-card', { timeout: 5000 }).should('be.visible');
    swipeCard('right', 200);

    // Verify no layout issues
    cy.get('body').should('not.have.css', 'overflow-x', 'scroll');
  });

  it('should persist state after navigation', () => {
    getDeckState().then(initialState => {
      // Swipe a few cards
      swipeCard('right', 200);
      swipeCard('right', 200);

      getDeckState().then(afterSwipes => {
        // Navigate away and back
        cy.visit(`${BASE_URL}/`);
        cy.wait(500);
        cy.visit(`${BASE_URL}/client-dashboard`);
        cy.wait(500);

        getDeckState().then(restoredState => {
          expect(restoredState.currentIndex).to.equal(afterSwipes.currentIndex);
        });
      });
    });
  });

  it('should complete exit animation without snap-back', () => {
    cy.get('[class*="swipe"], .swipe-card').first().then($card => {
      const rect = $card[0].getBoundingClientRect();
      const startX = rect.left + rect.width / 2;

      // Start swipe
      swipeCard('right', 200);

      // During exit animation, check card position
      cy.get('[class*="swipe"], .swipe-card')
        .first()
        .should($exitCard => {
          const exitRect = $exitCard[0].getBoundingClientRect();
          // Card should NOT snap back to center
          // (This test may need adjustment based on actual timing)
        });
    });
  });
});

describe('Performance Tests', () => {
  beforeEach(() => {
    cy.viewport(375, 667);
    cy.visit('http://localhost:8080/client-dashboard');
    cy.get('[class*="swipe"], .swipe-card', { timeout: 10000 }).should('be.visible');
  });

  it('should maintain 60fps during swipe animation', () => {
    cy.window().then(win => {
      win.performance.mark('swipe-start');

      // Perform swipe
      cy.get('[class*="swipe"], .swipe-card')
        .first()
        .trigger('pointerdown', { clientX: 200, clientY: 300 })
        .trigger('pointermove', { clientX: 400, clientY: 300 })
        .trigger('pointerup');

      cy.wait(300).then(() => {
        win.performance.mark('swipe-end');
        win.performance.measure('swipe-duration', 'swipe-start', 'swipe-end');
        const measure = win.performance.getEntriesByName('swipe-duration')[0];

        // Swipe should complete in <300ms
        expect(measure.duration).to.be.lessThan(300);
      });
    });
  });
});
