#pragma strict

@script ExecuteInEditMode()

var radius : double = 5;
var mass = 15;
var gravitationalConstant : double = 1;

var gravityForce : double = 0;

function Start ()
{
  var scene : Scene = GameObject.Find("Scene").GetComponent(Scene);
  scene.addPlanet(this);
}

function Update ()
{
}

function forceOn(point : Vector2) : Vector2
{
  var distance : double;
  var direction : Vector2;
  var force : Vector2 = Vector2.zero;

  direction = Vector3.Normalize(transform.position - point);
  
  distance = Vector2.Distance(transform.position, point);

  //force = gravitationalConstant * direction * (mass / Mathf.Pow(distance, 2));
  if (distance < radius * 5)
  {
    force =  gravitationalConstant * direction * mass;
  }

  return force;
}

function OnDrawGizmos()
{
  Gizmos.color = Color.black;
  Gizmos.DrawSphere(transform.position, radius);
}

