import filter from 'lodash.filter';
import debounce from 'lodash.debounce';
import './scss/main.scss';
import data from './mockData';

(function() {
  const searchBar = document.forms['search-bar'];
  const searchButton = document.querySelector('button');
  const searchInput = document.getElementById('search-input');
  const key = process.env.API_KEY;

  searchBar.addEventListener('submit', function(event) {
    event.preventDefault();
    const query = searchBar.querySelector('input[type="search"]').value;
  });

  searchButton.addEventListener('click', function(event) {
    event.preventDefault();
    event.stopPropagation();
  });
})();
