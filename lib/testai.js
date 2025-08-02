const axios = require("axios");
const path = require("path")
const fs = require("fs")
require('dotenv').config({ 
  path: path.join(__dirname, '..', '.env'),
  silent: true  
});

async function generateCommitMessageWithTogether(stat) {

  const response = await axios.post(
    "https://openrouter.ai/api/v1/chat/completions",
    {
      model: "openai/gpt-3.5-turbo",
      messages: [
        {
  role: "user",
  content: "provide a short and precise one line commit for the following git stat in about 4 words and keep in my mind that its for js:\n\n" + stat
}

      ],
      max_tokens: 100,
      temperature: 0.5
    },
    {
      headers: {
        Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
        "Content-Type": "application/json"
      }
    }
  );
//  console.log("--> " + response.data.choices[0].message.content.trim())
  return response.data.choices[0].message.content.trim();
}



async function generateReadMe(prompt) {

  const response = await axios.post(
    "https://openrouter.ai/api/v1/chat/completions",
    {
      model: "openai/gpt-3.5-turbo",
      messages: [
        {
  role: "user",
  content: `Create a minimal read me file with only the given data ${prompt}`
}

      ],
      max_tokens: 1000,
      temperature: 0.5
    },
    {
      headers: {
        Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
        "Content-Type": "application/json"
      }
    }
  );
//  console.log("--> " + response.data.choices[0].message.content.trim())
  return response.data.choices[0].message.content.trim();
}



// async function  callAI() {
//   const readme= await generateReadMe("DeployIt cli/coming live soon/init,push,deinit,deploy/frontend - vercel and netlify / use npm i AayushM0/DeployIt-CLI to downlaod ");
//   console.log(readme)

  
// }

// callAI()

module.exports = {
  generateCommitMessageWithTogether,
  generateReadMe
};