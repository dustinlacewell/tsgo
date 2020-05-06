// import { TSGo } from '../src/ts/main';
const tsgo = window['tsgo'];

function resolveSGF(gobans: any, callback: (any) => void) {
    let queued = Object.keys(gobans).length;
    let finished = 0;
    let newGobans = []
    for (let goban of gobans) {
        const filename = goban.sgf;
        const client = new XMLHttpRequest();
        console.log(`Fetching: ${filename} for ${goban.name}`);
        client.open('GET', filename);
        client.onreadystatechange = () => {
            if (client.readyState == XMLHttpRequest.DONE) {
                if (client.status == 200) {
                    console.log(`Aquired ${goban.name} SGF.`);
                    finished += 1;
                    goban.sgf = client.responseText;
                    newGobans.push(goban);
                } else {
                    console.log(`Failed to aquire ${goban.key} SGF.`);
                    console.log(client.responseText);
                    finished += 1;
                }
                if (finished == queued) {
                    callback(newGobans);
                }
            }
        }
        client.send();
    }
}

function resolveGobans(callback: (any) => void) {
    const elements = document.getElementsByTagName("goban");
    const gobans = [];

    for (let i = 0; i < elements.length; i++) {
        const element = elements[i];
        const id = element.id;
        const filename = element.getAttribute("data-sgf");
        const canvas = element.getElementsByTagName("canvas")[0];
        const comments = element.getElementsByClassName("go-comments")[0];
        const first = element.getElementsByClassName("go-first")[0];
        const last = element.getElementsByClassName("go-last")[0];
        const prev = element.getElementsByClassName("go-prev")[0];
        const next = element.getElementsByClassName("go-next")[0];
        gobans.push({
            name: id,
            sgf: filename,
            canvas: canvas,
            comments: comments,
            first: first,
            last: last,
            prev: prev,
            next: next,
        });
    }

    resolveSGF(gobans, callback);
}

resolveGobans((gobans: any) => {
    for (let goban of gobans) {
        console.log(`Building ${goban.name}`);
        window[goban.name] = new tsgo.TSGo(
            {
                sgf: goban.sgf,
            },
            {
                canvas: goban.canvas,
                size: 400,
                background: '#000',
                invert: true
            },
            {
                comments: goban.comments,
                first: goban.first,
                last: goban.last,
                next: goban.next,
                prev: goban.prev
            }
        );
    }
});
