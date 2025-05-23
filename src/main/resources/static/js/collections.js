document.addEventListener('DOMContentLoaded', function() {
    // Filtrage des collections
    const filterButtons = document.querySelectorAll('.filter-btn');
    const collectionSections = document.querySelectorAll('.collection-section');

    filterButtons.forEach(button => {
        button.addEventListener('click', () => {
            // Mettre à jour les boutons actifs
            filterButtons.forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');

            const filterValue = button.dataset.filter;

            // Filtrer les collections
            collectionSections.forEach(section => {
                if (filterValue === 'all' || section.dataset.collection === filterValue) {
                    section.style.display = 'block';
                } else {
                    section.style.display = 'none';
                }
            });
        });
    });

    // Recherche de cartes
    const searchInput = document.getElementById('searchInput');
    const cards = document.querySelectorAll('.card');

    searchInput.addEventListener('input', () => {
        const searchTerm = searchInput.value.toLowerCase().replace(/[^a-z0-9]/g, '');

        cards.forEach(card => {
            const cardName = (card.dataset.name || '').toLowerCase().replace(/[^a-z0-9]/g, '');
            const cardNumber = (card.dataset.number || '').toLowerCase().replace(/[^a-z0-9]/g, '');
            const visibleText = (card.textContent || '').toLowerCase().replace(/[^a-z0-9]/g, '');

            if (cardName.includes(searchTerm) || cardNumber.includes(searchTerm) || visibleText.includes(searchTerm)) {
                card.style.display = 'block';
            } else {
                card.style.display = 'none';
            }
        });
    });

    const modal = document.querySelector('.modal-overlay');
    const zoomButtons = document.querySelectorAll('.zoom-btn');
    const closeModal = document.querySelector('.close-modal');
    const zoomedCard = document.querySelector('.zoomed-card');
    const zoomedCardTitle = document.querySelector('.zoomed-card-title');

    const modalNumber = document.getElementById('modalNumber');
    const modalCollection = document.getElementById('modalCollection');
    const modalRarity = document.getElementById('modalRarity');
    const modalType = document.getElementById('modalType');
    const modalHP = document.getElementById('modalHP');
    const modalStage = document.getElementById('modalStage');
    const modalAttacks = document.getElementById('modalAttacks');
    const modalObtainedFrom = document.getElementById('modalObtainedFrom');

    const cacheCollections = {};

    // Fonction pour détecter la collection depuis le nom de la carte
    function getCollectionFromCardName(cardName) {
        const collections = ['a1a', 'a2a', 'a2b', 'a1', 'a2', 'a3'];
        for (const col of collections) {
            if (cardName.startsWith(col)) {
                return col;
            }
        }
        return null;
    }

    // Fonction pour afficher les données d'une carte dans la modale
    function displayCardData(collectionData, cardName) {
        // Recherche de la carte dans la collection (adapter selon ta structure JSON)
        const normalizedTarget = normalizeCardIdentifier(cardName);

        const cardData = collectionData.find(c => {
            const normalizedJsonNumber = normalizeCardIdentifier(c.metadata.number || '');
            return normalizedJsonNumber === normalizedTarget;
        });


        if (!cardData) {
            modalAttacks.innerHTML = '<li>Carte non trouvée dans la collection.</li>';
            modalNumber.textContent = 'N/A';
            modalCollection.textContent = 'N/A';
            modalRarity.textContent = 'N/A';
            modalType.textContent = 'N/A';
            modalHP.textContent = 'N/A';
            modalStage.textContent = 'N/A';
            modalObtainedFrom.textContent = 'N/A';
            return;
        }

        modalNumber.textContent = cardData.metadata.number || 'N/A';
        modalCollection.textContent = cardData.metadata.collection_name || 'N/A';
        modalRarity.textContent = cardData.metadata.rarity || 'N/A';
        modalType.textContent = cardData.stats.type || 'N/A';
        modalHP.textContent = cardData.stats.hp || 'N/A';
        modalStage.textContent = cardData.stats.stage || 'N/A';
        modalObtainedFrom.textContent = cardData.obtained_from || 'N/A';

        modalAttacks.innerHTML = '';
        if (Array.isArray(cardData.attacks) && cardData.attacks.length > 0) {
            cardData.attacks.forEach(att => {
                const li = document.createElement('li');
                const costStr = att.cost ? att.cost.join(', ') : '';
                li.innerHTML = `<strong>${att.name}</strong> (<em>${costStr}</em>): ${att.damage || '0'}`;
                modalAttacks.appendChild(li);
            });
        } else {
            modalAttacks.innerHTML = '<li>Aucune attaque</li>';
        }
    }

    zoomButtons.forEach(button => {
        button.addEventListener('click', (e) => {
            const card = e.target.closest('.card');
            const cardImage = card.querySelector('.card-image');
            const cardNumber = card.querySelector('.card-number');
            const cardName = card.dataset.name; // ex: 'a1a001' ou 'a2b123'

            zoomedCard.src = cardImage.src;
            zoomedCard.alt = cardImage.alt;
            zoomedCardTitle.textContent = cardNumber.textContent;

            // Réinitialisation modale
            modalNumber.textContent = '';
            modalCollection.textContent = '';
            modalRarity.textContent = '';
            modalType.textContent = '';
            modalHP.textContent = '';
            modalStage.textContent = '';
            modalObtainedFrom.textContent = '';
            modalAttacks.innerHTML = '<li>Chargement...</li>';

            modal.classList.add('active');
            document.body.style.overflow = 'hidden';

            const collection = getCollectionFromCardName(cardName);
            if (!collection) {
                modalAttacks.innerHTML = '<li>Collection inconnue</li>';
                return;
            }

            // Si collection déjà chargée, on affiche directement
            if (cacheCollections[collection]) {
                displayCardData(cacheCollections[collection], cardName);
            } else {
                // Sinon fetch le JSON collection
                fetch(`../pokemon_tcg_collections/${collection}.json`)
                    .then(response => {
                        if (!response.ok) throw new Error('Fichier JSON introuvable');
                        return response.json();
                    })
                    .then(data => {
                        cacheCollections[collection] = data;
                        displayCardData(data, cardName);
                    })
                    .catch(err => {
                        modalAttacks.innerHTML = '<li>Impossible de charger les données.</li>';
                        console.error('Erreur chargement JSON collection :', err);
                    });
            }
        });
    });

    closeModal.addEventListener('click', () => {
        modal.classList.remove('active');
        document.body.style.overflow = '';
    });

    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            modal.classList.remove('active');
            document.body.style.overflow = '';
        }
    });

    setTimeout(() => {
        document.body.classList.add('loaded');
    }, 100);
});

function normalizeCardIdentifier(str) {
    return str.toLowerCase().replace(/[^a-z0-9]/g, '');
}
