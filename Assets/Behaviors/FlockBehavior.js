#pragma strict

@script RequireComponent(Behavior)
@script RequireComponent(Rigidbody2D)

//private var scene : Scene;
private var scene : Scene;
private var behavior : Behavior;
private var flocking : Flocking;

var moveSpeed : float = 5;
var viewDistance : float = 15;
var attackDistance : float = 7;
var steerVector : Vector2 = Vector2.zero;
var turnSpeed : float = 1;
var movePastDistance : float = 15;

var seekPlayerScaler  : float = 1;
var abovePlayerScaler : float = 1;
var fleePlayerScaler  : float = 1;
var diveBombDistance  : float = 1;

private var playerRigidBody : Rigidbody2D;

private var playerDistance : float = 0;

function Start ()
{
  scene = GameObject.Find("Scene").GetComponent(Scene);
  if (scene == null)
  {
    Debug.LogError("Scene not found by FlockBehavior");
  }
  playerRigidBody = scene.player.rigidbody2D;

  behavior = gameObject.GetComponent(Behavior);

  StartCoroutine("FlockBehavior");
}

function FixedUpdate ()
{
  var newRotation : float;
  var movement : Vector2;
  
  newRotation = Mathf.LerpAngle(rigidbody2D.rotation, Mathf.Rad2Deg * vectToRad(steerVector), turnSpeed * Time.fixedDeltaTime);

  movement = Time.fixedDeltaTime * moveSpeed * rad2Vect(Mathf.Deg2Rad * newRotation);
  //Debug.Log("steerVector = " + (Mathf.Rad2Deg * vectToRad(steerVector)) + ", rot = " + rigidbody2D.rotation + ", newRotation = " + newRotation + ", movement = " + movement);

  rigidbody2D.MoveRotation(newRotation);
  rigidbody2D.MovePosition(rigidbody2D.position + movement);
}

function seePlayerP()
{
  playerDistance = Vector2.Distance(rigidbody2D.position, playerRigidBody.position);
  if (playerDistance < viewDistance)
  {
    behavior.state = BehaviorStatus.SUCCEED;
  }
  else
  {
    behavior.state = BehaviorStatus.FAILURE;
  }
}

function seekPlayer()
{
  steerVector += seekPlayerScaler * (playerRigidBody.position - rigidbody2D.position).normalized;

  behavior.state = BehaviorStatus.SUCCEED;
}

function fleePlayer()
{
  steerVector += fleePlayerScaler * (rigidbody2D.position - playerRigidBody.position).normalized;

  behavior.state = BehaviorStatus.SUCCEED;
}

function getAbove()
{
  var result : BehaviorStatus = BehaviorStatus.FAILURE;
  var targetPosition = playerRigidBody.position - scene.GravityAt(playerRigidBody.position).normalized;

  var towardsTarget = targetPosition - rigidbody2D.position;
  
  if (Vector2.Distance(targetPosition, rigidbody2D.position) < attackDistance &&
      rigidbody2D.GetVector(towardsTarget).y < 0)
  {
    behavior.state = BehaviorStatus.SUCCEED;
  }

  behavior.state = result;
}

function aboveP()
{
  var result : BehaviorStatus = BehaviorStatus.FAILURE;
  var targetPosition = playerRigidBody.position - scene.GravityAt(playerRigidBody.position).normalized;
  var targetVector : Vector2 = targetPosition - rigidbody2D.position;

  if (targetVector.y < 0)
  {
    result = BehaviorStatus.SUCCEED;
  }

  behavior.state = result;
}

function closedInOn()
{
  if (Vector2.Distance(playerRigidBody.position, rigidbody2D.position) < diveBombDistance)
  {
    behavior.state = BehaviorStatus.FAILURE;
  }
  else
  {
    behavior.state = BehaviorStatus.SUCCEED;
  }
}

function movePast()
{
  var result : BehaviorStatus = BehaviorStatus.SUCCEED;

  if (Vector2.Distance(rigidbody2D.position, playerRigidBody.position) < movePastDistance)
  {
    result = BehaviorStatus.FAILURE;
  }
  else
  {
    Debug.Log("dist = " + Vector2.Distance(rigidbody2D.position, playerRigidBody.position));
  }
 
  behavior.state = result;
}

function fightingBehavior()
{
  behavior.sequence([seePlayerP, attackPlayer]);
}

function attackPlayer()
{
  var positionAttack : Function = function() { behavior.sequence([aboveP, getAbove]); };
  var diveBomb       : Function = function() { behavior.sequence([seekPlayer, closedInOn]); };

  yield behavior.until(positionAttack);
  Debug.Log("positioned");

  yield behavior.until(diveBomb);
  Debug.Log("dived");

  yield behavior.until(movePast);
  Debug.Log("past");
}

function ApplyFlockAction()
{
  var wanderingBehavior : Function = function () { behavior.sequence([moveRightBehavior]); };
  
  steerVector = Vector2.zero;

  behavior.selector([fightingBehavior, wanderingBehavior]);
  steerVector.Normalize();
}

function moveRightBehavior()
{
  steerVector += Rotate2D(Vector2.right, rigidbody2D.rotation);
  behavior.state = BehaviorStatus.SUCCEED;
}

function FlockBehavior()
{
  yield behavior.repeater(ApplyFlockAction);
  //Debug.Log("Flock Behavior ended! Time is " + Time.time);
}

