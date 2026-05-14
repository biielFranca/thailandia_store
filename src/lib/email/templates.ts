// Inline HTML templates — Resend renders these directly. Kept simple (no
// React Email dep) and tested in Gmail/Outlook/Apple Mail. Inline styles only
// since most email clients strip <style> blocks or sandbox them.

interface OrderItem {
  name: string;
  size: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  image?: string | null;
}

interface OrderEmailData {
  ref: string;        // shortRef (8 chars uppercase)
  customerName: string;
  total: number;
  items: OrderItem[];
  paymentMethod: "pix" | "card" | string;
}

function brl(v: number) {
  return v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

const BRAND_COLOR  = "#1e6bff";
const SUCCESS      = "#22c55e";
const TEXT_PRIMARY = "#0a0a0b";
const TEXT_MUTED   = "#6b7280";
const BORDER       = "#e5e7eb";
const SURFACE      = "#f9fafb";

function shell(title: string, preheader: string, body: string): string {
  return `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>${title}</title>
</head>
<body style="margin:0;padding:0;background-color:#f3f4f6;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,'Helvetica Neue',Arial,sans-serif;color:${TEXT_PRIMARY};">
  <span style="display:none;font-size:0;line-height:0;max-height:0;max-width:0;opacity:0;overflow:hidden;">${preheader}</span>
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#f3f4f6;padding:32px 16px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;background-color:#ffffff;border-radius:12px;overflow:hidden;border:1px solid ${BORDER};">
          ${body}
        </table>
        <p style="margin:16px 0 0;font-size:11px;color:${TEXT_MUTED};text-align:center;">
          Thailandia Store · Camisas oficiais e retrôs
        </p>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

function itemsTable(items: OrderItem[]): string {
  return items
    .map(
      (it) => `
        <tr>
          <td style="padding:12px 0;border-bottom:1px solid ${BORDER};">
            <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
              <tr>
                ${
                  it.image
                    ? `<td width="56" style="vertical-align:top;padding-right:12px;"><img src="${it.image}" alt="" width="56" height="56" style="display:block;border-radius:6px;object-fit:cover;background-color:${SURFACE};" /></td>`
                    : ""
                }
                <td style="vertical-align:top;">
                  <p style="margin:0 0 4px;font-size:14px;font-weight:600;color:${TEXT_PRIMARY};">${it.name}</p>
                  <p style="margin:0;font-size:12px;color:${TEXT_MUTED};">Tam. ${it.size} · Qtd. ${it.quantity} · ${brl(it.unitPrice)}/un.</p>
                </td>
                <td align="right" style="vertical-align:top;white-space:nowrap;padding-left:12px;">
                  <p style="margin:0;font-size:14px;font-weight:700;color:${TEXT_PRIMARY};">${brl(it.totalPrice)}</p>
                </td>
              </tr>
            </table>
          </td>
        </tr>`,
    )
    .join("");
}

// ─── Templates ────────────────────────────────────────────────────────────────

export function renderOrderReceivedEmail(data: OrderEmailData): { subject: string; html: string } {
  const subject = `Pedido recebido #${data.ref} — aguardando pagamento`;
  const preheader = `Olá ${data.customerName.split(" ")[0]}, recebemos seu pedido. Total: ${brl(data.total)}.`;

  const paymentNote = data.paymentMethod === "pix"
    ? "Finalize o pagamento via PIX para liberar o envio. O QR code já está aberto na sua tela."
    : "Conclua o pagamento com cartão para iniciarmos a separação do seu pedido.";

  const body = `
    <tr>
      <td style="background:linear-gradient(135deg,${BRAND_COLOR},#0f4fcc);padding:32px 32px 24px;">
        <p style="margin:0 0 4px;font-size:11px;font-weight:600;letter-spacing:0.2em;color:rgba(255,255,255,0.8);text-transform:uppercase;">Pedido recebido</p>
        <h1 style="margin:0;font-size:24px;font-weight:700;color:#ffffff;">Obrigado, ${data.customerName.split(" ")[0]}! 🎉</h1>
      </td>
    </tr>
    <tr>
      <td style="padding:24px 32px;">
        <p style="margin:0 0 16px;font-size:14px;color:${TEXT_PRIMARY};line-height:1.5;">
          Recebemos seu pedido <strong>#${data.ref}</strong>. ${paymentNote}
        </p>
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:16px 0;background-color:${SURFACE};border-radius:8px;padding:0;">
          <tr>
            <td style="padding:16px;">
              <p style="margin:0 0 4px;font-size:11px;font-weight:600;letter-spacing:0.14em;color:${TEXT_MUTED};text-transform:uppercase;">Resumo</p>
              ${itemsTable(data.items)}
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-top:12px;">
                <tr>
                  <td style="padding:4px 0;font-size:13px;color:${TEXT_MUTED};">Frete</td>
                  <td align="right" style="padding:4px 0;font-size:13px;color:${SUCCESS};font-weight:600;">Grátis</td>
                </tr>
                <tr>
                  <td style="padding-top:8px;border-top:1px solid ${BORDER};font-size:14px;font-weight:600;color:${TEXT_PRIMARY};">Total</td>
                  <td align="right" style="padding-top:8px;border-top:1px solid ${BORDER};font-size:18px;font-weight:700;color:${TEXT_PRIMARY};">${brl(data.total)}</td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
        <p style="margin:24px 0 0;font-size:12px;color:${TEXT_MUTED};line-height:1.5;">
          Guarde a referência <strong style="color:${TEXT_PRIMARY};font-family:monospace;">#${data.ref}</strong> para acompanhar seu pedido. Em caso de dúvidas, responda este e-mail.
        </p>
      </td>
    </tr>`;

  return { subject, html: shell(subject, preheader, body) };
}

export function renderPaymentConfirmedEmail(data: OrderEmailData): { subject: string; html: string } {
  const subject = `Pagamento confirmado #${data.ref} — pedido em separação`;
  const preheader = `Seu pagamento de ${brl(data.total)} foi aprovado e o pedido entrou em separação.`;

  const body = `
    <tr>
      <td style="background:linear-gradient(135deg,${SUCCESS},#16a34a);padding:32px 32px 24px;">
        <p style="margin:0 0 4px;font-size:11px;font-weight:600;letter-spacing:0.2em;color:rgba(255,255,255,0.85);text-transform:uppercase;">Pagamento confirmado</p>
        <h1 style="margin:0;font-size:24px;font-weight:700;color:#ffffff;">Tudo certo, ${data.customerName.split(" ")[0]}! ✅</h1>
      </td>
    </tr>
    <tr>
      <td style="padding:24px 32px;">
        <p style="margin:0 0 16px;font-size:14px;color:${TEXT_PRIMARY};line-height:1.5;">
          Recebemos o pagamento do seu pedido <strong>#${data.ref}</strong>.
          A separação já começou — assim que o pedido for enviado, você recebe outro e-mail com o código de rastreio.
        </p>
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:16px 0;background-color:${SURFACE};border-radius:8px;">
          <tr>
            <td style="padding:16px;">
              ${itemsTable(data.items)}
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-top:12px;">
                <tr>
                  <td style="padding-top:8px;font-size:14px;font-weight:600;color:${TEXT_PRIMARY};">Total pago</td>
                  <td align="right" style="padding-top:8px;font-size:18px;font-weight:700;color:${SUCCESS};">${brl(data.total)}</td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
        <p style="margin:24px 0 0;font-size:12px;color:${TEXT_MUTED};line-height:1.5;">
          Referência <strong style="color:${TEXT_PRIMARY};font-family:monospace;">#${data.ref}</strong>. Qualquer dúvida, é só responder este e-mail.
        </p>
      </td>
    </tr>`;

  return { subject, html: shell(subject, preheader, body) };
}
