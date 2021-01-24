require('dotenv').config();
const puppeteer = require('puppeteer');

(async () => {
	const browser = await puppeteer.launch();
	const page = await browser.newPage();

	const SERVICE_TO_PAY = 'Electric Online Payment';
	const ACCOUNT_NUMBER_FIELD_ID = 'ctl00_ctl00_LayoutArea_MainContent_Transaction1_tblI2646';
	const ACCOUNT_NUMBER_PAGE_CONTINUE_BUTTON_ID = 'ctl00_ctl00_LayoutArea_MainContent_Transaction1_lbtnContinue';
	const AMOUNT_DUE_LABEL_ID = 'ctl00_ctl00_LayoutArea_MainContent_Transaction1_lblAmountDue';
	const PAY_AMOUNT_FIELD_ID = 'ctl00_ctl00_LayoutArea_MainContent_Transaction1_AmtTextBox';
	const ADD_TO_CART_BUTTON_ID = 'ctl00_ctl00_LayoutArea_MainContent_Transaction1_lbtnAddToCart';
	const CHECKOUT_BUTTON = 'btnCheckout';
	const CHECKOUT_AS_GUEST_BUTTON_ID = 'ctl00_ctl00_LayoutArea_MainContent_SignIn1_btnCheckOutGuest';
	const CHECKOUT_AS_GUEST_PROCEED_BUTTON_ID = 'ctl00_ctl00_LayoutArea_MainContent_BillingInfo1_btnProceed';

	// Go to page
	await page.goto('https://neld.net');
	logInfo('Landed on neld.net');
	await takeScreenshot(page, 'steps/1-neld-landing-page.png');

	// Select service to pay
	logInfo(`Clicking through ${SERVICE_TO_PAY} page`);
	await page.$eval(`area[alt="${SERVICE_TO_PAY}"]`, area => area.click());
	await waitForSelector(page, ACCOUNT_NUMBER_FIELD_ID);
	logInfo(`Landed on ${SERVICE_TO_PAY} page`)
	await takeScreenshot(page, 'steps/2-electric-payment-page.png');

	// Enter account number
	logInfo('Pulling electric account number from (TBD)');
	const { ELECTRIC_ACCOUNT_NUMBER } = process.env;
	logInfo('Setting account number');
	await page.$eval(
		`#${ACCOUNT_NUMBER_FIELD_ID}`,
		(field, accountNumber) => field.setAttribute('value', accountNumber),
		ELECTRIC_ACCOUNT_NUMBER
	);
	await takeScreenshot(page, 'steps/3-set-account-number.png');

	// Continue
	logInfo('Retrieving account information');
	await click(page, ACCOUNT_NUMBER_PAGE_CONTINUE_BUTTON_ID);
	await waitForSelector(page, AMOUNT_DUE_LABEL_ID);
	await takeScreenshot(page, 'steps/4-continue-after-setting-account-number.png');

	// Get Amount Due
	logInfo('Retrieving Amount Due')
	const amonutDueLabelInnerHtml = await page.$eval(`#${AMOUNT_DUE_LABEL_ID}`, label => label.innerHTML);
	const amountDueString = amonutDueLabelInnerHtml.split('$')[1];
	const amountDue = parseFloat(amountDueString).toFixed(2); // 2 decimal places
	if (isNaN(amountDue)) {
		logInfo('Could not parse amount due. Stopping execution');
		await browser.close();
		return;
	}

	if (!amountDue) {
		logInfo('Balance is $0.00. No payment needed. Stopping execution');
		await browser.close();
		return;
	}

	logInfo(`Amount due is $${amountDue}`)

	// Set Amount Due
	logInfo('Setting payment amount')
	await page.$eval(
		`#${PAY_AMOUNT_FIELD_ID}`,
		(field, paymentAmount) => field.setAttribute('value', paymentAmount),
		amountDue
	);
	await takeScreenshot(page, 'steps/5-set-payment-amount.png');

	// Add to Cart
	logInfo('Adding payment to cart');
	await click(page, ADD_TO_CART_BUTTON_ID);
	await waitForSelector(page, CHECKOUT_BUTTON);
	await takeScreenshot(page, 'steps/6-view-cart-page.png');

	// Proceed with checkout
	logInfo('Proceeding with checkout');
	await click(page, CHECKOUT_BUTTON);
	await waitForSelector(page, CHECKOUT_AS_GUEST_BUTTON_ID);
	await takeScreenshot(page, 'steps/7-checkout-options-page.png');

	// Checkout as guest
	logInfo('Checking out as guest');
	await click(page, CHECKOUT_AS_GUEST_BUTTON_ID);
	await waitForSelector(page, CHECKOUT_AS_GUEST_BUTTON_ID)

	await browser.close();
})();

function logInfo(message) {
	console.log(`========== ${message} ==========`);
}

async function click(page, buttonId) {
	await page.$eval(`#${buttonId}`, button => button.click());
}

async function waitForSelector(page, selector) {
	await page.waitForSelector(`#${selector}`, { visible: true });
}

async function takeScreenshot(page, path) {
	await page.screenshot({ path, fullPage: true });
}