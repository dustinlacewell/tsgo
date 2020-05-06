
export function Extend(dest: any, src: any) {
    for (var key in src) {
        if (src.hasOwnProperty(key)) {
            if (typeof src[key] === 'object') {
                if (!dest[key] || (typeof dest[key] !== 'object')) {
                    dest[key] = {};
                }
                Extend(dest[key], src[key]);

            } else {
                dest[key] = src[key];
            }
        }
    }

    return dest;
}

interface ImageMap {
    [key: string]: HTMLImageElement;
}

export function LoadImages(sources: any, callback: any) {
    let images: ImageMap = {};
    let imagesLeft = 0;

    for (var src in sources) // count non-false properties as images
        if (sources.hasOwnProperty(src) && sources[src])
            imagesLeft++;

    var countdown = () => { if (--imagesLeft <= 0) callback(images); };

    for (src in sources) { // load non-false properties to images object
        if (sources.hasOwnProperty(src) && sources[src]) {
            /* global Image */
            images[src] = new Image();
            images[src].onload = countdown;
            images[src].src = sources[src];
        }
    }
}
