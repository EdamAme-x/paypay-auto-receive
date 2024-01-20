import { PayPay, PayPayStatus } from "paypax";
import "envLoader";

const paypay = new PayPay(Deno.env.get("PHONE") ?? "", Deno.env.get("PASSWORD") ?? "");

const result = await paypay.login();

if (result.status === PayPayStatus.LoginNeedOTP) {
    const otp = prompt("OTP: ");
    await paypay.otpLogin(otp ?? "");
    console.log(await paypay.getBalance())
    console.log(await paypay.getUuid())
}