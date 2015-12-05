//

var child_process = require("child_process")
var os = require("os")

module.exports = function WorkerManager(ChildPath, NumWorkers){
    var NumWorkers = NumWorkers || os.cpus().length
    var Self = this;
    
    this.workers = {}
    this.freeWorkers = {}
    this.pidToCallback = {}
    
    this.run = function(Message, Callback){
        // Wait until we have a free worker, if necessary.
        if(Object.keys(this.freeWorkers).length < 1){
            
            // Wait until there is a free thread.
            var RetryInterval = setInterval(function(){
                if(Object.keys(Self.freeWorkers).length > 0){
                    clearInterval(RetryInterval)
                    Self.forceRun(Message, Callback)
                }
            }, 50)
        }else{
            this.forceRun(Message, Callback)
        }
    }
    
    this.forceRun = function(Message, Callback){
        // Make sure we have a worker available.
        if(Object.keys(this.freeWorkers).length < 1) throw new Error("No free worker thread available");
        
        
        // Select a random worker to use.
        
        var RandomIndex = Math.floor(Math.random() * (Object.keys(this.freeWorkers).length - 1))
        var RandomPid = Object.keys(this.freeWorkers)[RandomIndex]
        var RandomWorker = this.freeWorkers[RandomPid]
        
        // Update the info about whether the worker is being used.
        
        this.pidToCallback[RandomWorker.pid] = Callback
        delete this.freeWorkers[RandomWorker.pid]
        
        RandomWorker.send(Message)
    }
    
    this.kill = function(){
        // Kill all the workers, and prevent any new requests to be made.
        
        Object.keys(this.workers).forEach(function(Key){
            Self.workers[Key].kill()
        })
        var ErrorFunction = function(){
            throw new Error("Cannot run, all the children are dead");
        }
        
        this.run = ErrorFunction
        this.forceRun = ErrorFunction
    }
    
    // Init workers, and add listeners.
    
    for(var i = 0; i < NumWorkers; i++){
        // Closure so there isn't any interaction between iterations.
        (function(){
            var Child = child_process.fork(__dirname + "/ChildLoader.js")
            
            // Tell the child proc where the file it should use is.
            Child.send(ChildPath)
            
            Self.workers[Child.pid] = Child
            Self.freeWorkers[Child.pid] = Child
            
            Child.on('exit', function(){
                delete Self.workers[Child.pid]
                
                // If we where the last one, terminate the manager
                if(Object.keys(Self.workers).length < 1){
                    Self.kill()
                }
            })
            
            Child.on('message', function(Message){
                Self.pidToCallback[Child.pid](Message)
                delete Self.pidToCallback[Child.pid]
                
                Self.freeWorkers[Child.pid] = Child
            })
        })();
    }
}