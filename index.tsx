/** @jsx jsx */
import { Context, Hono } from "hono";
import type { Next } from "hono/types.ts";
import { jsx, Fragment } from "hono/jsx/index.ts";
import { css, Style } from 'hono/helper.ts';
import { serveStatic } from 'hono/middleware.ts'
import { PayPay } from "https://deno.land/x/paypax@v1.5.4/mod.ts";
import "envLoader";
import { PayPayStatus } from 'paypax';

const history: {
  ip: string,
  last: number,
  number: number
}[] = [];

const app = new Hono();

app.use("/", async (c: Context, next: Next) => {
    c.header("X-Powered-By", "@amex2189");
    c.setRenderer((content) => {
        const defaultCSS = css`
          margin: 0px;
          padding: 0px;
          display: flex;
          flex-direction: column;
          min-width: 100vw;
          min-height: 100vh;
          justify-content: center;
          align-items: center;
        `;

        const headerCSS = css`
          display: flex;
          justify-content: center;
          align-items: center;
          margin-top: 20px;
          margin-bottom: 20px;
          font-size: 1.5rem;
        `

        const footerCSS = css`
          display: flex;
          justify-content: center;
          align-items: center;
          margin-top: 20px;
          gap: 20px;
        `

        return c.html(
          <html>
            <head>
              <meta charset="utf-8" />
              <title>PayPay 寄付box for @amex2189</title>
              <meta name="viewport" content="width=device-width, initial-scale=1.0" />
              <meta name="robots" content="noindex, nofollow" />
              <link rel="stylesheet" href="https://cdn.ame-x.net/site-auto.css" />
              <link rel="icon" href="/favicon.png" />
              <script src="/index.js" defer></script>
              <Style />
            </head>
            <body class={defaultCSS}>
              <h1 class={headerCSS}>PayPay 寄付box for @amex2189</h1>
              <div>
                {content}
              </div>
              <p class={footerCSS}>
                <a href="https://github.com/EdamAme-x/paypay-auto-receive" target="_blank">Repository</a>
                <a href="https://twitter.com/amex2189" target="_blank">Twitter</a>
              </p>
            </body>
          </html>
        )
    })

    await next();
})

app.get("/", (c: Context) => {
  return c.render(
    <Fragment>
      <div id="app"></div>
    </Fragment>
  );
})

app.post("/receive", async (c: Context) => {
  const clientIp = c.env.ip || (c.req.headers.get("x-forwarded-for") || c.req.headers.get("x-real-ip") || "unknown").split(",")[0].trim();

  const now = Date.now();
  const ipHistory = history.find((entry) => entry.ip === clientIp);

  if (ipHistory) {
    if (now - ipHistory.last < 3600000) {
      ipHistory.number++;
      if (ipHistory.number > 2) {
        return c.text("リクエストが制限されています。twiiterのDMまで。", 429);
      }
    } else {
      ipHistory.last = now;
      ipHistory.number = 1;
    }
  } else {
    history.push({ ip: clientIp, last: now, number: 1 });
  }

  const { url } = await c.req.json();

  if (!url) {
    return c.text("URLが必要です！", 400);
  }

  if (!url.includes("paypay")) {
    return c.text("URLが正しくありません。", 400);
  }

  const phone = Deno.env.get("PHONE") || false;
  const password = Deno.env.get("PASSWORD") || false;
  const uuid = Deno.env.get("UUID") || false;

  if (!phone || !password || !uuid) {
    return c.text("環境変数が必要です。", 400);
  }

  console.log("receive: " + url);
  console.log("login: " + phone + " " + password + " " + uuid);

  const paypay = new PayPay(phone, password);
  const result = await paypay.login({
    uuid: uuid ?? crypto.randomUUID(),
  });

  if (result.status === PayPayStatus.LoginNeedOTP || result.status === PayPayStatus.LoginFailed) {
    console.log("fail: " + result.status);
    return c.text("ログインに失敗しました。TwitterのDMまで", 400);
  }

  if (result.success) {
    try {
      const res = await paypay.receiveLink(url.trim())

      if (res?.success) {
        return c.text("寄付に成功しました。", 200);
      }else {
        return c.text("寄付に失敗しました。", 400);
      }
    }catch (_e) {
      return c.text("寄付に失敗しました。", 400);
    }
  }else {
    return c.text("ログインに失敗しました。", 400);
  }
})

app.get("/*", serveStatic({
  root: "./static",
}));

Deno.serve((req, connInfo) => {
  return app.fetch(req, {
    ip: connInfo.remoteAddr?.toString(),
  })
});
