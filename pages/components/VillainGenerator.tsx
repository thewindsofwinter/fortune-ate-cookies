"use client";

import React, { useState } from 'react';
import axios from 'axios';

type PromptHistoryItem = {
  role: string;
  content: string;
};

const FortuneGenerator: React.FC = () => {
  const [optionOne, setOptionOne] = useState('Generate dialogue first!');
  const [optionTwo, setOptionTwo] = useState('Generate dialogue first!');
  const [selectedOption, setSelectedOption] = useState('first');
  const [heroText, setHeroText] = useState('');
  const [promptHistory, setPromptHistory] = useState<PromptHistoryItem[]>([]);
  const [loading, setLoading] = useState(false);

  const handleGenerateVillain = async () => {
    setLoading(true);
    try {
      let promptHistoryValue: PromptHistoryItem[] = promptHistory;
      if (optionOne !== 'Generate dialogue first!') {
        promptHistoryValue.push({
          role: 'user',
          content: `Out of your two options, I choose ${selectedOption} as what the villain actually said.`,
        });
      }

      promptHistoryValue.push({
        role: 'user',
        content: `The hero says: ` + heroText,
      });

      setPromptHistory(promptHistoryValue);

      console.log(promptHistoryValue);

      const response = await axios.post('/api/cyoa', { "promptHistory": promptHistoryValue });
      const { choices } = response.data;

      const [dialogue1, dialogue2] = choices;
      setOptionOne(dialogue1);
      setOptionTwo(dialogue2);
      setSelectedOption('');
      setHeroText('');

      const updatedPromptHistory: PromptHistoryItem[] = [
        ...promptHistory,
        {
          role: 'assistant',
          content: dialogue1,
        },
        {
          role: 'assistant',
          content: dialogue2,
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
    setHeroText('');
    setOptionOne('Generate dialogue first!');
    setOptionTwo('Generate dialogue first!');
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
      <h1>AI Villain Generator</h1>
      <p>Have a large language model generate the comic book villain of your dreams (or nightmares). All you need to do is to roleplay a hero trapped in their evil lair while the villain monologues at you. Prefix your input with &quot;Action: &quot; if you want to do something instead of just monologuing at the villain. Enter in your preferences in the input box and repeatedly click &quot;What does the villain say next?&quot; After you do so, selecting which of the two generated villain dialogue options you like better. If you want to save results from a session, &quot;Export&quot; will export a text file with your current preferences. You can also load previous villain generation sessions with the &quot;Load&quot; button.</p>

      <div className="btn-container">
        <button onClick={handleGenerateVillain} className="btn btn-generate">{loading ? "Generating..." : "Generate Villain Reply"}</button>
        <button onClick={handleClearHistory} className="btn btn-generate">Clear</button>
        <button onClick={handleExportHistory} className="btn btn-export">Export</button>
        <span className="btn btn-load">Load history:
          <input type="file" onChange={handleLoadHistory} accept=".json" />
        </span>

        <div className="btn btn-load fit">Input what the hero says: <input type="text" value={heroText} onChange={(event) => { setHeroText(event.target.value); }} /></div>
      </div>

      <div className="comparison-pane">
        {/* Display the generated fortune cookie texts for comparison */}
        <fieldset>
          <legend>Villain Dialogue Options:</legend>
          <div>
            <input
              type="radio"
              id="optionOne"
              name="villainOptions"
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
              name="villainOptions"
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