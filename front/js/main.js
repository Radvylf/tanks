(async () => {
    var Tanks = window.Tanks;
    
    var id = [...Array(8)].map(_ => "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_"[Math.random() * 64 | 0]).join("");
    
    Tanks.id = () => id;
    
    var start_data = await Tanks.start();
    
    Tanks.watching = () => start_data.watching;
    Tanks.name = () => start_data.name;
    Tanks.colorblind = () => start_data.colorblind;
    Tanks.stat = () => JSON.parse(JSON.stringify(start_data.stats));
    
    await Tanks.start_ws();
    
    Tanks.start_inputs();
    
    setInterval(() => {
        Tanks.tick();
        
        Tanks.draw();
    }, 25);
})();