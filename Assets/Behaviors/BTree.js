#pragma strict

var returnStack : Array;

var paramStack : Array;

var focus;


function Start ()
{

}

function Update ()
{

}

/*


repeater(selector(leaf(run), leaf(walk), leaf(jump), sequence(leaf(fall), leaf(stand), leaf(idle))))

node = function + [nodes]

repeater function takes singleton list and runs it
never pops itself off, or puts itself back on

selector function takes paramStack an runs until returns SUCCEED


enter function takes node, puts function on rs, children on paramStack


tick function take rs an ps and calls rs(ps)
if YIELD
  yield
if YIELDTime
  yield new WaitForTime
if CONTINUE
  loop
 


*/
