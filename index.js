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

const Item = mongoose.model('Item', itemSchema)

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
      headless: true,
      ignoreHTTPSErrors: true,
    }
  }

  try {
    let browser = await puppeteer.launch(options)

    let page = await browser.newPage()
    await page.goto('https://www.google.com')
    // res.send(await page.title());

    // updating the database

    // for (let i = 0; i < 10; i++) {
    //   task(i)
    // }

    let count = 0
    var intervalId = setInterval(function () {
      // call your function here
      count += 1
      const eatBurger = new Item({
        name: 'Eat burger' + count,
      })

      Item.insertMany([eatBurger], function (err) {
        if (err) {
          // console.log(err)
        } else {
          // console.log('Successfully inserted')
        }
      })
      if (count >= 5) {
        clearInterval(intervalId)
      }
    }, 30000)

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
  res.send('gaas')
})

app.listen(process.env.PORT || 3000, () => {
  console.log('Server started')
})

module.exports = app
