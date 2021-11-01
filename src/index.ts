
import express from 'express'
import { GraphQLClient, gql  } from 'graphql-request'

import { getToken } from './token'
import { DiscordGuild } from './types'
import { DiscordAPI } from './discordAPI'

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

let guild_info: DiscordGuild

app.get('/check/:userId', async function (req, res) {
  // Check the user on the discord guild(server) and update its 
  if (process.env.DISCORD_TOKEN && process.env.DISCORD_GUILD_ID && graphQLClient) {
    const { userId } = req.params
    console.log("Checking user:", userId)

    if (!userId) {
      return res.status(400).send('Missing userId')
    }
    // make sure the userId is numeric
    if (!userId.match(/^\d+$/)) {
      return res.status(400).send('Error: Invalid userId')
    }

    const api = new DiscordAPI(process.env.DISCORD_TOKEN, true)

    if (!guild_info) {
      // we need to fetch the info and cache it
      guild_info = await api.getGuildInfo(process.env.DISCORD_GUILD_ID)
    }

    const role_map = Object.fromEntries(
      guild_info.roles.map((role) => [role.id, role.name]),
    )

    // get member info for this user
    const member_info = await api.getGuildMember(
      process.env.DISCORD_GUILD_ID,
      userId,
    )
    console.log('member info:', member_info)

    // map guild into into names
    if ('message' in member_info) {
      // no such user?
      return res.status(400).send(`Error: ${member_info.message}`)
    }

    const member_roles = member_info.roles.map((role) => role_map[role])

    try {
      const token = await getToken()
      console.log("Tok", token)
      graphQLClient.setHeader('Authorization', `Bearer ${token}`)
  
      console.log("Resolved", userId, '->', member_roles)
  
      await graphQLClient.request(SET_ROLES, { id: member_info.user.id, roles: member_roles })
      res.json({
        roles: member_roles
      })
    } catch (e) {
      console.error(e)
    }
  }

  res.end()
})

app.listen(process.env.PORT)
