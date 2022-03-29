const puppeteer = require('puppeteer');
const browserObject = require('../scrapper/browser');
const scraperController = require('../scrapper/pageController');
const { Skills, UserSkill } = require('../../db/models');

const scrapHH = async (req, res) => {
  let { userId, title, amount = 1, period = 1, city = 'Россия', salary, websites } = req.body;
  const skillsObj = {};

  period = (period > 30) ? 30 : +period;



  const userSkills = await UserSkill.findAll({
    where: { user_id: +userId },
    include: Skills,
    order: [["createdAt", "DESC"]],
  });

  const userSkillsArr = [];
  if (userSkills.length > 0) {
    for (let i = 0; i < userSkills.length; i++) {
      userSkillsArr.push(userSkills[i].Skill.skill);
    }
  }

    //Start the browser and create a browser instance
  let browserInstance = browserObject.startBrowser();

    const params = {
    userId,
    title,
    amount,
    period,
    city,
    salary,
    websites
  };
  const resultId = await scraperController(browserInstance, params);


  
  return res.json({resultId});
};



module.exports = {
  scrapHH,
};
