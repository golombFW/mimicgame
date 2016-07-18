#Mimic Game
##Overview
This project is created as a part of master's thesis on 
*"Utilization of the gamification in the building the human emotions photo database"*
in Computer Science at Gdansk University of Technology.

##Getting Started
This project to get working needs **Node.js** or io.js and **npm** package manager
installed on your machine.
It also needs **gulp-cli**.

It also needs to set up a new Parse app at [Parse.com](https://parse.com) and setup 
a new facebook app at [developers.facebook.com](https://developers.facebook.com/)

**Remember to turn on and configure facebook authentication in Parse app settings!**
###1. Change application ids and keys
Once you've set up Parse and Facebook, insert your app's Parse Application Id, 
Parse JavaScript Key and Facebook App ID into the config file [`env.json`](src/js/env.json).

###2. How to build and run application
In project root (same path like this README file) run following commands

```npm install``` will download and install all needed stuff to build and run project

```npm start``` will build project and run server.

You can stop server with ```Ctrl-C```

###3. Deploy app to Parse
####First setup
Follow these instructions ([parse.com/docs/cloudcode/guide](https://parse.com/docs/cloudcode/guide#command-line-installation)) to install parse command line tool.

If you have built app in previous section then you should have ```target``` directory in your project path.
1. In project root directory run ```parse new```
2. Select existing app option
3. Enter number connected with your app name
4. Enter *'target'* as name
5. Rebuild project
####Deploy
1. Go to ```target``` or ```target-prod``` directory
2. Run ```parse deploy```

###4. First run of app
After deploy and before app first run you have to create necessary values in database.
1. Go to your app dashboard on [parse.com](https://dashboard.parse.com/apps)
2. Go to Core -> Jobs
3. Create and run these jobs in following order
    1. createEmotionList
    2. createDefaultGameTypes
    3. createDefaultPhotoQuestions
    4. createDefaultRankRules

##Miscellaneous
* default ssl certificates and keys password is '1234'
* If you don't want to run server, but only build project you can run
   ```npm run build``` instead of ```npm start```
* To build project to production environment run ```npm run build-prod```

##Authors
Filip Gołębiewski