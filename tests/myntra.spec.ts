import { test, expect, Page, Locator } from '@playwright/test';

test.setTimeout(150000);

const SEARCH_TEXT = 'men t-shirt';
const COUPON_CODE = 'MYNTRAEXCLUSIVE1';

function moneyToNumber(text: string): number {
  const cleaned = text.replace(/[^\d]/g, '');
  return cleaned ? Number(cleaned) : 0;
}

async function wait(ms: number, page: Page) {
  await page.waitForTimeout(ms);
}

async function typeLikeHuman(locator: Locator, text: string) {
  await locator.click();
  await locator.pressSequentially(text, { delay: 120 });
}

async function applyHighlight(
  locator: Locator,
  page: Page,
  style: { outline: string; shadow: string; radius?: string; bg?: string },
  pause = 1400
) {
  await locator.scrollIntoViewIfNeeded().catch(() => {});
  await locator.hover().catch(() => {});
  await locator.evaluate(
    (el, s) => {
      const h = el as HTMLElement;
      h.style.outline = s.outline;
      h.style.outlineOffset = '4px';
      h.style.boxShadow = s.shadow;
      h.style.borderRadius = s.radius || '10px';
      h.style.transition = 'all 0.25s ease';
      if (s.bg) h.style.background = s.bg;
    },
    style
  );
  await wait(pause, page);
}

async function highlightSuggestion(option: Locator, page: Page) {
  await applyHighlight(
    option,
    page,
    {
      outline: '4px solid #2563eb',
      shadow: '0 0 0 8px rgba(37, 99, 235, 0.22)',
      radius: '8px',
      bg: 'rgba(37, 99, 235, 0.14)'
    },
    1800
  );
}

async function highlightProductCard(card: Locator, page: Page) {
  await applyHighlight(
    card,
    page,
    {
      outline: '4px solid #ff3f6c',
      shadow: '0 0 0 8px rgba(255, 63, 108, 0.18)',
      radius: '12px',
      bg: 'rgba(255, 63, 108, 0.05)'
    },
    1500
  );
}

async function highlightSize(option: Locator, page: Page) {
  await applyHighlight(
    option,
    page,
    {
      outline: '4px solid #14b8a6',
      shadow: '0 0 0 8px rgba(20, 184, 166, 0.20)',
      radius: '10px',
      bg: 'rgba(20, 184, 166, 0.10)'
    },
    1600
  );
}

async function highlightActionButton(button: Locator, page: Page) {
  await button.evaluate((el) => {
    el.scrollIntoView({ behavior: 'instant', block: 'center' });
  }).catch(() => {});
  await applyHighlight(
    button,
    page,
    {
      outline: '4px solid #f59e0b',
      shadow: '0 0 0 10px rgba(245, 158, 11, 0.24)',
      radius: '12px',
      bg: 'rgba(245, 158, 11, 0.08)'
    },
    1800
  );
}

async function highlightCartPage(page: Page) {
  const cartItem = page.locator(
    '[class*="itemContainer"], [class*="itemContainer-base"], [class*="checkout-item"], [class*="cart-item"], li'
  ).first();

  if (await cartItem.isVisible().catch(() => false)) {
    await applyHighlight(
      cartItem,
      page,
      {
        outline: '4px solid #10b981',
        shadow: '0 0 0 10px rgba(16, 185, 129, 0.18)',
        radius: '12px',
        bg: 'rgba(16, 185, 129, 0.05)'
      },
      1800
    );
  }

  const pricePanel = page.locator(
    '[class*="price"], [class*="total"], [class*="summary"], [class*="payment"], [class*="right"]'
  ).first();

  if (await pricePanel.isVisible().catch(() => false)) {
    await applyHighlight(
      pricePanel,
      page,
      {
        outline: '4px solid #ef4444',
        shadow: '0 0 0 10px rgba(239, 68, 68, 0.18)',
        radius: '12px',
        bg: 'rgba(239, 68, 68, 0.04)'
      },
      1800
    );
  }
}

async function closePopupIfPresent(page: Page) {
  const closePopup = page.locator(
    'button[aria-label="Close"], button:has-text("×"), span.sprites-remove'
  ).first();

  if (await closePopup.isVisible().catch(() => false)) {
    await closePopup.hover().catch(() => {});
    await wait(400, page);
    await closePopup.click({ force: true }).catch(() => {});
    await wait(1000, page);
  }
}

