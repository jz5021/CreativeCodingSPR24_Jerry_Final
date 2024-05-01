//Jerry Zhao_Final Project

let shop;
let eyeArray = [];
let buttonClickCount = 0;

/*function preload(){
    shop = loadImage('');
    eye = loadImage('');
}*/

function setup(){
    createCanvas(1920,1080);

    shop = new shopButton(width/2, height/2, 400, 200);
}

function draw(){
    background(0);
    shop.display();
    shop.update();
    buttonClick = shop.getButtonClick();
    print(buttonClick);
}

class shopButton{
    constructor(xPos, yPos, width, height){
        this.x = xPos;
        this.y = yPos;
        this.w = width;
        this.h = height;
        this.mouseOver = false; //tracks whether or not the mouse is within the bounds of the box
        this.buttonClick = false; //tracks whether the button has been clicked
        this.clicks = 0;
        this.clickStartTime;
    }

    display(){
        rectMode(CENTER);
        
        //Changes the colors of the button depending on state
        if(this.mouseOver){
            fill(150);
            if(this.buttonClick){
                this.mouseOver = !this.mouseOver;
                fill(50);
            }
        } else {
            fill(225);
        }
        
        rect(this.x, this.y, this.w, this.h); //draws rect at center of screen
    }

    update(){
        //Checks if mouse is in interior bounds of box and reads whether or not the mouse is either hovering or clicking the button
        if (mouseX > this.x - this.w/2 && mouseX < this.x + this.w/2 && mouseY > this.y - this.h/2 && mouseY < this.y + this.h/2){
            this.mouseOver = true;
            if(mouseIsPressed){
                this.clickStartTime = millis();
                this.buttonClick = true;
                this.mouseOver = false;
            }
        } else {
            this.mouseOver = false;
            this.buttonClick = false
        }

        //Tracks click count at end of button press & returns button to original state
        if(this.buttonClick && millis() - this.clickStartTime > 50){
            this.clicks += 1;
            this.buttonClick = false;
            this.mouseOver = true;
        }
    }

    getButtonClick(){
        return this.clicks;
    }
}

function mouseClicked(){

}