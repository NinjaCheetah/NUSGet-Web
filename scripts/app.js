document.getElementById("downloadBtn").onclick = downloadTest;

async function downloadTest() {
    let status_text = document.getElementById("status-text");

    let tid = document.getElementById("tid-entry").value;
    console.log(`Target TID: ${tid}`);
    if (tid === "") {
        console.log("No TID was specified! Aborting.");
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

    //let api_url = "http://localhost:5000"
    let api_url = "https://api.nusget.ninjacheetah.dev"

    status_text.innerHTML = "Downloading title... please wait.";

    try {
        const response = await fetch(api_url + `/download/wad/${tid}/${ver}`);
        if (!response.ok) {
            console.error(`Response status: ${response.status}`);
        }
        const metadata = JSON.parse(response.headers.get("X-Metadata"));
        let api_response = await response.blob();
        const url = window.URL.createObjectURL(api_response);
        const a = document.createElement("a");
        a.href = url;
        a.download = `${metadata["tid"]}-v${metadata["version"]}.wad`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
    } catch (e) {
        console.error(e);
    }
}
