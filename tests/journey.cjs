const { chromium } = require("playwright");
(async () => {
  const browser = await chromium.launch({ headless: true, channel: "chrome" });
  const page = await browser.newPage({
    viewport: { width: 1440, height: 900 },
    reducedMotion: "reduce",
  });
  const errors = [];
  page.on("pageerror", (e) => errors.push(e.message));
  await page.goto("http://localhost:5173");
  await page.screenshot({ path: "/tmp/grove-opening.png" });
  await page.locator(".fairy").dblclick();
  console.log("begun");
  for (let r = 0; r < 3; r++) {
    await page.waitForFunction(
      (r) =>
        window.grove.state.phase === "discover" &&
        window.grove.state.round === r,
      r,
    );
    console.log("round", r);
    if ((await page.locator(".dot").count()) !== 12) throw Error("Dot count");
    const right = [
      [1, 4, 9],
      [0, 5, 7, 11],
      [1, 3, 4, 8, 10],
    ][r];
    const wrong = Array.from({ length: 12 }, (_, i) => i).filter(
      (i) => !right.includes(i),
    );
    for (const i of wrong) await page.locator(".dot").nth(i).click();
    if ((await page.evaluate(() => grove.state.found)) !== 0)
      throw Error("Decoy changed state");
    for (const i of right) await page.locator(".dot").nth(i).click();
  }
  await page.waitForFunction(() => grove.state.phase === "ending", null, {
    timeout: 30000,
  });
  await page.screenshot({ path: "/tmp/grove-ending.png" });
  console.log(
    JSON.stringify({ state: await page.evaluate(() => grove.state), errors }),
  );
  if (errors.length) throw Error(errors.join("\n"));
  await browser.close();
})().catch((e) => {
  console.error(e);
  process.exit(1);
});
