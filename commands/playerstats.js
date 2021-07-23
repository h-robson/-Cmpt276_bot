module.exports = {
	name: 'playerstats',
	aliases: ['icon', 'pfp'],
	description: 'Returns player stats',
    args: true,
    usage: '<playerhandle>',
	execute(message, args) {
		message.channel.send(`Player stats: ${args[0]}`);
	},
};