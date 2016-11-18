$(function () {
    var canvas = $("#canvas")[0];
    var context = canvas.getContext("2d");
    var canvasWidth = $("#canvas").width();
    var canvasHeight = $("#canvas").height();

    console.log("width: " + canvasWidth);
    console.log("Height: " + canvasHeight);

    // Initialize variables
    var cellWidth = 10;
    var offset = 0;
    canvasWidth = canvasWidth - offset;
    canvasHeight = canvasHeight - offset;
    var cornerRadius = 8;
    var direction;
    var food;
    var score;
    var game_loop;
    var isOperationProcessed = true;
    var isGameInProgress = false;

    // Initialize snake array
    var snake_array;

    init = function () {     

        direction = "right";
        create_snake();
        create_food();
        score = 0;
        isGameInProgress = true;

        // Loop the game
        if (typeof (game_loop) != undefined) {
            clearInterval(game_loop);
        }

        game_loop = setInterval(paint, 50);
    }

    function hideScreenshots() {
        $("#screenshot").hide();
        $("#screenshotImage").hide();
    }

    function showScreenshots() {
        $("#screenshot").show();
        $("#screenshotImage").show();
    }

    function create_snake() {
        var length_of_snake = 15;
        snake_array = [];

        var yIndex = Math.ceil(Math.random() * (((canvasHeight - 1) - cellWidth) / (cellWidth)));//+ (offset / 2);

        console.log("Starting Index: (" + 0 + "," + yIndex + ")");

        for (var index = length_of_snake + 2; index >= 1 ; index--) {
            snake_array.push({ x: index, y: 1 });
            console.log(index, 0);
        }
    }
    function loadTheBoard(alpha)
    {        
        context.globalAlpha = alpha;

        // Clear out and recolor canvas for every frame
        context.fillStyle = "White";
        context.fillRect(offset / 2, offset / 2, canvasWidth, canvasHeight);

        context.globalAlpha = alpha;
        context.strokeStyle = "Black";
        context.strokeRect(0, 0, canvasWidth + (offset), canvasHeight + (offset))

        paint_grids(0, 0, canvasWidth, canvasHeight);
    }

    function loadTheStartControls(alpha)
    {
        context.globalAlpha = alpha;
        context.fillStyle = "Black";
        context.font = "30px Calibri";
        context.fillText("Press space to start the game!",42,220);
    }

    function paint(alpha) {

        if (alpha)
        {

        }
        else {
            alpha = 1;
        }
        loadTheBoard(alpha);
       

        var nx = snake_array[0].x;
        var ny = snake_array[0].y;

        switch (direction) {
            case "right": {
                nx++;
                break;
            }
            case "left":
                {
                    nx--;
                    break;
                }
            case "up": {
                ny--;
                break;
            }
            case "down": {
                ny++;
                break;
            }
        }


        // Check collision
        if (check_collision(nx, ny, snake_array)) {
            EndTheGame();

            return;
        }

        // Check if snake ate the food
        if (food.x == nx && food.y == ny) {
            var tail = { x: nx, y: ny };
            score++;
            create_food();
            console.log("Snake ate food at: " + nx + "," + ny);
        }
        else {
            // Move the snake
            var tail = snake_array.pop();

            // Handling lower and higher margins of canvas         
            tail.x = (nx + ((canvasWidth / 10) - 1)) % ((canvasWidth / 10) - 1);

            if (tail.x == 0 && nx != 0) {
                tail.x = 1;
            }
            else if (tail.x == 0 && nx == 0) {
                tail.x = (canvasWidth / 10) - 2;
            }

            tail.y = (ny + ((canvasHeight) / 10) - 1) % ((canvasHeight / 10) - 1);

            if (tail.y == 0 && ny != 0) {
                tail.y = 1;
            }
            else if (tail.y == 0 && ny == 0) {
                tail.y = (canvasHeight / 10) - 2;
            }
            // console.log(nx);
        }

        snake_array.unshift(tail);

        // Paint the snake
        paint_snake(snake_array);

        // Place the food randomly       
        paint_cell(food.x, food.y);

        //Lets paint the score
        $("#Score").text(score);
        isOperationProcessed = true;
    }

    function create_food() {
        food = {
            x: Math.round(Math.random() * ((canvasWidth - cellWidth - offset) / cellWidth - 1)),
            y: Math.round(Math.random() * ((canvasHeight - cellWidth - offset) / cellWidth - 1)),
        }

        if (food.x == 0) {
            food.x = 1;
        }

        if (food.y == 0) {
            food.y = 1;
        }
    }

    function EndTheGame() {       
        
        //paintEndGame(0.5);
        isGameInProgress = false;

        // Take the picture
        var image = canvas.toDataURL("image/png");

        // Display the anchor tag
        showScreenshots();

        // Set the href
        $("#screenshot").attr("href", image);
        $("#screenshotImage").attr("src", image);


        storeImageInHistory(image);
        showHistory();
       
        loadCanvas();
    }

    function paintEndGame(alpha)
    {
        loadTheBoard(alpha);

        // Paint the snake
        paint_snake(snake_array);

        // Place the food randomly       
        paint_cell(food.x, food.y);
    }

    function storeImageInHistory(image)
    {
        // Store the data of the game
        if (window.localStorage) {
            // Get the current Index
            var index = localStorage.getItem("currentIndex");

            if (index) {
                // Increment the current index
                index++;
            }
            else {
                // Initialize the index
                index = 0;
            }

            localStorage.setItem("currentIndex", index);

            // Store the values
            localStorage.setItem("score" + index, score);
            localStorage.setItem("image" + index, image);
        }
    }

    function showHistory() {

        $("#divHistory")[0].innerHTML = "";
        // Store the data of the game
        if (window.localStorage) {
            // Get the current Index
            var index = localStorage.getItem("currentIndex");          

            // Display last five values
            for (var counter = index; counter > (index - 5) ; counter--) {
                // Create a div element
                var imageContainer = '<a class="historyLink" href="{0}" id="screenshot" download="snake_{1}.png" ><img src="{2}" width="75" height="75" /></a>'
                // download="snake_{1}.png"
                // assign it to container
                var image = localStorage.getItem("image" + counter);
                if (image) {
                    imageContainer = imageContainer.replace("{0}", image);
                    imageContainer = imageContainer.replace("{1}", counter);
                    imageContainer = imageContainer.replace("{2}", image);

                    $("#divHistory")[0].innerHTML += imageContainer;
                }
                else {
                    break;
                }
            }
        }
    }

    function paint_grids(xIndex, yIndex, canvasWidth, canvasHeight) {

        // Horizontal lines
        for (var index = xIndex; index <= canvasWidth + (offset / 2) ; index = index + 10) {
            context.beginPath();
            context.moveTo(index, yIndex + 10 + (offset / 2));

            context.lineTo(index, yIndex + canvasHeight - 10 + (offset / 2));
            context.closePath();
            context.lineWidth = 0.3;
            context.stroke();
            context.strokeStyle = "#e0ebeb";
            // context.strokeStyle = "black";

            //  console.log("(" + index + "," + yIndex + ") to (" + index + "," + (yIndex + canvasHeight) + ")");
            // context.fill();
        }

        for (var index = yIndex; index <= canvasHeight + (offset / 2) ; index = index + 10) {
            context.beginPath();
            context.moveTo(xIndex + 10 + (offset / 2), index);

            context.lineTo(xIndex + canvasWidth - 10 + (offset / 2), index);
            context.closePath();
            context.lineWidth = 0.3;
            context.stroke();
            context.strokeStyle = "#e0ebeb";
            // context.strokeStyle = "black";

            // context.fill();
        }
    }

    function paint_snake(snake_array) {
        for (var i = 0; i < snake_array.length; i++) {
            var bit = snake_array[i];
            if (i == 0) {
                paint_head(bit.x, bit.y);
            }
            else {
                paint_body(bit.x, bit.y);
            }

            console.log(bit.x + "," + bit.y);
        }
    }

    function paint_cell(x, y) {
        //context.lineJoin = "round";


        //context.fillStyle = "blue";
        //context.fillRect((x * cellWidth) + (cornerRadius / 2), (y * cellWidth) + (cornerRadius / 2), cellWidth - cornerRadius, cellWidth - cornerRadius);
        //context.strokeStyle = "blue";
        //context.strokeRect((x * cellWidth) + (cornerRadius / 2), (y * cellWidth) + (cornerRadius / 2), cellWidth - cornerRadius, cellWidth - cornerRadius);
        context.beginPath();
        context.strokeStyle = "brown";

        context.arc((x * cellWidth) + (cornerRadius / 2) + 1, (y * cellWidth) + (cornerRadius / 2) + 1, (cellWidth - cornerRadius) / 2, 0, Math.PI * 2, false);

        context.stroke();
        context.lineWidth = 4;
        context.strokeStyle = 'brown';
        context.stroke();
    }

    function paint_body(x, y) {
        context.lineJoin = "round";
        context.lineWidth = cornerRadius;

        context.fillStyle = "blue";
        context.fillRect((x * cellWidth) + (cornerRadius / 2), (y * cellWidth) + (cornerRadius / 2), cellWidth - cornerRadius, cellWidth - cornerRadius);
        context.strokeStyle = "blue";
        context.strokeRect((x * cellWidth) + (cornerRadius / 2), (y * cellWidth) + (cornerRadius / 2), cellWidth - cornerRadius, cellWidth - cornerRadius);
    }

    function paint_head(x, y) {
        context.lineJoin = "round";
        context.lineWidth = cornerRadius;

        context.fillStyle = "green";
        context.fillRect((x * cellWidth) + (cornerRadius / 2), (y * cellWidth) + (cornerRadius / 2), cellWidth - cornerRadius, cellWidth - cornerRadius);
        context.strokeStyle = "green";
        context.strokeRect((x * cellWidth) + (cornerRadius / 2), (y * cellWidth) + (cornerRadius / 2), cellWidth - cornerRadius, cellWidth - cornerRadius);

    }

    function paint_bitten_cell(x, y) {
        context.fillStyle = "red";
        context.fillRect((x * cellWidth) + (cornerRadius / 2), (y * cellWidth) + (cornerRadius / 2), cellWidth - cornerRadius, cellWidth - cornerRadius);
        context.strokeStyle = "red";
        context.strokeRect((x * cellWidth) + (cornerRadius / 2), (y * cellWidth) + (cornerRadius / 2), cellWidth - cornerRadius, cellWidth - cornerRadius);
    }

    function check_collision(x, y, array) {
        for (var i = 0; i < array.length; i++) {
            if (array[i].x == x && array[i].y == y) {
                console.log("Game over");
                clearInterval(game_loop);
                paint_snake(snake_array);
                paint_bitten_cell(x, y);
                paint_cell(food.x, food.y);
                //  paint_bitten_cell(array[i].x, array[i].y)
                // TODO: Go to game over proceeding
                $("#gameOver").text("Game over :(");

                return true;
            }
        }

        return false;
    }

    $(document).keydown(function (e) {
        var key = e.which;

        if (key == 32) {
            if (!isGameInProgress) {
                init();
            }
        }

        if (isOperationProcessed) {
            isOperationProcessed = false;

            if (key == 37 && direction != "right") {
                direction = "left";
            }
            else if (key == 38 && direction != "down") {
                direction = "up";
            }
            else if (key == 39 && direction != "left") {
                direction = "right";
            }
            else if (key == 40 && direction != "up") {
                direction = "down";
            }
        }
    });

    function loadCanvas() {
        // Initialize game controls
       
        loadTheBoard(0.5);
        loadTheStartControls(1);

        // Initialize score

        // Initialize history
        showHistory();
    }
    
    loadCanvas();
});


function onStartGameClick() {
    $("#gameOver").text("");
    init();
}