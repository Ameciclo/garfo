// const { saveAs } = require('file-saver');

// function downloadObjectAsJson(data, fileName) {
//     fileName += '.geojson';
//     const blob = new Blob([JSON.stringify(data)], {
//         type: 'application/geo+json',
//         name: fileName
//     });
//     saveAs(blob, fileName);
// }


// Thanks https://medium.com/@mhagemann/the-ultimate-way-to-slugify-a-url-string-in-javascript-b8e4a0d849e1
function slugify(str) {
    const a = 'àáäâãåăæçèéëêǵḧìíïîḿńǹñòóöôœøṕŕßśșțùúüûǘẃẍÿź·/_,:;'
    const b = 'aaaaaaaaceeeeghiiiimnnnooooooprssstuuuuuwxyz------'
    const p = new RegExp(a.split('').join('|'), 'g')
    return str.toString().toLowerCase()
      .replace(/\s+/g, '-') // Replace spaces with -
      .replace(p, c => b.charAt(a.indexOf(c))) // Replace special characters
      .replace(/&/g, '-and-') // Replace & with ‘and’
      .replace(/[^\w-]+/g, '') // Remove all non-word characters
      .replace(/--+/g, '-') // Replace multiple - with single -
      .replace(/^-+/, '') // Trim - from start of text
      .replace(/-+$/, '') // Trim - from end of text
  }

module.exports = {
    //downloadObjectAsJson,
    slugify,
};
