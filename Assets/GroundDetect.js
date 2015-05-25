#pragma strict

var grounded : boolean;
var ground : GameObject;

function Start ()
{
  grounded = false;
}

function Update ()
{

}

function OnTriggerEnter2D(other : Collider2D)
{
  if (other.gameObject.tag == "Ground")
  {
    grounded = true;
    ground = other.gameObject;
  }
}

function OnTriggerStay2D(other : Collider2D)
{
  if (other.gameObject.tag == "Ground")
  {
    grounded = true;
    ground = other.gameObject;
  }
}

function OnTriggerExit2D(other : Collider2D)
{
  if (other.gameObject.tag == "Ground")
  {
    grounded = false;
  }
}

