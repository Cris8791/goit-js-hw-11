import SimpleLightbox from 'simplelightbox';
import 'simplelightbox/dist/simple-lightbox.min.css';
import axios from 'axios';
import * as Notiflix from 'notiflix';

document.addEventListener('DOMContentLoaded', function () {
  const searchForm = document.getElementById('search-form');
  const gallery = document.querySelector('.gallery');
  let currentPage = 1;
  let totalHits = 0;
  let lightbox;

  searchForm.addEventListener('submit', function (event) {
    event.preventDefault();
    const searchQuery = event.target.elements.searchQuery.value.trim();
    currentPage = 1;
    fetchData(searchQuery);
  });

  async function fetchData(searchQuery) {
    try {
      const apiKey = '40947481-13c540b45e3fd4f57e1ee7dde';
      const perPage = 40;

      const response = await axios.get('https://pixabay.com/api/', {
        params: {
          key: apiKey,
          q: searchQuery,
          image_type: 'photo',
          orientation: 'horizontal',
          safesearch: true,
          page: currentPage,
          per_page: perPage,
        },
      });

      totalHits = response.data.totalHits;
      const imageData = response.data.hits;
      const imagesArray = imageData.map(image => ({
        webformatURL: image.webformatURL,
        largeImageURL: image.largeImageURL,
        tags: image.tags,
        likes: image.likes,
        views: image.views,
        comments: image.comments,
        downloads: image.downloads,
      }));

      if (currentPage === 1) {
        gallery.innerHTML = '';
      }

      if (imagesArray.length > 0) {
        imagesArray.forEach(image => {
          const card = createImageCard(image);
          gallery.appendChild(card);
        });

        if (!lightbox) {
          lightbox = new SimpleLightbox('.gallery a');
        } else {
          lightbox.refresh();
        }

        if (
          imagesArray.length === perPage &&
          totalHits > perPage * currentPage
        ) {
          currentPage++;
        } else {
          Notiflix.Notify.success(`Hooray! We found ${totalHits} images.`);
        }
      } else {
        console.log('Matricea de imagini este goală.');
        Notiflix.Notify.failure(
          'Sorry, there are no images matching your search query. Please try again.'
        );
      }
    } catch (error) {
      console.error('Error fetching data:', error);
      Notiflix.Notify.failure('Error fetching data. Please try again.');
    }
  }

  window.addEventListener('scroll', function () {
    const { scrollTop, scrollHeight, clientHeight } = document.documentElement;
    if (scrollTop + clientHeight >= scrollHeight - 200) {
      const searchQuery = searchForm.elements.searchQuery.value.trim();
      fetchData(searchQuery);
    }
  });

  function createImageCard(image) {
    const card = document.createElement('div');
    card.className = 'photo-card';

    const link = document.createElement('a');
    link.href = image.largeImageURL;
    link.className = 'lightbox';

    const img = document.createElement('img');
    img.src = image.webformatURL;
    img.alt = image.tags;
    img.loading = 'lazy';

    const info = document.createElement('div');
    info.className = 'info';

    const likes = createInfoItem('Likes', image.likes);
    const views = createInfoItem('Views', image.views);
    const comments = createInfoItem('Comments', image.comments);
    const downloads = createInfoItem('Downloads', image.downloads);

    info.appendChild(likes);
    info.appendChild(views);
    info.appendChild(comments);
    info.appendChild(downloads);

    link.appendChild(img);
    card.appendChild(link);
    card.appendChild(info);

    return card;
  }

  function createInfoItem(label, value) {
    const item = document.createElement('p');
    item.className = 'info-item';
    item.innerHTML = `<b>${label}:</b> ${value}`;
    return item;
  }
});