async function selectDropdownSuggestion(page: Page) {
  const suggestions = page.locator('li, a, div').filter({ hasText: /men t-shirt/i });
  const count = await suggestions.count();

  for (let i = 0; i < count; i++) {
    const suggestion = suggestions.nth(i);
    const txt = (await suggestion.textContent().catch(() => ''))?.trim().toLowerCase() || '';

    if (
      txt.includes('men') &&
      txt.includes('t-shirt') &&
      await suggestion.isVisible().catch(() => false)
    ) {
      await highlightSuggestion(suggestion, page);
      await suggestion.click({ force: true });
      return true;
    }
  }

  return false;
}

async function getFirstProductUrl(page: Page): Promise<string> {
  const firstCard = page.locator('li.product-base').first();
  await firstCard.waitFor({ state: 'visible' });
  await highlightProductCard(firstCard, page);

  const firstLink = firstCard.locator('a[href*="/buy"]').first();
  const href = await firstLink.getAttribute('href');

  if (!href) throw new Error('Product href not found');

  return href.startsWith('http')
    ? href
    : `https://www.myntra.com/${href.replace(/^\/+/, '')}`;
}

async function getPdpPrice(page: Page): Promise<number> {
  const bodyText = await page.locator('body').innerText();
  const prices = bodyText.match(/₹\s?[\d,]+/g) || [];
  const nums = prices.map(moneyToNumber).filter(n => n > 0);
  return nums.length ? Math.min(...nums) : 0;
}

async function selectFirstVisibleSize(page: Page): Promise<string | null> {
  const sizeList = page.locator('.size-buttons-size-buttons');

  if (!(await sizeList.first().isVisible().catch(() => false))) {
    return null;
  }

  const sizeOptions = sizeList.locator('button, p');
  const count = await sizeOptions.count();

  for (let i = 0; i < count; i++) {
    const option = sizeOptions.nth(i);
    const txt = (await option.textContent().catch(() => ''))?.trim() || '';

    if (
      ['S', 'M', 'L', 'XL', 'XXL'].includes(txt) &&
      await option.isVisible().catch(() => false)
    ) {
      await highlightSize(option, page);
      await option.click({ force: true });
      return txt;
    }
  }

  return null;
}

async function addToBag(page: Page) {
  const body = page.locator('body');
  await expect(body).toContainText(/ADD TO BAG|BUY NOW|GO TO BAG/i, { timeout: 20000 });

  const addToBagBtn = page.getByText('ADD TO BAG', { exact: false }).first();

  if (!(await addToBagBtn.isVisible().catch(() => false))) {
    throw new Error('ADD TO BAG not shown on this product');
  }

  await highlightActionButton(addToBagBtn, page);
  await addToBagBtn.click({ force: true });
}

async function goToBag(page: Page) {
  const goToBag = page.getByRole('link', { name: /go to bag/i }).first();

  await goToBag.waitFor({ state: 'visible', timeout: 15000 });
  await highlightActionButton(goToBag, page);
  await goToBag.click({ force: true });

  await expect(page).toHaveURL(/cart|checkout/i);
}

async function getCartPrice(page: Page): Promise<number> {
  const bodyText = await page.locator('body').innerText();
  const prices = bodyText.match(/₹\s?[\d,]+/g) || [];
  const nums = prices.map(moneyToNumber).filter(n => n > 0);
  return nums.length ? Math.min(...nums) : 0;
}

async function openCouponPanel(page: Page) {
  const openers = [
    page.getByText(/apply coupon/i).first(),
    page.getByText(/coupon/i).first(),
    page.getByRole('button', { name: /apply/i }).first(),
    page.locator('button, div, span, a').filter({ hasText: /coupon/i }).first()
  ];

  for (const opener of openers) {
    if (await opener.isVisible().catch(() => false)) {
      await applyHighlight(
        opener,
        page,
        {
          outline: '4px solid #7c3aed',
          shadow: '0 0 0 8px rgba(124, 58, 237, 0.20)',
          radius: '10px',
          bg: 'rgba(124, 58, 237, 0.08)'
        },
        1500
      );
      await opener.click({ force: true }).catch(() => {});
      await wait(1500, page);
      return true;
    }
  }

  return false;
}

