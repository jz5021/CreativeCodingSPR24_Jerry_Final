//Jerry Zhao_Final Project

let shop;
let eyeArray = [];

/*function preload(){
    shop = loadImage('');
    eye = loadImage('');
}*/

function setup(){
    createCanvas(1920,1080);

    shop = new shopButton(0, 0, 400, 200);
}

function draw(){
    background(0);
    shop.display();
    shop.update();
}

class shopButton{
    constructor(xPos, yPos, width, height){
        this.x = xPos;
        this.y = yPos;
        this.w = width;
        this.h = height;
        this.mouseOver = false; //tracks whether or not the mouse is within the bounds of the box
    }

    display(){
        rectMode(CENTER);
        
        if(this.mouseOver){
            fill(150);
        } else {
            fill(255);
        }
        
        push();
        translate(width/2, height/2);
        rect(this.x, this.y, this.w, this.h);
        pop();
    }

    update(){
        push();
        translate(width/2, height/2);
        if (mouseX > -this.w / 2 && mouseX < this.w / 2 &&
            mouseY > -this.h / 2 && mouseY < this.h / 2){
            this.mouseOver = true;
        } else {
            this.mouseOver = false;
        }
        pop();
    }

}