import { startTransition } from 'react'
import { ACTION_SERVER_ACTION } from './components/router-reducer/router-reducer-types'
import { dispatchAppRouterAction } from './components/use-action-queue'
import { createHmac } from 'crypto'

/**
 * Generates an HMAC of the given payload using the provided hmacSecret.
 * The HMAC is a base64 encoded string.
 * @param payload the payload to generate the HMAC for
 * @param hmacSecret the secret to use for generating the HMAC
 * @returns the generated HMAC
 */
const generateActionHMAC = (payload: any, hmacSecret: string) => {
  const hmac = createHmac('sha256', hmacSecret).update(payload).digest('hex')
  return hmac
}

export async function callServer(actionId: string, actionArgs: any[]) {
  return new Promise((resolve, reject) => {
    let finalArgs = actionArgs

    if (Array.isArray(actionArgs) && actionArgs.length > 0) {
      const payload = JSON.stringify({ actionId, actionArgs })
      const signature = generateActionHMAC(payload, actionId)
      finalArgs = [...actionArgs, { _hmac: signature }]
    }

    startTransition(() => {
      dispatchAppRouterAction({
        type: ACTION_SERVER_ACTION,
        actionId,
        actionArgs: finalArgs,
        resolve,
        reject,
      })
    })
  })
}
