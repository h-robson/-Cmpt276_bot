require("dotenv").config();
const fetch = require('node-fetch');

const { Client, StreamDispatcher } = require('discord.js');
const client = new Client();
const token = process.env.DIS_TOKEN;
const prefix = process.env.PREFIX
const key = process.env.API_KEY;
const sp = '%20';
let playerCount = -1;
let lobby = [];
let team1 = [];
let team1Rating = [];
let team2 = [];
let team2Rating = [];
let listOfNames = [];




client.on('ready', () => {
    console.log(`${client.user.username} has logged in.`);
});

client.on('message', (message) => {

    function sortFunction(a, b) {
        if (a[0] === b[0]) {
            return 0;
        }
        else {
            return (a[0] > b[0]) ? -1 : 1;
        }
    }

    async function fetchRankedData(id, name) {
        const response = await fetch("https://na1.api.riotgames.com/lol/league/v4/entries/by-summoner/" + id + "?api_key=" + key);
        let data = await response.json();
        //console.log(data);

        if (data[0].tier) {
            totalGames = data[0].wins + data[0].losses;
            winPercent = (data[0].wins / totalGames) * 100;
            winPercent = Math.round(winPercent);
            message.channel.send(
                'Queue type: ' + data[0].queueType + '\n' +
                'Rank: ' + data[0].tier + ' ' + data[0].rank + ' ' + data[0].leaguePoints + 'LP' + '\n' +
                'Wins: ' + data[0].wins + '\n' +
                'Losses: ' + data[0].losses + '\n' +
                'Win percent: ' + winPercent + '%');

        } else {
            message.channel.send('Player has not played ranked.');
        }

        message.channel.send('More info can be found at: https://groupproject13.herokuapp.com/pie?name=' + name);

    }

    async function fetchSumData(name) {
        while (name.includes(" ")) {
            let spaceSpot = name.indexOf(" ");
            name = name.substring(0, spaceSpot) + sp + name.substring(spaceSpot + 1);
        }
        const link = `https://na1.api.riotgames.com/lol/summoner/v4/summoners/by-name/${name}?api_key=${key}`;
        //console.log(link);

        const response = await fetch(link);
        let data = await response.json();

        if (data.name) {
            message.channel.send('Name: ' + data.name + '\n' + 'Summoner level: ' + data.summonerLevel);
            fetchRankedData(data.id, name);
        } else {
            message.channel.send("Summoner does not exist.");
        }
    }

    async function getRating(name) {
        let ogName = name;
        while (name.includes(" ")) {
            let spaceSpot = name.indexOf(" ");
            name = name.substring(0, spaceSpot) + sp + name.substring(spaceSpot + 1);
        }
        const link = `https://na1.api.riotgames.com/lol/summoner/v4/summoners/by-name/${name}?api_key=${key}`;
        //console.log(link);

        const response = await fetch(link);
        let data = await response.json();

        if (data.name) {
            const responseRanked = await fetch("https://na1.api.riotgames.com/lol/league/v4/entries/by-summoner/" + data.id + "?api_key=" + key);
            let dataRanked = await responseRanked.json();
            if (dataRanked[0].tier) {
                playerCount++;
                let rating = 0;
                if (dataRanked[0].tier === 'IRON') {
                    rating = 0;
                } else if (dataRanked[0].tier === 'BRONZE') {
                    rating = 400;
                } else if (dataRanked[0].tier === 'SILVER') {
                    rating = 800;
                } else if (dataRanked[0].tier === 'GOLD') {
                    rating = 1200;
                } else if (dataRanked[0].tier === 'PLATINUM') {
                    rating = 1600;
                } else if (dataRanked[0].tier === 'DIAMOND') {
                    rating = 2000;
                } else if (dataRanked[0].tier === 'MASTER') {
                    rating = 2400;
                } else if (dataRanked[0].tier === 'GRANDMASTER') {
                    rating = 2800;
                } else {
                    rating = 2800;
                }

                if (dataRanked[0].rank === 'IV') {

                } else if (dataRanked[0].rank === 'III') {
                    rating = rating + 100;
                } else if (dataRanked[0].rank === 'II') {
                    rating = rating + 200;
                } else {
                    rating = rating + 300;
                }
                rating = rating + dataRanked[0].leaguePoints;
                let ar = [rating, ogName];
                lobby.push(ar);
                listOfNames.push(ogName);
                message.channel.send(ogName + ' has been added to the lobby ' + playerCount + '/10');
            }
            else {
                message.channel.send("player has no ranked data. cannot join lobby");
            }

        } else {
            message.channel.send("Summoner does not exist.");
        }
    }


    if (message.author.bot === true) return;
    //console.log(`[${message.author.tag}]: ${message.content}`);
    if (message.content.startsWith(prefix)) {
        const [CMD_NAME, ...args] = message.content
            .trim()
            .substring(prefix.length).split(" ");

        if (CMD_NAME === 'stats') {
            //message.channel.send('command name: ' + CMD_NAME)
            //message.channel.send('arguements with CMD_NAME are: ' + args)

            if (args.length === 0) {
                message.channel.send('Please add summoner name after !stats');
                return;
            }
            else {
                summonerName = []
                for (i = 0; i < args.length; i++) {
                    summonerName.push(args[i]);
                }
                summonerName = summonerName.join(" ");
                //message.channel.send('summoner name is: '+summonerName);

                const name = fetchSumData(summonerName);
                //message.channel.send(name);
            }

        }

        else if (CMD_NAME === 'lobby') {
            message.channel.send('Creating lobby\n!join {Summoner Name} to join in, !start to start matching(only when 10 players)\n **OR** !endlobby to stop the lobby');
            playerCount = 0;
        }

        else if (CMD_NAME === 'endlobby') {
            playerCount = -1;
            lobby = [];
            team1 = [];
            team1Rating = [];
            team2 = [];
            team2Rating = [];
            listOfNames = [];
            message.channel.send('Lobby has ended.');
        }
        else if (CMD_NAME === 'join') {
            if (playerCount === -1) {
                message.channel.send("lobby is not created yet. Do !lobby to create a new lobby");
                return;
            } else if (args.length === 0) {
                message.channel.send('Please add summoner name after !join');
                return;
            } else {
                summonerName = []
                    for (i = 0; i < args.length; i++) {
                        summonerName.push(args[i]);
                    }
                    summonerName = summonerName.join(" ");


                if (listOfNames.includes(summonerName)) {
                    message.channel.send('Summoner: '+ summonerName + ' has already joined the lobby');
                } else {
                    getRating(summonerName);

                }
            }
        } else if(CMD_NAME === 'help'){
            message.channel.send("!stats {Summoner Name} - for overall stats for a summoner \n!lobby - to create a custom game lobby where teams would be decided on individuals ranks \n!join {Summoner Name} - to join into the lobby to partake in custom game");
        } else if(CMD_NAME === 'start'){
            if (playerCount == 10) {
                message.channel.send("lobby is full");
                lobby = lobby.sort(sortFunction);
                let i = 0;
                let k = 9;
                let ar = []
                for (let i = 0; i < 10; i++) {
                    ar.push(lobby[i][0]);
                }
                let avg = ar.reduce((a, b) => a + b) / ar.length;
                let team1Avg = 0;
                let team2Avg = 0;

                while (i - k < 0) {
                    //  console.log(i);
                    if (team1Rating.length > 0) {
                        team1Avg = team1Rating.reduce((a, b) => a + b) / team1Rating.length;
                        //console.log('team1 average  is: ' + team1Avg);
                        //console.log('average is: ' + avg);
                        if (team1Rating.length < 5) {
                            if (team1Avg < avg) {
                                team1.push(lobby[i][1]);
                                team1Rating.push(lobby[i][0]);
                                i++;
                            } else {
                                team1.push(lobby[k][1]);
                                team1Rating.push(lobby[k][0]);
                                k--;
                            }
                        }
                    } else {
                        team1.push(lobby[i][1]);
                        team1Rating.push(lobby[i][0]);
                        i++;
                    }

                    if (team2Rating.length > 0) {
                        team2Avg = team2Rating.reduce((a, b) => a + b) / team2Rating.length;
                        if (team2Rating.length < 5) {
                            if (team2Avg < avg) {
                                team2.push(lobby[i][1]);
                                team2Rating.push(lobby[i][0]);
                                i++;
                            } else {
                                team2.push(lobby[k][1]);
                                team2Rating.push(lobby[k][0]);
                                k--;
                            }
                        }
                    } else {
                        team2.push(lobby[i][1]);
                        team2Rating.push(lobby[i][0]);
                        i++;
                    }
                }
                message.channel.send('**Team 1** is:\n'
                    + team1[0] + '\n'
                    + team1[1] + '\n'
                    + team1[2] + '\n'
                    + team1[3] + '\n'
                    + team1[4] + '\n');

                message.channel.send('**Team 2** is:\n'
                    + team2[0] + '\n'
                    + team2[1] + '\n'
                    + team2[2] + '\n'
                    + team2[3] + '\n'
                    + team2[4] + '\n');

                playerCount = -1;
                lobby = [];
                team1 = [];
                team1Rating = [];
                team2 = [];
                team2Rating = [];
                listOfNames = [];
                return;
            }else if(playerCount === -1){
                message.channel.send('lobby not found');
            }else if(playerCount<10){
                message.channel.send("not enough players");
            } else{
                message.channel.send("too many players. use !endlobby and then !lobby to create a new lobby");
            }
        } else{
            message.channel.send("The command does not exist. use !help");
        }

    }
});

client.login(token);