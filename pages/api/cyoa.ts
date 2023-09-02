import { NextApiRequest, NextApiResponse } from 'next';
import axios from 'axios';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const openaiApiKey = process.env['OPENAI_API_KEY'];
    const systemPrompt = [{
      "role": "system", "content": "You are a comic book villain talking to a hero who is trapped in your evil lair. Your objective is to output "
        + "be a dastardly, complex villain, based on user preferences indicated by their chat history (they will choose one out of two best messages at every turn). You should slowly reveal a vast, evil master plan and a tragic backstory. Additionally, describe new aspects of the environment regularly in your messages. When the user prompts you with their message, you should respond with a single message. Note that user prompts prefixed with 'Action:' will be actions they are performing, not speech. Do not output any "
        + "other surrounding text. Your output should be in the format \"[what the villain says]\"."
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
        max_tokens: 200,
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
    res.status(500).json({ error: 'Failed to generate villain speech.' });
  }
}