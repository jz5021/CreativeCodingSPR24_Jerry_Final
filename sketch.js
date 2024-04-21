//Jerry Zhao_Final Project

let sprite;

function preload(){
    sprite = loadImage('assets/SpriteV1.png');
}

function setup(){
    createCanvas(1000,1000);
}

function draw(){
    background(255);
    image(sprite,0,0, height,width);
}