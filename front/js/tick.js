(() => {
    var Tanks = window.Tanks;
    
    var arm, spd, swp, dmg, rld;
    
    var pos = [0, 0];
    var dir = 0;
    var p_dir = 0;
    var chg = [0, 0];
    
    var ttr = 0;
    var ttrm = 0;
    var ttrd = 0;
    
    var hp = 100;
    
    var tanks = [];
    var trails = [];
    var walls = [];
    
    var army;
    
    var scroll_spd = 2;
    
    var watching_tick = () => {
        var buttons = Tanks.buttons();
        
        if (buttons["w"] || buttons["ArrowUp"])
            pos[1] -= scroll_spd;
        if (buttons["a"] || buttons["ArrowLeft"])
            pos[0] -= scroll_spd;
        if (buttons["d"] || buttons["ArrowRight"])
            pos[0] += scroll_spd;
        if (buttons["s"] || buttons["ArrowDown"])
            pos[1] += scroll_spd;
        
        trails = trails.filter(t => t[0] > 0);
        
        for (var t of trails)
            t[0]--;
        
        for (var tank of tanks) {
            tank.pos[0] += Math.cos(tank.dir) * tank.chg[0];
            tank.pos[1] += Math.sin(tank.dir) * tank.chg[0];
            tank.dir += tank.chg[1];
        }
    };
    
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
    
    var try_shoot = () => {
        if (ttr)
            return;
        
        var coll_id = -1;
        var coll = 1000;
        var c;
        
        for (var wall of walls)
            coll = Math.min(coll, collision([pos[0] + Math.cos(p_dir) * 26, pos[1] + Math.sin(p_dir) * 26], p_dir, ...wall));
        
        for (var tank of tanks) {
            c = collision([pos[0] + Math.cos(p_dir) * 26, pos[1] + Math.sin(p_dir) * 26], p_dir, ...tank.pos, 24, 40, tank.dir);
            
            if (c <= coll) {
                coll = c;
                
                coll_id = tank.army == army ? -1 : tank.id;
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
        
        if (Tanks.ws_on()) {
            Tanks.ws({
                t: "b",
                b: [[pos[0] + Math.cos(p_dir) * 26, pos[1] + Math.sin(p_dir) * 26], [pos[0] + Math.cos(p_dir) * (26 + coll), pos[1] + Math.sin(p_dir) * (26 + coll)], coll_id == -1 ? undefined : coll_id]
            });
        }
    };
    
    var p_dir_tick = () => {
        var buttons = Tanks.buttons();
        
        if ((buttons["i"] || buttons["z"]) && p_dir - dir > -(swp + (10 ** -10))) {
            Tanks.no_c_pos();
            
            p_dir -= Math.sqrt(spd) / 48;
        }
        
        if ((buttons["p"] || buttons["c"]) && p_dir - dir < (swp + (10 ** -10))) {
            Tanks.no_c_pos();
            
            p_dir += Math.sqrt(spd) / 48;
        }

        var p_off = p_dir - dir;
        
        if (Tanks.c_pos() != null)
            p_off = (Tanks.c_pos()[0] % (Math.PI * 2) + (Math.PI * 2)) % (Math.PI * 2) - dir;
        
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
        var buttons = Tanks.buttons();
        
        if (!ttrm && (Tanks.c_down() || buttons["Space"] || buttons["o"] || buttons["x"]))
            try_shoot();
        
        (() => {
            var ds = [0, 0];
            
            chg[0] = 0;
            chg[1] = 0;

            if (buttons["w"] || buttons["ArrowUp"])
                ds = [1, 1];
            if (buttons["a"] || buttons["ArrowLeft"] || (buttons["i"] || buttons["z"]) && p_dir - dir <= -(swp - Math.sqrt(swp) / 24 - (10 ** -10)))
                ds = [-1, 1];
            if (buttons["d"] || buttons["ArrowRight"] || (buttons["p"] || buttons["c"]) && p_dir - dir >= (swp - Math.sqrt(swp) / 24 - (10 ** -10)))
                ds = [1, ds[0] == -1 ? 1 : -1];
            if (buttons["s"] || buttons["ArrowDown"])
                ds = [-(ds[0] || 1), -(ds[1] || 1)];

            if (ds[0] == 0)
                return;

            if (ds[0] == ds[1]) {
                var coll = spd;

                for (var wall of walls)
                    coll = Math.min(coll, box_collision(...pos, 24, 40, dir + (ds[0] == -1 ? Math.PI : 0), ...wall));

                for (var tank of tanks)
                    if (tank.army != army)
                        coll = Math.min(coll, box_collision(...pos, 24, 40, dir + (ds[0] == -1 ? Math.PI : 0), ...tank.pos, 24, 40, tank.dir));
                
                if (coll < -0.02 + 10 ** -10)
                    coll = -0.1;
                
                pos = [pos[0] + Math.cos(dir) * coll * ds[0], pos[1] + Math.sin(dir) * coll * ds[0]];
                
                chg[0] = coll * ds[0];

                return;
            }

            var coll = Math.sqrt(spd) / 32;
            
            var will_coll = 0;
            
            for (var wall of walls)
                will_coll = will_coll || box_is_coll(...pos, 24, 40, dir + coll * ds[0], ...wall);
            
            for (var tank of tanks)
                if (tank.army != army)
                    will_coll = will_coll || box_is_coll(...pos, 24, 40, dir + coll * ds[0], ...tank.pos, 24, 40, tank.dir);
            
            if (!will_coll) {
                dir = ((dir + coll * ds[0]) % (Math.PI * 2) + (Math.PI * 2)) % (Math.PI * 2);
                
                chg[1] = coll * ds[0];
            }
        })();
        
        p_dir_tick();
        
        if (ttr)
            ttr--;
        if (ttrm)
            ttrm--;
        
        trails = trails.filter(t => t[0] > 0);
        
        for (var t of trails)
            t[0]--;
        
        for (var tank of tanks) {
            tank.pos[0] += Math.cos(tank.dir) * tank.chg[0];
            tank.pos[1] += Math.sin(tank.dir) * tank.chg[0];
            tank.dir += tank.chg[1];
        }
    };
    
    Tanks.click_pos = (n_pos) => {
        if (Tanks.watching())
            pos = n_pos;
    };
    
    Tanks.pos = () => [...pos];
    Tanks.dir = () => dir;
    Tanks.p_dir = () => p_dir;
    Tanks.chg = () => [...chg];
    
    Tanks.ttr = () => ttr;
    Tanks.ttrd = () => ttrd;
    
    Tanks.hp = () => hp;
    
    Tanks.tanks = () => JSON.parse(JSON.stringify(tanks));
    Tanks.trails = () => JSON.parse(JSON.stringify(trails));
    Tanks.walls = () => JSON.parse(JSON.stringify(walls));
    
    Tanks.army = () => army;
    
    Tanks.try_shoot = try_shoot;
    Tanks.p_dir_tick = p_dir_tick;
    
    Tanks.tick = () => (Tanks.watching() ? watching_tick() : tick());
    
    var can_start = 1;
    
    Tanks.start_incoming = (data) => {
        if (!can_start)
            return;
        
        can_start = 0;
        
        if (!Tanks.watching()) {
            pos = data.pos;
            army = data.army;

            dir = army == 0 ? 0 : Math.PI;
            p_dir = dir;
        }
        
        tanks = data.tanks;
        walls = data.walls;
        
        Tanks.push_chat(data.chat);
    
        if (!Tanks.watching()) {
            arm = 1 - 1 / 2.5 ** ((Tanks.stat().arm * 3) / 100);
            spd = 2 ** (Tanks.stat().spd / (100 / 3) - 2);
            swp = Math.PI / (2 ** (Tanks.stat().spd / 50 + 1));
            dmg = 2.5 ** ((Tanks.stat().dmg * 3) / 100) * 10;
            rld = 2.5 ** (((100 - Tanks.stat().rld) * 3) / 100) / 6.25/* / (625 / (stat_rld + 625))*/;
        }
    };
    
    Tanks.incoming = (data) => {
        switch (data[0]) {
            case "s":
                if (data[1].id != Tanks.id())
                    tanks.push(data[1]);
                
                break;
            case "p":
                var tank = tanks.find(t => t.id == data[1]);
                
                if (!tank)
                    break;
                
                tank.pos[0] = data[2][0];
                tank.pos[1] = data[2][1];
                tank.dir = data[2][2];
                tank.p_dir = data[2][3];
                tank.chg[0] = data[2][4];
                tank.chg[1] = data[2][5];
                
                break;
            case "k":
                if (data[1] == Tanks.id()) {
                    hp = data[2];
                    
                    break;
                }
                
                var tank = tanks.find(t => t.id == data[1]);
                
                if (!tank)
                    break;
                
                tank.hp = data[2];
                
                if (!data[2])
                    tanks = tanks.filter(t => t.id != data[1]);
                
                break;
            case "b":
                if (data[1] != Tanks.id())
                    trails.push([2, data.slice(2)]);
                
                break;
        }
    };
})();