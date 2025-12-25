/**
 * ImageResource - Promise-based image loading utility
 */

export class ImageResource {
    private url: string;
    private img: HTMLImageElement;

    constructor(url: string) {
        this.url = url;
        this.img = new Image();
    }

    load(): Promise<HTMLImageElement> {
        return new Promise((resolve, reject) => {
            this.img.onload = () => {
                if (this.img.naturalHeight === 0) {
                    console.error(`Image loaded but appears to be broken or empty: ${this.url}`);
                    reject(new Error(`Image loaded but appears to be broken or empty: ${this.url}`));
                } else {
                    resolve(this.img);
                }
            };

            this.img.onerror = (err) => {
                console.error(`Failed to load image: ${this.url}`, err);
                reject(new Error(`Failed to load image: ${this.url}`));
            };

            this.img.src = this.url;

            // Handle cached images
            if (this.img.complete && this.img.naturalHeight !== 0) {
                console.warn(`Image was already complete, resolving immediately: ${this.url}`);
                resolve(this.img);
            } else if (this.img.complete && this.img.naturalHeight === 0 && this.url.startsWith('data:')) {
                console.error(`Data URI image appears to be broken or empty: ${this.url.substring(0, 100)}...`);
                reject(new Error(`Data URI image appears to be broken or empty`));
            }
        });
    }

    getImageElement(): HTMLImageElement {
        return this.img;
    }
}
