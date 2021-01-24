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

	// Go to page
	await page.goto('https://neld.net');
	logInfo('Landed on neld.net');
	await page.screenshot({ path: 'steps/1-neld-landing-page.png', fullPage: true });

	// Select service to pay
	// this doesn't work?
	// const element = await page.$('area[alt="Electric Online Payment"]');
	// await element.click();
	logInfo(`Clicking through ${SERVICE_TO_PAY} page`);
	await page.$eval(`area[alt="${SERVICE_TO_PAY}"]`, area => area.click());
	await page.waitForSelector(`#${ACCOUNT_NUMBER_FIELD_ID}`, { visible: true });
	logInfo(`Landed on ${SERVICE_TO_PAY} page`)
	await page.screenshot({ path: 'steps/2-electric-payment-page.png', fullPage: true });

	// Enter account number
	logInfo('Pulling electric account number from (TBD)');
	const { ELECTRIC_ACCOUNT_NUMBER } = process.env;
	logInfo('Setting account number');
	await page.$eval(
		`#${ACCOUNT_NUMBER_FIELD_ID}`,
		(field, accountNumber) => field.setAttribute('value', accountNumber),
		ELECTRIC_ACCOUNT_NUMBER
	);
	await page.screenshot({ path: 'steps/3-set-account-number.png', fullPage: true });

	// Continue
	logInfo('Retrieving account information');
	await page.$eval(
		`#${ACCOUNT_NUMBER_PAGE_CONTINUE_BUTTON_ID}`,
		button => button.click()
	);
	await page.waitForSelector(`#${AMOUNT_DUE_LABEL_ID}`, { visible: true });
	await page.screenshot({ path: 'steps/4-continue-after-setting-account-number.png', fullPage: true });

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
	await page.screenshot({ path: 'steps/5-set-payment-amount.png', fullPage: true });

	// Add to Cart
	logInfo('Adding payment to cart');
	await page.$eval(`#${ADD_TO_CART_BUTTON_ID}`, button => button.click());
	await page.waitForSelector(`#${CHECKOUT_BUTTON}`, { visible: true });
	await page.screenshot({ path: 'steps/6-payment-checkout-page.png', fullPage: true });

	await browser.close();
})();

function logInfo(message) {
	console.log(`========== ${message} ==========`);
}