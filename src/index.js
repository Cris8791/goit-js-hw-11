import SimpleLightbox from 'simplelightbox/dist/simple-lightbox.esm';
// import 'simplelightbox/dist/simple-lightbox.min.css';

import * as Notiflix from 'notiflix';

document.addEventListener('DOMContentLoaded', function () {
  const searchForm = document.getElementById('search-form');
  const gallery = document.querySelector('.gallery');
  const loadMoreButton = document.querySelector('.load-more');
  let currentPage = 1;
  let totalHits = 0;

  searchForm.addEventListener('submit', function (event) {
    event.preventDefault();
    const searchQuery = event.target.elements.searchQuery.value.trim();

    if (searchQuery === '') {
      return; // Evităm căutarea goală
    }

    // Resetăm pagina la 1 la fiecare căutare nouă
    currentPage = 1;
    fetchData(searchQuery);
  });

  loadMoreButton.addEventListener('click', function () {
    currentPage++;
    const searchQuery = searchForm.elements.searchQuery.value.trim();
    fetchData(searchQuery);
  });

  async function fetchData(searchQuery) {
    try {
      const apiKey = '40947481-13c540b45e3fd4f57e1ee7dde';
      const perPage = 40; // Modificat pentru a afișa 40 de imagini pe pagină

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

      console.log('Images Array:', imagesArray);

      if (currentPage === 1) {
        // Dacă suntem pe prima pagină, golim galeria
        gallery.innerHTML = '';
        // Ascundem butonul "Load more"
        loadMoreButton.style.display = 'none';
      }

      if (imagesArray.length > 0) {
        // Adăugăm cardurile de imagini în galerie
        imagesArray.forEach(image => {
          const card = createImageCard(image);
          gallery.appendChild(card);
        });

        // Inițializează SimpleLightbox
        // const lightbox = new SimpleLightbox('.gallery a');

        // Afișăm butonul "Load more" dacă mai există imagini
        if (
          imagesArray.length === perPage &&
          totalHits > perPage * currentPage
        ) {
          loadMoreButton.style.display = 'block';
        } else {
          loadMoreButton.style.display = 'none';
          // Afișăm notificarea cu numărul total de imagini
          Notiflix.Notify.success(`Hooray! We found ${totalHits} images.`);
        }
      } else {
        console.log('Matricea de imagini este goală.');
        // Afișăm o notificare dacă nu sunt găsite imagini
        Notiflix.Notify.failure(
          'Sorry, there are no images matching your search query. Please try again.'
        );
      }
    } catch (error) {
      console.error('Error fetching data:', error);
      // Afișăm o notificare pentru erori
      Notiflix.Notify.failure('Error fetching data. Please try again.');
    }
  }

  function createImageCard(image) {
    const card = document.createElement('div');
    card.className = 'photo-card';

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

    card.appendChild(img);
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
