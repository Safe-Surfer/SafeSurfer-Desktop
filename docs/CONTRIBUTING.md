# Contributing to this project
Thank you for wanting to contribute to Safe Surfer desktop! Let's get you up to date on contributing to this project.  
We're excited to see this app getting improved and used worldwide, improving the lives of so many people through keeping them safe online.  

## Ground rules
#### Be respectful to others
We can achieve great things when we work collaboratively and respectfully.  
Remember that all source code must respect the freedom and privacy of others.  

#### We're all here to collaborate, so let's enjoy it
Through our collaboration in the building of this community, we can achieve awesome things.  
By collaborating with one another, we can build an excellent project, which will positively impact other people’s lives.  

#### Changes must NOT compromise compatibility across platforms
Fixing things is great, especially when it doesn't break anything else.  
Please be considerate with code which is altered.  
Always make sure to test changes to ensure that everything is working how you want it to.  

#### Stay awesome
We appreciate all the help which will come from this project, so we greatly thank our contributors.  

## Your first commit
Looking for places to start? A good place is the [issues](https://gitlab.com/safesurfer/SafeSurfer-Desktop/issues) page.  
There will likely be a few issues for you to check out and to see if you can resolve.  

## How to make changes
Please read our guide on [pull requests](PULLREQUESTCHECKLIST.md) if you wish to make one.  
1. Fork this project
2. Make changes to the fork
3. Submit a pull request

## Report bugs
Also using our [issues](https://gitlab.com/safesurfer/SafeSurfer-Desktop/issues/new) page, you can report bugs by using the `bugs.md` template.  
Steps to report bugs:  
1. Find a bug (you will to be able to replicated it)
2. Click on build/version information in Menu --> Info --> Version: xxxxx - Build: xxxxx, press yes to copy information and head over to issues page
3. Choose the bug template
4. Paste version information below the `App Information` header
5. Fill in the rest of the fields in the template

## Which js documents do what?
`assets/scripts` is where most of the code lives.  
`assets/style` is where the styling is.  
`assets/media` is where all artwork it stored.  
`assets/translations` is where all the translation string are stored.  
`assets/scripts/logic.js` is where most of the code is.  
`assets/scripts/main.js` is where initalising takes place.  
`assets/scripts/menu.js` is where the code for the app's menu lives.  
`assets/scripts/i18n.js` is where the framework of translating the app is stored.  
`buildconfig/buildmode.json` is where some runtime/version variables are stored.  
`support/` is where the platform specific files are stored.  

## Request features
Again, using our [issues](https://gitlab.com/safesurfer/SafeSurfer-Desktop/issues/new) page, you can request features by using the `features.md` template.  
Simply write in the given fields, a description of the feature that is of request.  

## Translating
For information regarding translating Safe Surfer desktop, please read [TRANSLATING.md](TRANSLATING.md)  

## Notes
For the NodeJS library from NPM which is responsible for changing the DNS settings, please check out [node_dns_changer](https://www.npmjs.com/package/node_dns_changer) on NPM or on [GitLab](https://gitlab.com/BobyMCbobs/node_dns_changer).  
This library is very important to the project, so it should also be supported.  
