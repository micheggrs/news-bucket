
var request = require('request');
var cheerio = require('cheerio');

var SavedNews = require('../models/SavedNews');

module.exports = function (app) {
  // decided to scrape article on home page load, and let use choose which to save
  // rather than creating multiple models.
  app.get('/', function (req, res) {
    request('https://www.polygon.com/', function (error, response, html) {
      var $ = cheerio.load(html);
      var hbsObject = {
        doc: []
      };

      $('div.c-compact-river__entry').each(function (i, element) {
        var doc = {};

        doc.title = $(element).find('h2').find('a').text();
        doc.link = $(element).find('h2').find('a').attr('href');
        doc.image = $(element).find('noscript').text();

        // image link retrieved from <noscript> element.
        // slice returns the raw url string.
        doc.image = doc.image.slice(10, -9);

        hbsObject.doc.push(doc);
      });
      res.render('index', hbsObject);
    });
  });

  // gets saved articles from db and injects into page with handlebars
  app.get('/saved', function (req, res) {
    SavedNews.find({}).sort({ _id: -1 }).exec(function (error, doc) {
      if (error) {
        console.log(error);
      } else {
        var hbsObject = {
          doc: doc
        };
        res.render('saved', hbsObject);
      }
    });
  });
};
