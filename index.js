const axios = require('axios');
const fs = require('fs');

const slugify = (text) =>
    text.toString().toLowerCase()
        .replace(/\s+/g, '-')      // Replace spaces with -
        .replace(/[^\w\-]+/g, '')  // Remove all non-word chars
        .replace(/\-\-+/g, '-')    // Replace multiple - with single -
        .replace(/^-+/, '')        // Trim - from start of text
        .replace(/-+$/, '');       // Trim - from end of text

const dir = `${process.env.HOME}/Pictures/nat-geo`;

if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir);
}

axios.get("https://www.nationalgeographic.com/photography/photo-of-the-day/_jcr_content/.gallery.json")
    .then(res => res.data.items
        .sort((item1, item2) => new Date(item2.publishDate) - new Date(item1.publishDate))[0]
    )
    .then(latest => ({
        latest,
        biggest: Object.keys(latest.sizes)
            .sort((item1, item2) => parseInt(item2) - parseInt(item1))[0]
    }))
    .then(({ latest, biggest }) => ({
        imageUrl: `${latest.url}${latest.sizes[biggest]}`,
        filename: `${dir}/${new Date(latest.publishDate).toLocaleDateString()}-${slugify(latest.title)}.jpeg`,
    }))
    .then(({ imageUrl, filename }) => axios
        .get(imageUrl, { responseType: 'arraybuffer' })
        .then(res => fs.writeFile(filename, res.data, 'binary', e => { }))
        .catch(reason => console.log(reason))
    )
    .catch(res => {
        console.log(res);
    });
