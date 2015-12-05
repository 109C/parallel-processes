//

// A simple wrapper around the module that contains the code is wanted to be run in
// another thread, so that porting is simpler.


process.once('message', function(ChildPath){
    var ChildMain = require(ChildPath)
    
    process.on('message', function(Message){
        try{
            var Answer = ChildMain(Message)
            process.send(Answer)
        }catch(e){
            // In case the error is caught using some weird hack.
            process.nextTick(function(){
                process.exit()
            })
            throw e;
        }
    })
})