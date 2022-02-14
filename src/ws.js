(() => {
    var r_ws = require("ws");
    
    class WS extends require("events").EventEmitter {
        constructor(Conn) {
            super();
            
            this.ws = new r_ws.Server({
                port: 8010
            });
            
            this.ws.on("connection", (ws_conn, from) => {
                this.emit("conn", Conn(ws_conn, from.headers["x-forwarded-for"]));
            });
        }
        
        stop() {
            return new Promise((r) => this.ws.close(r));
        }
    }
    
    module.exports = (...x) => new WS(...x);
})();