"use client";

import React, { useState } from 'react';
import axios from 'axios';

type PromptHistoryItem = {
  role: string;
  content: string;
};

const FortuneGenerator: React.FC = () => {
  const [optionOne, setOptionOne] = useState('Generate a fortune pair first!');
  const [optionTwo, setOptionTwo] = useState('Generate a fortune pair first!');
  const [selectedOption, setSelectedOption] = useState('first');
  const [promptHistory, setPromptHistory] = useState<PromptHistoryItem[]>([]);
  const [loading, setLoading] = useState(false);

  const handleGenerateFortunes = async () => {
    setLoading(true);
    try {
      let promptHistoryValue: PromptHistoryItem[] = promptHistory;
      if (optionOne !== 'Generate a fortune pair first!') {
        promptHistoryValue.push({
          role: 'user',
          content: `Out of your two options, I think the ${selectedOption} option you gave was more useful.`,
        });
      }

      promptHistoryValue.push({
        role: 'user',
        content: `Generate another fortune cookie message for me.`,
      });

      setPromptHistory(promptHistoryValue);

      console.log(promptHistoryValue);

      const response = await axios.post('/api/get-fortune', { "promptHistory": promptHistoryValue });
      const { choices } = response.data;

      const [fortune1, fortune2] = choices;
      setOptionOne(fortune1);
      setOptionTwo(fortune2);
      setSelectedOption('');

      const updatedPromptHistory: PromptHistoryItem[] = [
        ...promptHistory,
        {
          role: 'assistant',
          content: fortune1,
        },
        {
          role: 'assistant',
          content: fortune2,
        },
      ];
      setPromptHistory(updatedPromptHistory);
      setLoading(false);
    } catch (error) {
      console.error('Error generating fortunes:', error);
      setLoading(false);
      // Handle the error, e.g., display an error message to the user
    }
  };

  const handleClearHistory = () => {
    setPromptHistory([]);
    setOptionOne('Generate a fortune pair first!');
    setOptionTwo('Generate a fortune pair first!');
  };

  const handleExportHistory = () => {
    try {
      const json = JSON.stringify(promptHistory);
      const blob = new Blob([json], { type: 'application/json' });

      // Create a temporary anchor element
      const anchorElement = document.createElement('a');
      anchorElement.href = URL.createObjectURL(blob);
      anchorElement.download = 'prompt_history.json';

      // Programmatically trigger the download
      anchorElement.click();

      // Clean up the temporary anchor element
      URL.revokeObjectURL(anchorElement.href);
      anchorElement.remove();
    } catch (error) {
      console.error('Error exporting prompt history:', error);
      // Handle the error, e.g., display an error message to the user
    }
  };

  const handleLoadHistory = async (event: React.ChangeEvent<HTMLInputElement>) => {
    try {
      const file = event.target.files?.[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = (event) => {
        const fileContent = event.target?.result as string;
        if (fileContent) {
          const parsedPromptHistory = JSON.parse(fileContent);
          console.log(parsedPromptHistory);
          const len = parsedPromptHistory.length;

          if (len > 1 && parsedPromptHistory[len - 1]["role"] == "assistant" &&
            parsedPromptHistory[len - 2]["role"] == "assistant") {
            setOptionOne(parsedPromptHistory[len - 2]["content"]);
            setOptionTwo(parsedPromptHistory[len - 1]["content"]);
          }

          // Update the prompt history state variable
          setPromptHistory(parsedPromptHistory);
        }
      };
      reader.readAsText(file);
    } catch (error) {
      console.error('Error loading prompt history:', error);
      // TODO: Handle the error, e.g., display an error message to the user
    }
  };

  const handleOptionChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selected = event.target.value;
    setSelectedOption(selected);
  };

  return (
    <div>
      <h1>AI Fortune Cookie Generator</h1>
      <p>Have a large language model learn from you to generate high-quality fortunes tuned to your interest. All you have to do is keep clicking &quot;Generate Fortunes&quot; and selecting which of the two generated options you like better. If you want to save results from a session, &quot;Export&quot; will export a text file with your current preferences. You can also load previous fortune generation sessions with the &quot;Load&quot; button.</p>

      <div className="btn-container">
        <button onClick={handleGenerateFortunes} disabled={loading} className="btn btn-generate">{loading ? "Generating..." : "Generate Fortunes"}</button>
        <button onClick={handleClearHistory} className="btn btn-generate">Clear</button>
        <button onClick={handleExportHistory} className="btn btn-export">Export</button>
        <span className="btn btn-load">Load history:
          <input type="file" onChange={handleLoadHistory} accept=".json" />
        </span>
      </div>

      <div className="comparison-pane">
        {/* Display the generated fortune cookie texts for comparison */}
        <fieldset>
          <legend>Fortune Options:</legend>
          <div>
            <input
              type="radio"
              id="optionOne"
              name="fortuneOptions"
              value="first"
              checked={selectedOption === 'first'}
              onChange={handleOptionChange}
            />
            <label htmlFor="optionOne">{optionOne}</label>
          </div>

          <div>
            <input
              type="radio"
              id="optionTwo"
              name="fortuneOptions"
              value="second"
              checked={selectedOption === 'second'}
              onChange={handleOptionChange}
            />
            <label htmlFor="optionTwo">{optionTwo}</label>
          </div>
        </fieldset>
      </div>
    </div>
  );
};

export default FortuneGenerator;