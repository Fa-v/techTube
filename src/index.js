import filter from 'lodash.filter';
import debounce from 'lodash.debounce';
import './scss/main.scss';

(function() {
  /** @namespace */
  const app = {};
  const searchBar = document.forms['search-bar'];
  const searchButton = document.querySelector('button');
  const searchInput = document.getElementById('search-input');
  const videoSection = document.querySelector('.videosSection');
  const key = process.env.API_KEY;
  let query;
  let state = {
    activeVideo: null,
    query: 'javascript'
  };

  /**
   * Adds a submit event to the input and retrieve the submitted value by the user
   * @returns {void}
   */
  app.submitInput = function() {
    searchBar.addEventListener('submit', function(event) {
      event.preventDefault();
      query = searchInput.value;
      if (!query) {
        app.noQuery();
        return;
      }
      app.inputValidations(query);
    });
  };

  /**
   * Adds a click event to the search button to retrieve the submitted value by the user
   * @returns {void}
   */
  app.submitButton = function() {
    searchButton.addEventListener('click', function(event) {
      event.preventDefault();
      event.stopPropagation();
      query = searchInput.value;
      if (event.isTrusted) {
        if (!query) {
          app.noQuery();
        } else {
          app.inputValidations(query);
        }
      } else {
        console.log('sorry I do not trust you');
      }
    });
  };

  /**
   * Show a snack bar if the user tries to submit an empty query
   * @returns {void}
   */
  app.noQuery = function() {
    let showSnack;
    clearTimeout(showSnack);
    let snack = document.getElementById('snack');
    snack.innerText = 'Por favor, introduce un término';

    showSnack = setTimeout(function() {
      snack.innerText = '';
    }, 3000);
  };

  /**
   * Validates if the query contains only alphanumeric characters and is not an empty string
   * @returns {void} if error returns a html template
   */
  app.inputValidations = function(query) {
    !query ? (query = state.query) : query;
    query = query.toLowerCase().trim();
    const regEx = /^[a-zA-Z0-9]+$/;
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

  /**
   * Http request gets all videos from YouTube
   * @param {string} query term introduced by the user
   * @returns {Object} http response
   */
  app.getVideos = function(query) {
    const url =
      'https://www.googleapis.com/youtube/v3/search?part=snippet&q=' +
      query +
      '&safeSearch=strict&type=video&maxResults=25&key=' +
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

  /**
   * Process errors thrown by the Http request
   * @param {Object} error
   * @returns {String} html template
   */
  app.handleError = function(response) {
    const container = document.querySelector('.container');
    return (container.innerHTML = `<div class="notFound">
      <h1>Santos errores Batman nos ha dado un 404</h1>
      <img src='https://media1.tenor.com/images/2fdce40fb465cb0b65b391781457f1b3/tenor.gif?itemid=5685360'/>
      <p>${response}</p>
    </div>`);
  };

  /**
   * Sets videos for the video's list and the main section
   * @param {Array} array The items array in the the Http response
   * @returns {Void}
   */
  app.processResponse = function(data) {
    const topVideo = data[0];
    const videosList = data;
    state.activeVideo = topVideo;

    app.createMainVideo(state.activeVideo);
    app.createVideoList(videosList);
  };

  /**
   * Creates the main section with the featured video
   * @param {Object} object The first video from the items array in the response
   * @returns {String} html template
   */
  app.createMainVideo = function(video) {
    const mainVideo = document.querySelector('.mainVideo');
    const title = video.snippet.title;
    const channelTitle = video.snippet.channelTitle;
    const description = video.snippet.description;
    const videoId = video.id.videoId;
    const publishedAt = video.snippet.publishedAt;
    const publicadoHace = app.getFriendlyPublishedAt(publishedAt);

    return (mainVideo.innerHTML = `<div class="videoFrame">
    <iframe class="frame" src="https://www.youtube.com/embed/${videoId}" frameborder="0" allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe></div>
    <div class="mainDescription">
    <h4>${title}</h4>
    <p>${channelTitle}</p>
    <p>${description}</p>
    <p>${publicadoHace}</p>
  </div>`);
  };

  /**
   * Formats the video published date to a more user friendly text string
   * @param {String} date the published at date
   * @return {String} text date
   */
  app.getFriendlyPublishedAt = function(date) {
    const fechaMiliSecs = new Date(date).getTime();
    const hoy = new Date().getTime();
    const dif = hoy - fechaMiliSecs;
    const milisecsMonth = 0.00000000038;
    const milisecsWeek = 604800309.6576;
    const milisecsDay = 86400044.2368;

    const miliSecsMes = dif * milisecsMonth;
    const años = Math.floor(miliSecsMes / 12);
    const meses = Math.floor(miliSecsMes % 12);
    const semanas = Math.floor(meses / milisecsWeek);
    const dias = Math.floor(dif / milisecsDay);

    const haceAños =
      años === 0 ? '' : años > 1 ? `${años} años` : `${años} año`;
    const haceMeses =
      meses === 0 ? '' : meses > 1 ? `${meses} meses` : `${meses} mes`;
    const haceSemanas =
      semanas === 0
        ? ''
        : semanas > 1
        ? `${semanas} semanas`
        : `${semanas} semana`;
    let haceDias;
    if (dias === 0 || dias > 29) {
      haceDias = '';
    } else {
      haceDias = dias > 1 ? `${dias} días` : `${dias} día`;
    }

    return `Publicado hace ${haceAños} ${haceMeses} ${haceSemanas} ${haceDias}`;
  };

  /**
   * Creates the video list section
   * @param {Array} array The array of videos from the Http response
   * @returns {String} html template
   */
  app.createVideoList = function(videos) {
    videoSection.innerHTML = '';
    for (let i = 0; i < videos.length; i++) {
      const currentVideo = videos[i];
      const title = currentVideo.snippet.title;
      const videoId = currentVideo.id.videoId;
      const channelTitle = currentVideo.snippet.channelTitle;
      const description = currentVideo.snippet.description;
      const mediumWidth = currentVideo.snippet.thumbnails.medium.width;
      const mediumHeight = currentVideo.snippet.thumbnails.medium.height;
      const urlThumb = currentVideo.snippet.thumbnails.medium.url;
      const publishedAt = currentVideo.snippet.publishedAt;
      const publicadoHace = app.getFriendlyPublishedAt(publishedAt);

      const card = document.createElement('div');
      card.setAttribute('class', 'card');
      const template = `
        <img src=${urlThumb} width=${mediumWidth} height=${mediumHeight} alt=${title}/>
        <div class="description">
        <h4>${title}</h4>
        <p>${channelTitle}</p>
          <p>${description}</p>
          <hr>
          <p>${publicadoHace}</p>
          </div>`;
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

  app.selectCard = app.submitInput();
  app.submitButton();
  app.inputValidations();
  return app;
})();
