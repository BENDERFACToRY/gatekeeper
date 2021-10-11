import { DiscordGuild, DiscordMember } from './types'
import fetch, { Response } from 'node-fetch'

export class DiscordAPI {
  static DISCORD_API = 'https://discord.com/api/v9'

  token: string
  bot: boolean

  constructor(token: string, bot: boolean) {
    this.token = token
    this.bot = bot
  }

  async fetch(
    url: string,
    { headers = {}, ...options } = {},
  ): Promise<Response> {
    const auth_type = this.bot ? 'Bot' : 'Bearer'
    return fetch(`${DiscordAPI.DISCORD_API}${url}`, {
      headers: {
        Authorization: `${auth_type} ${this.token}`,
        ...headers,
      },
      ...options,
    })
  }

  async getGuildInfo(guildId: string): Promise<DiscordGuild> {
    const res = await this.fetch(`/guilds/${guildId}`)
    const data = await res.json() as DiscordGuild
    return data
  }

  async getGuildMember(
    guildId: string,
    userId: string,
  ): Promise<DiscordMember | { code: number; message: string }> {
    const res = await this.fetch(`/guilds/${guildId}/members/${userId}`)
    const data = await res.json() as DiscordMember
    return data
  }
}