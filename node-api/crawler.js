const { Browser, Builder, By } = require("selenium-webdriver");

async function SearchCrawler(keywords, maxtime) {
  var links = [];
  var eachWord = 30;
  var searches = eachWord * keywords.length;

  var startingTime = Date.now();

  const driver = await new Builder().forBrowser(Browser.CHROME).build();

  await driver.get("https://www.bing.com/search?q=" + keywords[0]);

  await delay(1500);

  for (let i = 0; i < searches; i++) {
    if ((Date.now() - startingTime) / 1000 < maxtime) {
      try {
        await delay(100);

        if (i / eachWord >= 1 && i % eachWord === 0) {
          await driver.get(
            "https://www.bing.com/search?q=" + keywords[i / eachWord]
          );
          await delay(1000);
        }

        var elements = await driver.findElements(
          By.css(`div[class*='tpcn'] a`)
        );

        for (let a = 0; a < elements.length; a++) {
          var link = await elements[a].getAttribute("href");
          if (
            link != null &&
            !link.includes("www.bing.com") &&
            !link.includes("javascript:void") &&
            !links.includes(link)
          ) {
            links.push(link);
          }
        }

        await driver.executeScript(`
      document.getElementsByClassName('sw_next')[0].click()
    `);
      } catch (e) {
        console.log(e);
      }
    }
  }

  driver.close();

  return links;
}

function delay(time) {
  return new Promise((resolve) => setTimeout(resolve, time));
}

async function MultipleCrawler(
  browsers,
  keywords,
  filter = [],
  maxtime = 3600
) {
  var promises = [];
  var links = [];

  if (browsers >= keywords.length) {
    browsers = 1;
  }

  var keyParts = keywords.length / browsers;

  for (let i = 0; i < browsers; i++) {
    var keywordAux = [];

    if (browsers > 1) {
      keywordAux = keywords.splice(0, keyParts);
    } else {
      keywordAux = keywords;
    }

    promises.push(SearchCrawler(keywordAux, maxtime));
  }

  await Promise.allSettled(promises).then((res) => {
    for (let i = 0; i < res.length; i++) {
      var linksAux = res[i].value;

      for (let a = 0; a < linksAux.length; a++) {
        if (!links.includes(linksAux[a]) && !filter.includes(linksAux[a])) {
          links.push(linksAux[a]);
        }
      }
    }
  });

  return links;
}

module.exports = MultipleCrawler;
