const fs = require('fs');
const { Builder, Browser, By, until } = require('selenium-webdriver');

const MOVIE_NAME = process.env.MOVIE_NAME;
const ITER = process.env.ITER;

const main = async () => {
  const driver = await new Builder().forBrowser(Browser.CHROME).build();
  try {
    await driver.get(`https://movie.naver.com/`);
    const movieSearchBox = await driver.findElement(By.id('ipt_tx_srch'));
    await movieSearchBox.sendKeys(MOVIE_NAME);

    await driver.wait(until.elementLocated(By.css('.auto_tx_area')), 10000);
    const firstMatch = await driver
      .findElement(By.css('.auto_tx_area a'))
      .getAttribute('href');
    const movieCode = firstMatch.match(/(?<=code=)[0-9]*/g)[0];

    let data = [];
    for (let j = 0; j < (ITER || 20); j++) {
      await driver.get(
        `https://movie.naver.com/movie/point/af/list.naver?st=mcode&sword=${movieCode}&page=${
          j + 1
        }`,
      );
      await driver.wait(until.elementLocated(By.css('tbody')), 10000);
      const list = await driver.findElements(By.css('td.title'));

      for (let i = 0; i < 10; i++) {
        const innerTexts = await list[i].getAttribute('innerText');
        const textList = innerTexts.split('\n');

        const text = textList[3].replace(' 신고', '');
        const is_positive = textList[2] >= 6 ? 1 : 0;

        if (!!text) {
          data.push({ text, is_positive });
        }
      }
    }

    const movieName = await driver.findElement(By.css('.choice_txt')).getText();
    fs.writeFileSync(`${movieName}_reviews.json`, JSON.stringify(data));
  } finally {
    await driver.quit();
  }
};

main();
