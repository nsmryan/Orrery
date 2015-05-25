#pragma strict

//var hingeJoint2d : HingeJoint2D;
var distJoint2d : DistanceJoint2D;

var scene : Scene;

function Start ()
{
  //hingeJoint2d = gameObject.GetComponent(HingeJoint2D);
  distJoint2d = gameObject.GetComponent(DistanceJoint2D);
  scene = GameObject.Find("Scene").GetComponent(Scene);
  scene.RegisterShow(ShowStrandPiece);
}

function FixedUpdate ()
{
}

function ShowStrandPiece() : String
{
  var str : String;
    
  str = "Strand: x = " + transform.position.x.ToString("#.000") + ", y = " + transform.position.y.ToString("#.000");
  str = "";

  return str;
}

//function OnDrawGizmos()
//{
//  Gizmos.color = Color.white;
//  Gizmos.DrawSphere(transform.position, 0.1);
//}
