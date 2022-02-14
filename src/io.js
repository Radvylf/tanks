(() => {
    var io = require("readline").createInterface({
        input: process.stdin,
        output: process.stdout
    });
    
    var input = () => new Promise((r) => io.question("$ ", r));
    
    var run;
    
    while (1) {
        run = (await input()).trim();
        
        try {
            
        } catch (info) {
            console.log(info);
        }
    }
})();