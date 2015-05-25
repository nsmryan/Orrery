#pragma strict

var simulateAtStartup : boolean = false;
var simulateTimes : float = 10;
var smallStepTime : float = 1.0;

var maxTimeBetweenPause : float = 10.0;
var maxPauseTime : float = 0.25;

var partEmitters : ParticleEmitter[];

function Start ()
{
  StartCoroutine("ControlParticleSystems");
}

function ControlParticleSystems()
{
  var pauseTime : float = 0;

  if (simulateAtStartup)
  {
    yield new WaitForSeconds(0.01);
    simulateStep();
  }
  while (maxPauseTime != 0)
  {
    pauseTime = Random.Range(0, maxTimeBetweenPause);
    yield new WaitForSeconds(pauseTime);
    for (var em in partEmitters)
    {
      em.emit = false;
    }
    pauseTime = Random.Range(0, maxPauseTime);
    yield new WaitForSeconds(pauseTime);
    for (var em in partEmitters)
    {
      em.emit = true;
    }
  }
}

function simulateStep()
{
  for (var iteration : int = 0; iteration < simulateTimes; iteration += 1)
  {
    for (var em in partEmitters)
    {
      em.Simulate(smallStepTime);
    }
  }
}

