const {
  Result,
  Report,
  Skills,
  UserSkill,
  BestVacancy,
} = require("../../db/models");

function rand() {
  return ~~(Math.random() * 2000 + 500);
}

const scraperObject = {
  async scraper(browser, params) {
    const { userId, title, amount, period, city, salary, websites } = params;

    const jobUrl = `https://hh.ru/search/vacancy?text=${title}&search_field=name&area=113&salary=${salary}&currency_code=RUR&experience=doesNotMatter&order_by=publication_time&search_period=${period}&items_on_page=100&no_magic=true&L_save_area=true&from=suggest_post`;
    let page = await browser.newPage();
    await page.goto(jobUrl);
    // Wait for the required DOM to be rendered
    await page.waitForSelector("#a11y-main-content");
    await page.waitForTimeout(1000);
    // Get the link to all the required vacancies
    let urls = await page.$$eval(
      "h3 > .resume-search-item__name > .g-user-content",
      (links) => {
        // Extract the links from the data
        links = links.map((el) => el.querySelector("a").href);
        return links;
      }
    );

    // Loop through each of those links, open a new page instance and get the relevant data from them
    let pagePromise = (link) =>
      new Promise(async (resolve, reject) => {
        let dataObj = {};
        let newPage = await browser.newPage();
        await newPage.goto(link);
        await page.waitForTimeout(rand());
        try {
          dataObj["vacancyName"] = await newPage.$eval(
            "#a11y-main-content > h1 > span",
            (text) => text.textContent
          );
        } catch (err) {
          dataObj["vacancyName"] = "";
        }
        try {
          dataObj["companyName"] = await newPage.$eval(
            '[data-qa="vacancy-company-name"] > span > span',
            (text) => text.textContent
          );
        } catch (err) {
          dataObj["companyName"] = "";
        }
        try {
          dataObj["salary"] = await newPage.$eval(
            '[data-qa="vacancy-salary"] > span',
            (text) => text.textContent
          );
        } catch (err) {
          dataObj["salary"] = "";
        }
        try {
          dataObj["city"] = await newPage.$eval(
            '[data-qa="vacancy-view-location"]',
            (text) => text.textContent
          );
        } catch (err) {
          dataObj["city"] = "";
        }
        try {
          dataObj["description"] = await newPage.$eval(
            '[data-qa="vacancy-description"]',
            (text) => text.textContent
          );
        } catch (err) {
          dataObj["description"] = "";
        }
        resolve(dataObj);
        await newPage.close();
        await page.waitForTimeout(rand());
      });

    let scrapedData = [];
    let countLinks = 0;
    for (link in urls) {
      let currentPageData = await pagePromise(urls[link]);
      scrapedData.push(currentPageData);
      ++countLinks;
      if (countLinks > amount - 1) break;
    }

    /* Analizing received data */
    let wordsObj = {};

    let skillsObj = {};
    for (let i = 0; i < scrapedData.length; i++) {
      let wordsArr = scrapedData[i].description
        .trim()
        .replace(/[^a-zA-Zа-яА-Я0-9\s]/gim, " ")
        .toUpperCase()
        .split(/[\s\n!?, \/ \( \) :;•]/gim)
        .filter((el) => el !== "" && el !== "–" && !+el);
      for (let j = 0; j < wordsArr.length; j++) {
        if (!wordsObj[wordsArr[j]]) {
          wordsObj[wordsArr[j]] = 1;
        } else {
          ++wordsObj[wordsArr[j]];
        }
      }

      for (let skill in wordsObj) {
        if (skill.search(/[a-z0-9]/gim) >= 0) {
          skillsObj[skill] = wordsObj[skill];
        }
      }
    }
    await page.waitForTimeout(rand());
    await browser.close();

    // Если скилы нашлись, то запишем их в таблицу Result
    if (Object.keys(skillsObj).length !== 0) {
      const newResult = await Result.create({
        search_string: title,
        count_vacancy: amount,
        period: period,
        city: city,
        salary: salary,
        website_id: 1,
        user_id: userId,
      });

      if (newResult) {
        const skillsArr = [];
        for (let key in skillsObj) {
          const checkOrCreateSkill = await Skills.findOrCreate({
            where: { skill: key },
            defaults: {
              skill: key,
            },
          });
          skillsArr.push({
            skill_id: checkOrCreateSkill[0].id,
            count: skillsObj[key],
            result_id: newResult.id,
          });
        }
        const newReport = await Report.bulkCreate(skillsArr);
        return newResult.id;
      }
    }
  },
};

module.exports = scraperObject;
