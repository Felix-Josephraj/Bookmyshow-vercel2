const app = require('express')()
const mongoose = require('mongoose')

// connecting to mongoose
mongoose.set('strictQuery', false)
mongoose.connect(
  'mongodb+srv://felixanderson500:Life1998@atlascluster.2rtpa.mongodb.net/toDoListDB',
  {
    useNewUrlParser: true,
  }
)

const itemSchema = {
  name: String,
}

// const Item = mongoose.model('Item', itemSchema)

let chrome = {}
let puppeteer

if (process.env.AWS_LAMBDA_FUNCTION_VERSION) {
  chrome = require('chrome-aws-lambda')
  puppeteer = require('puppeteer-core')
} else {
  puppeteer = require('puppeteer')
}

app.get('/api', async (req, res) => {
  let options = {}

  if (process.env.AWS_LAMBDA_FUNCTION_VERSION) {
    options = {
      args: [...chrome.args, '--hide-scrollbars', '--disable-web-security'],
      defaultViewport: chrome.defaultViewport,
      executablePath: await chrome.executablePath,
      headless: false,
      ignoreHTTPSErrors: true,
    }
  }

  try {
    let browser = await puppeteer.launch(options)

    let page = await browser.newPage()
    await page.goto(
      'https://www.flipkart.com/'
      // 'https://in.bookmyshow.com/trichy/cinemas/ramba-ac-dolby-atmos-trichy/RAMB/20230119'
      // 'https://in.bookmyshow.com/trichy/cinemas/la-cinema-maris-complex-rgb-laser-trichy/LATG/20230117'
    )

    /* Run javascript inside the page */
    const data = await page.evaluate(() => {
      const list = []
      const items = document.querySelector('title').innerHTML

      // for (const item of items) {
      //   list.push({
      //     company: item.querySelector('.company h3').innerHTML,
      //     position: item.querySelector('.company h2').innerHTML,
      //     link: 'https://remoteok.io' + item.getAttribute('data-href'),
      //   })
      // }
      return items

      // return list
    })
    await browser.close()
    res.send(data)
    // res.send(await page.title());

    // updating the database

    // for (let i = 0; i < 10; i++) {
    //   task(i)
    // }

    let count = 0
    // var intervalId = setInterval(function () {
    //   // call your function here
    //   count += 1
    //   const eatBurger = new Item({
    //     name: 'Eat burger' + count,
    //   })

    //   Item.insertMany([eatBurger], function (err) {
    //     if (err) {
    //       // console.log(err)
    //     } else {
    //       // console.log('Successfully inserted')
    //     }
    //   })
    //   if (count >= 5) {
    //     clearInterval(intervalId)
    //   }
    // }, 30000)

    // function task(i) {
    //   const eatBurger = new Item({
    //     name: 'Eat burger' + i,
    //   })

    //   setTimeout(function () {
    //     Item.insertMany([eatBurger], function (err) {
    //       if (err) {
    //         console.log(err)
    //       } else {
    //         console.log('Successfully inserted')
    //       }
    //     })
    //   }, 5000 * i)
    // }
  } catch (err) {
    console.error(err)
    return null
  }
})

app.listen(process.env.PORT || 3000, () => {
  console.log('Server started')
})

module.exports = app
