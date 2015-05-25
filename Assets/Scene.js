#pragma strict

@script ExecuteInEditMode()

static var scene : Scene = null;

var planets : Array = new Array();

var showCallbacks : Array = new Array();

var mainCameraBody : Rigidbody2D;

var player : GameObject;


function addPlanet(planet : Planet)
{
  planets.Push(planet);
}

function GravityAt(point : Vector2) : Vector2
{
  var currentGravityForce : Vector2 = Vector2.zero;
  for (var planet : Planet in planets)
  {
    currentGravityForce += planet.forceOn(point);
  }
  return currentGravityForce;
}

function Start ()
{
  mainCameraBody = GameObject.Find("MainCamera").GetComponent(Rigidbody2D);

  if (player == null)
  {
    Debug.LogError("Scene does not have a player assigned");
  }

  if (scene != null)
  {
    Debug.LogError("There is more then one Scene object!");
  }
  scene = this;

  RegisterShow(ShowScene);
}

function Update ()
{
}

function RegisterShow(show : Function)
{
  showCallbacks.Push(show);
}

function OnGUI()
{
  var text : String;
  var yPos = 10;
  var callbacks : Function[];

  callbacks = showCallbacks.ToBuiltin(Function);
  for (var show : Function in callbacks)
  {
    text = show();
    GUI.Label (Rect (10, yPos, 1000, yPos + 10), text);
    yPos += 15;
  }
}

function OnDrawGizmos()
{
  Gizmos.color = Color.yellow;
	Gizmos.DrawWireSphere(Camera.main.ScreenToWorldPoint(Input.mousePosition), 0.5);
}

function ShowScene() : String
{
  var str : String = "";


  return str;
}

