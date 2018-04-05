var MOVE_MODE_IDLE = 0;
var MOVE_MODE_TRACK = 1;
// Not sure why this is outside of class... isn't used yet but move it in...
var moveMode = 0;

class Wisp {
  constructor(startX, startY, context) {
    this.context = context;

    this.position = {
      x: startX,
      y: startY
    }
    this.waypoint = {
      x: startX,
      y: startY,
      xVector: 0,
      yVector: 0,
      distToTargetSqrd: 0,
      pathX: [null],
      pathY: [null],
      blockersInPath: [],
      angleToTarget: 0
    }
    this.velocity = {
      magnitude: 0,
      direction: 0,
      ACCELERATION: 0.02,
      TURN_RATE: 10 * Math.PI / 180,
      TERMINAL: 4
    }
    this.trail = {
      xPositions: [],
      yPositions: [],
      index: 0,
      MAX: 40
    }
    for (x = 0; x < this.trail.MAX; x++) {
      this.trail.xPositions.push(startX);
      this.trail.yPositions.push(startY);
    }
    // Simulates the oscilating motion of wisp
    this.flow = {
      angle: 0,
      up: true,
      RATE: 3 * Math.PI / 180,
      TERMINAL: 40 * Math.PI / 180
    }
  }

  setWaypoint(xWay_new, yWay_new) {
    this.waypoint.x = xWay_new;
    this.waypoint.y = yWay_new;
  }
  setPosition(x, y) {
    this.position.x = x;
    this.position.y = y;
  }

  update() {
    this.generatePath();
    // Determine if a special path was needed
    if (this.waypoint.pathX[0] == null) {
      this.waypoint.xVector = this.waypoint.x - this.position.x;
      this.waypoint.yVector = this.waypoint.y - this.position.y;
      // console.log("- this.waypoint.xVector/yVector: " + parseInt(this.waypoint.xVector) + ", " + parseInt(this.waypoint.yVector));
    } else {
      this.waypoint.xVector = this.waypoint.pathX[0] - this.position.x;
      this.waypoint.yVector = this.waypoint.pathY[0] - this.position.y;
      // console.log("this.waypoint.xVector/yVector: " + parseInt(this.waypoint.xVector) + ", " + parseInt(this.waypoint.yVector));
    }

    // this.waypoint.xVector = this.waypoint.x - this.position.x;
    // this.waypoint.yVector = this.waypoint.y - this.position.y;

    // Check whether distance is far enough to speed up or slow down
    this.distToTargetSqrd = Math.pow(this.waypoint.xVector, 2) + Math.pow(this.waypoint.yVector, 2);
    if (this.distToTargetSqrd > Math.pow(140, 2)) { // UPDATE THIS VALUE TO BE CALCULATED
      this.velocity.magnitude += this.velocity.ACCELERATION;
      this.velocity.magnitude = Math.min(this.velocity.magnitude, this.velocity.TERMINAL);
    } else {
      this.velocity.magnitude -= 3 * this.velocity.ACCELERATION;
      this.velocity.magnitude = Math.max(this.velocity.magnitude, 1);
    }
    // Get target angle
    this.waypoint.angleToTarget = Math.atan2(this.waypoint.yVector, this.waypoint.xVector); // atan2 expensive?
    this.waypoint.angleToTarget = normalizeAngle(this.waypoint.angleToTarget);
    // Check closest direction to turn to target angle
    var angleDifference = this.waypoint.angleToTarget - this.velocity.direction;
    if (Math.abs(angleDifference) > this.velocity.TURN_RATE) {
      if ((angleDifference < Math.PI && angleDifference > 0) || (angleDifference < - Math.PI)) {
        this.velocity.direction += (this.velocity.TURN_RATE);
      } else {
        this.velocity.direction -= (this.velocity.TURN_RATE);
      }
      this.velocity.direction = normalizeAngle(this.velocity.direction);
    } else {
      // Heading in straight line
      this.velocity.direction = this.waypoint.angleToTarget;
    }
    // Control slither movement
    if (this.flow.up) {
      this.flow.angle += this.flow.RATE;
      if (this.flow.angle > this.flow.TERMINAL) {
        this.flow.up = false;
      }
    } else {
      this.flow.angle -= this.flow.RATE;
      if (this.flow.angle < -this.flow.TERMINAL) {
        this.flow.up = true;
      }
    }
    // Calculate displacement components
    this.position.x += this.velocity.magnitude * Math.cos(this.velocity.direction + this.flow.angle);
    this.position.y += this.velocity.magnitude * Math.sin(this.velocity.direction + this.flow.angle);
    // Record location for current tail index
    this.trail.xPositions[this.trail.index] = this.position.x;
    this.trail.yPositions[this.trail.index] = this.position.y;
    this.trail.index = (this.trail.index + 1) % this.trail.MAX;
    // this.trail.length = this.velocity.magnitude / this.velocity.TERMINAL * this.trail.MAX
  }

