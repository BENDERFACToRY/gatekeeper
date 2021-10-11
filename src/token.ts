
import fetch from 'node-fetch'

export async function getToken() {
  const params = new URLSearchParams({
    application: 'gatekeeper', 
    secret: process.env.VAULT_APP_SECRET
  } as Record<string, string>)

  // Fetch the vault token with the app secret
  const response = await fetch(`${process.env.VAULT_TOKEN_URL}?${params}`)
  const { token } = await response.json() as { token: string }
  
  return token
}
