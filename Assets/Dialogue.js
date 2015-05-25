#pragma strict

var script : String[];
var player : Transform;
var waitSeconds : int = 5;
var startDistance : int = 100;

private var lineNumber = 0;
private var currentText : String = "";
private var dialogueDone = false;

function Start ()
{
  script =
      ["Hello, Stranger.", " Yes, the river has run dry, my old friend.",
       " It doesnt help to ask questions. ",
       "Its just that things are shifting, they always are. ",
       "We will be ok, there will be other rivers. ",
       "Things fall apart, you know, thats how it is. ",
       "It doesnt help to be impatient. ",
       "There will be other rivers. ",
       "There are more rivers, too, up above us, if you must go. ",
       "I feel that this is important to you. ",
       "If you must go, then perhaps it is time. ",
       "It is time now, yes, I think so. ",
       "Here, take my old gloves. ",
       "They will let you find what you are looking for. ",
       "Oh, dont worry, it will rain again, like the night you first came here. ",
       "It will rain in torrents and sheets until you will wish it had never started raining. ",
       "There are cycles to this world, still.  ",
       "The fishing is slow again today. ",
       "Didnt I tell you, there are other rivers. ", 
       "feel that I should be able too I used to know how  ",
       "It is a sad day if you must go. ",
       "Be careful, old Stranger, old friend. ",
       "Watch the cycles, we all move between them.  ",
       "I told you that it doesnt help to ask questions."];

  StartCoroutine("Dialogue");
}

function Dialogue()
{
  var dist : float = Vector3.Distance(player.position, transform.position);
  Debug.Log("dialogue length of " + script.length);
  while (dist > startDistance)
  {
    Debug.Log("waiting at dist = " + dist);
    yield new WaitForSeconds(1);
  }
  Debug.Log("within, dist is " + dist);

  for (var line : String in script)
  {
    currentText = line;
    yield new WaitForSeconds(waitSeconds);
  }
  currentText = "";
  dialogueDone = true;
}

function OnGUI ()
{
  var textPos : Vector3;
  
  if (!dialogueDone)
  {
    textPos = Camera.main.WorldToScreenPoint(transform.position);
    GUI.Label (Rect (textPos.x, Screen.height - textPos.y, 1000, 200), currentText);
  }
}

