// import { defineConfig, devices } from '@playwright/test';

// export default defineConfig({
//   testDir: './tests',
//   fullyParallel: true,
//   forbidOnly: !!process.env.CI,
//   retries: process.env.CI ? 2 : 0,
//   workers: process.env.CI ? 1 : undefined,
//   reporter: 'html',

//   use: {
//     headless: false,
//     trace: 'on-first-retry',
//     screenshot: 'only-on-failure',
//     video: 'retain-on-failure',
//     launchOptions: {
//       slowMo: 1000
//     }
//   },

//   projects: [
//     {
//       name: 'chromium',
//       use: { ...devices['Desktop Chrome'] },
//     }
//   ]
// });
// import { defineConfig, devices } from '@playwright/test';

// export default defineConfig({
//   testDir: './tests',
//   reporter: 'html',

//   use: {
//     headless: false,
//     trace: 'on-first-retry',
//     launchOptions: {
//       slowMo: 700
//     }
//   },

//   projects: [
//     {
//       name: 'chromium',
//       use: { ...devices['Desktop Chrome'] },
//     }
//   ],
// });
// import { defineConfig, devices } from '@playwright/test';

// export default defineConfig({
//   testDir: './tests',
//   reporter: 'html',

//   use: {
//     headless: false,
//     trace: 'on-first-retry',
//     launchOptions: {
//       slowMo: 700
//     }
//   },

//   projects: [
//     {
//       name: 'chromium',
//       use: { ...devices['Desktop Chrome'] },
//     }
//   ],
// });
// import { defineConfig, devices } from '@playwright/test';

// export default defineConfig({
//   testDir: './tests',
//   reporter: 'html',
//   use: {
//     headless: false,
//     trace: 'on-first-retry',
//     launchOptions: {
//       slowMo: 700
//     }
//   },
//   projects: [
//     {
//       name: 'chromium',
//       use: { ...devices['Desktop Chrome'] },
//     }
//   ],
// });
// import { defineConfig, devices } from '@playwright/test';

// export default defineConfig({
//   testDir: './tests',
//   reporter: 'html',
//   use: {
//     headless: true, // ✅ FIXED
//     trace: 'on-first-retry',
//   },
//   projects: [
//     {
//       name: 'chromium',
//       use: { ...devices['Desktop Chrome'] },
//     }
//   ],
// });
// import { defineConfig, devices } from '@playwright/test';

// // ✅ Detect CI environment (GitHub Actions)
// const isCI = !!process.env.CI;

// export default defineConfig({
//   testDir: './tests',

//   // ✅ REPORT HEADING (this controls report type)
//   reporter: 'html',

//   use: {
//     headless: true, // ✅ CI → true, Local → false
//     trace: 'on-first-retry',

//     launchOptions: {
//       slowMo: isCI ? 0 : 700 // ✅ slow only locally
//     }
//   },

//   projects: [
//     {
//       name: 'chromium', // ✅ THIS is the "heading" for browser
//       use: { ...devices['Desktop Chrome'] },
//     }
//   ],
// });
// import { defineConfig, devices } from '@playwright/test';

// export default defineConfig({
//   testDir: './tests',
//   reporter: 'html',

//   use: {
//     headless: true, // ✅ required for GitHub
//     trace: 'on-first-retry'
//   },

//   projects: [
//     {
//       name: 'chromium',
//       use: { ...devices['Desktop Chrome'] },
//     }
//   ],
// });
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  reporter: 'html',

  use: {
    headless: true, // ✅ required for GitHub Actions
    trace: 'on-first-retry',
  },

  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    }
  ],
});