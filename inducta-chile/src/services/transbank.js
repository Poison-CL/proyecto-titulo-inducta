import {
  Environment,
  IntegrationApiKeys,
  IntegrationCommerceCodes,
  Options,
  WebpayPlus,
} from 'transbank-sdk'

// Credenciales de integracion para probar Webpay. Antes de produccion esto tiene
// que correr en el servidor, no en el navegador.
const tx = new WebpayPlus.Transaction(
  new Options(
    IntegrationCommerceCodes.WEBPAY_PLUS,
    IntegrationApiKeys.WEBPAY,
    Environment.Integration,
  ),
)

export async function iniciarPagoPrueba(buyOrder, sessionId, amount, returnUrl) {
  const { token, url } = await tx.create(buyOrder, sessionId, amount, returnUrl)
  return { token, url }
}
