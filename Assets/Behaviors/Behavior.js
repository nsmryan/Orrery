#pragma strict


//consider tree data structure so you can make miny trees and add them to larger tree in functions

enum BehaviorStatus
 {
   TICKING,
   SUCCEED,
   FAILURE
 }

@HideInInspector
var state : BehaviorStatus = BehaviorStatus.SUCCEED;


function sequence(nodes : Function[])
{
  state = BehaviorStatus.SUCCEED;

  for (var node in nodes) 
  {
    node();

    if (state == BehaviorStatus.FAILURE)
    {
      break;
    }
  }
}

function repeater(node : Function) { return repeater(node, -1); }
function repeater(node : Function, repeats : int)
{
  var repeat = 0;

  state = BehaviorStatus.SUCCEED;

  while (repeat != repeats)
  {
    node();

    if (repeats != -1)
    {
      repeat += 1;
    }

    if (state == BehaviorStatus.FAILURE)
    {
      break;
    }

    yield;
  }
}

function fixedRepeater(node : Function) { return repeater(node, -1); }
function fixedRepeater(node : Function, repeats : int)
{
  var repeat = 0;

  state = BehaviorStatus.SUCCEED;

  while (repeat != repeats)
  {
    node();

    if (repeats != -1)
    {
      repeat += 1;
    }

    if (state == BehaviorStatus.FAILURE)
    {
      break;
    }

    yield new WaitForFixedUpdate();
  }
}

function until(node : Function)
{
  yield repeater(invertBehavior(node));
}

function wait(steps : int)
{
  for (var i = 0; i < steps; i += 1)
  {
    yield;
  }
}

function selector(nodes : Function[])
{
  state = BehaviorStatus.FAILURE;

  for (var node in nodes)
  {
    node();
    if (state == BehaviorStatus.SUCCEED)
    {
      break;
    }
  }
}

function tick(node : Function, ticks : int)
{
  var result : BehaviorStatus = BehaviorStatus.SUCCEED;
  for (var tick = 0; tick < ticks; tick += 1)
  {
    yield;
  }
  node();
}

function succeeder()
{
  state = BehaviorStatus.SUCCEED;
}

function failer()
{
  state = BehaviorStatus.FAILURE;
}

function times(runTimes : int, node : Function)
{
  for (var i : int = 0; i < runTimes; i += 1)
  {
    node();
    if (state == BehaviorStatus.FAILURE)
    {
      break;
    }
    yield;
  }
}

function invertBehavior(node : Function) : Function
{
  var f : Function = function()
  {
    node();
    if (state == BehaviorStatus.SUCCEED)
    {
      state = BehaviorStatus.FAILURE;
    }
    else if (state == BehaviorStatus.FAILURE)
    {
      state = BehaviorStatus.SUCCEED;
    }
  };
  return f;
}

