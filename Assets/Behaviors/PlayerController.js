#pragma strict

@script RequireComponent(Behavior)
@script RequireComponent(BoxCollider2D)
@script RequireComponent(Animator)


import Utilities;
import Behavior;

enum PlayerAction
 {
   STAND,
   JUMP,
   RUN,
   BOOST,
   HOVER,
   FALL
 }


private var scene : Scene;
private var behavior : Behavior;
private var animator : Animator;

private var controlVector : Vector2 = Vector2.zero;
private var movementVector : Vector2 = Vector2.zero;
private var fireVector    : Vector2 = Vector2.zero;

private var playerAction : PlayerAction = PlayerAction.FALL;

var hoverTurnSpeed : float = 5;

var thrusterForce : double = 3000;
var hoverForce : double = 100;
var tiltHoverForce : double = 10;
var jumpForce : float = 100;
var hoverEscapeGround : float = 10;

var orientation : float;
var movingTurnSpeed   : float = 1.5;
var runSpeed : float = 5;
var fallingSpeed : float = 500;

private var currentThrusterForce = Vector2.zero;
private var currentGravityForce  = Vector2.zero;
private var currentHoverForce    = Vector2.zero;

private var groundDetector : GroundDetect;
private var touchingGround : GroundDetect;
private var grounded : boolean = false;

var hoverBoosters    : GameObject;
var thrusterBoosters : GameObject;

var groundCollision : RaycastHit2D[];
var groundMask : int = 0;

var collision : Collision2D = null;
private var boxCollider : BoxCollider2D;


function Start ()
{
  scene = GameObject.Find("Scene").GetComponent(Scene);
  groundDetector = GameObject.Find("GroundDetector").GetComponent(GroundDetect);

  behavior = gameObject.GetComponent(Behavior);

  animator  = gameObject.GetComponent(Animator);

  scene.RegisterShow(ShowPlayer);
  orientation = 0;

  groundMask = LayerMask.GetMask(["Ground"]);
  groundCollision = new RaycastHit2D[1]; //only get first hit
  boxCollider = GetComponent(BoxCollider2D);

  StartCoroutine("Player");
}

function FixedUpdate ()
{
  var controlRads : float = 0;
  var rotation : float = 0;
  var controlRotation : float = 0;
  var currentTurnSpeed : float = 30; 

  //consider replacing this with behavior tree nodes
  if (!grounded)
  {
    if (controlVector != Vector2.zero)
    {
      controlRads = vectToRad(movementVector);

      if ((currentHoverForce != Vector2.zero) && (controlVector.x != 0))
      {
        //put in hover
        //TODO rad to deg
        rotation = vectToRad(Rotate2D(currentGravityForce, 90)) + ((-1) * Mathf.Sign(controlVector.x) * (Mathf.PI/8));
      }
      else if (Input.GetButton("Booster"))
      {
        //put in boost
        currentTurnSpeed = movingTurnSpeed;

        rotation = controlRads - Mathf.PI/2;
      }
      orientation = Mathf.Deg2Rad * Mathf.LerpAngle(Mathf.Rad2Deg * orientation,
                                                    Mathf.Rad2Deg * rotation,
                                                    currentTurnSpeed * Time.fixedDeltaTime);
    }
  }
}

function clearForces()
{
  currentThrusterForce = Vector2.zero;
  currentGravityForce  = Vector2.zero;
  currentHoverForce    = Vector2.zero;
}

function Update ()
{
}

function verticalP()
{
  var result : BehaviorStatus = BehaviorStatus.FAILURE;

  if (Input.GetButton("Vertical"))
  {
    result = BehaviorStatus.SUCCEED;
  }

  behavior.state = result;
}

function booster()
{
  animator.Play("FlyingAnimation");
  currentThrusterForce = thrusterForce * transform.up;
  applyForce(Time.deltaTime * currentThrusterForce, "booster", Color.yellow);
  playerAction = PlayerAction.BOOST;
  behavior.state = BehaviorStatus.SUCCEED;
}

