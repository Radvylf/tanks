(async () => {
    var tanks = [];
    
    var tick = 0;
    var tick_logs = [];
    
    var walls = [
        [0, -320, 1000, 15, Math.PI / 2],
        [0, 320, 1000, 15, Math.PI / 2],
        [-400, 60, 80, 12, 0],
        [-400, -60, 80, 15, 0],
        [400, 60, 80, 15, 0],
        [400, -60, 80, 15, 0],
        [0, 0, 240, 15, 0],
        [200, 272.5, 80, 15, 0],
        [200, -272.5, 80, 15, 0],
        [-200, 272.5, 80, 15, 0],
        [-200, -272.5, 80, 15, 0],
        [600, 214.25, 227.5, 15, 0],
        [600, -214.25, 227.5, 15, 0],
        [-600, 214.25, 227.5, 15, 0],
        [-600, -214.25, 227.5, 15, 0]
    ];
    
    var windows = [
        [-400, 0, 40, 10, 0],
        [400, 0, 40, 10, 0]
    ];

    var chat = [];
    
    var Conn = require("./src/conn");
    var ws = require("./src/ws")(Conn);
    
    var fround = (x) => Math.round(x * 32768) / 32768;

    var conns = [];
    
    ws.on("conn", (conn) => {
        conns.push(conn);
        
        conn.on("data", (data) => {
            try {
                try {
                    data = JSON.parse(data.toString());
                } catch (info) {
                    throw [];
                }
                
                if (!("t" in data))
                    throw [];
                
                switch (data.t) {
                    case "s":
                        if (conn.protocol == "watch") {
                            if (!data.s.id2.match(/^[A-Za-z0-9\-_]{6}\*?$/) || data.s.id2.slice(-1) == "*" && conns.some(c => c.id2 == data.s.id2))
                                throw [];
                            
                            if (typeof data.s.name != "string" || data.s.name.length < 2 || data.s.name.length > 28)
                                throw ["Name must be 2 to 28 characters"];

                            conn.id2 = data.s.id2;
                            conn.name = data.s.name;

                            conn.data([["sy", {
                                tanks: tanks.filter(t => t.id != conn.id).map(t => ({
                                    id: t.id,
                                    name: t.name,
                                    pos: t.pos,
                                    dir: t.dir,
                                    p_dir: t.p_dir,
                                    chg: t.chg,
                                    hp: t.hp,
                                    army: t.army
                                })),
                                walls: walls,
                                windows: windows,
                                chat: chat.slice(-100)
                            }]]);
                            
                            break;
                        }
                        
                        if ("id" in conn)
                            throw [];
                        
                        if (data.s.id.length != 8 || data.s.id.match(/[^A-Za-z0-9\-_]/) || tanks.some(t => t.id == data.s.id))
                            throw [];
                        if (!data.s.id2.match(/^[A-Za-z0-9\-_]{6}\*?$/) || data.s.id2.slice(-1) == "*" && conns.some(c => c.id2 == data.s.id2))
                            throw [];

                        if (data.s.stat.arm < 0 || data.s.stat.arm > 100 || !Number.isInteger(data.s.stat.arm))
                            throw ["All stats must be integers between 0 and 100, and sum to 200"];
                        if (data.s.stat.spd < 0 || data.s.stat.spd > 100 || !Number.isInteger(data.s.stat.spd))
                            throw ["All stats must be integers between 0 and 100, and sum to 200"];
                        if (data.s.stat.dmg < 0 || data.s.stat.dmg > 100 || !Number.isInteger(data.s.stat.dmg))
                            throw ["All stats must be integers between 0 and 100, and sum to 200"];
                        if (data.s.stat.rld < 0 || data.s.stat.rld > 100 || !Number.isInteger(data.s.stat.rld))
                            throw ["All stats must be integers between 0 and 100, and sum to 200"];
                        
                        if (data.s.stat.arm + data.s.stat.spd + data.s.stat.dmg + data.s.stat.rld != 200)
                            throw ["All stats must be integers between 0 and 100, and sum to 200"];
                        
                        if (typeof data.s.name != "string" || data.s.name.length < 2 || data.s.name.length > 28)
                            throw ["Name must be 2 to 28 characters"];
                        
                        if ("army" in data.s && data.s.army != null && (typeof data.s.army != "number" || data.s.army != 0 && data.s.army != 1))
                            throw [];

                        conn.id = data.s.id;
                        conn.id2 = data.s.id2;
                        conn.name = data.s.name;

                        if (!("army" in data.s) || data.s.army == null) {
                            var count = [0, 0];

                            for (var tank of tanks)
                                count[tank.army]++;

                            data.s.army = count[0] == count[1] ? (Math.random() * 2 | 0) : count[0] < count[1] ? 0 : 1;
                        }

                        var pos = data.s.army == 0 ? [fround(-425 - Math.random() * 75), fround(Math.random() * 100 - 50)] : [fround(425 + Math.random() * 75), fround(Math.random() * 100 - 50)];

                        tanks.push({
                            id: data.s.id,
                            stat: data.s.stat,
                            name: data.s.name,
                            pos: pos,
                            dir: data.s.army == 0 ? 0 : Math.PI,
                            p_dir: data.s.army == 0 ? 0 : Math.PI,
                            chg: [0, 0],
                            hp: 100,
                            army: data.s.army
                        });
                        
                        tick_logs.push(["s", {
                            id: data.s.id,
                            name: data.s.name,
                            pos: pos,
                            dir: data.s.army == 0 ? 0 : Math.PI,
                            p_dir: data.s.army == 0 ? 0 : Math.PI,
                            chg: [0, 0],
                            hp: 100,
                            army: data.s.army
                        }]);

                        conn.data([["sy", {
                            pos: pos,
                            army: data.s.army,
                            tanks: tanks.filter(t => t.id != conn.id).map(t => ({
                                id: t.id,
                                name: t.name,
                                pos: t.pos,
                                dir: t.dir,
                                p_dir: t.p_dir,
                                chg: t.chg,
                                hp: t.hp,
                                army: t.army
                            })),
                            walls: walls,
                            windows: windows,
                            chat: chat.slice(-100)
                        }]]);
                        
                        break;
                    case "p":
                        if (!conn.id || !tanks.some(t => t.id == conn.id && t.hp > 0))
                            break;
                        
                        var t = tanks.find(t => t.id == conn.id);
                        
                        if (typeof data.p[0] != "number" || typeof data.p[1] != "number" || Number.isNaN(data.p[0]) || Number.isNaN(data.p[1]))
                            throw [];
                        if (typeof data.p[2] != "number" || Number.isNaN(data.p[2]))
                            throw [];
                        if (typeof data.p[3] != "number" || Number.isNaN(data.p[3]))
                            throw [];
                        if (typeof data.p[4] != "number" || typeof data.p[5] != "number" || Number.isNaN(data.p[4]) || Number.isNaN(data.p[5]))
                            throw [];
                        
                        data.p = [
                            fround(data.p[0]), fround(data.p[1]),
                            fround(data.p[2]),
                            fround(data.p[3]),
                            fround(data.p[4]), fround(data.p[5])
                        ];
                        
                        if (t.pos[0] != data.p[0] || t.pos[1] != data.p[1] || t.dir != data.p[2] || t.p_dir != data.p[3] || t.chg[0] != data.p[4] || t.chg[1] != data.p[5]) {
                            t.pos = [data.p[0], data.p[1]];
                            t.dir = data.p[2];
                            t.p_dir = data.p[3];
                            t.chg = [data.p[4], data.p[5]];
                            
                            if (t.hp > 0)
                                tick_logs.push(["p", conn.id, data.p]);
                        }
                        
                        break;
                    case "b":
                        if (!conn.id || !tanks.some(t => t.id == conn.id && t.hp > 0))
                            break;
                        
                        if (typeof data.b[0][0] != "number" || typeof data.b[0][1] != "number" || Number.isNaN(data.b[0][0]) || Number.isNaN(data.b[0][1]))
                            throw [];
                        if (typeof data.b[1][0] != "number" || typeof data.b[1][1] != "number" || Number.isNaN(data.b[1][0]) || Number.isNaN(data.b[1][1]))
                            throw [];

                        if (data.b[2]) {
                            if (!tanks.some(t => t.id == data.b[2] && t.hp > 0))
                                break;
                            
                            var dmg = 2.5 ** ((tanks.find(t => t.id == conn.id).stat.dmg * 3) / 100) * 10;
                            var arm = 1 - 1 / 2.5 ** ((tanks.find(t => t.id == data.b[2]).stat.arm * 3) / 100);

                            var hit = tanks.find(t => t.id == data.b[2]);
                            
                            hit.hp -= dmg * (1 - arm);
                            
                            tick_logs.push(["k", data.b[2], Math.max(hit.hp, 0)]);
                            
                            if (hit.hp <= 0) {
                                try {
                                    conns.find(c => c.id == data.b[2]).disconn(1002, "You were killed by " + conn.name);
                                } catch (info) {
                                    break;
                                }
                            }
                        }
                        
                        tick_logs.push(["b", conn.id, ...data.b]);
                        
                        break;
                    case "c":
                        if (!conn.name)
                            break;
                        
                        if (typeof data.c != "string")
                            throw [];
                        
                        if (data.c.length == 0)
                            return;
                        if (data.c.length > 1024)
                            throw ["Maximum of 1024 chars for chat posts"];
                        
                        chat.push((conn.protocol == "watch" ? "{" + conn.name + "} " : "[" + conn.name + "] ") + data.c);
                        
                        tick_logs.push(["c", (conn.protocol == "watch" ? "{" + conn.name + "} " : "[" + conn.name + "] ") + data.c]);
                        
                        break;
                }
            } catch (info) {
                conn.disconn(1002, ...(Array.isArray(info) ? info : []));
            }
        });
        
        conn.on("disconn", () => {
            if (tanks.some(t => t.id == conn.id))
                tick_logs.push(["k", conn.id, 0]);
            
            conns = conns.filter(c => c != conn);
            tanks = tanks.filter(t => t.id != conn.id);
        });
    });
    
    setInterval(() => {
        tick++;
        
        for (var tank of tanks)
            tank.hp = Math.min(tank.hp + 1 / 40, 100);
        
        if (!(tick % 8)) {
            if (!tick_logs.length)
                return;
            
            for (var conn of conns) {
                if (!conn.id2)
                    continue;
                
                try {
                    conn.data(tick_logs);
                } catch (info) {
                    continue;
                }
            }
            
            tick_logs = [];
        }
    }, 25);
    
    var io = require("readline").createInterface({
        input: process.stdin,
        output: process.stdout
    });
    
    var input = () => new Promise((r) => io.question("$ ", r));
    
    var run;
    
    while (1) {
        run = (await input()).trim();
        
        try {
            switch (run.split(" ")[0]) {
                case "run":
                    console.log(eval(run.slice(4)));

                    break;
                case "tanks":
                    console.log("ID        ID2      CONN                      NAME                              ARMY    POS                     HP    ");

                    var t, c;

                    for (var tank of tanks) {
                        t = tank;
                        c = conns.find(c => c.id == t.id);
                        
                        console.log(c.id + "  " + c.id2.padEnd(7) + "  " + String(c.conn_info || "").padEnd(24) + "  " + JSON.stringify(c.name).slice(1, -1).replace(/\\"/g, "\"").padEnd(32) + "  " + t.army.toString().padEnd(6) + "  " + ("[" + t.pos[0].toFixed(2) + ", " + t.pos[1].toFixed(2) + "]").padEnd(22) + "  " + t.hp.toFixed(2).padEnd(6));
                    }
                    
                    break;
                case "kick":
                    var info = [];
                    var kick = run.slice(5);
                    
                    if (kick.startsWith("with")) {
                        for (var i = 6; i <= kick.length; i++) {
                            if (kick.slice(5, i).startsWith("'") && kick.slice(5, i).length > 2 && kick.slice(5, i).slice(-1) == "'") {
                                info = [kick.slice(6, i - 1)];
                                kick = kick.slice(i + 1);
                                
                                break;
                            }
                            
                            try {
                                info = [JSON.parse(kick.slice(5, i))];
                                kick = kick.slice(i + 1);
                                
                                break;
                            } catch (info_) {
                                continue;
                            }
                        }
                    }
                    
                    if (kick == "") {
                        for (var conn of conns) {
                            console.log("Kicking " + (conn.id || "?"));

                            conn.disconn(1002, ...info);
                        }
                        
                        break;
                    }
                    
                    var by = 3;
                    
                    for (var conn of conns) {
                        if (conn.id == kick)
                            by = Math.min(by, 0);
                        if (conn.id2 == kick)
                            by = Math.min(by, 1);
                        if (conn.conn_info == kick)
                            by = Math.min(by, 2);
                    }
                    
                    for (var conn of conns) {
                        if (conn[["id", "id2", "conn_info", "name"][by]] == kick) {
                            console.log("Kicking " + (conn.id || "?") + (by ? " (" + (by == 3 ? JSON.stringify(conn.name).slice(1, -1).replace(/\\"/g, "\"") : conn[["id", "id2", "conn_info"][by]]) + ")": ""));

                            conn.disconn(1002, ...info);
                        }
                    }
                    
                    break;
                case "kickn":
                    var info = [];
                    var kick = run.slice(6);
                    
                    if (kick.startsWith("with")) {
                        for (var i = 6; i < kick.length; i++) {
                            if (kick.slice(5, i).startsWith("'") && kick.slice(5, i).length > 2 && kick.slice(5, i).slice(-1) == "'") {
                                info = [kick.slice(6, i - 1)];
                                kick = kick.slice(i + 1);
                                
                                break;
                            }
                            
                            try {
                                info = [JSON.parse(kick.slice(5, i))];
                                kick = kick.slice(i + 1);
                                
                                break;
                            } catch (info_) {
                                continue;
                            }
                        }
                    }
                    
                    var ts;
                    
                    for (var conn of conns) {
                        if (conn.name == kick) {
                            console.log("Kicking " + (conn.id || "?") + " (" + JSON.stringify(conn.name).slice(1, -1).replace(/\\"/g, "\"") + ")");

                            conn.disconn(1002, ...info);
                        }
                    }
                    
                    break;
                case "say":
                    var info = run.slice(4);
                    
                    chat.push([tick, info]);
                    
                    tick_logs.push(["c", info]);
                    
                    break;
                case "chat":
                    var count = run.slice(5);
                    
                    if (!count)
                        count = String(chat.length);
                    
                    count = Number(count);
                    
                    if (Number.isNaN(count) || !Number.isInteger(count))
                        break;
                    
                    if (count < -chat.length || count > chat.length)
                        count = chat.length;
                    
                    var transcript = chat.slice(chat.length - count);
                    
                    if (count < 0)
                        transcript = chat.slice(0, -count);
                    
                    if (transcript.length)
                        console.log(transcript.join("\n"));
                    
                    break;
                case "watching":
                    console.log("ID2      CONN                      NAME                            ");
                    
                    for (var conn of conns)
                        if (conn.id2 && conn.protocol == "watch")
                            console.log(conn.id2.padEnd(7) + "  " + String(conn.conn_info || "").padEnd(24) + "  " + JSON.stringify(conn.name || "").slice(1, -1).replace(/\\"/g, "\"").padEnd(32));
                    
                    break;
                case "conns":
                    console.log("ID        ID2      CONN                      NAME                            ");
                    
                    for (var conn of conns)
                        console.log((conn.id || "?").padEnd(8) + "  " + (conn.id2 || "").padEnd(7) + "  " + String(conn.conn_info || "").padEnd(24) + "  " + JSON.stringify(conn.name || "").slice(1, -1).replace(/\\"/g, "\"").padEnd(32));
                    
                    break;
                case "stop":
                    var info = run.length > 4 ? [run.slice(5)] : [];
                    
                    for (var conn of conns) {
                        console.log("Kicking " + (conn.id || "?"));

                        conn.disconn(1008, ...info);
                    }
                    
                    await ws.stop();
                    
                    io.close();
                    
                    process.exit();
            }
        } catch (info) {
            console.log(info);
        }
    }
})();