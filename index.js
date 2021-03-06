#!/usr/bin/env node
const axios = require('axios');
const fs = require('fs');
const exec = require('child_process').exec;
const moment = require('moment');

const slugify = text =>
  text
    .toString()
    .toLowerCase()
    .replace(/\s+/g, '-') // Replace spaces with -
    .replace(/[^\w\-]+/g, '') // Remove all non-word chars
    .replace(/\-\-+/g, '-') // Replace multiple - with single -
    .replace(/^-+/, '') // Trim - from start of text
    .replace(/-+$/, ''); // Trim - from end of text

const dir = `${process.env.HOME}/Pictures/nat-geo`;

if (!fs.existsSync(dir)) {
  fs.mkdirSync(dir);
}

axios
  .get(
    'https://www.nationalgeographic.com/photography/photo-of-the-day/_jcr_content/.gallery.json'
  )
  .then(
    res =>
      res.data.items.sort(
        (item1, item2) =>
          new Date(item2.publishDate) - new Date(item1.publishDate)
      )[0]
  )
  .then(latest => {
    if (!latest.sizes) {
      return { latest: { ...latest, sizes: { a: latest.url } }, biggest: 'a' };
    }

    return {
      latest,
      biggest: Object.keys(latest.sizes).sort(
        (item1, item2) => parseInt(item2) - parseInt(item1)
      )[0],
    };
  })
  .then(({ latest, biggest }) => ({
    imageUrl: latest.sizes[biggest],
    filename: `${dir}/${moment(new Date(latest.publishDate)).format(
      'YYYY-MM-DD'
    )}-${slugify(latest.title)}.jpeg`,
  }))
  .then(({ imageUrl, filename }) =>
    axios
      .get(imageUrl, { responseType: 'arraybuffer' })
      .then(res => fs.writeFile(filename, res.data, 'binary', e => {}))
      .then(_ => filename)
      .catch(reason => console.error(reason))
  )
  .then(filename => {
    console.log(filename);
    exec(
      `gsettings set org.gnome.desktop.background picture-uri file://${filename}`
    );
    exec(
      `gsettings set org.gnome.desktop.screensaver picture-uri file://${filename}`
    );
  })
  .catch(res => {
    console.error(res);
  });
