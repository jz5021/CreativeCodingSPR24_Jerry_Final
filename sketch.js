//Jerry Zhao_Final Project
//This runs far slower on OpenProcessing rather than locally, so I would download this from my github @jz5021
//Inspiration and resources all camee from Shiffman's code surrounding videos and manipulation of these pixels
//Possibly create an instance of a video capture instead of making it a still image

//General Variables
let state = 0;

//Button Variables
let buttonClick = 0;
let buttonClickTemp;
let buttonLeft;
let buttonRight;
let buttonTop;
let buttonBottom;

//Screen
let video;
let tempImage;
let cGlow = 15; //circular glow
let interval = 600; //dictates how fast the blinking of the icon is
let action = 1; //dictates which icon shows up

//Eye Variables
let eyeArray = [];
let attempts;
let maxAttempts;

function preload() {
    shoppingCart = loadImage('assets/ShoppingCart.png');
    heart = loadImage('assets/Heart.png');
    camera = loadImage('assets/Camera.png');
}

function setup() {
    createCanvas(1920, 1080);

    //Video Capture
    video = createCapture(VIDEO); //starts video capture
    video.size(320, 240);
    video.hide(); //hides the video capture that can be revealed with capture.show();

    tempImage = createImage(320, 240);

    //Button
    shop = new ShopButton(width / 2, height / 2, 320, 240);
    buttonLeft = shop.x - (shop.w / 2 + 25);
    buttonRight = shop.x + (shop.w / 2 + 25);
    buttonTop = shop.y - (shop.h / 2 + 25);
    buttonBottom = shop.y + (shop.h / 2 + 25);
    attempts = 0;
    maxAttempts = 1000;
}

function draw() {
    background(0);

    //Shop Button
    buttonClickTemp = buttonClick;
    shop.display();
    shop.update();

    buttonClick = shop.getButtonClick(); //Consistently updates the amount of times the shop button has been pressed

    drawCircularGlow(width / 2, height / 2, 120, 50, cGlow);

    //Shop Icon & Blinking animation
    if (millis() % (2 * interval) < interval) {
        imageMode(CENTER);
        if (action == 1) {
            shoppingCart.resize(110, 100);
            image(shoppingCart, width / 2, height / 2);
        } else if (action == 2) {
            heart.resize(110, 100);
            image(heart, width / 2, height / 2);
        } else if (action == 3) {
            camera.resize(110, 100);
            image(camera, width / 2, height / 2);
        }
    }

    //Webcam Access
    if (buttonClick >= 12 && buttonClick < 20) {
        portraitFormation();
    } else if (buttonClick > 20) {
        imageMode(CENTER);
        image(video, width / 2, height / 2)
    }

    //New eyes generated based on new button presses and eyes are stopped from generating after 12 clicks
    if (buttonClickTemp < buttonClick) {
        if (buttonClick < 12) {
            for (let i = 0; i <= buttonClick * 2; i++) {
                while (attempts < maxAttempts) {
                    let w = random(width);
                    let h = random(height);
                    let eyeR = random(25, 100);
                    let pupilR = random(5, 24);

                    //Validation of whether or not the eye is too close to the center of the button or not
                    if (!(w > buttonLeft && w < buttonRight && h > buttonTop && h < buttonBottom)) {
                        eyeArray.push(new Eye(w, h, eyeR, pupilR));
                        attempts = 0;
                        break;
                    }
                    attempts += 1;
                }
            }

            cGlow = 15 + (buttonClick * 1.5);
        }
    }

    //Eye Generation
    for (let eye of eyeArray) {
        if (buttonClick <= 3) {
            eye.lookAtCenter();
            eye.display();
        } else if (buttonClick <= 6) {
            eye.lookAtMouse(mouseX, mouseY);
            eye.display();
        } else if (buttonClick > 6) { //change this to <= 9 when the time comes, but for now leave it at >6
            eye.lookAtUser();
            eye.display();
        }
    }

}

class ShopButton {
    constructor(xPos, yPos, width, height) {
        this.x = xPos;
        this.y = yPos;
        this.w = width;
        this.h = height;
        this.mouseOver = false; //tracks whether or not the mouse is within the bounds of the box
        this.buttonClick = false; //tracks whether the button has been clicked
        this.clicks = 0;
        this.clickStartTime;
    }

    display() {
        rectMode(CENTER);

        //Changes the colors of the button depending on state
        if (this.mouseOver) {
            fill(150);
            if (this.buttonClick) {
                fill(50);
            }
        } else {
            fill(225);
        }

        //Monitor
        push();
        strokeWeight(10);
        stroke(100);
        rect(this.x, this.y, this.w, this.h); //draws rect at center of screen
        pop();

        //Monitor Stand
        push();
        fill(100);
        arc(this.x, this.y + 160.5, 200, 75, PI, TWO_PI);
        pop();
    }

    update() {
        //Checks if mouse is in interior bounds of box and reads whether or not the mouse is either hovering or clicking the button
        if (mouseX > this.x - this.w / 2 && mouseX < this.x + this.w / 2 && mouseY > this.y - this.h / 2 && mouseY < this.y + this.h / 2) {
            this.mouseOver = true;
            if (mouseIsPressed) {
                this.clickStartTime = millis();
                this.buttonClick = true;
                this.mouseOver = false;
            }
        } else {
            this.mouseOver = false;
            this.buttonClick = false
        }

        //Tracks click count at end of button press & returns button to original state
        if (this.buttonClick && millis() - this.clickStartTime > 50) {
            this.clicks += 1;
            this.buttonClick = false;
            this.mouseOver = true;
        }
    }

