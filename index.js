/**
 * Class representing a Line.
 */
class Line {
  // Constructor for the Line class that initializes a line segment
  constructor(startX, startY, endX, endY) {
    // Starting x-coordinate of the line segment
    this.startX = startX;
    // Starting y-coordinate of the line segment
    this.startY = startY;
    // Ending x-coordinate of the line segment
    this.endX = endX;
    // Ending y-coordinate of the line segment
    this.endY = endY;
    // A flag to determine if the line segment is currently selected
    this.isSelected = false;
    // A flag to determine if the line segment is currently rotating (though not used in the current code)
    this.isRotating = false;
  }

  // Draw the line segment on a given canvas context
  draw(ctx) {
    ctx.beginPath(); // Start a new path
    ctx.moveTo(this.startX, this.startY); // Move the pen to the starting point of the line
    ctx.lineTo(this.endX, this.endY); // Draw a line to the ending point
    ctx.stroke(); // Render the line on the canvas
  }

  // Check if a given point (x, y) is close to the start or end of the line segment
  contains(x, y) {
    // Calculate the perpendicular distance from the point to the line segment
    const distance =
      Math.abs(
        (this.endY - this.startY) * x -
          (this.endX - this.startX) * y +
          this.endX * this.startY -
          this.endY * this.startX
      ) /
      Math.sqrt(
        (this.endY - this.startY) ** 2 + (this.endX - this.startX) ** 2
      );

    // If the point is within 5 units of the line segment
    if (distance < 5) {
      // If the point is within 10 units of the start of the line

      if (Math.hypot(this.startX - x, this.startY - y) < 10) {
        return "start";
        // Else if the point is within 10 units of the end of the line
      } else if (Math.hypot(this.endX - x, this.endY - y) < 10) {
        return "end";
      }
    }
    // If the point is neither near the start nor the end of the line segment
    return null;
  }

  // Update the end coordinates of the line segment to a new point (newEndX, newEndY)
  rotate(newEndX, newEndY) {
    this.endX = newEndX;
    this.endY = newEndY;
  }

  // Move the entire line segment by dx units in the x-direction and dy units in the y-direction
  move(dx, dy) {
    this.startX += dx;
    this.endX += dx;
    this.startY += dy;
    this.endY += dy;
  }
}

// Define the App class
class App {
  // Constructor for the App class
  constructor() {
    // Get the canvas element by its ID
    this.canvas = document.getElementById("canvas");
    // Get the 2D drawing context of the canvas
    this.ctx = this.canvas.getContext("2d");
    // Initialize an empty array to store lines
    this.lines = [];
    // Initialize the current line being drawn to null
    this.currentLine = null;
    // Flag to determine if we are currently drawing a line
    this.isDrawing = false;
    // Flag to determine if we are currently rotating a line
    this.isRotating = false;
    // Flag to determine if we are currently moving a line
    this.isMoving = false;
    // Bind the necessary event listeners to the canvas
    this.bindEvents();
  }

  // Method to bind the pointer events to the canvas
  bindEvents() {
    // When the pointer is pressed down on the canvas
    this.canvas.addEventListener("pointerdown", this.onPointerDown.bind(this));
    // When the pointer is moving over the canvas
    this.canvas.addEventListener("pointermove", this.onPointerMove.bind(this));
    // When the pointer is released from the canvas
    this.canvas.addEventListener("pointerup", this.onPointerUp.bind(this));
  }

  // Handler for the pointerdown event
  onPointerDown(e) {
    // Get the x and y coordinates of the pointer relative to the canvas
    const x = e.offsetX;
    const y = e.offsetY;

    // Initialize a variable to store the selected line, if any
    let lineSelected = null;
    // Iterate over the lines to see if any line is selected
    for (let line of this.lines) {
      // Check if the current line contains the pointer's coordinates
      if (line.contains(x, y)) {
        line.isSelected = true;
        lineSelected = line;
      } else {
        line.isSelected = false;
      }
    }

    // If a line is selected
    if (lineSelected) {
      // Check if the pointer is near the start or the end of the line
      const positionOnLine = lineSelected.contains(x, y);
      if (positionOnLine === "start") {
        this.isMoving = true;
        this.isRotating = false;
      } else if (positionOnLine === "end") {
        this.isMoving = false;
        this.isRotating = true;
      }
      // Store the current pointer position
      this.lastPointerPos = { x, y };
    } else {
      // If no line is selected, start drawing a new line
      this.isDrawing = true;
      this.currentLine = new Line(x, y, x, y);
      this.lines.push(this.currentLine);
    }
  }

  // Handler for the pointermove event
  onPointerMove(e) {
    // Get the x and y coordinates of the pointer relative to the canvas
    const x = e.offsetX;
    const y = e.offsetY;

    // If we are in drawing mode
    if (this.isDrawing) {
      this.currentLine.endX = x;
      this.currentLine.endY = y;
      this.drawCanvas();
    }
    // If we are in moving mode and have the last pointer position stored
    else if (this.isMoving && this.lastPointerPos) {
      // Calculate the change in pointer position
      const dx = x - this.lastPointerPos.x;
      const dy = y - this.lastPointerPos.y;

      // Move the selected line by the change in pointer position
      for (let line of this.lines) {
        if (line.isSelected) {
          line.move(dx, dy);
          this.drawCanvas();
          this.lastPointerPos = { x, y };
          break;
        }
      }
    }
    // If we are in rotating mode
    else if (this.isRotating) {
      // Rotate the selected line to the current pointer position
      for (let line of this.lines) {
        if (line.isSelected) {
          line.rotate(x, y);
          this.drawCanvas();
          break;
        }
      }
    }
  }

  // Handler for the pointerup event
  onPointerUp(e) {
    // Reset the drawing, rotating, and moving flags
    this.isDrawing = false;
    this.isRotating = false;
    this.isMoving = false;
    // Clear the last stored pointer position
    this.lastPointerPos = null;
  }

  // Method to clear the canvas and redraw all the lines
  drawCanvas() {
    // Clear the entire canvas
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    // Draw each line on the canvas
    for (let line of this.lines) {
      line.draw(this.ctx);
    }
  }
}

// Create an instance of the App class to start the application
new App();
