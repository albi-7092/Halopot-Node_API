const apiKey = "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";

async function generateMcqJson(syllabus, reference, client) {
  try {
    const prompt = `Generate multiple-choice questions in the following JSON format:
    {
      "questions": [
        {
          "question": "Sample question",
          "choices": ["Option A", "Option B", "Option C", "Option D"],
          "answer": "Correct option"
        },
      ]
    }
    Please create multiple-choice questions using the provided format, ensuring that each question includes a stem, answer choices, and the correct answer as demonstrated above. You can base these questions on the content from the ${syllabus}, including pairs of questions and answers, as specified.`;
    const responseDavinci = await fetch(
      "https://api.openai.com/v1/chat/completions",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          messages: [
            {
              role: "system",
              content: "You are a helpful assistant that generates MCQs.",
            },
            {
              role: "user",
              content: prompt,
            },
          ],
          model: "gpt-3.5-turbo", // Specify the model here
        }),
      }
    );

    const data = await responseDavinci.json();

    if (responseDavinci.status !== 200) {
      console.error(`API request failed with status ${responseDavinci.status}`);
      console.error(`API response: ${JSON.stringify(data)}`);
      return null;
    }

    if (data.choices && data.choices[0] && data.choices[0].message) {
      var content = data.choices[0].message.content;
      // console.log('response value: ' + content);
      var jsonDta = JSON.parse(content);
      // console.log('from API :',jsonDta['questions']);
      try
      {
        const db = client.db('c-questions');
        const collect = db.collection(reference);
        collect.insertMany(jsonDta['questions']);
      }catch (e)
      {
        console.log('error found');
      }
      console.log(jsonDta['questions'].length);
      var q = [];
      var newjson = {};
      var a = [];
      for (i = 0; i < jsonDta['questions'].length; i++) {
        // q.push(jsonDta['questions'][i]['question']); //question;
        // c.push(jsonDta['questions'][i]['choices']);//choices;
        // a.push(jsonDta['questions'][i]['answer']); //answer;
        newjson = {
          "question": jsonDta['questions'][i]['question'],
          "choices": jsonDta['questions'][i]['choices']
        }
        q.push(newjson);
        a.push(jsonDta['questions'][i]['answer']);
      }
      // console.log('question :',q);
      // console.log('answers :',a);
      return { content, reference, q,a};
    } else {
      console.error("API response is missing expected data.");
    }
  } catch (e) {
    console.error("Exception occurred:", e);
    return null;
  }
}

module.exports = { generateMcqJson };
