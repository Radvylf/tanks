(() => {
    var Tanks = window.Tanks;
    
    var doc = {
        modal_cont: document.getElementById("modal_cont"),
        prompt: document.getElementById("modal_prompt"),
        input: document.getElementById("modal_input"),
    };
    
    var prompting = 0;
    
    var prompt_for_input = (prompt_info) => {
        doc.modal_cont.style.display = "flex";
        
        doc.prompt.textContent = prompt_info;
        doc.prompt.style.marginBottom = "";
        
        doc.input.style.display = "";
        doc.input.focus();
        
        prompting = 1;
        
        return new Promise((r) => {
            doc.input.onkeydown = (info) => {
                if (info.ctrlKey || info.altKey || info.metaKey)
                    return;
                
                if (info.code == "Escape" && !info.shiftKey) {
                    doc.modal_cont.style.display = "";
                    
                    prompting = 0;
                    doc.input.onkeydown = null;
                    
                    doc.input.value = "";
                    
                    r();
                }
                
                if (info.code == "Enter" && !info.shiftKey) {
                    doc.modal_cont.style.display = "";
                    
                    prompting = 0;
                    doc.input.onkeydown = null;
                    
                    r(doc.input.value);
                    
                    doc.input.value = "";
                }
            };
        });
    };
    
    var prompt_with_info = (info) => {
        doc.modal_cont.style.display = "flex";
        
        doc.prompt.textContent = info;
        doc.prompt.style.marginBottom = "0px";
        
        doc.input.style.display = "none";
    };
    
    Tanks.prompt_for_input = prompt_for_input;
    Tanks.prompt_with_info = prompt_with_info;
    Tanks.prompting = () => prompting;
})();