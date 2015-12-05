var parallelProcesses = require("../")

var doublerModulePath = __dirname + "/doubler.js"


/* Make three separate node processes that handle doubling requests. Thus, only three
|| numbers can be being doubled at the same time. The amount can be increased to
|| make it faster, as long as you have that many processors.
*/
var manager = new parallelProcesses(doublerModulePath, 3)

var numbers = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]

/* Double all of the numbers. Keep in mind this is asynchronous, so they arrive
|| in different order than they where sent in.
*/
numbers.forEach(function(element){
    manager.run(element, function(reponse){
        console.log( element + " doubled is " + reponse)
    })
})

/* By default, the process manager does not kill it's processes when it's the only
|| task in the event loop, so we kill it manually after 5 seconds.
*/

setTimeout(manager.kill.bind(manager), 1000 * 5)