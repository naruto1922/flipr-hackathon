const Express = require("express");
const BodyParser = require("body-parser");
const MongoClient = require("mongodb").MongoClient;
const ObjectId = require("mongodb").ObjectID;
const CONNECTION_URL =
  "mongodb+srv://naruto1922:Vinay123@cluster0.tnpjvpd.mongodb.net/?retryWrites=true&w=majority";
const DATABASE_NAME = "FliprHackathon";
var app = Express();

app.use(BodyParser.json());
app.use(BodyParser.urlencoded({ extended: true }));
app.use(Express.static("public"));
app.set("view engine", "ejs");
app.engine('ejs',require('ejs').renderFile);

var database;
let current = "Home";
let comp = "Select Company Name";
let ind = "Select Stock Market Index";

app.get("/", function (req, res) {
  res.render("login");
});

app.post("/", function (req, res) {
  res.render("stocks", { current: current, comp:comp, ind:ind });
});

var labelss = [];
var dataa = [];


const PORT = process.env.PORT || 3000;

const fs = require("fs");
const { ChartJSNodeCanvas } = require("chartjs-node-canvas");

const width = 400; //px
const height = 400; //px
const backgroundColour = "white"; // Uses https://www.w3schools.com/tags/canvas_fillstyle.asp
const chartJSNodeCanvas = new ChartJSNodeCanvas({
  width,
  height,
  backgroundColour,
});

const configuration = {
  type: "line", // for line chart
  data: {
    labels: labelss,
    datasets: [
      {
        label:" plot",
        data: dataa,
        fill: false,
        borderColor: ["rgb(51, 204, 204)"],
        // borderWidth: 1,
        xAxisID: "xAxis1", //define top or bottom axis ,modifies on scale
        pointStyle:false,
        pointRadius:0
      }
    ],
  },
  options: {
    scales: {
      y: {
        suggestedMin: 0,
      },
    },
  },
};

async function run() {
  const dataUrl = await chartJSNodeCanvas.renderToDataURL(configuration);
  const base64Image = dataUrl;

  var base64Data = base64Image.replace(/^data:image\/png;base64,/, "");

  fs.writeFile("public/images/chart.png", base64Data, "base64", function (err) {
    if (err) {
      console.log(err);
    }
  });
  return dataUrl;
}




app.get("/:something", (request, response) => {
    labelss.length=0;
    dataa.length=0;
   var curr=request.params.something;
    console.log(curr);
    current=curr;

    if(curr=="BSE" || curr=="NSE") 
    {
      comp="Select Company Name";
      ind=curr;
    }

    else
    {
      ind="Select Index Name";
      comp=curr;
    }

    
    collection = database.collection(curr);
   

  collection.find({}).toArray((error, result) => {
    if (error) {
      return response.status(500).send(error);
    }
 

  var month = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
  var idx=0;

    for (var i = 0; i < result.length; ++i) {

      var avg = Number(result[i].Low) + Number(result[i].High);
      avg /= 2;
      if((i%30)===0)
      labelss.push(month[idx++]);
      else labelss.push(" ");

      if(idx==12) idx=0;
      dataa.push(avg);

    }

 
     run();

    response.render("stocks",{current:current, comp:comp, ind:ind});
  
  });
});




app.listen(PORT, () => {
  MongoClient.connect(
    CONNECTION_URL,
    { useNewUrlParser: true },
    (error, client) => {
      if (error) {
        throw error;
      }

      database = client.db(DATABASE_NAME);
      console.log("Connected to `" + DATABASE_NAME + "`!");
    }
  );
});
