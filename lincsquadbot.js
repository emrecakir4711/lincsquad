const Discord = require('discord.js');
const fs = require("fs");
const moment = require("moment");
const db = require('quick.db');
const client = new Discord.Client();
const işaret = require('./işaret.json');
const hedefimiz = require('./hedef.json');
const { Cleint, MessageEmbed } = require('discord.js');

var prefix = işaret.prefix
var hedef = hedefimiz.hedef

client.on('ready', () => {
  console.log(`Sunucuya Giriş Yaptı ${client.user.tag}!`);
  console.log(`${client.user.tag} aktif edildi:)`);
    client.user.setActivity('Yapım Aşamasında!', { type: 'PLAYING' })
    .then(presence => console.log(`Durum ${presence.activities[0].name} oldu.`))
    .catch(console.error);
});

const log = message => {
  console.log(`[${moment().format("YYYY-MM-DD HH:mm:ss")}] ${message}`);
};

client.commands = new Discord.Collection();
client.aliases = new Discord.Collection();
fs.readdir("./komutlar/", (err, files) => {
  if (err) console.error(err);
  log(`${files.length} komut yüklenecek.`);
  files.forEach(f => {
    let props = require(`./komutlar/${f}`);
    log(`Yüklenen komutlar: ${props.help.name}.`);
    client.commands.set(props.help.name, props);
    props.conf.aliases.forEach(alias => {
      client.aliases.set(alias, props.help.name);
    });
  });
});

client.reload = command => {
  return new Promise((resolve, reject) => {
    try {
      delete require.cache[require.resolve(`./komutlar/${command}`)];
      let cmd = require(`./komutlar/${command}`);
      client.commands.delete(command);
      client.aliases.forEach((cmd, alias) => {
        if (cmd === command) client.aliases.delete(alias);
      });
      client.commands.set(command, cmd);
      cmd.conf.aliases.forEach(alias => {
        client.aliases.set(alias, cmd.help.name);
      });
      resolve();
    } catch (e) {
      reject(e);
    }
  });
};

client.load = command => {
  return new Promise((resolve, reject) => {
    try {
      let cmd = require(`./komutlar/${command}`);
      client.commands.set(command, cmd);
      cmd.conf.aliases.forEach(alias => {
        client.aliases.set(alias, cmd.help.name);
      });
      resolve();
    } catch (e) {
      reject(e);
    }
  });
};

client.unload = command => {
  return new Promise((resolve, reject) => {
    try {
      delete require.cache[require.resolve(`./komutlar/${command}`)];
      let cmd = require(`./komutlar/${command}`);
      client.commands.delete(command);
      client.aliases.forEach((cmd, alias) => {
        if (cmd === command) client.aliases.delete(alias);
      });
      resolve();
    } catch (e) {
      reject(e);
    }
  });
};

client.elevation = message => {
  if (!message.guild) {
    return;
  }
  let permlvl = 0;
  if (message.member.hasPermission("BAN_MEMBERS")) permlvl = 2;
  if (message.member.hasPermission("ADMINISTRATOR")) permlvl = 3;
  if (message.author.id === ayarlar.sahip) permlvl = 4;
  return permlvl;
};

client.on('message', message => {
  if (!message.guild) return;
  if (message.content.startsWith(prefix + 'kick')) {
    if (!message.member.hasPermission('ADMINISTRATOR')) return message.channel.send('Bu komudu kullanmaya iznin yok!')
    const user = message.mentions.users.first();
    if (user) {
      const member = message.guild.member(user);
      if (member) {
        member
          .kick('Optional reason that will display in the audit logs')
          .then(() => {
            const log = message.guild.channels.cache.find(channel => channel.name ==='log')
            log.send(` ${user.tag}  **kişisi atıldı**`);
          })
          .catch(err => {
            message.reply('Bu kişiyi atamam.');
            console.error(err);
          });
      } else {
        message.reply("Bu kişi sunucuda bulunmuyor.");
      }
    } else {
      message.reply("Atılacak kişiyi yaz!");
    }
  }
});



client.on('guildMemberAdd' , member => {
  const girişçıkış = member.guild.channels.cache.find(channel => channel.name === 'gelen-giden');
  girişçıkış.send(`Sunucuya Hoş Geldin!, ${member}`);
  member.send(`${member} Sunucumuza Hoş Geldin! -Linç Squad`);
});

