(() => {
    var Tanks = window.Tanks;
    
    var room = +(window.location.search.match(/\broom=\d+\b/) || ["room=0"])[0].match(/\d+/)[0];
    
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
            was_on = 1;
            
            r(1);
            
            if (watching) {
                ws.send(JSON.stringify({
                    t: "s",
                    s: {
                        id2: id2,
                        name: Tanks.name(),
                        room: room
                    }
                }));

                return;
            }

            ws.send(JSON.stringify({
                t: "s",
                s: {
                    id: Tanks.id(),
                    id2: id2,
                    stat: Tanks.stat(),
                    name: Tanks.name(),
                    room: room
                }
            }));
        };
        
        ws.onmessage = (data) => {
            data = JSON.parse(data.data.toString());
            
            for (var d of data) {
                switch (d[0]) {
                    case "sy":
                        Tanks.start_incoming(d[1]);

                        if (!Tanks.watching())
                            setInterval(() => {
                                if (!Tanks.ws_on())
                                    return;

                                Tanks.ws({
                                    t: "p",
                                    p: [...Tanks.pos(), Tanks.dir(), Tanks.p_dir(), ...Tanks.chg()]
                                });
                            }, 100);
                        
                        break;
                    case "s":
                    case "p":
                    case "k":
                    case "b":
                        Tanks.incoming(d);
                        
                        break;
                    case "c":
                        Tanks.push_chat([d[1]]);
                        
                        break;
                }
            }
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