    getButtonClick() {
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

    lookAtCenter() {
        let angle = atan2(height / 2 - this.eye.y, width / 2 - this.eye.x); // Calculate angle to the center of the screen
        let maxDistance = this.eyeRadius - this.pupilRadius; // Limit the maximum allowable distance that the pupil can move
        let distance = min(dist(this.eye.x, this.eye.y, width / 2, height / 2), maxDistance); // Calculate distance from the eye to the center of the screen

        // this calculates the adjusted angle per pupil to look towards teh center
        this.pupil.x = this.eye.x + cos(angle) * distance;
        this.pupil.y = this.eye.y + sin(angle) * distance;
    }

    lookAtMouse(x, y) {
        let angle = atan2(y - this.eye.y, x - this.eye.x); //This calculates the angle between the center of the eye and mouse cursor's position
        let maxDistance = this.eyeRadius - this.pupilRadius; // This finds the total amount of distance that the pupil can actually move
        let distance = dist(this.eye.x, this.eye.y, x, y); // This calculates the distance between eye center and mouse cursor 
        distance = min(distance, maxDistance); // limits the maximum allowable distance that the pupil can move  

        // This calculates the position of pupil based on adjusted distance and angle and will always be run no matter what state is going on
        this.pupil.x = this.eye.x + cos(angle) * distance;
        this.pupil.y = this.eye.y + sin(angle) * distance;

    }

    lookAtUser() {
        this.isLookingAtUser = true;

        // calculates the angle towards the eye center
        let angle = atan2(this.eye.y - this.pupil.y, this.eye.x - this.pupil.x);
        // calculates the distance between the pupil and the eye center to prep for the movement of the pupil
        let distance = dist(this.pupil.x, this.pupil.y, this.eye.x, this.eye.y);

        // the total amount of shaking that the pupil undergoes
        let maxVibration = random(0, 2); // Adjust as needed

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
        if (this.isLookingAtUser == false) {

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
            ellipse(this.pupil.x, this.pupil.y, this.pupilRadius * .5, this.pupilRadius * 2.5);
        }

        //Erratic Eye
        else if (this.isLookingAtUser == true) {
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
            ellipse(0, 0, this.pupilRadius * .5, this.pupilRadius * 2.5);
            pop();
        }
    }
}

function portraitFormation() {
    //Sources for learning: https://editor.p5js.org/son/sketches/LuJ2eGf9p - but this doesn't really achieve what I want it to by storing the information of a single frame into an array
    //Portrait Formation - https://github.com/processing/p5.js/issues/599

    if (mouseIsPressed) {

        //Actual copying of the pixels over from the video to the tempImage
        video.loadPixels();
        tempImage.copy(video, 0, 0, 320, 240, 0, 0, 320, 240); //Copies the pixels from the base video into the tempImage to be displayed
        video.updatePixels();

        //Gradual Un-pixelation of image
        //Looking back on it now, I definitely could have just used the blur function, but I wanted to show that I knew how to manipulate the individual values of pixels
        let pixelSize = Math.floor(300 / buttonClick - 10);
        tempImage.loadPixels(); // Load the pixels of the image

        for (let y = 0; y < tempImage.height; y += pixelSize) {
            for (let x = 0; x < tempImage.width; x += pixelSize) {

                //Initialization of variables that will hold the total sum of the RGB Channels within a certain box dictated by pixelSize 
                let sumR = 0;
                let sumG = 0;
                let sumB = 0;

                //Iteration through columns and rows using different pixel x and pixel y positions
                for (let dy = 0; dy < pixelSize; dy++) {
                    for (let dx = 0; dx < pixelSize; dx++) {
                        let px = x + dx;
                        let py = y + dy;

                        if (px < tempImage.width && py < tempImage.height) { //only accesses the pixels within the bounds of the image in order to make it more efficient
                            let index = (px + py * tempImage.width) * 4; //formula that allows for accurate storing of information of RGBA values
                            //Gathering of the total sums of various RGB values within different pixel bounds
                            sumR += tempImage.pixels[index];
                            sumG += tempImage.pixels[index + 1];
                            sumB += tempImage.pixels[index + 2];
                        }
                    }
                }

                //Calculation of average color just through a simple average formula
                let avgR = sumR / (pixelSize * pixelSize);
                let avgG = sumG / (pixelSize * pixelSize);
                let avgB = sumB / (pixelSize * pixelSize);

                //Same thought process as above that iterates through the image in a column and row fashion with steps of pixel size
                for (let dy = 0; dy < pixelSize; dy++) {
                    for (let dx = 0; dx < pixelSize; dx++) {
                        let px = x + dx;
                        let py = y + dy;

                        // Ensure within image bounds
                        if (px < tempImage.width && py < tempImage.height) {
                            let index = (px + py * tempImage.width) * 4;
                            tempImage.pixels[index] = avgR;
                            tempImage.pixels[index + 1] = avgG;
                            tempImage.pixels[index + 2] = avgB;
                        }
                    }
                }
            }
        }
        tempImage.updatePixels(); // Update the pixels of the image after pixelation

        //Drawing the image only when the mouse is clicked
        push();
        imageMode(CENTER);
        image(tempImage, width / 2, height / 2, 320, 240);
        pop();
    }
}

function drawCircularGlow(centerX, centerY, baseRadius, maxOpacity, numCircles) {
    for (let i = 0; i < numCircles; i++) {
        let radius = baseRadius + i * 10;
        let opacity = map(i, 0, numCircles - 1, maxOpacity, 0);
        let fillColor = color(255, 255, 255, opacity);

        // Draw each circle with decreasing opacity and increasing radius
        fill(fillColor);
        noStroke();
        ellipse(centerX, centerY, radius * 3);
    }
}

function mousePressed(){
    if (action < 3) {
        action += 1;
    } else if (action >= 3) {
        action = 1;
    }
}