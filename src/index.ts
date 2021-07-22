import { Client, Intents } from 'discord.js';


const intents = new Intents(['GUILDS', 'GUILD_MEMBERS', 'GUILD_MESSAGES', 'GUILD_MESSAGES'])

// const client = new Client();
const client = new Client({ ws: { intents }});

client.once('ready', () => {
	console.log('Ready!');
});

client.on('guildMemberUpdate', (old, member) => {
  const vipRole = member.guild.roles.cache.find(role => role.name === 'vip')
  
  const oldRoles = old.roles.cache.map(({ name }) => name)
  const currentRoles = member.roles.cache.map(({ name }) => name)
  const addedRoles = currentRoles.filter(name => !oldRoles.includes(name))
  const removedRoles = oldRoles.filter(name => !currentRoles.includes(name))

  if (addedRoles.includes('fresh')) {
    member.roles.add(vipRole)
    console.log(member)
  }
  if (removedRoles.includes('fresh')) {
    member.roles.remove(vipRole)
    console.log(member)
  }
  console.log('roles1:', member.id, '->', addedRoles, removedRoles )
})


/*

const role = <guild>.roles.cache.find(role => role.name === '<role name>');
const newMember = <message>.mentions.members.first();
member.roles.add(role);

*/

client.on('message', message => {

  const member = message.member;
  if (member?.roles.cache.some(({ name }) => name === 'admin')) {
    message.channel.send(`I'm honored by your presence ${member.nickname || member.user.username}`)
  }


	if (message.content === '!ping') {
		// send back "Pong." to the channel the message was sent in
		message.channel.send('Pong.');
    client.user?.setActivity('dnd');
	} else {
    client.user?.setActivity('invisible');

  }

});

client.login(process.env.DISCORD_TOKEN);
