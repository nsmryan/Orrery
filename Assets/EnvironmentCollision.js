#pragma strict


function Start ()
{
  var parentTransform : Transform;

  parentTransform = GetComponentInParent(Transform);

  transform.position = parentTransform.position;
  transform.rotation = parentTransform.rotation;
  
  transform.localScale = Vector3.one;

}

function Update ()
{

}
