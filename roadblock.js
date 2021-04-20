const asciiArtLogo = "\n" +
    " _____      _ _            _      ______                _______ _            _    \n" +
    "|  ___|    (_| |          | |     | ___ \\              | | ___ | |          | |   \n" +
    "| |__ _ __  _| |_ ___  ___| |__   | |_/ /___   __ _  __| | |_/ | | ___   ___| | __\n" +
    "|  __| '_ \\| | __/ _ \\/ __| '_ \\  |    // _ \\ / _` |/ _` | ___ | |/ _ \\ / __| |/ /\n" +
    "| |__| |_) | | ||  __| (__| | | | | |\\ | (_) | (_| | (_| | |_/ | | (_) | (__|   < \n" +
    "\\____| .__/|_|\\__\\___|\\___|_| |_| \\_| \\_\\___/ \\__,_|\\__,_\\____/|_|\\___/ \\___|_|\\_\\\n" +
    "     | |                                                                          \n" +
    "     |_|                                                                          \n\n";
const homeUrl = "https://intra.epitech.eu/?format=json";
const moduleRegex = new RegExp("([A-Z]-[A-Z]{3}-([0-9]|x){3})");
const cross = "✘";
const mark = "✔";
let userJson = {};
let credits = 0;

const epiLog = (msg, type = "debug") => {
    switch (type) {
        case "debug":
            console.debug("[Epitech RoadBlock] %s", msg);
            break;
        case "info":
            console.info("[Epitech RoadBlock] %s", msg);
            break;
        case "error":
            console.error("[Epitech RoadBlock] %s", msg);
            break;
        case "warn":
            console.warn("[Epitech RoadBlock] %s", msg);
            break;
    }
}

const replaceAll = (string, search, replace) => {
    return string.split(search).join(replace);
}

const printLogo = async () => {
    console.log(asciiArtLogo);
}

const checkUrl = async () => {
    epiLog("Checking url to match roadblock modules...")
    const roadBlockUrlRegex = new RegExp(".*:\\/\\/intra.epitech.eu\\/module\\/[0-9]{4}\\/B-EPI-[0-9]{3}\\/.*");
    let url = window.location.href;
    if (!roadBlockUrlRegex.test(url))
        throw "The url doesn't match Epitech Roadblock modules !";
}

const getUrl = async (url) => {
    let data;
    try {
        epiLog("Fetching data to " + url);
        const result = fetch(url, {
            method: "GET"
        });
        data = (await result).json();
    } catch (e) {
        epiLog(e, "error");
        throw "Request error " + url;
    }
    return data;
}

const getJsonModuleInfo = async (module_name) => {
    let jsons = [];
    for (const mod of userJson.current) {
        if (module_name.indexOf("x") >= 0) {
            let regex_module_name = replaceAll(module_name, "x", "[0-9]");
            let regex = new RegExp(regex_module_name);
            if (regex.test(mod.code_module))
                jsons.push(mod);
        } else if (mod.code_module === module_name) {
            jsons.push(mod);
            break;
        }
    }
    return (jsons);
}

const getModuleInfo = async (line) => {
    let words = replaceAll(replaceAll(line, "(", ""), ")", "").split(" ");
    let text = null;
    for (const word of words) {
        if (moduleRegex.test(word)) {
            let json = await getJsonModuleInfo(word);
            if (json.length !== 0) {
                for (let i = 0; i < json.length; i++) {
                    let failed = (json[i].grade === "-" || json[i].grade === "Echec");
                    if (text !== null) {
                        text = text + " | " + "Credits : " + (failed ? "0" : json[i].credits) + "/" + json[i].credits + " " + (failed ? cross : mark)
                        credits += failed ? 0 : parseInt(json[i].credits);
                    } else {
                        text = "Credits : " + (failed ? "0" : json[i].credits) + "/" + json[i].credits + " " + (failed ? cross : mark);
                        credits += failed ? 0 : parseInt(json[i].credits);
                    }
                }
            } else
                text = "You are not registered for this module !";
        }
    }
    return text;
}

const getRoadBLockModules = async () => {
    let moduleInfo = document.querySelector("div.bloc.main > div.data > div.item.desc > div.text");
    if (moduleInfo === undefined)
        throw "Can't get the module info div ! ";
    let lines = moduleInfo.innerHTML.split("\n");
    let neededCredits = 0;
    lines[2].split(" ").forEach(word => {
        if (!isNaN(parseInt(word)))
            neededCredits = parseInt(word);
    })
    for (let i = 0; i < lines.length; i++) {
        if (moduleRegex.test(lines[i])) {
            epiLog(lines[i].trim());
            let res = await getModuleInfo(lines[i]);
            lines[i] = lines[i] + " - <strong>" + res + " </strong>";
        }
    }
    epiLog("Needed Credits : " + credits + "/" + neededCredits);
    let failed = credits < neededCredits;
    lines[2] = lines[2] + " - <strong> Credits : " + credits + "/" + neededCredits + " " + (failed ? cross : mark) + "</strong>";
    moduleInfo.innerHTML = lines.join("\n");
}

const main = async () => {
    epiLog("Loading Epitech Roadblock extension...");
    await printLogo();
    await checkUrl();
    userJson = await getUrl(homeUrl);
    await getRoadBLockModules();
}

main().catch(err => epiLog(err));