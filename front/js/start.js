(() => {
    var Tanks = window.Tanks;
    
    var doc = {
        start_cont: document.getElementById("start_cont"),
        start_name: document.getElementById("start_name"),
        colorblind: document.getElementById("colorblind"),
        stat: {
            arm: document.getElementById("start_arm"),
            spd: document.getElementById("start_spd"),
            dmg: document.getElementById("start_dmg"),
            rld: document.getElementById("start_rld")
        },
        total: document.getElementById("total"),
        total_invalid: document.getElementById("total_invalid"),
        start_play: document.getElementById("start_play"),
        start_watch: document.getElementById("start_watch")
    };
    
    Tanks.start = () => new Promise((r) => {
        var draw_doc = () => {
            var name = doc.start_name.value;

            var stat_arm = +doc.stat.arm.value;
            var stat_spd = +doc.stat.spd.value;
            var stat_dmg = +doc.stat.dmg.value;
            var stat_rld = +doc.stat.rld.value;

            var name_invalid = 0;
            var stat_invalid = 0;

            doc.stat.arm.className = "";
            doc.stat.spd.className = "";
            doc.stat.dmg.className = "";
            doc.stat.rld.className = "";

            doc.total_invalid.style.display = "";

            if (name.length < 2 || name.length > 28)
                name_invalid = 1;

            if (stat_arm != stat_arm || stat_arm < 0 || stat_arm > 100 || !Number.isInteger(stat_arm)) {
                doc.stat.arm.className = "invalid";

                stat_invalid = 1;
            }

            if (stat_spd != stat_spd || stat_spd < 0 || stat_spd > 100 || !Number.isInteger(stat_spd)) {
                doc.stat.spd.className = "invalid";

                stat_invalid = 1;
            }

            if (stat_dmg != stat_dmg || stat_dmg < 0 || stat_dmg > 100 || !Number.isInteger(stat_dmg)) {
                doc.stat.dmg.className = "invalid";

                stat_invalid = 1;
            }

            if (stat_rld != stat_rld || stat_rld < 0 || stat_rld > 100 || !Number.isInteger(stat_rld)) {
                doc.stat.rld.className = "invalid";

                stat_invalid = 1;
            }

            doc.total.textContent = stat_invalid ? "-" : stat_arm + stat_spd + stat_dmg + stat_rld;

            if (!stat_invalid && stat_arm + stat_spd + stat_dmg + stat_rld != 200) {
                doc.total_invalid.style.display = "inline";

                stat_invalid = 1;
            }

            doc.start_play.disabled = name_invalid || stat_invalid;
            doc.start_watch.disabled = name_invalid;

            doc.start_play.title = name_invalid ? "Name must be 2 to 28 characters" : stat_invalid ? "All stats must be integers between 0 and 100, and sum to 200" : "";
            doc.start_watch.title = name_invalid ? "Name must be 2 to 28 characters" : "";
        };
        
        doc.start_name.oninput = () => {
            draw_doc();
        };

        doc.stat.arm.oninput = () => {
            draw_doc();
        };

        doc.stat.spd.oninput = () => {
            draw_doc();
        };

        doc.stat.dmg.oninput = () => {
            draw_doc();
        };

        doc.stat.rld.oninput = () => {
            draw_doc();
        };

        try {
            doc.start_name.value = window.localStorage.getItem("name") || "";

            doc.colorblind.checked = +window.localStorage.getItem("colorblind");

            doc.stat.arm.value = window.localStorage.getItem("stat_arm") || 20;
            doc.stat.spd.value = window.localStorage.getItem("stat_spd") || 80;
            doc.stat.dmg.value = window.localStorage.getItem("stat_dmg") || 80;
            doc.stat.rld.value = window.localStorage.getItem("stat_rld") || 20;

            draw_doc();
        } catch (info) {
            draw_doc();
        }
        
        var finish = (watching) => {
            try {
                window.localStorage.setItem("name", doc.start_name.value);

                window.localStorage.setItem("colorblind", +doc.colorblind.checked);

                if (!watching) {
                    window.localStorage.setItem("stat_arm", doc.stat.arm.value);
                    window.localStorage.setItem("stat_spd", doc.stat.spd.value);
                    window.localStorage.setItem("stat_dmg", doc.stat.dmg.value);
                    window.localStorage.setItem("stat_rld", doc.stat.rld.value);
                }

                doc.start_cont.style.display = "none";
            } catch (info) {
                doc.start_cont.style.display = "none";
            }
        };

        doc.start_play.onclick = () => {
            if (!doc.start_play.disabled) {
                finish(0);
                
                r({
                    watching: 0,
                    name: doc.start_name.value,
                    colorblind: doc.colorblind.checked,
                    stats: {
                        arm: +doc.stat.arm.value,
                        spd: +doc.stat.spd.value,
                        dmg: +doc.stat.dmg.value,
                        rld: +doc.stat.rld.value
                    }
                });
            }
        };

        doc.start_watch.onclick = () => {
            if (!doc.start_watch.disabled) {
                finish(1);
                
                r({
                    watching: 1,
                    name: doc.start_name.value,
                    colorblind: doc.colorblind.checked,
                    stats: {
                        arm: +doc.stat.arm.value,
                        spd: +doc.stat.spd.value,
                        dmg: +doc.stat.dmg.value,
                        rld: +doc.stat.rld.value
                    }
                });
            }
        };
    });
})();