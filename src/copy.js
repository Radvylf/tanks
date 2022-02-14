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