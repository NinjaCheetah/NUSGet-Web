// Main app logic for NUSGet Web, handling argument parsing and downloading.
document.addEventListener("DOMContentLoaded", () => {
    document.getElementById("download-btn").onclick = startDownload;
});

//let api_url = "http://localhost:8000"
let api_url = "https://api.nusget.ninjacheetah.dev"

let status_text = document.getElementById("status-text");

async function startDownload() {
    let selectedFormat = document.querySelector('input[name=format]:checked').value;
    let wadName = document.getElementById("wad-name-entry").value;
    let tid = document.getElementById("tid-entry").value;
    console.log(`Target TID: ${tid}`);
    if (tid.length !== 16) {
        console.log("No valid TID entered! Aborting.");
        status_text.innerHTML = "Please enter a valid Title ID.";
        return;
    }
    let ver = document.getElementById("ver-entry").value;
    console.log(`Target Version: ${ver}`);
    if (ver === "") {
        console.log("No version was specified! Using -1 to signal latest.");
        ver = -1;
    }
    let tgtConsole = document.getElementById("consoles").value;
    console.log(`Target Console: ${tgtConsole}`);
    status_text.innerHTML = "Downloading title... please wait.";
    // Construct a URL with parameters and set that, so someone could copy it and share it.
    const usedParams = new URLSearchParams();
    usedParams.append("tid", tid);
    if (ver !== -1 && ver !== "-1" && ver !== "latest") {
        usedParams.append("ver", ver);
    }
    if (tgtConsole !== "wii") {
        usedParams.append("console", tgtConsole);
    }
    if (selectedFormat !== "wad") {
        usedParams.append("format", selectedFormat);
    }
    // Don't save the WAD name if this isn't a WAD.
    if (wadName !== "" && selectedFormat === "wad") {
        usedParams.append("wadname", wadName);
    }
    let url = new URL(window.location.href)
    url.search = usedParams.toString();
    history.pushState({}, '', url.href)
    //window.location.search = usedParams.toString();
    console.log(window.location.href);
    console.log(usedParams.toString());
    // Trigger the appropriate download function.
    switch(selectedFormat) {
        case 'wad':
            await downloadWAD(tid, ver, tgtConsole);
            break;
        case 'enc':
            await downloadEncrypted(tid, ver);
            break;
        case 'dec':
            await downloadDecrypted(tid, ver);
            break;
    }
}

async function downloadWAD(tid, ver, tgtConsole) {
    const targetUrl = `${api_url}/v1/titles/${tid}/versions/${ver}/download/${(tgtConsole === "dsi" ? "tad" : "wad")}`
    try {
        const [metadata, apiResponse] = await makeRequest(targetUrl);
        // Parse the WAD name entry to see if a custom name was set.
        let wadNameEntry = document.getElementById("wad-name-entry").value;
        let fileName = `${metadata["tid"]}-v${metadata["version"]}.${(tgtConsole === "dsi" ? "tad" : "wad")}`
        if (wadNameEntry !== "") {
            if (tgtConsole === "dsi") {
                if (wadNameEntry.slice(-4) !== ".tad") {
                    wadNameEntry += ".tad";
                }
            }
            else {
                if (wadNameEntry.slice(-4) !== ".wad") {
                    wadNameEntry += ".wad";
                }
            }
            fileName = wadNameEntry;
        }
        await downloadFile(apiResponse, fileName);
        status_text.innerHTML = `Download complete! File has been saved as "${fileName}."`;
    } catch (e) {
        console.error("An error occurred during the download. Details are likely above.");
    }
}

async function downloadEncrypted(tid, ver) {
    const targetUrl = `${api_url}/v1/titles/${tid}/versions/${ver}/download/enc`
    try {
        const [metadata, apiResponse] = await makeRequest(targetUrl);
        const fileName = `${metadata["tid"]}-v${metadata["version"]}-Encrypted.zip`
        await downloadFile(apiResponse, fileName);
        status_text.innerHTML = `Download complete! File has been saved as "${fileName}."`;
    } catch (e) {
        console.error("An error occurred during the download. Details are likely above.");
    }
}

async function downloadDecrypted(tid, ver) {
    const targetUrl = `${api_url}/v1/titles/${tid}/versions/${ver}/download/dec`
    try {
        const [metadata, apiResponse] = await makeRequest(targetUrl);
        const fileName = `${metadata["tid"]}-v${metadata["version"]}-Decrypted.zip`
        await downloadFile(apiResponse, fileName);
        status_text.innerHTML = `Download complete! File has been saved as "${fileName}."`;
    } catch (e) {
        console.error("An error occurred during the download. Details are likely above.");
    }
}

async function makeRequest(api_url) {
    try {
        const response = await fetch(api_url);
        if (!response.ok) {
            console.error(`Response status: ${response.status}`);
            try {
                let response_details = await response.json();
                console.error(response_details);
                switch (response_details.code) {
                    case "title.notfound":
                        status_text.innerHTML = `The Title or version you're trying to download cannot be found.`;
                        break;
                    case "title.notik":
                        status_text.innerHTML = `The Title you're trying to download does not have a Ticket. You cannot download a WAD or decrypted contents.`;
                        break;
                    default:
                        status_text.innerHTML = `An error occurred. API returned "${response_details.message}"`;
                        break;
                }
            } catch (e) {
                console.error("No further details could be provided.")
                status_text.innerHTML = "An unknown error occurred."
            }
            return;
        }
        const metadata = JSON.parse(response.headers.get("X-Metadata"));
        let api_response = await response.blob();
        return [metadata, api_response];
    } catch (e) {
        console.error(e);
        status_text.innerHTML = "An unknown error occurred. The API may be unavailable."
        throw Error("Download could not be completed.")
    }
}

async function downloadFile(fileBlob, fileName) {
    const url = window.URL.createObjectURL(fileBlob);
    const a = document.createElement("a");
    a.href = url;
    console.log(`Saving file as "${fileName}"`);
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
}
