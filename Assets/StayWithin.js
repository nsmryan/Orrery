#pragma strict

var withinOffsetX : float = 0.0;
var withinOffsetY : float = 0.0;

//var target : GameObject = null;
//var targetTransform : Transform = null;
//var texture : Texture2D = null;
//var spriteRenderer : SpriteRenderer = null;

function Start ()
{
  //if (target != null)
  //{
  //  targetTransform = target.transform;
  //  spriteRenderer = target.GetComponent(SpriteRenderer);
  //  texture = spriteRenderer.sprite.texture;
  //}
}

function Update ()
{
  //if (target != null)
  //{
  //  transform.position.x = Mathf.Clamp(transform.position.x, targetTransform.position.x, targetTransform.position.x + texture.width);
  //  transform.position.y = Mathf.Clamp(transform.position.y, targetTransform.position.y, targetTransform.position.y + texture.height);
  //}
  transform.position.x = Mathf.Clamp(transform.position.x, -250, 250);
  transform.position.y = Mathf.Clamp(transform.position.y, -20, 20);
}
