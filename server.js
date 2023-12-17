const express = require('express');
const bodyParser = require('body-parser');
const bcrypt = require('bcrypt'); // For password hashing
const { generateMcqJson } = require('./API');
const { valuation } = require('./validation');
const { MongoClient} = require('mongodb');
const app = express();

app.use(bodyParser.json(),bodyParser.text({ type: 'text/plain' }));

const url = 'mongodb+srv://artfolio04:ND0twJN9ysZnsgrK@cluster0.nbaed0s.mongodb.net';
const dbName = 'Halopot';



const reference = 'condition_reference';
const syllabus = [
  'IF-Else statement','Else-if statement','nested if','Terneray operator','switch statement','Break keyword','default keyword'
];



const client = new MongoClient(url, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
});
    
client.connect().then(()=>console.log('connected to mongodb atlas')).catch((error)=>console.log('ERROR :'+error));


class UserController {
    constructor(client, dbName) {
      this.client = client;
      this.dbName = dbName;
    }
  
    async login(req, res) {
      const username = req.body.username;
      const password = req.body.password;
  
      try {
        const db = this.client.db(this.dbName);
        const usersCollection = db.collection('users');
        console.log('username :',username);
        console.log('password :',password);
        const user = await usersCollection.findOne({ 'username': username});
  
        if (!user) {
          console.log('User not found');
          return res.status(404).json({ error: 'User not found' });
        } else {
          if(user['password'] === password){
            console.log('Result: ' + user['idvalue']);
            res.status(200).send(user['idvalue']);
          }
          else
          {
            console.log('wrong password');
          }
        }
      } catch (e) {
        console.log('Error: ' + e);
        res.status(400).send('Invalid username or password');
      }
    }
}

app.post('/login', async function (req, res) {
const userController = new UserController(client, dbName);
userController.login(req, res);
});

class UserRegistration {
  constructor(client, dbName) {
    this.client = client;
    this.dbName = dbName;
  }

  async registerUser(req, res) {
    const Firstname = req.body.Firstname;
    //console.log(req.body.Firstname);
    const LastName = req.body.lastname;
    const username = req.body.username;
    const password = req.body.password;
    const Email = req.body.Email;
    //console.log('from client :',req.body);
    try {
      const db = this.client.db(this.dbName);
      const usersCollection = db.collection('users');
       const user = {
        Firstname,
        LastName,
        username,
        password,
        Email,
        userpath :[],
      };

      console.log(user);

      const result = await usersCollection.insertOne(user);

      console.log(`Document inserted with ID: ${result.insertedId}`);
      const id = result.insertedId.toString();
      console.log('id :',id)
    // Update the user in the collection with the new 'id' value
      await usersCollection.updateOne({ _id: result.insertedId }, { $set: { idvalue: id } });
      res.status(200).send(id);
    } catch (error) {
      console.error('Error:', error);
      res.status(500).send('Internal Server Error');
    }
  }
}

app.post('/register', async function (req, res) {
  const userRegistration = new UserRegistration(client, dbName);
  userRegistration.registerUser(req, res);
});






class QuestionGenerationHandler {
  constructor(client, dbName) {
    this.client = client;
    this.dbName = dbName;
    this.questions = [];
    this.answers = [];
    //this.fetch();
    this.collectionarray = [];
    this.userinput = []; // Initialize the userinput array
  }
  async fetch(){
    //get questions and answers from the database;
    //initialize the answers,questions with database ;
    try
    {
      //fetch questions and answers from DB;
      const db = client.db('c-questions');
      // const collections = await db.listCollections().toArray();
      // for(var i=0;i<collections.length;i++)
      // {
      //   this.collectionarray.push(collections[i]['name']);
      // }
      // console.log(this.collectionarray);
      const collection = db.collection('condition_reference');
      const documents = await collection.find({},{_id:1}).toArray();
      // console.log(documents.length);
      var data = {};
      for(var i=0;i<5;i++)
      {
        data = {
          "question":documents[i]['question'],
          "choices":documents[i]['choices'],
        };
        this.questions.push(data);
        this.answers.push(documents[i]['answer']);
      }
      // console.log('questions :',this.questions);
      // console.log('answers :',this.answers);
      //add the crct answers into the user_profile with the reference of {idvalue};
    }
    catch (e)
    {
      console.log('error :',e);
    }
  }
  async getQuestion(req, res,) {
    // const questioncount;
    // find questioncount length;
    this.fetch();

    await this.waitForQuestions();
    if(this.questions.length === 0 )
    {
      console.log('questions is empty');
    }
    else
    {
      //console.log(this.questions);
      res.status(200).json({list1 :this.questions});
    }
  }

  async waitForQuestions() {
    console.log('wait for 2 second...');
    return new Promise(resolve => setTimeout(resolve, 2000)); // 1000 milliseconds (1 second) delay
  }


  async validateInput(req, res) 
  {
    const doc_id = req.header('user_id');
    console.log('user :',doc_id);
    const current_qn = req.header('current_qn');
    console.log('qn_no :',current_qn);
    const clientdata = req.body;
    const dataArray = clientdata.split('\n');
    for (const item of dataArray) {
      //console.log('items:', item);
      this.userinput.push(item); // Update the userinput array
    }
    //fetch the answers from the database with the reference of {idvalue};
    //const x1 = valuation(this.userinput,this.answers,reference);
    //write the function here to perform the valuation;
    console.log("user resposnse :",this.userinput);
    console.log('answers length :',this.answers.length);
    // var min_mark = (this.answers.length-3);
    // var mark = 0;
    // for(i=0;i<this.answers.length;i++)
    // {
    //   if(this.userinput[i] === this.answers[i])
    //   {
    //     mark++;
    //   }
    // }
    // if(mark<min_mark)
    // {
    //   console.log('needs to improve...');
    // }
  }
  

  generateMCQ(req, res) {
      generateMcqJson(syllabus, reference,this.client)
        .then(result => {
          if (result) {
            // console.log(result.q);
            // console.log(result.a);
            res.status(200).json(result.q);
          } else {
            console.error("Failed to generate MCQ JSON.");
          }
        })
        .catch(error => {
          console.error("An error occurred:", error);
        },);
  }
  
}

app.post('/QUESTION_GENERATION', async function (req, res) 
{
  console.log('req found on ip :',req.ip);
  const questionGenerationHandler = new QuestionGenerationHandler(client,dbName);
  const action = req.query.action;
  if (action === 'getquestion') {
    questionGenerationHandler.getQuestion(req, res,);
  } 
  else if(action ==='validation') 
  {
    console.log(
      'request found on validation'
    );
    questionGenerationHandler.validateInput(req, res);
  }
  else if (action === 'generate')
  {
    console.log("request get on generate portal");
    questionGenerationHandler.generateMCQ(req, res);
  }
  else
  {
    console.log("no options on here");
  }
});

app.listen(7000, () => {
  console.log('Server started on port 7000');
});
