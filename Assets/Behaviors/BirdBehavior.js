#pragma strict

@script RequireComponent(Rigidbody2D)
@script RequireComponent(Behavior)

import Utilities;


//Velocity
//Acceleration
//Steering

private var scene : Scene;

private var behavior : Behavior;

private var animator : Animator;

//var animation : Animation;

var birdSpritePrefab   : GameObject;
private var birdSprite : GameObject;

var flock : Flocking;

var speed : float = 4;

var steerVector : Vector2 = Vector2(1, 0);

var viewRadius : float = 2;

var moveSpeed : float = 0.1;

private var animationName : String;

private var birdLayerMask : int;

private var neighbors : Collider2D[];
private var numNeighbors : int = 0;

private var centroid : Vector2 = Vector2.zero;

private var cohesionVector    : Vector2 = Vector2.zero;
private var separationVector  : Vector2 = Vector2.zero;
private var alignmentVector   : Vector2 = Vector2.zero;
private var towardsGoalVector : Vector2 = Vector2.zero;

private var animationNames : String[] =
  ["BirdMidAnimation", "BirdMidUpAnimation", "BirdUpAnimation",
   "BirdUpAnimation",  "BirdMidUpAnimation", "BirdMidAnimation",
   "BirdMidAnimation", "BirdMidLowAnimation", "BirdUpAnimation",
   "BirdUpAnimation", "BirdMidLowAnimation", "BirdMidAnimation",
   "BirdMidAnimation"]; //extra index for edge cases?
  //["BirdUpAnimation", "BirdMidUpAnimation", "BirdMidAnimation", "BirdMidAnimation", "BirdMidLowAnimation", "BirdUpAnimation"];

function Start ()
{ 
  neighbors = new Collider2D[flock.flockSize];

  behavior = gameObject.GetComponent(Behavior);

  scene = GameObject.Find("Scene").GetComponent(Scene);
  scene.RegisterShow(ShowBird);

  birdLayerMask = LayerMask.GetMask(["Bird"]);

  rigidbody2D.velocity = Vector2.zero;
  
  birdSprite = Instantiate(birdSpritePrefab, transform.position, Quaternion.identity);
  animator  = birdSprite.GetComponent(Animator);

  StartCoroutine("BirdBehavior");
}

function Update ()
{
  //Debug.Log("change of: " + Time.deltaTime);

  birdSprite.transform.position = transform.position;
}

function FixedUpdate()
{
  var newRotation : float;
  var forceVector : Vector2;
  //rigidbody2D.velocity = speed * Vector2.Lerp(rigidbody2D.velocity, steerVector, Time.fixedDeltaTime).normalized;
  
  //by velocity
  //rigidbody2D.velocity.Normalize();
  //rigidbody2D.velocity = Vector2.Lerp(rigidbody2D.velocity, steerVector, Time.fixedDeltaTime);
  //rigidbody2D.velocity *= speed;

  //by rotation
  newRotation = Mathf.LerpAngle(rigidbody2D.rotation, Mathf.Rad2Deg * vectToRad(steerVector), Time.fixedDeltaTime);

  rigidbody2D.MoveRotation(newRotation);

  //forceVector = Vector2(Mathf.Sin(Mathf.Deg2Rad * newRotation), Mathf.Cos(Mathf.Deg2Rad * newRotation)) * speed;
  //Debug.Log("rotation = " + newRotation + ", force = " + forceVector);
  //rigidbody2D.AddForce(forceVector * Time.fixedDeltaTime);
 
  //rigidbody2D.velocity.Normalize();
  //rigidbody2D.velocity = Vector2.Lerp(rigidbody2D.velocity, steerVector, Time.fixedDeltaTime);
  //rigidbody2D.velocity *= speed;
  
  rigidbody2D.MovePosition(rigidbody2D.position + Time.fixedDeltaTime * moveSpeed * Rotate2D(Vector2.right, rigidbody2D.rotation));
}

function setAnimation()
{
  var xDirection : float = 1;
  var yDirection : float = 1;
  var rotation : float = rigidbody2D.rotation % 360;
  var frameTime : float;
  var animationIndex : int = 0;

  //frameTime = animator.animation[animationName].time;
  if (rotation < 0)
  {
    rotation = 360 + rotation;
  }
  
  animationIndex = Mathf.FloorToInt(rotation / 30);

  animationName = animationNames[animationIndex];

  animator.Play(animationName);
  //animator.animation[animationName].time = frameTime;

  if (rotation > 90 && rotation < 270)
  {
    xDirection = -1;
  }
  transform.localScale.x = Mathf.Abs(transform.localScale.x) * xDirection;

  if (rotation > 240 && rotation < 300)
  {
    yDirection = -1;
  }
  transform.localScale.y = Mathf.Abs(transform.localScale.y) * yDirection;

  behavior.state = BehaviorStatus.SUCCEED;
}

