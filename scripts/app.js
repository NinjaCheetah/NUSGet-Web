document.getElementById("downloadBtn").onclick = downloadTest;

async function downloadTest() {
    let tid = document.getElementById("tid-entry").value;
    console.log(`Target TID: ${tid}`);
    if (tid === "") {
        console.log("No TID was specified! Aborting.");
        return;
    }

    var ver = document.getElementById("ver-entry").value;
    console.log(`Target Version: ${ver}`);
    if (ver === "") {
        console.log("No version was specified! Using -1 to signal latest.");
        ver = -1;
    }

    let tgtConsole = document.getElementById("consoles").value;
    console.log(`Target Console: ${tgtConsole}`);

    let url = `http://ccs.cdn.wup.shop.nintendo.net/ccs/download/${tid}/${(ver === -1) ? "tmd":`tmd.${ver}`}`
    console.log(url);

    const proxyUrl = "https://cors-anywhere.herokuapp.com/";

    var myBlob;
    try {
        const response = await fetch(url);
        if (!response.ok) {
          throw new Error(`Response status: ${response.status}`);
        }
        myBlob = await response.blob();
      } catch (e) {
        console.error(e);
      }

    saveAs(myBlob, "tmd");

    // let link = document.createElement("a");
    // link.download = name;
    // link.href = downloadUrl;
    // link.click();
}
