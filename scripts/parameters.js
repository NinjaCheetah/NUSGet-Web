// Parameter-related logic, controls what fields are enabled based on current options and parses parameters in the URL.
document.addEventListener("DOMContentLoaded", () => {
    const radios = document.querySelectorAll('input[type=radio][name=format]');
    radios.forEach(radio => radio.addEventListener('change', () => toggleWADNameEntry(radio.value)));
    parseURLParams();
});

function parseURLParams() {
    const paramsString = window.location.search;
    const params = new URLSearchParams(paramsString);

    if (params.get("tid") !== null) {
        let tid = document.getElementById("tid-entry");
        tid.value = params.get("tid");
    }
    if (params.get("ver") !== null && params.get("ver") !== "-1" && params.get("ver") !== "latest") {
        // Only load the specified version if it isn't -1/latest, since the code will assume latest anyway.
        let ver = document.getElementById("ver-entry");
        ver.value = params.get("ver");
    }
    if (params.get("console") !== null) {
        // Console names are stored in lower case, so force the parameter into lower case.
        let tgtConsole = document.getElementById("consoles");
        const consoleParam = params.get("console").toLowerCase();
        switch(consoleParam) {
            case "wii":
                tgtConsole.value = consoleParam;
                break;
            case "vwii":
                tgtConsole.value = consoleParam;
                break;
            case "dsi":
                tgtConsole.value = consoleParam;
                break;
        }
    }
    if (params.get("format") !== null) {
        // Same as the console name, use lower case.
        const format = params.get("format").toLowerCase();
        let selectedFormat;
        switch(format) {
            case "wad":
                selectedFormat = document.getElementById("wad");
                selectedFormat.checked = true;
                break;
            case "enc":
                selectedFormat = document.getElementById("enc");
                selectedFormat.checked = true;
                break;
            case "dec":
                selectedFormat = document.getElementById("dec");
                selectedFormat.checked = true;
                break;
        }
    }
    if (params.get("wadname") !== null) {
        let wadFileName = document.getElementById("wad-name-entry");
        wadFileName.value = params.get("wadname");
    }
}

async function toggleWADNameEntry(selectedFormat) {
    let wadNameEntry = document.getElementById("wad-name-entry");
    wadNameEntry.disabled = selectedFormat !== "wad";
}
