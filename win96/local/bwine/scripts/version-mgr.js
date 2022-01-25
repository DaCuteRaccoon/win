/*
bWINE

BoxedWine (C) boxedwine.org
bWINE (C) windows96.net
*/

const { Theme, DialogCreator, MsgBoxSimple } = w96.ui;

module.exports = {
    init: async function (bwApp) {
        const mainwnd = bwApp.createWindow({
            title: "bWINE Version Manager",
            icon: Theme.getIconUrl("exec", "small"),
            initialHeight: 142,
            initialWidth: 400,
            body: `<style>${await include("../res/vermgr.css")}</style>
            ${await include("../res/vermgr.html")}`,
            bodyClass: "boxed-wine-vermgr-app",
            controlBoxStyle: "WS_CBX_CLOSE",
            center: true,
            taskbar: true,
            resizable: false
        }, true);

        // Update UI
        const WINEICON = await bwApp.mkblob("c:/local/bwine/res/icon.png");
        mainwnd.setWindowIcon(WINEICON);
        const body = mainwnd.getBodyContainer();
        body.querySelector(".top>.icon").style.backgroundImage = `url(${await bwApp.mkblob("c:/local/bwine/res/icon.png")})`;

        // Fetch versions and save download URL
        const statusUi = MsgBoxSimple.idleProgress("bWINE Version Manager", "Fetching version information...");

        const vResp = await fetch(bwApp.config.net.ver_repo + "/index.json");
        const vAvailable = await vResp.json();

        const verSelect = body.querySelector("select.ver-selector");
        
        vAvailable.forEach((vObj, vIndex)=>{
            const option = document.createElement('option');
            option.value = vObj.id;
            option.innerText = vObj.name;
            verSelect.appendChild(option);

            if(bwApp.config.wine.version == vObj.id)
                verSelect.selectedIndex = vIndex;
        });

        statusUi.closeDialog();

        // Assign UI events
        body.querySelector("button.cancel").addEventListener('click', ()=>mainwnd.close());
        body.querySelector("button.ok").addEventListener('click', async()=>{
            // Set config value
            bwApp.config.wine.version = vAvailable[verSelect.selectedIndex].id;
            await FS.writestr("c:/user/appdata/bWINE/config.json", JSON.stringify(bwApp.config, null, 4));
            mainwnd.close();
        });
        
        body.querySelector("button.verinfo").addEventListener('click', ()=>{
            const selectedVer = vAvailable[verSelect.selectedIndex];

            alert(`
            <span class="bold-noaa">Identifier:</span> ${selectedVer.id}<br>
            <span class="bold-noaa">Name:</span> ${selectedVer.name}<br>
            <span class="bold-noaa">Default Shell:</span> ${selectedVer.defaultShell}<br>
            <span class="bold-noaa">Load Size:</span> ${(selectedVer.size / 1024 / 1024).toFixed(1)} MB
            `, { title: `Version Information for ${selectedVer.name}`, icon: "info" })
        });

        mainwnd.show();
    }
}
