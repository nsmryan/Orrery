#pragma strict

@script RequireComponent(DistanceJoint2D)

//try applying even force to all joints like real wind

//var hingeJoint2d : HingeJoint2D;
var distJoint2d : DistanceJoint2D;

var motorSpeed : float = 100;

var randomForce : float = 10;

//var motorSpeeds : Array = new Array();
//var firValues : float[] = [1.0];
//var firValues : float[] = [0.1, 0.2, 0.3, 0.4];
//var filteredSpeed : double = 0;

var strands : GameObject[];
//var hinges  : HingeJoint2D[];
var joints  : DistanceJoint2D[];

var lastUpdateTime : float = 0;
var updateDelay : float = 0.1;

var numLinks : int = 5;

var strandPrefab : GameObject;

var windForce : Vector2 = Vector2.zero;

function Start ()
{
  var strandObj : GameObject;
  var strand    : StrandPiece;
  //var strandHinge : HingeJoint2D;
  var strandDist  : DistanceJoint2D;
  var prevBody  : Rigidbody2D;
  //var prevHinge : HingeJoint2D;
  var prevDist : DistanceJoint2D;
  var length : float = renderer.bounds.size.x;
  var mid    : float = renderer.bounds.extents.x;
  var positionOffset : Vector2 = Vector2(length, 0);
  var offset : Vector2 = Vector2(mid, 0);

  strands = new GameObject[numLinks];
  //hinges  = new HingeJoint2D[numLinks];
  joints  = new DistanceJoint2D[numLinks];

  //hingeJoint2d = gameObject.GetComponent(HingeJoint2D);
  //hingeJoint2d.useMotor = true;

  distJoint2d = gameObject.GetComponent(DistanceJoint2D);

  lastUpdateTime = Time.time;

  //Initialize motor speeds
  //motorSpeeds.Push(0);
  //motorSpeeds.Push(0);
  //motorSpeeds.Push(0);
  //motorSpeeds.Push(0);

  GameObject.Find("Scene").GetComponent(Scene).RegisterShow(ShowStrandHead);

  //Instantiate the other links
  prevBody = rigidbody2D;
  //prevHinge = gameObject.GetComponent(HingeJoint2D);
  prevDist = gameObject.GetComponent(DistanceJoint2D);

  for (var linkIndex = 0; linkIndex < numLinks; linkIndex += 1)
  {
    strandObj = Instantiate(strandPrefab);

    strands[linkIndex] = strandObj;
    joints[linkIndex] = strandObj.GetComponent(DistanceJoint2D);
    //hinges[linkIndex] = strandObj.GetComponent(HingeJoint2D);

    strand = strandObj.GetComponent(StrandPiece);
    strandDist  = strandObj.GetComponent(DistanceJoint2D);
    strandObj.rigidbody2D.position = rigidbody2D.position - positionOffset * linkIndex;

    //strandHinge = strandObj.GetComponent(HingeJoint2D);

    strandDist.connectedBody = prevBody;
    strandDist.anchor = -offset;
    strandDist.connectedAnchor = offset;
    strandDist.distance = 0;

    //strandDist.anchor          = strandHinge.anchor;
    //strandDist.connectedAnchor = strandHinge.connectedAnchor;
    //strandDist.distance        = 0;

    prevBody = strandObj.rigidbody2D;
    prevDist = strandDist;
  }
}

function FixedUpdate ()
{
  var newSpeed : double;
  var speedArr : double[];
  //var previousSpeed : double = 0;

  //TODO replace with a coroutine
  if ((Time.time - lastUpdateTime) > updateDelay)
  {
    //newSpeed = Random.Range(-motorSpeed, motorSpeed);
    //if (motorSpeeds.length > 0) motorSpeeds.RemoveAt(0);
    //motorSpeeds.Push(newSpeed);
    //lastUpdateTime = Time.time;

    //speedArr = motorSpeeds.ToBuiltin(double) as double[];

    //filteredSpeed = 0;
    //for (var speedIndex : int = 0; speedIndex < motorSpeeds.length; speedIndex += 1)
    //{
     // filteredSpeed += firValues[speedIndex] * speedArr[speedIndex];
    //}

    //hingeJoint2d.motor.motorSpeed = filteredSpeed;
    //rigidbody2D.AddForce(Vector2(1000, 1000));
    //previousSpeed = filteredSpeed;
    for (var strand : GameObject in strands)
    {
      //change joint torque
      windForce = Vector2.Lerp(windForce,
                               Vector2(Random.Range(-randomForce, randomForce), Random.Range(-randomForce, randomForce)),
                               Time.fixedDeltaTime);
      strand.rigidbody2D.AddForce(windForce);
      //previousSpeed = hinge.motor.motorSpeed * 1.1;
    }
  }
}

function ShowStrandHead()
{
  var str : String;

  //str = "StrandHead: speed = " +  filteredSpeed + " array of " + motorSpeeds;
  //str = "StrandHead: " + renderer.bounds.size.x; 

  return str;
}

