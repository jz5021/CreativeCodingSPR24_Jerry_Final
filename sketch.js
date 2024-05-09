//Jerry Zhao_Final Project
//This runs far slower on OpenProcessing rather than locally, so I would download this from my github @jz5021
//Inspiration and resources all camee from Shiffman's code surrounding videos and manipulation of these pixels

//General Variables
let state = 0   ;

//Button Variables
let buttonClick = 0;
let buttonClickTemp;
let buttonLeft;
let buttonRight;
let buttonTop;
let buttonBottom;

//Screen
let video;

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
    pixelDensity(1); //still trying to figure out what the point of doing this is; there's a possibility that this is what's causing an issue with the spotlight because I didn't state this and other computeres may have a highter base pixel density?

    //Video Capture
    video = createCapture(VIDEO); //starts video capture
    video.size(320,240);
    video.hide(); //hides the video capture that can be revealed with capture.show();

    //Button
    shop = new ShopButton(width/2, height/2, 320, 240);
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

    //Webcam Access
    if (buttonClick >= 12){
        portraitFormation();
        //Video Creation
        // imageMode(CENTER);
        // image(video, width/2, height/2)
    }

    //New eyes generated based on new button presses and eyes are stopped from generating after 12 clicks
    if(buttonClickTemp < buttonClick){
        if(buttonClick < 12){
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
    }

    //Eye Generation
        for(let eye of eyeArray){
            if (buttonClick <= 3){    
                eye.lookAtCenter();
                eye.display();
            } else if (buttonClick <= 6){
                eye.lookAtMouse(mouseX, mouseY);
                eye.display();
            } else if (buttonClick > 6){ //change this to <= 9 when the time comes, but for now leave it at >6
                eye.lookAtUser();
                eye.display();
            }
        }

    //drawVignette(width / 2, height / 2, 800); // Adjust the parameters as needed
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
      this.transitionSpeed = .07 //this is how fast the movement of the pupil is, this seems to be a sweet spot
      this.isLookingAtUser = false;
      
    }
  
    lookAtCenter(){
        let angle = atan2(height / 2 - this.eye.y, width / 2 - this.eye.x); // Calculate angle to the center of the screen
        let maxDistance = this.eyeRadius - this.pupilRadius; // Limit the maximum allowable distance that the pupil can move
        let distance = min(dist(this.eye.x, this.eye.y, width / 2, height / 2), maxDistance); // Calculate distance from the eye to the center of the screen
        
        // this calculates the adjusted angle per pupil to look towards teh center
        this.pupil.x = this.eye.x + cos(angle) * distance;
        this.pupil.y = this.eye.y + sin(angle) * distance;
    }

    lookAtMouse(x, y){
        let angle = atan2(y - this.eye.y, x - this.eye.x); //This calculates the angle between the center of the eye and mouse cursor's position
        let maxDistance = this.eyeRadius - this.pupilRadius; // This finds the total amount of distance that the pupil can actually move
        let distance = dist(this.eye.x, this.eye.y, x, y); // This calculates the distance between eye center and mouse cursor 
        distance = min(distance, maxDistance); // limits the maximum allowable distance that the pupil can move  
        
        // This calculates the position of pupil based on adjusted distance and angle and will always be run no matter what state is going on
        this.pupil.x = this.eye.x + cos(angle) * distance;
        this.pupil.y = this.eye.y + sin(angle) * distance;
        
    }

    lookAtUser(){
        this.isLookingAtUser = true;

        // calculates the angle towards the eye center
        let angle = atan2(this.eye.y - this.pupil.y, this.eye.x - this.pupil.x);
        // calculates the distance between the pupil and the eye center to prep for the movement of the pupil
        let distance = dist(this.pupil.x, this.pupil.y, this.eye.x, this.eye.y);

        // the total amount of shaking that the pupil undergoes
        let maxVibration = random(0,2); // Adjust as needed

        // uses the the +/- vibration bounds in order to make the pupil kind of shake menacingly
        this.pupil.x += cos(angle) * this.transitionSpeed * distance + random(-maxVibration, maxVibration);
        this.pupil.y += sin(angle) * this.transitionSpeed * distance + random(-maxVibration, maxVibration);

        // Ensure the pupil stays within the eye bounds
        this.pupil.x = constrain(this.pupil.x, this.eye.x - this.eyeRadius + this.pupilRadius, this.eye.x + this.eyeRadius - this.pupilRadius);
        this.pupil.y = constrain(this.pupil.y, this.eye.y - this.eyeRadius + this.pupilRadius, this.eye.y + this.eyeRadius - this.pupilRadius);
    }

    display() {
        //Eye
        //Define the two colors for lerpColor gradient
        let outerColor = color(255, 255, 255, 100);
        let innerColor = color(255, 255, 255, 0);

    for (let r = this.eyeRadius + 20; r >= this.eyeRadius; r--) {
        let gradientColor = lerpColor(outerColor, innerColor, map(r, this.eyeRadius, this.eyeRadius + 20, 0, 1)); //map the transition between color to the total radius around the eye
        stroke(gradientColor);
        strokeWeight(1); // stroke weight for just how large to make something look
        noFill();
        ellipse(this.eye.x, this.eye.y, r * 2, r * 2);
    }

        //Normal Eye
        if (this.isLookingAtUser == false){
            
            //Eye
            fill(0);
            beginShape();
            for (let i = 0; i < TWO_PI; i += PI / 360) {
                let x = this.eye.x + cos(i) * this.eyeRadius;
                let y = this.eye.y + sin(i) * this.eyeRadius;
                vertex(x, y);
            }
            endShape(CLOSE);

            //Pupil
            noStroke();
            fill(255);
            ellipse(this.pupil.x, this.pupil.y, this.pupilRadius* .5, this.pupilRadius * 2.5);
        } 
        
        //Erratic Eye
        else if (this.isLookingAtUser == true){
            fill(0);
            beginShape();
            for (let i = 0; i < TWO_PI; i += PI / 360) {
                let x = this.eye.x + cos(i) * this.eyeRadius;
                let y = this.eye.y + sin(i) * this.eyeRadius;
                vertex(x, y);
            }
            endShape(CLOSE);
            
            //Pupil
            noStroke();
            fill(255);
            push();
            translate(this.pupil.x, this.pupil.y);
            scale(random(.5, 1), random(1, 1.5));
            ellipse(0, 0, this.pupilRadius* .5, this.pupilRadius * 2.5);
            pop();
        }
        }
  }