async function applyCouponCode(page: Page, coupon: string): Promise<'applied' | 'invalid' | 'not_found'> {
  const opened = await openCouponPanel(page);
  if (!opened) return 'not_found';

  const couponInputCandidates = [
    page.locator('input[placeholder*="coupon" i]').first(),
    page.locator('input[placeholder*="code" i]').first(),
    page.locator('input').first()
  ];

  let couponInput: Locator | null = null;

  for (const input of couponInputCandidates) {
    if (await input.isVisible().catch(() => false)) {
      couponInput = input;
      break;
    }
  }

  if (!couponInput) return 'not_found';

  await applyHighlight(
    couponInput,
    page,
    {
      outline: '4px solid #06b6d4',
      shadow: '0 0 0 8px rgba(6, 182, 212, 0.18)',
      radius: '10px',
      bg: 'rgba(6, 182, 212, 0.06)'
    },
    1200
  );

  await couponInput.fill('');
  await couponInput.pressSequentially(coupon, { delay: 110 });
  await wait(700, page);

  const applyBtn = page.getByRole('button', { name: /apply/i }).first();

  if (await applyBtn.isVisible().catch(() => false)) {
    await highlightActionButton(applyBtn, page);
    await applyBtn.click({ force: true });
  } else {
    await page.keyboard.press('Enter').catch(() => {});
  }

  await wait(3500, page);

  const txt = await page.locator('body').innerText();

  if (/invalid|not applicable|not valid|expired/i.test(txt)) return 'invalid';
  if (/applied|discount|saved|coupon applied/i.test(txt)) return 'applied';

  return 'not_found';
}

test('premium myntra men t-shirt flow with coupon and price extraction', async ({ page }) => {
  let productPrice = 0;
  let cartPriceBeforeCoupon = 0;
  let cartPriceAfterCoupon = 0;
  let selectedSize: string | null = null;
  let couponStatus: 'applied' | 'invalid' | 'not_found' = 'not_found';

  await test.step('Open Myntra and search', async () => {
    await page.goto('https://www.myntra.com', { waitUntil: 'domcontentloaded' });

    const search = page.locator('input[placeholder*="Search"]');
    await search.waitFor({ state: 'visible' });
    await wait(400, page);
    await typeLikeHuman(search, SEARCH_TEXT);
    await wait(1200, page);

    const clickedSuggestion = await selectDropdownSuggestion(page);
    if (!clickedSuggestion) {
      await page.keyboard.press('Enter');
    }

    await expect(page).toHaveURL(/men-t-shirt|rawQuery/i);
    await wait(2000, page);
  });

  await test.step('Highlight selected product and open it', async () => {
    const productUrl = await getFirstProductUrl(page);
    await page.goto(productUrl, { waitUntil: 'domcontentloaded' });
    await wait(3000, page);
  });

  await test.step('Close popup and extract product price', async () => {
    await closePopupIfPresent(page);
    productPrice = await getPdpPrice(page);
    expect(productPrice).toBeGreaterThan(0);
  });

  await test.step('Try size selection, else continue directly', async () => {
    selectedSize = await selectFirstVisibleSize(page);
    await wait(2500, page);
  });

  await test.step('Bring ADD TO BAG into view, highlight it, and click it', async () => {
    await addToBag(page);
    await wait(2500, page);
  });

  await test.step('Go to bag', async () => {
    await goToBag(page);
    await wait(2500, page);
  });

  await test.step('Show visible changes on cart page and extract price before coupon', async () => {
    await highlightCartPage(page);
    await wait(2500, page);

    cartPriceBeforeCoupon = await getCartPrice(page);
    expect(cartPriceBeforeCoupon).toBeGreaterThan(0);
  });

  await test.step('Apply coupon code', async () => {
    couponStatus = await applyCouponCode(page, COUPON_CODE);
    cartPriceAfterCoupon = await getCartPrice(page);
  });

  await test.step('Validate price extraction and coupon behavior', async () => {
    expect(productPrice).toBeGreaterThan(0);
    expect(cartPriceBeforeCoupon).toBeGreaterThan(0);

    if (couponStatus === 'applied') {
      expect(cartPriceAfterCoupon).toBeGreaterThan(0);
      expect(cartPriceAfterCoupon).toBeLessThanOrEqual(cartPriceBeforeCoupon);
    } else {
      expect(cartPriceAfterCoupon || cartPriceBeforeCoupon).toBe(cartPriceBeforeCoupon);
    }
  });

  await wait(5000, page);
});