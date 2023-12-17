function valuation(userinput, answers,reference) 
{
  if (userinput.length !== answers.length) 
  {
      console.log("warning ...");
      console.log("Arrays have different lengths");
      console.log('useranswers__length :',userinput.length);
      console.log('answers__length :',answers.length);
      return 0; // Or handle the situation as needed
  }

  var mark = 0;
  var min_mark = (answers.length-2);
  for (let i = 0; i < answers.length; i++) 
  {
      if (userinput[i] === answers[i]) {
          mark++;
      } else {
          console.log('Wrong: User input:', userinput[i], 'Expected answer:', answers[i]);
      }
  }
  console.log("Corrected count:", mark);
  console.log('min mark required :',min_mark);
  if(mark<min_mark)
  {
    console.log('failed in the',reference);
    return reference;
  }
  else
  {
    console.log('he is passed');
    return null;
  }
}

module.exports = { valuation };
