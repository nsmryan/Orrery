#pragma strict

private var groundDetector : GroundDetect;

function Start ()
{
  groundDetector = GameObject.Find("GroundDetector").GetComponent(GroundDetect);
  StartCoroutine("FireBall");
}

function FireBall()
{
  yield new WaitForSeconds(5);
  Destroy(gameObject);
}

function Update ()
{
  if (groundDetector.grounded)
  {
    Destroy(gameObject);
  }
}