client.on('guildMemberRemove' , member => {
  const girişçıkış = member.guild.channels.cache.find(channel => channel.name === 'gelen-giden');
  girişçıkış.send(`${member} Sunucumuzdan Ayrıldı... `);
});

client.on('message', message => {
  if (message.content.startsWith(prefix + 'oylama')) {
    const args = message.content.split(' ').slice(1)
    const botmesajı = args.join(" ")
    if (!message.member.hasPermission('ADMINISTRATIR')) return message.reply('Oylama yapmak için **YETKİLİ** olmalısın!');
    if (!botmesajı) return message.reply('Oylama açıklamasını yazın.');
    message.delete(message.author)
    const embed = new MessageEmbed()
    .setTitle('OYLAMA')
    .setDescription(botmesajı)
    .setFooter('**Linç Squad**');
    message.channel.send({ embed: embed }).then( embedMessage => {
      embedMessage.react("✔️")
      embedMessage.react("❌");
    })
  }
})

client.on('message', message => {
  if (message.content.startsWith(prefix + 'duyur')) {
    const kanal = message.mentions.channels.first();
    const args = message.content.split(' ').slice(2)
    const botmesajı = args.join(" ")
    if (!message.member.hasPermission('ADMINISTRATIR')) return message.reply('Duyuru yapmak için **YETKİLİ** olmalısın!');
    if (!botmesajı) return message.reply('Duyuru açıklamasını yazın!');
    if (!kanal) return message.reply('Kanalı Tanımlamadınız!');
    message.delete(message.author)
    kanal.send(botmesajı);
  }
})

client.on('message', message =>{
  if (message.content.startsWith(prefix + 'özel')) {
    const kişi = message.mentions.users.first();
    const args = message.content.split(' ').slice(2)
    const botmesajı = args.join(" ")
    if (!message.member.hasPermission('ADMINISTRATIR')) return message.reply('Duyuru yapmak için **YETKİLİ** olmalısın!');
    if (!botmesajı) return message.reply('Duyuru açıklamasını yazın!');
    if (!kişi) return message.reply('Kişiyi tanımlayın!');
    message.delete(message.author)
kişi.send(botmesajı);
  }
})


client.on('message', message => {
  if (message.content.toLowerCase() === prefix + 'sunucu') {
    const kanal = new MessageEmbed()

    .setTitle('Linç Squad')
    .setDescription('Bu sunucu 03.02.2021 Tarihinde açılmış olup üyelerini eğlendirmeyi hedeflemektedir.')
    .setAuthor('Linç Squad Bot')
    .setColor("RANDOM")
    .setThumbnail('https://cdn.discordapp.com/attachments/806517644836470806/806919532676644904/logo.jpg')
    .addField(':white_check_mark: ', 'Sunucuda iyi eğlenceler!');
    message.channel.send(kanal);
  }
});

client.on('message', msg => {
  if (msg.content.toLowerCase() === 'ping') {
    msg.reply('Pong!');
  }
});

client.on('message', msg => {
  if (msg.content.toLowerCase() === 'günaydın') {
    msg.reply('Günaydın :)');
  }
});

client.on('message', msg => {
  if (msg.content.toLowerCase() === 'polis emre') {
    msg.reply('DadiDadi Polis Emre Geldi! https://www.youtube.com/watch?v=I1ubHlbYMcw&ab_channel=OyunMontaj%2CBazenE%C4%9Flence');
  }
});

client.on('message', msg => {
  if (msg.content.toLowerCase() === prefix + 'bilgi') {
    msg.reply('Sunucuda yazılı sohbet odaları saat 00:50 itibarı ile kapanır.');
  }
});

client.on('message', msg => {
  if (msg.content.toLowerCase() === 'sa') {
    msg.reply('Aleyküm Selam Hocam');
  }
});

client.on('message', msg => {
  if (msg.content.toLowerCase() === 'napim') {
    msg.reply('Deme öyle');
  }
});

client.on('message', msg => {
  if (msg.content.toLowerCase() === 'selamun aleyküm') {
    msg.reply('Aleyküm Selam Hocam');
  }
});

client.on('message', msg => {
  if (msg.content.toLowerCase() === 'selamın aleyküm') {
    msg.reply('Aleyküm Selam Hocam');
  }
});

client.login('ODA2OTE2NjYzMTk3OTU4MjE0.YBwZtA.kSBqFWPnf1Zn-ZbKLf9tmCsZdYo');
