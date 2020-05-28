const { MessageEmbed } = require('discord.js')
const amazon = require('../common/Amazon')

module.exports = {
  run: (b, g, m, a) => run(b, g, m, a),
  name: "details",
  desc: "Return details using an amazon link",
  usage: "details [amazon link]",
  type: "view"
}

function run(bot, guild, message, args) {
  return new Promise((resolve, reject) => {
    var asin;
  
    // Try to see if there is a valid asin
    try {
      asin = args[1].split("/dp/")[1].match(/^[a-zA-Z0-9]+/)[0]
    } catch(e) {
      reject('Not a valid link')
    }

    amazon.details(bot, `https://www.amazon.com/dp/${asin.replace(/[^A-Za-z0-9]+/g, '')}/`).then(res => {
      // Replace empty values
      Object.keys(res).forEach(k => {
        if(!res[k] ||
          res[k].length <= 1) res[k] = 'none'
      })

      amazon.find(bot, res.full_title).then(sRes => {
        var allPrices = 0
        var validItems = 0
        bot.debug.log('Calculating average price...', 'info')
        sRes.forEach(itm => {
          if (itm.price) {
            bot.debug.log(`${itm.title}: ${itm.price}`, 'debug')
            validItems++
            allPrices += parseFloat(itm.price.split('$')[1])
          }
        })

        var embed = new MessageEmbed()
          .setColor('ORANGE')
          .setTitle(res.full_title)
          .setAuthor(res.seller.includes('\n') ? 'invalid':res.seller)
          .setImage(res.image)
          .setDescription(`${res.full_link}\n${res.features != 'none' ? res.features.join('\n\n'):''}`)
          .addField('Price', res.price, true)
          .addField('Rating', res.rating, true)
          .addField('Shipping', res.shipping, true)
          .addField('Availability', res.availability)
          .addField('Average price for similar items', '$' + (allPrices/sRes.length).toFixed(2))
  
        resolve(message.channel.send(embed))
      })
    }).catch(e => {
      console.log(e)
      reject('Got an error retrieving the Amazon item')
    })
  })
}