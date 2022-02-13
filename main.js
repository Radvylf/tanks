(async () => {
    var tank_stats = [];
    var tanks = [];
    
    var walls = [
        [0, -250, 750, 15, Math.PI / 2],
        [0, 250, 750, 15, Math.PI / 2],
        [-225, 60, 15, 80, Math.PI / 2],
        [-225, 0, 10, 40, Math.PI / 2],
        [-225, -60, 15, 80, Math.PI / 2],
        [225, 60, 15, 80, Math.PI / 2],
        [225, 0, 10, 40, Math.PI / 2],
        [225, -60, 15, 80, Math.PI / 2]
    ];

    var r_shot = new Set();

    var tick = 0;

    var trails = [];

    var chat = [];

    setInterval(() => {
        tick++;

        for (var t of trails) {
            if (t[0] < tick - 100) {
                t.drop = 1;

                continue;
            }
        }

        trails = trails.filter(t => !t.drop);
    }, 25);

    var WS = require("ws").WebSocketServer;

    var wss = new WS({
        port: 8010
    });

    var conns = [];

    wss.on("connection", (conn, data) => {
        conns.push(conn);
        
        conn.conn_info = data.headers["x-forwarded-for"].trim();
        
        if (conn.protocol == "watch") {
            conn.watching = 1;
            
            conn.on("message", (data) => {
                try {
                    data = JSON.parse(data.toString());
                    
                    if ("start" in data) {
                        if (!data.start.id2.match(/^[A-Za-z0-9\-_]{6}\*?$/) || data.start.id2.slice(-1) == "*" && conns.some(c => c.id2 == data.start.id2))
                            throw data.start.id2;
                        if (typeof data.start.n != "string" || data.start.n.length > 28)
                            throw data.start.n;
                        
                        conn.id2 = data.start.id2;
                        conn.n = data.start.n;
                        conn.tick = tick;
                    }
                    
                    if ("c" in data) {
                        if (!conn.id2 || !conn.n || typeof data.c != "string")
                            throw 1;

                        chat.push([tick, "{" + conn.n + "} " + data.c]);

                        return;
                    }
                } catch (info) {
                    conn.close();
                }
            });
            
            return;
        }

        conn.on("message", (data) => {
            try {
                data = JSON.parse(data.toString());

                // if ("start" in data)
                //    console.log(data);

                if ("bt" in data) {
                    if (!conn.id || !tanks.find(t => t.id == conn.id && t.hp > 0))
                        return;
                    
                    if (typeof data.bt[0][0] != "number" || typeof data.bt[0][1] != "number" || Number.isNaN(data.bt[0][0]) || Number.isNaN(data.bt[0][1]))
                        throw 0;
                    if (typeof data.bt[1][0] != "number" || typeof data.bt[1][1] != "number" || Number.isNaN(data.bt[1][0]) || Number.isNaN(data.bt[1][1]))
                        throw 1;
                        
                    if (data.hit) {
                        if (!tank_stats.some(t => t.id == data.hit) && !r_shot.has(data.hit))
                            throw data.hit;
                        
                        if (tanks.find(t => t.id == data.hit).hp < 0)
                            return;
                        
                        r_shot.add(data.hit);
                        
                        if (tanks.some(t => t.id == data.hit)) {
                            var dmg = 2.5 ** ((tank_stats.find(t => t.id == conn.id).stat_dmg * 3) / 100) * 10;
                            var arm = 1 - 1 / 2.5 ** ((tank_stats.find(t => t.id == data.hit).stat_arm * 3) / 100);
                            
                            if ((tanks.find(t => t.id == data.hit).hp -= dmg * (1 - arm)) < 0)
                                chat.push([tick, tank_stats.find(t => t.id == data.hit).n + " was killed by " + tank_stats.find(t => t.id == conn.id).n]);
                        }
                    }

                    trails.push([tick, [[data.bt[0][0], data.bt[0][1]], [data.bt[1][0], data.bt[1][1]]], conn.id]);

                    return;
                }

                if ("c" in data) {
                    if (typeof data.c != "string")
                        throw 1;

                    chat.push([tick, "[" + tank_stats.find(t => t.id == conn.id).n + "] " + data.c]);

                    return;
                }

                if (data.start) {
                    if (conn.id) {
                        tank_stats = tank_stats.filter(t => t.id != conn.id);
                        tanks = tanks.filter(t => t.id != conn.id);
                    }
                    
                    if (data.start.id.length != 8 || data.start.id.match(/[^A-Za-z0-9\-_]/) || tank_stats.some(t => t.id == data.start.id))
                        throw data.start.id;
                    if (!data.start.id2.match(/^[A-Za-z0-9\-_]{6}\*?$/) || data.start.id2.slice(-1) == "*" && conns.some(c => c.id2 == data.start.id2))
                        throw data.start.id2;
                    
                    if (data.start.stat_arm < 0 || data.start.stat_arm > 100 || !Number.isInteger(data.start.stat_arm))
                        throw data.start.stat_arm;
                    if (data.start.stat_spd < 0 || data.start.stat_spd > 100 || !Number.isInteger(data.start.stat_spd))
                        throw data.start.stat_spd;
                    if (data.start.stat_dmg < 0 || data.start.stat_dmg > 100 || !Number.isInteger(data.start.stat_dmg))
                        throw data.start.stat_dmg;
                    if (data.start.stat_rld < 0 || data.start.stat_rld > 100 || !Number.isInteger(data.start.stat_rld))
                        throw data.start.stat_rld;
                    if (data.start.stat_arm + data.start.stat_spd + data.start.stat_dmg + data.start.stat_rld != 200)
                        throw 200;
                    if (typeof data.start.n != "string" || data.start.n.length > 28)
                        throw data.start.n;
                    if ("army" in data.start && data.start.army != null && (typeof data.start.army != "number" || data.start.army != 0 && data.start.army != 1))
                        throw data.start.army;

                    conn.id = data.start.id;
                    conn.id2 = data.start.id2;
                    conn.tick = tick;
                    
                    if (!("army" in data.start) || data.start.army == null) {
                        var count = [0, 0];
                        
                        for (var tank of tank_stats)
                            count[tank.army]++;
                        
                        data.start.army = count[0] == count[1] ? (Math.random() * 2 | 0) : count[0] < count[1] ? 0 : 1;
                    }
                    
                    tank_stats.push({
                        id: data.start.id,
                        stat_arm: data.start.stat_arm,
                        stat_spd: data.start.stat_spd,
                        stat_dmg: data.start.stat_dmg,
                        stat_rld: data.start.stat_rld,
                        n: data.start.n,
                        army: data.start.army
                    });
                    
                    var pos = data.start.army == 0 ? [-300 + (Math.random() * 75 - 37.5), (Math.random() * 100 - 50)] : [300 + (Math.random() * 75 - 37.5), (Math.random() * 100 - 50)];
                    
                    tanks.push({
                        id: data.start.id,
                        pos: pos,
                        dir: data.start.army == 0 ? 0 : Math.PI,
                        p_dir: data.start.army == 0 ? 0 : Math.PI,
                        chg: [0, 0, 0],
                        hp: 100,
                        ttr: 0,
                        n: data.start.n
                    });

                    conn.send(JSON.stringify({
                        start: {
                            pos: pos,
                            army: data.start.army,
                            chat: chat.slice(-100).map(c => c[1]),
                            walls: walls
                        }
                    }));
                    
                    return;
                }

                if (data.id != conn.id || !tank_stats.some(t => t.id == data.id))
                    throw data.id;

                var hp = tanks.find(t => t.id == conn.id).hp;

                tanks = tanks.filter(t => t.id != conn.id);

                if (typeof data.pos[0] != "number" || typeof data.pos[1] != "number" || Number.isNaN(data.pos[0]) || Number.isNaN(data.pos[1]))
                    throw data.pos;
                if (typeof data.dir != "number" || Number.isNaN(data.dir))
                    throw data.dir;
                if (typeof data.p_dir != "number" || Number.isNaN(data.p_dir))
                    throw data.p_dir;
                if (typeof data.chg[0] != "number" || typeof data.chg[1] != "number" || typeof data.chg[2] != "number" || Number.isNaN(data.pos[0]) || Number.isNaN(data.pos[1]) || Number.isNaN(data.pos[2]))
                    throw data.chg;
                if (typeof data.ttr != "number" || !Number.isInteger(data.ttr) || data.ttr < 0)
                    throw data.ttr;

                tanks.push({
                    id: data.id,
                    pos: [data.pos[0], data.pos[1]],
                    dir: data.dir,
                    p_dir: data.p_dir,
                    chg: [data.chg[0], data.chg[1], data.chg[2]],
                    hp: hp,
                    ttr: data.ttr,
                    n: tank_stats.find(s => s.id == data.id).n
                });
            } catch (info) {
                conn.close();
            }
        });

        conn.on("close", () => {
            conns = conns.filter(c => c != conn);

            if (conn.id) {
                tank_stats = tank_stats.filter(t => t.id != conn.id);
                tanks = tanks.filter(t => t.id != conn.id);
            }
        });
    });

    setInterval(() => {
        tanks = tanks.filter(t => t.hp > 0);

        for (var conn of conns) {
            try {
                conn.send(JSON.stringify([
                    tanks.filter(t => t.id != conn.id).map(t => [...t.pos.map(n => Math.round(n * 32768) / 32768), Math.round(t.dir * 32768) / 32768, Math.round(t.p_dir * 32768) / 32768, t.chg.map(n => Math.round(n * 32768) / 32768), Math.round(t.hp * 32768) / 32768, t.ttr, t.n, t.id, tank_stats.find(s => s.id == t.id).army]),
                    trails.filter(t => t[0] >= conn.tick && t[2] != conn.id).map(t => t[1].map(p => p.map(n => Math.round(n * 32768) / 32768))),
                    chat.filter(c => c[0] > conn.tick).map(c => c[1]),
                    ...(conn.watching ? [] : [Math.round((tanks.find(t => t.id == conn.id) || { hp: 0 }).hp * 32768) / 32768])
                ]));

                if (conn.id && !tanks.some(t => t.id == conn.id))
                    conn.close(1002, "You died!");
            } catch (info) {
                continue;
            }

            conn.tick = tick;
        }
    }, 200);
    
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
                    console.log("ID         ID2      CONN                      NAME                              ARMY  POS                     HP    ");

                    var ts, t, c;

                    for (var tank of tank_stats) {
                        ts = tank;
                        t = tanks.find(t => t.id == ts.id);
                        c = conns.find(c => c.id == ts.id);

                        console.log(JSON.stringify(ts.id).slice(1, -1).padEnd(11) + JSON.stringify(c?.id2 || "").slice(1, -1).padEnd(9) + String(c?.conn_info || "").padEnd(24) + "  " + JSON.stringify(ts.n).slice(1, -1).replace(/\\"/g, "\"").padEnd(32) + "  " + ts.army.toString().padEnd(4) + "  " + (t && t.pos ? "[" + t.pos[0].toFixed(2) + ", " + t.pos[1].toFixed(2) + "]" : "").padEnd(22) + "  " + (t && t.hp ? t.hp.toFixed(2) : "").padEnd(6));
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
                            console.log("Kicking " + conn.id);

                            conn.close(1002, ...info);
                        }
                        
                        break;
                    }
                    
                    if (kick == "*") {
                        for (var conn of conns) {
                            if (!conn.id || !conn.id2 || conn.id2.slice(-1) == "*") {
                                console.log("Kicking " + (conn.id || "?") + " [" + (conn.id2 || "") + "]");

                                conn.close(1002, ...info);
                            }
                        }
                        
                        break;
                    }
                    
                    var by = {
                        id: 0,
                        id2: 0,
                        conn: 0
                    };
                    
                    for (var conn of conns) {
                        if (conn.id == kick)
                            by.id = 1;
                        if (conn.id2.slice(0, 6) == kick)
                            by.id2 = 1;
                        if (conn.conn_info == kick)
                            by.conn = 1;
                    }
                    
                    if (by.id) {
                        for (var conn of conns) {
                            if (conn.id == kick) {
                                console.log("Kicking " + conn.id);
                                
                                conn.close(1002, ...info);
                            }
                        }
                        
                        break;
                    }
                    
                    if (by.id2) {
                        for (var conn of conns) {
                            if (conn.id2 == kick) {
                                console.log("Kicking " + conn.id + " [" + conn.id2 + "]");
                                
                                conn.close(1002, ...info);
                            }
                        }
                        
                        break;
                    }
                    
                    if (by.conn) {
                        for (var conn of conns) {
                            if (conn.conn_info == kick) {
                                console.log("Kicking " + conn.id + " [" + conn.conn_info + "]");
                                
                                conn.close(1002, ...info);
                            }
                        }
                        
                        break;
                    }
                    
                    var ts;
                    
                    for (var conn of conns) {
                        ts = tank_stats.find(s => s.id == conn.id);
                        
                        if (ts && ts.n == kick) {
                            console.log("Kicking " + conn.id + " [" + ts.n + "]");

                            conn.close(1002, ...info);
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
                        ts = tank_stats.find(s => s.id == conn.id);
                        
                        if (ts && ts.n == kick) {
                            console.log("Kicking " + conn.id + " [" + ts.n + "]");

                            conn.close(1002, ...info);
                        }
                    }
                    
                    break;
                case "say":
                    var info = run.slice(4);
                    
                    chat.push([tick, info]);
                    
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
                        console.log(transcript.map(t => t[1]).join("\n"));
                    
                    break;
                case "watching":
                    console.log("ID2      CONN                      NAME                            ");
                    
                    for (var conn of conns) {
                        if (conn.watching) {
                            console.log(conn.id2.padEnd(7) + "  " + String(conn.conn_info || "").padEnd(24) + "  " + JSON.stringify(conn.n).slice(1, -1).replace(/\\"/g, "\"").padEnd(32));
                        }
                    }
                case "stop":
                    var info = run.length > 4 ? [run.slice(5)] : [];
                    
                    for (var conn of conns) {
                        console.log("Kicking " + conn.id);

                        conn.close(1008, ...info);
                    }
                    
                    io.close();
                    
                    input = () => new Promise((r) => {});
                    
                    wss.close(() => {
                        process.exit();
                    });
                    
                    break;
            }
        } catch (info) {
            console.log(info);
        }
    }
})();