function boostOn()
{
  var result : BehaviorStatus = BehaviorStatus.FAILURE;

  if (Input.GetButton("Booster") && controlVector != Vector2.zero)
  {
    thrusterBoosters.SetActive(true);
    result = BehaviorStatus.SUCCEED;
  }
  else
  {
    thrusterBoosters.SetActive(false);
  }

  behavior.state = result;
}

function escapeGround()
{
  var upVector : Vector2;

  if (groundDetector.grounded)
  {
    upVector = Vector2(Mathf.Sin(orientation), Mathf.Cos(orientation));
    currentHoverForce += 20 * upVector;
  }
  behavior.state = BehaviorStatus.SUCCEED;
}

function boosting()
{
  behavior.sequence([boostOn, escapeGround, booster]);
}

function stableHover()
{
  var gravityAngle : float = 0;
  
  if (currentGravityForce != Vector2.zero)
  {
    gravityAngle = vectToRad(currentGravityForce);
    orientation = Mathf.Deg2Rad * Mathf.LerpAngle(Mathf.Rad2Deg * orientation,
                                                  Mathf.Rad2Deg * (gravityAngle + Mathf.PI / 2),
                                                  hoverTurnSpeed * Time.deltaTime);
  }
  currentHoverForce += (-1) * rigidbody2D.velocity;
  applyForce(Time.deltaTime * hoverForce * currentHoverForce, "hover", Color.green);
  playerAction = PlayerAction.HOVER;
  behavior.state = BehaviorStatus.SUCCEED;
}

function horizontalP()
{
  var result : BehaviorStatus = BehaviorStatus.FAILURE;

  if (Input.GetButton("Horizontal"))
  {
    result = BehaviorStatus.SUCCEED;
  }

  behavior.state = result;
}

function spriteDirection()
{
  var direction = Mathf.Sign(Input.GetAxis("Horizontal"));
  if (Input.GetAxis("Horizontal") != 0)
  {
    transform.localScale.x  = Mathf.Abs(transform.localScale.x) * direction;
  }
  behavior.state = BehaviorStatus.SUCCEED;
}

function hoverTilt()
{
  var gravVector : Vector2 = currentGravityForce.normalized;
  if (Input.GetAxis("Horizontal") != 0)
  {
    currentHoverForce += Rotate2D(gravVector, 90) * tiltHoverForce * Mathf.Sign(Input.GetAxis("Horizontal"));
  }
  behavior.state = BehaviorStatus.SUCCEED;
}

function hoveringP()
{
  var result : BehaviorStatus = BehaviorStatus.FAILURE;

  if (Input.GetButton("Hover"))
  {
    hoverBoosters.SetActive(true);
    //thrusters are overwritten when hovering.
    thrusterBoosters.SetActive(false);
    result = BehaviorStatus.SUCCEED;
  }
  else
  {
    hoverBoosters.SetActive(false);
  }

  behavior.state = result;
}

function setHoverSprite()
{
  animator.Play("HoveringAnimation");
  behavior.state = BehaviorStatus.SUCCEED;
}

function escapeGroundHover()
{
  var upVector : Vector2;

  if (groundDetector.grounded)
  {
    upVector = Vector2(Mathf.Sin(orientation), Mathf.Cos(orientation));
    currentHoverForce += 20 * upVector;
  }
  behavior.state = BehaviorStatus.SUCCEED;
}

function hovering()
{
  behavior.sequence([hoveringP, setHoverSprite, escapeGroundHover, hoverTilt, stableHover]);
}

function moveToGround()
{
  var result : BehaviorStatus = BehaviorStatus.SUCCEED;
  var newLocation : Vector2;
  var orientationDegrees : float = Mathf.Rad2Deg * orientation;
  var numGroundHits : int = 0;

  //Cast to find ground underneath player.
  numGroundHits = Physics2D.LinecastNonAlloc(rigidbody2D.position,
                                             rigidbody2D.position - Rotate2D(Vector2(0, 2 * boxCollider.bounds.size.y), orientationDegrees),
                                             groundCollision,
                                             groundMask);
  if (numGroundHits > 0 && playerAction != PlayerAction.JUMP)
  {
    orientation = vectToRad(groundCollision[0].normal) - (Mathf.PI / 2);
    orientationDegrees = Mathf.Rad2Deg * orientation;
    newLocation = groundCollision[0].point + Rotate2D(Vector2(0, boxCollider.bounds.extents.y), orientationDegrees);

    Debug.DrawLine(vector2To3(rigidbody2D.position), vector2To3(groundCollision[0].point), Color.magenta);
    Debug.DrawLine(vector2To3(rigidbody2D.position), vector2To3(newLocation), Color.yellow);

    rigidbody2D.position = Vector2.MoveTowards(rigidbody2D.position, newLocation, 0.1);
  }
  if (numGroundHits == 0)
  {
    setGrounded(false);
    result = BehaviorStatus.FAILURE;
  }
  behavior.state = result;
}

