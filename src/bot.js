require("dotenv").config();
const fetch = require('node-fetch');

const { Client } = require('discord.js');
const client = new Client();
const token = process.env.DIS_TOKEN;
const prefix = process.env.PREFIX
const key = process.env.API_KEY;
const sp = '%20';




client.on('ready', () => {
    console.log(`${client.user.username} has logged in.`);
});

client.on('message', (message) =>{

    async function fetchRankedData(id, name){
        const response = await fetch("https://na1.api.riotgames.com/lol/league/v4/entries/by-summoner/"+ id+"?api_key="+key);
        let data = await response.json();
        //console.log(data);

        if(data[0].tier){
            totalGames = data[0].wins + data[0].losses;
            winPercent = (data[0].wins/totalGames)*100;
            winPercent = Math.round(winPercent);
            message.channel.send('Queue type: ' + data[0].queueType + '\n' + 
            'Rank: ' + data[0].tier + ' ' + data[0].rank + ' ' + data[0].leaguePoints + 'LP'+'\n'+
            'Wins: ' + data[0].wins + '\n' + 
            'Losses: ' + data[0].losses + '\n'+
            'Win percent: ' + winPercent + '%');

        }else{
            message.channel.send('Player has not played ranked.');
        }

        message.channel.send('More info can be found at: https://groupproject13.herokuapp.com/summ?name=' + name);

    }

    async function fetchSumData(name){
        while(name.includes(" ")){
            let spaceSpot = name.indexOf(" ");
            name = name.substring(0,spaceSpot) + sp + name.substring(spaceSpot+1);
        }
        const link = `https://na1.api.riotgames.com/lol/summoner/v4/summoners/by-name/${name}?api_key=${key}`;
        console.log(link);
    
        const response = await fetch(link);
        let data = await response.json();
    
        if(data.name){
            message.channel.send('Name: '+data.name+'\n'+'Summoner level: '+ data.summonerLevel);
            fetchRankedData(data.id, name);
        }else{
            message.channel.send("Summoner does not exist.");
        }
    }
    if(message.author.bot === true) return;
    //console.log(`[${message.author.tag}]: ${message.content}`);
    if(message.content.startsWith(prefix)){
        const [CMD_NAME,...args] = message.content
        .trim()
        .substring(prefix.length).split(" ");

        if(CMD_NAME === 'stats'){
            //message.channel.send('command name: ' + CMD_NAME)
            //message.channel.send('arguements with CMD_NAME are: ' + args)

            if(args.length === 0){
                message.channel.send('Please add summoner name after !stats');
                return;
            }
            else{
                summonerName = []
                for(i = 0; i< args.length;i++){
                    summonerName.push(args[i]);
                }
                summonerName = summonerName.join(" ");
                //message.channel.send('summoner name is: '+summonerName);

                const name = fetchSumData(summonerName);
                //message.channel.send(name);
            }
        }
    }
});

client.login(token);