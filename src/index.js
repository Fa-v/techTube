import filter from 'lodash.filter';
import debounce from 'lodash.debounce';
import './scss/main.scss';
import videoData from './mockData';

(function() {
  const app = {};
  const searchBar = document.forms['search-bar'];
  const searchButton = document.querySelector('button');
  const searchInput = document.getElementById('search-input');
  const key = process.env.API_KEY;
  let query;

  app.submitInput = function() {
    searchBar.addEventListener('submit', function(event) {
      event.preventDefault();
      query = searchInput.value;
      app.inputValidations(query);
    });
  };

  app.submitButton = function() {
    searchButton.addEventListener('click', function(event) {
      event.preventDefault();
      event.stopPropagation();
      query = searchInput.value;
      app.inputValidations(query);
    });
  };

  app.inputValidations = function(query) {
    const regEx = new RegExp('^[a-zA-Z0-9/\\s]+$');
    query.trim();
    const validQuery = regEx.test(query);
    if (validQuery) {
      //http request;
      console.log('query', query);
    } else {
      console.log('not valid query', query);
    }
  };

  app.processResponse = function(videoData) {
    const videoSection = document.getElementById('videos-section');

    videoSection.innerHTML = videoData.items
      .map(item => {
        const title = item.snippet.title;
        const videoId = item.id.videoId;
        const channelTitle = item.snippet.channelTitle;
        const description = item.snippet.description;
        const broadcast = item.snippet.liveBroadcastContent;
        const smallWidth = item.snippet.thumbnails.default.width;
        const smallHeight = item.snippet.thumbnails.default.height;
        let publishedAt = item.snippet.publishedAt;
        publishedAt = new Date(publishedAt).toLocaleString();

        let template = `<div>
    <iframe width=${smallWidth} height=${smallHeight} src="https://www.youtube.com/embed/${videoId}" frameborder="0" allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>
    <p>${title}</p>
    <p>${description}</p>
    <p>${publishedAt}</p>
    <p>${channelTitle}</p>
    <p>${broadcast}</p>
    </div>`;
        return template;
      })
      .join('');
  };
  app.processResponse(videoData);
  app.submitInput();
  app.submitButton();
  app.inputValidations();
  return app;
})();
