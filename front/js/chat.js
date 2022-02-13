(() => {
    var Tanks = window.Tanks;
    
    var chat = [];
    
    Tanks.chat = () => [...chat];
    Tanks.push_chat = (n_chat) => (chat = chat.concat(n_chat).slice(-10));
})();