  render() {
    // Go backwards through tail array to render tail
    this.context.strokeStyle = __color_tonic;
    this.context.beginPath();
    var index = (this.trail.index - 1);
    if (index < 0) index += this.trail.MAX;
    this.context.moveTo(this.trail.xPositions[index], this.trail.yPositions[index]);
    for (x = 0; x < this.trail.MAX - 1; x++) {
      index--;
      if (index < 0) index += this.trail.MAX;
      this.context.lineTo(this.trail.xPositions[index], this.trail.yPositions[index]);
    }
    this.context.stroke();

    // Render head
    this.context.fillStyle = __color_dominant;
    this.context.beginPath();
    this.context.arc(this.position.x, this.position.y, 5, 0, 2 * Math.PI, false);
    this.context.fill();

    // Render Target Line
    this.context.strokeStyle = "Blue";
    this.context.beginPath();
    this.context.moveTo(this.position.x, this.position.y);
    this.context.lineTo(this.waypoint.x, this.waypoint.y);
    this.context.stroke();
  }

  /**
  * Populate this.waypoint.pathX/Y by using wisp's destination target.
  * Will produce a path that avoids any existing blockers on the canvas.
  */
  generatePath() {
    // Clear out blockers list for new generation
    this.waypoint.blockersInPath = [];
    // Reference to closest blocker
    var smallestDistSqrd = 10000000;
    // Iterate through every blocker to find blockers in the way of target
    // ===================================================================
    for (x = 0; x < Blocker.blockers.length; x++) {
      // Line from wisp to center of blocker (calculated average center)
      var toSphereX = Blocker.blockers[x].center.x - this.position.x;
      var toSphereY = Blocker.blockers[x].center.y - this.position.y;
      //
      var toTargetX = this.waypoint.x - this.position.x;
      var toTargetY = this.waypoint.y - this.position.y;
      // Projected line to blocker onto line to target destination
      var proj = Wisp.projection(toSphereX, toSphereY, toTargetX, toTargetY);
      // Projection line distance^2
      var projectionDistanceSqrd = Math.pow(proj[0], 2) + Math.pow(proj[1], 2);
      // Note distance to the player
      var distToWispSqrd = Math.pow((toSphereX), 2) + Math.pow((toSphereY), 2)
      // Distance^2 of line to blocker center,
      // perpendicular to line from wisp to target destination.
      var perpDistSqrd = Math.pow(proj[0] + this.position.x - Blocker.blockers[x].center.x, 2) + Math.pow(proj[1] + this.position.y - Blocker.blockers[x].center.y, 2);
      // Distance^2 of line from target destination to blocker center
      var targetToBlockerDistanceSqrd = Math.pow(Blocker.blockers[x].center.x - this.waypoint.x, 2) + Math.pow(Blocker.blockers[x].center.y - this.waypoint.y, 2);
      // Check if line passes blocker and overlaps circular radius around blocker
      // and is in direction of target destination
      // OR
      // the target point is inside a blocker.
      // OR
      // the wisp is inside a blocker.
      if ((projectionDistanceSqrd < this.distToTargetSqrd && perpDistSqrd <= Blocker.blockers[x].colliderRadiusSqrd && Wisp.quadrant(proj[1], proj[0]) == Wisp.quadrant(toTargetY, toTargetX))
        ||
        targetToBlockerDistanceSqrd < Blocker.blockers[x].colliderRadiusSqrd
        ||
        distToWispSqrd < Blocker.blockers[x].colliderRadiusSqrd) {
          // Found blocker

          // Use following for detecting closest blocker in path.
          // Used when calculating path after every moment.
          // ================================================
          if (this.waypoint.blockersInPath.length == 0) {
            // First blocker found, must be closest blocker.
            smallestDistSqrd = Math.abs(projectionDistanceSqrd);
            this.waypoint.blockersInPath.push(Blocker.blockers[x]);
          } else {
            // Another blocker found, check if its closer
            if (Math.abs(projectionDistanceSqrd) < smallestDistSqrd) {
              smallestDistSqrd = Math.abs(projectionDistanceSqrd);
              this.waypoint.blockersInPath[0] = Blocker.blockers[x];
            }
          }

          // Use following for detecing all blockers in the way.
          // Used when calculating entire path at once.
          // ================================================
          // this.waypoint.blockersInPath.push(Blocker.blockers[x]);
        }
    } // END FINDING BLOCKERS ===========

    // Go through list of blockers (Will only be one if recalculating every update)
    // Find vertices that are visible to wisp
    // ============================================================================
    for (x = 0; x < this.waypoint.blockersInPath.length; x++) {
      // Reference to vertices that are visible to wisp
      var visibleVerticesX = [];
      var visibleVerticesY = [];
      // Test each vertex of current blocker to see if it's visible to the Wisp
      for (var v = 0; v < this.waypoint.blockersInPath[x].vertex.length; v++) {
        // Reference to vertex being visible
        var visible = true;
        // X/Y components towards this vertex from wisp
        var toVertexX = this.waypoint.blockersInPath[x].vertex.x[v] - this.position.x;
        var toVertexY = this.waypoint.blockersInPath[x].vertex.y[v] - this.position.y;
        // Destination vector
        var toTargetX = this.waypoint.x - this.position.x;
        var toTargetY = this.waypoint.y - this.position.y;
        // Projection of this vertex onto target destination line
        var proj = Wisp.projection(toVertexX, toVertexY, toTargetX, toTargetY);
        // Test if the vertex is behind the wisp...
        if (Wisp.quadrant(proj[0], proj[1]) != Wisp.quadrant(toTargetX, toTargetY)) {
          visible = false;
          break;
        }
        // Test peer vertices for overlaps to tell visibility
        for (var v2 = 0; v2 < this.waypoint.blockersInPath[x].vertex.length; v2++) {
          // Reference to previous and next vertex since shape is a closed loop
          var v2Prev = (this.waypoint.blockersInPath[x].vertex.length + v2 - 1) % this.waypoint.blockersInPath[x].vertex.length;
          var v2Next = (v2 + 1) % this.waypoint.blockersInPath[x].vertex.length;
          // Can skip checking this peer vertex if it is itself or next vertex
          if (v2 == v || v2Prev == v) {
            continue;
          }
          // See Wisp.intersecting() for intersecting codes
          var intersecting = 0;
          // Get if line to vertex intersects this side of blocker
          intersecting = Wisp.intersecting(
            this.position.x, this.position.y,
            this.waypoint.blockersInPath[x].vertex.x[v], this.waypoint.blockersInPath[x].vertex.y[v],
            this.waypoint.blockersInPath[x].vertex.x[v2], this.waypoint.blockersInPath[x].vertex.y[v2],
            this.waypoint.blockersInPath[x].vertex.x[v2Prev], this.waypoint.blockersInPath[x].vertex.y[v2Prev]);
          // If it intersects any side then stop looping through peer vertices and set visible to false
          if (intersecting == 1 || intersecting == 2) {
            visible = false;
            break;
          }
        }
        // If after going through every side of blocker and this vertex does not
        // intersect any of the sides, then push it to visible vertices array
        if (visible) {
          visibleVerticesX.push(this.waypoint.blockersInPath[x].vertex.x[v]);
          visibleVerticesY.push(this.waypoint.blockersInPath[x].vertex.y[v]);
        }
        // Go onto next vertex
      } // END FINDING VISIBLE VERTICES =========

      // Check if any vertices are visible
      if (visibleVerticesX.length == 0) {
        this.waypoint.pathX[0] = this.waypoint.x;
        this.waypoint.pathY[0] = this.waypoint.y;
        break;
      }

      // Reference to the vertex that sticks out the most above target
      // destination line and below target destination line
      var farthestVertexAbove = null;
      var farthestDistanceAboveSqrd = null;
      var farthestVertexBelow = null;
      var farthestDistanceBelowSqrd = null;
      // In case that the shape is all 'above' the target line, then need to note
      // the visible vertex closest to the line, not farthest
      var shortestVertex = null;
      var shortestDistanceSqrd = null;
      // Above vs below just need to be in opposite quadrants, they are relative,
      // the actual quadrants are not important
      var aboveQuadrant = null;
      // Go through list of visible vertices for this blocker to find vertex that
      // sticks out the most on each side
      // ========================================================================
      for (var ind = 0; ind < visibleVerticesX.length; ind++) {
        // X/Y components towards this visible vertex from wisp
        var toVertexX = visibleVerticesX[ind] - this.position.x;
        var toVertexY = visibleVerticesY[ind] - this.position.y;
        // Destination vector
        var toTargetX = this.waypoint.x - this.position.x;
        var toTargetY = this.waypoint.y - this.position.y;
        // Projection of this vertex onto target destination line
        var proj = Wisp.projection(toVertexX, toVertexY, toTargetX, toTargetY);
        // Components of perpendicular line out from projection on destination target line to vertex
        var perpOutToVertexVectorX = visibleVerticesX[ind] - (this.position.x + proj[0]);
        var perpOutToVertexVectorY = visibleVerticesY[ind] - (this.position.y + proj[1]);
        // Distance of this perpendicular line
        var perpDistSqrd = Math.pow(perpOutToVertexVectorX, 2) + Math.pow(perpOutToVertexVectorY, 2);
        // See if 'above' quadrant has been estabalished yet.
        // 'Above' is relative and actual quadrant doesn't matter.
        if (aboveQuadrant == null) {
          aboveQuadrant = Wisp.quadrant(perpOutToVertexVectorX, perpOutToVertexVectorY);
          farthestVertexAbove = ind;
          farthestDistanceAboveSqrd = perpDistSqrd;
          // Set shortest as well, incase all visible vertices on one side of target line
          shortestVertex = ind;
          shortestDistanceSqrd = perpDistSqrd;
        } else {
          // An 'above' quadrant is established, so check which side this vertex is on
          if (aboveQuadrant == Wisp.quadrant(perpOutToVertexVectorX, perpOutToVertexVectorY)) {
            // Set above side
            if (perpDistSqrd > farthestDistanceAboveSqrd) {
              farthestVertexAbove = ind;
              farthestDistanceAboveSqrd = perpDistSqrd;
            }
            // Only needs to happen on the 'above' side, since there won't be a
            // 'below' side if shortestVertex is being used
            if (perpDistSqrd < shortestDistanceSqrd) {
              shortestVertex = ind;
              shortestDistanceSqrd = perpDistSqrd;
            }
          } else {
            // Set below side
            // Check if this is the first 'below' side vertex
            if (farthestDistanceBelowSqrd == null) {
              farthestVertexBelow = ind;
              farthestDistanceBelowSqrd = perpDistSqrd;
            } else if (perpDistSqrd > farthestDistanceBelowSqrd) {
              farthestVertexBelow = ind;
              farthestDistanceBelowSqrd = perpDistSqrd;
            }
          }
        }

        // TESTING USAGE : Draw perpendicular line to visible vertices and circles on waypoint line
        this.context.strokeStyle = "Green";
        this.context.beginPath();
        this.context.moveTo(visibleVerticesX[ind], visibleVerticesY[ind]);
        this.context.lineTo(this.position.x + proj[0], this.position.y + proj[1]);
        this.context.arc(this.position.x + proj[0], this.position.y + proj[1], 5, 0, 2 * Math.PI, false);
        this.context.stroke();
        // TESTING USAGE __________________________________/

      } // END FINDING FARTHEST VERTEX ON ABOVE/BELOW SIDE

      var goTowardsVertex = null;
      // Find shortest side of the two sides
      // ===================================
      // Check if at least above side is set
      if (aboveQuadrant != null) {
        // Reference to whether or not wisp will travel above or below target line
        var towardsAbove = true;
        // Check if there is a below vertex set
        // Else just keep towardsAbove as true
        if (farthestVertexBelow != null) {
          // X/Y components towards farthest vertex above & below
          var toFarthestVertexAboveX = visibleVerticesX[farthestVertexAbove] - this.position.x;
          var toFarthestVertexAboveY = visibleVerticesY[farthestVertexAbove] - this.position.y;
          var toFarthestVertexBelowX = visibleVerticesX[farthestVertexBelow] - this.position.x;
          var toFarthestVertexBelowY = visibleVerticesY[farthestVertexBelow] - this.position.y;
          // Target destination vector
          var toTargetX = this.waypoint.x - this.position.x;
          var toTargetY = this.waypoint.y - this.position.y;
          // Projection of this vertex onto target destination line for above & below
          var projAbove = Wisp.projection(toFarthestVertexAboveX, toFarthestVertexAboveY, toTargetX, toTargetY);
          var projBelow = Wisp.projection(toFarthestVertexBelowX, toFarthestVertexBelowY, toTargetX, toTargetY);
          // Components of perpendicular line out from projection on destination target line to vertex for above & below
          var perpOutToFarthestVertexVectorAboveX = visibleVerticesX[farthestVertexAbove] - (this.position.x + projAbove[0]);
          var perpOutToFarthestVertexVectorAboveY = visibleVerticesY[farthestVertexAbove] - (this.position.y + projAbove[1]);
          var perpOutToFarthestVertexVectorBelowX = visibleVerticesX[farthestVertexBelow] - (this.position.x + projBelow[0]);
          var perpOutToFarthestVertexVectorBelowY = visibleVerticesY[farthestVertexBelow] - (this.position.y + projBelow[1]);
          // Distance of this perpendicular line
          var farthestVertexAboveDistSqrd = Math.pow(perpOutToFarthestVertexVectorAboveX, 2) + Math.pow(perpOutToFarthestVertexVectorAboveY, 2);
          var farthestVertexBelowDistSqrd = Math.pow(perpOutToFarthestVertexVectorBelowX, 2) + Math.pow(perpOutToFarthestVertexVectorBelowY, 2);
          // Check if above is farther than below, if so then don't go above
          if (farthestVertexAboveDistSqrd > farthestVertexBelowDistSqrd) {
            towardsAbove = false;
          }
          // Set which vertex the wisp should choose based on shorest side
          if (towardsAbove) {
            goTowardsVertex = farthestVertexAbove;
          } else {
            goTowardsVertex = farthestVertexBelow;
          }
        } else {
          // If there isn't a below side then all the visible vertices are on one side
          // of the target destination line; use shortestVertex instead of farthestVertex
          goTowardsVertex = shortestVertex;
        }

        // TESTING USAGE : Draw line to fastest path vertex
        this.context.strokeStyle = "Yellow";
        this.context.beginPath();
        this.context.moveTo(this.position.x, this.position.y);
        this.context.lineTo(visibleVerticesX[goTowardsVertex], visibleVerticesY[goTowardsVertex]);
        this.context.stroke();
        // TESTING USAGE __________________________________/

        // TESTING USAGE : Circle the farthest vertex above waypoint line
        this.context.strokeStyle = "Yellow";
        this.context.beginPath();
        this.context.arc(visibleVerticesX[farthestVertexAbove], visibleVerticesY[farthestVertexAbove], 7, 0, 2 * Math.PI, false);
        this.context.stroke();
        // TESTING USAGE __________________________________/

        // TESTING USAGE : Circle the farthest vertex below waypoint line
        if (farthestDistanceBelowSqrd != null) {
          this.context.strokeStyle = "Yellow";
          this.context.beginPath();
          this.context.arc(visibleVerticesX[farthestVertexBelow], visibleVerticesY[farthestVertexBelow], 9, 0, 2 * Math.PI, false);
          this.context.stroke();
        }
        // TESTING USAGE __________________________________/

      } // END FINDING SHORTEST SIDE

      // Since the wisp slithers it can't move directly to the vertex point.
      // Final step to calculate actual point on path is give buffer away from blocker.
      // ==============================================================================
      // Need to calculate amount the wisp deviates from its target `destination line
      // due to slithering movement
      var flowDisplacementAmount = 40; //this.velocity.magnitude * Math.tan(this.flow.angle);
      // If there is no 'below' side, as in all vertices are on one side of line
      // AND
      // if target line is far enough away from vertex THEN simply go towards destination
      if (farthestVertexBelow == null && shortestDistanceSqrd > Math.pow(flowDisplacementAmount, 2)) {
        this.waypoint.pathX[0] = this.waypoint.x;
        this.waypoint.pathY[0] = this.waypoint.y;
      } else {
        // Otherwise proceed with calculating which side is better
        // References to X/Y components out to shortest vertex
        var xCompToVertex = visibleVerticesX[goTowardsVertex] - this.waypoint.blockersInPath[x].center.x;
        var yCompToVertex = visibleVerticesY[goTowardsVertex] - this.waypoint.blockersInPath[x].center.y;
        var distanceToVertex = Math.sqrt(Math.pow(xCompToVertex, 2) + Math.pow(yCompToVertex, 2));
        // Geometry calculations for extending a line
        var angleTowardsVertex = Math.atan2(yCompToVertex, xCompToVertex);
        var extendedXVector = (distanceToVertex + flowDisplacementAmount) * Math.cos(angleTowardsVertex);
        var extendedYVector = (distanceToVertex + flowDisplacementAmount) * Math.sin(angleTowardsVertex);
        // Set the path point by adding extended vector to center of blocker
        this.waypoint.pathX[0] = extendedXVector + this.waypoint.blockersInPath[x].center.x;
        this.waypoint.pathY[0] = extendedYVector + this.waypoint.blockersInPath[x].center.y;
      }
      // TESTING USAGE : Draw line to fastest path vertex
      this.context.strokeStyle = "Red";
      this.context.beginPath();
      this.context.moveTo(this.position.x, this.position.y);
      this.context.lineTo(this.waypoint.pathX[0], this.waypoint.pathY[0]);
      // console.log("path[0] x: " + this.waypoint.pathX[0] + "  y: " + this.waypoint.pathY[0]);
      this.context.stroke();
      // TESTING USAGE __________________________________/

    } // END ITERATING THROUGH THIS BLOCKER (probably only 1 blocker)

    // If there aren't any blockers in the way, then no special path is needed
    if (this.waypoint.blockersInPath.length == 0) {
      this.waypoint.pathX[0] = null;
      this.waypoint.pathY[0] = null;
    }

  } // End generatePath() method

