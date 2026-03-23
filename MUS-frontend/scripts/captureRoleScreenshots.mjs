import fs from 'node:fs/promises';
import path from 'node:path';
import { chromium } from 'playwright';

const baseUrl = process.env.SCREENSHOT_BASE_URL || 'http://127.0.0.1:5173';
const outputRoot = path.resolve(process.cwd(), '..', 'Screenshots');

const roles = [
  {
    name: 'admin',
    email: 'admin@mus.com',
    password: 'admin123',
    routes: [
      '/discover',
      '/dashboard',
      '/dashboard/library',
      '/dashboard/uploads',
      '/dashboard/verify',
      '/dashboard/users',
      '/dashboard/resources',
      '/dashboard/catalog',
      '/dashboard/wallet',
      '/dashboard/settings',
    ],
  },
  {
    name: 'teacher',
    email: 'teacher@mus.com',
    password: 'teacher123',
    routes: [
      '/discover',
      '/dashboard',
      '/dashboard/library',
      '/dashboard/uploads',
      '/dashboard/wallet',
      '/dashboard/settings',
    ],
  },
  {
    name: 'student',
    email: 'student@mus.com',
    password: 'student123',
    routes: [
      '/discover',
      '/dashboard',
      '/dashboard/library',
      '/dashboard/uploads',
      '/dashboard/wallet',
      '/dashboard/settings',
    ],
  },
];

const slugifyRoute = (route) => {
  if (route === '/') return 'home';
  return route.replace(/^\//, '').replace(/\//g, '__') || 'root';
};

const waitForPageStable = async (page) => {
  await page.waitForLoadState('domcontentloaded');
  await page.waitForTimeout(900);
};

const captureRoute = async (page, roleName, route) => {
  const target = `${baseUrl}${route}`;
  await page.goto(target, { waitUntil: 'domcontentloaded', timeout: 90000 });
  await waitForPageStable(page);

  const currentPath = new URL(page.url()).pathname;
  const requestedName = slugifyRoute(route);
  const currentName = slugifyRoute(currentPath);
  const fileName = requestedName === currentName ? requestedName : `${requestedName}__redirected_to__${currentName}`;

  const roleDir = path.join(outputRoot, roleName);
  await fs.mkdir(roleDir, { recursive: true });
  const fullPath = path.join(roleDir, `${fileName}.png`);

  await page.screenshot({ path: fullPath, fullPage: true });
  return fullPath;
};

const loginAs = async (page, email, password) => {
  await page.goto(`${baseUrl}/login`, { waitUntil: 'domcontentloaded', timeout: 90000 });
  await page.getByLabel('Email Address').fill(email);
  await page.getByRole('textbox', { name: 'Password' }).fill(password);
  await page.getByRole('button', { name: 'Sign In' }).click();

  try {
    await page.waitForURL(/\/discover|\/dashboard/, { timeout: 45000 });
  } catch {
    await page.waitForTimeout(3000);
    const current = page.url();
    if (!/\/discover|\/dashboard/.test(current)) {
      throw new Error(`Login did not redirect. Current URL: ${current}`);
    }
  }

  await waitForPageStable(page);
};

const capturePublicScreens = async (page) => {
  const commonDir = path.join(outputRoot, 'public');
  await fs.mkdir(commonDir, { recursive: true });

  const publicRoutes = ['/', '/discover', '/login', '/register'];
  for (const route of publicRoutes) {
    const target = `${baseUrl}${route}`;
    await page.goto(target, { waitUntil: 'domcontentloaded', timeout: 90000 });
    await waitForPageStable(page);
    await page.screenshot({ path: path.join(commonDir, `${slugifyRoute(route)}.png`), fullPage: true });
  }
};

const main = async () => {
  await fs.mkdir(outputRoot, { recursive: true });

  const browser = await chromium.launch({ headless: true });
  try {
    const publicContext = await browser.newContext({ viewport: { width: 1600, height: 1000 } });
    const publicPage = await publicContext.newPage();
    await capturePublicScreens(publicPage);
    await publicContext.close();

    for (const role of roles) {
      const context = await browser.newContext({ viewport: { width: 1600, height: 1000 } });
      const page = await context.newPage();
      await loginAs(page, role.email, role.password);

      for (const route of role.routes) {
        await captureRoute(page, role.name, route);
      }

      await context.close();
    }

    console.log(`Screenshots saved to: ${outputRoot}`);
  } finally {
    await browser.close();
  }
};

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
