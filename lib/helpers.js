const fs = require("fs")
const path = require("path")
const {execSync,exec} = require("child_process")
const {spawnSync} =require("child_process")
function detectFramework(dir) {
  let frameworks = "";

  function scan(folder) {
    const files = fs.readdirSync(folder);
    if (files.includes('next.config.js')) frameworks="next";
    if (files.includes('vite.config.js')) frameworks="vite";
    if (files.includes('public') && files.includes('src'))
      frameworks="react";

    
    for (const file of files) {
      const fullPath = path.join(folder, file);
      if (fs.statSync(fullPath).isDirectory() && !file.startsWith('node_modules')) {
        scan(fullPath);
      }
    }
  }

  scan(dir);

  return frameworks.length > 0 ? frameworks : "unknown";
}


async function DeployTheFrontend(framework){
    
    const fw = framework;
    
    if(fw==="vite" || fw==="react"){
        try{
            execSync("vercel --version",{stdio : "ignore"});
        }
        catch{
            const ora = (await import('ora')).default;
            const spinner = ora("Loading...").start();
            execSync("npm i -g vercel",{stdio : "ignore"});
            spinner.succeed("-->installed vercel")
        }
        

        
        let log = true;
        try{
            execSync("vercel whoami",{stdio : "ignore"})
            log=true;
        }
        catch{
            log=false
        }

        if(!log){
            
            try {
                    const login = spawnSync('vercel', ['login'], {
                        stdio: 'inherit',
                        shell: true,
                    });
                    
                    if (login.status !== 0) {
                        throw new Error(`Login failed with code ${login.status}`);
                    }
                    
                    
                    } catch (err) {
                    console.error('Login error:', err.message);
                    process.exit(1);
                }
            
    
            console.log("--> Successfully logged into vercel")

    
        }

        try {
            try{execSync("vercel unlink", { stdio: "ignore" });}
            catch(err){
                console.log("--> Making a project")
            }
            
            
            
            const projectName = path.basename(".").toLowerCase().replace(/[^a-z0-9._-]/g, '-');
            execSync(`vercel git connect`, { stdio: "inherit" });
            
           
            execSync("vercel --yes --prod", { stdio: "inherit" });
        } catch (err) {
            console.error('Deployment error:', err.message);
            process.exit(1);
        }
    }
    else if(fw === "next") {
    try {
        execSync("netlify --version");
    } catch {
        const ora = (await import('ora')).default;
            const spinner = ora("Loading...").start();
        execSync("npm i -g netlify", { stdio: "inherit" });
        spinner.succeed("--> Installed Netlify")
    }

   
    try {
        const login = spawnSync('netlify', ['login'], {
            stdio: 'inherit',
            shell: true,
        });

        if (login.status !== 0) {
            throw new Error(`Login failed with code ${login.status}`);
        }
    } catch (err) {
        console.error('Login error:', err.message);
        process.exit(1);
    }

    
    try {
        execSync("netlify unlink", { stdio: "ignore" });
    } catch {}

    
    try {
        execSync("netlify sites:create", { stdio: "inherit" });
        console.log("--> Project created on Netlify");
    } catch (err) {
        console.log("Site creation skipped or failed:", err.message);
    }

    
    try {
        execSync("netlify link", { stdio: "inherit" });
        console.log("--> Project linked");
    } catch (err) {
        console.log(" Project may already be linked:", err.message);
    }

    
    try {
        execSync("netlify deploy --prod", { stdio: "inherit" });
        console.log("--> Project deployed");
    } catch (err) {
        console.log(" Deployment error:", err.message);
    }

    try {
        execSync("netlify init", { stdio: "inherit" });
        console.log("--> GitHub connected to Netlify");
    } catch (err) {
        console.log(" Netlify init skipped or failed:", err.message);
    }
}
else{
    console.log("Framework not supported")
}
}


module.exports = {
    detectFramework,
    DeployTheFrontend
}