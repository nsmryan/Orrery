#pragma strict

private var animator : Animator;
var animationName : String;

function Start ()
{
  animator = gameObject.GetComponent(Animator);
  //StartCoroutine("PlayAnimation");
}

function PlayAnimation()
{
  var time : int = 1;

  Debug.Log("Printing states");
  for (var state : AnimationState in animation)
  {
    Debug.Log(state);
  }
  while (true)
  {
    animation[animationName].time = time;
    animation[animationName].speed = 0.0;
    animation.Play(animationName);

    Debug.Log("time = " + time);
    yield new WaitForSeconds(1);
    time += 1;
  }
}

function Update ()
{
  //animator.animation[animationName].time = (animator.animation[animationName].time + 1) % 10;
}
