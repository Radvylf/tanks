(() => {
    class Conn extends require("events").EventEmitter {
        constructor(ws_conn, conn_info) {
            super();
            
            this.ws_conn = ws_conn;
            this.protocol = ws_conn.protocol;
            this.conn_info = conn_info;
            
            ws_conn.on("message", (data) => {
                this.emit("data", data);
            });
            
            ws_conn.on("close", () => {
                this.emit("disconn");
            });
        }
        
        data(data) {
            this.ws_conn.send(JSON.stringify(data));
        }
        
        disconn(n = 1002, ...info) {
            this.ws_conn.close(n, ...info);
        }
    }
    
    module.exports = (...x) => new Conn(...x);
})();