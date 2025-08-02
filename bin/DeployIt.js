#!/usr/bin/env node
const inquirer = require("inquirer");
const path = require("path")
const {program } = require("commander");
const package = require("../package.json")
const helpers = require("../lib/helpers")
const {execSync, exec} = require("child_process")
const git=require("../lib/git-helpers");
const fs = require("fs")

const { TIMEOUT } = require("dns");
const { error } = require("console");

program 
    .name("Deploy-It")
    .description("Deploy your frontend apps straight from the command line")
    .version(package.version);
program
    .command("detect [targetPath]")
    .description("Detect the frontend framework you are using for development -- Enter the path for the root file")
    .action((targetPath = ".")=>{
        const framework = helpers.detectFramework(targetPath);
        console.log("--> Framework used - " + framework);
    }) 

program
    .command("init [targetDir]")
    .description("initializes a git repo in the specified folder if not already initialized")
    .action( async (targetDir = ".")=>{
        const bold = "\x1b[1m";
        const reset = "\x1b[0m";
        const fullpath = path.resolve(targetDir);
        
        if(git.isGitRepo(fullpath)){
            
            await git.stageAndCommit(fullpath);
            
        }
        else{
            
            
            await git.initializeRepo(fullpath);
            await git.stageAndCommit(fullpath);
            
            
            
            
        }
        console.log(`--> Run ${bold}git log${reset} to check your commit history`)
    }
    )

program 
    .command("deinit [targetdir]")
    .description("deinitialize an already initiazlized git repo")
    .action((targetDir = ".")=>{
        const fullpath = path.resolve(targetDir);

        git.deinitGitRepo(fullpath);
    })
let answers = ""

program
    .command("push [targetPath]")
    .description("Provide the repo link from github to push this repository to github")
.action(async (targetPath =".") => {
        try {
            
            try{
                execSync("git remote show origin" , {stdio :"ignore"})
            }
            catch(err){
            const { default: inquirer } = await import("inquirer");
            console.log("--> Repository does not exist or is not created - Create a new one")
            console.log("--> Steps to create a new repo\n 1. login to github on your browser\n 2. click on create new repository\n 3. copy the link")
            answers = await inquirer.prompt([
                {
                    type: "input",
                    name: "link",
                    message: "--> Enter the GitHub repository link: ",
                    validate: function (input) {
                        if (!input.startsWith("https://github.com/")) {
                            return "Please enter a valid GitHub repository URL.";
                        }
                        return true;
                    },
                },
            ]);

        await git.pushToGithub(answers.link)
        
        }
            

        } catch (err) {
            console.error("--> <-- Error:", err.message);
        }
    });

program
    .command("addme [targetPath]")
    .description("Adds a readme file to your project by analyzing your github repository")
    .action(async (targetPath=".")=>{
        try {
            let answers = ""
            try{
                try{
                const readmepath=path.join(targetPath,"README.md")
                }
                catch(err){
                    console.log(err)
                }
                if(fs.existsSync(readmepath)){
                    console.error("Read me file already exists")
                    return;
                }
            }
            catch(err){
            const { default: inquirer } = await import("inquirer");
            answers = await inquirer.prompt([
                {
                    type: "input",
                    name: "prompt",
                    message: "--> Enter the prompt to create your read me\n--> (EX : DeployIt cli/coming live soon/init,push,deinit,deploy/frontend - vercel and netlify / use npm i AayushM0/DeployIt-CLI to downlaod ) \n--> prompt : ",
                    // validate: function (input) {
                    //     if (!input.startsWith("https://github.com/")) {
                    //         return "Please enter a valid GitHub repository URL.";
                    //     }
                    //     return true;
                    // },
                },
            ]);

        await git.createReadMe(targetPath,answers.prompt)
        
        }
            

        } catch (err) {
            console.error("--> <-- Error here:", err.message);
        }

    })
program
    .command("deploy [targetDir]")
    .description("Deploys your project on the most suitable site according to your framework used")
    .action((targetDir = ".")=>{
        framework=helpers.detectFramework(targetDir);
        helpers.DeployTheFrontend(framework)
    })
program.parse(process.argv)