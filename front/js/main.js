(async () => {
    var start_cont = document.getElementById("start_cont");
    
    var start_name = document.getElementById("start_name");
    
    var start_arm = document.getElementById("start_arm");
    var start_spd = document.getElementById("start_spd");
    var start_dmg = document.getElementById("start_dmg");
    var start_rld = document.getElementById("start_rld");
    
    var total = document.getElementById("total");
    var total_invalid = document.getElementById("total_invalid");
    
    var start_play = document.getElementById("start_play");
    var start_watch = document.getElementById("start_watch");
    
    var colorblind = document.getElementById("colorblind");
    
    var total_stats = () => {
        var name = start_name.value;
        
        var stat_arm = +start_arm.value;
        var stat_spd = +start_spd.value;
        var stat_dmg = +start_dmg.value;
        var stat_rld = +start_rld.value;
        
        var name_invalid = 0;
        var stat_invalid = 0;
        
        stat_arm.className = "";
        stat_spd.className = "";
        stat_dmg.className = "";
        stat_rld.className = "";
        
        total_invalid.style.display = "";
        
        if (name.length < 2 || name.length > 28) {
            name_invalid = 1;
        }
        
        if (stat_arm != stat_arm || stat_arm < 0 || stat_arm > 100 || !Number.isInteger(stat_arm)) {
            stat_arm.className = "invalid";
            
            stat_invalid = 1;
        }
        
        if (stat_spd != stat_spd || stat_spd < 0 || stat_spd > 100 || !Number.isInteger(stat_spd)) {
            stat_arm.className = "invalid";
            
            stat_invalid = 1;
        }
        
        if (stat_dmg != stat_dmg || stat_dmg < 0 || stat_dmg > 100 || !Number.isInteger(stat_dmg)) {
            stat_arm.className = "invalid";
            
            stat_invalid = 1;
        }
        
        if (stat_rld != stat_rld || stat_rld < 0 || stat_rld > 100 || !Number.isInteger(stat_rld)) {
            stat_arm.className = "invalid";
            
            stat_invalid = 1;
        }
        
        total.textContent = stat_invalid ? "-" : stat_arm + stat_spd + stat_dmg + stat_rld;
        
        if (!stat_invalid && stat_arm + stat_spd + stat_dmg + stat_rld != 200) {
            total_invalid.style.display = "inline";
            
            stat_invalid = 1;
        }
        
        start_play.disabled = name_invalid || stat_invalid;
        start_watch.disabled = name_invalid;
        
        start_play.title = name_invalid ? "Name must be 2 to 28 characters" : stat_invalid ? "All stats must be integers between 0 and 100, and sum to 200" : "";
        start_watch.title = name_invalid ? "Name must be 2 to 28 characters" : "";
    };
    
    start_name.oninput = () => {
        total_stats();
    };
    
    start_arm.oninput = () => {
        total_stats();
    };
    
    start_spd.oninput = () => {
        total_stats();
    };
    
    start_dmg.oninput = () => {
        total_stats();
    };
    
    start_rld.oninput = () => {
        total_stats();
    };
    
    try {
        start_name.value = window.localStorage.getItem("name") || "";

        start_arm.value = window.localStorage.getItem("stat_arm") || 20;
        start_spd.value = window.localStorage.getItem("stat_spd") || 80;
        start_dmg.value = window.localStorage.getItem("stat_dmg") || 80;
        start_rld.value = window.localStorage.getItem("stat_rld") || 20;
        
        colorblind.checked = +window.localStorage.getItem("colorblind");
        
        total_stats();
    } catch (info) {
        total_stats();
    }
    
    var watching;
    
    await new Promise((r) => {
        start_play.onclick = () => {
            if (!start_play.disabled) {
                watching = 0;
                
                r();
            }
        };
        
        start_watch.onclick = () => {
            if (!start_watch.disabled) {
                watching = 1;
                
                r();
            }
        };
    });
    
    try {
        window.localStorage.setItem("name", start_name.value);
        
        if (!watching) {
            window.localStorage.setItem("stat_arm", start_arm.value);
            window.localStorage.setItem("stat_spd", start_spd.value);
            window.localStorage.setItem("stat_dmg", start_dmg.value);
            window.localStorage.setItem("stat_rld", start_rld.value);
        }
        
        window.localStorage.setItem("colorblind", +colorblind.checked);
    
        start_cont.style.display = "none";
    } catch (info) {
        start_cont.style.display = "none";
    }
    
    var modal_cont = document.getElementById("modal_cont");
    
    var prompt = document.getElementById("prompt");
    var input = document.getElementById("input");
    
    var prompting = 0;
    
    var prompt_for_input = (prompt_info) => {
        modal_cont.style.display = "flex";
        
        prompt.textContent = prompt_info;
        prompt.style.marginBottom = "";
        
        input.style.display = "";
        input.focus();
        
        prompting = 1;
        
        return new Promise((r) => {
            input.onkeydown = (info) => {
                if (info.ctrlKey || info.altKey || info.metaKey)
                    return;
                
                if (info.code == "Enter" && !info.shiftKey) {
                    modal_cont.style.display = "";
                    
                    prompting = 0;
                    input.onkeydown = null;
                    
                    r(input.value);
                    
                    input.value = "";
                }
            };
        });
    };
    
    var disp_prompt = (info) => {
        modal_cont.style.display = "flex";
        
        prompt.textContent = info;
        prompt.style.marginBottom = "0px";
        
        input.style.display = "none";
    };
    
    var rid = Math.random().toString().replace(/^.*\./, "").slice(0, 8).padEnd(8, "0");
    
    var display = document.getElementById("display");
    var c_2d = display.getContext("2d");
    
    c_2d.imageSmoothingEnabled = false;
    
    (window.onresize = () => {
        display.width = window.innerWidth;
        display.height = window.innerHeight;
    })();
    
    var draw_box = (x, y, sx, sy, r = 0) => {
        var cos_r = Math.cos(r);
        var sin_r = Math.sin(r);
        
        sx /= 2;
        sy /= 2;
        
        var offset = ([x, y], d, w) => [x + Math.cos(r + d) * w, y + Math.sin(r + d) * w];
        
        x += display.width / 2;
        y += display.height / 2;
        
        c_2d.beginPath();
        c_2d.moveTo(...offset(offset([x, y], Math.PI / 2, sx), 0, sy));
        c_2d.lineTo(...offset(offset([x, y], Math.PI * 3 / 2, sx), 0, sy));
        c_2d.lineTo(...offset(offset([x, y], Math.PI * 3 / 2, sx), Math.PI, sy));
        c_2d.lineTo(...offset(offset([x, y], Math.PI / 2, sx), Math.PI, sy));
        c_2d.closePath();
        
        c_2d.stroke();
    };
    
    var auto = 0;
    
    var chat = [];
    var chat_count = 10;
    var chat_name = start_name.value;
    var chat_font_size = 11;
    var chat_show = 1;
    
    var draw_arrow = 1;
    
    if (!watching) {
        var stat_arm = +start_arm.value;
        var stat_spd = +start_spd.value;
        var stat_dmg = +start_dmg.value;
        var stat_rld = +start_rld.value;
    
        var arm = 1 - 1 / 2.5 ** ((stat_arm * 3) / 100);
        var spd = 2 ** (stat_spd / (100 / 3) - 2);
        var swp = Math.PI / (2 ** (stat_spd / 50 + 1));
        var dmg = 2.5 ** ((stat_dmg * 3) / 100) * 10;
        var rld = 2.5 ** (((100 - stat_rld) * 3) / 100) / 6.25/* / (625 / (stat_rld + 625))*/;
    }
    
    var army;
    
    var ws = new WebSocket("wss://redwolfprograms.com/tanks/ws", watching ? ["watch"] : ["play"]);
    
    var buttons = {
        "w": 0,
        "a": 0,
        "s": 0,
        "d": 0,
        "i": 0,
        "o": 0,
        "p": 0,
        "ArrowUp": 0,
        "ArrowLeft": 0,
        "ArrowDown": 0,
        "ArrowRight": 0,
        "z": 0,
        "x": 0,
        "c": 0,
        "Space": 0
    };
    
    var c_pos = [0, 0];
    
    window.onkeydown = (info) => {
        if (watching)
            return;
        
        if (prompting)
            return;
        
        if (info.ctrlKey || info.altKey || info.metaKey)
            return;
        
        var id = info.code.startsWith("Key") ? info.code.slice(3).toLowerCase() : info.code;
        
        if (id == "Space" && !buttons["Space"] || id == "o" && !buttons["o"] || id == "x" && !buttons["x"])
            window.onclick();
        
        if (id in buttons)
            buttons[id] = 1;
    };
    
    window.onkeyup = async (info) => {
        var id = info.code.startsWith("Key") ? info.code.slice(3).toLowerCase() : info.code;
        
        if (id == "t" && !buttons["t"]) {
            if (!prompting && ws.readyState == 1) {
                var chat_input = await prompt_for_input("Chat:");
                
                if (chat_input) {
                    ws.send(JSON.stringify({
                        c: chat_input
                    }));
                }
            }
        }
        
        if (id in buttons)
            buttons[id] = 0;
    };
    
    var pos = [Infinity, Infinity];
    var dir = 0;
    var p_dir = 0;
    var chg = [0, 0, 0];
    
    var rir = 0;
    var ri_nc = 0;
    var ri_bwc = 0;
    
    var hp = 100;
    
    var c_ctrl = 1;
    var d_spd = 1;
    var d_stl = 0;
    var d_sp = 1;
    
    var ttr = 0;
    var ttrm = 0;
    
    var ttrd = 0;
    
    var walls = [
        [0, -250, 750, 15, Math.PI / 2],
        [0, 250, 750, 15, Math.PI / 2],
        [-225, 0, 15, 125, Math.PI / 2],
        [225, 0, 15, 125, Math.PI / 2]
    ];
    
    var opps = [];
    
    var trails = [];
    
    var collision = (p, d, x, y, sx, sy, d_2, id = null) => {
        x -= p[0];
        y -= p[1];
        
        sx /= 2;
        sy /= 2;

        var r = Math.hypot(y, x);
        var t = Math.atan2(y, x);

        t -= d;
        d_2 -= d;

        x = Math.cos(t) * r;
        y = Math.sin(t) * r;

        var offset = ([x, y], d, w) => [x + Math.cos(d_2 + d) * w, y + Math.sin(d_2 + d) * w];

        var ps = [
            offset(offset([x, y], Math.PI / 2, sx), 0, sy),
            offset(offset([x, y], Math.PI * 3 / 2, sx), 0, sy),
            offset(offset([x, y], Math.PI * 3 / 2, sx), Math.PI, sy),
            offset(offset([x, y], Math.PI / 2, sx), Math.PI, sy)
        ];

        var cs = [
            [ps[0], ps[1]],
            [ps[1], ps[2]],
            [ps[2], ps[3]],
            [ps[3], ps[0]]
        ];

        cs = cs.filter(c => Math.sign(c[0][1]) != Math.sign(c[1][1]) && c[0][1] && c[1][1]);

        if (!cs.length)
            return Infinity;

        // y == ((c[0][1] - c[1][1]) / (c[0][0] - c[1][0])) * (x - c[0][0]) + c[0][1]
        // ((c[0][1] - c[1][1]) / (c[0][0] - c[1][0])) * (x - c[0][0]) + c[0][1] == 0
        // m * x - m * c[0][0] + c[0][1] == 0
        // m * x == m * c[0][0] - c[0][1]
        // x == c[0][0] - c[0][1] / m

        cs = cs.map(c => c[0][0] == c[1][0] ? c[0][0] : c[0][0] - c[0][1] / ((c[0][1] - c[1][1]) / (c[0][0] - c[1][0])));

        if (cs.every(c => c < 0))
            return Infinity;
        
        if (cs.some(c => c < 0))
            return 0;
        
        return Math.min(...cs);
    };
    
    var box_collision = (x, y, sx, sy, d, x_2, y_2, sx_2, sy_2, d_2) => {
        sx /= 2;
        sy /= 2;
        
        var offset = ([x, y], o, w) => [x + Math.cos(d + o) * w, y + Math.sin(d + o) * w];

        var ps = [
            offset(offset([x, y], Math.PI / 2, sx), 0, sy),
            offset(offset([x, y], Math.PI * 3 / 2, sx), 0, sy),
            offset(offset([x, y], Math.PI * 3 / 2, sx), Math.PI, sy),
            offset(offset([x, y], Math.PI / 2, sx), Math.PI, sy)
        ];
        
        sx_2 /= 2;
        sy_2 /= 2;
        
        var offset_2 = ([x, y], o, w) => [x + Math.cos(d_2 + o) * w, y + Math.sin(d_2 + o) * w];
        
        var ps_2 = [
            offset_2(offset_2([x_2, y_2], Math.PI / 2, sx_2), 0, sy_2),
            offset_2(offset_2([x_2, y_2], Math.PI * 3 / 2, sx_2), 0, sy_2),
            offset_2(offset_2([x_2, y_2], Math.PI * 3 / 2, sx_2), Math.PI, sy_2),
            offset_2(offset_2([x_2, y_2], Math.PI / 2, sx_2), Math.PI, sy_2)
        ];
        
        return Math.min(...ps.map(p => collision(p, d, x_2, y_2, sx_2 * 2, sy_2 * 2, d_2) - 0.02), ...ps_2.map(p => collision(p, d + Math.PI, x, y, sx * 2, sy * 2, d) - 0.02));
    };
    
    var box_is_coll = (x, y, sx, sy, d, x_2, y_2, sx_2, sy_2, d_2) => {
        var point_is_coll = (p, x, y, sx, sy, d_2) => {
            p = [...p];
            
            p[0] -= x;
            p[1] -= y;

            sx /= 2;
            sy /= 2;

            var r = Math.hypot(p[1], p[0]);
            var t = Math.atan2(p[1], p[0]);

            t -= d_2;

            p[0] = Math.cos(t) * r;
            p[1] = Math.sin(t) * r;

            return p[0] > -sy && p[0] < sy && p[1] > -sx && p[1] < sx;
        };

        sx /= 2;
        sy /= 2;

        var offset = ([x, y], o, w) => [x + Math.cos(d + o) * w, y + Math.sin(d + o) * w];

        var ps = [
            offset(offset([x, y], Math.PI / 2, sx), 0, sy),
            offset(offset([x, y], Math.PI * 3 / 2, sx), 0, sy),
            offset(offset([x, y], Math.PI * 3 / 2, sx), Math.PI, sy),
            offset(offset([x, y], Math.PI / 2, sx), Math.PI, sy)
        ];

        sx_2 /= 2;
        sy_2 /= 2;

        var offset_2 = ([x, y], o, w) => [x + Math.cos(d_2 + o) * w, y + Math.sin(d_2 + o) * w];

        var ps_2 = [
            offset_2(offset_2([x_2, y_2], Math.PI / 2, sx_2), 0, sy_2),
            offset_2(offset_2([x_2, y_2], Math.PI * 3 / 2, sx_2), 0, sy_2),
            offset_2(offset_2([x_2, y_2], Math.PI * 3 / 2, sx_2), Math.PI, sy_2),
            offset_2(offset_2([x_2, y_2], Math.PI / 2, sx_2), Math.PI, sy_2)
        ];

        return ps.some(p => point_is_coll(p, x_2, y_2, sx_2 * 2, sy_2 * 2, d_2)) || ps_2.some(p => point_is_coll(p, x, y, sx * 2, sy * 2, d));
    };
    
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
    
    var down = 0;
    
    window.onmousedown = () => {
        if (watching)
            return;
        
        if (prompting)
            return;
        
        down = 1;
    };
    
    window.onmouseup = () => (down = 0);
    
    var p_dir_tick = () => {
        if ((buttons["i"] || buttons["z"]) && p_dir - dir > -(swp + (10 ** -10))) {
            c_pos = null;
            
            p_dir -= Math.sqrt(spd) / (48 / d_spd);
        }
        
        if ((buttons["p"] || buttons["c"]) && p_dir - dir < (swp + (10 ** -10))) {
            c_pos = null;
            
            p_dir += Math.sqrt(spd) / (48 / d_spd);
        }

        var p_off = p_dir - dir;
        
        if (c_pos != null) {
            if (c_pos[1] <= (10 ** -10))
                c_pos = [p_dir - dir, 1];

            p_off = (Math.atan2(Math.sin(c_pos[0]) * c_pos[1] - pos[1], Math.cos(c_pos[0]) * c_pos[1] - pos[0]) % (Math.PI * 2) + (Math.PI * 2)) % (Math.PI * 2) - dir;
        }
        
        if (p_off > Math.PI)
            p_off -= Math.PI * 2;
        if (p_off < -Math.PI)
            p_off += Math.PI * 2;

        if ((p_off < -(Math.PI - swp) || p_off > (Math.PI - swp))) {
            p_off = (p_off + Math.PI) % (Math.PI * 2);

            if (p_off > Math.PI)
                p_off -= Math.PI * 2;
            if (p_off < -Math.PI)
                p_off += Math.PI * 2;
        }

        p_off = Math.min(Math.max(p_off, -swp), swp);

        p_dir = p_off + dir;
    };
    
    var tick = () => {
        for (var opp of opps) {
            opp[0] += Math.cos(opp[2]) * opp[4][0];
            opp[1] += Math.sin(opp[2]) * opp[4][0];
            opp[2] += opp[4][1];
            opp[3] += opp[4][2];
        }
        
        if (watching)
            return;
        
        if (!ttrm && (down || buttons["Space"] || buttons["o"] || buttons["x"]))
            window.onclick();
        
        (() => {
            var ds = [0, 0];
            
            chg[0] = 0;
            chg[1] = 0;

            if (buttons["w"] || buttons["ArrowUp"])
                ds = [1, 1];
            if (buttons["a"] || buttons["ArrowLeft"] || d_sp && (buttons["i"] || buttons["z"]) && p_dir - dir <= -(swp - Math.sqrt(swp) / 24 - (10 ** -10)))
                ds = [-1, 1];
            if (buttons["d"] || buttons["ArrowRight"] || d_sp && (buttons["p"] || buttons["c"]) && p_dir - dir >= (swp - Math.sqrt(swp) / 24 - (10 ** -10)))
                ds = [1, ds[0] == -1 ? 1 : -1];
            if (buttons["s"] || buttons["ArrowDown"])
                ds = [-(ds[0] || 1), -(ds[1] || 1)];

            if (ds[0] == 0)
                return;

            if (ds[0] == ds[1]) {
                var coll = spd;

                for (var wall of walls)
                    coll = Math.min(coll, box_collision(...pos, 24, 40, dir + (ds[0] == -1 ? Math.PI : 0), ...wall));

                for (var opp of opps)
                    if (opp[9] != army)
                        coll = Math.min(coll, box_collision(...pos, 24, 40, dir + (ds[0] == -1 ? Math.PI : 0), ...opp.slice(0, 2), 24, 40, opp[2]));
                
                if (coll < -0.02 + 10 ** -10)
                    coll = -0.1;
                
                if (ri_nc)
                    coll = spd;
                
                pos = [pos[0] + Math.cos(dir) * coll * ds[0], pos[1] + Math.sin(dir) * coll * ds[0]];
                
                chg[0] = coll * ds[0];

                return;
            }

            var coll = Math.sqrt(spd) / 48;
            
            /*for (var wall of walls)
                coll = Math.min(coll, box_rot_collision(...pos, 24, 40, dir + (ds[0] == -1 ? Math.PI : 0), ...wall));

            if (coll < -0.02 + 10 ** -10)
                coll = -0.1;*/
            
            var will_coll = 0;
            
            for (var wall of walls)
                will_coll = will_coll || box_is_coll(...pos, 24, 40, dir + coll * ds[0], ...wall);
            
            for (var opp of opps)
                if (opp[9] != army)
                    will_coll = will_coll || box_is_coll(...pos, 24, 40, dir + coll * ds[0], ...opp.slice(0, 2), 24, 40, opp[2]);
            
            if (ri_nc)
                will_coll = 0;
            
            if (!will_coll) {
                dir = ((dir + coll * ds[0]) % (Math.PI * 2) + (Math.PI * 2)) % (Math.PI * 2);
                
                chg[1] = coll * ds[0];

                if (d_stl) {
                    c_pos = null;

                    p_dir += coll * ds[0] * d_stl;
                }
            }
        })();
        
        p_dir_tick();
        
        if (ttr)
            ttr--;
        if (ttrm)
            ttrm--;
    };
    
    window.onmousemove = (info) => {
        if (watching)
            return;
        
        if (prompting)
            return;
        
        if (!c_ctrl)
            return;
        
        c_pos = [
            Math.atan2(info.clientY - display.height / 2, info.clientX - display.width / 2),
            Math.hypot(info.clientY - display.height / 2, info.clientX - display.width / 2)
        ];
        
        p_dir_tick();
    };
    
    window.onclick = (info) => {
        if (watching)
            return;
        
        if (prompting)
            return;
        
        if (info && info.ctrlKey && rir) {
            pos = [info.clientX - display.width / 2, info.clientY - display.height / 2];
            
            return;
        }
        
        if (ttr)
            return;
        
        if (info != null)
            window.onmousemove(info);
        
        var coll_id = -1;
        var coll = 1000;
        var c;
        
        if (!ri_bwc)
            for (var wall of walls)
                coll = Math.min(coll, collision([pos[0] + Math.cos(p_dir) * 26, pos[1] + Math.sin(p_dir) * 26], p_dir, ...wall));
        
        for (var opp of opps) {
            c = collision([pos[0] + Math.cos(p_dir) * 26, pos[1] + Math.sin(p_dir) * 26], p_dir, ...opp.slice(0, 2), 24, 40, opp[2]);
            
            if (c <= coll) {
                coll = c;
                
                coll_id = opp[9] == army ? -1 : opp[8];
            }
        }
        
        var round = (x, mr = Math.random()) => {
            var r = Math.floor(x);
            
            if (mr < x - r)
                r++;
            
            return r;
        };
        
        var mr = Math.random();
        
        ttr = round(rld * 40, mr);
        ttrm = round(rld * 44, mr) + 2;
        
        ttrd = ttr;
        
        trails.push([2, [[pos[0] + Math.cos(p_dir) * 26, pos[1] + Math.sin(p_dir) * 26], [pos[0] + Math.cos(p_dir) * (26 + coll), pos[1] + Math.sin(p_dir) * (26 + coll)]]]);
        
        if (ws.readyState == 1) {
            ws.send(JSON.stringify({
                bt: [[pos[0] + Math.cos(p_dir) * 26, pos[1] + Math.sin(p_dir) * 26], [pos[0] + Math.cos(p_dir) * (26 + coll), pos[1] + Math.sin(p_dir) * (26 + coll)]],
                hit: coll_id == -1 ? undefined : coll_id
            }));
        }
    };
    
    var colors = colorblind.checked ? ["#006ddb", "#920000"] : ["#208020", "#604020"];
    
    var draw = () => {
        c_2d.clearRect(0, 0, display.width, display.height);
        
        for (var t of trails) {
            if (t[0]-- == 0) {
                t.drop = 1;
                
                continue;
            }
            
            c_2d.beginPath();
            c_2d.moveTo(t[1][0][0] + display.width / 2, t[1][0][1] + display.height / 2);
            c_2d.lineTo(t[1][1][0] + display.width / 2, t[1][1][1] + display.height / 2);
            
            c_2d.stroke();
        }
        
        trails = trails.filter(t => !t.drop);
        
        var i = 0;
        
        for (var w of walls) {
            draw_box(...w);
        }
        
        c_2d.textAlign = "center";
        c_2d.textBaseline = "bottom";
        c_2d.font = chat_font_size + "px \"Atkinson Hyperlegible\", sans-serif";
        
        for (var opp of opps) {
            c_2d.strokeStyle = colors[opp[9]];
            
            draw_box(...opp.slice(0, 2), 24, 40, opp[2]);
            draw_box(...opp.slice(0, 2), 12, 12, opp[3]);
            draw_box(opp[0] + Math.cos(opp[3]) * 16, opp[1] + Math.sin(opp[3]) * 16, 4, 20, opp[3]);
            
            c_2d.fillStyle = "rgba(136, 0, 0, 0.4)";
            c_2d.strokeStyle = "rgba(136, 0, 0, 0.4)";
            
            c_2d.fillRect(opp[0] - 14 + display.width / 2, opp[1] - 14 + display.height / 2, (opp[5] / 100) * 28, 3);
            c_2d.strokeRect(opp[0] - 14 + display.width / 2, opp[1] - 14 + display.height / 2, 28, 2);
            
            c_2d.fillStyle = "#000000";
            c_2d.strokeStyle = "#000000";
            
            c_2d.fillText(opp[7], opp[0] + display.width / 2, opp[1] - 18 + display.height / 2);
        }
        
        if (!watching) {
            c_2d.strokeStyle = colors[army];

            draw_box(pos[0], pos[1], 24, 40, dir);
            draw_box(pos[0], pos[1], 12, 12, p_dir);
            draw_box(pos[0] + Math.cos(p_dir) * 16, pos[1] + Math.sin(p_dir) * 16, 4, 20, p_dir);
            
            if (draw_arrow) {
                c_2d.beginPath();
                c_2d.moveTo(pos[0] + Math.cos(dir + Math.PI) * 10 + display.width / 2, pos[1] + Math.sin(dir + Math.PI) * 10 + display.height / 2);
                c_2d.lineTo(pos[0] + Math.cos(dir + Math.PI) * 10 + Math.cos(dir + Math.PI + Math.PI / 4) * 8 + display.width / 2, pos[1] + Math.sin(dir + Math.PI) * 10 + Math.sin(dir + Math.PI + Math.PI / 4) * 8 + display.height / 2);
                c_2d.stroke();

                c_2d.beginPath();
                c_2d.moveTo(pos[0] + Math.cos(dir + Math.PI) * 10 + display.width / 2, pos[1] + Math.sin(dir + Math.PI) * 10 + display.height / 2);
                c_2d.lineTo(pos[0] + Math.cos(dir + Math.PI) * 10 + Math.cos(dir + Math.PI - Math.PI / 4) * 8 + display.width / 2, pos[1] + Math.sin(dir + Math.PI) * 10 + Math.sin(dir + Math.PI - Math.PI / 4) * 8 + display.height / 2);
                c_2d.stroke();
            }

            c_2d.fillStyle = "rgba(136, 0, 0, 0.4)";
            c_2d.strokeStyle = "rgba(136, 0, 0, 0.4)";

            c_2d.fillRect(pos[0] - 14 + display.width / 2, pos[1] - 14 + display.height / 2, (hp / 100) * 28, 3);
            c_2d.strokeRect(pos[0] - 14 + display.width / 2, pos[1] - 14 + display.height / 2, 28, 2);

            c_2d.fillStyle = "#000000";
            c_2d.strokeStyle = "#000000";

            if (ttr != 0) {
                c_2d.fillStyle = "rgba(0, 0, 0, 0.8)";
                c_2d.strokeStyle = "rgba(0, 0, 0, 0.8)";

                c_2d.fillRect(12, display.height - 16, (ttr / ttrd) * 96, 4);
                c_2d.strokeRect(12, display.height - 16, 96, 4);

                c_2d.fillStyle = "#000000";
                c_2d.strokeStyle = "#000000";
            }

            c_2d.fillStyle = "rgba(136, 0, 0, 0.8)";
            c_2d.strokeStyle = "rgba(136, 0, 0, 0.8)";

            c_2d.fillRect(12, display.height - 32, (hp / 100) * 144, 4);
            c_2d.strokeRect(12, display.height - 32, 144, 4);

            c_2d.fillStyle = "#000000";
            c_2d.strokeStyle = "#000000";
        }

        c_2d.textAlign = "left";
        c_2d.textBaseline = "top";

        for (var i = 0; i < chat.length; i++)
            c_2d.fillText(chat[i], 12, 12 + i * (chat_font_size * 1.25 | 0));
        
        if (watching) {
            c_2d.textBaseline = "bottom";
            
            c_2d.fillText("SPECTATING", 12, display.height - 12);
        }
    };
    
    setInterval(() => {
        tick();
        
        draw();
    }, 25);
    
    ws.onopen = () => {
        if (watching) {
            ws.send(JSON.stringify({
                start: {
                    id2: id2,
                    n: chat_name
                }
            }));
            
            return;
        }
        
        ws.send(JSON.stringify({
            start: {
                id: rid,
                id2: id2,
                stat_arm: stat_arm,
                stat_spd: stat_spd,
                stat_dmg: stat_dmg,
                stat_rld: stat_rld,
                n: chat_name,
                army: army
            }
        }));
    };
    
    ws.onmessage = (data) => {
        data = JSON.parse(data.data.toString());
        
        if (data.start) {
            pos = data.start.pos;
            army = data.start.army;
            
            dir = army == 0 ? 0 : Math.PI;
            p_dir = dir;
            
            chat = chat.concat(data.start.chat).slice(-chat_count);
            
            if (!watching) {
                setInterval(() => {
                    if (ws.readyState != 1)
                        return;

                    ws.send(JSON.stringify({
                        id: rid,
                        pos: pos,
                        dir: dir,
                        p_dir: p_dir,
                        chg: chg,
                        ttr: ttr
                    }));
                }, 100);
            }
            
            return;
        }
        
        opps = data[0];
        trails = trails.concat(data[1].map(t => [2, t]));
        chat = chat.concat(data[2]).slice(-chat_count);
        
        if (!watching) {
            hp = data[3];
        }
        
        // console.log(opps);
    };
    
    ws.onclose = async (info) => {
        await disp_prompt(info.reason ? info.reason : "WS Disconn: " + info.code);
    };
    
    window.mod = (f) => {
        eval(f.toString());
    };
})();