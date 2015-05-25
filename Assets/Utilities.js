#pragma strict


static function vector2To3(vect2 : Vector2)
{
  return Vector3(vect2.x, vect2.y, 0);
}
static function vector3To2(vect2 : Vector2)
{
  return Vector2(vect2.x, vect2.y);
}

static function vectToRad(vect : Vector2)
{
  return Mathf.Atan2(vect.y, vect.x);
}

static function rad2Vect(rads : float)
{
  return Vector2(Mathf.Cos(rads), Mathf.Sin(rads));
}

static function ensureFound(nam : String, obj : GameObject)
{
  if (obj == null)
  {
    Debug.LogError(nam + " was not found");
  }
}

static function Rotate2D(v : Vector2, degrees : float) : Vector2
{
  return Quaternion.Euler(0, 0, degrees) * v;
}

static function modulo(dividend : int, divisor : int) : int
{
  return (((dividend) % divisor) + divisor) % divisor;
}

