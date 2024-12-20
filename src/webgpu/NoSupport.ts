import { getParser } from "bowser";

export const DisplayNoSupport = () => {
    const nowebgpusupport = document.getElementById(
        "nowebgpusupport"
    ) as HTMLElement;
    nowebgpusupport.style.display = "flex";

    const browserElement = document.getElementById("browser") as HTMLElement;
    const browserVersionElement = document.getElementById(
        "browserversion"
    ) as HTMLElement;
    const platformElement = document.getElementById("platform") as HTMLElement;
    const osElement = document.getElementById("os") as HTMLElement;
    const parser: Bowser.Parser.Parser = getParser(window.navigator.userAgent);

    browserElement.textContent = parser.getBrowserName();
    browserVersionElement.textContent = parser.getBrowserVersion();
    platformElement.textContent = parser.getPlatform().type;

    let os = parser.getOS().name;
    if (parser.getOS().versionName) {
        os += " " + parser.getOS().versionName;
    }
    if (parser.getOS().version) {
        os += " " + parser.getOS().version;
    }
    osElement.textContent = os;
};
export const HideNoSupport = () => {
    const nowebgpusupport = document.getElementById(
        "nowebgpusupport"
    ) as HTMLElement;
    nowebgpusupport.style.display = "none";
};
