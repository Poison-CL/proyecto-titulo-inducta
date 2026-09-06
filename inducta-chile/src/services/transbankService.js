import {
  Environment,
  IntegrationApiKeys,
  IntegrationCommerceCodes,
  Options,
  WebpayPlus,
} from 'transbank-sdk'

// ponytail: SDK de Node; CORS/secretos piden mover esto a un endpoint de servidor
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