function running()
{
  behavior.sequence([horizontalP, run]);
}

function run()
{
  var result : BehaviorStatus = BehaviorStatus.SUCCEED;
  var runLocation : Vector2;
  var downVector : Vector2 = Vector2.zero;
  var orientationDegrees : float = Mathf.Rad2Deg * orientation;
  var numGroundHits : int = 0;

  if (controlVector.x != 0)
  {
    animator.Play("RunAnimation", 0);
    downVector = Rotate2D(Vector2(Mathf.Sin(orientation), Mathf.Cos(orientation)), -90);

    //Cast to see if we can run.
    //numGroundHits = Physics2D.BoxCastNonAlloc(rigidbody2D.position, vector3To2(boxCollider.bounds.size), orientationDegrees, currentGravityForce, groundCollision, groundMask);
    numGroundHits = Physics2D.LinecastNonAlloc(rigidbody2D.position, rigidbody2D.position + Rotate2D(controlVector, orientationDegrees), groundCollision, groundMask);
    Debug.DrawLine(vector2To3(rigidbody2D.position), rigidbody2D.position + Rotate2D(controlVector, orientationDegrees), Color.red);
    if (numGroundHits == 0)
    {
     runLocation = rigidbody2D.position + Rotate2D(controlVector, orientationDegrees);

     rigidbody2D.position = Vector2.MoveTowards(rigidbody2D.position, runLocation, 0.2);

      Debug.DrawLine(vector2To3(rigidbody2D.position), vector2To3(runLocation), Color.white);
    }
    playerAction = PlayerAction.RUN;
  }
  else
  {
    result = BehaviorStatus.FAILURE;
  }
  behavior.state = result;
}

function groundedP()
{
  var result : BehaviorStatus = BehaviorStatus.FAILURE;
  if (grounded)
  {
    result = BehaviorStatus.SUCCEED;
  }
  behavior.state = result;
}

function standing()
{
  animator.Play("StandingAnimation", 0);
  playerAction = PlayerAction.STAND;
  behavior.state = BehaviorStatus.SUCCEED;
}

function playerControls()
{
  var horiz : float = 0;
  var vert  : float = 0;
  var fireHoriz : float = 0;
  var fireVert  : float = 0;
  var planets : Array = scene.planets;
  var planet : Planet;

  controlVector = Vector2.zero;
  clearForces();

  horiz = Input.GetAxis("Horizontal");
  vert = Input.GetAxis("Vertical"); 

  fireHoriz = Input.GetAxis("FireHorizontal");
  fireVert  = Input.GetAxis("FireVertical");
  fireVector = Vector2(fireHoriz, fireVert);

  if ((groundDetector.grounded || playerAction == PlayerAction.JUMP) &&
      !(Input.GetButton("Hover") || (Input.GetButton("Booster") && controlVector != Vector2.zero)))
  {
    setGrounded(true);
  }
  else //if (Input.GetButton("Hover") || Input.GetButton("Booster"))
  {
    setGrounded(false);
  }

  controlVector = Vector2(horiz, vert);
  controlVector = controlVector.normalized;
  movementVector = Rotate2D(controlVector, scene.mainCameraBody.rotation);

  //TODO this needs to get added back in to orient camera at appropriate times
  //scene.mainCameraBody.gameObject.GetComponent(Orient).orientEnabled = !grounded;
  
  currentGravityForce = scene.GravityAt(rigidbody2D.position);

  behavior.state = BehaviorStatus.SUCCEED;
}

