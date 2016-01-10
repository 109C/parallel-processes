# What is parallel processes

A simple framework to make running more than one piece of javascript at a time.

# Installation

Just download it and require it. That's all, there's no external dependencies.

# Example usage

```
var parallelProcesses = require('parallel-processes')

var parallel = new parallelProcesses("path/to/module")

parallel.run(parameterToModule, function(response){
  console.log(response)
})
```

You can find a more in depth examples in the examples directory.