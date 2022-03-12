const express = require('express');
const request = require('request');

const IPAddr = 'localhost';
const IPPort = '8000';

const app = express();

app.use(function(req, res, next){
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Contentt-Type, Accept");
  next();
});

app.get('/', function(req, res){
  res.send('Hello!');
});

app.listen(IPPort);
console.log('listening...');
