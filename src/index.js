import filter from 'lodash.filter';
import debounce from 'lodash.debounce';
import './scss/main.scss';

(function() {
  const app = {};
  const searchBar = document.forms['search-bar'];
  const searchButton = document.querySelector('button');
  const searchInput = document.getElementById('search-input');
  const key = process.env.API_KEY;
  let query;
  let state = {
    activeVideo: null,
    query: 'javascript'
  };

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
      if (event.isTrusted) {
        app.inputValidations(query);
      } else {
        console.log('sorry I do not trust you');
      }
    });
  };

  app.inputValidations = function(query) {
    !query ? (query = state.query) : query;
    query = query.toLowerCase().trim();
    const regEx = /^[a-zA-Z]+$/;
    const validQuery = regEx.test(query);

    if (validQuery && query) {
      app.getVideos(query);
    } else {
      return searchBar.insertAdjacentHTML(
        'beforeend',
        `<p>Introduce sólo caracteres de la a a la z</p>`
      );
    }
  };

  app.getVideos = function(query) {
    const url =
      'https://www.googleapis.com/youtube/v3/search?part=snippet&q=' +
      query +
      '&type=video&maxResults=25&key=' +
      key;

    const xmlHttp = new XMLHttpRequest();

    xmlHttp.onreadystatechange = function() {
      if (xmlHttp.readyState === 4 && xmlHttp.status === 200) {
        const response = JSON.parse(xmlHttp.responseText);
        const videosData = response.items;
        const nextPageToken = response.nextPageToken;

        app.processResponse(videosData);
      } else if (xmlHttp.readyState === 4 && xmlHttp.status === 404) {
        const response = xmlHttp.responseText;
        app.handleError(response);
      }
    };

    xmlHttp.open('GET', url, true);
    xmlHttp.send();
  };

  app.handleError = function(response) {
    const container = document.querySelector('.container');
    return (container.innerHTML = `<div><h1>Santos errores Batman nos ha dado un 404</h1><img src='https://media1.tenor.com/images/2fdce40fb465cb0b65b391781457f1b3/tenor.gif?itemid=5685360'/></div>`);
  };

  app.processResponse = function(data) {
    const topVideo = data[0];
    const videosList = data;
    state.activeVideo = topVideo;

    app.createMainVideo(state.activeVideo);
    app.createVideoList(videosList);
  };

  app.createMainVideo = function(video) {
    const mainVideo = document.querySelector('.mainVideo');
    const title = video.snippet.title;
    const channelTitle = video.snippet.channelTitle;
    const description = video.snippet.description;
    const broadcast = video.snippet.liveBroadcastContent;
    const width = video.snippet.thumbnails.high.width;
    const height = video.snippet.thumbnails.high.height;
    const videoId = video.id.videoId;
    let publishedAt = video.snippet.publishedAt;
    publishedAt = new Date(publishedAt).toLocaleString();

    return (mainVideo.innerHTML = `<div>
    <iframe width=${width} height=${height} src="https://www.youtube.com/embed/${videoId}" frameborder="0" allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe></div><div>
    <h4>${title}</h4>
    <p>${channelTitle}</p>
    <p>${description}</p>
    <p>${publishedAt}</p>
  </div>`);
  };

  app.createVideoList = function(videos) {
    const videoSection = document.querySelector('.videosSection');

    for (let i = 0; i < videos.length; i++) {
      const currentVideo = videos[i];
      const title = currentVideo.snippet.title;
      const channelTitle = currentVideo.snippet.channelTitle;
      const description = currentVideo.snippet.description;
      const broadcast = currentVideo.snippet.liveBroadcastContent;
      const mediumWidth = currentVideo.snippet.thumbnails.medium.width;
      const mediumHeight = currentVideo.snippet.thumbnails.medium.height;
      const urlThumb = currentVideo.snippet.thumbnails.medium.url;
      let publishedAt = currentVideo.snippet.publishedAt;
      publishedAt = new Date(publishedAt).toLocaleString();
      let card = document.createElement('div');

      let template = `
      <img src=${urlThumb} width=${mediumWidth} height=${mediumHeight} alt=${title}/>
      <p>${title}</p>
      <p>${description}</p>
      <p>${publishedAt}</p>
      <p>${channelTitle}</p>
      <p>${broadcast}</p>`;
      card.insertAdjacentHTML('afterbegin', template);

      card.addEventListener(
        'click',
        (function(currentVideo) {
          return function() {
            app.createMainVideo(currentVideo);
          };
        })(currentVideo)
      );

      videoSection.append(card);
    }
  };

  app.submitInput();
  app.submitButton();
  app.inputValidations();
  return app;
})();