function falling()
{
  animator.Play("FallingAnimation", 0);
  rigidbody2D.AddForce(Vector2(Time.deltaTime * fallingSpeed * controlVector.x, 0));
  playerAction = PlayerAction.FALL;
  behavior.state = BehaviorStatus.SUCCEED;
}

function setGrounded(isGrounded : boolean)
{
  grounded = isGrounded;
  if (isGrounded && playerAction != PlayerAction.JUMP)
  {
    rigidbody2D.isKinematic = true;
  }
  else
  {
    rigidbody2D.isKinematic = false;
  }
}

function jumping()
{
  var result : BehaviorStatus = BehaviorStatus.FAILURE;
  var jumpV : Vector2;

  if (Input.GetButton("Jump"))
  {
    if (playerAction == PlayerAction.RUN || playerAction == PlayerAction.STAND)
    {
      jumpV = Rotate2D(Vector2.up, Mathf.Rad2Deg * orientation);
      if (controlVector.x != 0)
      {
        jumpV = Rotate2D(jumpV, (-1) * 45 * Mathf.Sign(controlVector.x));
      }
      rigidbody2D.isKinematic = false;
      rigidbody2D.AddForce(jumpForce * jumpV);
      rigidbody2D.position += rad2Vect(orientation) * 0.5;
    }

    playerAction = PlayerAction.JUMP;
    result = BehaviorStatus.SUCCEED;
  }
  else if (playerAction == PlayerAction.JUMP && !groundDetector.grounded)
  {
    result = BehaviorStatus.SUCCEED;
  }
  else
  {
    result = BehaviorStatus.FAILURE;
  }
  behavior.state = result;
}

function stayGroundedP()
{
  var result : BehaviorStatus = BehaviorStatus.SUCCEED;

  if (Input.GetButton("Hover") || Input.GetButton("Booster"))
  {
    result = BehaviorStatus.FAILURE;
  }

  behavior.state = result;
}

function groundedActions()
{
  var groundSeq : Function = function () { behavior.selector([jumping, running, standing]); };
  behavior.sequence([groundedP, stayGroundedP, groundSeq, moveToGround]);
}

function flyingActions()
{
  //split into select hover, boost and then reorient
  //sequenced with falling
  behavior.selector([hovering, boosting, falling]);
}

function postAction()
{
  if (playerAction == PlayerAction.JUMP ||
      playerAction == PlayerAction.FALL ||
      playerAction == PlayerAction.BOOST)
  {
    applyForce(Time.deltaTime * currentGravityForce, "Gravity", Color.red);
  }
  rigidbody2D.MoveRotation(Mathf.Rad2Deg * orientation);
  behavior.state = BehaviorStatus.SUCCEED;
}

function Player()
{
  var actionSequence : Function = function () { behavior.selector([groundedActions, flyingActions]); };

  var playerSequence : Function = function () { behavior.sequence([playerControls, spriteDirection, actionSequence, postAction]); };

  behavior.repeater(playerSequence);
  //Debug.Log("Player Behavior ended! Time is " + Time.time);
}

function ShowPlayer() : String
{
  var str : String = "";
  str = "Player: ";
  //str += "controlVector = " + controlVector;
  //str += ", orientation = " + orientation;
  //str += ", controlRads = " + vectToRad(controlVector);
  str += ", grounded = " + grounded;
  //str += ", groundDetector = " + groundDetector.grounded;
  return str;
}


function applyForce(force : Vector2, name : String, drawColor : Color)
{
  var forceLineScaler : double = 0.1;
  rigidbody2D.AddForce(force);
  Debug.DrawLine(transform.position, transform.position + (forceLineScaler * Utilities.vector2To3(force)), drawColor);
}

function OnCollisionStay2D(currentCollision : Collision2D)
{
  if (currentCollision.gameObject.tag == "Ground")
  {
    collision = currentCollision;
  }
}

function OnCollisionEnter2D(currentCollision : Collision2D)
{
  if (currentCollision.gameObject.tag == "Ground")
  {
    collision = currentCollision;
  }
}

