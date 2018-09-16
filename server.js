const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const PythonShell = require('python-shell');
const request = require('request');
const app = express();
const spawn = require('child_process').spawn;

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));
app.use(cors());

app.get('/',cors(),(req,res)=>{
    res.status(200).json('api running');
})


//var token;
//get image and token and send to python
app.post('/spotify',cors(),(req,res)=>{
    var image = req.body.image;
    //  var facing = req.body.facing;
    var token = req.body.token;
    // var key = 'happy';
     var token = 'BQCbNTH_VyLT7z0qaSBU2vftJsUBWHkVfY4C3_TTl5LnQ9QoIhE8-KsLItmEhM2gUm1GaIr_rzE6Rk7ZF3QPp1r6ul9ZpMoNEagzNCcIVgOddUWMxoqAyX9IQtrTgIrMubdc0RmLRNSZaYvQ'

    // var options = {
    //     mode: 'text',
    //     pythonPath: 'path',
    //     pythonOptions: [],
    //     scriptPath: '../Front-Camera/src',
    //     args: [image]
    // };
    // PythonShell.run('azure.py',options, (err,data)=>{
    //     if(err){
    //         res.status(500).json('An error has occured. ' + err);
    //         return
    //     }
    //     key = data.toString();
    // });

    
   const ls = spawn('python', ['./Front-Camera/src/azure.py', image]);

   ls.stdout.on('data', (data) => {
        var key = data.toString();
        var spotifyOptions = {
            url: `https://api.spotify.com/v1/search/?q=${key}&type=playlist`,
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
                'Authorization': `Bearer   ${token}`
            }
        };
        request.get(spotifyOptions,(err,res2,body)=>{
            if(err){
                res.status(500).json(`An error has occured: ${err}`);
                return;
            }
            let playlists = {
                'key':key,
                body: JSON.parse(body)
            };
            res.status(200).send(playlists);
        });
    });
    
    ls.stderr.on('data', (data) => {
        res.status(500).json(`An error has occured: ${data}`)
    });
    
    ls.on('close', (code) => {
        console.log(`child process exited with code ${code}`);
    });
   
})



const port = process.env.PORT || 4099;
console.log(`listening on port: ${port}`);
app.listen(port);