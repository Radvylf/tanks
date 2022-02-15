(async () => {
    var rooms = [];
    
    var tick = 0;
    
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
    
    var main_transcript = [];

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
                            
                            if (typeof data.s.room != "number" || !Number.isInteger(data.s.room) || data.s.room < 0 || data.s.room > 0xffff)
                                throw [];

                            conn.id2 = data.s.id2;
                            conn.name = data.s.name;
                            conn.room = data.s.room;

                            if (!rooms[conn.room])
                                rooms[conn.room] = {
                                    tanks: [],
                                    tick_logs: [],
                                    chat: []
                                };
                            
                            conn.data([["sy", {
                                tanks: rooms[conn.room].tanks.filter(t => t.id != conn.id).map(t => ({
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
                                chat: rooms[conn.room].chat.slice(-100)
                            }]]);
                            
                            break;
                        }
                        
                        if ("id" in conn)
                            throw [];
                        
                        if (data.s.id.length != 8 || data.s.id.match(/[^A-Za-z0-9\-_]/) || rooms.some(r => r.tanks.some(t => t.id == data.s.id)))
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
                            
                        if (typeof data.s.room != "number" || !Number.isInteger(data.s.room) || data.s.room < 0 || data.s.room > 0xffff)
                            throw [];

                        conn.id = data.s.id;
                        conn.id2 = data.s.id2;
                        conn.name = data.s.name;
                        conn.room = data.s.room;

                        if (!rooms[conn.room])
                            rooms[conn.room] = {
                                tanks: [],
                                tick_logs: [],
                                chat: []
                            };

                        if (!("army" in data.s) || data.s.army == null) {
                            var count = [0, 0];

                            for (var tank of rooms[conn.room].tanks)
                                count[tank.army]++;

                            data.s.army = count[0] == count[1] ? (Math.random() * 2 | 0) : count[0] < count[1] ? 0 : 1;
                        }

                        var pos = data.s.army == 0 ? [fround(-425 - Math.random() * 75), fround(Math.random() * 100 - 50)] : [fround(425 + Math.random() * 75), fround(Math.random() * 100 - 50)];

                        rooms[conn.room].tanks.push({
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
                        
                        rooms[conn.room].tick_logs.push(["s", {
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
                            tanks: rooms[conn.room].tanks.filter(t => t.id != conn.id).map(t => ({
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
                            chat: rooms[conn.room].chat.slice(-100)
                        }]]);
                        
                        break;
                    case "p":
                        if (!conn.id || !rooms[conn.room].tanks.some(t => t.id == conn.id && t.hp > 0))
                            break;
                        
                        var t = rooms[conn.room].tanks.find(t => t.id == conn.id);
                        
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
                                rooms[conn.room].tick_logs.push(["p", conn.id, data.p]);
                        }
                        
                        break;
                    case "b":
                        if (!conn.id || !rooms[conn.room].tanks.some(t => t.id == conn.id && t.hp > 0))
                            break;
                        
                        if (typeof data.b[0][0] != "number" || typeof data.b[0][1] != "number" || Number.isNaN(data.b[0][0]) || Number.isNaN(data.b[0][1]))
                            throw [];
                        if (typeof data.b[1][0] != "number" || typeof data.b[1][1] != "number" || Number.isNaN(data.b[1][0]) || Number.isNaN(data.b[1][1]))
                            throw [];

                        if (data.b[2]) {
                            if (!rooms[conn.room].tanks.some(t => t.id == data.b[2] && t.hp > 0))
                                break;
                            
                            var dmg = 2.5 ** ((rooms[conn.room].tanks.find(t => t.id == conn.id).stat.dmg * 3) / 100) * 10;
                            var arm = 1 - 1 / 2.5 ** ((rooms[conn.room].tanks.find(t => t.id == data.b[2]).stat.arm * 3) / 100);

                            var hit = rooms[conn.room].tanks.find(t => t.id == data.b[2]);
                            
                            hit.hp -= dmg * (1 - arm);
                            
                            rooms[conn.room].tick_logs.push(["k", data.b[2], Math.max(hit.hp, 0)]);
                            
                            if (hit.hp <= 0) {
                                try {
                                    conns.find(c => c.id == data.b[2]).disconn(1002, "You were killed by " + conn.name);
                                } catch (info) {
                                    break;
                                }
                            }
                        }
                        
                        rooms[conn.room].tick_logs.push(["b", conn.id, ...data.b]);
                        
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
                        
                        data.c = (conn.protocol == "watch" ? "{" + conn.name + "} " : "[" + conn.name + "] ") + data.c;
                        
                        rooms[conn.room].chat.push(data.c);
                        rooms[conn.room].tick_logs.push(["c", data.c]);
                        
                        main_transcript.push([Date.now(), data.c]);
                        
                        break;
                }
            } catch (info) {
                conn.disconn(1002, ...(Array.isArray(info) ? info : []));
            }
        });
        
        conn.on("disconn", () => {
            conns = conns.filter(c => c != conn);
            
            if (conn.id) {
                rooms[conn.room].tick_logs.push(["k", conn.id, 0]);
                
                rooms[conn.room].tanks = rooms[conn.room].tanks.filter(t => t.id != conn.id);
            }
        });
    });
    
    setInterval(() => {
        tick++;
        
        for (var room of rooms) {
            if (!room)
                continue;
            
            for (var tank of room.tanks)
                tank.hp = Math.min(tank.hp + 1 / 40, 100);
            
            if (!(tick % 8)) {
                if (!room.tick_logs.length)
                    return;

                for (var conn of conns) {
                    if (!conn.id2 || rooms[conn.room] != room)
                        continue;

                    try {
                        conn.data(room.tick_logs);
                    } catch (info) {
                        continue;
                    }
                }

                room.tick_logs = [];
            }
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
                    console.log("ID        ID2      CONN                      ROOM    NAME                              ARMY    POS                     HP    ");

                    var t, c;

                    for (var room of rooms) {
                        if (!room)
                            continue;
                        
                        for (var tank of room.tanks) {
                            t = tank;
                            c = conns.find(c => c.id == t.id);

                            console.log(c.id + "  " + c.id2.padEnd(7) + "  " + String(c.conn_info || "").padEnd(24) + "  " + c.room.toString().padEnd(6) + "  " + JSON.stringify(c.name).slice(1, -1).replace(/\\"/g, "\"").padEnd(32) + "  " + t.army.toString().padEnd(6) + "  " + ("[" + t.pos[0].toFixed(2) + ", " + t.pos[1].toFixed(2) + "]").padEnd(22) + "  " + t.hp.toFixed(2).padEnd(6));
                        }
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
                    var say_rooms = rooms;
                    var info = run.slice(4);
                    
                    if (info.startsWith("in")) {
                        say_rooms = info.slice(3).match(/\d+/)[0];
                        
                        info = info.slice(say_rooms.length + 4);
                        say_rooms = [rooms[room]];
                    }
                    
                    for (var room of say_rooms) {
                        room.chat.push([tick, info]);

                        room.tick_logs.push(["c", info]);
                    }
                    
                    break;
                case "chat":
                    var count = run.slice(5);
                    
                    if (!count)
                        count = String(main_transcript.length);
                    
                    count = Number(count);
                    
                    if (Number.isNaN(count) || !Number.isInteger(count))
                        break;
                    
                    if (count < -main_transcript.length || count > main_transcript.length)
                        count = main_transcript.length;
                    
                    var transcript = main_transcript.slice(main_transcript.length - count);
                    
                    if (count < 0)
                        transcript = main_transcript.slice(0, -count);
                    
                    var format = (now) => {
                        now = Date.now() - now;
                        
                        var s = now / 1000 | 0;
                        var m = now / 60000 | 0;
                        var b = now / 3600000 | 0;
                        
                        return "-" + b.toString().padStart(2, "0") + ":" + (m % 60).toString().padStart(2, "0") + ":" + (s % 60).toString().padStart(2, "0");
                    };
                    
                    if (transcript.length)
                        console.log(transcript.map(t => format(t[0]) + " " + t[1]).join("\n"));
                    
                    break;
                case "watching":
                    console.log("ID2      CONN                      ROOM    NAME                            ");
                    
                    for (var conn of conns)
                        if (conn.id2 && conn.protocol == "watch")
                            console.log(conn.id2.padEnd(7) + "  " + String(conn.conn_info || "").padEnd(24) + "  " + c.room.toString().padEnd(6) + "  " + JSON.stringify(conn.name || "").slice(1, -1).replace(/\\"/g, "\"").padEnd(32));
                    
                    break;
                case "conns":
                    console.log("ID        ID2      CONN                      ROOM    NAME                            ");
                    
                    for (var conn of conns)
                        console.log((conn.id || "?").padEnd(8) + "  " + (conn.id2 || "").padEnd(7) + "  " + String(conn.conn_info || "").padEnd(24) + "  " + (c.room || "").toString().padEnd(6) + "  " + JSON.stringify(conn.name || "").slice(1, -1).replace(/\\"/g, "\"").padEnd(32));
                    
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