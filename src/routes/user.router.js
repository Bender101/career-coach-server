const userRouter = require('express').Router()
const { user } = require('pg/lib/defaults')
const userController = require('../controllers/user.controller')


userRouter.get('/allskillsforskillsselect', userController.allSkillsForSelectSkills )

userRouter.put('/changerate',userController.newRate)

userRouter.get('/checkuserid', userController.checkUserId )

userRouter.post('/adduserskilllearn', userController.newUserSkillLearn )
userRouter.get('/allUserSkillsFromLearn/:id', userController.allUserSkillsFromLearn )

userRouter.post('/adduserskillskill', userController.newUserSkillSkill )
userRouter.get('/allUserSkillsFromSkills/:id', userController.allUserSkillsFromSkills )

userRouter.delete('/deleteuserskill', userController.deleteUserSkillFromSkill )

userRouter.delete('/deleteuserlearn', userController.deleteUserSkillFromLearn)

module.exports = userRouter