function BirdBehavior()
{
  behavior.repeater(ApplyBirdAction);
  //Debug.Log("Bird Behavior ended! Time is " + Time.time);
}

function ApplyBirdAction()
{
  behavior.tick(BirdAction, 25);
}

function BirdAction()
{
  behavior.sequence([setAnimation, findNeighbors, cohesion, alignment, separation, towardsGoal, steer]);
}

function steer()
{
  steerVector = Vector2.zero;

  steerVector += cohesionVector;
  steerVector += separationVector;
  steerVector += alignmentVector;
  steerVector += towardsGoalVector;

  steerVector.Normalize();

  behavior.state = BehaviorStatus.SUCCEED;
}

function towardsGoal()
{
  towardsGoalVector = flock.goal.position - transform.position;
  towardsGoalVector.Normalize();
  towardsGoalVector *= flock.flockGoalScale;

  behavior.state = BehaviorStatus.SUCCEED;
}

function cohesion()
{
  cohesionVector = (centroid - rigidbody2D.position);
  cohesionVector.Normalize();
  cohesionVector *= flock.flockCohesionScale;

  behavior.state = BehaviorStatus.SUCCEED;
}

function alignment()
{

  alignmentVector = Vector2.zero;

  if (numNeighbors > 0)
  {
    for (var neighborIndex = 0; neighborIndex < numNeighbors; neighborIndex += 1)
    {
      alignmentVector += neighbors[neighborIndex].rigidbody2D.velocity;
    }
    alignmentVector /= numNeighbors;
  }

  alignmentVector.Normalize();
  alignmentVector *= flock.flockAlignmentScale;

  behavior.state = BehaviorStatus.SUCCEED;
}

function separation()
{
  var sepVect : Vector2 = Vector2.zero;
  var dist : float = 0;

  separationVector = Vector2.zero;

  if (numNeighbors > 0)
  {
    for (var neighborIndex = 0; neighborIndex < numNeighbors; neighborIndex += 1)
    {
      sepVect = rigidbody2D.position - neighbors[neighborIndex].rigidbody2D.position;
      dist = sepVect.magnitude;
      if (dist == 0)dist = 0.000001; //replace 0 with a small number;
      separationVector += (sepVect / Mathf.Pow(dist, 2));
    }
    separationVector /= numNeighbors;
  }
  
  separationVector.Normalize();
  separationVector *= flock.flockSeparationScale;

  behavior.state = BehaviorStatus.SUCCEED;
}

function OnDrawGizmos()
{
  /*
  Gizmos.color = Color.white;
	Gizmos.DrawWireSphere(transform.position, viewRadius);

  Gizmos.color = Color.red;
  Gizmos.DrawLine(transform.position, transform.position + (1 * Utilities.vector2To3(rigidbody2D.velocity)));

  Gizmos.color = Color.yellow;
  Gizmos.DrawLine(transform.position, transform.position + (1 * Utilities.vector2To3(cohesionVector)));

  Gizmos.color = Color.blue;
  Gizmos.DrawLine(transform.position, transform.position + (1 * Utilities.vector2To3(separationVector)));

  Gizmos.color = Color.green;
  Gizmos.DrawLine(transform.position, transform.position + (1 * Utilities.vector2To3(alignmentVector)));

  Gizmos.color = Color.magenta;
  Gizmos.DrawLine(transform.position, transform.position + (1 * Utilities.vector2To3(towardsGoalVector)));

  Gizmos.color = Color.cyan;
  Gizmos.DrawLine(transform.position, transform.position + (1 * Utilities.vector2To3(Rotate2D(Vector2.right, rigidbody2D.rotation))));

  //Debug.DrawLine(transform.position, transform.position + (Utilities.vector2To3(steerVector)), Color.red);
  */
}

function findNeighbors()
{
  numNeighbors = Physics2D.OverlapCircleNonAlloc(rigidbody2D.position, viewRadius, neighbors, birdLayerMask);

  centroid = Vector2.zero;

  if (numNeighbors > 0)
  {
    for (var neighborIndex = 0; neighborIndex < numNeighbors; neighborIndex += 1)
    {
      centroid += neighbors[neighborIndex].rigidbody2D.position;
    }
    centroid /= numNeighbors;
  }

  behavior.state = BehaviorStatus.SUCCEED;
}

function ShowBird()
{
  var str : String = "";

  //str = "Bird: num neighbors = " + numNeighbors;
  //str +=  ", co = " +  cohesionVector;
  //str +=  ", sep = " + separationVector;
  //str +=  ", align = " + alignmentVector;
  
  //str =  "Bird: rotation = " + rigidbody2D.rotation;
  //str += ", steer rotation = " + Mathf.Rad2Deg * Mathf.Atan2(steerVector.y, steerVector.x);
  //str += ", velocity = " + rigidbody2D.velocity;
  //str = animationName;
  //str += ", rotation = " + rigidbody2D.rotation;

  return str;
}

