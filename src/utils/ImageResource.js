// Removed RxJS import as we'll use Promises directly
// import { fromEvent } from 'rxjs';

export class ImageResource { // Corrected spelling
    constructor(url) {
        this.url = url;
        this.img = new Image();
    }

    load() {
        return new Promise((resolve, reject) => {
            this.img.onload = () => {
                if (this.img.naturalHeight === 0) {
                    // This can happen if the image path is correct but the image is invalid/corrupted
                    // or if the server returns a 200 for a non-image type that the browser tries to render as image.
                    console.error(`Image loaded but appears to be broken or empty: ${this.url}`);
                    reject(new Error(`Image loaded but appears to be broken or empty: ${this.url}`));
                } else {
                    resolve(this.img);
                }
            };
            this.img.onerror = (err) => {
                // This error typically fires for network errors, 404s, CORS issues etc.
                console.error(`Failed to load image: ${this.url}`, err);
                reject(new Error(`Failed to load image: ${this.url}`));
            };

            this.img.src = this.url;

            // Handle cases where the image might already be cached and loaded by the browser
            // before onload is attached, or for certain data URIs.
            if (this.img.complete && this.img.naturalHeight !== 0) {
                 // Check naturalHeight to ensure it's a valid, loaded image
                console.warn(`Image was already complete, resolving immediately: ${this.url}`);
                resolve(this.img);
            } else if (this.img.complete && this.img.naturalHeight === 0 && this.url.startsWith('data:')) {
                // For data URIs that are complete but invalid.
                console.error(`Data URI image appears to be broken or empty: ${this.url.substring(0,100)}...`);
                reject(new Error(`Data URI image appears to be broken or empty`));
            }
        });
    }

    // The image() method is essentially replaced by the promise resolving with the img element.
    // If direct access to the img tag is needed outside the load promise, it can still be this.img.
    // However, consumers should wait for the load() promise to ensure it's ready.
    getImageElement() {
        return this.img;
    }
}
