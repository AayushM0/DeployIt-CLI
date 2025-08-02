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

async function generateReadMe(link) {
  
  const repoUrl = link;
  const repoName = repoUrl.split("/").slice(-2).join("/"); 


  const githubResponse = await axios.get(`https://api.github.com/repos/${repoName}`);
  const { description, language, topics } = githubResponse.data;

const prompt = `
Create a README.md for ${repoName}:
- Description: ${description || "A GitHub repository"}
- Language: ${language || "Not specified"}
- Key Topics: ${topics?.join(", ") || "None"}
`;

  const response = await axios.post(
    "https://openrouter.ai/api/v1/chat/completions",
    {
      model: "openai/gpt-3.5-turbo",
      messages: [
        {
  role: "user",
  content: "Create a read me: " + prompt
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
  return response.data.choices[0].message.content.trim();
}


module.exports = {
  generateCommitMessageWithTogether,
  generateReadMe
};