  // Return quadrant 1, 2, 3, or 4
  static quadrant(x, y) {
    if (x > 0 && y > 0) {
      return 1;
    } else
    if (x < 0 && y > 0) {
      return 2;
    } else
    if (x < 0 && y < 0) {
      return 3;
    } else
    if (x > 0 && y < 0) {
      return 4;
    }
  }

  static dotProduct(aX, aY, bX, bY) {
    return aX * bX + aY * bY;
  }
  // Project a onto b
  static projection(aX, aY, bX, bY) {
    var calc = Wisp.dotProduct(aX, aY, bX, bY) / (bX * bX + bY * bY);
    var xComponent = bX * calc;
    var yComponent = bY * calc;
    return [xComponent, yComponent];
  }
  // Return 0 if no intersection of lines,
  // Return 1 if intersected. 2 if same axis.
  static intersecting(a1X, a1Y, a2X, a2Y, b1X, b1Y, b2X, b2Y) {
    var a1 = a2Y - a1Y;
    var b1 = a1X - a2X;
    var c1 = (a2X * a1Y) - (a1X * a2Y);
    var d1 = (a1 * b1X) + (b1 * b1Y) + c1;
    var d2 = (a1 * b2X) + (b1 * b2Y) + c1;
    if (d1 > 0 && d2 > 0) {
      return 0; }
    if (d1 < 0 && d2 < 0) {
      return 0; }
    var a2 = b2Y - b1Y;
    var b2 = b1X - b2X;
    var c2 = (b2X * b1Y) - (b1X * b2Y);
    d1 = (a2 * a1X) + (b2 * a1Y) + c2;
    d2 = (a2 * a2X) + (b2 * a2Y) + c2;
    if (d1 > 0 && d2 > 0) {
      return 0; }
    if (d1 < 0 && d2 < 0) {
      return 0; }

    if ((a1 * b2) - (a2 * b1) == 0) {
      return 2; }
    else {
      return 1; }
  }
}

function normalizeAngle(angle) {
  var newAngle = angle;
  while (newAngle < 0) {
    newAngle += 2 * Math.PI;
  }
  while (newAngle > 2 * Math.PI) {
     newAngle -= 2 * Math.PI;
   }
  return newAngle;
}

// NYI
function slopeToRoughAngle(slope) {

  return 0;
}
