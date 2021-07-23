
import express from 'express'
import { GraphQLClient, gql  } from 'graphql-request'

import { getToken } from './token'
import { client } from './discordClient'

const graphQLClient = process.env.VAULT_API_URL && new GraphQLClient(process.env.VAULT_API_URL)

const app = express()

const SET_ROLES = gql`
  mutation setRoles($id: String!, $roles: jsonb!) {
    update_discord_by_pk(
      pk_columns: { id:$id },
      _set: {
        roles: $roles
      }
    ) {
      id roles
    }
  }`

app.get('/check/:userId', async function (req, res) {
  // Check the user on the discord guild(server) and update its 
  const { userId } = req.params

  if (process.env.DISCORD_GUILD_ID && graphQLClient) {

    const token = await getToken()
    console.log("Tok", token)
    graphQLClient.setHeader('Authorization', `Bearer ${token}`)

    console.log("Checking", userId)
    const guild = await client.guilds.fetch(process.env.DISCORD_GUILD_ID)
    const member = await guild.members.fetch(userId)
    const roles = member.roles.cache.map(({ name }) => name)

    await graphQLClient.request(SET_ROLES, { id: userId.toString(), roles })
    console.log("Set roles", roles)
  }

  res.end()
})

app.listen(process.env.PORT)
