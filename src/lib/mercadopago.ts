import MercadoPagoConfig, { Payment } from "mercadopago";

/**
 * Returns a ready-to-use Payment client. Throws if the access token is not set
 * so misconfiguration surfaces at call time (not at module load / build time).
 */
export function getMpPaymentClient() {
  const accessToken = process.env.MERCADO_PAGO_ACCESS_TOKEN;
  if (!accessToken) {
    throw new Error("MERCADO_PAGO_ACCESS_TOKEN is not configured.");
  }
  const client = new MercadoPagoConfig({ accessToken });
  return new Payment(client);
}
