const {execSync} = require("child_process");
const fs = require("fs")
const path = require("path");
const AI = require("./testai")



function isGitRepo(targetPath){
    const gitpath = path.join(targetPath,".git");
    return fs.existsSync(gitpath);
}


async function initializeRepo(targetPath){
    const ora = (await import('ora')).default;
const spinner = ora("..").start();
    try {
        
        execSync("git init", { cwd: targetPath, stdio: "ignore" });
        spinner.succeed("--> Initialized empty git repo")
        // console.log("--> Initialized empty git repo")
        const ignorepath = path.join(targetPath, ".gitignore");
        
        if(!fs.existsSync(ignorepath)){
        fs.writeFileSync(ignorepath, "node_modules\n.env\n");
        spinner.succeed(`--> .gitignore created at ${ignorepath}`)
        }
        // console.log(`--> .gitignore created at ${ignorepath}`);

       
    } catch (err) {
        console.log("--> Failed to run", err);
        process.exit(1);
    }

    
}

async function stageAndCommit(targetPath) {
    const ora = (await import('ora')).default;
const spinner = ora("..").start();
  try {
    
    execSync("git add .", { cwd: targetPath, stdio: "inherit" });
    spinner.succeed("--> Added unstaged files to the commit")
    // console.log("--> Added unstaged files to the commit");

   
    const diffCached = execSync("git diff --cached --stat", {
      cwd: targetPath,
      encoding: "utf8",
    });

    if (!diffCached.trim()) {
      console.log("--> No staged changes to commit.");
      return;
    }

    try {
        let lastCommitMessage="";
        try{
            lastCommitMessage = execSync("git log -1 --pretty=%B", {
    cwd: targetPath,
    encoding: "utf8",
    stdio : ["pipe","pipe","ignore"]
  }).trim();
        }
        catch(err){
            lastCommitMessage =null;
            
        }
        const message=await AI.generateCommitMessageWithTogether(diffCached);
        const commitMessage = lastCommitMessage === null ? "initial commit" : message;
        console.log(`--> Commit name - ${commitMessage}`)
        try{
            execSync(`git commit -m ${JSON.stringify(commitMessage)}`,{cwd : targetPath , encoding : "utf-8"});
            spinner.succeed('--> Successfully created a commit')
    // console.log('--> Successfully created a commit')
        }
        catch(err){console.log("--> Error while creating a commit",err.message)};
    }
    catch(err){
        console.log("--> Error at last commit message ", err.message);
    }

    
  } catch (err) {
    console.error("--> Error occurred:", err.message);
  }

  
}

async function createReadMe(targetPath,prompt){
    const ora = (await import('ora')).default;
const spinner = ora("..").start();
    const readmepath = path.join(targetPath,"README.md")
    if(!fs.existsSync(readmepath)){
        const readmedata = await AI.generateReadMe(prompt)
        fs.writeFileSync(readmepath,readmedata);
        spinner.succeed("--> Read me file created")
        }

}

function deinitGitRepo(targetPath){
    
    const gitPath = path.join(targetPath , ".git")
    if(fs.existsSync(gitPath)){
        fs.rmSync(gitPath , {recursive : true , force : true});
        
        console.log("--> Git repo has been deinitialized")

    }
    else{
        const bold = "\x1b[1m";
            const reset = "\x1b[0m";
        console.log(`--> No Git repo is initialized in the root folder - run ${bold}DeployIt init${reset}`);
    }
}

async function pushToGithub(link){
    const ora = (await import('ora')).default;
const spinner = ora("..").start();
    try{
        execSync("git branch -M main")
        
        try{
            execSync("git remote show origin",{stdio : "ignore"})
            console.log("--> Repository found pushing changes")
            
        }
        catch{
            execSync(`git remote add origin ${link}`)
            console.log("--> Successfully connected to github")
        }
    }
    catch(err){
        console.log("--> <-- Error while connecting to github",err.message)

    }

    try{
        execSync("git push -u origin main");
        spinner.succeed("--> Pushed changes to github")

    }
    catch(err){
        console.log("--> <-- Error while pushing to github",err.message)
    }
}

module.exports = {
    isGitRepo,
    initializeRepo,deinitGitRepo,stageAndCommit
    ,pushToGithub,createReadMe
}