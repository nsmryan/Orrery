#pragma strict

@script ExecuteInEditMode()
 
private var scene : Scene;
private var currentGravityForce  = Vector2.zero;
var orientEnabled : boolean = true;
var orientSpeed : float = 1.0;

function Awake()
{
  scene = GameObject.Find("Scene").GetComponent(Scene);
}

function Start ()
{

}

//function OnRenderObject()
function Update()
{
  var planetVector : Vector2 = Vector2.zero;
  var planets : Array = scene.planets;
  var planet : Planet;
  var sourceRotation    : float;
  var targetRotation    : float;
  var targetRotationAlt : float;

  if (orientEnabled)
  {
    currentGravityForce = scene.GravityAt(transform.position);

    if (currentGravityForce.magnitude != 0)
    {
      targetRotation = 90 + Mathf.Rad2Deg * Mathf.Atan2(currentGravityForce.y, currentGravityForce.x);
      //targetRotation = modulo(targetRotation, 360);

      targetRotationAlt = targetRotation - 360;

      sourceRotation = rigidbody2D.rotation;
      //sourceRotation = modulo(rigidbody2D.rotation, 360);

      if (Mathf.Abs(targetRotationAlt - sourceRotation) < Mathf.Abs(targetRotation - sourceRotation))
      {
        //targetRotation = targetRotationAlt; 
      }

      rigidbody2D.MoveRotation(targetRotation);
      //rigidbody2D.MoveRotation(Mathf.Lerp(sourceRotation, targetRotation, orientSpeed * Time.deltaTime));
    }
  }
}

