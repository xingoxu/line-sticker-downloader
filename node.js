//输入line表情地址
//line sticker url here
var url = "https://store.line.me/stickershop/product/5272/ja"; 
//输入文件夹名字，为空则下载到当前文件夹下的images文件夹，最好不要使用中文
//FolderName,If it is null or "" then it will use "images"
var folderName = ""; 

(function() {
  var httpClient = require('request'),
    domEnv = require('jsdom').env,
    jQueryModule = require('jquery'),
    fs = require('fs');

  function getLinePage(resolve, reject) {
    console.log('Getting WebPage...');
    httpClient.get(url, function(err, response, body) {
      if (err) {
        reject(err);
        return;
      }
      domEnv(body, function(errors, window) {
        if (errors) {
          reject(errors);
          return;
        }
        var $ = jQueryModule(window);
        console.log('Getting StickerID...');
        var firstAndLastNode = Array.prototype.slice.call($('ul.FnSticker_animation_list_img li:first-child span,ul.FnSticker_animation_list_img li:last-child span'));
        var imageURL = ""; //url前缀
        firstAndLastNode.forEach(function(value, index, array) {
          var backgroundImage = value.style.backgroundImage,
            lastIndex = backgroundImage.lastIndexOf('/');
          imageURL = backgroundImage.substring(backgroundImage.indexOf('http'), lastIndex + 1);
          firstAndLastNode[index] = backgroundImage.substring(lastIndex + 1, backgroundImage.lastIndexOf('.'));
        })

        resolve({
          first: Number.parseInt(firstAndLastNode[0]),
          last: Number.parseInt(firstAndLastNode[1]),
          url: imageURL
        });
      })
    })
  }

  (new Promise(getLinePage))
  .then(function(ids) {
      'use strict';
      if (ids.first > ids.last) {
        let temp = first;
        first = last;
        last = temp;
      }

      if (!folderName||folderName == '')
        folderName = 'images';

      console.log('Downloading...');

      fs.mkdirSync(folderName);

      for (var i = ids.first; i <= ids.last; i++) {
        httpClient(ids.url + i + '.png').pipe(fs.createWriteStream(folderName + '/' + i + '.png'))
      }
    })
    .catch(function(err) {
      console.log(err);
    })

})();