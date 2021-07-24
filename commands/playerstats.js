module.exports = {
	name: 'playerstats',
	aliases: ['ps', 'pstats'],
	description: 'Returns player stats',
    args: true,
    usage: '<playerhandle>',
	execute(message, args) {
		message.channel.send(`Player stats: ${args[0]}`);
	},
};