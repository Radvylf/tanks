(() => {
    var Tanks = window.Tanks;
    
    var display = document.getElementById("display");
    var c_2d = display.getContext("2d");
    
    c_2d.imageSmoothingEnabled = false;
    
    var px;
    
    var wdims;
    
    (window.onresize = () => {
        display.width = window.innerWidth;
        display.height = window.innerHeight;
        
        px = Math.sqrt(display.width * display.height) / 1000;
        
        wdims = [display.width / px, display.height / px];
    })();
    
    var scrolling = 1;
    
    var from_pos = (...point) => {
        var pos2 = [...Tanks.pos()];
        
        if (!scrolling)
            pos2 = [0, 0];
        
        return [
            (point[0] - pos2[0]) * px + display.width / 2,
            (point[1] - pos2[1]) * px + display.height / 2
        ];
    };
    
    var draw_box = (x, y, sx, sy, r = 0) => {
        var cos_r = Math.cos(r);
        var sin_r = Math.sin(r);
        
        sx /= 2;
        sy /= 2;
        
        var offset = ([x, y], d, w) => [x + Math.cos(r + d) * w, y + Math.sin(r + d) * w];
        
        c_2d.beginPath();
        c_2d.moveTo(...from_pos(...offset(offset([x, y], Math.PI / 2, sx), 0, sy)));
        c_2d.lineTo(...from_pos(...offset(offset([x, y], Math.PI * 3 / 2, sx), 0, sy)));
        c_2d.lineTo(...from_pos(...offset(offset([x, y], Math.PI * 3 / 2, sx), Math.PI, sy)));
        c_2d.lineTo(...from_pos(...offset(offset([x, y], Math.PI / 2, sx), Math.PI, sy)));
        c_2d.closePath();
        
        c_2d.stroke();
    };
    
    var invis_dist = Math.sqrt(400 + 144);
    
    var font = 11;
    
    var draw = () => {
        c_2d.clearRect(0, 0, display.width, display.height);
        
        var colors = Tanks.colorblind() ? ["#006ddb", "#920000"] : ["#208020", "#604020"];
        
        for (var w of Tanks.walls())
            draw_box(...w);
        
        for (var w of Tanks.windows())
            draw_box(...w);
        
        c_2d.font = font + "px \"Atkinson Hyperlegible\", sans-serif";
        
        var pos = Tanks.pos();
        var dir = Tanks.dir();
        var p_dir = Tanks.p_dir();
        
        var atan2, bounds;
        
        for (var tank of Tanks.tanks()) {
            c_2d.strokeStyle = colors[tank.army];
            
            draw_box(...tank.pos, 24, 40, tank.dir);
            draw_box(...tank.pos, 12, 12, tank.p_dir);
            draw_box(tank.pos[0] + Math.cos(tank.p_dir) * 16, tank.pos[1] + Math.sin(tank.p_dir) * 16, 4, 20, tank.p_dir);
            
            c_2d.fillStyle = "rgba(136, 0, 0, 0.4)";
            c_2d.strokeStyle = "rgba(136, 0, 0, 0.4)";
            
            c_2d.fillRect(...from_pos(tank.pos[0] - 14, tank.pos[1] - 14), (tank.hp / 100) * 28, 3);
            c_2d.strokeRect(...from_pos(tank.pos[0] - 14, tank.pos[1] - 14), 28, 2);
            
            c_2d.fillStyle = "#000000";
            c_2d.strokeStyle = "#000000";
            
            c_2d.textAlign = "center";
            c_2d.textBaseline = "bottom";
            
            c_2d.fillText(tank.name, ...from_pos(tank.pos[0], tank.pos[1] - 18));
            
            if (((tank.pos[0] - pos[0]) + invis_dist < -(wdims[0] / 2) || (tank.pos[0] - pos[0]) - invis_dist > wdims[0] / 2) || ((tank.pos[1] - pos[1]) + invis_dist < -(wdims[1] / 2) || (tank.pos[1] - pos[1]) - invis_dist > wdims[1] / 2)) {
                c_2d.strokeStyle = colors[tank.army];
                
                bounds = [
                    tank.pos[0] < pos[0] ? [12, ((tank.pos[1] - pos[1]) / (pos[0] - tank.pos[0])) * (display.width / 2 - 12) + display.height / 2] : [display.width - 12, ((tank.pos[1] - pos[1]) / (tank.pos[0] - pos[0])) * (display.width / 2 - 12) + display.height / 2],
                    tank.pos[1] < pos[1] ? [(display.height / 2 - 12) / ((tank.pos[1] - pos[1]) / (pos[0] - tank.pos[0])) + display.width / 2, 12] : [(display.height / 2 - 12) / ((tank.pos[1] - pos[1]) / (tank.pos[0] - pos[0])) + display.width / 2, display.height - 12]
                ];
                
                if (pos[0] == tank.pos[0])
                    bounds = [[display.width / 2, (wdims[1] - 12) * Math.sign(tank.pos[1] - pos[1])]];
                if (pos[1] == tank.pos[1])
                    bounds = [[(wdims[0] - 12) * Math.sign(tank.pos[0] - pos[0]), display.height / 2]];
                
                bounds = bounds.sort((b1, b2) => Math.sqrt((b1[0] - pos[0]) ** 2 + (b1[1] - pos[1]) ** 2) - Math.sqrt((b2[0] - pos[0]) ** 2 + (b2[1] - pos[1]) ** 2));
                
                atan2 = Math.atan2(tank.pos[1] - pos[1], tank.pos[0] - pos[0]);
                
                c_2d.lineWidth = 2;
                
                c_2d.beginPath();
                c_2d.moveTo(bounds[0][0], bounds[0][1]);
                c_2d.lineTo(bounds[0][0] + Math.cos(atan2 + Math.PI + Math.PI / 4) * 8, bounds[0][1] + Math.sin(atan2 + Math.PI + Math.PI / 4) * 8);
                c_2d.moveTo(bounds[0][0], bounds[0][1]);
                c_2d.lineTo(bounds[0][0] + Math.cos(atan2 + Math.PI - Math.PI / 4) * 8, bounds[0][1] + Math.sin(atan2 + Math.PI - Math.PI / 4) * 8);
                
                c_2d.stroke();
            
                c_2d.fillStyle = "#000000";
                c_2d.strokeStyle = "#000000";
                
                c_2d.lineWidth = 1;
            
                c_2d.textAlign = bounds[0][0] < display.width / 3 ? "left" : bounds[0][0] < display.width * 2 / 3 ? "center" : "right";
                c_2d.textBaseline = bounds[0][1] < display.height / 3 ? "top" : bounds[0][1] < display.height * 2 / 3 ? "middle" : "bottom";
                
                c_2d.fillText(tank.name, bounds[0][0] + Math.cos(atan2 + Math.PI) * 12, bounds[0][1] + Math.sin(atan2 + Math.PI) * 12);
            }
        }
        
        if (!Tanks.watching()) {
            c_2d.strokeStyle = colors[Tanks.army()];

            draw_box(pos[0], pos[1], 24, 40, dir);
            draw_box(pos[0], pos[1], 12, 12, p_dir);
            draw_box(pos[0] + Math.cos(p_dir) * 16, pos[1] + Math.sin(p_dir) * 16, 4, 20, p_dir);
            
            c_2d.beginPath();
            c_2d.moveTo(...from_pos(pos[0] + Math.cos(dir + Math.PI) * 10, pos[1] + Math.sin(dir + Math.PI) * 10));
            c_2d.lineTo(...from_pos(pos[0] + Math.cos(dir + Math.PI) * 10 + Math.cos(dir + Math.PI + Math.PI / 4) * 8, pos[1] + Math.sin(dir + Math.PI) * 10 + Math.sin(dir + Math.PI + Math.PI / 4) * 8));

            c_2d.stroke();

            c_2d.beginPath();
            c_2d.moveTo(...from_pos(pos[0] + Math.cos(dir + Math.PI) * 10, pos[1] + Math.sin(dir + Math.PI) * 10));
            c_2d.lineTo(...from_pos(pos[0] + Math.cos(dir + Math.PI) * 10 + Math.cos(dir + Math.PI - Math.PI / 4) * 8, pos[1] + Math.sin(dir + Math.PI) * 10 + Math.sin(dir + Math.PI - Math.PI / 4) * 8));

            c_2d.stroke();

            c_2d.fillStyle = "rgba(136, 0, 0, 0.4)";
            c_2d.strokeStyle = "rgba(136, 0, 0, 0.4)";

            c_2d.fillRect(...from_pos(pos[0] - 14, pos[1] - 14), (Tanks.hp() / 100) * 28, 3);
            c_2d.strokeRect(...from_pos(pos[0] - 14, pos[1] - 14), 28, 2);

            c_2d.fillStyle = "#000000";
            c_2d.strokeStyle = "#000000";
        }
        
        for (var t of Tanks.trails()) {
            c_2d.beginPath();
            c_2d.moveTo(...from_pos(...t[1][0]));
            c_2d.lineTo(...from_pos(...t[1][1]));
            
            c_2d.stroke();
        }

        if (!Tanks.watching()) {
            if (Tanks.ttr() != 0) {
                c_2d.fillStyle = "rgba(0, 0, 0, 0.8)";
                c_2d.strokeStyle = "rgba(0, 0, 0, 0.8)";

                c_2d.fillRect(12, display.height - 16, (Tanks.ttr() / Tanks.ttrd()) * 96, 4);
                c_2d.strokeRect(12, display.height - 16, 96, 4);

                c_2d.fillStyle = "#000000";
                c_2d.strokeStyle = "#000000";
            }

            c_2d.fillStyle = "rgba(136, 0, 0, 0.8)";
            c_2d.strokeStyle = "rgba(136, 0, 0, 0.8)";

            c_2d.fillRect(12, display.height - 32, (Tanks.hp() / 100) * 144, 4);
            c_2d.strokeRect(12, display.height - 32, 144, 4);

            c_2d.fillStyle = "#000000";
            c_2d.strokeStyle = "#000000";
        }

        c_2d.textAlign = "left";
        c_2d.textBaseline = "top";

        for (var i = 0; i < Tanks.chat().length; i++)
            c_2d.fillText(Tanks.chat()[i], 12, 12 + i * (font * 1.25 | 0));
        
        if (Tanks.watching()) {
            c_2d.textBaseline = "bottom";
            
            c_2d.fillText("SPECTATING", 12, display.height - 12);
        }
    };
    
    Tanks.display = () => [display.width, display.height];
    
    Tanks.draw = draw;
})();