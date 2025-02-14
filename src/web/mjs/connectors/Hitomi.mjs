import Connector from '../engine/Connector.mjs';
import Manga from '../engine/Manga.mjs';

export default class Hitomi extends Connector {

    constructor() {
        super();
        super.id = 'hitomi';
        super.label = 'Hitomi';
        this.tags = [ 'hentai', 'english' ];
        this.url = 'https://hitomi.la';
        this.requestOptions.headers.set('x-referer', this.url);
    }

    async _getMangaFromURI(uri) {
        const request = new Request(uri, this.requestOptions);
        const script = `
            new Promise((resolve, reject) => {
                setTimeout(() => {
                    try {
                        resolve(galleryinfo.title);
                    } catch(error) {
                        reject(error);
                    }
                }, 1000);
            });
        `;
        const title = await Engine.Request.fetchUI(request, script);
        const id = uri.pathname.match(/(\d+)\.html$/)[1];
        return new Manga(this, id, title.trim());
    }

    async _getMangas() {
        let msg = 'This website does not provide a manga list, please copy and paste the URL containing the images directly from your browser into HakuNeko.';
        throw new Error(msg);
    }

    async _getChapters(manga) {
        return [ {
            id: manga.id,
            title: manga.title,
            language: ''
        } ];
    }

    async _getPages(chapter) {
        let script = `
            new Promise((resolve, reject) => {
                setTimeout(() => {
                    try {
                        let images = galleryinfo.files.map(image => url_from_url_from_hash(galleryinfo.id, image, 'webp', undefined, 'a'));
                        resolve(images);
                    } catch(error) {
                        reject(error);
                    }
                }, 1000);
            });
        `;
        let request = new Request(`${this.url}/reader/${chapter.id}.html`, this.requestOptions);
        let data = await Engine.Request.fetchUI(request, script);
        return data.map(img => this.createConnectorURI(this.getAbsolutePath(img, request.url)));
    }
}