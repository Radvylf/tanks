(() => {
    var Tanks = window.Tanks;
    
    Tanks.start_inputs = () => {
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
        var c_down = 0;

        window.onkeydown = (info) => {
            if (Tanks.prompting())
                return;

            if (info.ctrlKey || info.altKey || info.metaKey)
                return;

            var id = info.code.startsWith("Key") ? info.code.slice(3).toLowerCase() : info.code;

            if (id == "Space" && !buttons["Space"] || id == "o" && !buttons["o"] || id == "x" && !buttons["x"])
                Tanks.try_shoot();

            if (id in buttons)
                buttons[id] = 1;
        };

        window.onkeyup = async (info) => {
            var id = info.code.startsWith("Key") ? info.code.slice(3).toLowerCase() : info.code;

            if (id == "t") {
                if (!Tanks.prompting() && Tanks.ws_on()) {
                    var chat_input = await Tanks.prompt_for_input("Chat: (prepend an ! for team chat)");

                    if (chat_input && Tanks.ws_on()) {
                        Tanks.ws({
                            t: "c",
                            c: chat_input
                        });
                    }
                }
            }

            if (Tanks.watching() && !Tanks.prompting() && id == "k")
                Tanks.click_pos([0, 0]);

            if (id in buttons)
                buttons[id] = 0;
        };

        window.onmousedown = () => {
            if (Tanks.watching() || Tanks.prompting())
                return;

            c_down = 1;
        };

        window.onmouseup = () => (c_down = 0);

        window.onmousemove = (info) => {
            if (Tanks.watching() || Tanks.prompting())
                return;

            c_pos = [
                Math.atan2(info.clientY - Tanks.display()[1] / 2, info.clientX - Tanks.display()[0] / 2),
                Math.hypot(info.clientY - Tanks.display()[1] / 2, info.clientX - Tanks.display()[0] / 2)
            ];

            Tanks.p_dir_tick();
        };

        window.onclick = (info) => {
            if (Tanks.watching() || Tanks.prompting())
                return;

            window.onmousemove(info);

            Tanks.try_shoot();
        };

        Tanks.no_c_pos = () => (c_pos = null);

        Tanks.buttons = () => JSON.parse(JSON.stringify(buttons));
        Tanks.c_pos = () => c_pos;
        Tanks.c_down = () => c_down;
    };
})();