function drawVignette(centerX, centerY, radius) {
    loadPixels();

    //Iterates through all the pixels on the screen and figures out just how to draw the vignette depending on screen size
    for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
            let dx = x - centerX;
            let dy = y - centerY;

            //Pythagorean theorem for distance calculations including diagonals
            let distanceSq = dx * dx + dy * dy;
            let distance = sqrt(distanceSq);

            // this maps the distance of the pixel to the darkness level it should have depending on distane from center, also some massaging of data values to get values I want
            let darkness = map(distance, 0, radius * (.2 + (buttonClick * .075)), 255, 0); 
            let pixelIndex = (x + y * width) * 4;

            //Color channel adjustment for colors
            pixels[pixelIndex] += darkness; // Red Channel
            pixels[pixelIndex + 2] += darkness; // Green Channel
            pixels[pixelIndex + 1] += darkness; // Blue Channel
        }
    }
    updatePixels();
}

function drawVignetteSquare(xPos, yPos){
      let centerX = width / 2;
  let centerY = height / 2;
  let radius = 150;
  
  // Define gradient colors
  let colorStart = color(255, 0, 0); // Red
  let colorEnd = color(0, 0, 255);   // Blue
  
  // Draw circle with gradient
  noStroke();
  beginShape(TRIANGLE_FAN);
  vertex(centerX, centerY); // Center vertex
  
  for (let angle = 0; angle <= TWO_PI; angle += 0.1) {
    // Calculate position on circle
    let x = centerX + cos(angle) * radius;
    let y = centerY + sin(angle) * radius;
    
    // Calculate color based on gradient
    let inter = map(angle, 0, TWO_PI, 0, 1);
    let c = lerpColor(colorStart, colorEnd, inter);
    fill(c);
    
    // Draw vertex
    vertex(x, y);
  }
  
  endShape();   
}

function portraitFormation(){
    video.loadPixels();
    let tempImage = createImage(video.width, video.height);
    tempImage.copy(video, width/2 - video.width/2, height/2 - video.height/2, video.width, video.height, width/2 - video.width/2, height/2 - video.height/2, video.width, video.height);
    tempImage.updatePixels();
}