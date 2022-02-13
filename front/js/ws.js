(() => {
    var Tanks = window.Tanks;
    
    var id2;
    
    try {
        id2 = window.localStorage.getItem("id2");
        
        if (!id2) {
            id2 = Math.random().toString(36).replace(/^.*\./, "").slice(0, 6).padEnd(6, "0");
            
            window.localStorage.setItem("id2", id2);
        }
    } catch (info) {
        // id2s in scripts, bots, and so on should incl. *
        
        id2 = Math.random().toString(36).replace(/^.*\./, "").slice(0, 6).padEnd(6, "0") + "*";
    }
    
    Tanks.start_ws = (watching) => new Promise((r) => {
        var ws = new WebSocket("wss://redwolfprograms.com/tanks/ws", watching ? ["watch"] : ["play"]);
        
        var was_on = 0;
        
        ws.onopen = () => {
            if (watching) {
                ws.send(JSON.stringify({
                    start: {
                        id2: id2,
                        n: Tanks.name()
                    }
                }));

                return;
            }

            ws.send(JSON.stringify({
                start: {
                    id: Tanks.id(),
                    id2: id2,
                    stat_arm: Tanks.stat().arm,
                    stat_spd: Tanks.stat().spd,
                    stat_dmg: Tanks.stat().dmg,
                    stat_rld: Tanks.stat().rld,
                    n: Tanks.name()
                }
            }));
            
            was_on = 1;
            
            r(1);
        };
        
        ws.onmessage = (data) => {
            data = JSON.parse(data.data.toString());

            if (data.start) {
                Tanks.start_incoming(data.start);

                setInterval(() => {
                    if (!Tanks.ws_on())
                        return;

                    Tanks.ws({
                        id: Tanks.id(),
                        pos: Tanks.pos(),
                        dir: Tanks.dir(),
                        p_dir: Tanks.p_dir(),
                        chg: Tanks.chg(),
                        ttr: Tanks.ttr()
                    });
                }, 100);

                return;
            }
            
            Tanks.incoming(data);
        };

        ws.onclose = (info) => {
            Tanks.prompt_with_info(info.reason ? info.reason : "WS Disconn: " + info.code);
            
            if (!was_on)
                r(0);
        };
        
        Tanks.ws_on = () => (ws.readyState == 1);
        Tanks.ws = (data) => ws.send(JSON.stringify(data));
    });
})();