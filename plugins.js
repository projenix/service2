module.exports.call = function (name) {
    retour = tab[Math.floor(Math.random() * 2)];

    switch (name) {
        case "plugin1":
            return plugin1(name);

        case "plugin2":
            return plugin2(name);

        case "plugin3":
            return plugin3(name);
        case "plugin4":
            return plugin4(name);

    }
};

let tab = [0, "there is a problem  "];
let plugin1 = (name) => {
    return (typeof retour) === "number" ? retour : (retour + name)
};
let plugin2 = (name) => {
    return (typeof retour) === "number" ? retour : (retour + name)
};
let plugin3 = (name) => {
    return (typeof retour) === "number" ? retour : (retour + name)
};
let plugin4 = (name) => {
    return (typeof retour) === "number" ? retour : (retour + name)
};
