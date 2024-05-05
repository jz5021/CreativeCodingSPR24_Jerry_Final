//Jerry Zhao_Final Project


//General Variables
let state = 1;

//Button Variables
let buttonClick = 0;
let buttonClickTemp;
let buttonLeft;
let buttonRight;
let buttonTop;
let buttonBottom;


//Eye Variables
let eyeArray = [];
let attempts;
let maxAttempts;

/*function preload(){
    shop = loadImage('');
    eye = loadImage('');
}*/

function setup(){
    createCanvas(1920,1080);
    shop = new ShopButton(width/2, height/2, 400, 200);
    buttonLeft = shop.x - (shop.w/2+25);
    buttonRight = shop.x + (shop.w/2 +25);
    buttonTop = shop.y - (shop.h/2 + 25);
    buttonBottom = shop.y + (shop.h/2 +25);

    attempts = 0;
    maxAttempts = 1000;
}

function draw(){
    background(0);
    
    //Shop Button
    buttonClickTemp = buttonClick;
    shop.display();
    shop.update();
    buttonClick = shop.getButtonClick(); //Consistently updates the amount of times the shop button has been pressed
    stateUpdate(); //State update is based on the functionality of the button

    //Addition of new eyes
    if(buttonClickTemp < buttonClick){
        state += 1;

        for(let i = 0; i <= buttonClick * 2; i ++){
            while(attempts < maxAttempts){
                let w = random(width);
                let h = random(height);
                let eyeR = random(25,100);
                let pupilR = random(5, 24);

            //Validation of whether or not the eye is too close to the center of the button or not
                if(!(w > buttonLeft && w < buttonRight && h > buttonTop && h < buttonBottom)) {
                    eyeArray.push(new Eye(w, h, eyeR, pupilR));
                    attempts = 0;
                    break;
                }
                attempts += 1;
            }
        }
    }
    
    for(let eye of eyeArray){
            eye.display();
            eye.lookAtCenter();
    }

    print(state);
}

class ShopButton{
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

class Eye {
    constructor(x, y, eyeRadius, pupilRadius) {
      this.eye = createVector(x, y);
      this.pupil = createVector(x, y);
      this.eyeRadius = eyeRadius;
      this.pupilRadius = pupilRadius;
      this.transitionSpeed = 0.02; // Adjust transition speed as needed
    }
  
    lookAtCenter(){
        let angle = atan2(height / 2 - this.eye.y, width / 2 - this.eye.x); // Calculate angle to the center of the screen
        let maxDistance = this.eyeRadius - this.pupilRadius; // Limit the maximum allowable distance that the pupil can move
        let distance = min(dist(this.eye.x, this.eye.y, width / 2, height / 2), maxDistance); // Calculate distance from the eye to the center of the screen
        
        // Calculate position of pupil based on adjusted distance and angle
        this.pupil.x = this.eye.x + cos(angle) * distance;
        this.pupil.y = this.eye.y + sin(angle) * distance;
    }

    lookAtMouse(x, y){
        angle = atan2(y - this.eye.y, x - this.eye.x); //This calculates the angle between the center of the eye and mouse cursor's position
        maxDistance = this.eyeRadius - this.pupilRadius; // This finds the total amount of distance that the pupil can actually move
        distance = dist(this.eye.x, this.eye.y, x, y); // This calculates the distance between eye center and mouse cursor 
        distance = min(distance, maxDistance); // limits the maximum allowable distance that the pupil can move  
        
        // This calculates the position of pupil based on adjusted distance and angle and will always be run no matter what state is going on
        this.pupil.x = this.eye.x + cos(angle) * distance;
        this.pupil.y = this.eye.y + sin(angle) * distance;
        
    }

    lookAtUser(x, y){
        angle = atan2(this.eye.y - this.pupil.y, this.eye.x - this.pupil.x); // Angle towards eye center
        distance = dist(this.pupil.x, this.pupil.y, this.eye.x, this.eye.y);
        if (distance > 1) {
            this.pupil.x += cos(angle) * this.transitionSpeed * distance;
            this.pupil.y += sin(angle) * this.transitionSpeed * distance;
        }
    }

    display() {
        //Eye
        fill(255);
        beginShape();
        for (let i = 0; i < TWO_PI; i += PI / 360) {
            let x = this.eye.x + cos(i) * this.eyeRadius;
            let y = this.eye.y + sin(i) * this.eyeRadius;
            vertex(x, y);
        }
        endShape(CLOSE);
  
        //Pupil
        fill(0);
        ellipse(this.pupil.x, this.pupil.y, this.pupilRadius * 2, this.pupilRadius * 2);
    }
  }

function stateUpdate(){
    if (buttonClick % 3 == 0){
    state += 1;
    }
}