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

if (!fs.existsSync(dir)){
    fs.mkdirSync(dir);
}

axios.get("https://www.nationalgeographic.com/photography/photo-of-the-day/_jcr_content/.gallery.json")
    .then(res => {
        const lastPublication = res.data.items
            .sort((item1, item2) =>
                new Date(item2.publishDate) - new Date(item1.publishDate)
            )[0];

        const biggest = Object.keys(lastPublication.sizes)
            .sort((item1, item2) => parseInt(item2) - parseInt(item1))[0];

        const imageUrl = `${lastPublication.url}${lastPublication.sizes[biggest]}`;
        
        axios.get(imageUrl, {
            responseType: 'arraybuffer'
        })
            .then(response => fs.writeFile(`${dir}/${new Date(lastPublication.publishDate).toLocaleDateString()}-${slugify(lastPublication.title)}.jpeg`, response.data, 'binary', err => {
                if (err)
                    throw err;
                console.log('File saved.')
            }))
            .catch(res => console.log(res))
    })
    .catch(res => {
        console.log(res);
    });

console.log('====');