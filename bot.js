/****************************************
 * 
 *   StandBot: Made for discord servers
 *   Copyright (C) 2018 AleeCorp
 *
 *   This program is free software: you can redistribute it and/or modify
 *   it under the terms of the GNU General Public License as published by
 *   the Free Software Foundation, either version 3 of the License, or
 *   (at your option) any later version.
 *
 *   This program is distributed in the hope that it will be useful,
 *   but WITHOUT ANY WARRANTY; without even the implied warranty of
 *   MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 *   GNU General Public License for more details.
 *
 *   You should have received a copy of the GNU General Public License
 *   along with this program.  If not, see <http://www.gnu.org/licenses/>.
 * 
 * *************************************/
const Discord = require('discord.js');
const moment = require('moment');
const readline = require('readline');
const colors = require('colors');
const client = new Discord.Client({
  disableEveryone: true
});
const settings = require('./storage/settings.json')
const fs = require('fs');
const api = require('./tokens.json');
const ownerID = "242775871059001344";

const log = message => {

  console.log(`[${moment().format('YYYY-MM-DD HH:mm:ss')}] ${message}`.white);

};


console.log(`AleeBot ${settings.abVersion}: Copyright (C) 2018 AleeCorp`.gray);
console.log('This program comes with ABSOLUTELY NO WARRANTY; for details type `show w\'.'.gray);
console.log ('This is free software, and you are welcome to redistribute it'.gray);
console.log ('under certain conditions; type `show c\' for details.\n'.gray)

if (process.argv.indexOf("--debug") == -1) {
  console.log("Running AleeBot without --debug command line flag. Debug output disabled.\n".yellow);
} else {
  console.log('[!] Entering debug mode...'.yellow)
  client.on('debug', function(info) {
      log(info.gray);
  });
  client.on('warn', function(info) {
      log(info.red);
  });
}


client.commands = new Discord.Collection();
client.aliases = new Discord.Collection();

fs.readdir('./commands', (err, files) => {
  if (err) console.error(err);
  log(`[!] Attempting to load a total of ${files.length} commands into the memory.`.cyan);
  files.forEach(file => {
    try {
      const command = require(`./commands/${file}`);
      log(`[!] Attempting to load the command "${command.help.name}".`.cyan);
      client.commands.set(command.help.name, command);
      command.conf.aliases.forEach(alias => {
        client.aliases.set(alias, command.help.name);
        log(`[!] Attempting to load "${alias}" as an alias for "${command.help.name}"`.cyan);
      });
    }
    catch (err) {
      log('[X] An error has occured trying to load a command. Here is the error.'.red);
      console.log(err.stack);
    }
  });
  log('[>] Command Loading complete!'.green);
  console.log('\n');
});


client.on('ready', () => {
  log('[>] StandBot is now ready!'.green);
  log(`[i] Logged in as ${client.user.tag}`.green);
  log(`[i] Default Prefix: ${settings.prefix}`.green)
  log(`[i] Bot ID: ${client.user.id}`.green);
  log(`[i] Token: ${api.abtoken}`.green);
  log(`[i] Running version ${settings.version} and in ${client.guilds.size} guilds`.green);

  client.setInterval(function() {
    const games = [
      'StandBot ' + settings.version + ' | ' + settings.prefix + 'help',
      'Annoying Alee',
      'Coding stuff',
      'Drawing shapes',
      'Fighting AstralMod',
    ];
    client.user.setPresence({
      status: 'online',
      afk: false,
      game: {
        type: 0,
        name: games[Math.floor(Math.random() * games.length)],
      },
    });
  }, 200000);
  client.user.setStatus('online');
});

client.on('guildCreate', guild => {

  log(`[i] New guild joined: ${guild.name} (id: ${guild.id}). This guild has ${guild.memberCount} members!`.blue);

});


client.on('guildDelete', guild => {

  log(`[i] I have been removed from: ${guild.name} (id: ${guild.id})`.red);

});


client.on('message', (msg) => {
  if (msg.author.bot) return;
  
  if (!msg.content.startsWith(settings.prefix)) return;
  const args = msg.content.slice(settings.prefix.length).trim().split(/ +/g);
  const command = args.shift();
  let cmd;

  if (client.commands.has(command)) {
    cmd = client.commands.get(command);
  } else if (client.aliases.has(command)) {
    cmd = client.commands.get(client.aliases.get(command));
  }

  if (cmd) {
    if (cmd.conf.guildOnly == true) {
      if (!msg.channel.guild) {
        return msg.channel.createMessage('This command can only be ran in a guild.');
      }
    }
    try {
      cmd.run(client, msg, args);
    }
    catch (e) {
      console.error(e);
    }
  }
});

process.on('unhandledRejection', function(err, p) {

log("[X | UNCAUGHT PROMISE] " + err.stack.red);

});
client.on('reconnecting', function() {
  log("[!] StandBot has disconnected from Discord and is now attempting to reconnect.".yellow);
});

client.on('disconnect', function() {
  log("[X] StandBot has disconnected from Discord and will not attempt to reconnect.".red);
  console.log("At this point, you'll need to restart StandBot.".red);
});

client.login(api.token).catch(function() {
    console.log('[X] Login failed. The token that you put in is invalid, please put in a new one...'.red);
    process.exit(0);
  });