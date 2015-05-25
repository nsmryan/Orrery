#pragma strict

var flockElement : GameObject;
var flockSize : int = 10;

var flockRadius : float = 3;

var behavior : Behavior;

var flockCohesionScale   : float = 1.0;
var flockSeparationScale : float = 1.0;
var flockAlignmentScale  : float = 1.0;
var flockGoalScale       : float = 1.0;

var goal : Transform;

function Start ()
{
  var flockIndividual : GameObject;
  var initialX : float = 0.0;
  var initialY : float = 0.0;

  behavior = gameObject.GetComponent(Behavior);

  for (var elementIndex = 0; elementIndex < flockSize; elementIndex += 1)
  {
    initialX = Random.Range(-flockRadius, flockRadius);
    initialY = Random.Range(-flockRadius, flockRadius);
    flockIndividual = Instantiate(flockElement, transform.position + Vector3(initialX, initialY, 0), Quaternion.identity);
    flockIndividual.GetComponent(BirdBehavior).flock = this;
  }

  goal = transform;
}

function OnDrawGizmos()
{
  Gizmos.color = Color.magenta;
	Gizmos.DrawWireSphere(transform.position, 0.2);
}

function Update ()
{
}

