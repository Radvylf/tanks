(() => {
    var Tanks = window.Tanks;
    
    var display = document.getElementById("display");
    var c_2d = display.getContext("2d");
    
    c_2d.imageSmoothingEnabled = false;
    
    var px;
    
    (window.onresize = () => {
        display.width = window.innerWidth;
        display.height = window.innerHeight;
        
        px = Math.sqrt(display.width * display.height) / 1000;
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
    
    var font = 11;
    
    var draw = () => {
        c_2d.clearRect(0, 0, display.width, display.height);
        
        var colors = Tanks.colorblind() ? ["#006ddb", "#920000"] : ["#208020", "#604020"];
        
        for (var w of Tanks.walls())
            draw_box(...w);
        
        c_2d.textAlign = "center";
        c_2d.textBaseline = "bottom";
        c_2d.font = font + "px \"Atkinson Hyperlegible\", sans-serif";
        
        for (var opp of Tanks.opps()) {
            c_2d.strokeStyle = colors[opp[9]];
            
            draw_box(...opp.slice(0, 2), 24, 40, opp[2]);
            draw_box(...opp.slice(0, 2), 12, 12, opp[3]);
            draw_box(opp[0] + Math.cos(opp[3]) * 16, opp[1] + Math.sin(opp[3]) * 16, 4, 20, opp[3]);
            
            c_2d.fillStyle = "rgba(136, 0, 0, 0.4)";
            c_2d.strokeStyle = "rgba(136, 0, 0, 0.4)";
            
            c_2d.fillRect(...from_pos(opp[0] - 14, opp[1] - 14), (opp[5] / 100) * 28, 3);
            c_2d.strokeRect(...from_pos(opp[0] - 14, opp[1] - 14), 28, 2);
            
            c_2d.fillStyle = "#000000";
            c_2d.strokeStyle = "#000000";
            
            c_2d.fillText(opp[7], ...from_pos(opp[0], opp[1] - 18));

            var bound = (value, max, min) => Math.min(Math.max(value, min), max);

            var [oppx, oppy] = from_pos(...opp);
            var [selfx, selfy] = from_pos(...Tanks.pos());

            if(oppx < 0 || oppx > display.width || oppy < 0 || oppy > display.height){
                var boundedx = bound(oppx, display.width - 15, 15), boundedy = bound(oppy, display.height - 15, 15);

                c_2d.save();
                c_2d.translate(boundedx, boundedy);
                c_2d.rotate(Math.atan2(selfy - oppy, selfx - oppx));

                c_2d.beginPath();
                c_2d.moveTo(-10, 0);
                c_2d.lineTo(10, -10);
                c_2d.lineTo(0, 0);
                c_2d.lineTo(10, 10);

                c_2d.closePath()  
                c_2d.strokeStyle = colors[opp[9]];      
                c_2d.stroke();

                c_2d.restore()
            }
        }
        
        var pos = Tanks.pos();
        var dir = Tanks.dir();
        var p_dir = Tanks.p_dir();
        
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