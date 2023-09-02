import { NextApiRequest, NextApiResponse } from 'next';
import axios from 'axios';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const openaiApiKey = process.env['OPENAI_API_KEY'];
    const systemPrompt = [{
      "role": "system", "content": "You are a fortune cookie aphorism search engine. Your goal is to output messages the user is "
        + "likely to like, based on the their preference history. Your output should be as diverse as possible: never output the "
        + "same option twice. When the user prompts you, you should output a single fortune cookie message. Do not output any "
        + "other surrounding text. Your output should be in the format \"[fortune message]\"."
    }];
    const userPrompts = req.body.promptHistory;

    if (!openaiApiKey) {
      throw new Error('OpenAI API key is missing.');
    }

    console.log(systemPrompt.concat(userPrompts));

    const response = await axios.post(
      'https://api.openai.com/v1/chat/completions',
      {
        model: "gpt-3.5-turbo-16k",
        messages: systemPrompt.concat(userPrompts),
        max_tokens: 100,
        n: 2,
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${openaiApiKey}`,
        },
      }
    );

    console.log(response.data.choices[0].message.content);

    const choices: string[] = [response.data.choices[0].message.content.trim(), response.data.choices[1].message.content.trim()];

    res.status(200).json({ choices });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to generate fortunes' });
  }
}